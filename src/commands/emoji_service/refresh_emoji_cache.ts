import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<Command.Options>({
  description:
    'Refreshes the emoji cache. It automatically happens every 30 minutes.',
  preconditions: ['OwnerExclusive'],
})
export class RefreshEmojiCacheCommand extends Command {
  public registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName('refresh-emoji-cache').setDescription(this.description)
    );
  }

  public async chatInputRun(interaction: Command.ChatInputInteraction) {
    await this.container.emojiManager.refresh();

    return interaction.reply('The emoji cache has been refreshed.');
  }

  public async messageRun(message: Message) {
    await this.container.emojiManager.refresh();

    return message.reply('The emoji cache has been refreshed.');
  }
}
