import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { registerSwitch } from '../../lib/util';
import { silentTrackReply } from '../../lib/reply';

@ApplyOptions<Command.Options>({
  description: 'Resumes the current song',
  preconditions: ['GuildHasPlayer'],
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129235065713475594'],
        },
        production: {
          idHints: ['1129238191275261963'],
        },
      })
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const { player } = this.container.getMusic(interaction.guildId);

    if (!player.paused) {
      return interaction.reply("The player isn't paused.");
    }

    await player.setPaused(false);

    return interaction.reply('Player resumed.');
  }

  public async messageRun(message: Message) {
    const { player } = this.container.getMusic(message.guildId);

    if (!player.paused) {
      return silentTrackReply(message, "The player isn't paused.");
    }

    await player.setPaused(false);

    return silentTrackReply(message, 'Player resumed.');
  }
}
