import { makePdf } from "../eval/pdf.mjs";
import { expect, test } from "./fixtures";
import { makeScannedPdf } from "./scannedPdf";

// These tests call Gemini (embeddings, answers, OCR), so they are the slowest and the only
// ones that can be affected by the free quota. Each retries once in CI.

const filler = (tag: string) =>
  Array.from({ length: 6 }, (_, i) => `${tag} filler line ${i + 1}: background material about scope and review cycles.`);

const agreement = makePdf([
  ["Service Agreement", "This agreement covers consulting services between Acme GmbH and the client.", ...filler("Intro")],
  ["Termination", "Either party may terminate this agreement with thirty (30) days written notice.", ...filler("Term")],
  ["Payment terms", "Invoices are due within fourteen (14) days of receipt.", ...filler("Pay")],
]);

test("upload a PDF, ask a question, and open the cited page with the passage highlighted", async ({ page, user }) => {
  await user.signIn();
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles({
    name: "Service Agreement.pdf",
    mimeType: "application/pdf",
    buffer: agreement,
  });
  await expect(page.getByText("Ready", { exact: true })).toBeVisible({ timeout: 60_000 });

  await page.goto("/chat");
  await page.getByLabel("Your question").fill("How long is the notice period for termination?");
  await page.getByLabel("Your question").press("Enter");
  await expect(page.getByRole("log")).toContainText("30", { timeout: 45_000 });
  await expect(page.getByLabel("Stop generating")).toBeHidden({ timeout: 45_000 });

  await page.locator("sup button").first().click();
  await page.getByRole("button", { name: "View in PDF" }).click();
  const viewer = page.getByRole("complementary", { name: /PDF viewer/ });
  await expect(viewer).toContainText("Page 2 of 3", { timeout: 20_000 });
  await expect(page.locator("[data-highlight]").first()).toBeVisible({ timeout: 20_000 });

  // The chat is saved and listed under Recents.
  await expect(page).toHaveURL(/\/chat\/[0-9a-f-]{36}/);
  await expect(page.getByRole("navigation", { name: "Main" }).first()).toBeVisible();
});

test("a question the document cannot answer is refused instead of invented", async ({ page, user }) => {
  await user.signIn();
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles({
    name: "Service Agreement.pdf",
    mimeType: "application/pdf",
    buffer: agreement,
  });
  await expect(page.getByText("Ready", { exact: true })).toBeVisible({ timeout: 60_000 });

  await page.goto("/chat");
  await page.getByLabel("Your question").fill("What is the capital of Australia?");
  await page.getByLabel("Your question").press("Enter");
  await expect(page.getByRole("log")).toContainText("couldn't find that in your documents", { timeout: 45_000 });
});

test("a scanned PDF (pictures only) is read with OCR and can be asked about", async ({ page, user }) => {
  await user.signIn();
  const scan = await makeScannedPdf(page, [
    ["Warranty Terms", "The warranty period is twenty-four months from the date of delivery."],
    ["Returns", "Unopened items may be returned within forty-five days for a full refund."],
  ]);
  await page.setViewportSize({ width: 1400, height: 900 });

  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles({
    name: "Scanned Warranty.pdf",
    mimeType: "application/pdf",
    buffer: scan,
  });
  await expect(page.getByText("Ready", { exact: true })).toBeVisible({ timeout: 80_000 });

  await page.goto("/chat");
  await page.getByLabel("Your question").fill("How many days do I have to return unopened items?");
  await page.getByLabel("Your question").press("Enter");
  await expect(page.getByRole("log")).toContainText(/45|forty-five/i, { timeout: 45_000 });
});
