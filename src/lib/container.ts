import { container } from '@sapphire/framework';
import { ConfigManager } from './config_manager';
import { EmojiManager } from './emoji_manager';

declare module '@sapphire/pieces' {
  interface Container {
    emojiManager: EmojiManager;
    config: ConfigManager;
  }
}

export function injectIntoContainer(): typeof container {
  container.emojiManager = new EmojiManager();
  container.config = new ConfigManager();

  return container;
}
