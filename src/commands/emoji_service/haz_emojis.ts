import { ChatInputCommandInteraction, Message } from 'discord.js';
import { Command, EmbedTitle, Replier } from 'imperial-discord';
import { config } from '../../util/config_manager';
import { isInEmojiBlacklist } from '../../util/emoji_blacklist';
import { registerOptions } from '../../util/registration';

export class HazEmojisCommand extends Command {
  public constructor() {
    super({
      description: 'Tells you if you haz emojis.',
      register: registerOptions,
    });
  }

  public registerApplicationCommands() {
    this.registerChatInputCommand((builder) =>
      builder
        .setName('haz-emojis')
        .setDescription(`Tells you if you haz emojis.`)
        .addBooleanOption((option) =>
          option
            .setName('invisible')
            .setDescription(
              `If true, only you will see ${config.bot.possessiveName} response. Default: false.`
            )
        )
    );
  }

  public async chatInputExecute(interaction: ChatInputCommandInteraction) {
    return new Replier(interaction).embedReply(
      new EmbedTitle(this).response,
      await this.responseText(interaction.user.id)
    );
  }

  public async messageExecute(message: Message) {
    return new Replier(message).embedReply(
      new EmbedTitle(this).response,
      await this.responseText(message.author.id)
    );
  }

  private async responseText(id: string): Promise<string> {
    return `According to da database, you ${
      (await isInEmojiBlacklist(id)) ? 'dont haz emojis.' : 'haz emojis.'
    }`;
  }
}
