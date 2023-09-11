import { Events, Listener } from '@sapphire/framework';
import { DMChannel, Message, TextChannel, ThreadChannel } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Embedder } from '../../lib/Embedder';
import { isInEmojiBlacklist } from '../../lib/emoji/emoji_blacklist';
import { isInArray, truncateString } from '../../lib/util';
import { EmojiKeyPresent, EmojiKeys } from '../../lib/regexes';

export const includesEmojiKey = (content: string): boolean =>
  EmojiKeyPresent.test(content);
const emojiMatches = (content: string): RegExpMatchArray =>
  content.match(EmojiKeys);

@ApplyOptions<Listener.Options>({ event: Events.MessageCreate })
export class UserListener extends Listener<typeof Events.MessageCreate> {
  private async triggered(message: Message) {
    if (message.author.bot) {
      return false;
    }

    if (message.channel instanceof DMChannel) {
      return false;
    }

    if (await isInEmojiBlacklist(message.author.id)) {
      return false;
    }

    if (
      this.container.config.general.emojiServiceGuildsBlacklist.includes(
        message.guildId
      )
    ) {
      return false;
    }

    if (!includesEmojiKey(message.content)) {
      return false;
    }

    return true;
  }

  public async run(message: Message) {
    if (!(await this.triggered(message))) {
      return;
    }

    const matches = emojiMatches(message.content);
    let successfulReplacement = false;
    let workingContent = message.content;

    const { config } = this.container;

    if (!matches) {
      return;
    }

    matches.forEach((match: string) => {
      const current = match.slice(1, -1).toLowerCase();
      const irlServers = [
        '605428940537987083',
        '782023593353412649',
        '906631270048624661',
        '976579670478848010',
      ];
      const isIrlServer = (s: string) => isInArray(irlServers, s);
      const emoji = this.container.emojiCache.find(
        (foundEmoji) =>
          // name must match and it must not be true that the emoji comes from an IRL server
          // while the destination is not an IRL server
          foundEmoji.name.toLowerCase() === current &&
          !(isIrlServer(foundEmoji.guild.id) && !isIrlServer(message.guild.id))
      );

      if (emoji && emoji.available) {
        successfulReplacement = true;

        const emojiString = emoji.animated
          ? `<${emoji.identifier}>`
          : `<:${emoji.name}:${emoji.id}>`;

        workingContent = workingContent.replaceAll(
          match,
          // if offset is 0, replace, or
          // if offset is bigger than 0 and the preceding character isn't <, replace, but only if it also isn't bigger than 1 and the 2 preceding characters aren't <a
          // TODO: rewrite this so it's actually understandable
          (matched: string, offset: number, string: string) =>
            offset === 0 ||
            (offset > 0 &&
              string.charAt(offset - 1) !== '<' &&
              (offset === 1 ||
                (string.charAt(offset - 2) !== '<' &&
                  string.charAt(offset - 1) !== '<a')))
              ? emojiString
              : matched
        );
      }
    });

    if (!successfulReplacement) {
      return;
    }

    let [channel, threadChannel] = [
      await message.client.channels.fetch(message.channelId),
      null,
    ];

    if (channel instanceof ThreadChannel) {
      [channel, threadChannel] = [channel.parent, channel];
    }

    if (!(channel instanceof TextChannel)) {
      return;
    }

    const webhooks = await channel.fetchWebhooks();

    let webhook = webhooks.find(
      (foundWebhook) => foundWebhook.name === `${config.bot.name} Emoji Service`
    );
    if (!webhook) {
      this.container.logger.debug(
        `Creating new ${config.bot.name} Emoji Service webhook in ${channel.id}...`
      );
      webhook = await channel.createWebhook({
        name: `${config.bot.name} Emoji Service`,
        avatar: config.general.emojiServiceWebhookAvatarUrl,
      });
    }

    try {
      await message.delete();
    } catch (e) {
      this.container.logger.debug(
        `Couldn't delete message ${message.id}: ${e}`
      );
    }

    const name = message.member.nickname
      ? message.member.nickname
      : message.author.username;

    const toSend =
      truncateString(workingContent, 1850) === workingContent
        ? workingContent
        : `${truncateString(
            workingContent,
            1850
          )} **(character limit reached)**`;

    if (message.reference !== null) {
      const referenceChannel = await message.client.channels.fetch(
        message.channelId
      );
      const repliedMessage = await (referenceChannel as any).messages.fetch(
        message.reference.messageId
      );
      const embedder = new Embedder(repliedMessage.author);
      const messageLink = `https://discord.com/channels/${message.reference.guildId}/${message.reference.channelId}/${message.reference.messageId}`;

      const embed = embedder.embed({
        body: `${truncateString(
          repliedMessage.content,
          70
        )}\n[Go to replied message](${messageLink})`,
      });

      if (threadChannel) {
        await webhook.send({
          content: toSend,
          username: name,
          avatarURL: message.member.displayAvatarURL(),
          embeds: [embed],
          threadId: threadChannel.id,
        });
        return;
      }
      await webhook.send({
        content: toSend,
        username: name,
        avatarURL: message.member.displayAvatarURL(),
        embeds: [embed],
      });
    } else {
      if (threadChannel) {
        await webhook.send({
          content: toSend,
          username: name,
          avatarURL: message.member.displayAvatarURL(),
          threadId: threadChannel.id,
        });
        return;
      }
      await webhook.send({
        content: toSend,
        username: name,
        avatarURL: message.member.displayAvatarURL(),
      });
    }
  }
}
