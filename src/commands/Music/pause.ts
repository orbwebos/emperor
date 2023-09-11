import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { registerSwitch } from '../../lib/util';
import { silentTrackReply } from '../../lib/reply';

@ApplyOptions<Command.Options>({
  description: 'Pauses the current song',
  preconditions: ['GuildHasPlayer'],
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129235146680316064'],
        },
        production: {
          idHints: ['1129238272535695503'],
        },
      })
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const { player } = this.container.getMusic(interaction.guildId);

    if (player.paused) {
      return interaction.reply('The player is already paused.');
    }

    await player.setPaused(true);

    return interaction.reply('Player paused.');
  }

  public async messageRun(message: Message) {
    const { player } = this.container.getMusic(message.guildId);

    if (player.paused) {
      return silentTrackReply(message, 'The player is already paused.');
    }

    await player.setPaused(true);

    return silentTrackReply(message, 'Player paused.');
  }
}
