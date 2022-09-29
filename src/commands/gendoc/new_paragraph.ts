import { Message } from 'discord.js';
import { Command, variantsMessageTrigger } from 'imperial-discord';
import { appendToGendocDocument } from '../../util/gendoc_append';

export class NewParagraphCommand extends Command {
  public registerMessageTrigger(message: Message) {
    return variantsMessageTrigger(message.content, 'new-paragraph', 'new-par');
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
