import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";
import { createReadStream, createWriteStream, ReadStream } from "node:fs";
import { mkdir, rename, stat, unlink } from "node:fs/promises";
import { finished } from "node:stream/promises";
import * as path from "node:path";
import PDFDocumentConstructor = require("pdfkit");

@Injectable()
export class InvoicePdfStorageService {
  private readonly storageRoot: string;

  constructor(configService: ConfigService) {
    this.storageRoot = path.resolve(
      configService.get<string>(
        "INVOICE_PDF_STORAGE_PATH",
        "./storage/invoices",
      ),
    );
  }

  async writePdf(
    shopId: string,
    invoiceId: string,
    render: (document: PDFKit.PDFDocument) => void,
  ): Promise<string> {
    this.assertSafeIdentifier(shopId);
    this.assertSafeIdentifier(invoiceId);

    const relativePath = path.posix.join(shopId, `${invoiceId}.pdf`);
    const absolutePath = this.resolveStoredPath(relativePath);
    const temporaryPath = `${absolutePath}.${randomUUID()}.tmp`;
    await mkdir(path.dirname(absolutePath), { recursive: true });

    const document = new PDFDocumentConstructor({ size: "A4", margin: 48 });
    const output = createWriteStream(temporaryPath, { flags: "w" });
    document.pipe(output);

    try {
      render(document);
      document.end();
      await finished(output);
      await rename(temporaryPath, absolutePath);
      return relativePath;
    } catch (error) {
      output.destroy();
      document.end();
      await unlink(temporaryPath).catch(() => undefined);
      throw error;
    }
  }

  async exists(relativePath: string): Promise<boolean> {
    try {
      const details = await stat(this.resolveStoredPath(relativePath));
      return details.isFile();
    } catch {
      return false;
    }
  }

  async open(relativePath: string): Promise<{
    stream: ReadStream;
    size: number;
  }> {
    const absolutePath = this.resolveStoredPath(relativePath);
    const details = await stat(absolutePath);
    if (!details.isFile()) {
      throw new Error("Invoice PDF path is not a file");
    }

    return {
      stream: createReadStream(absolutePath),
      size: details.size,
    };
  }

  private resolveStoredPath(relativePath: string): string {
    const absolutePath = path.resolve(this.storageRoot, relativePath);
    const rootPrefix = `${this.storageRoot}${path.sep}`;
    if (!absolutePath.startsWith(rootPrefix)) {
      throw new Error("Invalid invoice PDF path");
    }
    return absolutePath;
  }

  private assertSafeIdentifier(value: string): void {
    if (!/^[A-Za-z0-9_-]+$/.test(value)) {
      throw new Error("Invalid invoice PDF identifier");
    }
  }
}
