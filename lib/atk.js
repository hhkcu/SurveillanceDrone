import { SecretWriter } from "./secretlib.js";

export class AITestKitchen {
    static async getToken() {
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
        console.log(data);
        return data.pageProps.session.access_token;
    }
}