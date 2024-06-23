import { SlashCommandBuilder, ThreadAutoArchiveDuration } from "discord.js";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

function createNewPrompt(promptTemplate, interaction) {
    const userIds = {};
    const usersArray = Array.from(interaction.channel.members.values());
    usersArray.forEach(val => {
        userIds[val.user.globalName + ` (${val.user.username})`] = val.user.id;
    })
}

export const data = new SlashCommandBuilder()
    .setName('createchat')
    .setDescription('create a conversation thread')
    .addStringOption(option => option.setName("character").setDescription("the character to talk to"))

export async function execute(interaction) {
    const char = interaction.options.getString("character") || "default";
    const charFile = `${process.cwd()}/characters/${char}.json`;
    if (!fs.existsSync(charFile)) {
        await interaction.reply("character not found");
        return;
    }
    let { name, prompt } = await import(pathToFileURL(charFile));
    const thread = await interaction.channel.threads.create({
        name: `Conversation with ${name}`,
        autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
        reason: "Roleplay with a character!"
    })
    await thread.join();
    await thread.members.add(interaction.user.id);
    await thread.send(`This is a conversation between <@${interaction.user.id}> and ${name}.`);
}
