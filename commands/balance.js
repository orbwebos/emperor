const { SlashCommandBuilder } = require('@discordjs/builders');
const { currency } = require('../dataSystem');
const { newEmperorEmbed } = require('../emperor-embeds');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Shows the users\'s balance.')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('The target user.')),
	async execute(interaction) {
		const target = interaction.options.getUser('user') ?? interaction.user;
		const cmdReply = `**${target.tag}** has ${currency.getBalance(target.id)}💰`;
		const embed = newEmperorEmbed('Balance response', interaction.user, cmdReply);
		return interaction.reply({ embeds: [embed] });
	},
};