import * as fs from 'fs';
import { addHours } from 'date-fns';
import { DMChannel, Message } from 'discord.js';
import Minesweeper from 'discord.js-minesweeper';
import rimraf from 'rimraf';
import { ConfigManager } from '../util/config_manager';
import { resolvePathFromSource } from '../util/resolve_path';
import { emojiProcess } from '../msg_commands/emoji';
import { EmperorEmbedder } from '../emperor/embedder';
import { EmperorEvent } from '../emperor/event';
import { mermaidProcess } from '../msg_commands/diagram';
import {
  gendocAppendToDoc,
  gendocBeginProcess,
  gendocCancelProcess,
  gendocPauseProcess,
  gendocResumeProcess,
  gendocMiddleProcess,
  gendocEndProcess,
} from '../msg_commands/gendoc';
import { wordFilterProcess } from '../util/word_filter';
import { analyzeFilterProcess } from '../msg_commands/analyzefilter';
import { EmperorClient } from '../emperor/client';
import { logger } from '../emperor/logger';
import { ensureDirectory } from '../util/directory';

const config = new ConfigManager();
export default class MessageCreateEvent extends EmperorEvent {
  constructor() {
    super('messageCreate', false);
  }

  static async execute(message: Message, client: EmperorClient) {
    if (message.author.bot) return;

    const lowerCaseContent = message.content.toLowerCase();

    if (
      config.general.message_processing_channels_blacklist.includes(
        message.channelId
      ) === true
    )
      return;

    if (message.channel instanceof DMChannel) {
      logger.debug(`${message.author.tag} said: ${message.content}`);
    }

    const jugarRegex = /quien \w+ jugar/gi;

    if (
      message.guildId === '782023593353412649' &&
      jugarRegex.test(message.content)
    ) {
      message.reply(
        'https://tenor.com/view/monkey-clown-laugh-wanted-gif-25134166'
      );
    }

    ensureDirectory(resolvePathFromSource(`../data/emoji_blacklist`));

    if (lowerCaseContent.startsWith('.emojis-off')) {
      fs.writeFileSync(
        resolvePathFromSource(`../data/emoji_blacklist/${message.author.id}`),
        ''
      );
      message.reply("You have opted out of Emperor's emoji service.");
    } else if (lowerCaseContent.startsWith('.emojis-on')) {
      if (
        !fs.existsSync(
          resolvePathFromSource(`../data/emoji_blacklist/${message.author.id}`)
        )
      ) {
        message.reply(
          "It seems like Emperor's emoji service was already active for you."
        );
      } else {
        rimraf(
          resolvePathFromSource(`../data/emoji_blacklist/${message.author.id}`),
          (e) => {
            if (e) {
              logger.error(e);
              message.reply('There has been an unexpected error.');
            } else {
              message.reply("You have opted into Emperor's emoji service.");
            }
          }
        );
      }
    }

    if (lowerCaseContent.startsWith('.diagram')) mermaidProcess(message);

    if (lowerCaseContent.startsWith('.begindoc')) gendocBeginProcess(message);
    else if (lowerCaseContent.startsWith('.enddoc')) gendocEndProcess(message);
    else if (lowerCaseContent.startsWith('.canceldoc'))
      gendocCancelProcess(message);
    else if (lowerCaseContent.startsWith('.pausedoc'))
      gendocPauseProcess(message);
    else if (lowerCaseContent.startsWith('.resumedoc'))
      gendocResumeProcess(message);
    else if (lowerCaseContent.startsWith('.newline'))
      gendocAppendToDoc(message, '\n');
    else if (lowerCaseContent.startsWith('.newpar'))
      gendocAppendToDoc(message, '\n\n');
    else if (
      fs
        .readdirSync(resolvePathFromSource('../data/gendoc'))
        .includes(`${message.author.id}.md`)
    ) {
      gendocMiddleProcess(message);
    }

    if (lowerCaseContent.startsWith('.refresh-emoji-cache')) {
      if (message.author.id !== config.bot.owner_id) {
        message.reply(
          "Sorry, you don't have permission to do that. You can ask this bot's owner to refresh the cache, or wait until it happens (it occurs every 30 minutes.)"
        );
      } else {
        await client.emojiStore.refresh();
        await message.reply('The emoji cache has been refreshed.');
      }
    }

    let filterCalled = false;
    if (
      lowerCaseContent.startsWith('.analyzefilter') ||
      lowerCaseContent.startsWith('.filteranalyze')
    ) {
      if (message.reference !== null) {
        filterCalled = true;
        const channel = await client.channels.fetch(message.channelId);
        const repliedMessage = await (channel as any).messages.fetch(
          message.reference.messageId
        );
        analyzeFilterProcess(
          repliedMessage,
          config.wordFilter().levenshtein_threshold,
          config.wordFilter().levenshtein_lookahead
        );
      } else {
        message.reply(
          'You need to reply to a message in order to run the filter analysis.'
        );
      }
    }

    try {
      if (lowerCaseContent.split(' ')[0] === '.minesweeper') {
        (message.channel as any).send(new Minesweeper().start());
        return;
      }
      if (!(message.channel instanceof DMChannel)) {
        emojiProcess(client, message);
      }
      if (
        config.general.word_filter_guilds_whitelist.includes(
          message.guildId
        ) === true &&
        config.general.word_filter_channels_blacklist.includes(
          message.channelId
        ) === false &&
        filterCalled === false
      )
        await wordFilterProcess(
          message,
          config.wordFilter().levenshtein_threshold,
          config.wordFilter().levenshtein_lookahead
        );
    } catch (e) {
      logger.warn(e);
    }

    if (
      (lowerCaseContent.includes('lovely') ||
        lowerCaseContent.includes('beloved')) &&
      (message.guildId === '308422022650789888' ||
        message.guildId === '906631270048624661')
    ) {
      message.react('335133804656197632');
    }

    if (message.reference !== null) {
      if (
        message.reference.channelId === message.channelId &&
        message.reference.guildId === message.guildId
      ) {
        const channel = await client.channels.fetch(message.channelId);
        const repliedMessage = await (channel as any).messages.fetch(
          message.reference.messageId
        );

        if (
          lowerCaseContent.includes(
            config.general.emoji_reaction_trigger_word
          ) &&
          config.general.emoji_reaction === true &&
          config.general.emoji_reaction_guilds_whitelist.includes(
            message.guildId
          ) === true
        ) {
          try {
            // eslint-disable-next-line no-restricted-syntax
            for (const emoji of config.general.emoji_reaction_resolvables) {
              // eslint-disable-next-line no-await-in-loop
              await repliedMessage.react(emoji);
              // eslint-disable-next-line no-await-in-loop
              await message.react(emoji);
            }
          } catch (e) {
            logger.error(`Failure in "emoji reaction" directive: ${e}`);
          }
        }
        if (
          lowerCaseContent.startsWith('.carbomb') &&
          config.general.carbombs === true &&
          config.general.carbombs_guilds_whitelist.includes(message.guildId) ===
            true
        ) {
          const randomIntFromInterval = (min, max) =>
            Math.floor(Math.random() * (max - min + 1) + min);
          await message.delete();
          const embedder = new EmperorEmbedder(repliedMessage.author);
          const hour = addHours(new Date(), randomIntFromInterval(5, 15));
          const timestamp = Math.floor(hour.getTime() / 1000);
          const embed = embedder.emperorEmbed(
            '❗ A car bomb has been planted',
            `A car bomb has been planted in **${
              repliedMessage.author.username
            }'s** car, and it will explode **<t:${timestamp.toString()}:R>** if left alone.`
          );
          repliedMessage.reply({ embeds: [embed] });
        }
      }
    }

    const messageOriginalArray = message.content.split(' ');

    if (
      config.general.media_checker_guilds_whitelist.includes(
        message.guildId
      ) === true
    ) {
      if (message.content.startsWith('https://media.discordapp.net')) {
        const link = messageOriginalArray[0];
        if (
          link.endsWith('.mp4') ||
          link.endsWith('.mov') ||
          link.endsWith('.mov') ||
          link.endsWith('.webm')
        ) {
          const linkReplaced = link.replace(
            'media.discordapp.net',
            'cdn.discordapp.com'
          );
          message.reply(
            `You seem to have posted a \`media.discordapp.net\` video. Please use \`cdn.discordapp.com\` in the future.\n${linkReplaced}`
          );
        }
      }
    }
  }
}
