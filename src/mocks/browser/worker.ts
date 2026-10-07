import { setupWorker } from 'msw/browser'
import { handlers } from '../handlers'
import { initDb } from '../db/db'
import { SCENARIOS, setScenario, type Scenario } from '../scenarios'

/** Ativa o MSW. Lê `?scenario=` e `?reset=1` da URL (README: seleção e reset de cenários). */
export async function enableMocking() {
  const params = new URLSearchParams(window.location.search)
  const scenario = params.get('scenario') as Scenario | null
  if (scenario && SCENARIOS.includes(scenario)) setScenario(scenario)
  await initDb({ reset: params.get('reset') === '1' })
  if (params.get('reset') === '1') {
    ;['kurio.token', 'kurio.guest', 'kurio.mock.scenario'].forEach((k) => localStorage.removeItem(k))
  }
  const worker = setupWorker(...handlers)
  await worker.start({ onUnhandledFrame: 'bypass', quiet: true })
}
