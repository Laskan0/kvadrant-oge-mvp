import { expect } from '@playwright/test'

export async function completeBriefing(page) {
  await expect(page.getByRole('heading', { name: 'Перед стартом' })).toBeVisible()
  for (let step = 0; step < 3; step++) await page.getByRole('button', { name: 'Далее', exact: false }).click()
  await expect(page.getByRole('button', { name: 'Начать обучение' })).toBeVisible()
}
