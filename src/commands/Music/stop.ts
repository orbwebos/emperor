import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { silentTrackReply } from '../../lib/reply';
import { registerSwitch } from '../../lib/util';

@ApplyOptions<Command.Options>({
  description: 'Stops the current music session and disconnects the player',
})
export class UserCommand extends Command {
  public registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129237097287532615'],
        },
        production: {
          idHints: ['1129238278076366848'],
        },
      })
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const { music } = this.container;

    await music.lavalink.leaveVoiceChannel(interaction.guildId);
    music.queues.delete(interaction.guildId);

    return interaction.reply('Music session ended.');
  }

  public async messageRun(message: Message) {
    const { music } = this.container;

    await music.lavalink.leaveVoiceChannel(message.guildId);
    music.queues.delete(message.guildId);

    return silentTrackReply(message, 'Music session ended.');
  }
}
