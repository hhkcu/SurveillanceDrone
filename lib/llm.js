import { AICreator } from "./furrysdk.js";

export class LLM {
    constructor(systemPrompt = "", recordPastMessages = true) {
        this.recordPastMessages = recordPastMessages;
        this.messages = [{role: "system", content: systemPrompt}];
        this.serializables = Array.from(this.messages);
        this.gemini = new AICreator(systemPrompt);
    }
    async createCompletion(prompt, temperature = 0.7, max_tokens = 512, userPrefix = "none") {
        const completion = await this.gemini.talk(prompt, temperature, max_tokens);
        return {content: completion, role: "user"};
    }
    serializeMessages() {
        return this.gemini.serialize();
    }
    fromSerialized(str) {
	   const obj = new LLM();
       obj.gemini = (new AICreator()).fromSerialized(str);
       return obj;
    }
}