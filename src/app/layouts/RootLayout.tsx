import { useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { LogOut, ShoppingCart, User as UserIcon } from 'lucide-react'
import { Button } from '@/shared/ui/shadcn/button'
import { Badge } from '@/shared/ui/shadcn/badge'
import { useLogout, useSession, sessionQuery } from '@/modules/identity/application/queries'
import { useCart } from '@/modules/cart/application/queries'
import { useRealtimeSync } from '@/modules/realtime/presentation/hooks/useRealtimeSync'
import { SESSION_EXPIRED_EVENT } from '@/shared/infrastructure/http/client'
import { env } from '@/shared/config/env'
import { SCENARIOS } from '@/mocks/scenarios'

function Header() {
  const { data: user } = useSession()
  const { data: cart } = useCart()
  const logout = useLogout()
  const navigate = useNavigate()
  const count = cart?.items.reduce((n, i) => n + i.quantity, 0) ?? 0

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link to="/" className="text-sm font-bold tracking-widest">
          KURIO
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-6 text-sm">
          <Link to="/" activeOptions={{ exact: true }} className="hover:underline" activeProps={{ className: 'font-bold text-accent-foreground' }}>
            Início
          </Link>
          <Link to="/" hash="catalogo" className="hover:underline">
            Mercado
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="relative">
            <Link to="/cart" aria-label={`Carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`}>
              <ShoppingCart />
              {count > 0 && (
                <Badge className="px-1.5" aria-hidden="true">
                  {count}
                </Badge>
              )}
            </Link>
          </Button>
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/profile">
                  <UserIcon />
                  <span className="hidden sm:inline">{user.displayName.split(' ')[0]}</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={logout.isPending}
                onClick={() => logout.mutate(undefined, { onSettled: () => navigate({ to: '/' }) })}
              >
                <LogOut />
                Sair
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/login" search={{ redirect: undefined }}>
                Entrar
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

function Footer({ realtimeConnected }: { realtimeConnected: boolean }) {
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-text-secondary md:px-8">
        <p className="font-bold tracking-widest text-foreground">KURIO</p>
        <p>© 2026 Kurio. Propriedade digital para todos.</p>
        <p role="status" className="text-xs">
          Tempo real: {realtimeConnected ? 'conectado' : 'reconectando…'}
        </p>
        {env.enableMocks && (
          <p className="text-xs text-muted-foreground">
            Ambiente de demonstração (dados simulados com MSW). Cenários:{' '}
            {SCENARIOS.map((s) => (
              <a key={s} href={`/?scenario=${s}`} className="mr-2 underline">
                {s}
              </a>
            ))}
            <a href="/?reset=1" className="underline">
              reset
            </a>
          </p>
        )}
      </div>
    </footer>
  )
}

export function RootLayout() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: user } = useSession()
  const realtimeConnected = useRealtimeSync(user?.id ?? 'guest')

  // Sessão expirada em qualquer chamada: limpa dados privados e leva ao login preservando o contexto.
  useEffect(() => {
    const onExpired = () => {
      qc.clear()
      qc.setQueryData(sessionQuery.queryKey, null)
      void navigate({ to: '/login', search: { redirect: location.href, expired: true } })
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [qc, navigate, location.href])

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-primary focus:p-2 focus:text-primary-foreground">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8">
        <Outlet />
      </main>
      <Footer realtimeConnected={realtimeConnected} />
    </div>
  )
}
