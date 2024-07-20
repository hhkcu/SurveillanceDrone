import crypto from "node:crypto";
import { request as zRequest } from "./zproxy.js";
import { SocksProxyAgent } from "socks-proxy-agent";
import { Agent, setGlobalDispatcher } from "undici";
import https from "node:https";
import { default as nfetch, Response as nresponse } from "node-fetch";

const noSSLAgent = new Agent({
    connect: {
        rejectUnauthorized: false
    }
})

setGlobalDispatcher(noSSLAgent);

const agent = new SocksProxyAgent("socks4://104.37.135.145:4145");

const createNewAgent = (url) => {
    const isHttps = url.startsWith("https:");
    if (isHttps) {
        return new https.Agent({
            createConnection: (options, callback) => {
                const proxyConnection = agent.createConnection(options, (err, socket) => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    noSSLAgent.createConnection({
                        ...options,
                        socket,
                    }, callback);
                });
            },
        });
    } else {
        // For HTTP, just use the SOCKS proxy agent
        return agent;
    }
}

const musicfx_url = 'https://aisandbox-pa.googleapis.com/v1:soundDemo';

const exts = {
    MP3: "mp3",
    WAV: "wav"
}

async function diffFetch(url, opts) {
    try {
        return await zRequest(url, opts.method, opts.headers, opts.body, "json");
    } catch (z) {
        try {
            return await nfetch(url, {
                ...opts,
                agent: createNewAgent(url)
            })
        } catch (ohno) {
            return ohno
        }
    }
}

export class MusicFX {
    static async generate(prompt, length = 30, loop = false) {
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
                "generationCount": 1,
                "input": {
                    "textInput": prompt
                },
                "loop": loop,
                "soundLengthSeconds": length + 1,
                "model": "DEFAULT",
                "clientContext": {
                    "tool": "MUSICLM_V2",
                    "sessionId": crypto.randomUUID()
                }
            })
        };
        const response = await nfetch(musicfx_url, {
            ...options,
            agent: createNewAgent(musicfx_url)
        })

        if (!response instanceof nresponse) {
            return "Error generating audio: No agents available";
        }

        const json = await response.json();

        if (!response.ok) return `Error generating audio: ${json.error.status} (${json.error.message})`;

        console.log(json);

        const audio = json.sounds[0];
        const audioBuffer = Buffer.from(audio.data, "base64");

        return {
            extension: exts[audio.audioContainer],
            data: audioBuffer,
            name: audio.mediaTitle
        }
    }
}