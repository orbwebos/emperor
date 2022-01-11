import { SlashCommandBuilder } from '@discordjs/builders';
import { EmperorEmbedder } from '../util/emperor_embedder';
import { EmperorCommand } from '../util/emperor_command';

const cmdData = new SlashCommandBuilder()
  .setName('user-info')
  .setDescription('Display info about yourself.');

const cmdExecuter = async interaction => {
  const embedder = new EmperorEmbedder(interaction.user);
  const cmdReply = `**Your username:** ${interaction.user.username}\n` +
    `**Your ID:** ${interaction.user.id}`;
  const embed = embedder.emperorEmbed('User info response', cmdReply);
  return interaction.reply({ embeds: [embed] });
};

export const cmd = new EmperorCommand(cmdData, cmdExecuter);
