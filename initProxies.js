import "dotenv/config";
import { HttpsProxyAgent } from "https-proxy-agent";
import { SocksProxyAgent } from "socks-proxy-agent";
import https from "node:https";
import fs from "node:fs";
import fetch from "node-fetch";

export async function LoadProxies() {
    const proxiesJSON = await fetch("https://api.proxyscrape.com/v3/free-proxy-list/get?request=displayproxies&country=us&proxy_format=protocolipport&ssl=yes&format=json&timeout=20000");
    const proxies = (await proxiesJSON.json()).proxies;
    const workingProxies = [];
    for (var i = 0; i < proxies.length; i++) {
        const proxy = proxies[i];
        try {
            console.log(`testing proxy ${i}`)
            const agent = proxy.protocol === "http" ? new HttpsProxyAgent(proxy.proxy) : new SocksProxyAgent(proxy.proxy);
            const noSSLAgent = new https.Agent({
                rejectUnauthorized: false,
                agent: agent
            });
            const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key="+process.env.GEMINI_KEY, {
                agent: noSSLAgent,
                method: "POST",
                body: JSON.stringify({
                    contents: [{role:"user",parts:[{text:"hi"}]}],
                    generationConfig: {maxOutputTokens:1}
                }),
                signal: AbortSignal.timeout(15000)
            });
            if (res.status !== 200) {
                throw new Error("proxy failed");
            }
            console.log(`proxy ${i} succeeded`)
        } catch (e) {
            console.log(`proxy ${i} failed: ${e}`);
            continue;
        }
        workingProxies.push({protocol:proxy.protocol,url:proxy.proxy});
    }
    const proxy2 = JSON.stringify(workingProxies);
    if (fs.existsSync(`${process.cwd()}/lib/proxies.json`)) fs.unlinkSync(`${process.cwd()}/lib/proxies.json`);
    fs.writeFileSync(`${process.cwd()}/lib/proxies.json`, proxy2);
}