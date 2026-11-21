import { expect, test } from "@playwright/test";

test("landing page points to the demo workspace", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /one question/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /explore the workspace/i })).toBeVisible();
});

test("demo chat streams a deterministic calculator answer", async ({ page }) => {
  await page.goto("/studio");
  await expect(page.getByText("Demo workspace")).toBeVisible();
  await page.getByLabel("Message OmniBrain").fill("What is 17 * 6?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("102", { exact: true })).toBeVisible();
});

test("memory controls show clearly marked examples", async ({ page }) => {
  await page.goto("/studio/memory");
  await expect(page.getByRole("heading", { name: "Memory controls" })).toBeVisible();
  await expect(page.getByText(/sample memories/i)).toBeVisible();
  await expect(page.getByText("Writing style")).toBeVisible();
});

test("mobile workspace avoids a horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/studio");
  const sizes = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: window.innerWidth }));
  expect(sizes.body).toBeLessThanOrEqual(sizes.viewport);
});
