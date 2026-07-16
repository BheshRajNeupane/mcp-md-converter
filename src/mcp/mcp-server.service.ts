import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MCP_TOOLS, McpTool } from "./mcp-tool.interface.js";

@Injectable()
export class McpServerService implements OnModuleInit {
  readonly server = new McpServer({
    name: "md-converter",
    version: "1.0.0",
  });

  constructor(@Inject(MCP_TOOLS) private readonly tools: McpTool[]) {}

  onModuleInit(): void {
    this.tools.forEach((tool) =>  this.server.registerTool(tool.name, tool.config, tool.handler))
  }


  async connect(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}
