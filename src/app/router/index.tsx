import { createRootRouteWithContext, type ErrorComponentProps, createRoute, createRouter, redirect } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { RootLayout } from '../layouts/RootLayout'
import { NotFound, RouteError } from './NotFound'
import { sessionQuery } from '@/modules/identity/application/queries'
import { validateHomeSearch } from '@/modules/catalog/presentation/pages/homeSearch'
import { HomePage } from '@/modules/catalog/presentation/pages/HomePage'
import { NftDetailPage } from '@/modules/catalog/presentation/pages/NftDetailPage'
import { CartPage } from '@/modules/cart/presentation/pages/CartPage'
import { CheckoutPage } from '@/modules/checkout/presentation/pages/CheckoutPage'
import { OrderPage } from '@/modules/orders/presentation/pages/OrderPage'
import { LoginPage, RegisterPage } from '@/modules/identity/presentation/pages/AuthPages'
import { ProfilePage } from '@/modules/collector/presentation/pages/ProfilePage'
import { WalletsPage } from '@/modules/wallets/presentation/pages/WalletsPage'

interface RouterContext {
  queryClient: QueryClient
}

const rootRoute = createRootRouteWithContext<RouterContext>()({ component: RootLayout, notFoundComponent: NotFound, errorComponent: RouteError })

/** Rotas privadas: exigem sessão; ao falhar, voltam ao login e retomam o fluxo. */
const requireAuth = async ({ context, location }: { context: RouterContext; location: { href: string } }) => {
  const user = await context.queryClient.ensureQueryData(sessionQuery)
  if (!user) throw redirect({ to: '/login', search: { redirect: location.href } })
}
/** Rotas de visitante: usuário autenticado é redirecionado. */
const guestOnly = async ({ context }: { context: RouterContext }) => {
  const user = await context.queryClient.ensureQueryData(sessionQuery)
  if (user) throw redirect({ to: '/' })
}

const authSearch = z.object({ redirect: z.string().optional().catch(undefined), expired: z.boolean().optional().catch(undefined) })

const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', validateSearch: validateHomeSearch, component: HomePage })
const nftRoute = createRoute({ getParentRoute: () => rootRoute, path: '/nfts/$nftId', component: NftDetailPage })
const cartRoute = createRoute({ getParentRoute: () => rootRoute, path: '/cart', component: CartPage })
const checkoutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/checkout', beforeLoad: requireAuth, component: CheckoutPage })
const orderRoute = createRoute({ getParentRoute: () => rootRoute, path: '/orders/$orderId', beforeLoad: requireAuth, component: OrderPage })
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', validateSearch: authSearch, beforeLoad: guestOnly, component: LoginPage })
const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/register', validateSearch: authSearch, beforeLoad: guestOnly, component: RegisterPage })
const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/profile', beforeLoad: requireAuth, component: ProfilePage })
const walletsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/wallets', beforeLoad: requireAuth, component: WalletsPage })

const routeTree = rootRoute.addChildren([homeRoute, nftRoute, cartRoute, checkoutRoute, orderRoute, loginRoute, registerRoute, profileRoute, walletsRoute])

export const createAppRouter = (queryClient: QueryClient) =>
  createRouter({ routeTree, context: { queryClient }, defaultPreload: 'intent', scrollRestoration: true })

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
