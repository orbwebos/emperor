import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { format, timestampToMs } from '../../lib/music/MusicManager';
import { silentTrackReply } from '../../lib/reply';
import { isNumber, registerSwitch } from '../../lib/util';

@ApplyOptions<Command.Options>({
  description: 'Seeks to a specific point in the current song',
  preconditions: ['GuildHasPlayer'],
})
export class UserCommand extends Command {
  public async registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName('seek')
          .setDescription(this.description)
          .addStringOption((option) =>
            option
              .setName('time')
              .setDescription(
                "What time to seek to. If it's not a timestamp, it will be read in seconds."
              )
              .setRequired(true)
          ),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129237096222163064'],
        },
        production: {
          idHints: ['1129238276872609802'],
        },
      })
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const { player } = this.container.getMusic(interaction.guildId);

    const time = timestampToMs(interaction.options.getString('time'));
    if (!isNumber(time)) {
      return interaction.reply("That doesn't seem to be a valid timestamp.");
    }

    await player.seekToSafe(time);

    return interaction.reply(`Seeked to **${format(time)}**.`);
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

    await player.seekToSafe(time);

    return silentTrackReply(message, `Seeked to **${format(time)}**.`);
  }
}
