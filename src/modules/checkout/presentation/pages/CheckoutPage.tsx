import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/shared/ui/shadcn/button'
import { Card } from '@/shared/ui/shadcn/card'
import { Label } from '@/shared/ui/shadcn/label'
import { NativeSelect } from '@/shared/ui/shadcn/native-select'
import { Textarea } from '@/shared/ui/shadcn/textarea'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'
import { Alert } from '@/shared/ui/Alert'
import { TextField } from '@/shared/ui/TextField'
import { NftArt } from '@/shared/ui/NftArt'
import { Eth } from '@/shared/ui/Eth'
import { apiError, errorMessage } from '@/shared/infrastructure/http/client'
import { useSession } from '@/modules/identity/application/queries'
import { useCart, useCartKey } from '@/modules/cart/application/queries'
import { CartSummary } from '@/modules/cart/presentation/pages/CartPage'
import { useWallets } from '@/modules/wallets/application/queries'
import { useCreateOrder } from '@/modules/orders/application/queries'
import { useQueryClient } from '@tanstack/react-query'
import type { Cart } from '@/modules/cart/domain/types'

type Step = 'form' | 'review'

export function CheckoutPage() {
  const { data: user } = useSession()
  const { data: cart, isPending: cartPending } = useCart()
  const { data: wallets, isPending: walletsPending } = useWallets()
  const createOrder = useCreateOrder()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const cartKey = useCartKey()

  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState({ displayName: user?.displayName ?? '', username: user?.username ?? '', email: user?.email ?? '', note: '' })
  const [network, setNetwork] = useState('')
  const [walletId, setWalletId] = useState('')
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [connectMsg, setConnectMsg] = useState<string | null>(null)
  const [reviewedTotal, setReviewedTotal] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<string | null>(null)

  const wallet = wallets?.find((w) => w.id === walletId)
  const stale = step === 'review' && cart && reviewedTotal !== null && cart.totalEth !== reviewedTotal

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.displayName.trim()) errs.displayName = 'Informe o nome de exibição.'
    if (!form.username.trim()) errs.username = 'Informe o nome de usuário.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'E-mail inválido.'
    if (!network) errs.network = 'Selecione uma rede.'
    if (!walletId) errs.walletId = 'Selecione uma carteira cadastrada.'
    else if (!connected) errs.walletId = 'Conecte a carteira para continuar.'
    return errs
  }

  const goReview = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length || !cart) return
    setNotice(null)
    setReviewedTotal(cart.totalEth)
    setStep('review')
  }

  // Simulação de conexão/desconexão de carteira (estado de UI; sem extensão real).
  const connect = () => {
    setConnecting(true)
    setConnectMsg(null)
    setTimeout(() => {
      setConnecting(false)
      setConnected(true)
      setConnectMsg('Carteira conectada.')
    }, 600)
  }
  const disconnect = () => {
    setConnected(false)
    setConnectMsg('Carteira desconectada.')
    setStep('form')
  }

  const confirm = () => {
    if (!cart || !wallet || createOrder.isPending) return
    createOrder.mutate(
      { walletId: wallet.id, network, profile: { displayName: form.displayName, username: form.username, email: form.email, note: form.note || undefined }, expectedTotalEth: reviewedTotal ?? cart.totalEth },
      {
        onSuccess: (order) => navigate({ to: '/orders/$orderId', params: { orderId: order.id }, replace: true }),
        onError: (err) => {
          const e = apiError(err)
          const body = e.body as { code?: string; cart?: Cart; message?: string; fields?: Record<string, string> }
          if (body.cart) qc.setQueryData(cartKey, body.cart)
          if (body.code === 'QUOTE_CHANGED' || body.code === 'OUT_OF_STOCK') {
            // Mudanças exigem nova confirmação do usuário.
            setStep('review')
            setReviewedTotal(body.cart?.totalEth ?? null)
            setNotice(`${body.message ?? 'Os valores mudaram.'} Revise o resumo atualizado e confirme novamente.`)
          } else if (body.fields) {
            setFieldErrors(body.fields)
            setStep('form')
          }
        },
      },
    )
  }

  if (cartPending || walletsPending) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_26rem]" aria-busy="true">
        <div className="flex flex-col gap-4">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border p-8">
        <h1 className="text-xl font-bold">Seu carrinho está vazio</h1>
        <Button asChild><Link to="/">Explorar o mercado</Link></Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <nav aria-label="Você está em" className="text-sm font-bold">Início / Mercado / Pagamento</nav>
        <h1 className="text-2xl font-bold">Pagamento</h1>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_26rem]">
        {step === 'form' ? (
          <form onSubmit={goReview} noValidate className="flex flex-col gap-6" aria-label="Dados do colecionador">
            <h2 className="font-bold">Perfil do colecionador</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Nome de exibição" required value={form.displayName} onChange={set('displayName')} error={fieldErrors.displayName} />
              <TextField label="Nome de usuário" required value={form.username} onChange={set('username')} error={fieldErrors.username} />
              <TextField label="E-mail" type="email" required value={form.email} onChange={set('email')} error={fieldErrors.email} />
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rede">Rede<span aria-hidden="true" className="text-text-coral">*</span></Label>
                <NativeSelect id="rede" value={network} onChange={(e) => setNetwork(e.target.value)} aria-invalid={!!fieldErrors.network} aria-describedby={fieldErrors.network ? 'rede-erro' : undefined}>
                  <option value="">Selecione uma rede</option>
                  <option value="Ethereum">Ethereum</option>
                  <option value="Polygon">Polygon</option>
                </NativeSelect>
                {fieldErrors.network && <p id="rede-erro" className="text-xs text-text-coral">{fieldErrors.network}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="obs">Observação do colecionador (opcional)</Label>
              <Textarea id="obs" value={form.note} onChange={set('note')} />
            </div>

            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 font-bold">Carteira e rede</legend>
              {wallets && wallets.length > 0 ? (
                <>
                  <div className="flex flex-col gap-2" role="radiogroup" aria-label="Carteiras cadastradas">
                    {wallets.map((w) => (
                      <label key={w.id} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm ${walletId === w.id ? 'border-primary' : ''}`}>
                        <input type="radio" name="wallet" value={w.id} checked={walletId === w.id} onChange={() => { setWalletId(w.id); setConnected(false); setConnectMsg(null) }} className="accent-primary" />
                        <span className="flex-1"><span className="font-medium">{w.label}</span> · {w.kind === 'principal' ? 'Principal' : 'Secundária'} · {w.network}<span className="block text-xs text-brand-secondary">{w.address.slice(0, 6)}…{w.address.slice(-4)}</span></span>
                      </label>
                    ))}
                  </div>
                  {fieldErrors.walletId && <p className="text-xs text-text-coral" role="alert">{fieldErrors.walletId}</p>}
                  <div className="flex items-center gap-3">
                    {connected ? (
                      <Button type="button" variant="outline" onClick={disconnect}>Desconectar carteira</Button>
                    ) : (
                      <Button type="button" variant="secondary" disabled={!walletId || connecting} onClick={connect}>{connecting ? 'Conectando…' : 'Conectar carteira'}</Button>
                    )}
                    <span role="status" className="text-xs text-text-secondary">{connectMsg}</span>
                  </div>
                </>
              ) : (
                <Alert>Você ainda não tem carteiras. <Link to="/wallets" className="underline">Cadastre uma carteira</Link> para continuar.</Alert>
              )}
            </fieldset>
            <Button type="submit" size="lg">Revisar pedido</Button>
          </form>
        ) : (
          <section aria-labelledby="revisao" className="flex flex-col gap-4">
            <h2 id="revisao" className="font-bold">Revise seu pedido</h2>
            {(notice || stale) && <Alert tone="error">{notice ?? 'Os valores do carrinho mudaram desde a revisão.'} {stale && 'Revise o resumo atualizado e confirme novamente.'}</Alert>}
            {createOrder.isError && !notice && <Alert tone="error">{errorMessage(createOrder.error)} Você pode tentar novamente: o pedido não será duplicado.</Alert>}
            <Card className="gap-2 p-5 text-sm">
              <p><span className="text-text-secondary">Colecionador:</span> {form.displayName} (@{form.username}) · {form.email}</p>
              <p><span className="text-text-secondary">Rede:</span> {network}</p>
              <p><span className="text-text-secondary">Carteira:</span> {wallet?.label} · {wallet?.address.slice(0, 6)}…{wallet?.address.slice(-4)}</p>
              {form.note && <p><span className="text-text-secondary">Observação:</span> {form.note}</p>}
            </Card>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('form')} disabled={createOrder.isPending}>Editar dados</Button>
              <Button size="lg" disabled={createOrder.isPending || !!stale} onClick={confirm}>
                {createOrder.isPending ? 'Enviando pedido…' : notice ? 'Confirmar novamente' : 'Confirmar compra'}
              </Button>
            </div>
          </section>
        )}

        <aside aria-label="Seus NFTs">
          <Card className="gap-4 p-5">
            <h2 className="font-bold">Seus NFTs</h2>
            <ul className="flex flex-col gap-3">
              {cart.items.map((it) => (
                <li key={`${it.nftId}-${it.edition}`} className="flex items-center gap-3 text-sm">
                  <div className="size-14 shrink-0 overflow-hidden rounded-md"><NftArt seed={it.nft.seed} alt={`Arte do NFT ${it.nft.name}`} /></div>
                  <div className="min-w-0 flex-1"><p className="truncate font-bold">{it.nft.name}</p><p className="text-xs text-brand-secondary">{it.nft.tokenId} · {it.edition}</p></div>
                  <div className="text-right"><p className="text-xs text-text-secondary">(x {it.quantity})</p><Eth value={it.lineTotalEth} className="font-bold text-accent-foreground" /></div>
                </li>
              ))}
            </ul>
            <CartSummary cart={cart} />
          </Card>
        </aside>
      </div>
    </div>
  )
}
