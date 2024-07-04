import * as fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Client, Collection, Events, GatewayIntentBits, Typing } from "discord.js";
import { execSync } from "node:child_process";

import "dotenv/config"

execSync("node deploycmds.js", {stdio:"inherit"});

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages], partials: ["MESSAGES", "CHANNEL", "REACTION"] });
client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(pathToFileURL(filePath));
        
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
			if ('refreshDebounce' in command) {
				setInterval(command.refresh, command.refreshDebounce);
				client.commands.set(command.data.name, command);
			}
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

async function startTyping(channel) {
	const ti = new Typing(channel, client.user, {
		timestamp: Date.now() / 1000
	});
	await client.emit(Events.TypingStart, ti);
}

const threadListeners = {};
client.on("messageCreate", async (message) => {
	if (message.author.bot) return;
	if (threadListeners[message.channelId]) {
		const val = threadListeners[message.channelId];
		const inferred = await val.model.createCompletion(`[${message.author.username} (${message.author.id})] ${message.content}`);
		message.reply(inferred.content);
	}
})

function ParseCommandReturn(returned) {
	switch (returned.method) {
		case "AddThreadResponderAI":
			console.log(`Created a thread listener for ID ${returned.data.id}`);
			threadListeners[returned.data.id] = returned.data;
			break;
		case "RemoveThreadResponderAI":
			delete threadListeners[returned.data.id];
			break;
		case "RunThreadListenerMethod":
			console.log(returned.data.method);
			(threadListeners[returned.data.id].model[returned.data.method])(...returned.data.args);
		default:
			console.log(`Command method ${returned.method} does not exist.`);
			return;
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`no command found :boowomp:`);
		return;
	}

	try {
		const returnResult = await command.execute(interaction);
		if (returnResult) {
			ParseCommandReturn(returnResult);
		}
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'something broke :(', ephemeral: true });
		} else {
			await interaction.reply({ content: 'something broke :(', ephemeral: true });
		}
	}
});

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(process.env.TOKEN);
