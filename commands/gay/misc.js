import { SlashCommandBuilder } from "discord.js";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = import.meta.dirname;

export const data = new SlashCommandBuilder()
.setName('misc')
.setDescription('Miscellaneous commands')
.addSubcommand(sc => sc.setName("sysinfo").setDescription("Get system info"));

export async function execute(interaction) {
    const subCommand = interaction.options.getSubcommand(true);
    switch(subCommand) {
        case "sysinfo": {
            await interaction.deferReply();
            const proc = spawnSync("fastfetch", ["--pipe", "-c", path.resolve(__dirname, "..", "..", "ffconf.jsonc")], {encoding:"utf-8"});
            await interaction.editReply(`\`\`\`\n${proc.stdout.replace(/█/g, "")}\n\`\`\``); // remove color bar fix
            break;
        }
        default: break;
    }
}
