import { Module } from "@nestjs/common";
import { GoogleModule } from "../google/google.module.js";
import { MarkdownModule } from "../markdown/markdown.module.js";
import { GDocService } from "./gdoc.service.js";

@Module({
  imports: [GoogleModule, MarkdownModule],
  providers: [GDocService],
  exports: [GDocService],
})
export class GDocModule {}
