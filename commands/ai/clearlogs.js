import { SlashCommandBuilder } from "@discordjs/builders";
import fs from "node:fs";

export const data = new SlashCommandBuilder()
.setName('clearlogs')
.setDescription('clear ai logs for this channel (use if it starts speaking chinese)');

export async function execute(interaction) {
	const fn = `${process.cwd()}/logs/${interaction.channelId}-llm.log`;
	fs.unlinkSync(fn);
	interaction.reply("cleared logs");
}
