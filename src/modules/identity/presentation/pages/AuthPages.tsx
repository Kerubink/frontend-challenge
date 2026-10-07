import { useState, type FormEvent } from 'react'
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/shared/ui/shadcn/button'
import { Card } from '@/shared/ui/shadcn/card'
import { Alert } from '@/shared/ui/Alert'
import { TextField } from '@/shared/ui/TextField'
import { apiError, errorMessage } from '@/shared/infrastructure/http/client'
import { useLogin, useRegister } from '../../application/queries'

const loginRoute = getRouteApi('/login')
const registerRoute = getRouteApi('/register')

/** Só aceita redirecionamentos internos. */
const safeRedirect = (r?: string) => (r && r.startsWith('/') && !r.startsWith('//') ? r : '/')

export function LoginPage() {
  const { redirect, expired } = loginRoute.useSearch()
  const navigate = useNavigate()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    login.mutate({ email, password }, { onSuccess: () => navigate({ to: safeRedirect(redirect), replace: true }) })
  }
  const fieldErrors = apiError(login.error).body.fields ?? {}

  return (
    <Card className="mx-auto w-full max-w-md gap-5 p-8">
      <h1 className="text-xl font-bold">Entrar</h1>
      <p className="text-sm text-text-secondary">Entre para gerenciar sua carteira, coleção e perfil de criador.</p>
      {expired && <Alert tone="error">Sua sessão expirou. Entre novamente para continuar de onde parou.</Alert>}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <TextField label="E-mail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@email.com" error={fieldErrors.email} />
        <TextField label="Senha" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password} />
        {login.isError && <Alert tone="error">{errorMessage(login.error)}</Alert>}
        <Button type="submit" size="lg" disabled={login.isPending || !email || !password}>{login.isPending ? 'Entrando…' : 'Entrar'}</Button>
      </form>
      <p className="text-sm text-text-secondary">
        Não tem conta? <Link to="/register" search={{ redirect }} className="text-accent-foreground underline">Criar conta</Link>
      </p>
      <p className="text-xs text-muted-foreground">Demonstração: ana@kurio.dev / Senha@123 ou bruno@kurio.dev / Senha@123</p>
    </Card>
  )
}

export function RegisterPage() {
  const { redirect } = registerRoute.useSearch()
  const navigate = useNavigate()
  const register = useRegister()
  const [form, setForm] = useState({ displayName: '', username: '', email: '', password: '' })
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const fields = apiError(register.error).body.fields ?? {}

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    register.mutate(form, { onSuccess: () => navigate({ to: safeRedirect(redirect), replace: true }) })
  }

  return (
    <Card className="mx-auto w-full max-w-md gap-5 p-8">
      <h1 className="text-xl font-bold">Criar conta</h1>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <TextField label="Nome de exibição" required autoComplete="name" value={form.displayName} onChange={set('displayName')} error={fields.displayName} />
        <TextField label="Nome de usuário" required autoComplete="username" value={form.username} onChange={set('username')} error={fields.username} />
        <TextField label="E-mail" type="email" required autoComplete="email" value={form.email} onChange={set('email')} error={fields.email} />
        <TextField label="Senha" type="password" required autoComplete="new-password" value={form.password} onChange={set('password')} error={fields.password} hint="Mínimo de 8 caracteres." />
        {register.isError && !Object.keys(fields).length && <Alert tone="error">{errorMessage(register.error)}</Alert>}
        <Button type="submit" size="lg" disabled={register.isPending}>{register.isPending ? 'Criando conta…' : 'Criar conta'}</Button>
      </form>
      <p className="text-sm text-text-secondary">
        Já tem conta? <Link to="/login" search={{ redirect }} className="text-accent-foreground underline">Entrar</Link>
      </p>
    </Card>
  )
}
