import * as fs from 'fs';
import { exec } from 'child_process';
import rimraf from 'rimraf';
import {
  DMChannel,
  GuildChannel,
  Message,
  MessageAttachment,
  ReplyMessageOptions,
} from 'discord.js';
import * as log from '../util/logging';
import { resolvePathFromSource } from '../util/resolve_path';
import { ConfigManager } from '../util/config_manager';
import { ensureDirectory } from '../util/directory';

type MessageOrOk = Message | Promise<Message> | true;

export async function gendocBeginProcess(m: Message): Promise<MessageOrOk> {
  if (
    fs
      .readdirSync(resolvePathFromSource('../data/gendoc'))
      .includes(`${m.author.id}.md`)
  ) {
    return m.reply(
      'You have already started a document. Either end your current document with `ENDDOC` or cancel it with `CANCELDOC`.'
    );
  }

  const pathNoExtension = resolvePathFromSource(
    `../data/gendoc/${m.author.id}`
  );

  const where =
    m.channel instanceof DMChannel
      ? 'through DMs'
      : `in #${(m.channel as unknown as GuildChannel).name}`;
  log.info(
    m.client,
    `${m.author.tag} triggered ${where} a message command: gendoc`
  );

  await m.react('✅');

  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Argument of type '{ recursive: boolean; }' is not assignable to parameter of type 'string | number'.
    ensureDirectory(resolvePathFromSource(`../data/gendoc`));
    fs.writeFileSync(`${pathNoExtension}.md`, '');
  } catch (e) {
    log.error(
      m.client,
      `Couldn't write to Markdown file for Gendoc user ${m.author.id}: ${e}`
    );
    return m.reply(
      `There was an internal error. This case's user is \`${m.author.id}\`.`
    );
  }

  return true;
}

export function gendocMiddleProcess(m: Message): MessageOrOk {
  if (
    !fs
      .readdirSync(resolvePathFromSource('../data/gendoc'))
      .includes(`${m.author.id}.md`)
  ) {
    return m.reply('You haven’t started a document.');
  }

  const pathNoExtension = resolvePathFromSource(
    `../data/gendoc/${m.author.id}`
  );
  fs.appendFileSync(`${pathNoExtension}.md`, m.content);

  return true;
}

export function gendocAppendToDoc(m: Message, s: string): MessageOrOk {
  if (
    !fs
      .readdirSync(resolvePathFromSource('../data/gendoc'))
      .includes(`${m.author.id}.md`)
  ) {
    return m.reply('You haven’t started a document.');
  }

  m.react('✅');

  const pathNoExtension = resolvePathFromSource(
    `../data/gendoc/${m.author.id}`
  );
  fs.appendFileSync(`${pathNoExtension}.md`, s);

  return true;
}

export function gendocCancelProcess(m: Message): MessageOrOk {
  if (
    !fs
      .readdirSync(resolvePathFromSource('../data/gendoc'))
      .includes(`${m.author.id}.md`)
  ) {
    return m.reply('You haven’t started a document.');
  }

  m.react('✅');

  const pathNoExtension = resolvePathFromSource(
    `../data/gendoc/${m.author.id}`
  );
  rimraf(`${pathNoExtension}.md`, (e) => {
    if (e) {
      m.reply(
        'Your document generation request could not be cancelled. This error has been reported.'
      );
      log.warn(
        m.client,
        `Couldn't clean up Markdown file for Gendoc user ${m.author.id}: ${e}`
      );
    } else {
      m.reply('Your document generation request has been cancelled.');
    }
  });

  return true;
}

export function gendocPauseProcess(m: Message): MessageOrOk {
  if (
    fs
      .readdirSync(resolvePathFromSource('../data/gendoc'))
      .includes(`${m.author.id}.mdp`)
  ) {
    return m.reply('Your current document is already paused.');
  }

  if (
    !fs
      .readdirSync(resolvePathFromSource('../data/gendoc'))
      .includes(`${m.author.id}.md`)
  ) {
    return m.reply('You haven’t started a document.');
  }

  m.react('✅');

  const pathNoExtension = resolvePathFromSource(
    `../data/gendoc/${m.author.id}`
  );
  fs.renameSync(`${pathNoExtension}.md`, `${pathNoExtension}.mdp`);

  return true;
}

export function gendocResumeProcess(m: Message): MessageOrOk {
  if (
    fs
      .readdirSync(resolvePathFromSource('../data/gendoc'))
      .includes(`${m.author.id}.md`)
  ) {
    return m.reply('Your current document isn’t paused.');
  }

  if (
    !fs
      .readdirSync(resolvePathFromSource('../data/gendoc'))
      .includes(`${m.author.id}.mdp`)
  ) {
    return m.reply('You don’t have a paused document.');
  }

  m.react('✅');

  const pathNoExtension = resolvePathFromSource(
    `../data/gendoc/${m.author.id}`
  );
  fs.renameSync(`${pathNoExtension}.mdp`, `${pathNoExtension}.md`);

  return true;
}

export async function gendocEndProcess(m: Message): Promise<MessageOrOk> {
  if (
    !fs
      .readdirSync(resolvePathFromSource('../data/gendoc'))
      .includes(`${m.author.id}.md`)
  ) {
    return m.reply('You haven’t started a document.');
  }

  const pathNoExtension = resolvePathFromSource(
    `../data/gendoc/${m.author.id}`
  );
  const msgArr = m.content.split(' ');
  const docName = msgArr.length > 1 ? msgArr[1] : 'document.pdf';
  const docPath = `${resolvePathFromSource('../data/gendoc')}/${docName}`;

  await m.react('✅');

  const docLocation = new ConfigManager().general.gendoc_location;
  const doc = `${docLocation}/doc-env/bin/python ${docLocation}/main.py`;
  exec(
    `${doc} build ${pathNoExtension}.md -o ${docPath} --suppress-mermaid-errors`,
    async (error, stdout, stderr) => {
      if (error || stderr) {
        if (error) {
          log.debug(
            `Exec error while processing Gendoc user ${m.author.id}: ${error}`
          );
        }
        if (stderr) {
          log.debug(
            `Stderr error in processing Gendoc user ${m.author.id}: ${stderr}`
          );
        }
        return m.reply(`There was an internal error.`);
      }

      if (!fs.existsSync(docPath)) {
        rimraf(`${pathNoExtension}.md`, (e) => {
          if (e) {
            log.debug(
              `Couldn't clean up Markdown file for Gendoc user ${m.author.id}: ${e}`
            );
          }
        });

        log.error(
          m.client,
          `No PDF file was generated for Gendoc user ${m.author.id}: ${stdout}. ${stderr}`
        );
        return m.reply(`There was an internal error.`);
      }

      const stats = fs.statSync(docPath);
      if (stats.size > 8100000) {
        rimraf(`${pathNoExtension}.md`, (e) => {
          if (e) {
            log.debug(
              `Couldn't clean up Markdown file for Gendoc user ${m.author.id}: ${e}`
            );
          }
        });
        rimraf(docPath, (e) => {
          if (e) {
            log.debug(
              `Couldn't clean up PDF file for Gendoc user ${m.author.id}: ${e}`
            );
          }
        });
        return m.reply(
          'Sorry, but the resulting PDF file was too big. Currently, there are no previsions to deal with this.'
        );
      }

      const attachment = new MessageAttachment(docPath);
      try {
        await m.reply({ files: [attachment] } as ReplyMessageOptions);
      } catch (e) {
        log.debug(
          `Couldn't directly reply to Gendoc call in #${
            (m.channel as unknown as GuildChannel).name
          }: ${e}`
        );
        if (e.message.includes('Unknown message')) {
          try {
            if (m.channel instanceof GuildChannel) {
              await (m.channel as any).send({
                content: `${m.author}: your document is ready.`,
                files: [attachment],
              });
            } else if (m.channel instanceof DMChannel) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore: Property 'send' does not exist on type 'User'.
              await m.author.send({
                content: `Your document is ready.`,
                files: [attachment],
              });
            }
          } catch (e) {
            log.debug(
              `Couldn't send emergency diagram reply in #${
                (m.channel as unknown as GuildChannel).name
              }`
            );
          }
        }
      }

      rimraf(`${pathNoExtension}.md`, (e) => {
        if (e) {
          log.debug(
            `Couldn't clean up Markdown file for Gendoc user ${m.author.id}: ${e}`
          );
        }
      });
      rimraf(docPath, (e) => {
        if (e) {
          log.debug(
            `Couldn't clean up PDF file for Gendoc user ${m.author.id}: ${e}`
          );
        }
      });
    }
  );

  return true;
}
