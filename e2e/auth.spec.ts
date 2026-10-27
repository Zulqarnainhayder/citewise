import { expect, test } from "./fixtures";

test("signed-out visitors are sent to the login page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator("form").getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("a user can sign in with email and password, and sign out", async ({ page, user }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.locator('input[name="password"]').fill(user.password);
  await page.locator("form").getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "Documents" })).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login/);
});

test("a wrong password shows an error and stays on the login page", async ({ page, user }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.locator('input[name="password"]').fill("definitely-wrong-password");
  await page.locator("form").getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText(/invalid login credentials/i)).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});
