const { Formatters } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { currency } = require('../dataSystem');
// const { newEmperorEmbed } = require('../emperor-embeds');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Shows the laederboard.'),
	async execute(interaction) {
		return interaction.reply(
			Formatters.codeBlock(
				currency.sort((a, b) => b.balance - a.balance)
					.filter(user => interaction.client.users.cache.has(user.user_id))
					.first(10)
					.map((user, position) => `(${position + 1}) ${(interaction.client.users.cache.get(user.user_id).tag)}: ${user.balance}💰`)
					.join('\n'),
			),
		);
	},
};