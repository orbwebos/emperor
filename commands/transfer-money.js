const { SlashCommandBuilder } = require('@discordjs/builders');
const { currency } = require('../dataSystem');
// const { newEmperorEmbed } = require('../emperor-embeds');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('transfer-money')
		.setDescription('Transfer money to another user.')
		.addIntegerOption(option =>
			option.setName('amount')
				.setDescription('The amount of money to be transferred.'))
		.addUserOption(option =>
			option.setName('user')
				.setDescription('The target user.')),
	async execute(interaction) {
		const currentAmount = currency.getBalance(interaction.user.id);
		const transferAmount = interaction.options.getInteger('amount');
		const transferTarget = interaction.options.getUser('user');

		if (transferAmount > currentAmount) return interaction.reply(`Sorry ${interaction.user}, you only have ${currentAmount}.`);
		if (transferAmount <= 0) return interaction.reply(`Please enter an amount greater than zero, ${interaction.user}.`);

		currency.add(interaction.user.id, -transferAmount);
		currency.add(transferTarget.id, transferAmount);

		return interaction.reply(`Successfully transferred ${transferAmount}💰 to ${transferTarget.tag}. Your current balance is ${currency.getBalance(interaction.user.id)}💰.`);
	},
};

