/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { unlinkSync } from 'fs';
import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@sapphire/plugin-subcommands';
import {
  AttachmentBuilder,
  BaseGuildTextChannel,
  Message,
  VoiceChannel,
} from 'discord.js';
import { Args } from '@sapphire/framework';
import ffmpeg from 'fluent-ffmpeg';
import {
  asyncFilterMapFindLastForMap,
  asyncFilterMapLast,
  extractFilenameFromUrl,
  filterMapFindLastForMap,
  mapFindFetchMessages,
  plural,
  registerSwitch,
} from '../../lib/util';
import { silentTrackReply } from '../../lib/reply';
import { HttpUrlRegexGlobal } from '../../lib/regexes';
import { formatPermissions } from '../../lib/permissions';

@ApplyOptions<Subcommand.Options>({
  description: 'Various video utilities',
  aliases: ['v'],
  subcommands: [
    {
      name: 'convert',
      chatInputRun: 'chatInputConvert',
      messageRun: 'messageConvert',
    },
  ],
})
export class UserCommand extends Subcommand {
  public registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription('Video utilities')
          .addSubcommand((command) =>
            command
              .setName('convert')
              .setDescription(
                'Converts a given video to another format (will search in chat if no image is provided)'
              )
              .addStringOption((option) =>
                option
                  .setName('to')
                  .setDescription('What format to convert to')
                  .addChoices({ name: 'mp4', value: 'mp4' })
                  .setRequired(true)
              )
              .addStringOption((option) =>
                option
                  .setName('url')
                  .setDescription('URL of the file to convert')
              )
              .addAttachmentOption((option) =>
                option.setName('file').setDescription('The file to convert')
              )
          ),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1145072754635309066'],
        },
        production: { idHints: ['1145102633183477810'] },
      })
    );
  }

  public async chatInputConvert(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    await interaction.deferReply();

    // const to = interaction.options.getString('to');
    const attachment = interaction.options.getAttachment('file');
    const providedUrl = interaction.options.getString('url');

    let url: URL;

    if (providedUrl) {
      try {
        url = await UserCommand.suitableVideoUrl(providedUrl);
      } catch (e) {
        // do nothing
      }
    }

    if (!url && attachment) {
      if (UserCommand.contentTypeIsVideo(attachment.contentType)) {
        try {
          url = await UserCommand.suitableVideoUrl(attachment.url);
        } catch (e) {
          // do nothing
        }
      }
    }

    if (!url) {
      if (providedUrl && attachment) {
        return interaction.editReply(
          'You provided a URL and an attachment, but neither seem to be suitable videos. (If they were, maybe their size was larger than 15 MB).'
        );
      }
      if (providedUrl && !attachment) {
        return interaction.editReply(
          "You provided a URL, but it doesn't seem to be a suitable video. (If it was, maybe its size was larger than 15 MB)."
        );
      }
      if (!providedUrl && attachment) {
        return interaction.editReply(
          "You provided an attachment, but it doesn't seem to be a suitable video. (If it was, maybe its size was larger than 15 MB)."
        );
      }

      if (interaction.channel instanceof BaseGuildTextChannel) {
        const missingPermissions = this.container.client.missingPermissions(
          interaction.channel,
          'ViewChannel',
          'ReadMessageHistory'
        );

        if (missingPermissions.length) {
          return interaction.editReply(
            `You didn't provide a file or URL, and Emperor is missing the following permission${plural(
              missingPermissions
            )} to scan the chat: ${formatPermissions(missingPermissions)}.`
          );
        }
      }

      // if the channel is a voice channel in a guild, check if we have `ViewChannel`, `ReadMessageHistory`, and `Connect`
      if (interaction.channel instanceof VoiceChannel) {
        const missingPermissions = this.container.client.missingPermissions(
          interaction.channel,
          'ViewChannel',
          'ReadMessageHistory',
          'Connect'
        );

        if (missingPermissions.length) {
          return interaction.editReply(
            `You didn't provide a file or URL, and Emperor is missing the following permission${plural(
              missingPermissions
            )} to scan the chat: ${formatPermissions(missingPermissions)}.`
          );
        }
      }

      const message = await interaction.fetchReply();

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
      return interaction.editReply(
        'No URL or attachment were provided, and no video was found in the chat.'
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

        return interaction.editReply(
          `An error ocurred: \`${err?.message ?? err}\``
        );
      })
      .on('end', () => {
        try {
          return interaction
            .editReply({
              files: [
                new AttachmentBuilder(path, {
                  name,
                }),
              ],
            })
            .then(() => unlinkSync(path));
        } catch (e) {
          return interaction.editReply(
            `An error ocurred: \`${e?.message ?? e}\``
          );
        }
      })
      .save(path);
  }

  public async messageConvert(message: Message, args: Args) {
    const to = await args.pick('string');
    if (to.toLowerCase() !== 'mp4') {
      return silentTrackReply(
        message,
        'Currently, only converting to MP4 is supported.'
      );
    }
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
          'None of the provided attachments seem to be suitable videos. (If they are, maybe their size is larger than 15 MB).'
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

  public static contentTypeIsVideo(contentType: string): boolean {
    return contentType.startsWith('video/');
  }

  public static async suitableVideoUrl(
    url: string,
    fetchResponse?: Response
  ): Promise<URL> {
    const response = fetchResponse ?? (await fetch(url, { method: 'HEAD' }));

    if (
      !response.ok ||
      !UserCommand.contentTypeIsVideo(response.headers.get('content-type'))
    ) {
      throw new Error(`Video URL ${url} was not a valid video`);
    }

    const contentLength = response.headers.get('content-length');

    if (!contentLength) {
      throw new Error(`Couldn't determine size of video URL ${url}`);
    }

    const sizeInBytes = parseInt(contentLength, 10);
    if (sizeInBytes > /* 15 MiB */ 15728640) {
      throw new Error(`The size of video URL ${url} exceeded 15 MiB`);
    }

    return new URL(url);
  }

  public static async messageFetchVideo(message: Message): Promise<URL | null> {
    const url = filterMapFindLastForMap(message.attachments, (attachment) =>
      UserCommand.contentTypeIsVideo(attachment.contentType)
        ? new URL(attachment.url)
        : null
    );
    if (url) {
      return url;
    }

    const matches = Array.from(message.content.matchAll(HttpUrlRegexGlobal));

    return asyncFilterMapLast(matches, async (match) =>
      UserCommand.suitableVideoUrl(match[0])
    );
  }
}
