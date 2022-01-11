import { Message } from 'discord.js';
import { ConfigManager } from '../util/config_manager'; const config = new ConfigManager();
import * as log from '../util/logging';

const regex = /(?<!<|<a|\\):\w\w+:/gi;

function includesEmojiKey(content: string): boolean {
  return regex.test(content);
}

function emojiMatches(content: string): RegExpMatchArray {
  return content.match(regex);
}

function emojiToText(emoji: any): string {
  let targetString: string = '<';
  if (emoji.animated) {
    targetString += 'a:'
  }
  else {
    targetString += ':'
  }
  targetString += `${emoji.name}:`;
  targetString += emoji.id;
  targetString += '>';
  return targetString;
}

export async function emojiProcess(msg: Message): Promise<void> {
  if (config.general.emoji_service_guilds_blacklist.includes(msg.guildId) === false && includesEmojiKey(msg.content)) {
    const matches = emojiMatches(msg.content);
    let successfulReplacement: boolean = false;
    if (matches) {
      for (const i in matches) {
        const current = matches[i].slice(1, -1).toLowerCase();
        const emoji = await msg.client.emojis.cache.find(emoji => emoji.name.toLowerCase() === current);

        if (emoji) {
          successfulReplacement = true;
          msg.content = msg.content.replace(matches[i], emojiToText(emoji));
        }
      }
    }

    if (successfulReplacement) {
      const channel = await msg.client.channels.fetch(msg.channelId);
      if (channel.type === 'GUILD_TEXT') {
        // @ts-ignore: fetchWebhooks does not exist on type 'TextChannel'.
        const webhooks = await channel.fetchWebhooks();

        let webhook = await webhooks.find(webhook => webhook.name === `${config.bot.name} Emoji Service`);
        if (!webhook) {
          log.debug(`Creating new ${config.bot.name} Emoji Service webhook in ${channel.id}...`);
          // @ts-ignore: createWebhook does not exist on type 'TextChannel'.
          webhook = await channel.createWebhook(`${config.bot.name} Emoji Service`, {
            avatar: config.general.emoji_service_webhook_avatar_url,
          });
        }

        try {
          await msg.delete();
        }
        catch(e) {
          log.debug(`Couldn't delete message ${msg.id}: ${e}`);
        }

        const name = msg.member.nickname ? msg.member.nickname : msg.author.username;
        await webhook.send({
          content: msg.content,
          username: name,
          avatarURL: msg.author.displayAvatarURL({ dynamic: true }),
        });
      }
    }
  }
}
