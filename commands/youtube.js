const { SlashCommandBuilder } = require('@discordjs/builders');
const { DiscordTogether } = require('discord-together');
const { newEmperorEmbed } = require('../emperor-embeds');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('youtube')
		.setDescription('Replies with an invite link to a YouTube Together activity.'),
	async execute(interaction) {
		interaction.client.discordTogether = new DiscordTogether(interaction.client);
		if (interaction.member.voice.channel) {
			interaction.client.discordTogether.createTogetherCode(interaction.member.voice.channel.id, 'youtube').then(async invite => {
				const embed = newEmperorEmbed('YouTube Together response', interaction.user, `[Click here.](${invite.code})`);
				return interaction.reply({ embeds: [embed] });
			});
		}
		else {
			const embed = newEmperorEmbed('YouTube Together error', interaction.user, 'You need to be in a voice channel for that.');
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}
	},
};