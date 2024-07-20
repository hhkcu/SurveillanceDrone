import { SlashCommandBuilder } from "discord.js";
import { MusicFX } from "../../lib/musicfx.js";

export const data = new SlashCommandBuilder()
.setName('experimental')
.setDescription('Experimental commands, may be removed at any time')
.addSubcommand(sc =>
    sc.setName("musicfx-u").setDescription("MusicFX with unrestricted length")
    .addStringOption(opt => opt.setName("prompt").setDescription("Prompt for MusicFX").setRequired(true))
    .addIntegerOption(opt => opt.setName("duration").setDescription("Length of output"))
    .addBooleanOption(opt => opt.setName("looping").setDescription("Attempts to make the music loop indefinitely"))
);

const SUBCOMMANDS = {
    "musicfx-u": async (interaction) => {
        const prompt = interaction.options.getString("prompt");
            const length = interaction.options.getInteger("duration") || 30;
            const loop = interaction.options.getBoolean("looping") || false;
            await interaction.deferReply();
            const response = await MusicFX.generate(prompt, length, loop);
            if (typeof response === "string") {
                await interaction.editReply(response);
                return;
            }
            const filename = `musicfx-${response.name}.${response.extension}`;
            await interaction.editReply({
                files: [
                    new AttachmentBuilder(response.data, { name: filename, description: "MusicFX output" })
                ]
            });
            return;
    }
}


export async function execute(interaction) {
    const sc = interaction.options.getSubcommand(true);
    if (sc in SUBCOMMANDS) {
        return await SUBCOMMANDS[sc](interaction);
    }
    await interaction.reply("Invalid subcommand");
}