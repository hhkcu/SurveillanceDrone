console.log("get real");

const proxiesJSON = await fetch("https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/countries/US/data.json");
const proxies = await proxiesJSON.json();

const workingProxies = [];

import { HttpsProxyAgent } from "https-proxy-agent";
import { SocksProxyAgent } from "socks-proxy-agent";
import fs from "node:fs";
import fetch from "node-fetch";

let done = false;

proxies.forEach(async (proxy, idx) => {
    try {
        console.log(`testing proxy ${idx}`)
        if (proxy.protocol === "http") {
            console.log("http")
            const agent = new HttpsProxyAgent(proxy.proxy);
            await fetch("https://google.com", {
                agent: agent
            });
        } else {
            console.log("socket")
            const agent = new SocksProxyAgent(proxy.proxy);
            await fetch("https://google.com", {
                agent: agent
            });
        }
        console.log(`proxy ${idx} succeeded`)
    } catch (e) {
        console.log(`proxy ${idx} failed: ${e}`)
        return;
    }
    workingProxies.push({protocol:proxy.protocol,url:proxy.proxy});
    if (idx===proxies.length-1) done = true;
});

while (done === false) {}

const proxy2 = JSON.stringify(workingProxies);
fs.writeFileSync(`${process.cwd()}/lib/proxies.json`, proxy2);
console.log("initialized proxies");