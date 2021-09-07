const { SlashCommandBuilder } = require('@discordjs/builders');
const { newEmperorEmbed } = require('../emperor-embeds');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user-info')
		.setDescription('Display info about yourself.'),
	async execute(interaction) {
		const cmdReply = `**Your username:** ${interaction.user.username}\n` +
            `**Your ID:** ${interaction.user.id}`;
		const embed = newEmperorEmbed('User info response', interaction.user, cmdReply);
		return interaction.reply({ embeds: [embed] });
	},
};