import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { LogOut, MapPin, User as UserIcon, ImageIcon } from 'lucide-react'
import { Button } from '@/shared/ui/shadcn/button'
import { Card } from '@/shared/ui/shadcn/card'
import { Separator } from '@/shared/ui/shadcn/separator'
import { Alert } from '@/shared/ui/Alert'
import { TextField } from '@/shared/ui/TextField'
import { apiError, errorMessage } from '@/shared/infrastructure/http/client'
import { useLogout, useSession } from '@/modules/identity/application/queries'
import { useChangePassword, useUpdateProfile } from '../../application/queries'

export function AccountSidebar({ active }: { active: 'profile' | 'wallets' }) {
  const logout = useLogout()
  const navigate = useNavigate()
  const item = (on: boolean) => `flex items-center gap-3 border-l-4 px-4 py-2 text-sm ${on ? 'border-primary text-accent-foreground' : 'border-transparent text-text-secondary hover:text-foreground'}`
  return (
    <nav aria-label="Conta" className="flex flex-col rounded-xl border bg-card py-2">
      <p className="px-4 py-2 font-bold">Meu perfil</p>
      <Link to="/profile" className={item(active === 'profile')} aria-current={active === 'profile' ? 'page' : undefined}><UserIcon className="size-4" /> Dados do perfil</Link>
      <Link to="/wallets" className={item(active === 'wallets')} aria-current={active === 'wallets' ? 'page' : undefined}><MapPin className="size-4" /> Carteiras</Link>
      <Separator className="my-2" />
      <button type="button" className="flex items-center gap-3 px-4 py-2 text-left text-sm text-accent-foreground" onClick={() => logout.mutate(undefined, { onSettled: () => navigate({ to: '/' }) })}>
        <LogOut className="size-4" /> Sair
      </button>
    </nav>
  )
}

export function ProfilePage() {
  const { data: user } = useSession()
  const update = useUpdateProfile()
  const changePassword = useChangePassword()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    displayName: user?.displayName ?? '',
    username: user?.username ?? '',
    email: user?.email ?? '',
    ens: user?.ens ?? '',
    walletAlias: user?.walletAlias ?? '',
  })
  const [avatar, setAvatar] = useState<string | null | undefined>(undefined) // undefined = sem alteração
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const fields = apiError(update.error).body.fields ?? {}
  const pwFields = apiError(changePassword.error).body.fields ?? {}
  const shownAvatar = avatar === undefined ? user?.avatarUrl : (avatar ?? undefined)

  const onFile = (file?: File) => {
    setAvatarError(null)
    if (!file) return
    if (!file.type.startsWith('image/')) return setAvatarError('Escolha um arquivo de imagem.')
    if (file.size > 400_000) return setAvatarError('A imagem deve ter no máximo 400 KB.')
    const reader = new FileReader()
    reader.onload = () => setAvatar(reader.result as string)
    reader.readAsDataURL(file)
  }

  const onSave = (e: FormEvent) => {
    e.preventDefault()
    setSaved(false)
    update.mutate({ ...form, ens: form.ens || undefined, walletAlias: form.walletAlias || undefined, avatarUrl: avatar }, { onSuccess: () => { setSaved(true); setAvatar(undefined) } })
  }

  const onPassword = (e: FormEvent) => {
    e.preventDefault()
    setPwSaved(false)
    setPwError(null)
    if (pw.next.length < 8) return setPwError('A nova senha deve ter ao menos 8 caracteres.')
    if (pw.next !== pw.confirm) return setPwError('A confirmação não confere com a nova senha.')
    changePassword.mutate({ current: pw.current, next: pw.next }, { onSuccess: () => { setPwSaved(true); setPw({ current: '', next: '', confirm: '' }) } })
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[18rem_1fr]">
      <AccountSidebar active="profile" />
      <div className="flex flex-col gap-10">
        <form onSubmit={onSave} noValidate className="flex flex-col gap-5" aria-label="Perfil do colecionador">
          <h1 className="text-xl font-bold">Perfil do colecionador</h1>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Nome de exibição" required value={form.displayName} onChange={set('displayName')} error={fields.displayName} />
            <TextField label="Nome de usuário" required value={form.username} onChange={set('username')} error={fields.username} />
            <TextField label="E-mail" type="email" required value={form.email} onChange={set('email')} error={fields.email} />
            <TextField label="Nome ENS" value={form.ens} onChange={set('ens')} error={fields.ens} hint="Sem o sufixo .eth" />
            <TextField label="Apelido da carteira" value={form.walletAlias} onChange={set('walletAlias')} error={fields.walletAlias} />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center overflow-hidden rounded-full border bg-secondary">
              {shownAvatar ? <img src={shownAvatar} alt="Seu avatar" className="size-full object-cover" /> : <ImageIcon className="size-6 text-text-secondary" aria-label="Sem avatar" />}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" id="avatar" onChange={(e) => onFile(e.target.files?.[0])} aria-label="Escolher avatar" />
            <Button type="button" onClick={() => fileRef.current?.click()}>Alterar</Button>
            <Button type="button" variant="ghost" disabled={!shownAvatar} onClick={() => setAvatar(null)}>Remover</Button>
          </div>
          {(avatarError || fields.avatarUrl) && <Alert tone="error">{avatarError ?? fields.avatarUrl}</Alert>}
          {update.isError && !Object.keys(fields).length && <Alert tone="error">{errorMessage(update.error)}</Alert>}
          {saved && <Alert tone="success">Perfil atualizado.</Alert>}
          <div><Button type="submit" disabled={update.isPending}>{update.isPending ? 'Salvando…' : 'Salvar'}</Button></div>
        </form>

        <Separator />

        <form onSubmit={onPassword} noValidate className="flex max-w-md flex-col gap-4" aria-label="Alterar senha">
          <h2 className="font-medium">Alterar senha</h2>
          <TextField label="Senha atual" type="password" autoComplete="current-password" required value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} error={pwFields.current} />
          <TextField label="Nova senha" type="password" autoComplete="new-password" required value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} error={pwFields.next} />
          <TextField label="Confirmar nova senha" type="password" autoComplete="new-password" required value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} />
          {pwError && <Alert tone="error">{pwError}</Alert>}
          {changePassword.isError && !Object.keys(pwFields).length && <Alert tone="error">{errorMessage(changePassword.error)}</Alert>}
          {pwSaved && <Alert tone="success">Senha alterada.</Alert>}
          <div><Button type="submit" disabled={changePassword.isPending || !pw.current}>Alterar senha</Button></div>
        </form>
      </div>
    </div>
  )
}
