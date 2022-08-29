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
