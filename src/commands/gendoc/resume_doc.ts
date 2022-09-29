import { readdirSync, renameSync } from 'fs';
import { Message } from 'discord.js';
import { Command } from 'imperial-discord';
import { resolvePathFromSource } from '../../util/resolve_path';

export class ResumeDocCommand extends Command {
  public async messageExecute(message: Message) {
    if (
      readdirSync(resolvePathFromSource('../data/gendoc')).includes(
        `${message.author.id}.md`
      )
    ) {
      return message.reply("Your current document isn't paused.");
    }

    if (
      !readdirSync(resolvePathFromSource('../data/gendoc')).includes(
        `${message.author.id}.mdp`
      )
    ) {
      return message.reply("You don't have a paused document.");
    }

    await message.react('✅');

    const pathNoExtension = resolvePathFromSource(
      `../data/gendoc/${message.author.id}`
    );

    return renameSync(`${pathNoExtension}.mdp`, `${pathNoExtension}.md`);
  }
}
