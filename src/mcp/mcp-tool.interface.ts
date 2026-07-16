import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ZodRawShapeCompat } from "@modelcontextprotocol/sdk/server/zod-compat.js";

export const MCP_TOOLS = Symbol("MCP_TOOLS");

export interface McpToolConfig<InputArgs extends ZodRawShapeCompat> {
  title?: string;
  description?: string;
  inputSchema: InputArgs;
}

export interface McpTool<InputArgs extends ZodRawShapeCompat = ZodRawShapeCompat> {
  readonly name: string;
  readonly config: McpToolConfig<InputArgs>;
  readonly handler: ToolCallback<InputArgs>;
}
