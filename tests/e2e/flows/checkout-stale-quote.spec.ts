import { expect, test } from '@playwright/test'
import { NFT_ID, changeNft, confirmButton, notice, publishRawEvent, reachReview, summary } from '../support/checkout'

// Cenários BDD de docs/cotacao-desatualizada-no-checkout-spec.md. Cada teste parte de estado isolado (?reset=1).

test('preço muda com o carrinho aberto', async ({ page }) => {
  await reachReview(page)
  await expect(summary(page).total).toHaveText('2.016 ETH')

  // O preço muda no "backend" e a notícia chega ao app pelo socket.io-client.
  await changeNft(page, { priceEth: '1.20' })

  await expect(notice(page)).toBeVisible()
  await expect(notice(page)).toContainText('1.00 ETH')
  await expect(notice(page)).toContainText('1.20 ETH')
  await expect(summary(page).subtotal).toHaveText('2.40 ETH')
  await expect(summary(page).fee).toHaveText('0.016 ETH')
  await expect(summary(page).total).toHaveText('2.416 ETH')

  // Só pode enviar depois de nova confirmação do colecionador.
  await expect(confirmButton(page)).toBeDisabled()
  await page.getByRole('button', { name: 'Aceitar novo total' }).click()
  await expect(notice(page)).toBeHidden()
  await expect(confirmButton(page)).toBeEnabled()
})

test('confirmar com a cotação antiga não cria pedido (erro)', async ({ page }) => {
  await reachReview(page)
  await expect(summary(page).total).toHaveText('2.016 ETH')

  // Mudança que o app ainda não sabe (sem evento): só a API rejeita a cotação antiga.
  await changeNft(page, { priceEth: '1.20', silent: true })
  await expect(summary(page).total).toHaveText('2.016 ETH')
  await confirmButton(page).click()

  await expect(summary(page).total).toHaveText('2.416 ETH')
  await expect(notice(page)).toBeVisible()
  await expect(page).toHaveURL(/\/checkout/)
  await expect(page.getByText('(x 2)')).toBeVisible() // os 2 itens continuam no carrinho
  await expect(confirmButton(page)).toBeDisabled()

  // Nenhum pedido foi gravado no banco dos mocks.
  const orders = await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('kurio.mock.db.v1') ?? '{}').orders ?? {}))
  expect(orders).toEqual([])
})

test('notícia mais antiga que o estado exibido é ignorada (limite)', async ({ page }) => {
  await reachReview(page)
  await changeNft(page, { priceEth: '1.20' })
  await expect(summary(page).total).toHaveText('2.416 ETH')
  const before = await notice(page).innerText()

  // Notícia com versão anterior à já exibida, dizendo que o preço era 1.10.
  const ignored = page.waitForEvent('console', (m) => m.type() === 'debug' && m.text().includes('ignorado (stale)'))
  await publishRawEvent(page, {
    id: 'evt-antigo-v2',
    type: 'nft.updated',
    resource: { type: 'nft', id: NFT_ID },
    version: 2,
    occurredAt: new Date().toISOString(),
    data: { priceEth: '1.10', editions: [{ label: '1/10', available: 5 }] },
  })
  await ignored // o app recebeu pelo socket e descartou

  await expect(summary(page).subtotal).toHaveText('2.40 ETH')
  await expect(summary(page).total).toHaveText('2.416 ETH')
  await expect(page.getByTestId('quote-change-notice')).toHaveCount(1)
  expect(await notice(page).innerText()).toBe(before) // nenhum aviso novo

  // Depois de aceitar o novo total, a notícia antiga também não reabre o aviso.
  await page.getByRole('button', { name: 'Aceitar novo total' }).click()
  await expect(notice(page)).toBeHidden()
  const ignoredAgain = page.waitForEvent('console', (m) => m.type() === 'debug' && m.text().includes('ignorado'))
  await publishRawEvent(page, {
    id: 'evt-antigo-v1',
    type: 'nft.updated',
    resource: { type: 'nft', id: NFT_ID },
    version: 1,
    occurredAt: new Date().toISOString(),
    data: { priceEth: '0.90', editions: [{ label: '1/10', available: 5 }] },
  })
  await ignoredAgain
  await expect(notice(page)).toBeHidden()
  await expect(summary(page).total).toHaveText('2.416 ETH')
})
