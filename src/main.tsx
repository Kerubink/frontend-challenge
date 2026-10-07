import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { createAppRouter } from '@/app/router'
import { env } from '@/shared/config/env'
import '@/app/styles/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 0 }, // mutations nunca repetem sozinhas: evita operações duplicadas
  },
})
const router = createAppRouter(queryClient)

async function bootstrap() {
  if (env.enableMocks) {
    const { enableMocking } = await import('@/mocks/browser/worker')
    await enableMocking()
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
}
void bootstrap()
