import { AICreator } from "./furrysdk.js";

export class LLM {
    constructor(systemPrompt = "", recordPastMessages = true) {
        this.recordPastMessages = recordPastMessages;
        this.messages = [{role: "system", content: systemPrompt}];
        this.serializables = Array.from(this.messages);
        this.gemini = new AICreator(systemPrompt);
    }
    async createCompletion(prompt, temperature = 1.33, max_tokens = 512, userPrefix = "none") {
	// thanks zv7i
	try {
	  const completion = await this.gemini.talk(prompt, temperature, max_tokens);
          return {content: completion, role: "model"};
	} catch (e) {
	  return {content: `An error occured while processing your message: ${e}`, role: "model"};
	}
    }
    serializeMessages() {
        return this.gemini.serialize();
    }
    static fromSerialized(str) {
	   const obj = new LLM();
       obj.gemini = AICreator.fromSerialized(str);
       return obj;
    }
}
