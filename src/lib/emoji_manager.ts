import { container } from '@sapphire/framework';
import { Collection, GuildEmoji } from 'discord.js';

/**
 * A Collection (discord.js' extension of a Map) of all available emojis, with
 * additional methods to setup the store and to refresh it.
 *
 * @example
 * ```typescript
 * container.emojiManager.setup();
 * container.emojiManager.forEach((emoji) => console.log(emoji.name));
 *
 * container.emojiManager.refresh();
 * console.log(container.emojiManager.size);
 * ```
 */
export class EmojiManager extends Collection<string, GuildEmoji> {
  public setup(): void {
    container.client.emojis.cache.forEach((value, key) => this.set(key, value));
  }

  /**
   * @warning
   * Don't use this method before calling the setup method.
   */
  public async refresh(): Promise<void> {
    const guilds = await container.client.guilds.fetch();
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
