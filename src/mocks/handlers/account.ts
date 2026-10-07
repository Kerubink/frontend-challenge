import { http, HttpResponse } from 'msw'
import { db, hashPassword, save } from '../db/db'
import { networkConditions } from '../network/conditions'
import { currentUser, notFound, publicUser, unauthorized, validation } from './helpers'
import type { WalletInput } from '@/modules/wallets/domain/types'

const ADDRESS = /^0x[0-9a-fA-F]{40}$/

export const accountHandlers = [
  // Favoritos
  http.get('/api/favorites', async ({ request }) => {
    await networkConditions()
    const user = currentUser(request)
    return user ? HttpResponse.json(db().favorites[user.id] ?? []) : unauthorized()
  }),
  http.put('/api/favorites/:id', async ({ request, params }) => {
    await networkConditions()
    const user = currentUser(request)
    if (!user) return unauthorized()
    const list = (db().favorites[user.id] ??= [])
    if (!list.includes(params.id as string)) list.push(params.id as string)
    save()
    return HttpResponse.json(list)
  }),
  http.delete('/api/favorites/:id', async ({ request, params }) => {
    await networkConditions()
    const user = currentUser(request)
    if (!user) return unauthorized()
    db().favorites[user.id] = (db().favorites[user.id] ?? []).filter((x) => x !== params.id)
    save()
    return HttpResponse.json(db().favorites[user.id])
  }),

  // Perfil
  http.get('/api/profile', async ({ request }) => {
    await networkConditions()
    const user = currentUser(request)
    return user ? HttpResponse.json(publicUser(user)) : unauthorized()
  }),
  http.put('/api/profile', async ({ request }) => {
    await networkConditions()
    const user = currentUser(request)
    if (!user) return unauthorized()
    const b = (await request.json()) as Record<string, string | null | undefined>
    const fields: Record<string, string> = {}
    if (!b.displayName?.trim()) fields.displayName = 'Informe seu nome.'
    if (!b.username || !/^[a-z0-9_]{3,20}$/i.test(b.username)) fields.username = 'Use de 3 a 20 letras, números ou _.'
    if (!b.email || !/^\S+@\S+\.\S+$/.test(b.email)) fields.email = 'E-mail inválido.'
    if (b.ens && !/^[a-z0-9-]+$/i.test(b.ens)) fields.ens = 'Nome ENS inválido.'
    if (b.avatarUrl && b.avatarUrl.length > 700_000) fields.avatarUrl = 'Imagem muito grande (máx. ~500 KB).'
    if (Object.keys(fields).length) return validation(fields)
    if (db().users.some((u) => u.id !== user.id && u.email.toLowerCase() === b.email!.toLowerCase())) {
      return HttpResponse.json({ code: 'CONFLICT', message: 'Este e-mail já está em uso.', fields: { email: 'Este e-mail já está em uso.' } }, { status: 409 })
    }
    if (db().users.some((u) => u.id !== user.id && u.username.toLowerCase() === b.username!.toLowerCase())) {
      return HttpResponse.json({ code: 'CONFLICT', message: 'Este nome de usuário já existe.', fields: { username: 'Este nome de usuário já existe.' } }, { status: 409 })
    }
    Object.assign(user, {
      displayName: b.displayName!.trim(),
      username: b.username,
      email: b.email,
      ens: b.ens || undefined,
      walletAlias: b.walletAlias || undefined,
      avatarUrl: b.avatarUrl === null ? undefined : (b.avatarUrl ?? user.avatarUrl),
    })
    save()
    return HttpResponse.json(publicUser(user))
  }),
  http.put('/api/profile/password', async ({ request }) => {
    await networkConditions()
    const user = currentUser(request)
    if (!user) return unauthorized()
    const b = (await request.json()) as { current: string; next: string }
    if ((await hashPassword(user.salt, b.current ?? '')) !== user.hash) return validation({ current: 'Senha atual incorreta.' })
    if (!b.next || b.next.length < 8) return validation({ next: 'A nova senha deve ter ao menos 8 caracteres.' })
    user.hash = await hashPassword(user.salt, b.next)
    save()
    return new HttpResponse(null, { status: 204 })
  }),

  // Carteiras
  http.get('/api/wallets', async ({ request }) => {
    await networkConditions()
    const user = currentUser(request)
    return user ? HttpResponse.json(db().wallets[user.id] ?? []) : unauthorized()
  }),
  http.post('/api/wallets', async ({ request }) => {
    await networkConditions()
    const user = currentUser(request)
    if (!user) return unauthorized()
    const b = (await request.json()) as WalletInput
    const list = (db().wallets[user.id] ??= [])
    const err = validateWallet(b, list, undefined)
    if (err) return validation(err)
    const wallet = { id: `w-${crypto.randomUUID().slice(0, 8)}`, ...b }
    list.push(wallet)
    save()
    return HttpResponse.json(wallet, { status: 201 })
  }),
  http.put('/api/wallets/:id', async ({ request, params }) => {
    await networkConditions()
    const user = currentUser(request)
    if (!user) return unauthorized()
    const list = db().wallets[user.id] ?? []
    const idx = list.findIndex((w) => w.id === params.id)
    if (idx < 0) return notFound('Carteira não encontrada.')
    const b = (await request.json()) as WalletInput
    const err = validateWallet(b, list, params.id as string)
    if (err) return validation(err)
    list[idx] = { id: list[idx].id, ...b }
    save()
    return HttpResponse.json(list[idx])
  }),
]

function validateWallet(b: WalletInput, list: { id: string; kind: string; address: string }[], selfId?: string) {
  const fields: Record<string, string> = {}
  if (!b.label?.trim()) fields.label = 'Informe um nome para a carteira.'
  if (!b.address || !ADDRESS.test(b.address)) fields.address = 'Endereço inválido (0x + 40 caracteres hexadecimais).'
  if (!['Ethereum', 'Polygon'].includes(b.network)) fields.network = 'Selecione uma rede.'
  if (!['principal', 'secundaria'].includes(b.kind)) fields.kind = 'Selecione o tipo.'
  if (b.kind === 'principal' && list.some((w) => w.id !== selfId && w.kind === 'principal')) fields.kind = 'Já existe uma carteira principal.'
  if (b.kind === 'secundaria' && list.some((w) => w.id !== selfId && w.kind === 'secundaria')) fields.kind = 'Já existe uma carteira secundária.'
  if (b.address && list.some((w) => w.id !== selfId && w.address.toLowerCase() === b.address.toLowerCase())) fields.address = 'Esta carteira já está cadastrada.'
  return Object.keys(fields).length ? fields : null
}
