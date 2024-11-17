import crypto from "node:crypto";
import https from "node:https";

const imagefx_url = 'https://aisandbox-pa.googleapis.com/v1:runImageFx';

export class ImageFX {
    static async generate(prompt, amount = 1) {
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                accept: '*/*',
                'accept-language': 'en-US,en;q=0.9',
                authorization: `Bearer ${process.env.MUSICFX_KEY}`,
                origin: 'https://aitestkitchen.withgoogle.com',
                priority: 'u=1, i',
                referer: 'https://aitestkitchen.withgoogle.com/',
                'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
                'x-client-data': 'CIS2yQEIo7bJAQipncoBCMPuygEIlqHLAQjfmM0BCIWgzQEIp6LOAQ=='
            },
            body: JSON.stringify({
                clientContext: {
                    sessionId: crypto.randomUUID(),
                    tool: "IMAGE_FX"
                },
                modelInput: {
                    modelNameType: "MIRO_V5_DISTILLED"
                },
                userInput: {
                    candidatesCount: amount,
                    prompts: [prompt],
                    seed: crypto.randomInt(0, 999999)
                }
            })
        };
        const response = await fetch(imagefx_url, options)

        if (!response instanceof Response) {
            return "Error generating images: Request Failure";
        }

        console.log(response);

        const json = await response.json();

        if (!response.ok) return `Error generating images: ${json.error.status} (${json.error.message})`;

        const imageBuffers = [];
        const images = json.imagePanels[0];

        images.generatedImages.forEach((imageData, index) => {
            imageBuffers.push({
                name: `${images.prompt}-${index}.jpg`,
                data: Buffer.from(imageData.encodedImage, "base64")
            })
        });

        return {
            candidates: imageBuffers
        }
    }
}