const { SlashCommandBuilder } = require('discord.js');
const { LLM, LLMModels } = require("../../lib/llm");
const defaultPrompts = require("../../lib/prompts");
const fs = require("node:fs");

async function converseFromFile(filep, sysp, p, m, t, mt, up) {
	let llm;
	if (fs.existsSync(filep)) {
		const serialized = fs.readFileSync(filep, "utf8");
		llm = (new LLM()).fromSerialized(serialized);
	} else {llm=new LLM(sysp);}
	llm.recordPastMessages = true;
	const msg = (await llm.createCompletion(p, m, t, mt, up)).choices[0].message;
	const serialized2 = llm.serializeMessages();
	fs.writeFileSync(filep, serialized2);
	return msg.content;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ai')
		.setDescription('talk with ai')
        .addStringOption(option => option.setName("prompt").setDescription("yap yap yap").setRequired(true))
        .addStringOption(option => option.setName("systemprompt").setDescription("yap but more important")),
	async execute(interaction) {
	
        const prompt = interaction.options.getString("prompt");
        const canSaySlurs = interaction.guildId !== "1039844753665163264";
        const sysPrompt = interaction.options.getString("systemprompt") || (canSaySlurs ? defaultPrompts.SlursAllowed(interaction) : defaultPrompts.SlursNotAllowed(interaction));
        const llm = new LLM(sysPrompt);
	const usern = interaction.user.username;
	await interaction.deferReply();
	const savedfilename = `${process.cwd()}/logs/${interaction.channelId}-llm.log`;
        const message = await converseFromFile(savedfilename, sysPrompt, prompt, LLMModels.dolphin_mixtral_8x7b, 1, 512, usern);
	await interaction.editReply(message);
	},
};
