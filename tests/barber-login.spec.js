import { test, expect } from "@playwright/test";

test.describe("Barber Login Flow", () => {
  test("should login successfully and load the dashboard", async ({ page }) => {
    // Navigate to live server
    await page.goto("https://barbyo.vercel.app/login");

    // Make sure we are on the Sign In tab (not Sign Up)
    const toggleButton = page.getByRole("button", {
      name: /sign in/i,
      exact: true,
    });
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
    }

    // Wait for the email input to be visible
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();

    // Fill credentials
    await emailInput.fill("example@gmail.come");
    await page.locator('input[name="password"]').fill("12345678");

    // Submit login
    const submitButton = page.getByRole("button", {
      name: "Sign In",
      exact: true,
    });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Verify it redirects to the Dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Verify the dashboard content loads (proving there is no infinite loader)
    // The DashboardPage has a "Welcome back" or "Overview" header
    await expect(page.getByRole("heading", { name: /overview/i })).toBeVisible({
      timeout: 15000,
    });

    // Check that we can see the Upcoming Appointments section
    await expect(page.getByText("Upcoming Appointments")).toBeVisible();
  });
});
