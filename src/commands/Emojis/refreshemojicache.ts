import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { registerSwitch } from '../../lib/util';
import { variants } from '../../lib/variants';

@ApplyOptions<Command.Options>({
  aliases: variants('refresh emoji service'),
  description:
    'Refreshes the emoji cache (it happens automatically every 30 minutes)',
  preconditions: ['OwnerExclusive'],
})
export class UserCommand extends Command {
  public registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129235060890013796'],
        },
        production: {
          idHints: ['1129238186380496947'],
        },
      })
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await this.container.emojiCache.refresh();

    return interaction.reply('The emoji cache has been refreshed.');
  }

  public async messageRun(message: Message) {
    await this.container.emojiCache.refresh();

    return message.reply('The emoji cache has been refreshed.');
  }
}
