import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { registerSwitch } from '../../lib/util';
import { silentTrackReply } from '../../lib/reply';

@ApplyOptions<Command.Options>({
  description: 'Tells you whether Emperor is online',
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129235318797774979'],
        },
        production: {
          idHints: ['1129238446997782568'],
        },
      })
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    return interaction.reply(
      'Emperor is online, receiving messages and replying properly.'
    );
  }

  public async messageRun(message: Message) {
    return silentTrackReply(
      message,
      'Emperor is online, receiving messages and replying properly.'
    );
  }
}
