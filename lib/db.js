import Database from "nedb";

export const DB = new Database({ filename: "characterdb", autoload: true });