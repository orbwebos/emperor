import { readdirSync, writeFileSync } from 'fs';
import { Message } from 'discord.js';
import { Command } from 'imperial-discord';
import { dotPrefixed } from '../../util/dot_prefixed';
import { resolvePathFromSource } from '../../util/resolve_path';
import { ensureDirectory } from '../../util/directory';

export class BeginDocCommand extends Command {
  public registerMessageCallback(message: Message) {
    return dotPrefixed(message.content, 'begin-doc', 'begin_doc', 'begindoc');
  }

  public async messageExecute(message: Message) {
    if (
      readdirSync(resolvePathFromSource('../data/gendoc')).includes(
        `${message.author.id}.md`
      )
    ) {
      return message.reply(
        'You have already started a document. Either end your current document with `ENDDOC` or cancel it with `CANCELDOC`.'
      );
    }

    const pathNoExtension = resolvePathFromSource(
      `../data/gendoc/${message.author.id}`
    );

    await message.react('✅');

    try {
      ensureDirectory(resolvePathFromSource(`../data/gendoc`));
      return writeFileSync(`${pathNoExtension}.md`, '');
    } catch (e) {
      this.logger.error(
        `Couldn't write to Markdown file for Gendoc user ${message.author.id}: ${e}`
      );
      return message.reply(
        `There was an internal error. This case's user is \`${message.author.id}\`.`
      );
    }
  }
}
