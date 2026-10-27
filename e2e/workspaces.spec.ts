import { expect, test } from "./fixtures";

test("create, rename, file a document into, chat scope and delete a workspace", async ({ page, user }) => {
  await user.signIn();
  const alphaId = await user.seedDocument("Alpha Contract");
  await user.seedDocument("Beta Report");

  // Create
  await page.goto("/workspaces");
  await expect(page.getByText("No workspaces yet")).toBeVisible();
  await page.getByLabel("Workspace name").fill("  Alpha   Project ");
  await page.getByRole("button", { name: "Create workspace" }).click();
  const card = page.getByTestId("workspace-card");
  await expect(card.getByRole("heading", { name: "Alpha Project" })).toBeVisible();

  // Duplicate names are refused
  await page.getByLabel("Workspace name").first().fill("alpha project");
  await page.getByRole("button", { name: "Create workspace" }).click();
  await expect(page.getByText("already have a workspace")).toBeVisible();
  await expect(page.getByTestId("workspace-card")).toHaveCount(1);

  // Rename
  await card.getByRole("button", { name: "Rename" }).click();
  await card.getByLabel("Workspace name").fill("Alpha Renamed");
  await card.getByLabel("Save name").click();
  await expect(card.getByRole("heading", { name: "Alpha Renamed" })).toBeVisible();

  // File a document into the workspace from the Documents page
  await page.goto("/");
  await page.getByLabel("Workspace for Alpha Contract").selectOption({ label: "Alpha Renamed" });
  await expect
    .poll(async () => (await user.db.from("documents").select("workspace_id").eq("id", alphaId).single()).data?.workspace_id)
    .not.toBeNull();

  await page.goto("/workspaces");
  await expect(card).toContainText("1 document");
  await expect(card).toContainText("Alpha Contract");

  // Chatting with the workspace limits the searched documents to it
  await card.getByRole("link", { name: "Chat with workspace" }).click();
  await expect(page).toHaveURL(/\/chat\?workspace=/);
  const chips = page.locator("button[aria-pressed]");
  await expect(chips).toHaveCount(1);
  await expect(chips.first()).toContainText("Alpha Contract");
  await page.getByLabel("Workspace to search").selectOption({ label: "All documents" });
  await expect(chips).toHaveCount(2);

  // Deleting the workspace keeps its documents
  await page.goto("/workspaces");
  await page.getByRole("button", { name: /Delete workspace/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete workspace" }).click();
  await expect(page.getByText("No workspaces yet")).toBeVisible();
  const { data: doc } = await user.db.from("documents").select("workspace_id").eq("id", alphaId).single();
  expect(doc?.workspace_id).toBeNull();
});

test("the phone layout has all four navigation tabs and does not scroll sideways", async ({ page, user }) => {
  await user.signIn();
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/workspaces");

  const nav = page.getByRole("navigation", { name: "Main" }).filter({ visible: true });
  await expect(nav.getByRole("link")).toHaveCount(4);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
