import { SlashCommandBuilder } from '@discordjs/builders';
import { ConfigManager } from '../util/config_manager';
import { EmperorCommand } from '../util/emperor_command';
import { EmperorTitle } from '../util/emperor_title';
import { Replier } from '../util/sender_replier';

const cmdData = new SlashCommandBuilder()
  .setName('server-info')
  .setDescription('Display information about this server.')
  .addBooleanOption(option =>
    option.setName('invisible')
      .setDescription(`If true, only you will see ${new ConfigManager().bot.name_possessive} response. Default: false.`));

const cmdExecuter = async i => {
  const invisible: boolean = i.options.getBoolean('invisible') ? true : false; 
  const title = new EmperorTitle(i);
  const replier = new Replier(i);

  const cmdReply = `**Server name:** ${i.guild.name}\n` +
    `**Total members:** ${i.guild.memberCount}\n` +
    `**Server was created in:** ${i.guild.createdAt}\n`;

  return replier.reply(title.response, cmdReply, invisible);
};

export const cmd = new EmperorCommand(cmdData, cmdExecuter);
