import { http, HttpResponse } from 'msw'
import { db, hashPassword, save } from '../db/db'
import { networkConditions } from '../network/conditions'
import { currentUser, publicUser, unauthorized, validation } from './helpers'

export const authHandlers = [
  http.post('/api/auth/register', async ({ request }) => {
    await networkConditions()
    const b = (await request.json()) as Record<string, string>
    const fields: Record<string, string> = {}
    if (!b.displayName?.trim()) fields.displayName = 'Informe seu nome.'
    if (!b.username?.trim() || !/^[a-z0-9_]{3,20}$/i.test(b.username)) fields.username = 'Use de 3 a 20 letras, números ou _.'
    if (!b.email || !/^\S+@\S+\.\S+$/.test(b.email)) fields.email = 'E-mail inválido.'
    if (!b.password || b.password.length < 8) fields.password = 'A senha deve ter ao menos 8 caracteres.'
    if (Object.keys(fields).length) return validation(fields)
    if (db().users.some((u) => u.email.toLowerCase() === b.email.toLowerCase())) {
      return HttpResponse.json({ code: 'CONFLICT', message: 'Este e-mail já está cadastrado.', fields: { email: 'Este e-mail já está cadastrado.' } }, { status: 409 })
    }
    if (db().users.some((u) => u.username.toLowerCase() === b.username.toLowerCase())) {
      return HttpResponse.json({ code: 'CONFLICT', message: 'Este nome de usuário já existe.', fields: { username: 'Este nome de usuário já existe.' } }, { status: 409 })
    }
    const id = `u-${crypto.randomUUID().slice(0, 8)}`
    const salt = `salt-${id}`
    const user = { id, email: b.email, displayName: b.displayName.trim(), username: b.username, salt, hash: await hashPassword(salt, b.password) }
    db().users.push(user)
    db().favorites[id] = []
    db().wallets[id] = []
    const token = `tok-${crypto.randomUUID()}`
    db().sessions[token] = id
    save()
    return HttpResponse.json({ token, user: publicUser(user) }, { status: 201 })
  }),

  http.post('/api/auth/login', async ({ request }) => {
    await networkConditions()
    const b = (await request.json()) as { email?: string; password?: string }
    const user = db().users.find((u) => u.email.toLowerCase() === (b.email ?? '').toLowerCase())
    if (!user || (await hashPassword(user.salt, b.password ?? '')) !== user.hash) {
      return HttpResponse.json({ code: 'INVALID_CREDENTIALS', message: 'E-mail ou senha incorretos.' }, { status: 401 })
    }
    const token = `tok-${crypto.randomUUID()}`
    db().sessions[token] = user.id
    save()
    return HttpResponse.json({ token, user: publicUser(user) })
  }),

  http.get('/api/auth/session', async ({ request }) => {
    await networkConditions()
    const user = currentUser(request)
    return user ? HttpResponse.json(publicUser(user)) : unauthorized()
  }),

  http.post('/api/auth/logout', async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (auth?.startsWith('Bearer ')) {
      delete db().sessions[auth.slice(7)]
      save()
    }
    return new HttpResponse(null, { status: 204 })
  }),
]
