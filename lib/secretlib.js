import fs from "node:fs";
import { fileURLToPath } from 'url';
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const secretPath = path.resolve(__dirname, "..", "secret-persist.json");

export class SecretWriter {
    static read(key) {
        const data = JSON.parse(fs.readFileSync(secretPath));
        return data[key];
    }
    static write(key, value) {
        let data = JSON.parse(fs.readFileSync(secretPath));
        data[key] = value;
        let ser = JSON.parse(data);
        fs.writeFileSync(secretPath, ser);
    }
}