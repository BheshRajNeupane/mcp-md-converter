import { Injectable } from "@nestjs/common";
import { google } from "googleapis";
import { Readable } from "node:stream";
import { GoogleAuthService } from "../google/google-auth.service.js";
import { MarkdownService } from "../markdown/markdown.service.js";

export interface GDocResult {
  id: string;
  url: string;
}

@Injectable()
export class GDocService {
  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly markdownService: MarkdownService
  ) {}

  async upload(markdown: string, title: string, folderId?: string): Promise<GDocResult> {
    const auth = await this.googleAuthService.getAuthClient();
    const drive = google.drive({ version: "v3", auth });

    const html = this.markdownService.toHtml(markdown, title);

    const res = await drive.files.create({
      requestBody: {
        name: title,
        mimeType: "application/vnd.google-apps.document",
        parents: folderId ? [folderId] : undefined,
      },
      media: {
        mimeType: "text/html",
        body: Readable.from([html]),
      },
      fields: "id, webViewLink",
    });

    const id = res.data.id;
    if (!id) throw new Error("Drive did not return a file id");

    return {
      id,
      url: res.data.webViewLink ?? `https://docs.google.com/document/d/${id}/edit`,
    };
  }
}
