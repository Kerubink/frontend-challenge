/**
 * Cenários do mock. Seleção: `?scenario=<nome>` na URL (persistido em localStorage).
 * `?reset=1` restaura o banco para o estado inicial conhecido.
 */
export type Scenario = 'default' | 'slow' | 'empty' | 'server-error' | 'payment-declined'

export const SCENARIOS: Scenario[] = ['default', 'slow', 'empty', 'server-error', 'payment-declined']
const KEY = 'kurio.mock.scenario'

export function getScenario(): Scenario {
  try {
    const v = localStorage.getItem(KEY) as Scenario | null
    return v && SCENARIOS.includes(v) ? v : 'default'
  } catch {
    return 'default'
  }
}

export function setScenario(s: Scenario) {
  try {
    localStorage.setItem(KEY, s)
  } catch {
    /* storage indisponível */
  }
}
