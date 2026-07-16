import { Module } from "@nestjs/common";
import { MarkdownModule } from "../markdown/markdown.module.js";
import { PdfService } from "./pdf.service.js";

@Module({
  imports: [MarkdownModule],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
