const { MessageEmbed } = require('discord.js');

function newEmperorEmbed(title, user, text, color) {
	if (color === undefined) {
		color = '#7850bd';
	}

	const embed = new MessageEmbed()
		.setColor(color)
		.setTitle(title)
		.setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
		.setDescription(text)
		.setTimestamp()
		.setFooter('Emperor v0.0.0');

	return embed;
}

module.exports = { newEmperorEmbed };