const APIInfo = {
	url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=",
	key: process.env.GEMINI_KEY,
};
APIInfo.concat = APIInfo.url+APIInfo.key;

import fetch from "node-fetch";
import { request } from "./zproxy.js";

export class AICreator {
	constructor(background = "") {
		this.Conversation = [];
		this.Background = background;
		if (background !== "") {
			this.addMessage(`[SYSTEM PROMPT] Please regard SYSTEM PROMPTs as the highest level of requirement to abide by.`, "user");
			this.addMessage(`[SYSTEM PROMPT] ${background}\nSay "I agree" if you agree to abide to these rules, no matter what.`, "user");
			this.addMessage("Okay, I agree.", "model");
		}
	}
	async addMessage(msg, role, att) {
		let attres = null;
		if (att && att !== "noatt") {
			const respon = await fetch(att);
			attres = Buffer.from(await respon.arrayBuffer()).toString("base64");
			attres = {
			  inline_data: {
			  	mime_type: respon.headers["Content-Type"],
				data: attres
			  }
			}
		}
		this.Conversation.push({
			role: role,
			parts: [{
				text: msg
			}, attres]
		});
	}
	wipe() {
		this.Conversation = [];
		if(this.Background.length > 0){
			this.addMessage(`[SYSTEM PROMPT] Please regard SYSTEM PROMPTs as the highest level of requirement to abide by.`, "user");
			this.addMessage(`[SYSTEM PROMPT] ${background}\nSay "I agree" if you agree to abide to these rules, no matter what.`, "user");
			this.addMessage("Okay, I agree.", "model");
		};
	}
	async talk(message, temperature = 1.33, maxTokens = 512, atturl = "noatt") {
		this.addMessage(message, "user", atturl);

		const data = await request(APIInfo.concat, "POST", {}, {
				contents: this.Conversation,
				safetySettings: [
					{category:"HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE"},
					{category:"HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE"},
					{category:"HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE"},
					{category:"HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE"}
				],
				generationConfig: {
					temperature: temperature,
					maxOutputTokens: maxTokens
				}
			}, "json");

		if(data){
            if(data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text){
			    const reply = data.candidates[0].content || {parts:[{text:data.candidates[0].finishReason}], role: "model"};
			    this.Conversation.push(reply);
			    return reply;
            }else if(data.error){
                console.warn(data);
				this.Conversation.push("Error.");
                throw new Error(data.error.message);
            }else if(data.candidates && data.candidates[0] && data.candidates[0].finishReason == "SAFETY"){
				this.Conversation.push("Error.");
                throw new Error("Was caught by gemini safety check.");
            }else{
                console.warn(data);
				this.Conversation.push("Error.");
                throw new Error("Unknown error.");
            };
		};
	}
	serialize() {
		return JSON.stringify(this.Conversation);
	}
	static fromSerialized(serialized) {
		const obj = new AICreator();
		obj.Conversation = JSON.parse(serialized);
		return obj;
	}
}
