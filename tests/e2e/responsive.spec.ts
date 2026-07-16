import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/*', async (route) => {
    const type = route.request().resourceType();
    if (type === 'image' || type === 'media' || type === 'font') {
      await route.abort();
      return;
    }
    await route.continue();
  });
});

const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`tidak ada horizontal overflow pada ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/invite/nathan-dan-aulia?to=Tamu%20Responsif', {
      waitUntil: 'domcontentloaded',
    });
    await page.getByRole('button', { name: 'Buka Undangan' }).click();
    await expect(
      page.getByText('Save the date', { exact: false }),
    ).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      bodyWidth: document.body.scrollWidth,
    }));

    expect(dimensions.documentWidth).toBeLessThanOrEqual(
      dimensions.viewportWidth + 1,
    );
    expect(dimensions.bodyWidth).toBeLessThanOrEqual(
      dimensions.viewportWidth + 1,
    );
  });
}
