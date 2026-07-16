import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { GoogleAuthService } from "./google/google-auth.service.js";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const googleAuthService = app.get(GoogleAuthService);
  await googleAuthService.runAuthFlow();
  await app.close();
}

bootstrap().catch((err) => {
  console.error("Auth failed:", err);
  process.exit(1);
});
