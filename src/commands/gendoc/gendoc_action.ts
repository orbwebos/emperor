import { readdirSync, appendFileSync } from 'fs';
import { Message } from 'discord.js';
import { Command, variantsMessageTrigger } from 'imperial-discord';
import { resolvePathFromSource } from '../../util/resolve_path';

export class GendocActionCommand extends Command {
  public registerMessageTrigger(message: Message) {
    return (
      !variantsMessageTrigger(message.content, 'begin-doc') &&
      !variantsMessageTrigger(message.content, 'cancel-doc') &&
      !variantsMessageTrigger(message.content, 'end-doc') &&
      !variantsMessageTrigger(message.content, 'pause-doc') &&
      !variantsMessageTrigger(message.content, 'resume-doc') &&
      readdirSync(resolvePathFromSource('../data/gendoc')).includes(
        `${message.author.id}.md`
      )
    );
  }

  public async messageExecute(message: Message) {
    const pathNoExtension = resolvePathFromSource(
      `../data/gendoc/${message.author.id}`
    );

    return appendFileSync(`${pathNoExtension}.md`, message.content);
  }
}
