const LLMProviders = {
    Deepinfra: "https://api.deepinfra.com/v1/openai/chat/completions"
}

class LLMModel {
    constructor(name, baseProvider, apiUrl = LLMProviders.Deepinfra) {
        this.name = name;
        this.baseProvider = baseProvider;
        this.apiUrl = apiUrl;
    }
}

const LLMModels = {
    llama2_70b: new LLMModel("meta-llama/Llama-2-70b-chat-hf", "meta"),
    codellama_70b_instruct: new LLMModel("codellama/CodeLlama-70b-Instruct-hf", "meta"),
    mixtral_8x22b: new LLMModel("mistralai/Mixtral-8x22B-Instruct-v0.1", "mistral"),
    zephyr_141b: new LLMModel("HuggingFaceH4/zephyr-orpo-141b-A35b-v0.1", "huggingface"),
    dolphin_mixtral_8x7b: new LLMModel("cognitivecomputations/dolphin-2.6-mixtral-8x7b", "huggingface")
}

class LLM {
    constructor(systemPrompt = "", recordPastMessages = true) {
        this.recordPastMessages = recordPastMessages;
        this.messages = [{role: "system", content: systemPrompt}]
    }
    async createCompletion(prompt, model, temperature = 0.7, max_tokens = 512, userPrefix = "none") {
        this.messages.push({role: "user", content: prompt, _userPrefix: userPrefix})
        const body = {
            model: model.name,
            messages: this.messages,
            temperature: temperature,
            max_tokens: max_tokens,
            stream: false
        }
        console.log(body);
        const response = await fetch(model.apiUrl, {
            body: JSON.stringify(body),
            cache: "no-cache",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = JSON.parse(await response.text());
        console.log(data);
        const message = data.choices[0].message;
        if (this.recordPastMessages === true)
            this.messages.push(message);
        return data;
    }
    serializeMessages() {
        return JSON.stringify(this.messages);
    }
    fromSerialized(str) {
	const messagesList = JSON.parse(str);
        const obj = new LLM();
        obj.messages = messagesList;
        return obj;
    }
}

module.exports = {
    LLM: LLM,
    LLMModel: LLMModel,
    LLMModels: LLMModels
}
