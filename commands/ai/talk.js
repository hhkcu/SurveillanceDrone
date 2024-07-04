import { SlashCommandBuilder } from "@discordjs/builders";
import { LLM } from "../../lib/llm.js";
import * as defaultPrompts from "../../lib/prompts.js";
import fs from "node:fs";

async function converseFromFile(filep, sysp, p, t, mt, up) {
	let llm;
	if (fs.existsSync(filep)) {
		const serialized = fs.readFileSync(filep, "utf8");
		llm = LLM.fromSerialized(serialized);
	} else {llm=new LLM(sysp);}
	llm.recordPastMessages = true;
	const msg = (await llm.createCompletion(p, t, mt, up));
	const serialized2 = llm.serializeMessages();
	fs.writeFileSync(filep, serialized2);
	return msg.content.toString();
}

export const data = new SlashCommandBuilder()
.setName('ai')
.setDescription('talk with ai')
.addStringOption(option => option.setName("prompt").setDescription("yap yap yap").setRequired(true))
.addStringOption(option => option.setName("systemprompt").setDescription("precise instructions"))
.addNumberOption(option => option.setName("temperature").setDescription("how crazy the ai is"));

export async function execute(interaction) {
	const prompt = interaction.options.getString("prompt");
	const canSaySlurs = interaction.guildId !== "1039844753665163264";
	const sysPrompt = interaction.options.getString("systemprompt") || (canSaySlurs ? defaultPrompts.SlursAllowed(interaction) : defaultPrompts.SlursNotAllowed(interaction));
	const temp = interaction.options.getNumber("temperature") || 1.3;
	const usern = interaction.user.username;
	await interaction.deferReply();
	const savedfilename = `${process.cwd()}/logs/${interaction.channelId}-llm.log`;
	const message = await converseFromFile(savedfilename, sysPrompt, prompt, temp, 512, usern);
	await interaction.editReply(message.substring(0, Math.min(2000, message.length)));
}
