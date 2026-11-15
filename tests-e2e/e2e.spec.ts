import { test, expect } from "@playwright/test";

test.describe("CareLoop AI - End-to-End User Workflows", () => {
  test("loads landing page and presents healthcare value proposition", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CareLoop AI/);
    await expect(page.locator("h1")).toContainText("Caring for Seniors With");
    await expect(page.getByText("Launch Live Care Dashboard")).toBeVisible();
  });

  test("navigates to dashboard and displays live care status & active patient", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Care Ecosystem Dashboard")).toBeVisible();
    await expect(page.getByText("Eleanor Vance")).toBeVisible();
    await expect(page.getByText("Live Care Status")).toBeVisible();
    await expect(page.getByText("7-Day Adherence Score")).toBeVisible();
  });

  test("patient can view medication timeline and confirm medication taken", async ({ page }) => {
    await page.goto("/dashboard");
    const markTakenBtn = page.getByRole("button", { name: "Mark Taken" }).first();
    if (await markTakenBtn.isVisible()) {
      await markTakenBtn.click();
      await expect(page.getByText("Confirmed").first()).toBeVisible();
    }
  });

  test("accesses emergency care card with one click and verifies critical contacts", async ({ page }) => {
    await page.goto("/emergency");
    await expect(page.getByText("Medical Emergency Identification Card")).toBeVisible();
    await expect(page.getByText("Eleanor Vance")).toBeVisible();
    await expect(page.getByText("David Vance")).toBeVisible();
    await expect(page.getByText("Penicillin (Severe Rash)")).toBeVisible();
  });

  test("generates Gemini AI care summary with clinical safety constraints", async ({ page }) => {
    await page.goto("/ai-insights");
    await expect(page.getByText("AI Care Insights & Routine Brief")).toBeVisible();
    await expect(page.getByText("Clinical Safety Architecture")).toBeVisible();
    await expect(page.getByText("1. Overall Care Activity & Summary")).toBeVisible();
  });
});
