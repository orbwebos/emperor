import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { ConfigManager } from '../util/config_manager';
import { EmperorCommand } from '../emperor/command';
import { EmperorTitle } from '../emperor/title';
import { eightBall } from '../util/fun';
import { Replier } from '../util/sender_replier';
import { truncateString } from '../util/string_utils';

const cmdData = new SlashCommandBuilder()
  .setName('8ball')
  .setDescription('Divine your luck.')
  .addStringOption((option) =>
    option
      .setName('question')
      .setDescription('Your question.')
      .setRequired(true)
  )
  .addBooleanOption((option) =>
    option
      .setName('invisible')
      .setDescription(
        `If true, only you will see ${
          new ConfigManager().bot.name_possessive
        } response. Default: false.`
      )
  );

const cmdExecuter = async (i: CommandInteraction) => {
  const question: string = truncateString(
    i.options
      .getString('question')
      .replace(/\*/g, '')
      .replace(/_/g, '')
      .replace(/~~/g, '')
      .replace(/> /g, '>'),
    130
  );
  const invisible: boolean = !!i.options.getBoolean('invisible');
  const title = new EmperorTitle(i);
  const replier = new Replier(i);

  try {
    if (!question) {
      return replier.reply(
        title.error,
        "You don't seem to have provided a valid question.",
        true
      );
    }

    return replier.reply(
      title.response,
      `You asked:\n**${question}**\n\nYour luck is:\n**${eightBall()}**`,
      invisible
    );
  } catch (e) {
    return replier.reply(title.error, `An error was produced:\n**${e}**`, true);
  }
};

export const cmd = new EmperorCommand(cmdData, cmdExecuter);
