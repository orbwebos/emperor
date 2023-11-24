import { reply, send } from '@sapphire/plugin-editable-commands';
import {
  APIEmbed,
  AutocompleteInteraction,
  BaseGuildTextChannel,
  Interaction,
  JSONEncodable,
  Message,
  MessagePayload,
  MessageReplyOptions,
  PermissionsBitField,
  VoiceChannel,
} from 'discord.js';
import { EmperorTrack } from './music/EmperorTrack';
import { defaultEmperorEmbed } from './embeds';
import { CommandObject, userName } from './util';
import { toTimestamp } from './music/MusicManager';
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

export interface MusicEmbedOptions {
  track: EmperorTrack;
  title?: string;
  byline?: string;
  footerOverride?: string;
}

export function buildMusicEmbed(options: MusicEmbedOptions) {
  const { track } = options;

  const builder = defaultEmperorEmbed()
    .setTitle('Now playing')
    .setDescription(
      `[${track.info.title}](${track.info.uri})\n**${toTimestamp(
        track.info.position,
        track.info.length
      )}**`
    )
    .setThumbnail(track.info.artworkUrl)
    .setFooter({
      text: `Requested by ${userName(track.requester.user)}`,
      iconURL: track.requester.user.displayAvatarURL(),
    });

  if (options.title) {
    builder.setTitle(options.title);
  }

  if (options.byline) {
    builder.setFooter({
      text: `${options.byline} ${userName(track.requester.user)}`,
      iconURL: track.requester.user.displayAvatarURL(),
    });
  }

  if (options.footerOverride) {
    builder.setFooter({
      text: options.footerOverride,
      iconURL: track.requester.user.displayAvatarURL(),
    });
  }

  return builder;
}

export function replyMusicEmbed(
  interaction: InteractionAnswerable,
  options: MusicEmbedOptions
) {
  return interaction.reply({ embeds: [buildMusicEmbed(options)] });
}

export function editReplyMusicEmbed(
  interaction: InteractionAnswerable,
  options: MusicEmbedOptions
) {
  return interaction.editReply({ embeds: [buildMusicEmbed(options)] });
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

export function silentTrackReplyMusicEmbed(
  obj: CommandObject,
  options: MusicEmbedOptions
) {
  const builder = buildMusicEmbed(options);

  if (obj instanceof Message) {
    return reply(obj, {
      embeds: [builder],
      allowedMentions: { repliedUser: false },
    });
  }

  return obj.reply({ embeds: [builder] });
}
