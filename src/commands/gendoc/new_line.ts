import { Message } from 'discord.js';
import { Command } from 'imperial-discord';
import { appendToGendocDocument } from '../../util/gendoc_append';

export class NewLineCommand extends Command {
  public async messageExecute(message: Message) {
    await message.react('✅');

    try {
      return appendToGendocDocument(message.author.id, '\n');
    } catch (e) {
      if (e.message.includes('no gendoc document associated with id')) {
        return message.reply("You haven't started a document.");
      }

      return message.reply("There's been an internal error.");
    }
  }
}
