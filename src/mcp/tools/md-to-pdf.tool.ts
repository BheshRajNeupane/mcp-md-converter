import { Injectable } from "@nestjs/common";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import { McpTool } from "../mcp-tool.interface.js";
import { MarkdownService } from "../../markdown/markdown.service.js";
import { PdfService } from "../../pdf/pdf.service.js";

const inputSchema = {
  markdown_path: z
    .string()
    .optional()
    .describe("Absolute path to the .md file to convert"),
  markdown: z
    .string()
    .optional()
    .describe("Raw markdown text to convert (alternative to markdown_path)"),
  out_path: z.string().describe("Absolute path to write the output .pdf file to"),
  title: z.string().optional().describe("Document title (used in <title>)"),
};

type MdToPdfInput = typeof inputSchema;

@Injectable()
export class MdToPdfTool implements McpTool<MdToPdfInput> {
  readonly name = "md_to_pdf";

  readonly config: McpTool<MdToPdfInput>["config"] = {
    title: "Convert Markdown to PDF",
    description:
      "Render a Markdown file (or raw Markdown text) to a PDF file on disk, using a headless Chromium render. No network or Google account needed.",
    inputSchema,
  };

  constructor(
    private readonly markdownService: MarkdownService,
    private readonly pdfService: PdfService
  ) {}

  readonly handler: McpTool<MdToPdfInput>["handler"] = async ({
    markdown_path,
    markdown,
    out_path,
    title,
  }) => {
    const { content, defaultTitle } = this.markdownService.readMarkdown({
      markdown_path,
      markdown,
    });
    const abs = path.resolve(out_path);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    await this.pdfService.render(content, abs, title ?? defaultTitle);
    return {
      content: [{ type: "text", text: `PDF written to ${abs}` }],
    };
  };
}
