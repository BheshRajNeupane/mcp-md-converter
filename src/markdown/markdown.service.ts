import { Injectable } from "@nestjs/common";
import MarkdownIt from "markdown-it";
import fs from "node:fs";
import path from "node:path";

const STYLE = `
body { font-family: -apple-system, Helvetica, Arial, sans-serif; line-height: 1.5; color: #1a1a1a; max-width: 800px; margin: 40px auto; padding: 0 24px; }
h1, h2, h3 { line-height: 1.25; }
code { background: #f2f2f2; padding: 2px 5px; border-radius: 3px; font-size: 0.9em; }
pre { background: #f2f2f2; padding: 12px 16px; border-radius: 6px; overflow-x: auto; }
pre code { background: none; padding: 0; }
blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #555; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #ddd; padding: 6px 10px; }
`;

export interface MarkdownInput {
  markdown_path?: string;
  markdown?: string;
}

export interface MarkdownSource {
  content: string;
  defaultTitle: string;
}

@Injectable()
export class MarkdownService {
  private readonly md = new MarkdownIt({ html: false, linkify: true, typographer: true });

  readMarkdown(input: MarkdownInput): MarkdownSource {
    if (input.markdown_path) {
      const abs = path.resolve(input.markdown_path);
      const content = fs.readFileSync(abs, "utf-8");
      return { content, defaultTitle: path.basename(abs, ".md") };
    }
    if (input.markdown) {
      return { content: input.markdown, defaultTitle: "Document" };
    }
    throw new Error("Provide either markdown_path or markdown");
  }

  toHtml(markdown: string, title?: string): string {
    const body = this.md.render(markdown);
    return `<!doctype html><html><head><meta charset="utf-8"><title>${
      title ?? "Document"
    }</title><style>${STYLE}</style></head><body>${body}</body></html>`;
  }
}
