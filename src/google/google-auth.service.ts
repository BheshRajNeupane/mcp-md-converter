import { Injectable } from "@nestjs/common";
import { google } from "googleapis";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import { URL } from "node:url";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const CONFIG_DIR = path.join(os.homedir(), ".mcp-md-converter");
const TOKEN_PATH = path.join(CONFIG_DIR, "token.json");
const CREDENTIALS_PATH =
  process.env.GOOGLE_CREDENTIALS_PATH ?? path.join(CONFIG_DIR, "credentials.json");

type OAuth2Client = InstanceType<typeof google.auth.OAuth2>;

@Injectable()
export class GoogleAuthService {
  private loadCredentials() {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      throw new Error(
        `Google OAuth credentials not found at ${CREDENTIALS_PATH}. ` +
          `Download an OAuth client (Desktop app type) from Google Cloud Console ` +
          `and save it there, then run: npm run auth`
      );
    }
    const raw = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
    return raw.installed ?? raw.web;
  }

  private buildClient(): OAuth2Client {
    const creds = this.loadCredentials();
    const redirectUri = "http://localhost:53682/oauth2callback";
    return new google.auth.OAuth2(creds.client_id, creds.client_secret, redirectUri);
  }

  async getAuthClient(): Promise<OAuth2Client> {
    const client = this.buildClient();

    if (fs.existsSync(TOKEN_PATH)) {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
      client.setCredentials(token);
      client.on("tokens", (tokens) => {
        const merged = { ...token, ...tokens };
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(merged, null, 2));
      });
      return client;
    }

    throw new Error(
      `Not authenticated yet. Run: npm run auth (in ${path.dirname(
        TOKEN_PATH
      )}) to complete the one-time Google login.`
    );
  }

  /** Standalone interactive flow — run via `npm run auth`. */
  async runAuthFlow(): Promise<void> {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    const client = this.buildClient();

    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
    });

    console.log("Open this URL in your browser to authorize:\n");
    console.log(authUrl, "\n");

    try {
      const open = (await import("open")).default;
      await open(authUrl);
    } catch {
      // ignore — user can copy/paste the URL manually
    }

    const code = await new Promise<string>((resolve, reject) => {
      const server = http.createServer((req, res) => {
        if (!req.url) return;
        const url = new URL(req.url, "http://localhost:53682");
        if (url.pathname !== "/oauth2callback") return;
        const code = url.searchParams.get("code");
        const err = url.searchParams.get("error");
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(err ? `Auth failed: ${err}` : "Auth successful. You can close this tab.");
        server.close();
        if (err) reject(new Error(err));
        else if (code) resolve(code);
        else reject(new Error("No code returned"));
      });
      server.listen(53682);
    });

    const { tokens } = await client.getToken(code);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log(`\nSaved token to ${TOKEN_PATH}. Auth complete.`);
  }
}
