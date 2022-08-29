import { Message } from 'discord.js';
import { getRepliedMessage } from './get_replied_message';

export function removeInvokation(s: string): string {
  return s.replace(s.split(/\s+/)[0], '').trimStart();
}

export function nothingProvided(message: Message): boolean {
  return !removeInvokation(message.content) && message.reference === null;
}

export async function getProvidedText(message: Message): Promise<string> {
  if (nothingProvided(message)) {
    return null;
  }

  return (
    removeInvokation(message.content) ||
    (await getRepliedMessage(message)).content
  );
}
