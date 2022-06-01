import { Message, TextChannel } from 'discord.js';
import { readdirSync } from 'fs';
import { EmperorClient } from '../emperor/client';
import { EmperorEmbedder } from '../emperor/embedder';
import { ConfigManager } from '../util/config_manager';
import { isInArray } from '../util/is_in';
import * as log from '../util/logging';
import { resolvePathFromSource } from '../util/resolve_path';
import { truncateString } from '../util/string_utils';

const config = new ConfigManager();

const regex = /(?<!<|<a|\\):\w\w+:/gi;

const includesEmojiKey = (content: string): boolean => regex.test(content);

const emojiMatches = (content: string): RegExpMatchArray =>
  content.match(regex);

export async function emojiProcess(
  client: EmperorClient,
  message: Message
): Promise<void> {
  if (
    !isInArray(
      readdirSync(resolvePathFromSource(`../data/emoji_blacklist`)),
      message.author.id
    ) &&
    config.general.emoji_service_guilds_blacklist.includes(message.guildId) ===
      false &&
    includesEmojiKey(message.content)
  ) {
    const matches = emojiMatches(message.content);
    let successfulReplacement = false;
    let workingContent = message.content;

    if (matches) {
      matches.forEach((match: string) => {
        const current = match.slice(1, -1).toLowerCase();
        const irlServers = [
          '605428940537987083',
          '782023593353412649',
          '906631270048624661',
          '976579670478848010',
        ];
        const isIrlServer = (s: string) => isInArray(irlServers, s);
        const emoji = client.emojiStore.find(
          (foundEmoji) =>
            // name must match and it must not be true that the emoji comes from an IRL server
            // while the destination is not an IRL server
            foundEmoji.name.toLowerCase() === current &&
            !(
              isIrlServer(foundEmoji.guild.id) && !isIrlServer(message.guild.id)
            )
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
    }

    if (successfulReplacement) {
      const channel = await message.client.channels.fetch(message.channelId);

      if (channel instanceof TextChannel) {
        const webhooks = await channel.fetchWebhooks();

        let webhook = webhooks.find(
          (foundWebhook) =>
            foundWebhook.name === `${config.bot.name} Emoji Service`
        );
        if (!webhook) {
          log.debug(
            `Creating new ${config.bot.name} Emoji Service webhook in ${channel.id}...`
          );
          webhook = await channel.createWebhook(
            `${config.bot.name} Emoji Service`,
            {
              avatar: config.general.emoji_service_webhook_avatar_url,
            }
          );
        }

        try {
          await message.delete();
        } catch (e) {
          log.debug(`Couldn't delete message ${message.id}: ${e}`);
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
          const referenceChannel = await client.channels.fetch(
            message.channelId
          );
          const repliedMessage = await (referenceChannel as any).messages.fetch(
            message.reference.messageId
          );
          const embedder = new EmperorEmbedder(repliedMessage.author);
          const messageLink = `https://discord.com/channels/${message.reference.guildId}/${message.reference.channelId}/${message.reference.messageId}`;

          const embed = embedder.emperorEmbed(
            '',
            `${truncateString(
              repliedMessage.content,
              70
            )}\n[Go to replied message](${messageLink})`
          );

          await webhook.send({
            content: toSend,
            username: name,
            avatarURL: message.member.displayAvatarURL({
              dynamic: true,
            }),
            embeds: [embed],
          });
        } else {
          await webhook.send({
            content: toSend,
            username: name,
            avatarURL: message.member.displayAvatarURL({ dynamic: true }),
          });
        }
      }
    }
  }
}
