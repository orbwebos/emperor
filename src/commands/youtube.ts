import { ChatInputCommandInteraction, Message } from 'discord.js';
import {
  Command,
  EmbedTitle,
  Replier,
  variantsMessageTrigger,
} from 'imperial-discord';
import { config } from '../util/config_manager';
import { registerOptions } from '../util/registration';

export class YoutubeCommand extends Command {
  public constructor() {
    super({
      description:
        'Replies with an invite link to a YouTube Together activity.',
      register: registerOptions,
    });
  }

  public registerApplicationCommands() {
    this.registerChatInputCommand((builder) =>
      builder
        .setName('youtube')
        .setDescription(
          'Replies with an invite link to a YouTube Together activity.'
        )
        .addBooleanOption((option) =>
          option
            .setName('invisible')
            .setDescription(
              `If true, only you will see ${config.bot.possessiveName} response. Default: false.`
            )
        )
    );
  }

  public registerMessageTrigger(message: Message) {
    return variantsMessageTrigger(
      message.content,
      'youtube-together',
      'you-tube',
      'yt'
    );
  }

  public chatInputExecute(interaction: ChatInputCommandInteraction) {
    return new Replier(interaction).embedReply(
      new EmbedTitle(this).response,
      'This command is in construction.',
      Boolean(interaction.options.getBoolean('invisible'))
    );
  }

  public messageExecute(message: Message) {
    return new Replier(message).embedReply(
      new EmbedTitle(this).response,
      'This command is in construction.'
    );
  }
}
