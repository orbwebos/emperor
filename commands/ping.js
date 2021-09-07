const { SlashCommandBuilder } = require('@discordjs/builders');
const { newEmperorEmbed } = require('../emperor-embeds');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with statistics about the application\'s response.'),
	async execute(interaction) {
		const embedInitial = newEmperorEmbed('Ping response', interaction.user,
			'**Websocket heartbeat:** `...`ms\n' +
		'**Roundtrip latency**: `...`ms');

		await interaction.reply({ embeds: [embedInitial] });
		const message = await interaction.fetchReply();

		const embedFinal = newEmperorEmbed('Ping response', interaction.user,
			`**Websocket heartbeat:** \`${interaction.client.ws.ping}\`ms\n` +
				`**Roundtrip latency**: \`${message.createdTimestamp - interaction.createdTimestamp}\`ms`);

		message.edit({ embeds: [embedFinal] });
	},
};