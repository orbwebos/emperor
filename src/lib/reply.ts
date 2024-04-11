import { reply, send } from '@sapphire/plugin-editable-commands';
import {
  APIEmbed,
  AutocompleteInteraction,
  BaseGuildTextChannel,
  Interaction,
  JSONEncodable,
  Message,
  MessageReplyOptions,
  PermissionsBitField,
  VoiceChannel,
} from 'discord.js';
import { CommandObject } from './util';
import { isNullOrUndefined } from '@sapphire/utilities';

function injectSilentIntoOptions(
  options: string | MessageReplyOptions
): MessageReplyOptions {
  if (typeof options === 'string') {
    return {
      content: options,
      allowedMentions: { repliedUser: false },
    };
  }
  const toUse = options;
  if (!isNullOrUndefined(toUse.allowedMentions)) {
    toUse.allowedMentions.repliedUser = false;
  } else {
    toUse.allowedMentions = {
      repliedUser: false,
    };
  }

  return toUse;
}

type InteractionAnswerable = Exclude<Interaction, AutocompleteInteraction>;
type Embed = JSONEncodable<APIEmbed> | APIEmbed;

export function replyEmbed(interaction: InteractionAnswerable, embed: Embed) {
  return interaction.reply({ embeds: [embed] });
}

export function editReplyEmbed(
  interaction: InteractionAnswerable,
  embed: Embed
) {
  return interaction.editReply({ embeds: [embed] });
}

export function silentReply(
  message: Message,
  options: string | MessageReplyOptions
): Promise<Message> {
  return message.reply(injectSilentIntoOptions(options));
}

export function silentTrackReply(
  message: Message,
  options: string | MessageReplyOptions
): Promise<Message> {
  if (
    message.channel instanceof BaseGuildTextChannel ||
    message.channel instanceof VoiceChannel
  ) {
    if (
      !message.client.hasPermission(
        message.channel,
        PermissionsBitField.Flags.ReadMessageHistory
      )
    ) {
      return send(message, options);
    }
  }

  return reply(message, injectSilentIntoOptions(options));
}

export function silentTrackReplyEmbed(
  obj: CommandObject,
  embed: JSONEncodable<APIEmbed> | APIEmbed
) {
  if (obj instanceof Message) {
    return reply(obj, {
      embeds: [embed],
      allowedMentions: { repliedUser: false },
    });
  }

  return obj.reply({ embeds: [embed] });
}
