import { getRouteApi, Link } from '@tanstack/react-router'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/shared/ui/shadcn/button'
import { Card } from '@/shared/ui/shadcn/card'
import { Separator } from '@/shared/ui/shadcn/separator'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'
import { Alert } from '@/shared/ui/Alert'
import { NftArt } from '@/shared/ui/NftArt'
import { Eth } from '@/shared/ui/Eth'
import { apiError, errorMessage } from '@/shared/infrastructure/http/client'
import { useOrder } from '../../application/queries'

const route = getRouteApi('/orders/$orderId')

export function OrderPage() {
  const { orderId } = route.useParams()
  const { data: order, isPending, isError, error, refetch } = useOrder(orderId)

  if (isPending) return <Skeleton className="mx-auto h-96 w-full max-w-2xl" aria-label="Carregando pedido" />
  if (isError) {
    const nf = apiError(error).status === 404
    return (
      <div className="flex flex-col items-start gap-3">
        <h1 className="text-2xl font-bold">{nf ? 'Pedido não encontrado' : 'Não foi possível carregar o pedido'}</h1>
        {!nf && <Alert tone="error">{errorMessage(error)}</Alert>}
        <div className="flex gap-3">
          {!nf && <Button variant="outline" onClick={() => refetch()}>Tentar novamente</Button>}
          <Button asChild><Link to="/">Voltar ao mercado</Link></Button>
        </div>
      </div>
    )
  }

  if (order.status === 'pending') {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-16 text-center" role="status" aria-live="polite">
        <Loader2 className="size-10 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        <h1 className="text-xl font-bold">Processando seu pagamento…</h1>
        <p className="text-sm text-text-secondary">Pedido {order.id}. Se você recarregar a página, continuamos de onde parou — nenhuma nova compra será criada.</p>
      </div>
    )
  }

  if (order.status === 'declined') {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-16 text-center">
        <XCircle className="size-10 text-text-coral" aria-hidden="true" />
        <h1 className="text-xl font-bold">Pagamento recusado</h1>
        <Alert tone="error">{order.declineReason ?? 'Seu pagamento não foi aprovado.'}</Alert>
        <p className="text-sm text-text-secondary">Seus itens continuam no carrinho. Nada foi cobrado.</p>
        <div className="flex gap-3">
          <Button asChild><Link to="/checkout">Tentar novamente</Link></Button>
          <Button asChild variant="outline"><Link to="/cart">Voltar ao carrinho</Link></Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-2xl gap-6 p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <CheckCircle2 className="size-12 text-primary" aria-hidden="true" />
        <h1 className="text-xl font-bold">Seus NFTs agora estão na sua carteira</h1>
      </div>
      <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div><dt className="font-bold">ID da transação</dt><dd className="break-all text-text-secondary">{order.txHash.slice(0, 6)}…{order.txHash.slice(-4)}</dd></div>
        <div><dt className="font-bold">Data</dt><dd className="text-text-secondary">{new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</dd></div>
        <div><dt className="font-bold">Total</dt><dd className="text-text-secondary"><Eth value={order.totalEth} /></dd></div>
        <div><dt className="font-bold">Carteira</dt><dd className="text-text-secondary">{order.wallet.label}</dd></div>
      </dl>
      <Separator />
      <section aria-labelledby="detalhes" className="flex flex-col gap-4">
        <h2 id="detalhes" className="font-bold">Detalhes da transação</h2>
        <ul className="flex flex-col gap-3">
          {order.lines.map((l) => (
            <li key={`${l.nftId}-${l.edition}`} className="flex items-center gap-3 text-sm">
              <div className="size-14 shrink-0 overflow-hidden rounded-md"><NftArt seed={l.seed} alt={`Arte do NFT ${l.name}`} /></div>
              <div className="min-w-0 flex-1"><p className="truncate font-bold">{l.name}</p><p className="text-xs text-brand-secondary">{l.tokenId} · Edição {l.edition}</p></div>
              <div className="text-right"><p className="text-xs text-text-secondary">(x {l.quantity})</p><Eth value={l.lineTotalEth} className="font-bold text-accent-foreground" /></div>
            </li>
          ))}
        </ul>
        <dl className="ml-auto flex w-full max-w-xs flex-col gap-2 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd><Eth value={order.subtotalEth} /></dd></div>
          <div className="flex justify-between"><dt>Desconto</dt><dd>(-) <Eth value={order.discountEth} /></dd></div>
          <div className="flex justify-between"><dt>Taxa de rede</dt><dd><Eth value={order.networkFeeEth} /></dd></div>
          <div className="flex justify-between font-bold"><dt>Total</dt><dd className="text-accent-foreground"><Eth value={order.totalEth} /></dd></div>
        </dl>
      </section>
      <p className="text-center text-sm text-text-secondary">Transação confirmada na rede {order.network} (simulação). A referência e o link de exploração são simulados.</p>
      <div className="flex justify-center gap-3">
        <Button asChild><Link to="/">Continuar explorando</Link></Button>
      </div>
    </Card>
  )
}
