import Datastore from "nedb";
import fs from "node:fs";
const db = new Datastore({ filename: 'charactersdb', autoload: true })

console.log("Migrating JSON-format characters to neDB");
fs.readdirSync(`${process.cwd()}/characters`).forEach(fn => {
	const data = JSON.parse(fs.readFileSync(`${process.cwd()}/characters/${fn}`, "utf-8"));
	db.insert(data);
})