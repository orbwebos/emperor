import { SapphireClient, container } from '@sapphire/framework';
import { ConfigManager } from './ConfigManager';
import { EmojiCache } from './emoji/EmojiCache';
import { MusicManager } from './music/MusicManager';
import { EmperorPlayer } from './music/EmperorPlayer';
import { EmperorTrack } from './music/EmperorTrack';

declare module '@sapphire/pieces' {
  interface Container {
    emojiCache: EmojiCache;
    config: ConfigManager;
    music: MusicManager;
    /**
     * Returns the music manager and a guild's player and queue.
     *
     * @param guildId The guild ID to get the player for.
     * @returns The music manager, the guild player, and the guild queue.
     */
    getMusic: (guildId: string) => {
      music: MusicManager;
      player: EmperorPlayer | null;
      queue: EmperorTrack[] | null;
    };
  }
}

export function injectIntoContainer(): typeof container {
  container.emojiCache = new EmojiCache();
  container.config = new ConfigManager();
  container.music = new MusicManager();
  container.getMusic = (guildId: string) => ({
    music: container.music,
    player: container.music
      .existingPlayer(guildId)
      .unwrapOr(null) as EmperorPlayer,
    queue: container.music.queueGet(guildId) ?? null,
  });

  return container;
}

export function setupMusicManager(client: SapphireClient): typeof container {
  container.music.setup({
    client,
    nodes: [
      {
        name: container.config.music.name,
        url: container.config.music.url,
        auth: container.config.music.auth,
        secure: container.config.music.secure,
      },
    ],
  });

  return container;
}
