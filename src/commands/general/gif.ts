import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Message, MessageAttachment } from 'discord.js';
import { decode, Frame, GIF, Image } from 'imagescript';
import { basename, extname } from 'path';
import sizeOf from 'image-size';
import { getProvidedText } from '../../lib/content';

async function imageToGif(
  buffer: Buffer,
  width: number,
  height: number
): Promise<Buffer> {
  const image = new Image(width, height);
  image.composite((await decode(buffer, true)) as Image);

  const gif = new GIF([
    Frame.from(image, 100, 0, 0, Frame.DISPOSAL_BACKGROUND),
  ]);
  return Buffer.from(await gif.encode(100));
}

interface ImageInfo {
  name: string;
  width: number;
  height: number;
  url: string;
  buffer: Buffer;
}

@ApplyOptions<Command.Options>({
  description: 'Converts a single image into a GIF.',
})
export class GifCommand extends Command {
  private async processUrlOrAttachmentAndMessage(
    urlOrAttachment: MessageAttachment | string,
    message: Message
  ) {
    let info: ImageInfo;
    try {
      info = await this.urlOrAttachmentInfo(urlOrAttachment);
    } catch (error) {
      console.log(error);
      this.container.logger.debug(error);
      return message.reply(
        `That doesn't seem to be a valid image. File URL: ${
          urlOrAttachment instanceof MessageAttachment
            ? urlOrAttachment.url
            : urlOrAttachment
        }`
      );
    }

    let gifBuf: Buffer;
    try {
      gifBuf = await imageToGif(info.buffer, info.width, info.height);
    } catch (error) {
      if (error?.message?.includes('Image has to be at least 1 pixel wide')) {
        this.container.logger.debug(info);
        return message.reply(
          `That doesn't seem to be a valid image. File URL: ${info.url}`
        );
      }

      return message.reply(
        `An unexpected error ocurred: \`${error}\`. Please try again.`
      );
    }

    return message.reply({
      files: [{ attachment: gifBuf, name: `${info.name}.gif` }],
    });
  }

  private async urlOrAttachmentInfo(
    url: MessageAttachment | string
  ): Promise<ImageInfo> {
    if (url instanceof MessageAttachment) {
      const resp = await fetch(url.url);
      const buf = Buffer.from(await resp.arrayBuffer());

      return {
        name: basename(url.name, extname(url.name)),
        width: url.width,
        height: url.height,
        url: url.url,
        buffer: buf,
      };
    }

    const resp = await fetch(url);
    if (
      resp.headers.get('content-type') !== 'image/jpeg' &&
      resp.headers.get('content-type') !== 'image/png'
    ) {
      return {
        name: basename(url, extname(url)),
        width: null,
        height: null,
        url,
        buffer: null,
      };
    }

    const buf = Buffer.from(await resp.arrayBuffer());
    const imgInfo = sizeOf(buf);

    return {
      name: basename(url, extname(url)),
      width: imgInfo.width,
      height: imgInfo.height,
      url,
      buffer: buf,
    };
  }

  public async messageRun(message: Message) {
    if (message.attachments.size !== 0) {
      return this.processUrlOrAttachmentAndMessage(
        message.attachments.first(),
        message
      );
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const text = await getProvidedText(message);
    const matches = text.match(urlRegex);
    if (matches) {
      this.container.logger.trace(matches[0]);
      return this.processUrlOrAttachmentAndMessage(matches[0], message);
    }

    // of the previous 50 messages sent to the channel,
    // find the first one with an image attachment as its first attachment
    const msg = (
      await message.channel.messages.fetch({ before: message.id, limit: 50 })
    ).find(
      (m) =>
        m.attachments.size > 0 &&
        (m.attachments.first().contentType === 'image/jpeg' ||
          m.attachments.first().contentType === 'image/png')
    );

    if (!msg) {
      return message.reply(
        'No image file to convert to GIF was found. At the moment, only the JPG and the PNG format are accepted.'
      );
    }

    return this.processUrlOrAttachmentAndMessage(msg.attachments.first(), msg);
  }
}
