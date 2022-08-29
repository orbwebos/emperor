import { readdirSync } from 'fs';
import { Message } from 'discord.js';
import { Command } from 'imperial-discord';
import rimraf from 'rimraf';
import { dotPrefixed } from '../../util/dot_prefixed';
import { resolvePathFromSource } from '../../util/resolve_path';

export class CancelDocCommand extends Command {
  public registerMessageCallback(message: Message) {
    return dotPrefixed(
      message.content,
      'cancel-doc',
      'cancel_doc',
      'canceldoc'
    );
  }

  public async messageExecute(message: Message) {
    if (
      !readdirSync(resolvePathFromSource('../data/gendoc')).includes(
        `${message.author.id}.md`
      )
    ) {
      return message.reply("You haven't started a document.");
    }

    await message.react('✅');

    const pathNoExtension = resolvePathFromSource(
      `../data/gendoc/${message.author.id}`
    );

    return rimraf(`${pathNoExtension}.md`, (e) => {
      if (e) {
        message.reply(
          'Your document generation request could not be cancelled. This error has been reported.'
        );
        return this.logger.warn(
          `Couldn't clean up Markdown file for Gendoc user ${message.author.id}: ${e}`
        );
      }

      return message.reply(
        'Your document generation request has been cancelled.'
      );
    });
  }
}
