import { Module } from "@nestjs/common";
import { MarkdownModule } from "../markdown/markdown.module.js";
import { PdfModule } from "../pdf/pdf.module.js";
import { GDocModule } from "../gdoc/gdoc.module.js";
import { MdToPdfTool } from "./tools/md-to-pdf.tool.js";
import { MdToGdocTool } from "./tools/md-to-gdoc.tool.js";
import { MCP_TOOLS } from "./mcp-tool.interface.js";
import { McpServerService } from "./mcp-server.service.js";

@Module({
  imports: [MarkdownModule, PdfModule, GDocModule],
  providers: [
    MdToPdfTool,
    MdToGdocTool,
    {
      provide: MCP_TOOLS,
      useFactory: (mdToPdfTool: MdToPdfTool, mdToGdocTool: MdToGdocTool) => [
        mdToPdfTool,
        mdToGdocTool,
      ],
      inject: [MdToPdfTool, MdToGdocTool],
    },
    McpServerService,
  ],
  exports: [McpServerService],
})
export class McpModule {}
