import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command, EmbedTitle } from 'imperial-discord';
import { ConfigManager } from '../util/config_manager';
import { Replier } from '../util/sender_replier';

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

const cmdExecuter = async (interaction: CommandInteraction) => {
  const invisible: boolean = !!interaction.options.getBoolean('invisible');
  const title = new EmbedTitle(interaction);
  const replier = new Replier(interaction);

  const cmdReply = `**Your username:** ${interaction.user.username}\n**Your ID:** ${interaction.user.id}`;

  return replier.reply(title.response, cmdReply, invisible);
};

export const cmd = new Command(cmdData, cmdExecuter);
