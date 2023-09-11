import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { registerSwitch } from '../../lib/util';
import { silentTrackReply } from '../../lib/reply';

@ApplyOptions<Command.Options>({
  description: 'Changes the volume of the player, or checks what it is',
  preconditions: ['GuildHasPlayer'],
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addIntegerOption((option) =>
            option
              .setName('volume')
              .setDescription('The volume to set the player to')
              .setMinValue(0)
              .setMaxValue(200)
          ),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129835487876616222'],
        },
        production: {
          idHints: ['1129837524764864644'],
        },
      })
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const { player } = this.container.getMusic(interaction.guildId);

    const volume = interaction.options.getInteger('volume');
    if (!volume) {
      return interaction.reply(`The current volume is **${player.volume}**.`);
    }

    if (volume === player.volume) {
      return interaction.reply(
        `The volume is already set to **${player.volume}**.`
      );
    }

    await player.setGlobalVolume(volume);

    return interaction.reply(`Volume set to **${player.volume}**.`);
  }

  public async messageRun(message: Message, args: Args) {
    const { player } = this.container.getMusic(message.guildId);

    const volumeResult = await args.pickResult('integer');
    if (volumeResult.isErr()) {
      return silentTrackReply(
        message,
        `The current volume is **${player.volume}**.`
      );
    }
    const volume = volumeResult.unwrap();
    if (volume > 200) {
      return silentTrackReply(
        message,
        "You can't set the player to a volume higher than 200."
      );
    }
    if (volume < 0) {
      return silentTrackReply(
        message,
        "You can't set the player to a volume lower than 0."
      );
    }

    await player.setGlobalVolume(volume);

    return silentTrackReply(message, `Volume set to **${player.volume}**.`);
  }
}
