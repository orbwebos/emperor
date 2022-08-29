import { readdirSync, appendFileSync } from 'fs';
import { Message } from 'discord.js';
import { Command } from 'imperial-discord';
import { dotPrefixed } from '../../util/dot_prefixed';
import { resolvePathFromSource } from '../../util/resolve_path';

export class GendocActionCommand extends Command {
  public registerMessageCallback(message: Message) {
    return (
      !dotPrefixed(message.content, 'begin-doc', 'begin_doc', 'begindoc') &&
      !dotPrefixed(message.content, 'cancel-doc', 'cancel_doc', 'canceldoc') &&
      !dotPrefixed(message.content, 'end-doc', 'end_doc', 'enddoc') &&
      !dotPrefixed(message.content, 'pause-doc', 'pause_doc', 'pausedoc') &&
      !dotPrefixed(message.content, 'resume-doc', 'resume_doc', 'resumedoc') &&
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
