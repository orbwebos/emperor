import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import rimraf from 'rimraf';
import {
  DMChannel,
  GuildChannel,
  Message,
  MessageAttachment,
  ReplyMessageOptions,
} from 'discord.js';
import { resolvePathFromSource } from '../util/resolve_path';
import * as log from '../util/logging';
import { ensureDirectory } from '../util/directory';

export const mermaidProcess = async (m: Message): Promise<any> => {
  const uuid = uuidv4();
  const userMarkdown = m.content.replace('.diagram ', '');
  const pathNoExtension = resolvePathFromSource(`../data/mermaid/${uuid}`);

  const where =
    m.channel instanceof DMChannel
      ? 'through DMs'
      : `in #${(m.channel as unknown as GuildChannel).name}`;
  log.info(
    m.client,
    `${m.author.tag} triggered ${where} a message command: diagram`
  );

  await m.react('✅');

  try {
    ensureDirectory(resolvePathFromSource(`../data/mermaid`));
    fs.writeFileSync(`${pathNoExtension}.md`, userMarkdown);
  } catch (e) {
    log.error(
      m.client,
      `Couldn't write to Markdown file for Mermaid case ${uuid}: ${e}`
    );
    return m.reply(
      `There was an internal error. This case's ID is \`${uuid}\`.`
    );
  }

  const mermaid = resolvePathFromSource('../node_modules/.bin/mmdc');
  exec(
    `${mermaid} -i ${pathNoExtension}.md -o ${pathNoExtension}.png --scale 5`,
    async (error, stdout, stderr) => {
      if (error || stderr) {
        if (error) {
          log.debug(
            `Exec error while processing Mermaid case ${uuid}: ${error}`
          );
        }
        if (stderr) {
          log.debug(
            `Stderr error in processing Mermaid case ${uuid}: ${stderr}`
          );
        }
        return m.reply(
          `There was an internal error. This case's ID is \`${uuid}\`.`
        );
      }

      if (stdout.includes('No mermaid charts found')) {
        rimraf(`${pathNoExtension}.md`, (e) => {
          if (e) {
            log.debug(
              `Couldn't clean up Markdown file for Mermaid case ${uuid}: ${e}`
            );
          }
        });
        return m.reply("Your input doesn't appear to contain Mermaid charts.");
      }

      if (!fs.existsSync(`${pathNoExtension}-1.png`)) {
        rimraf(`${pathNoExtension}.md`, (e) => {
          if (e) {
            log.debug(
              `Couldn't clean up Markdown file for Mermaid case ${uuid}: ${e}`
            );
          }
        });

        log.error(
          m.client,
          `No PNG file was generated for Mermaid case ${uuid}: ${stdout}`
        );
        return m.reply(
          `There was an internal error. This case's ID is \`${uuid}\`.`
        );
      }

      const stats = fs.statSync(`${pathNoExtension}-1.png`);
      if (stats.size > 8100000) {
        rimraf(`${pathNoExtension}.md`, (e) => {
          if (e) {
            log.debug(
              `Couldn't clean up Markdown file for Mermaid case ${uuid}: ${e}`
            );
          }
        });
        rimraf(`${pathNoExtension}-1.png`, (e) => {
          if (e) {
            log.debug(
              `Couldn't clean up PNG file for Mermaid case ${uuid}: ${e}`
            );
          }
        });
        return m.reply(
          'Sorry, but the resulting PNG file was too big. Currently, there are no previsions to deal with this.'
        );
      }

      const attachment = new MessageAttachment(
        `${pathNoExtension}-1.png`,
        'diagram.png'
      );
      try {
        await m.reply({ files: [attachment] } as ReplyMessageOptions);
      } catch (e) {
        log.debug(
          `Couldn't directly reply to diagram call in #${
            (m.channel as unknown as GuildChannel).name
          }: ${e}`
        );
        if (e.message.includes('Unknown message')) {
          try {
            if (m.channel instanceof GuildChannel) {
              await (m.channel as any).send({
                content: `${m.author}: your diagram is ready.`,
                files: [attachment],
              });
            } else if (m.channel instanceof DMChannel) {
              // @ts-ignore: Property 'send' does not exist on type 'User'.
              await m.author.send({
                content: `Your diagram is ready.`,
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
            `Couldn't clean up Markdown file for Mermaid case ${uuid}: ${e}`
          );
        }
      });
      rimraf(`${pathNoExtension}-1.png`, (e) => {
        if (e) {
          log.debug(
            `Couldn't clean up PNG file for Mermaid case ${uuid}: ${e}`
          );
        }
      });
    }
  );
};
