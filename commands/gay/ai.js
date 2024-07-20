import { SlashCommandBuilder, AttachmentBuilder } from "discord.js";
import { MusicFX } from "../../lib/musicfx.js";
import { ImageFX } from "../../lib/imagefx.js";
import { SDXL } from "../../lib/sdxl-deepinfra.js";
import { randomUUID } from "node:crypto";

export const data = new SlashCommandBuilder()
.setName('ai')
.setDescription('AI-related commands')
.addSubcommand(sc =>
    sc.setName("musicfx").setDescription("Generate music using Google's MusicFX")
    .addStringOption(opt => opt.setName("prompt").setDescription("Prompt for MusicFX").setRequired(true))
    .addIntegerOption(opt => opt.setName("duration").setDescription("Length of output").setChoices([{
        name: "30s",
        value: 30
    }, {
        name: "50s",
        value: 50
    }, {
        name: "1m 10s",
        value: 70
    }]))
    .addBooleanOption(opt => opt.setName("looping").setDescription("Attempts to make the music loop indefinitely"))
)
.addSubcommand(sc =>
    sc.setName("imagefx").setDescription("Generate images using ImageFX")
    .addStringOption(opt => opt.setName("prompt").setDescription("Prompt").setRequired(true))
    .addIntegerOption(opt => opt.setName("images").setDescription("How many images to generate").setMinValue(1).setMaxValue(5))
)
.addSubcommand(sc =>
    sc.setName("sdxl").setDescription("Generate images using Stable Diffusion XL (provided by DeepInfra)")
    .addStringOption(opt => opt.setName("prompt").setDescription("Prompt").setRequired(true))
);

export async function execute(interaction) {
    const subCommand = interaction.options.getSubcommand(true);
    switch(subCommand) {
        case "musicfx": {
            const prompt = interaction.options.getString("prompt");
            const length = interaction.options.getInteger("duration") || 30;
            const loop = interaction.options.getBoolean("looping") || false;
            await interaction.deferReply();
            const response = await MusicFX.generate(prompt, length, loop);
            if (typeof response === "string") {
                await interaction.editReply(response);
                break;
            }
            const filename = `musicfx-${response.name}.${response.extension}`;
            await interaction.editReply({
                files: [
                    new AttachmentBuilder(response.data, { name: filename, description: "MusicFX output" })
                ]
            });
            break;
        }
        case "imagefx": {
            const prompt = interaction.options.getString("prompt");
            const nImages = interaction.options.getInteger("images") || 1;
            await interaction.deferReply();
            const images = await ImageFX.generate(prompt, nImages);
            if (typeof images === "string") {
                await interaction.editReply(images);
                break;
            }
            const filesArray = [];
            images.candidates.forEach(val => {
                filesArray.push(new AttachmentBuilder(val.data, { name: val.name }));
            });
            await interaction.editReply({
                files: filesArray
            });
            break;
        }
        case "sdxl": {
            const prompt = interaction.options.getString("prompt");
            await interaction.deferReply();
            const image = await SDXL.runInference(prompt);
            if (typeof image === "string") {
                await interaction.editReply(image);
                break;
            }
            await interaction.editReply({
                files: [
                    new AttachmentBuilder(image, {name: `sdxl-${randomUUID()}.png`})
                ]
            });
            break;
        }
        default: break;
    }
}