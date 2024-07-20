import { SlashCommandBuilder } from "discord.js";
import { spawnSync } from "node:child_process";

export const data = new SlashCommandBuilder()
.setName('misc')
.setDescription('Miscellaneous commands')
.addSubcommand(sc => sc.setName("sysinfo").setDescription("Get system info"));

export async function execute(interaction) {
    const subCommand = interaction.options.getSubcommand(true);
    switch(subCommand) {
        case "sysinfo": {
            await interaction.deferReply();
            const proc = spawnSync("fastfetch", ["--pipe", "-l", "none", "--cpu-temp"], {encoding:"utf-8"});
            await interaction.editReply(`\`\`\`\n${proc.stdout.replace("█", "")}\n\`\`\``); // remove color bar fix
            break;
        }
        default: break;
    }
}
