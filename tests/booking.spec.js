import { test, expect } from "@playwright/test";

test.describe("Barber Booking Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the live landing page
    await page.goto("https://barbyo.vercel.app/");
  });

  test("should allow a client to browse and initiate booking", async ({
    page,
  }) => {
    // 1. Landing Page -> Click "I am a Client"
    const bookButton = page
      .getByRole("link", { name: /i am a client/i })
      .first();
    await expect(bookButton).toBeVisible();
    await bookButton.click();

    // 2. Client Page
    // Expected URL after click
    await expect(page).toHaveURL(/.*\/client/);

    // Check that we see the "Find Your Perfect Cut" heading
    await expect(
      page.getByRole("heading", { name: /find your perfect cut/i }),
    ).toBeVisible();

    // Check that the page successfully loads barbers (loader goes away)
    // First, verify the loading state if possible or wait for the grid to appear
    const barberCards = page.locator(".gsap-card");
    await barberCards.first().waitFor({ state: "visible", timeout: 10000 });

    // Ensure we have at least one barber card
    const count = await barberCards.count();
    expect(count).toBeGreaterThan(0);

    // 3. Click the first barber card
    await barberCards.first().click();

    // 4. Booking Page
    await expect(page).toHaveURL(/.*\/book\/.*/);

    // Verify the "Your Booking" header appears, meaning the booking page loaded without infinite loading
    await expect(page.getByText("Your Booking")).toBeVisible({
      timeout: 10000,
    });

    // Select first available time
    const timeSlot = page.locator(".grid.grid-cols-3 button").first();
    await expect(timeSlot).toBeVisible();
    await timeSlot.click();

    // Fill in Guest Details
    await page.getByPlaceholder("Full Name").fill("Test User");
    await page.getByPlaceholder("Phone Number").fill("1234567890");

    // Submit booking
    const confirmButton = page.getByRole("button", {
      name: /book for/i,
    });
    await expect(confirmButton).toBeEnabled();
    // We don't actually click submit in the smoke test to avoid polluting the DB,
    // but we know the form reached an actionable state.
  });
});
