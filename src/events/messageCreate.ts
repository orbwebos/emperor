import { addHours } from 'date-fns';
import Minesweeper from 'discord.js-minesweeper';
import { ConfigManager } from '../util/config_manager'; const config = new ConfigManager();
import { emojiProcess } from '../util/emoji';
import { EmperorEmbedder } from '../util/emperor_embedder';
import { EmperorEvent } from '../util/emperor_event';
import * as log from '../util/logging';
import { wordFilterProcess } from '../util/word_filter';

const name = 'messageCreate';
const once = false;
const executer = async (message, client) => {
  if (message.author.bot) return;

  try {
    if (message.content.toLowerCase().split(' ')[0] === '.minesweeper') return message.channel.send(new Minesweeper().start());
    emojiProcess(message);
    if (config.general.word_filter_guilds_whitelist.includes(message.guildId) === true && config.general.word_filter_channels_blacklist.includes(message.channelId) === false) await wordFilterProcess(message, config.wordFilter().levenshtein_threshold, config.wordFilter().levenshtein_lookahead);
  }
  catch(e) {
    log.warn(message.client, e);
  }

  if (message.reference !== null) {
    if (message.reference.channelId === message.channelId && message.reference.guildId === message.guildId) {
      const channel = await client.channels.fetch(message.channelId);
      const repliedMessage = await channel.messages.fetch(message.reference.messageId);

      if (message.content.toLowerCase().includes(config.general.emoji_reaction_trigger_word) && config.general.emoji_reaction === true && config.general.emoji_reaction_guilds_whitelist.includes(message.guildId) === true) {
        try {
          for (const emoji of config.general.emoji_reaction_resolvables) {
            await repliedMessage.react(emoji);
            await message.react(emoji);
          }
        }
        catch(e) {
          log.error(message.client, `Failure in "emoji reaction" directive: ${e}`);
        }
      }
      if (message.content.toLowerCase().startsWith('.carbomb') && config.general.carbombs === true && config.general.carbombs_guilds_whitelist.includes(message.guildId) === true) {
        const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
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

  if (config.general.media_checker_guilds_whitelist.includes(message.guildId) === true) {
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
