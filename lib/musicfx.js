import crypto from "node:crypto";
import { SecretWriter } from "../lib/secretlib.js";

async function getToken() {
    const headers = { 
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Brave\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "sec-gpc": "1",
      "x-nextjs-data": "1",
      "cookie": SecretWriter.read("musicfx-cookie"), // get your own if ur cloning the repo btw, go to the url with devtools open and read Set-Cookie from response headers
      "Referer": "https://aitestkitchen.withgoogle.com/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    }
    const resp = await fetch("https://aitestkitchen.withgoogle.com/_next/data/yFATmjx80IEv-Skb7M1Hi/en/tools/music-fx.json", {
        headers,
        method: "GET"
    });
    const data = await resp.json();
    return data.pageProps.session.access_token;
}

const musicfx_key = await getToken();

const musicfx_url = 'https://aisandbox-pa.googleapis.com/v1:soundDemo';

const exts = {
    MP3: "mp3",
    WAV: "wav"
}

export class MusicFX {
    static async generate(prompt, length = 30, loop = false) {
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                accept: '*/*',
                'accept-language': 'en-US,en;q=0.9',
                authorization: `Bearer ${musicfx_key}`,
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
                "generationCount": 1,
                "input": {
                    "textInput": prompt
                },
                "loop": loop,
                "soundLengthSeconds": length,
                "model": "DEFAULT",
                "clientContext": {
                    "tool": "MUSICLM_V2",
                    "sessionId": `production;${crypto.randomInt(10000000000, 99999999999)}`
                }
            })
        };
        const response = await fetch(musicfx_url, options)

        if (!response instanceof Response) {
            return "Error generating audio";
        }

        const json = await response.json();

        if (!response.ok) return `Error generating audio: ${json.error.status} (${json.error.message})`;

        const audio = json.sounds[0];
        const audioBuffer = Buffer.from(audio.data, "base64");

        return {
            extension: exts[audio.audioContainer],
            data: audioBuffer,
            name: audio.mediaTitle
        }
    }
}