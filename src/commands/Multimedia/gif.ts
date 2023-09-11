/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { Args, Command } from '@sapphire/framework';
import { BaseGuildTextChannel, Message, VoiceChannel } from 'discord.js';
import { MessageAndImage, UserCommand } from './image';
import { silentTrackReply } from '../../lib/reply';
import { formatPermissions } from '../../lib/permissions';
import { mapFirstFetchMessages, plural } from '../../lib/util';

export class AliasedCommand extends Command {
  public async messageRun(message: Message, args: Args) {
    const urlResult = await args.pickResult('url');

    let info: MessageAndImage;

    // if the user provided no URL, try to get it from the first attachment
    if (urlResult.isErr()) {
      for (const [, attachment] of message.attachments) {
        if (UserCommand.contentTypeIsImage(attachment.contentType)) {
          try {
            info = await UserCommand.newInfo(attachment.url);
            break;
          } catch (e) {
            // do nothing
          }
        }
      }
      // if the user provided attachments and none of them were suitable, give an error message
      if (!info && message.attachments.size !== 0) {
        if (message.attachments.size === 1) {
          return silentTrackReply(
            message,
            "The provided attachment doesn't seem to be an image."
          );
        }
        return silentTrackReply(
          message,
          'None of the provided attachments seem to be images.'
        );
      }
    } else {
      // if user did provide a URL, process it
      const url = urlResult.unwrap() as URL;
      info = await UserCommand.newInfo(url.toString());
    }

    if (!info) {
      // if the channel is a common text channel in a guild, check if we have `ViewChannel` and `ReadMessageHistory`
      if (message.channel instanceof BaseGuildTextChannel) {
        const missingPermissions = this.container.client.missingPermissions(
          message.channel,
          'ViewChannel',
          'ReadMessageHistory'
        );

        if (missingPermissions.length) {
          return silentTrackReply(
            message,
            `You didn't provide a file or URL, and Emperor is missing the following permission${plural(
              missingPermissions
            )} to scan the chat: ${formatPermissions(missingPermissions)}.`
          );
        }
      }

      // if the channel is a voice channel in a guild, check if we have `ViewChannel`, `ReadMessageHistory`, and `Connect`
      if (message.channel instanceof VoiceChannel) {
        const missingPermissions = this.container.client.missingPermissions(
          message.channel,
          'ViewChannel',
          'ReadMessageHistory',
          'Connect'
        );

        if (missingPermissions.length) {
          return silentTrackReply(
            message,
            `You didn't provide a file or URL, and Emperor is missing the following permission${plural(
              missingPermissions
            )} to scan the chat: ${formatPermissions(missingPermissions)}.`
          );
        }
      }

      // compute it looking at the chat history. this is an expensive process
      info = await mapFirstFetchMessages(message.channel, {
        before: message.id,
        limit: 100,
        mapper: async (m: Message) => {
          try {
            const image = await UserCommand.messageFetchImage(m);
            return image;
          } catch (_) {
            return null;
          }
        },
      });
    }

    if (!info) {
      return silentTrackReply(
        message,
        'No URL or attachment were provided, and no image was found in the chat.'
      );
    }

    const image = await UserCommand.imageFromInfo(info);
    const gif = await UserCommand.gifFromImage(image);

    return silentTrackReply(message, {
      files: [{ attachment: gif, name: `${info.imageName}.gif` }],
    });
  }
}
