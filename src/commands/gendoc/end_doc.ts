import { readdirSync, existsSync, statSync } from 'fs';
import {
  DMChannel,
  GuildChannel,
  Message,
  AttachmentBuilder,
  ReplyMessageOptions,
} from 'discord.js';
import { Command } from 'imperial-discord';
import rimraf from 'rimraf';
import { exec } from 'child_process';
import { resolvePathFromSource } from '../../util/resolve_path';
import { config } from '../../util/config_manager';

export class EndDocCommand extends Command {
  public async messageExecute(message: Message) {
    if (
      !readdirSync(resolvePathFromSource('../data/gendoc')).includes(
        `${message.author.id}.md`
      )
    ) {
      return message.reply("You haven't started a document.");
    }

    const pathNoExtension = resolvePathFromSource(
      `../data/gendoc/${message.author.id}`
    );
    const msgArr = message.content.split(' ');
    const docName = msgArr.length > 1 ? msgArr[1] : 'document.pdf';
    const docPath = `${resolvePathFromSource('../data/gendoc')}/${docName}`;

    await message.react('✅');

    const docLocation = config.general.gendocLocation;
    const doc = `${docLocation}/doc-env/bin/python ${docLocation}/main.py`;
    exec(
      `${doc} build ${pathNoExtension}.md -o ${docPath} --suppress-mermaid-errors`,
      // eslint-disable-next-line consistent-return
      async (error, stdout, stderr) => {
        if (error || stderr) {
          if (error) {
            this.logger.debug(
              `Exec error while processing Gendoc user ${message.author.id}: ${error}`
            );
          }
          if (stderr) {
            this.logger.debug(
              `Stderr error in processing Gendoc user ${message.author.id}: ${stderr}`
            );
          }
          return message.reply(`There was an internal error.`);
        }

        if (!existsSync(docPath)) {
          rimraf(`${pathNoExtension}.md`, (e) => {
            if (e) {
              this.logger.debug(
                `Couldn't clean up Markdown file for Gendoc user ${message.author.id}: ${e}`
              );
            }
          });

          this.logger.error(
            message.client,
            `No PDF file was generated for Gendoc user ${message.author.id}: ${stdout}. ${stderr}`
          );
          return message.reply(`There was an internal error.`);
        }

        const stats = statSync(docPath);
        if (stats.size > 8100000) {
          rimraf(`${pathNoExtension}.md`, (e) => {
            if (e) {
              this.logger.debug(
                `Couldn't clean up Markdown file for Gendoc user ${message.author.id}: ${e}`
              );
            }
          });
          rimraf(docPath, (e) => {
            if (e) {
              this.logger.debug(
                `Couldn't clean up PDF file for Gendoc user ${message.author.id}: ${e}`
              );
            }
          });
          return message.reply(
            'Sorry, but the resulting PDF file was too big. Currently, there are no previsions to deal with this.'
          );
        }

        const attachment = new AttachmentBuilder(docPath);
        try {
          await message.reply({ files: [attachment] } as ReplyMessageOptions);
        } catch (e) {
          this.logger.debug(
            `Couldn't directly reply to Gendoc call in #${
              (message.channel as unknown as GuildChannel).name
            }: ${e}`
          );
          if (e.message.includes('Unknown message')) {
            try {
              if (message.channel instanceof GuildChannel) {
                await (message.channel as any).send({
                  content: `${message.author}: your document is ready.`,
                  files: [attachment],
                });
              } else if (message.channel instanceof DMChannel) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore: Property 'send' does not exist on type 'User'.
                await message.author.send({
                  content: `Your document is ready.`,
                  files: [attachment],
                });
              }
            } catch (err) {
              this.logger.debug(
                `Couldn't send emergency diagram reply in #${
                  (message.channel as unknown as GuildChannel).name
                }`
              );
            }
          }
        }

        rimraf(`${pathNoExtension}.md`, (e) => {
          if (e) {
            this.logger.debug(
              `Couldn't clean up Markdown file for Gendoc user ${message.author.id}: ${e}`
            );
          }
        });
        rimraf(docPath, (e) => {
          if (e) {
            this.logger.debug(
              `Couldn't clean up PDF file for Gendoc user ${message.author.id}: ${e}`
            );
          }
        });
      }
    );

    return true;
  }
}
