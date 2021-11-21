import { Message } from 'discord.js';
import * as config from '../../config.json';
import * as log from '../util/logging';

// TODO: tighten up regex. should only disqualify strings that
// actually have the emoji snowflake format, not just
// if they have a preceding "<"
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
	if (msg.guildId !== config.RedactedId && includesEmojiKey(msg.content)) {
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

				let webhook = await webhooks.find(webhook => webhook.name === 'Emperor Emoji Service');
				if (!webhook) {
					log.debug(`Creating new Emperor Emoji Service webhook in ${channel.id}...`);
					// @ts-ignore: createWebhook does not exist on type 'TextChannel'.
					webhook = await channel.createWebhook('Emperor Emoji Service', {
						avatar: 'https://cdn.discordapp.com/avatars/874016607767257129/1aa6ba7e91dc379e144d99df0d488529.png?size=1024',
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
				})
			}
		}
	}
}