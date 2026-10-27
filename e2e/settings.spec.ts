import { randomUUID } from "node:crypto";
import { expect, test } from "./fixtures";

test("settings shows the account, usage and lets the user delete their data", async ({ page, user }) => {
  await user.signIn();
  await user.seedDocument("First");
  await user.seedDocument("Second");
  const chatId = randomUUID();
  await user.db.from("chats").insert({ id: chatId, user_id: user.id, title: "Old chat" });
  await user.db.from("messages").insert({ chat_id: chatId, user_id: user.id, role: "user", content: "hello" });

  await page.goto("/settings");
  await expect(page.getByTestId("account-email")).toHaveText(user.email);
  await expect(page.getByRole("progressbar", { name: "Questions asked" })).toHaveAttribute("aria-valuenow", "1");
  await expect(page.getByRole("progressbar", { name: "Documents processed" })).toHaveAttribute("aria-valuenow", "2");
  await expect(page.getByText("2 documents stored")).toBeVisible();
  await expect(page.getByText("1 chat stored")).toBeVisible();

  await page.getByRole("button", { name: "Delete all chats" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("All chats were deleted.")).toBeVisible();
  expect((await user.db.from("chats").select("id")).data).toHaveLength(0);

  await page.getByRole("button", { name: "Delete all documents" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("All documents were deleted.")).toBeVisible();
  expect((await user.db.from("documents").select("id")).data).toHaveLength(0);
});

test("the theme choice is applied and remembered", async ({ page, user }) => {
  await user.signIn();
  await page.goto("/settings");
  await page.getByRole("radio", { name: "Dark" }).first().click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("radio", { name: "Light" }).first().click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});
