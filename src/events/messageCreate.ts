import { EmperorEmbedder } from '../util/emperor_embedder';
import { EmperorEvent } from '../util/emperor_event';
// import { WordDetector } from '../util/word_detector';
// import * as sport from '../util/sports_words';
import * as config from '../../config.json';
import * as schedule from 'node-schedule';
import * as log from '../util/logging';
import { StateManager } from '../util/state_manager';
import { Sender } from '../util/sender_replier';
import { emojiProcess } from '../util/emoji';
import { addHours } from 'date-fns';
import { sportsWordsProcess } from '../util/sports_words';
import Minesweeper from 'discord.js-minesweeper';
import { Message } from 'discord.js';

const minesweeperProcess = (m: any): void => {
	if (m.content.toLowerCase().split(' ')[0] === '.minesweeper') return m.channel.send(new Minesweeper().start());
}

const name = 'messageCreate';
const once = false;
const executer = async (message: Message, client) => {
	// if (!client.application?.owner) await client.application?.fetch();
	if (message.author.bot) return;

	try {
		emojiProcess(message);
		minesweeperProcess(message);
		if (message.guildId === config.redacted2Id && message.channelId !== '887000632559558757') sportsWordsProcess(message, 1, 3);
	}
	catch(e) {
		log.warn(message.client, e);
	}

	if (message.reference !== null) {
		if (message.reference.channelId === message.channelId && message.reference.guildId === message.guildId) {
			const channel = await client.channels.fetch(message.channelId);
			const repliedMessage = await channel.messages.fetch(message.reference.messageId);
			
			const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

			if (message.content.toLowerCase().includes('ratio')) {
				try {
					await repliedMessage.react('redactedId');
					await message.react('redactedId');
					await repliedMessage.react('redactedId');
					await message.react('redactedId');
					await repliedMessage.react('redactedId');
					await message.react('redactedId');
				}
				catch(e) {
					log.error(message.client, `Failure in "ratio" directive: ${e}`);
				}
			}
			if (message.content.toLowerCase().startsWith('.carbomb')) {
				await message.delete();
				const embedder = new EmperorEmbedder(repliedMessage.author);
				const hour = addHours(new Date(), randomIntFromInterval(5, 15));
				const timestamp = Math.floor(hour.getTime() / 1000);
				const embed = embedder.emperorEmbed('❗ A car bomb has been planted', `A car bomb has been planted in **${repliedMessage.author.username}'s** car, and it will explode **<t:${timestamp.toString()}:R>** if left alone.`);
				repliedMessage.reply({ embeds: [embed] });
			}
		}
	}

	const messageOriginalArray = message.content.split(' ');

	if (message.guildId === 'redactedId' || message.guildId === 'redactedId' || message.guildId === config.redacted2Id || message.guildId === config.redacted3Id) {
		if (message.content.startsWith('https://media.discordapp.net')) {
			const link = messageOriginalArray[0];
			if (link.endsWith('.mp4') || link.endsWith('.mov') || link.endsWith('.mov') || link.endsWith('.webm')) {
				const linkReplaced = link.replace('media.discordapp.net', 'cdn.discordapp.com');
				message.reply('You seem to have posted a `media.discordapp.net` video. Please use `cdn.discordapp.com` in the future.\n' +
					linkReplaced);
			}
		}
	}
};

export const event = new EmperorEvent(name, once, executer);
