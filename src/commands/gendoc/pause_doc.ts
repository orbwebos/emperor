import { renameSync, readdirSync } from 'fs';
import { Message } from 'discord.js';
import { Command } from 'imperial-discord';
import { dotPrefixed } from '../../util/dot_prefixed';
import { resolvePathFromSource } from '../../util/resolve_path';

export class PauseDocCommand extends Command {
  public registerMessageCallback(message: Message) {
    return dotPrefixed(message.content, 'pause-doc', 'pause_doc', 'pausedoc');
  }

  public async messageExecute(message: Message) {
    if (
      readdirSync(resolvePathFromSource('../data/gendoc')).includes(
        `${message.author.id}.mdp`
      )
    ) {
      return message.reply('Your current document is already paused.');
    }

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

    return renameSync(`${pathNoExtension}.md`, `${pathNoExtension}.mdp`);
  }
}