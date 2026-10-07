import { useState, type FormEvent } from 'react'
import { Button } from '@/shared/ui/shadcn/button'
import { Card } from '@/shared/ui/shadcn/card'
import { Badge } from '@/shared/ui/shadcn/badge'
import { Label } from '@/shared/ui/shadcn/label'
import { NativeSelect } from '@/shared/ui/shadcn/native-select'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'
import { Alert } from '@/shared/ui/Alert'
import { TextField } from '@/shared/ui/TextField'
import { apiError, errorMessage } from '@/shared/infrastructure/http/client'
import { AccountSidebar } from '@/modules/collector/presentation/pages/ProfilePage'
import { useSaveWallet, useWallets } from '../../application/queries'
import type { Network, Wallet, WalletInput, WalletKind } from '../../domain/types'

const EMPTY: WalletInput = { label: '', address: '', network: 'Ethereum', kind: 'principal' }

export function WalletsPage() {
  const { data: wallets, isPending, isError, error, refetch } = useWallets()
  const save = useSaveWallet()
  const [editing, setEditing] = useState<Wallet | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<WalletInput>(EMPTY)
  const [done, setDone] = useState(false)
  const fields = apiError(save.error).body.fields ?? {}

  const open = (w: Wallet | null) => {
    save.reset()
    setDone(false)
    setEditing(w)
    setAdding(!w)
    setForm(w ? { label: w.label, address: w.address, network: w.network, kind: w.kind } : EMPTY)
  }
  const close = () => {
    setEditing(null)
    setAdding(false)
  }
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    save.mutate({ id: editing?.id, input: form }, { onSuccess: () => { setDone(true); close() } })
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[18rem_1fr]">
      <AccountSidebar active="wallets" />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Carteiras</h1>
          {!adding && !editing && <Button onClick={() => open(null)}>Adicionar carteira</Button>}
        </div>
        {done && <Alert tone="success">Carteira salva.</Alert>}

        {isError ? (
          <div className="flex flex-col items-start gap-3"><Alert tone="error">{errorMessage(error)}</Alert><Button variant="outline" onClick={() => refetch()}>Tentar novamente</Button></div>
        ) : isPending ? (
          <div className="flex flex-col gap-3" aria-busy="true">{[0, 1].map((i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : wallets.length === 0 && !adding ? (
          <div className="rounded-xl border p-8"><p className="font-medium">Nenhuma carteira cadastrada.</p><p className="text-sm text-text-secondary">Cadastre uma carteira principal para finalizar compras.</p></div>
        ) : (
          <ul className="flex flex-col gap-3">
            {wallets.map((w) => (
              <li key={w.id}>
                <Card className="flex-row items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-bold">{w.label} <Badge variant={w.kind === 'principal' ? 'default' : 'secondary'}>{w.kind === 'principal' ? 'Principal' : 'Secundária'}</Badge></p>
                    <p className="truncate text-sm text-text-secondary">{w.address}</p>
                    <p className="text-xs text-brand-secondary">Rede {w.network}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => open(w)} aria-label={`Editar carteira ${w.label}`}>Editar</Button>
                </Card>
              </li>
            ))}
          </ul>
        )}

        {(adding || editing) && (
          <Card className="gap-4 p-5">
            <h2 className="font-bold">{editing ? 'Editar carteira' : 'Nova carteira'}</h2>
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
              <TextField label="Nome da carteira" required value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} error={fields.label} placeholder="MetaMask" />
              <TextField label="Endereço" required value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} error={fields.address} placeholder="0x…" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="w-rede">Rede</Label>
                  <NativeSelect id="w-rede" value={form.network} onChange={(e) => setForm((f) => ({ ...f, network: e.target.value as Network }))} aria-invalid={!!fields.network}>
                    <option>Ethereum</option><option>Polygon</option>
                  </NativeSelect>
                  {fields.network && <p className="text-xs text-text-coral">{fields.network}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="w-tipo">Tipo</Label>
                  <NativeSelect id="w-tipo" value={form.kind} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as WalletKind }))} aria-invalid={!!fields.kind} aria-describedby={fields.kind ? 'w-tipo-erro' : undefined}>
                    <option value="principal">Principal</option><option value="secundaria">Secundária</option>
                  </NativeSelect>
                  {fields.kind && <p id="w-tipo-erro" className="text-xs text-text-coral">{fields.kind}</p>}
                </div>
              </div>
              {save.isError && !Object.keys(fields).length && <Alert tone="error">{errorMessage(save.error)}</Alert>}
              <div className="flex gap-3">
                <Button type="submit" disabled={save.isPending}>{save.isPending ? 'Salvando…' : 'Salvar'}</Button>
                <Button type="button" variant="ghost" onClick={close}>Cancelar</Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}
