/**
 * Chave de idempotência por tentativa: o mesmo conteúdo reutiliza a mesma chave
 * (reenvios e cliques repetidos recuperam o mesmo pedido); conteúdo diferente gera nova chave.
 */
const KEY = 'kurio.idem'

function read(): { fingerprint: string; key: string } | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function idempotencyKeyFor(fingerprint: string): string {
  const current = read()
  if (current?.fingerprint === fingerprint) return current.key
  const next = { fingerprint, key: crypto.randomUUID() }
  try {
    sessionStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* sem storage: a chave vive só nesta tentativa */
  }
  return next.key
}

export function clearIdempotencyKey() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* noop */
  }
}
