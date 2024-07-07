import { SlashCommandBuilder } from "@discordjs/builders";

import Datastore from "nedb";
const db = new Datastore({ filename: 'charactersdb' })
db.loadDatabase();

export const data = new SlashCommandBuilder()
.setName('listchars')
.setDescription('list characters');

export async function execute(interaction) {
	let responsestr = "```\n";
	interaction.deferReply();
	db.find({}).exec(async (err, docs) => {
		console.log(docs);
		docs.forEach(doc => {
			responsestr += `${doc.name} by ${doc.creator}\n`;
		})
		responsestr += "```";
		await interaction.editReply(responsestr);
	});
}
