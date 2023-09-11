import { isNullOrUndefined } from 'util';
import { Command, container } from '@sapphire/framework';
import {
  ColorResolvable,
  Message,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { TitleHelper } from './TitleHelper';

export interface EmbedOverrides {
  color: ColorResolvable;
  author: boolean;
  authorTag: string;
  authorAvatarUrl: string;
  timestamp: boolean;
  footer: boolean;
  footerText: string;
}

export class CommandHelper {
  public readonly titleHelper: TitleHelper;
  public userName: string;
  public userAvatarUrl: string;
  public readonly apiObject:
    | Command.ChatInputCommandInteraction
    | Command.ContextMenuCommandInteraction
    | Message;

  public constructor(
    apiObject:
      | Command.ChatInputCommandInteraction
      | Command.ContextMenuCommandInteraction
      | Message,
    command?: Command
  ) {
    this.apiObject = apiObject;
    this.titleHelper = command ? new TitleHelper(command) : null;

    if (this.apiObject instanceof Message) {
      this.userName = this.apiObject.author.tag;
      this.userAvatarUrl = this.apiObject.author.displayAvatarURL();
    } else {
      this.userName = this.apiObject.user.tag;
      this.userAvatarUrl = this.apiObject.user.displayAvatarURL();
    }
  }

  public isInvisible() {
    if (!(this.apiObject instanceof ChatInputCommandInteraction)) {
      return null;
    }

    return Boolean(this.apiObject.options.getBoolean('invisible'));
  }

  public makeEmbed(
    title: string,
    description: string,
    overrides?: EmbedOverrides
  ) {
    const isNullOrUndefinedOrTrue = (o: boolean) =>
      isNullOrUndefined(o) || o === true;

    const embed = new EmbedBuilder().setColor(overrides?.color ?? '#7850bd');

    if (!isNullOrUndefined(title)) {
      embed.setTitle(title);
    }

    if (!isNullOrUndefined(description)) {
      embed.setDescription(description);
    }

    if (isNullOrUndefinedOrTrue(overrides?.author)) {
      embed.setAuthor({
        name:
          overrides?.authorTag ??
          (!this.userName.endsWith('#0000')
            ? this.userName
            : this.userName.slice(0, -5)),
        iconURL: overrides?.authorAvatarUrl ?? this.userAvatarUrl,
      });
    }

    if (isNullOrUndefinedOrTrue(overrides?.timestamp)) {
      embed.setTimestamp();
    }

    if (isNullOrUndefinedOrTrue(overrides?.footer)) {
      embed.setFooter({
        text:
          overrides?.footerText ??
          `${container.config.bot.name} v${container.config.bot.version}`,
      });
    }

    return embed;
  }

  public makeResponseEmbed(description: string, overrides?: EmbedOverrides) {
    return this.makeEmbed(this.titleHelper.response, description, overrides);
  }

  public makeStatusEmbed(description: string, overrides?: EmbedOverrides) {
    return this.makeEmbed(this.titleHelper.status, description, overrides);
  }

  public makeErrorEmbed(description: string, overrides?: EmbedOverrides) {
    return this.makeEmbed(this.titleHelper.error, description, overrides);
  }

  public makePromptEmbed(description: string, overrides?: EmbedOverrides) {
    return this.makeEmbed(this.titleHelper.prompt, description, overrides);
  }

  public makeChoiceEmbed(description: string, overrides?: EmbedOverrides) {
    return this.makeEmbed(this.titleHelper.choice, description, overrides);
  }

  public makeCancelledEmbed(description: string, overrides?: EmbedOverrides) {
    return this.makeEmbed(this.titleHelper.cancelled, description, overrides);
  }

  public makeProcessingEmbed(description: string, overrides?: EmbedOverrides) {
    return this.makeEmbed(this.titleHelper.processing, description, overrides);
  }

  public makeStateErrorEmbed(description: string, overrides?: EmbedOverrides) {
    return this.makeEmbed(this.titleHelper.stateError, description, overrides);
  }
}
