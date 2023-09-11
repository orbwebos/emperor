import { Events, Listener } from '@sapphire/framework';
import { load } from 'cheerio';
import {
  EmbedBuilder,
  Message,
  TextChannel,
  WebhookMessageCreateOptions,
} from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { isAnyOf, truncateString } from '../../lib/util';
import { includesEmojiKey } from './emojiReplacer';
import { Embedder } from '../../lib/Embedder';
import { TikTokShortenedUrl, TikTokUrl } from '../../lib/regexes';

@ApplyOptions<Listener.Options>({ event: Events.MessageCreate })
export class UserListener extends Listener<typeof Events.MessageCreate> {
  private triggered(message: Message) {
    if (message.author.bot) {
      return false;
    }

    if (
      !isAnyOf(
        message.guildId,
        '308422022650789888', // sneed clan
        '792960761101942795', // canadian server
        '948971692804419705' // testing server
      )
    ) {
      return false;
    }

    // temporary: prevent conflicts with the emoji service
    if (includesEmojiKey(message.content)) {
      return false;
    }

    return (
      TikTokShortenedUrl.test(message.content) ||
      TikTokUrl.test(message.content)
    );
  }

  public async run(message: Message) {
    if (!this.triggered(message)) {
      return;
    }

    let newContent = '';
    try {
      newContent = await this.friendlifyTikTokUrlsInText(message.content);
    } catch (error) {
      this.container.logger.warn(error);
      return;
    }

    if (message.content === newContent) {
      return;
    }

    // start the song and dance to send a webhook

    const channel = await message.client.channels.fetch(message.channelId);

    if (!(channel instanceof TextChannel)) {
      return;
    }

    const webhooks = await channel.fetchWebhooks();

    let webhook = webhooks.find(
      (foundWebhook) => foundWebhook.name === `Emperor Emoji Service`
    );
    if (!webhook) {
      this.container.logger.debug(
        `Creating new Emperor Emoji Service webhook in ${channel.id}...`
      );
      webhook = await channel.createWebhook({
        name: `Emperor Emoji Service`,
        avatar: this.container.config.general.emojiServiceWebhookAvatarUrl,
      });
    }

    try {
      await message.delete();
    } catch (error) {
      this.container.logger.debug(
        `Couldn't delete message ${message.id}: ${error}`
      );
    }

    const name = message.member.nickname
      ? message.member.nickname
      : message.author.username;

    const toSend =
      truncateString(newContent, 1850) === newContent
        ? newContent
        : `${truncateString(newContent, 1850)} **(character limit reached)**`;

    let embed: EmbedBuilder | null = null;
    if (message.reference !== null) {
      const referenceChannel = await message.client.channels.fetch(
        message.channelId
      );
      const repliedMessage = await (referenceChannel as any).messages.fetch(
        message.reference.messageId
      );
      const embedder = new Embedder(repliedMessage.author);
      const messageLink = `https://discord.com/channels/${message.reference.guildId}/${message.reference.channelId}/${message.reference.messageId}`;

      embed = embedder.embed({
        body: `${truncateString(
          repliedMessage.content,
          70
        )}\n[Go to replied message](${messageLink})`,
      });
    }

    const options: WebhookMessageCreateOptions = {
      content: toSend,
      username: name,
      avatarURL: message.member.displayAvatarURL(),
    };

    if (embed) {
      options.embeds = [embed];
    }

    await webhook.send(options);
  }

  private async friendlifyTikTokUrlsInText(inputText: string): Promise<string> {
    return this.replaceTikTokWithVxTikTokInText(
      await this.expandTikTokUrlsInText(inputText)
    );
  }

  private replaceTikTokWithVxTikTokInText(inputText: string): string {
    return inputText.replaceAll(TikTokUrl, (url: string) =>
      url.replace('tiktok', 'vxtiktok')
    );
  }

  private async expandTikTokUrl(url: string): Promise<string> {
    const html = await (await fetch(url)).text();
    const $ = load(html);

    const canonicalLinkElement = $('link[rel="canonical"]');
    const expandedUrl = canonicalLinkElement?.attr('href');

    if (TikTokUrl.test(expandedUrl)) {
      return expandedUrl;
    }

    throw new Error(`couldn't parse html for url ${url}`);
  }

  private async expandTikTokUrlsInText(inputText: string): Promise<string> {
    const matches = inputText.match(TikTokShortenedUrl);

    if (!matches) {
      return inputText; // No TikTok URLs found, return the original text.
    }

    let resultText = inputText;

    // eslint-disable-next-line no-restricted-syntax
    for (const match of matches) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const expandedUrl = await this.expandTikTokUrl(match);

        resultText = resultText.replace(new RegExp(match, 'g'), expandedUrl);
      } catch (e) {
        this.container.logger.debug(`Failed to expand URL: ${match}`, e);
        // eslint-disable-next-line no-continue
        continue;
      }
    }

    return resultText;
  }
}
