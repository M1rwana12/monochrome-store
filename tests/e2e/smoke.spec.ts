import { test, expect } from '@playwright/test'

test('home shows hero heading and title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('MONOCHROME')
  await expect(page.getByRole('heading', { name: 'MONOCHROME', level: 1 })).toBeVisible()
})

test('catalog filters restore from URL (Ukrainian default)', async ({ page }) => {
  await page.goto('/catalog?category=accessories')
  await expect(page.getByText('3 товари')).toBeVisible()
  await expect(page.getByText('Beanie — Mono')).toBeVisible()
})

test('english version lives under /en', async ({ page }) => {
  await page.goto('/en/catalog?category=accessories')
  await expect(page.getByText('3 items')).toBeVisible()
  const switchToUk = page.getByRole('link', { name: 'Перейти на українську' })
  await expect(switchToUk).toBeVisible()
  await switchToUk.click()
  await expect(page).toHaveURL(/\/catalog\?category=accessories$/)
  await expect(page.getByText('3 товари')).toBeVisible()
})

test('add to cart requires size, then checkout completes', async ({ page }) => {
  await page.route('**/api/orders', route =>
    route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'MC-TEST01' }) }),
  )
  await page.goto('/product/p01')
  const addButton = page.getByRole('button', { name: /додати в кошик/i })

  await addButton.click()
  await expect(page.getByText('Спочатку обери розмір')).toBeVisible()

  await page.getByRole('button', { name: 'M', exact: true }).click()
  await addButton.click()

  const dialog = page.getByRole('dialog', { name: 'Кошик покупок' })
  await expect(dialog.getByText('Oversized Wool Coat')).toBeVisible()

  await dialog.getByRole('button', { name: 'Оформити' }).click()
  await dialog.getByLabel(/ім'я та прізвище/i).fill('Тест Тестенко')
  await dialog.getByLabel(/email/i).fill('test@example.com')
  await dialog.getByLabel(/адреса/i).fill('Київ, Хрещатик 1')
  await dialog.getByRole('button', { name: 'Підтвердити замовлення' }).click()

  await expect(dialog.getByText('Замовлення прийнято')).toBeVisible()
  await expect(dialog.getByText('MC-TEST01')).toBeVisible()
})

test('cart persists across reloads', async ({ page }) => {
  await page.goto('/product/p10') // single ONE size is auto-selected
  await page.getByRole('button', { name: /додати в кошик/i }).click()
  await page.getByRole('button', { name: 'Закрити кошик' }).click()
  await page.reload()
  await expect(page.getByText('Кошик (1)')).toBeVisible()
})

test('custom category filter updates URL and results', async ({ page }) => {
  await page.goto('/catalog')
  await page.getByRole('combobox', { name: 'Категорія' }).click()
  await page.getByRole('option', { name: 'Аксесуари' }).click()
  await expect(page).toHaveURL(/category=accessories/)
  await expect(page.getByText('3 товари')).toBeVisible()
})

test('favorites: heart on card adds item to saved page', async ({ page }) => {
  await page.goto('/catalog')
  await page.getByRole('button', { name: 'Зберегти' }).first().click()
  await page.getByRole('link', { name: 'Збережене' }).click()
  await expect(page.getByRole('heading', { name: 'Збережене' })).toBeVisible()
  await expect(page.locator('a[href^="/product/"]')).toHaveCount(1)
})

test('admin page gates with token and lists orders', async ({ page }) => {
  await page.route('**/api/orders', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'MC-AA11',
          createdAt: '2026-07-17T10:00:00.000Z',
          status: 'new',
          total: 290,
          customer: { name: 'Test User', email: 'test@example.com', address: 'Kyiv' },
          items: [{ id: 'p01', name: 'Oversized Wool Coat', size: 'M', qty: 1, price: 290 }],
        },
      ]),
    }),
  )
  await page.goto('/admin')
  await page.getByLabel(/access token/i).fill('secret')
  await page.getByRole('button', { name: /enter/i }).click()
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible()
  await expect(page.getByText('MC-AA11')).toBeVisible()
  await expect(page.getByText('Oversized Wool Coat (M) ×1')).toBeVisible()
})

test('account page shows login and register forms', async ({ page }) => {
  await page.goto('/account')
  await expect(page.getByRole('heading', { name: 'Кабінет' })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Пароль')).toBeVisible()
  await page.getByRole('button', { name: 'Реєстрація' }).click()
  await expect(page.getByLabel(/ім'я/i)).toBeVisible()
  await expect(page.getByText('+100 балів')).toBeVisible()
})

test('unknown route shows branded 404', async ({ page }) => {
  await page.goto('/nowhere')
  await expect(page.getByText('404')).toBeVisible()
  await expect(page.getByText('Сторінку не знайдено')).toBeVisible()
})
