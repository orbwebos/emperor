import { SlashCommandBuilder } from '@discordjs/builders';
import { EmperorCommand } from '../emperor/command';
import { ConfigManager } from '../util/config_manager';
import { Replier } from '../util/sender_replier';
import { EmperorTitle } from '../emperor/title';

const cmdData = new SlashCommandBuilder()
  .setName('user-info')
  .setDescription('Display info about yourself.')
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

  const cmdReply = `**Your username:** ${i.user.username}\n**Your ID:** ${i.user.id}`;

  return replier.reply(title.response, cmdReply, invisible);
};

export const cmd = new EmperorCommand(cmdData, cmdExecuter);
