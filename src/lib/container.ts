import { container } from '@sapphire/framework';
import { ConfigManager } from './ConfigManager';
import { EmojiCache } from './emoji/EmojiCache';

declare module '@sapphire/pieces' {
  interface Container {
    emojiCache: EmojiCache;
    config: ConfigManager;
  }
}

export function injectIntoContainer(): typeof container {
  container.emojiCache = new EmojiCache();
  container.config = new ConfigManager();
  return container;
}
