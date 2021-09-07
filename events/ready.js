const { currency } = require('../dataSystem');
const { Users } = require('../dbObjects');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		const storedBalances = await Users.findAll();
		storedBalances.forEach(b => currency.set(b.user_id, b));
		console.log(`Ready. Logged in as ${client.user.tag}`);
	},
};