# mcp-md-converter

MCP server exposing two tools so an AI coding agent (Claude Code, etc.) can turn a
Markdown file it just wrote into a **PDF** or a **Google Doc**.

- `md_to_pdf` — renders Markdown → HTML → PDF locally via headless Chromium (puppeteer).
  No network, no Google account needed.
- `md_to_gdoc` — uploads Markdown (as HTML) to Google Drive, which auto-converts it
  into a native, formatted Google Doc (headings, lists, tables, code blocks).

## 1. Install

```bash
cd mcp-md-converter
npm install
npm run build
```

## 2. Google auth (only needed for `md_to_gdoc`)

1. In [Google Cloud Console](https://console.cloud.google.com/), create/select a project.
2. Enable the **Google Drive API**.
3. Create OAuth client credentials → Application type **Desktop app**.
4. Download the JSON and save it as:
   ```
   ~/.mcp-md-converter/credentials.json
   ```
5. Run the one-time login:
   ```bash
   npm run auth
   ```
   This opens a browser, you approve access, and a `token.json` is cached in
   `~/.mcp-md-converter/`. Refresh tokens auto-renew after that — no repeat login.

Scope used: `drive.file` (the app can only see/create files it makes — not your whole Drive).

## 3. Register with Claude Code

```bash
claude mcp add md-converter -- node /Users/bheshrajneupane/Agent/mcp-md-converter/dist/main.js
```

Or add directly to your MCP config (`.mcp.json` / Claude Code settings):

```json
{
  "mcpServers": {
    "md-converter": {
      "command": "node",
      "args": ["/Users/bheshrajneupane/Agent/mcp-md-converter/dist/main.js"]
    }
  }
}
```

## 4. Usage

Once registered, ask the agent things like:

- "Convert README.md to a PDF at ~/Desktop/readme.pdf"
- "Turn this markdown into a Google Doc titled 'Design Spec'"

Tool params:

| Tool | Params |
|---|---|
| `md_to_pdf` | `markdown_path` \| `markdown`, `out_path` (required), `title` |
| `md_to_gdoc` | `markdown_path` \| `markdown`, `title`, `folder_id` (optional Drive folder) |

## Troubleshooting

- **PDF render fails to launch Chromium** (sandboxed/restricted shells, some CI):
  point puppeteer at a system Chrome install instead of its bundled one:
  ```bash
  export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  ```
  Set this env var wherever the MCP server process launches (shell profile, or
  in the `mcpServers` config's `env` block).

## Notes

- PDF rendering downloads a Chromium build via puppeteer on `npm install` (~150MB, one-time).
- Google Doc conversion relies on Drive's HTML→Docs import, so formatting fidelity matches
  what you'd get pasting HTML into Drive's "New > File upload" — solid for headings, lists,
  tables, bold/italic, code blocks; very exotic Markdown extensions may not map 1:1.
