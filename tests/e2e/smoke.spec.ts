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

test('halaman undangan dapat dibuka dan splash screen bekerja', async ({
  page,
}) => {
  const fatalErrors: string[] = [];
  page.on('pageerror', (error) => fatalErrors.push(error.message));
  await page.goto('/invite/nathan-dan-aulia?to=Bapak%20Andi%20dan%20Keluarga', {
    waitUntil: 'domcontentloaded',
  });
  await expect(
    page.getByText('Bapak Andi dan Keluarga', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Buka Undangan' }).click();
  await expect(page.getByText('Save the date', { exact: false })).toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
  expect(fatalErrors).toEqual([]);
});

test('halaman admin terlindungi dan login env berhasil', async ({ page }) => {
  const metadata = test.info().config.metadata as {
    e2eAdminEmail: string;
    e2eAdminPassword: string;
  };

  await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel('Email admin').fill(metadata.e2eAdminEmail);
  await page.getByLabel('Password').fill(metadata.e2eAdminPassword);
  await page.getByRole('button', { name: 'Masuk ke Dashboard' }).click();
  await expect(page).toHaveURL(/\/admin(?:\?tab=dashboard)?$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('admin dapat memilih tema dan melihat preview langsung', async ({
  page,
}) => {
  const metadata = test.info().config.metadata as {
    e2eAdminEmail: string;
    e2eAdminPassword: string;
  };

  await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email admin').fill(metadata.e2eAdminEmail);
  await page.getByLabel('Password').fill(metadata.e2eAdminPassword);
  await page.getByRole('button', { name: 'Masuk ke Dashboard' }).click();
  await page.getByRole('button', { name: 'Tema & UI/UX Layout' }).click();
  await expect(
    page.getByRole('heading', { name: 'Pilih tema siap pakai' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Modern Botanical/ }),
  ).toBeVisible();
  await page.getByRole('button', { name: /Romantic Blush/ }).click();
  await expect(
    page.getByText('Romantic Blush', { exact: true }).last(),
  ).toBeVisible();
  await expect(
    page.getByText(/Romantic Blush \+ Cinematic Editorial/),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Simpan', exact: true }).click();
  await expect(page.getByText(/Draft tersimpan di browser/)).toBeVisible();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Tema & UI/UX Layout' }).click();
  await expect(
    page.getByRole('button', { name: /Romantic Blush/ }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/invite/nathan-dan-aulia?to=Preview%20Tema', {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.locator('main.wedding-theme')).toHaveAttribute(
    'data-theme-preset',
    'romantic-blush',
  );
});

test('admin dapat memilih satu dari lima UI/UX layout dan menerapkannya', async ({
  page,
}) => {
  const metadata = test.info().config.metadata as {
    e2eAdminEmail: string;
    e2eAdminPassword: string;
  };

  await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email admin').fill(metadata.e2eAdminEmail);
  await page.getByLabel('Password').fill(metadata.e2eAdminPassword);
  await page.getByRole('button', { name: 'Masuk ke Dashboard' }).click();
  await page.getByRole('button', { name: 'Tema & UI/UX Layout' }).click();

  await expect(
    page.getByRole('heading', { name: 'Pilih UI/UX layout' }),
  ).toBeVisible();
  await expect(page.locator('[data-testid^="layout-option-"]')).toHaveCount(5);
  await page.getByTestId('layout-option-modern-minimal').click();
  await expect(
    page.getByTestId('layout-option-modern-minimal'),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Simpan', exact: true }).click();
  await expect(page.getByText(/Draft tersimpan di browser/)).toBeVisible();

  await page.goto('/invite/nathan-dan-aulia?to=Preview%20Layout', {
    waitUntil: 'domcontentloaded',
  });
  const invitation = page.locator('main.wedding-theme');
  await expect(invitation).toHaveAttribute(
    'data-layout-preset',
    'modern-minimal',
  );
  await expect(invitation).toHaveAttribute('data-cover-style', 'door');
  await expect(invitation).toHaveAttribute('data-gallery-style', 'slideshow');
  await expect(invitation).toHaveAttribute('data-story-style', 'polaroid');
  await page.getByRole('button', { name: 'Buka Undangan' }).click();
  await expect(
    page.locator('[data-navigation-variant="menu-button"]'),
  ).toBeVisible();
  await expect(page.locator('[data-gallery-layout="slideshow"]')).toBeVisible();
  await expect(page.locator('[data-story-layout="polaroid"]')).toBeVisible();
});

test('RSVP dapat disubmit dalam mode demo tanpa database', async ({ page }) => {
  await page.goto('/invite/nathan-dan-aulia?to=Tamu%20Playwright', {
    waitUntil: 'domcontentloaded',
  });
  await page.getByRole('button', { name: 'Buka Undangan' }).click();
  await page.getByLabel('Nama tamu').fill('Tamu Playwright');
  await page.getByLabel('Konfirmasi kehadiran').selectOption('hadir');
  await page.getByLabel('Jumlah tamu').fill('2');
  await page
    .getByLabel('Ucapan dan doa')
    .fill('Semoga menjadi keluarga yang selalu bahagia.');
  await page.getByRole('button', { name: 'Kirim Konfirmasi' }).click();
  await expect(page.getByText(/RSVP tersimpan di perangkat ini/)).toBeVisible();
});

test('Our Story tampil dengan chapter foto dan dapat dikelola dari admin', async ({
  page,
}) => {
  const metadata = test.info().config.metadata as {
    e2eAdminEmail: string;
    e2eAdminPassword: string;
  };

  await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email admin').fill(metadata.e2eAdminEmail);
  await page.getByLabel('Password').fill(metadata.e2eAdminPassword);
  await page.getByRole('button', { name: 'Masuk ke Dashboard' }).click();
  await page.getByRole('button', { name: 'Our Story' }).click();
  await expect(
    page.getByRole('heading', { name: 'Our Story sinematik' }),
  ).toBeVisible();
  await expect(page.getByText(/Efek otomatis:/)).toBeVisible();

  const firstStoryImage = page.getByLabel('URL foto').first();
  await firstStoryImage.fill('/images/luxury-placeholder.svg');
  await page.getByRole('button', { name: 'Simpan', exact: true }).click();
  await expect(page.getByText(/Draft tersimpan di browser/)).toBeVisible();

  await page.goto('/invite/nathan-dan-aulia?to=Preview%20Our%20Story', {
    waitUntil: 'domcontentloaded',
  });
  await page.getByRole('button', { name: 'Buka Undangan' }).click();
  const storySection = page.getByTestId('our-story-section');
  await storySection.scrollIntoViewIfNeeded();
  await expect(storySection).toBeVisible();
  await expect(
    storySection.getByText('Our Story', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('[data-story-chapter]')).toHaveCount(4);
  await expect(
    page.locator('[data-story-chapter="1"] img').first(),
  ).toHaveAttribute('src', /luxury-placeholder\.svg/);
});
