import { unlinkSync } from 'fs';
import { Args, Command } from '@sapphire/framework';
import {
  AttachmentBuilder,
  BaseGuildTextChannel,
  Message,
  VoiceChannel,
} from 'discord.js';
import ffmpeg from 'fluent-ffmpeg';
import { UserCommand } from './video';
import {
  asyncFilterMapFindLastForMap,
  extractFilenameFromUrl,
  mapFindFetchMessages,
  plural,
} from '../../lib/util';
import { silentTrackReply } from '../../lib/reply';
import { formatPermissions } from '../../lib/permissions';

export class AliasedCommand extends Command {
  public async messageRun(message: Message, args: Args) {
    const urlResult = await args.pickResult('url');
    let url: URL;

    // if the user provided no URL, try to get it from the last attachment
    if (urlResult.isErr()) {
      url = await asyncFilterMapFindLastForMap(
        message.attachments,
        async (attachment) => {
          try {
            const uri = await UserCommand.suitableVideoUrl(attachment.url);
            return uri;
          } catch (e) {
            // do nothing
          }
          return null;
        }
      );

      // if the user provided attachments and none of them were suitable, give an error message
      if (!url && message.attachments.size !== 0) {
        if (message.attachments.size === 1) {
          return silentTrackReply(
            message,
            "The provided attachment doesn't seem to be a suitable video. (If it is, maybe its size is larger than 15 MB)."
          );
        }
        return silentTrackReply(
          message,
          'None of the provided attachments seem to be suitable videos. (If they were, maybe their size is larger than 15 MB).'
        );
      }
    } else {
      // if user did provide a URL, process it
      url = urlResult.unwrap() as URL;
      try {
        await UserCommand.suitableVideoUrl(url.toString());
      } catch (_) {
        return silentTrackReply(
          message,
          "The provided URL doesn't seem to be a suitable video. (If it is, maybe its size is larger than 15 MB)."
        );
      }
    }

    if (!url) {
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
      url = await mapFindFetchMessages(message.channel, {
        before: message.id,
        limit: 100,
        mapper: async (m: Message) => {
          try {
            const uri = await UserCommand.messageFetchVideo(m);
            return uri;
          } catch (_) {
            return null;
          }
        },
      });
    }

    if (!url) {
      return silentTrackReply(
        message,
        'No URL or attachment were provided, and no video was found in the chat, or every video found had a size exceeding 15 MB.'
      );
    }

    const path = `emperor_video_convert_${new Date().getTime()}.mp4`;
    const resourceName = extractFilenameFromUrl(url);
    const name = resourceName ? `${resourceName.name}.mp4` : 'output.mp4';

    return ffmpeg(url.toString())
      .toFormat('mp4')
      .on('error', (err) => {
        try {
          unlinkSync(path);
        } catch (_) {
          // do nothing
        }

        return silentTrackReply(
          message,
          `An error ocurred: \`${err?.message ?? err}\``
        );
      })
      .on('end', () => {
        try {
          return silentTrackReply(message, {
            files: [
              new AttachmentBuilder(path, {
                name,
              }),
            ],
          }).then(() => unlinkSync(path));
        } catch (e) {
          return silentTrackReply(
            message,
            `An error ocurred: \`${e?.message ?? e}\``
          );
        }
      })
      .save(path);
  }
}
