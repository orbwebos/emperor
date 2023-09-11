/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { BaseGuildTextChannel, Message, VoiceChannel } from 'discord.js';
import { Args, container } from '@sapphire/framework';
import { Frame, GIF, Image, decode } from 'imagescript';
import sizeOf from 'image-size';
import { HttpUrlRegexGlobal } from '../../lib/regexes';
import { silentTrackReply } from '../../lib/reply';
import {
  extractFilenameFromUrl,
  filterMapFindLastForMap,
  mapFirstFetchMessages,
  mapFindFetchMessages,
  plural,
  registerSwitch,
  asyncFilterMapLast,
  asyncFilterMapFindLastForMap,
} from '../../lib/util';
import { formatPermissions } from '../../lib/permissions';

export interface MessageAndImage {
  imageName: string;
  imageUrl: URL;
  fetchResponse: Response;
}

export interface ImageWithBuffer {
  width: number;
  height: number;
  buffer: Buffer;
}

@ApplyOptions<Subcommand.Options>({
  description: 'Various image utilities',
  aliases: ['i'],
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
          .setName('image')
          .setDescription('Image utilities')
          .addSubcommand((command) =>
            command
              .setName('convert')
              .setDescription(
                'Converts a given image to another format (will search in chat if no image is provided)'
              )
              .addStringOption((option) =>
                option
                  .setName('to')
                  .setDescription('What format to convert to')
                  .addChoices({ name: 'gif', value: 'gif' })
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
          idHints: ['1143989726127341678'],
        },
        production: {
          idHints: ['1145102634911547392'],
        },
      })
    );
  }

  public async chatInputConvert(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    await interaction.deferReply();

    // const to = interaction.options.getString('to');
    const attachment = interaction.options.getAttachment('file');
    const url = interaction.options.getString('url');

    let info: MessageAndImage;

    if (url) {
      try {
        info = await UserCommand.newInfo(url);
      } catch (e) {
        // do nothing
      }
    }

    if (!info && attachment) {
      try {
        info = await UserCommand.newInfo(attachment.url);
      } catch (e) {
        // do nothing
      }
    }

    if (!info) {
      if (url && attachment) {
        return interaction.editReply(
          'You provided a URL and an attachment, but neither seem to be suitable images.'
        );
      }
      if (url && !attachment) {
        return interaction.editReply(
          "You provided a URL, but it doesn't seem to be a suitable image."
        );
      }
      if (!url && attachment) {
        return interaction.editReply(
          "You provided an attachment, but it doesn't seem to be a suitable image."
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
      info = await mapFirstFetchMessages(interaction.channel, {
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
      return interaction.editReply(
        'No URL or attachment were provided, and no image was found in the chat.'
      );
    }

    const image = await UserCommand.imageFromInfo(info);
    const gif = await UserCommand.gifFromImage(image);

    return interaction.editReply({
      files: [{ attachment: gif, name: `${info.imageName}.gif` }],
    });
  }

  public async messageConvert(message: Message, args: Args) {
    const to = await args.pick('string');
    if (to.toLowerCase() !== 'gif') {
      return silentTrackReply(
        message,
        'Currently, only converting to GIF is supported.'
      );
    }
    const urlResult = await args.pickResult('url');

    let info: MessageAndImage;

    // if the user provided no URL, try to get it from the last attachment
    if (urlResult.isErr()) {
      info = await asyncFilterMapFindLastForMap(
        message.attachments,
        async (attachment) => {
          if (UserCommand.contentTypeIsImage(attachment.contentType)) {
            try {
              info = await UserCommand.newInfo(attachment.url);
            } catch (e) {
              return null;
            }
          }
          return info;
        }
      );

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
        const missingPermissions = container.client.missingPermissions(
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
        const missingPermissions = container.client.missingPermissions(
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
      info = await mapFindFetchMessages(message.channel, {
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

  public static contentTypeIsImage(contentType: string): boolean {
    return ['image/jpeg', 'image/png'].includes(contentType);
  }

  public static async newInfo(
    imageUrl: string,
    fetchResponse?: Response
  ): Promise<MessageAndImage> {
    const response = fetchResponse ?? (await fetch(imageUrl));

    if (
      !response.ok ||
      !UserCommand.contentTypeIsImage(response.headers.get('content-type'))
    ) {
      throw new Error(`Image URL ${imageUrl} was not a valid image`);
    }

    const url = new URL(imageUrl);
    const { name } = extractFilenameFromUrl(url);

    return {
      imageName: name,
      imageUrl: new URL(imageUrl),
      fetchResponse: response,
    };
  }

  public static async messageFetchImage(
    message: Message
  ): Promise<MessageAndImage> {
    const info = filterMapFindLastForMap(message.attachments, (attachment) =>
      UserCommand.contentTypeIsImage(attachment.contentType)
        ? UserCommand.newInfo(attachment.url)
        : null
    );
    if (info) {
      return info;
    }

    const matches = Array.from(message.content.matchAll(HttpUrlRegexGlobal));

    return asyncFilterMapLast(matches, async (match) => {
      const response = await fetch(match[0]);
      const contentType = response.headers.get('content-type');
      if (UserCommand.contentTypeIsImage(contentType)) {
        return UserCommand.newInfo(match[0], response);
      }
      return null;
    });
  }

  public static async imageFromInfo({
    fetchResponse,
  }: MessageAndImage): Promise<ImageWithBuffer> {
    const buffer = Buffer.from(await fetchResponse.arrayBuffer());
    const { width, height } = sizeOf(buffer);
    return {
      width,
      height,
      buffer,
    };
  }

  public static async gifFromImage({
    buffer,
    width,
    height,
  }: ImageWithBuffer): Promise<Buffer> {
    const image = new Image(width, height);
    image.composite((await decode(buffer, true)) as Image);

    const gif = new GIF([
      Frame.from(image, 100, 0, 0, Frame.DISPOSAL_BACKGROUND),
    ]);

    return Buffer.from(await gif.encode(100));
  }
}
