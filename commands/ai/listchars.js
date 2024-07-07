import { SlashCommandBuilder } from "@discordjs/builders";
import { DB } from "../../lib/db.js";

export const data = new SlashCommandBuilder()
.setName('listchars')
.setDescription('list characters');

export async function execute(interaction) {
	let responsestr = "```\n";
	interaction.deferReply();
	DB.find({}).exec(async (err, docs) => {
		console.log(docs);
		docs.forEach(doc => {
			responsestr += `${doc.name} by ${doc.creator}\n`;
		})
		responsestr += "```";
		await interaction.editReply(responsestr);
	});
}
