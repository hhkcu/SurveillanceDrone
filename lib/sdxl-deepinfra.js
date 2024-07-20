const SDXL_URL = "https://api.deepinfra.com/v1/inference/stability-ai/sdxl?version=28fb12be4e4d05ff054e10eabd20e429efb98293056db1067ccdbb8ac2733b86";

export class SDXL {
    static async runInference(prompt, steps = 40) {
        const response = await fetch(SDXL_URL, {
            method: "POST",
            body: JSON.stringify({
                input: {
                    prompt: prompt
                }
            })
        })
        const res = await response.json();
        if (res.error) {
            return `Error generating image: ${res.error}`;
        }
        const img = await (await fetch(res.output[0])).arrayBuffer();
        return Buffer.from(img);
    }
}