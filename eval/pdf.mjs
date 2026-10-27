// A tiny PDF writer for the evaluation fixtures: one text-only page per array.
// Text uses WinAnsi encoding so German umlauts come out right.

const escape = (text) => text.replace(/[\\()]/g, "\\$&");

/** @param {string[][]} pages  each page is a list of lines */
export function makePdf(pages) {
  const objects = [];
  const add = (body) => objects.push(body) && objects.length;

  add("<< /Type /Catalog /Pages 2 0 R >>");
  add(`<< /Type /Pages /Kids [${pages.map((_, i) => `${4 + i * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`);
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");

  for (const lines of pages) {
    const stream = `BT /F1 11 Tf 14 TL 40 760 Td ${lines.map((line) => `(${escape(line)}) Tj T*`).join(" ")} ET`;
    const pageObject = objects.length + 1;
    add(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${pageObject + 1} 0 R /Resources << /Font << /F1 3 0 R >> >> >>`,
    );
    add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  }

  let out = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  out += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(out, "latin1");
}
