import { expect, test } from "./fixtures";

test("the library lists, searches and deletes documents", async ({ page, user }) => {
  await user.signIn();
  await user.seedDocument("Service Agreement");
  await user.seedDocument("Employee Handbook");

  await page.goto("/");
  await expect(page.getByText("Service Agreement")).toBeVisible();
  await expect(page.getByText("Employee Handbook")).toBeVisible();

  await page.getByLabel("Search documents").fill("handbook");
  await expect(page.getByText("Service Agreement")).toBeHidden();
  await expect(page.getByText("Employee Handbook")).toBeVisible();
  await page.getByLabel("Search documents").fill("");

  await page.getByRole("button", { name: "Delete Employee Handbook" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete document" }).click();
  await expect(page.getByRole("list").getByText("Employee Handbook")).toBeHidden();
  expect((await user.db.from("documents").select("id")).data).toHaveLength(1);
});
