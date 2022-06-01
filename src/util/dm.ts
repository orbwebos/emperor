import { Client } from 'discord.js';

export async function dm(
  client: Client,
  userId: string,
  message: string
): Promise<any> {
  try {
    const u = await client.users.fetch(userId);
    // @ts-ignore: Property 'send' does not exist on type 'User'.
    return await u.send({ content: message });
  } catch (e) {
    throw new Error(`couldn't DM user ${userId}: ${e}`);
  }
}
