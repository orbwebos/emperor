import { ChatInputCommandInteraction, Message } from 'discord.js';
import { Command, ownerExclusive } from 'imperial-discord';
import { registerOptions } from '../../util/registration';

export class RefreshEmojiCacheCommand extends Command {
  public constructor() {
    super({
      description:
        'Owner-only. Refreshes the emoji cache. It automatically happens every 30 minutes.',
      preconditions: [
        ownerExclusive.addToMessage(
          "You can ask this bot's owner to refresh the cache, or wait until it happens automatically (every 30 minutes.)"
        ),
      ],
      register: registerOptions,
    });
  }

  public registerApplicationCommands() {
    this.registerChatInputCommand((builder) =>
      builder
        .setName('refresh-emoji-cache')
        .setDescription(
          'Owner-only. Refreshes the emoji cache. It automatically happens every 30 minutes.'
        )
    );
  }

  public async chatInputExecute(interaction: ChatInputCommandInteraction) {
    await interaction.client.emojiStore.refresh();

    return interaction.reply('The emoji cache has been refreshed.');
  }

  public async messageExecute(message: Message) {
    await message.client.emojiStore.refresh();

    return message.reply('The emoji cache has been refreshed.');
  }
}
