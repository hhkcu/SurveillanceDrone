import path from "node:path";
import fs from "node:fs";
import * as GoogleAPI from "googleapis";
import http from "node:http";
const google = GoogleAPI.google;

const __dirname = import.meta.dirname;

const CREDENTIALS = path.resolve(__dirname, "..", "gmail_secret.json");
const TOKEN = path.resolve(__dirname, "..", "gmail_token.json");

console.log(CREDENTIALS);
console.log(TOKEN);

export class GmailApi {
  constructor(credFile = CREDENTIALS, tokFile = TOKEN) {
    this.credPath = credFile;
    this.pastToken = tokFile; // not guaranteed to exist, so don't parse it in the constrctor
  }
  async authorize() {
    const credentials = JSON.parse(fs.readFileSync(this.credPath, "utf-8"))
    const { client_secret, client_id, redirect_uris } =
      credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if token is already stored
    if (fs.existsSync(this.pastToken)) {
      const token = JSON.parse(fs.readFileSync(this.pastToken, "utf-8"));
      oAuth2Client.setCredentials(token);
      return oAuth2Client;
    }

    // Generate an authorization URL
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/gmail.readonly"],
    });

    console.log("Authorize this app by visiting this URL:", authUrl);

    const code = await new Promise((resolve) => {
      const https = http.createServer((req, res) => {
        const p = new URL(req.url, "http://localhost");
        res.setHeader("Content-Type", "text/plain");
        res.statusCode = 204;
        res.end();
        if (p.searchParams.has("code")) {
          const code = p.searchParams.get("code");

          https.close(() => {
            resolve(code);
          });
        }
      });
      https.listen(9070);
    });

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    fs.writeFileSync(this.pastToken, JSON.stringify(tokens, null, 2));
    console.log("Token stored to", this.pastToken);

    return oAuth2Client
  }
  async getLatestMessages(auth, messages = 1, query = "") {
    const gmail = google.gmail({ version: "v1", auth: auth });
    console.log(auth);

    const res = await gmail.users.messages.list({
      userId: "me",
      maxResults: messages,
      q: query,
    });

    const fetched = [];

    for (let i = 0; i < messages; i++) {
      const messageId = res.data.messages[i].id;

      const message = await gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "full",
      });

      const payload = message.data.payload;
      const headers = payload.headers;

      const subjectHeader = headers.find((header) => header.name === "Subject");
      const subject = subjectHeader ? subjectHeader.value : "No Subject";

      const fromHeader = headers.find((header) => header.name === "From");
      const from = fromHeader ? fromHeader.value : "Unknown Sender";

      let body = "";
      if (payload.body && payload.body.data) {
        body = Buffer.from(payload.body.data, "base64").toString("utf-8");
      } else if (payload.parts) {
        const part = payload.parts.find(
          (part) => part.mimeType === "text/plain"
        );
        if (part && part.body && part.body.data) {
          body = Buffer.from(part.body.data, "base64").toString("utf-8");
        }
      }

      fetched.push({
        body,
        subject,
        from,
      });
    }

    return fetched;
  }
}
