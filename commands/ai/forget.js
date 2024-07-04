import { SlashCommandBuilder } from "@discordjs/builders";
import fs from "node:fs";

export const data = new SlashCommandBuilder()
.setName('forget')
.setDescription('sudden amnesia GO!');

export async function execute(interaction) {
	interaction.reply("reset conversation");
    //return {method: "RunThreadListenerMethod", data: {id: interaction.channelId, method: "wipe", args: []}};
}
