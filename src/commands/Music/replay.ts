import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import {
  editReplyMusicEmbed,
  silentTrackReply,
  silentTrackReplyMusicEmbed,
} from '../../lib/reply';
import { registerSwitch } from '../../lib/util';

@ApplyOptions<Command.Options>({
  description: 'Replays the current or last track',
  preconditions: ['GuildHasPlayer'],
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      registerSwitch({
        development: { guildIds: ['948971692804419705'] },
        production: { idHints: ['1138282314598719508'] },
      })
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const { player } = this.container.getMusic(interaction.guildId);

    await interaction.deferReply();

    if (player.unencodedTrack) {
      await player.seekToSafe(0);
      return editReplyMusicEmbed(interaction, {
        track: player.unencodedTrack,
        title: 'Replaying current track',
      });
    }

    if (player.lastTrack) {
      await player.play({ track: player.lastTrack });
      return editReplyMusicEmbed(interaction, {
        track: player.lastTrack,
        title: 'Replaying last track',
      });
    }

    return interaction.editReply('No track to replay.');
  }

  public async messageRun(message: Message) {
    const { player } = this.container.getMusic(message.guildId);

    if (player.unencodedTrack) {
      await player.seekToSafe(0);
      return silentTrackReplyMusicEmbed(message, {
        track: player.unencodedTrack,
        title: 'Replaying current track',
      });
    }

    if (player.lastTrack) {
      await player.play({ track: player.lastTrack });
      return silentTrackReplyMusicEmbed(message, {
        track: player.lastTrack,
        title: 'Replaying last track',
      });
    }

    return silentTrackReply(message, 'No track to replay.');
  }
}
