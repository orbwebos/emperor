import {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
} from 'discord.js';
import { Command, EmbedTitle, Replier } from 'imperial-discord';
import { dotPrefixed } from '../util/dot_prefixed';
import { config } from '../util/config_manager';

export class YoutubeCommand extends Command {
  public constructor() {
    super({
      description:
        'Replies with an invite link to a YouTube Together activity.',
    });
  }

  public registerApplicationCommand() {
    return new SlashCommandBuilder()
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
      );
  }

  public registerMessageCallback(message: Message) {
    return dotPrefixed(
      message.content,
      'youtube-together',
      'youtube_together',
      'youtubetogether',
      'youtube',
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
