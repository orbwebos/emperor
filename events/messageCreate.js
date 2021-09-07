const { currency } = require('../dataSystem');

module.exports = {
	name: 'messageCreate',
	async execute(message, client) {
		if (!client.application?.owner) await client.application?.fetch();
		if (message.author.bot) return;

		currency.add(message.author.id, 1);
		// const messageLowerCase = message.content.toLowerCase();
		// const messageArray = messageLowerCase.split(' ');
		const messageOriginalArray = message.content.split(' ');

		if (message.content.startsWith('https://media.discordapp.net')) {
			const link = messageOriginalArray[0];
			if (link.endsWith('.mp4') || link.endsWith('.mov') || link.endsWith('.mov') || link.endsWith('.webm')) {
				const linkReplaced = link.replace('media.discordapp.net', 'cdn.discordapp.com');
				message.reply('You seem to have posted a `media.discordapp.net` video. Please use `cdn.discordapp.com` in the future.\n' +
				linkReplaced);
			}
		}
		// === '.deploy' && message.author.id === client.application?.owner.id) { }
	},
};