import { test, expect } from '@playwright/test'

test('home shows hero heading and title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('MONOCHROME')
  await expect(page.getByRole('heading', { name: 'MONOCHROME', level: 1 })).toBeVisible()
})

test('catalog filters restore from URL', async ({ page }) => {
  await page.goto('/catalog?category=accessories')
  await expect(page.getByText('3 items')).toBeVisible()
  await expect(page.getByText('Beanie — Mono')).toBeVisible()
})

test('add to cart requires size, then checkout completes', async ({ page }) => {
  await page.goto('/product/p01')
  const addButton = page.getByRole('button', { name: /add to cart/i })

  await addButton.click()
  await expect(page.getByText('Select a size first')).toBeVisible()

  await page.getByRole('button', { name: 'M', exact: true }).click()
  await addButton.click()

  const dialog = page.getByRole('dialog', { name: /shopping cart/i })
  await expect(dialog.getByText('Oversized Wool Coat')).toBeVisible()
  await expect(dialog.getByText('$290').last()).toBeVisible()

  await dialog.getByRole('button', { name: /checkout/i }).click()
  await dialog.getByLabel(/full name/i).fill('Test User')
  await dialog.getByLabel(/email/i).fill('test@example.com')
  await dialog.getByLabel(/address/i).fill('Kyiv, Ukraine')
  await dialog.getByRole('button', { name: /place order/i }).click()

  await expect(dialog.getByText('Order placed')).toBeVisible()
})

test('cart persists across reloads', async ({ page }) => {
  await page.goto('/product/p10') // single ONE size is auto-selected
  await page.getByRole('button', { name: /add to cart/i }).click()
  await page.getByRole('button', { name: 'Close cart' }).click()
  await page.reload()
  await expect(page.getByText('Cart (1)')).toBeVisible()
})

test('unknown route shows branded 404', async ({ page }) => {
  await page.goto('/nowhere')
  await expect(page.getByText('404')).toBeVisible()
  await expect(page.getByText(/page not found/i)).toBeVisible()
})
