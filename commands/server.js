const { SlashCommandBuilder } = require('@discordjs/builders');
const { newEmperorEmbed } = require('../emperor-embeds');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Display information about this server.'),
	async execute(interaction) {
		const cmdReply = `**Server name:** ${interaction.guild.name}\n` +
            `**Total members:** ${interaction.guild.memberCount}\n` +
            `**Server was created in:** ${interaction.guild.createdAt}\n`;
		const embed = newEmperorEmbed('Server info response', interaction.user, cmdReply);
		return interaction.reply({ embeds: [embed] });
	},
};