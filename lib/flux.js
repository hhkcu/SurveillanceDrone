import { GmailApi } from "./gmail.js";
import { SecretWriter } from "./secretlib.js";
import crypto from "node:crypto";
import { connect } from "puppeteer-real-browser";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const randomString = (length) => crypto.randomBytes(Math.floor(length)).toString("hex");

export const FluxAspectRatios = Object.freeze({
    Aspect2_3: "2:3",
    Aspect3_2: "3:2",
    Aspect1_1: "1:1",
    Aspect16_9: "16:9",
    Aspect9_16: "9:16",
    Aspect21_9: "21:9",
    Aspect9_21: "9:21",
    Aspect4_5: "4:5",
    Aspect5_4: "5:4",
    Aspect3_4: "3:4",
    Aspect4_3: "4:3"
})

export const FluxAspectRatioChoices = Object.values(FluxAspectRatios);

const loginEmailXpath = "//div[1]/div[3]/div/div/div[1]/div[2]/form/div/div[1]/div/div[1]/input";
const loginClickXpath = "//div[1]/div[3]/div/div/div[1]/div[2]/form/button[2]";
const loginPassXpath  = "//div[1]/div[3]/div/div/div[1]/div[2]/form/div/div/div[1]/div[2]/input"
const loginPClicXpath = "//div[1]/div[3]/div/div/div[1]/div[2]/form/button[2]";

const registerEmail = "//div[1]/div[3]/div/div/div[1]/div[2]/form/div[1]/div[1]/div/div[1]/input";
const registerPass  = "//div[1]/div[3]/div/div/div[1]/div[2]/form/div[1]/div[2]/div/div[1]/div[2]/input";
const registerClick = "//div[1]/div[3]/div/div/div[1]/div[2]/form/div[2]/div[2]/button";

const otpDigits = [
    "//div[1]/div[3]/div/div/div[1]/div[2]/div[1]/div/div[1]/input[1]",
    "//div[1]/div[3]/div/div/div[1]/div[2]/div[1]/div/div[1]/input[2]",
    "//div[1]/div[3]/div/div/div[1]/div[2]/div[1]/div/div[1]/input[3]",
    "//div[1]/div[3]/div/div/div[1]/div[2]/div[1]/div/div[1]/input[4]",
    "//div[1]/div[3]/div/div/div[1]/div[2]/div[1]/div/div[1]/input[5]",
    "//div[1]/div[3]/div/div/div[1]/div[2]/div[1]/div/div[1]/input[6]"
]

const arInputs = {
    "2:3": "//div[1]/div[3]/div/div[3]/div[1]/div[2]/div/form/div[3]/div/div/div[1]/button",
    "3:2": "//div[1]/div[3]/div/div[3]/div[1]/div[2]/div/form/div[3]/div/div/div[2]/button",
    "1:1": "//div[1]/div[3]/div/div[3]/div[1]/div[2]/div/form/div[3]/div/div/div[3]/button",
    "16:9": "//div[1]/div[3]/div/div[3]/div[1]/div[2]/div/form/div[3]/div/div/div[4]/button",
    "21:9": "//div[1]/div[3]/div/div[3]/div[1]/div[2]/div/form/div[3]/div/div/div[5]/button",
    "9:16": "//div[1]/div[3]/div/div[3]/div[1]/div[2]/div/form/div[3]/div/div/div[6]/button",
    "9:21": "//div[1]/div[3]/div/div[3]/div[1]/div[2]/div/form/div[3]/div/div/div[7]/button",
    "4:5": "//div[1]/div[3]/div/div[3]/div[1]/div[2]/div/form/div[3]/div/div/div[8]/button",
    "5:4": "//div[1]/div[3]/div/div[3]/div[1]/div[2]/div/form/div[3]/div/div/div[9]/button",
    "3:4": "//div[1]/div[3]/div/div[3]/div[1]/div[2]/div/form/div[3]/div/div/div[10]/button",
    "4:3": "//div[1]/div[3]/div/div[3]/div[1]/div[2]/div/form/div[3]/div/div/div[11]/button",
}

const promptThing = "//div[1]/div[3]/div/div[3]/div[1]/div[2]/div/form/div[1]/textarea";
const rawToggle = "//div[1]/div[3]/div/div[3]/div[1]/div[2]/div/form/div[2]/div/button";
const genButton = "//div[1]/div[3]/div/div[3]/div[1]/div[2]/div/form/button";

const uinfoBut  = "//div[1]/div[2]/div/div[4]/div/div[2]/button";
const logOutBut = "//div[1]/div[2]/div/div[4]/div/div[2]/div/button";
const logOutConfBut = "//div[5]/div[2]/button[2]";

export class FluxApi {
    constructor() {}
    async init() {
        const { browser, page } = await connect({
            headless: false,
            args: [],
            customConfig: {},
            skipTarget: [],
            fingerprint: false,
            turnstile: true,
            connectOption: {}
        })
        await page.setViewport({
            width: Math.floor(1920),
            height: Math.floor(1080)
        })
        this.browser = browser
        this.workPage = page
        this.gmail = new GmailApi();
        this.gauth = await this.gmail.authorize();
        this.loginCurrent();
    }
    getElementByXPath(xp) {
        return this.workPage.waitForSelector(`::-p-xpath(${xp})`);
    }
    async restart() {
        if (this.browser) {
            if (this.workPage) await this.workPage.close();
            await this.browser.close();
        }
        this.browser = null;
        this.workPage = null;
        const { browser, page } = await connect({
            headless: false,
            args: [],
            customConfig: {},
            skipTarget: [],
            fingerprint: false,
            turnstile: true,
            connectOption: {}
        })
        
        await page.setViewport({
            width: Math.floor(1920),
            height: Math.floor(1080)
        })
        this.browser = browser;
        this.workPage = page;
    }
    async setNewAccount() {
        await this.workPage.goto("https://flux1.ai/sign-up", { waitUntil: "domcontentloaded" });
        const emailBox = await this.getElementByXPath(registerEmail);
        const passBox = await this.getElementByXPath(registerPass);
        const click1 = await this.getElementByXPath(registerClick);
        const ecode = crypto.randomBytes(5).toString("hex");
        const password = randomString(8);
        const ebbb = await emailBox.boundingBox();
        const pbbb = await passBox.boundingBox();
        const cbbb = await click1.boundingBox();
        await this.workPage.mouse.move(ebbb.x+16, ebbb.y+16, {steps: 40});
        await emailBox.type(`rd16777215+${ecode}@gmail.com`);
        await sleep(1500);
        await this.workPage.mouse.move(pbbb.x+16, pbbb.y+16, {steps: 40});
        await passBox.type(password);
        await sleep(1500);
        await this.workPage.mouse.move(cbbb.x+16, cbbb.y+16, {steps: 60});
        await click1.click();
        const lastCode = SecretWriter.read("last-flux-otp");
        const otpCode = await new Promise((resolve) => {
            const emailCheckInterval = setInterval(async () => {
                const lastMsg = (await this.gmail.getLatestMessages(this.gauth, 1))[0];
                if (lastMsg.subject.includes("verification")) {
                    console.log(lastMsg.subject);
                    const verifCode = lastMsg.subject.slice(0,6).toString();
                    console.log(verifCode)
                    if (verifCode != lastCode) {
                        clearInterval(emailCheckInterval);
                        resolve(verifCode);
                    }
                }
            }, 10000);
        });
        for (let i = 0; i < 6; i++) {
            const boxS = otpDigits[i];
            const box = await this.getElementByXPath(boxS);
            await box.type(otpCode.slice(i,i+1));
            await sleep(50);
        }
        SecretWriter.write("last-flux-otp", otpCode);
        SecretWriter.write("flux-ecode", ecode);
        SecretWriter.write("flux-pass", password);
    }
    async loginCurrent() {
        if (SecretWriter.read("flux-ecode") === "GENERATE_NEW") {
            await this.setNewAccount();
            return;
        }
        await this.workPage.goto("https://flux1.ai/sign-in", { waitUntil: "domcontentloaded" });
        const emailBox = await this.getElementByXPath(loginEmailXpath);
        await emailBox.type(`rd16777215+${SecretWriter.read("flux-ecode")}@gmail.com`);
        const click1 = await this.getElementByXPath(loginClickXpath);
        await click1.click();
        const passBox = await this.getElementByXPath(loginPassXpath);
        await passBox.type(SecretWriter.read("flux-pass"));
        const click2 = await this.getElementByXPath(loginPClicXpath);
        await click2.click();
        console.log("logged into last account")
    }
    async logout() {
        await sleep(1000);
        const ubox = await this.getElementByXPath(uinfoBut);
        await ubox.click();
        await sleep(250);
        const logoutBut = await this.getElementByXPath(logOutBut);
        await logoutBut.click();
        await sleep(750);
        const cb = await this.getElementByXPath(logOutConfBut);
        await cb.click();
    }
    async generate(prompt, raw=false, aspectRatio=FluxAspectRatios.Aspect1_1) {
        await this.workPage.goto("https://flux1.ai/flux1-1-ultra", { waitUntil: "domcontentloaded" });
        const promptArea = await this.getElementByXPath(promptThing);
        await promptArea.evaluate((val) => {
            val.value = "";
        })
        await promptArea.type(prompt);
        const rawToggleButton = await this.getElementByXPath(rawToggle);
        if (raw === true) {
            await rawToggleButton.click();
        }
        const arInput = await this.getElementByXPath(arInputs[aspectRatio]);
        await arInput.click();
        const gbut = await this.getElementByXPath(genButton);
        await gbut.click();
        const imgBuffer = await new Promise((resolve) => {
            this.workPage.on("response", async response => {
                const request = response.request();
                if (request.url().startsWith("https://flux1.ai/api/result")) {
                    const data = await response.json();
                    if (data.message === "success") {
                        const imgthing = await fetch(data.imgAfterSrc);
                        resolve(Buffer.from( await imgthing.arrayBuffer() ))
                    } else if (data.message === "error") {
                        switch (data.status) {
                            case 2:
                                resolve("NSFW content detected in image.");
                                break;
                            default:
                                resolve("Unknown error.");
                                break;
                        }
                    }
                }
            })
            this.workPage.on("framenavigated", async (frame) => {
                if (frame.url().startsWith("https://flux1.ai/price")) {
                    await this.restart();
                    await this.setNewAccount();
                    await sleep(5000);
                    resolve(await this.generate(prompt, raw, aspectRatio));
                }
            })
        });
        return imgBuffer;
    }
}

