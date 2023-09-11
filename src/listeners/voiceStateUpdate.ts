import { Events, Listener } from '@sapphire/framework';
import { VoiceState } from 'discord.js';

export class UserListener extends Listener<typeof Events.VoiceStateUpdate> {
  public async run(_oldState: VoiceState, newState: VoiceState) {
    const { music, client } = this.container;
    if (
      newState.id === client.id &&
      !newState.channelId &&
      music.lavalink.connections.has(newState.guild.id)
    ) {
      music.lavalink.leaveVoiceChannel(newState.guild.id);
      music.queues.delete(newState.guild.id);
    }
  }
}
