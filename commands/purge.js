const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('Purge up to 99 messages.')
		.addIntegerOption(option => option.setName('amount').setDescription('Number of messages to purge').setRequired(true)),
	async execute(interaction) {
		const amount = interaction.options.getInteger('amount');
		/*
		if (amount <= 1 || amount > 100) {
			return interaction.reply({ content: 'You need to input a number between 1 and 99.', ephemeral: true });
		}
		await interaction.channel.bulkDelete(amount, true).catch(error => {
			console.error(error);
			return interaction.reply({ content: 'There was an error trying to purge messages in this channel.', ephemeral: true });
		});

		console.log('You telling me this is executing?');
		return interaction.reply({ content: `Successfully purged \`${amount}\` messages.`, ephemeral: true });
		*/
		return interaction.reply({ content: `You just attempted to purge \`${amount}\` messages. \`purge\` is not operational at the moment.`, ephemeral: true });
	},
};