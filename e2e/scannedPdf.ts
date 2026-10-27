import type { Page } from "@playwright/test";

/**
 * Builds a scanned-looking PDF: every page is one JPEG picture of the text, with no text layer,
 * so only OCR can read it. The pictures are screenshots of a page rendered in the browser.
 */
export async function makeScannedPdf(page: Page, pageLines: string[][]): Promise<Buffer> {
  await page.setViewportSize({ width: 816, height: 1056 });
  const jpegs: Buffer[] = [];
  for (const lines of pageLines) {
    await page.setContent(
      `<body style="margin:0;padding:60px;font:30px Georgia;line-height:1.6;background:#fff;color:#111;box-sizing:border-box;width:816px;height:1056px">` +
        lines.map((line) => `<p style="margin:0 0 14px">${line}</p>`).join("") +
        `</body>`,
    );
    jpegs.push(await page.screenshot({ type: "jpeg", quality: 85 }));
  }

  const parts: Buffer[] = [];
  const offsets: number[] = [];
  let length = 0;
  const push = (data: Buffer | string) => {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, "latin1");
    parts.push(buffer);
    length += buffer.length;
  };
  const object = (n: number, body: string) => {
    offsets[n] = length;
    push(`${n} 0 obj\n${body}\nendobj\n`);
  };

  push("%PDF-1.4\n");
  object(1, "<< /Type /Catalog /Pages 2 0 R >>");
  object(2, `<< /Type /Pages /Kids [${jpegs.map((_, i) => `${3 + i * 3} 0 R`).join(" ")}] /Count ${jpegs.length} >>`);
  jpegs.forEach((jpeg, i) => {
    const pageObject = 3 + i * 3;
    const contents = pageObject + 1;
    const image = pageObject + 2;
    object(
      pageObject,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contents} 0 R /Resources << /XObject << /Im0 ${image} 0 R >> >> >>`,
    );
    const stream = "q 612 0 0 792 0 0 cm /Im0 Do Q";
    object(contents, `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    offsets[image] = length;
    push(
      `${image} 0 obj\n<< /Type /XObject /Subtype /Image /Width 816 /Height 1056 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
    );
    push(jpeg);
    push("\nendstream\nendobj\n");
  });

  const total = 3 + jpegs.length * 3;
  const xref = length;
  push(`xref\n0 ${total}\n0000000000 65535 f \n`);
  for (let i = 1; i < total; i++) push(`${String(offsets[i]).padStart(10, "0")} 00000 n \n`);
  push(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return Buffer.concat(parts);
}
