import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { McpServerService } from "./mcp/mcp-server.service.js";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const mcpServer = app.get(McpServerService);
  await mcpServer.connect();
}

bootstrap();
