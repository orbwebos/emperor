import { Collection, GuildEmoji } from 'discord.js';
// eslint-disable-next-line import/no-cycle
import { EmperorClient } from './client';

export class EmojiStore extends Collection<string, GuildEmoji> {
  client: EmperorClient;

  /**
   * @warning
   * Don't use this function in the EmperorClient class, it would provoke a dependency cycle.
   *
   * @param client The Emperor client to extract the emojis from.
   */
  setup(client: EmperorClient): void {
    this.client = client;
    this.client.emojis.cache.forEach((value, key) => this.set(key, value));
  }

  /**
   * @warning
   * Don't use this method before calling the setup method.
   */
  async refresh(): Promise<void> {
    const guilds = await this.client.guilds.fetch();
    const placeholderCache = new Collection<string, GuildEmoji>();

    // eslint-disable-next-line no-restricted-syntax
    for (const [, oauth2guild] of guilds) {
      // eslint-disable-next-line no-await-in-loop
      const guild = await oauth2guild.fetch();
      // eslint-disable-next-line no-await-in-loop
      const emojis = await guild.emojis.fetch();
      emojis.forEach((value, key) => placeholderCache.set(key, value));
    }

    this.clear();
    placeholderCache.forEach((value, key) => this.set(key, value));
  }
}
