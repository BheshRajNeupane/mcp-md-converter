import { Injectable } from "@nestjs/common";
import puppeteer from "puppeteer";
import { MarkdownService } from "../markdown/markdown.service.js";

@Injectable()
export class PdfService {
  constructor(private readonly markdownService: MarkdownService) {}

  async render(markdown: string, outPath: string, title?: string): Promise<void> {
    const html = this.markdownService.toHtml(markdown, title);
    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });
      await page.pdf({
        path: outPath,
        format: "A4",
        margin: { top: "20mm", bottom: "20mm", left: "18mm", right: "18mm" },
        printBackground: true,
      });
    } finally {
      await browser.close();
    }
  }
}
