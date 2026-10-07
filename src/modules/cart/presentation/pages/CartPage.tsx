import { useState, type FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/shadcn/button'
import { Input } from '@/shared/ui/shadcn/input'
import { Label } from '@/shared/ui/shadcn/label'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'
import { Card } from '@/shared/ui/shadcn/card'
import { Separator } from '@/shared/ui/shadcn/separator'
import { Alert } from '@/shared/ui/Alert'
import { NftArt } from '@/shared/ui/NftArt'
import { Eth } from '@/shared/ui/Eth'
import { errorMessage } from '@/shared/infrastructure/http/client'
import { useApplyCoupon, useCart, useRemoveCartItem, useRemoveCoupon, useUpdateCartItem } from '../../application/queries'
import { useFeaturedNfts } from '@/modules/catalog/application/queries'
import { NftCard } from '@/modules/catalog/presentation/components/NftCard'
import type { Cart } from '../../domain/types'

export function CartSummary({ cart }: { cart: Cart }) {
  return (
    <dl className="flex flex-col gap-3 text-sm">
      <div className="flex justify-between"><dt>Subtotal</dt><dd><Eth value={cart.subtotalEth} /></dd></div>
      <div className="flex justify-between">
        <dt>Desconto{cart.couponCode ? ` (${cart.couponCode})` : ' do lançamento'}</dt>
        <dd>(-) <Eth value={cart.discountEth} /></dd>
      </div>
      <div className="flex justify-between"><dt>Taxa de rede <span className="block text-xs text-accent-foreground">Taxa estimada</span></dt><dd><Eth value={cart.networkFeeEth} /></dd></div>
      <Separator />
      <div className="flex justify-between font-bold"><dt>Total</dt><dd className="text-accent-foreground" aria-live="polite"><Eth value={cart.totalEth} /></dd></div>
    </dl>
  )
}

function SummarySkeleton() {
  return (
    <Card className="gap-4 p-5" aria-hidden="true">
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-10 w-full" />
    </Card>
  )
}

export function CartPage() {
  const { data: cart, isPending, isError, error, refetch } = useCart()
  const update = useUpdateCartItem()
  const remove = useRemoveCartItem()
  const apply = useApplyCoupon()
  const removeCoupon = useRemoveCoupon()
  const featured = useFeaturedNfts()
  const [code, setCode] = useState('')

  const onCoupon = (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    apply.mutate(code, { onSuccess: () => setCode('') })
  }
  const mutationError = update.error ?? remove.error

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-3">
        <nav aria-label="Você está em" className="text-sm font-bold">Início / Mercado / Carrinho</nav>
        <h1 className="text-2xl font-bold">Carrinho de NFTs</h1>
      </div>

      {isError ? (
        <div className="flex flex-col items-start gap-3">
          <Alert tone="error">{errorMessage(error)}</Alert>
          <Button variant="outline" onClick={() => refetch()}>Tentar novamente</Button>
        </div>
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
          <section aria-label="Itens do carrinho" aria-busy={isPending}>
            {isPending ? (
              <div className="flex flex-col gap-3">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[70px] w-full" />)}</div>
            ) : cart.items.length === 0 ? (
              <div className="flex flex-col items-start gap-3 rounded-xl border p-8">
                <p className="font-medium">Seu carrinho está vazio.</p>
                <Button asChild><Link to="/">Explorar o mercado</Link></Button>
              </div>
            ) : (
              <>
                {mutationError && <Alert tone="error" className="mb-3">{errorMessage(mutationError)}</Alert>}
                <ul className="flex flex-col gap-3">
                  {cart.items.map((it) => (
                    <li key={`${it.nftId}-${it.edition}`}>
                      <Card className="grid grid-cols-[4.5rem_1fr] items-center gap-4 p-3 sm:grid-cols-[4.5rem_1fr_auto_auto_auto]">
                        <div className="size-[4.5rem] overflow-hidden rounded-md"><NftArt seed={it.nft.seed} alt={`Arte do NFT ${it.nft.name}`} /></div>
                        <div className="min-w-0">
                          <Link to="/nfts/$nftId" params={{ nftId: it.nftId }} className="block truncate font-bold hover:underline">{it.nft.name}</Link>
                          <p className="text-sm text-brand-secondary">ID do token: {it.nft.tokenId} · Edição {it.edition}</p>
                          <Eth value={it.unitPriceEth} className="text-sm text-text-secondary" />
                        </div>
                        <div className="flex items-center gap-2" role="group" aria-label={`Quantidade de ${it.nft.name}`}>
                          <Button size="icon" variant="outline" aria-label="Diminuir quantidade" disabled={it.quantity <= 1 || update.isPending} onClick={() => update.mutate({ nftId: it.nftId, edition: it.edition, quantity: it.quantity - 1 })}><Minus /></Button>
                          <span className="w-6 text-center">{it.quantity}</span>
                          <Button size="icon" variant="outline" aria-label="Aumentar quantidade" disabled={it.quantity >= it.maxQuantity || update.isPending} onClick={() => update.mutate({ nftId: it.nftId, edition: it.edition, quantity: it.quantity + 1 })}><Plus /></Button>
                        </div>
                        <Eth value={it.lineTotalEth} className="font-bold text-accent-foreground" />
                        <Button size="icon" variant="ghost" aria-label={`Remover ${it.nft.name} do carrinho`} disabled={remove.isPending} onClick={() => remove.mutate({ nftId: it.nftId, edition: it.edition })}><Trash2 /></Button>
                      </Card>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <aside aria-label="Resumo da carteira">
            {isPending ? <SummarySkeleton /> : (
              <Card className="gap-5 p-5">
                <h2 className="font-bold">Resumo da carteira</h2>
                <form onSubmit={onCoupon} className="flex flex-col gap-1.5">
                  <Label htmlFor="cupom">Código promocional</Label>
                  <div className="flex gap-2">
                    <Input id="cupom" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Digite o código promocional..." aria-invalid={apply.isError} aria-describedby={apply.isError ? 'cupom-erro' : undefined} />
                    <Button type="submit" disabled={apply.isPending || !cart.items.length}>Aplicar</Button>
                  </div>
                  {apply.isError && <p id="cupom-erro" role="alert" className="text-xs text-text-coral">{errorMessage(apply.error)}</p>}
                  {cart.couponCode && (
                    <p className="flex items-center justify-between text-xs text-accent-foreground">
                      Cupom {cart.couponCode} aplicado.
                      <button type="button" className="underline" onClick={() => removeCoupon.mutate()}>Remover</button>
                    </p>
                  )}
                </form>
                <CartSummary cart={cart} />
                <div className="flex flex-col items-center gap-3">
                  <Button asChild size="lg" className="w-full" disabled={!cart.items.length}>
                    <Link to="/checkout" aria-disabled={!cart.items.length}>Conectar e finalizar</Link>
                  </Button>
                  <Link to="/" className="text-sm text-accent-foreground hover:underline">Continuar explorando</Link>
                </div>
              </Card>
            )}
          </aside>
        </div>
      )}

      <section aria-labelledby="vistos">
        <h2 id="vistos" className="mb-4 border-b pb-2 text-lg font-bold text-accent-foreground">Colecionadores também viram</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {featured.isPending
            ? Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="aspect-[3/4]" />)
            : featured.data?.slice(0, 5).map((n) => <NftCard key={n.id} nft={n} />)}
        </div>
      </section>
    </div>
  )
}
