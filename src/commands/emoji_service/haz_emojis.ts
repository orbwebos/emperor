import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { isInEmojiBlacklist } from '../../lib/emoji_blacklist';
import { invisibleOption } from '../../lib/invisible_option';
import { registerSwitch } from '../../lib/util';

@ApplyOptions<Command.Options>({
  description: 'Tells you if you haz emojis.',
})
export class HazEmojisCommand extends Command {
  public registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand(
      (builder) =>
        invisibleOption(
          builder.setName('haz-emojis').setDescription(this.description)
        ),
      registerSwitch({
        development: {
          guildIds: ['906631270048624661'],
          idHints: ['1029597705451864124'],
        },
        production: { idHints: ['1029606527549591633'] },
      })
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
