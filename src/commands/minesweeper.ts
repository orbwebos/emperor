import { SlashCommandBuilder } from '@discordjs/builders';
import Minesweeper from 'discord.js-minesweeper';
import { ConfigManager } from '../util/config_manager';
import { EmperorCommand } from '../emperor/command';
import { EmperorTitle } from '../emperor/title';
import { Replier } from '../util/sender_replier';

const cmdData = new SlashCommandBuilder()
  .setName('minesweeper')
  .setDescription('Sends a game of Minesweeper.')
  .addBooleanOption((option) =>
    option
      .setName('invisible')
      .setDescription(
        `If true, only you will see ${
          new ConfigManager().bot.name_possessive
        } response. Default: false.`
      )
  );

const cmdExecuter = async (i) => {
  const invisible: boolean = !!i.options.getBoolean('invisible');
  const title = new EmperorTitle(i);
  const replier = new Replier(i);

  try {
    return i.reply({
      content: new Minesweeper().start(),
      ephemeral: invisible,
    });
  } catch (e) {
    return replier.reply(title.error, `An error was produced:\n**${e}**`, true);
  }
};

export const cmd = new EmperorCommand(cmdData, cmdExecuter);
