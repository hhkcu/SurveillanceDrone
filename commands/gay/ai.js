import { SlashCommandBuilder, AttachmentBuilder } from "discord.js";
import { MusicFX } from "../../lib/musicfx.js";
import { ImageFX } from "../../lib/imagefx.js";
import { FluxApi, FluxAspectRatioChoices } from "../../lib/flux.js";
import { AsyncQueue } from "../../lib/util.js";
import { randomUUID } from "node:crypto";
import path from "node:path";

function genChoices(arr) {
    const arr2 = []
    arr.forEach(v => {
        arr2.push({
            name: v,
            value: v
        })
    })
    return arr2;
}

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
    sc.setName("flux-ultra").setDescription("Generate images using Flux 1.1 Ultra")
    .addStringOption(opt => opt.setName("prompt").setDescription("Prompt").setRequired(true))
    .addStringOption(opt => opt.setName("aspect").setDescription("Aspect Ratio").setRequired(true).setChoices(genChoices(FluxAspectRatioChoices)))
    .addBooleanOption(opt => opt.setName("raw").setDescription("Use raw mode").setRequired(false))
);

let flux;

if (path.basename(process.argv[1]) !== "deploycmds.js") {
    flux = new FluxApi();
    await flux.init();
}

const fluxQueue = new AsyncQueue()

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
        case "flux-ultra": {
            const prompt = interaction.options.getString("prompt");
            const aspect = interaction.options.getString("aspect");
            const isRaw = interaction.options.getBoolean("raw") || false;
            await interaction.deferReply();
            let image;
            await fluxQueue.push(async () => {
                image = await flux.generate(prompt, isRaw, aspect);
            }, async report => {
                const { position, status } = report;
                await interaction.editReply(`Queue position: ${position}\nStatus: ${status}`);
            });
            if (Buffer.isBuffer(image) == false) {
                await interaction.editReply(`Error occured while generating image: ${image}`);
                break;
            }
            await interaction.editReply({
                files: [
                    new AttachmentBuilder(image, {name: `flux-${randomUUID()}.png`})
                ]
            });
            break;
        }
        default: break;
    }
}