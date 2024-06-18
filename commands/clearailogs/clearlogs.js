const { SlashCommandBuilder } = require('discord.js');
const fs = require("node:fs");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('clearlogs')
		.setDescription('clear ai logs for this channel (use if it starts speaking chinese)'),
	async execute(interaction) {
        	const fn = `${process.cwd()}/logs/${interaction.channelId}-llm.log`;
	        fs.unlinkSync(fn);
		interaction.reply("cleared logs");
	},
};

