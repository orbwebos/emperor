import { Message } from 'discord.js';
import { Command } from 'imperial-discord';
import { dotPrefixed } from '../../util/dot_prefixed';
import { appendToGendocDocument } from '../../util/gendoc_append';

export class NewParagraphCommand extends Command {
  public registerMessageCallback(message: Message) {
    return dotPrefixed(
      message.content,
      'new-paragraph',
      'new_paragraph',
      'newparagraph',
      'new-par',
      'new_par',
      'newpar'
    );
  }

  public async messageExecute(message: Message) {
    await message.react('✅');

    try {
      return appendToGendocDocument(message.author.id, '\n\n');
    } catch (e) {
      if (e.message.includes('no gendoc document associated with id')) {
        return message.reply("You haven't started a document.");
      }

      return message.reply("There's been an internal error.");
    }
  }
}
