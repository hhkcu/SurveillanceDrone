import { SlashCommandBuilder } from "@discordjs/builders";
import fs from "node:fs";

export const data = new SlashCommandBuilder()
.setName('close')
.setDescription('close a rp session');

export async function execute(interaction) {
	interaction.reply("this session has closed");
    return {method: "RemoveThreadResponderAI", data: {id: interaction.channelId}};
}
