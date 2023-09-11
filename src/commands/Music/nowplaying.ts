import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { registerSwitch } from '../../lib/util';
import {
  replyMusicEmbed,
  silentTrackReply,
  silentTrackReplyMusicEmbed,
} from '../../lib/reply';
import { variants } from '../../lib/variants';

@ApplyOptions<Command.Options>({
  description: 'Tells you what track Emperor is playing',
  aliases: variants('now playing', 'playing'),
  preconditions: ['GuildHasPlayer'],
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129235064107053168'],
        },
        production: {
          idHints: ['1129238190113431684'],
        },
      })
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const { player } = this.container.getMusic(interaction.guildId);

    const track = player.getUnencodedTrack();
    if (!track) {
      return interaction.reply('No track is currently playing.');
    }

    return replyMusicEmbed(interaction, { track });
  }

  public async messageRun(message: Message) {
    const { player } = this.container.getMusic(message.guildId);

    const track = player.getUnencodedTrack();
    if (!track) {
      return silentTrackReply(message, 'No track is currently playing.');
    }

    return silentTrackReplyMusicEmbed(message, { track });
  }
}
