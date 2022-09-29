import { Client, Message, MessagePayload, MessageOptions } from 'discord.js';

export interface MessageUserOptions {
  client: Client;
  userId: string;
  payload: string | MessagePayload | MessageOptions;
}

/**
 * Fetch a specified user based on their ID and send a message to them.
 *
 * @param options The options, which include the client, the ID, and the message.
 * @returns A message promise.
 */
export async function messageUser(
  options: MessageUserOptions
): Promise<Message> {
  const user = await options.client.users.fetch(options.userId);

  return user.send(options.payload);
}
