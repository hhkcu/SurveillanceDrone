import { SlashCommandBuilder } from "@discordjs/builders";
import fs from "node:fs";
import { DB } from "../../lib/db.js";

export const data = new SlashCommandBuilder()
.setName('createchar')
.setDescription('make your own character')
.addStringOption(option => option.setName("name").setDescription("name of character").setRequired(true))
.addStringOption(option => option.setName("appearance").setDescription("how your character looks").setRequired(true))
.addStringOption(option => option.setName("traits").setDescription("character's personality traits").setRequired(true))
.addStringOption(option => option.setName("scenario").setDescription("an example scenario"))
.addStringOption(option => option.setName("age").setDescription("age of character"))
.addStringOption(option => option.setName("customprompt").setDescription("Allows you to override the default template and use your own."));

export async function execute(interaction) {
	const name = interaction.options.getString("name"),
    age = interaction.options.getString("age") || "unnecessary",
    appearance = interaction.options.getString("appearance"),
    traits = interaction.options.getString("traits"),
    scenario = interaction.options.getString("scenario"),
    cpifany = interaction.options.getString("customprompt");
    const char = {
        name: name,
        age: age,
        appearance: appearance,
        traits: traits,
        scenario: scenario || "None given.",
	    customSystem: cpifany || "none",
        creator: interaction.user.username
    }
    DB.insert(char);
    await interaction.reply(`Created character ${name}.`);
}
