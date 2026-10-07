import { delay, HttpResponse } from 'msw'
import { getScenario } from '../scenarios'

/** Latência por cenário. Retorna Response de erro quando o cenário exige falha. */
export async function networkConditions(opts: { failIn?: ('server-error')[] } = {}) {
  const scenario = getScenario()
  if (scenario === 'slow') await delay(1500 + Math.floor(Math.random() * 1500))
  else await delay(120 + Math.floor(Math.random() * 200))
  if (scenario === 'server-error' && opts.failIn?.includes('server-error')) {
    return HttpResponse.json({ code: 'SERVER_ERROR', message: 'Falha temporária no servidor.' }, { status: 503 })
  }
  return null
}
