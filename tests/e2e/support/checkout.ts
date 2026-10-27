import { expect, type Page } from '@playwright/test'

export const NFT_ID = 'nft-002'
const EDITIONS = [
  { label: '1/1', available: 0 },
  { label: '1/10', available: 5 },
  { label: '1/50', available: 5 },
]

/** Chama o "backend" dos mocks pela rede (service worker do MSW), como qualquer fetch da aplicação. */
async function post(page: Page, path: string, body: unknown) {
  return page.evaluate(
    async ([url, payload]) => {
      const res = await fetch(url as string, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      return res.status
    },
    [path, body] as const,
  )
}

/** Muda preço/disponibilidade no banco dos mocks. `silent` não emite `nft.updated` (a UI só descobre pelo REST). */
export async function changeNft(page: Page, patch: { priceEth?: string; silent?: boolean }) {
  expect(await post(page, `/api/__mock__/nfts/${NFT_ID}`, { editions: EDITIONS, ...patch })).toBe(200)
}

/** Publica um evento já montado pelo servidor Socket.IO simulado (duplicado ou antigo), sem tocar no banco. */
export async function publishRawEvent(page: Page, event: unknown) {
  expect(await post(page, '/api/__mock__/events', event)).toBe(202)
}

/** Estado limpo → login → 2 unidades do NFT a 1.00 ETH no carrinho → revisão do pedido no Checkout. */
export async function reachReview(page: Page) {
  await page.goto('/?reset=1')
  await expect(page.getByText('Tempo real: conectado')).toBeVisible()
  await changeNft(page, { priceEth: '1.00' })

  await page.getByRole('link', { name: 'Entrar', exact: true }).click()
  await page.getByLabel('E-mail').fill('ana@kurio.dev')
  await page.getByLabel('Senha').fill('Senha@123')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Sair' })).toBeVisible()

  await page.goto(`/nfts/${NFT_ID}`)
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await expect(page.getByText('Adicionado ao carrinho.')).toBeVisible()
  await expect(page.getByText('Tempo real: conectado')).toBeVisible()

  await page.getByRole('link', { name: /Carrinho/ }).click()
  await page.getByRole('link', { name: 'Conectar e finalizar' }).click()
  await expect(page.getByRole('heading', { name: 'Pagamento' })).toBeVisible()
  await expect(summary(page).total).toHaveText('2.016 ETH')

  await page.getByLabel('Rede').selectOption('Ethereum')
  await page.getByRole('radio', { name: /MetaMask/ }).check()
  await page.getByRole('button', { name: 'Conectar carteira' }).click()
  await expect(page.getByText('Carteira conectada.')).toBeVisible()
  await page.getByRole('button', { name: 'Revisar pedido' }).click()
  await expect(page.getByRole('heading', { name: 'Revise seu pedido' })).toBeVisible()
}

/** Resumo da cotação (subtotal, taxa de rede e total) como o colecionador o vê. */
export function summary(page: Page) {
  const row = (term: string) => page.locator('dl > div').filter({ has: page.getByText(term, { exact: false }) }).locator('dd').last()
  return { subtotal: row('Subtotal'), fee: row('Taxa de rede'), total: row('Total') }
}

export const notice = (page: Page) => page.getByTestId('quote-change-notice')
export const confirmButton = (page: Page) => page.getByRole('button', { name: /Confirmar/ })
