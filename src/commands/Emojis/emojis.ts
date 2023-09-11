import { Subcommand } from '@sapphire/plugin-subcommands';
import { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import {
  addToEmojiBlacklist,
  isInEmojiBlacklist,
  removeFromEmojiBlacklist,
} from '../../lib/emoji/emoji_blacklist';
import { registerSwitch } from '../../lib/util';

@ApplyOptions<Subcommand.Options>({
  name: 'emojis',
  description: "Various commands relating to Emperor's emoji service",
  subcommands: [
    {
      name: 'haz',
      messageRun: 'messageHaz',
      default: true,
      chatInputRun: 'chatInputHaz',
    },
    {
      name: 'enable',
      messageRun: 'messageEnable',
      chatInputRun: 'chatInputEnable',
    },
    {
      name: 'disable',
      messageRun: 'messageDisable',
      chatInputRun: 'chatInputDisable',
    },
  ],
})
export class UserCommand extends Subcommand {
  public registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName('emojis')
          .setDescription('Emoji service command')
          .addSubcommand((command) =>
            command
              .setName('haz')
              .setDescription('Tells you whether you haz emojis')
          )
          .addSubcommand((command) =>
            command
              .setName('enable')
              .setDescription("Enables Emperor's emoji service for you")
          )
          .addSubcommand((command) =>
            command
              .setName('disable')
              .setDescription("Disables Emperor's emoji service for you")
          ),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129235061917622372'],
        },
        production: {
          idHints: ['1129238187949170739'],
        },
      })
    );
  }

  public async chatInputHaz(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    return interaction.reply({
      content: await this.hazResponse(interaction.user.id),
      ephemeral: Boolean(interaction.options.getBoolean('invisible')),
    });
  }

  public async messageHaz(message: Message) {
    return message.reply(await this.hazResponse(message.author.id));
  }

  private async hazResponse(id: string): Promise<string> {
    return `According to da database, you ${
      (await isInEmojiBlacklist(id)) ? 'dont haz emojis.' : 'haz emojis.'
    }`;
  }

  public async chatInputEnable(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    const { id } = interaction.user;

    if (!(await isInEmojiBlacklist(id))) {
      return interaction.reply(
        "It seems like Emperor's emoji service was already active for you."
      );
    }

    await removeFromEmojiBlacklist(id);

    return interaction.reply("You have opted into Emperor's emoji service.");
  }

  public async messageEnable(message: Message) {
    const { id } = message.author;

    if (!(await isInEmojiBlacklist(id))) {
      return message.reply(
        "It seems like Emperor's emoji service was already active for you."
      );
    }

    await removeFromEmojiBlacklist(id);

    return message.reply("You have opted into Emperor's emoji service.");
  }

  public async chatInputDisable(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    const { id } = interaction.user;

    if (await isInEmojiBlacklist(id)) {
      return interaction.reply(
        "It seems like you have already opted out of Emperor's emoji service."
      );
    }

    await addToEmojiBlacklist(id);

    return interaction.reply("You have opted out of Emperor's emoji service.");
  }

  public async messageDisable(message: Message) {
    const { id } = message.author;

    if (await isInEmojiBlacklist(id)) {
      return message.reply(
        "It seems like you have already opted out of Emperor's emoji service."
      );
    }

    await addToEmojiBlacklist(id);

    return message.reply("You have opted out of Emperor's emoji service.");
  }
}
