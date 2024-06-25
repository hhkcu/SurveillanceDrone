import { SlashCommandBuilder } from "discord.js";
import fs from "node:fs";

export const data = new SlashCommandBuilder()
.setName('createchar')
.setDescription('make your own character')
.addStringOption(option => option.setName("name").setDescription("name of character").setRequired(true))
.addStringOption(option => option.setName("appearance").setDescription("how your character looks").setRequired(true))
.addStringOption(option => option.setName("traits").setDescription("character's personality traits").setRequired(true))
.addStringOption(option => option.setName("scenario").setDescription("an example scenario"))
.addStringOption(option => option.setName("age").setDescription("age of character"));

export async function execute(interaction) {
	const name = interaction.options.getString("name"),
    age = interaction.options.getString("age") || "unnecessary",
    appearance = interaction.options.getString("appearance"),
    traits = interaction.options.getString("traits"),
    scenario = interaction.options.getString("scenario");
    const filec = JSON.stringify({
        name: name,
        age: age,
        appearance: appearance,
        traits: traits,
        scenario: scenario || "None given.",
        creator: interaction.user.username
    });
    const fp = `${process.cwd()}/characters/${name}.json`;
    fs.writeFileSync(fp, filec);
    await interaction.reply({ content: `Created character ${name}.`, ephemeral: true });
}