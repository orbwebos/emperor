import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { format, timestampToMs } from '../../lib/music/MusicManager';
import { silentTrackReply } from '../../lib/reply';
import { isNumber, registerSwitch } from '../../lib/util';
import { variants } from '../../lib/variants';

@ApplyOptions<Command.Options>({
  aliases: variants('fast forward', 'forward', 'ff', 'ffw', 'fwd', 'fw'),
  description: 'Fast-forwards the song by a specific amount',
  preconditions: ['GuildHasPlayer'],
})
export class UserCommand extends Command {
  public async registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addStringOption((option) =>
            option
              .setName('forwardby')
              .setDescription(
                "How much to fast-forward by. If it's not a timestamp, it will be read in seconds."
              )
              .setRequired(true)
          ),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1132131406932348971'],
        },
        production: {
          idHints: ['1132134892336062474'],
        },
      })
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const { player } = this.container.getMusic(interaction.guildId);

    const time = timestampToMs(interaction.options.getString('forwardby'));
    if (!isNumber(time)) {
      return interaction.reply("That doesn't seem to be a valid timestamp.");
    }

    const seekTo = Math.min(
      player.getPosition() + time,
      player.unencodedTrack.info.length
    );
    await player.seekToSafe(seekTo);

    return interaction.reply(`Fast-forwarded to **${format(seekTo)}**.`);
  }

  public async messageRun(message: Message, args: Args) {
    const { player } = this.container.getMusic(message.guildId);

    const time = timestampToMs(await args.pick('string'));
    if (!isNumber(time)) {
      return silentTrackReply(
        message,
        "That doesn't seem to be a valid timestamp."
      );
    }

    const seekTo = Math.min(
      player.getPosition() + time,
      player.unencodedTrack.info.length
    );
    await player.seekToSafe(seekTo);

    return silentTrackReply(
      message,
      `Fast-forwarded to **${format(seekTo)}**.`
    );
  }
}
