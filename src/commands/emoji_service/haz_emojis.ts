import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { isInEmojiBlacklist } from '../../lib/emoji_blacklist';

@ApplyOptions<Command.Options>({
  description: 'Tells you if you haz emojis.',
})
export class HazEmojisCommand extends Command {
  public registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('haz-emojis')
        .setDescription(this.description)
        .addBooleanOption((option) =>
          option
            .setName('invisible')
            .setDescription(
              `If true, only you will see ${this.container.config.bot.possessiveName} response. Default: false.`
            )
        )
    );
  }

  public async chatInputRun(interaction: Command.ChatInputInteraction) {
    return interaction.reply({
      content: await this.responseText(interaction.user.id),
      ephemeral: Boolean(interaction.options.getBoolean('invisible')),
    });
  }

  public async messageRun(message: Message) {
    return message.reply(await this.responseText(message.author.id));
  }

  private async responseText(id: string): Promise<string> {
    return `According to da database, you ${
      (await isInEmojiBlacklist(id)) ? 'dont haz emojis.' : 'haz emojis.'
    }`;
  }
}
