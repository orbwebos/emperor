import { Message } from 'discord.js';

export async function getRepliedMessage(message: Message): Promise<Message> {
  if (message.reference === null) {
    return null;
  }

  const channel = await message.client.channels.fetch(
    message.reference.channelId
  );
  return (channel as any).messages.fetch(message.reference.messageId);
}

export function removeInvokation(s: string): string {
  return s.replace(s.split(/\s+/)[0], '').trimStart();
}

export function nothingProvided(message: Message): boolean {
  return !removeInvokation(message.content) && message.reference === null;
}

export async function getProvidedText(message: Message): Promise<string> {
  if (nothingProvided(message)) {
    return '';
  }

  return (
    removeInvokation(message.content) ||
    (await getRepliedMessage(message)).content
  );
}
