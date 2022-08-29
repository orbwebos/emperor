import { writeFileSync, existsSync, statSync } from 'fs';
import {
  DMChannel,
  GuildChannel,
  Message,
  AttachmentBuilder,
  ReplyMessageOptions,
} from 'discord.js';
import { Command } from 'imperial-discord';
import { v4 as uuidv4 } from 'uuid';
import rimraf from 'rimraf';
import { exec } from 'child_process';
import { dotPrefixed } from '../util/dot_prefixed';
import { ensureDirectory } from '../util/directory';
import { resolvePathFromSource } from '../util/resolve_path';

export class DiagramCommand extends Command {
  public constructor() {
    super({
      description:
        'Generates [Mermaid](https://mermaid-js.github.io/) diagrams.',
    });
  }

  public registerMessageCallback(message: Message) {
    return dotPrefixed(message.content, 'diagram');
  }

  public async messageExecute(message: Message) {
    const uuid = uuidv4();
    const userMarkdown = message.content.replace('.diagram ', '');
    const pathNoExtension = resolvePathFromSource(`../data/mermaid/${uuid}`);

    const where =
      message.channel instanceof DMChannel
        ? 'through DMs'
        : `in #${(message.channel as unknown as GuildChannel).name}`;
    this.logger.info(
      message.client,
      `${message.author.tag} triggered ${where} a message command: diagram`
    );

    await message.react('✅');

    try {
      ensureDirectory(resolvePathFromSource(`../data/mermaid`));
      writeFileSync(`${pathNoExtension}.md`, userMarkdown);
    } catch (e) {
      this.logger.error(
        message.client,
        `Couldn't write to Markdown file for Mermaid case ${uuid}: ${e}`
      );
      return message.reply(
        `There was an internal error. This case's ID is \`${uuid}\`.`
      );
    }

    const mermaid = resolvePathFromSource('../node_modules/.bin/mmdc');
    return exec(
      `${mermaid} -i ${pathNoExtension}.md -o ${pathNoExtension}.png --scale 5`,
      async (error, stdout, stderr) => {
        if (error || stderr) {
          if (error) {
            this.logger.debug(
              `Exec error while processing Mermaid case ${uuid}: ${error}`
            );
          }
          if (stderr) {
            this.logger.debug(
              `Stderr error in processing Mermaid case ${uuid}: ${stderr}`
            );
          }
          return message.reply(
            `There was an internal error. This case's ID is \`${uuid}\`.`
          );
        }

        if (stdout.includes('No mermaid charts found')) {
          rimraf(`${pathNoExtension}.md`, (e) => {
            if (e) {
              this.logger.debug(
                `Couldn't clean up Markdown file for Mermaid case ${uuid}: ${e}`
              );
            }
          });
          return message.reply(
            "Your input doesn't appear to contain Mermaid charts."
          );
        }

        if (!existsSync(`${pathNoExtension}-1.png`)) {
          rimraf(`${pathNoExtension}.md`, (e) => {
            if (e) {
              this.logger.debug(
                `Couldn't clean up Markdown file for Mermaid case ${uuid}: ${e}`
              );
            }
          });

          this.logger.error(
            message.client,
            `No PNG file was generated for Mermaid case ${uuid}: ${stdout}`
          );
          return message.reply(
            `There was an internal error. This case's ID is \`${uuid}\`.`
          );
        }

        const stats = statSync(`${pathNoExtension}-1.png`);
        if (stats.size > 8100000) {
          rimraf(`${pathNoExtension}.md`, (e) => {
            if (e) {
              this.logger.debug(
                `Couldn't clean up Markdown file for Mermaid case ${uuid}: ${e}`
              );
            }
          });
          rimraf(`${pathNoExtension}-1.png`, (e) => {
            if (e) {
              this.logger.debug(
                `Couldn't clean up PNG file for Mermaid case ${uuid}: ${e}`
              );
            }
          });
          return message.reply(
            'Sorry, but the resulting PNG file was too big. Currently, there are no previsions to deal with this.'
          );
        }

        const attachment = new AttachmentBuilder(`${pathNoExtension}-1.png`, {
          name: 'diagram.png',
        });
        try {
          await message.reply({ files: [attachment] } as ReplyMessageOptions);
        } catch (e) {
          this.logger.debug(
            `Couldn't directly reply to diagram call in #${
              (message.channel as unknown as GuildChannel).name
            }: ${e}`
          );
          if (e.message.includes('Unknown message')) {
            try {
              if (message.channel instanceof GuildChannel) {
                await (message.channel as any).send({
                  content: `${message.author}: your diagram is ready.`,
                  files: [attachment],
                });
              } else if (message.channel instanceof DMChannel) {
                // @ts-ignore: Property 'send' does not exist on type 'User'.
                await message.author.send({
                  content: `Your diagram is ready.`,
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
              `Couldn't clean up Markdown file for Mermaid case ${uuid}: ${e}`
            );
          }
        });
        return rimraf(`${pathNoExtension}-1.png`, (e) => {
          if (e) {
            this.logger.debug(
              `Couldn't clean up PNG file for Mermaid case ${uuid}: ${e}`
            );
          }
        });
      }
    );
  }
}
