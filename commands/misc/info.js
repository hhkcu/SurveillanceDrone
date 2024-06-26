import { SlashCommandBuilder } from "discord.js";
import fs from "node:fs";
import { spawnSync } from "node:child_process";

export const data = new SlashCommandBuilder()
.setName('info')
.setDescription('get system info');

export async function execute(interaction) {
	await interaction.deferReply();
    const proc = spawnSync("fastfetch", ["--pipe", "-l", "none", "--cpu-temp"], {encoding:"utf-8"});
    const lines = proc.stdout.split("\n");
    lines.forEach((val, index) => {
        if (val.includes("Local IP")) {
            lines.splice(index, 1);
        }
    });
    await interaction.editReply(`\`\`\`\n${lines.join("\n")}\n\`\`\``);
}