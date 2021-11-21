import { SlashCommandBuilder } from '@discordjs/builders';
import { EmperorEmbedder } from '../util/emperor_embedder';
import { EmperorCommand } from '../util/emperor_command';
import { Replier } from '../util/sender_replier';

const cmdData = new SlashCommandBuilder()
	.setName('server-info')
	.setDescription('Display information about this server.');

const cmdExecuter = async interaction => {
	const replier = new Replier(interaction)
	const cmdReply = `**Server name:** ${interaction.guild.name}\n` +
		   `**Total members:** ${interaction.guild.memberCount}\n` +
		   `**Server was created in:** ${interaction.guild.createdAt}\n`;
	return replier.reply('Server info response', cmdReply)
};

export const cmd = new EmperorCommand(cmdData, cmdExecuter)