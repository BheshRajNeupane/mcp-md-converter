import { Injectable } from "@nestjs/common";
import { z } from "zod";
import { McpTool } from "../mcp-tool.interface.js";
import { MarkdownService } from "../../markdown/markdown.service.js";
import { GDocService } from "../../gdoc/gdoc.service.js";

const inputSchema = {
  markdown_path: z
    .string()
    .optional()
    .describe("Absolute path to the .md file to convert"),
  markdown: z
    .string()
    .optional()
    .describe("Raw markdown text to convert (alternative to markdown_path)"),
  title: z.string().optional().describe("Google Doc title (defaults to filename or 'Document')"),
  folder_id: z.string().optional().describe("Google Drive folder ID to place the doc in (optional)"),
};

type MdToGdocInput = typeof inputSchema;

@Injectable()
export class MdToGdocTool implements McpTool<MdToGdocInput> {
  readonly name = "md_to_gdoc";

  readonly config: McpTool<MdToGdocInput>["config"] = {
    title: "Convert Markdown to Google Doc",
    description:
      "Upload a Markdown file (or raw Markdown text) to Google Drive as a native Google Doc, preserving headings/lists/tables/code formatting. Requires prior one-time auth (run `npm run auth` in the mcp-md-converter project).",
    inputSchema,
  };

  constructor(
    private readonly markdownService: MarkdownService,
    private readonly gdocService: GDocService
  ) {}

  readonly handler: McpTool<MdToGdocInput>["handler"] = async ({
    markdown_path,
    markdown,
    title,
    folder_id,
  }) => {
    const { content, defaultTitle } = this.markdownService.readMarkdown({
      markdown_path,
      markdown,
    });
    const result = await this.gdocService.upload(content, title ?? defaultTitle, folder_id);
    return {
      content: [
        { type: "text", text: `Google Doc created: ${result.url} (id: ${result.id})` },
      ],
    };
  };
}
