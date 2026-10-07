import type { Nft } from '@/modules/catalog/domain/types'
import type { Wallet } from '@/modules/wallets/domain/types'
import type { Order } from '@/modules/orders/domain/types'
import { NFT_FIXTURES } from '../fixtures/nfts'

export interface DbUser {
  id: string
  email: string
  displayName: string
  username: string
  ens?: string
  walletAlias?: string
  avatarUrl?: string
  salt: string
  hash: string
}
export interface CartState {
  items: { nftId: string; edition: string; quantity: number }[]
  coupon?: string
}
export interface StoredOrder extends Order {
  ownerId: string
  createdMs: number
}
export interface Db {
  users: DbUser[]
  sessions: Record<string, string>
  favorites: Record<string, string[]>
  carts: Record<string, CartState>
  wallets: Record<string, Wallet[]>
  orders: Record<string, StoredOrder>
  idempotency: Record<string, { hash: string; orderId: string }>
  nfts: Nft[]
}

const KEY = 'kurio.mock.db.v1'

export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
export const hashPassword = (salt: string, password: string) => sha256(`${salt}:${password}`)

/** Credenciais fictícias (README): senha de ambos = Senha@123 */
async function seed(): Promise<Db> {
  const mk = async (id: string, email: string, displayName: string, username: string): Promise<DbUser> => {
    const salt = `salt-${id}`
    return { id, email, displayName, username, salt, hash: await hashPassword(salt, 'Senha@123') }
  }
  const ana = await mk('u-ana', 'ana@kurio.dev', 'Ana Colecionadora', 'ana')
  const bruno = await mk('u-bruno', 'bruno@kurio.dev', 'Bruno Criador', 'bruno')
  return {
    users: [ana, bruno],
    sessions: {},
    favorites: { 'u-ana': ['nft-001', 'nft-004'], 'u-bruno': [] },
    carts: {},
    wallets: {
      'u-ana': [
        { id: 'w-ana-1', label: 'MetaMask', address: '0xA91F3c5d8e12b7a4C09dE6f1A2b3C4d5E6f7E82C', network: 'Ethereum', kind: 'principal' },
        { id: 'w-ana-2', label: 'Coinbase Wallet', address: '0x5b2C9a7e1D40f8B3a6C2e9D1f0A4b7C8d3E1F9a0', network: 'Polygon', kind: 'secundaria' },
      ],
      'u-bruno': [{ id: 'w-bruno-1', label: 'MetaMask', address: '0x7d3E2f1A9c8B4e6D0a5C1b2F3e4D5c6B7a8E9f10', network: 'Ethereum', kind: 'principal' }],
    },
    orders: {},
    idempotency: {},
    nfts: structuredClone(NFT_FIXTURES),
  }
}

let state: Db | null = null

export async function initDb(opts: { reset?: boolean } = {}) {
  if (!opts.reset) {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        state = JSON.parse(raw) as Db
        return
      }
    } catch {
      /* usa seed */
    }
  }
  state = await seed()
  save()
}

export function db(): Db {
  if (!state) throw new Error('Mock DB não inicializado')
  return state
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage indisponível: o estado vive em memória */
  }
}
