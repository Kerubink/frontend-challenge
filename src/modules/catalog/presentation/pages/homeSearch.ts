import { z } from 'zod'

// Valores da URL podem chegar como número (JSON); normaliza para string.
const text = z.preprocess((v) => (v == null || v === '' ? undefined : String(v)), z.string().optional()).catch(undefined)
const decimal = z.preprocess((v) => (v == null || v === '' ? undefined : String(v)), z.string().regex(/^\d+(\.\d+)?$/).optional()).catch(undefined)

/** Estado do catálogo na URL: sobrevive a refresh e navegação pelo histórico. */
export const homeSearchSchema = z.object({
  q: text,
  collection: text,
  rarity: z.enum(['Comum', 'Raro', 'Épico']).optional().catch(undefined),
  minPrice: decimal,
  maxPrice: decimal,
  sort: z.enum(['recent', 'price-asc', 'price-desc', 'name']).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
})
export type HomeSearchInput = z.infer<typeof homeSearchSchema>
/** Estado normalizado (com padrões aplicados) usado pela página. */
export type HomeSearch = Omit<HomeSearchInput, 'sort' | 'page'> & { sort: 'recent' | 'price-asc' | 'price-desc' | 'name'; page: number }
export const normalizeHomeSearch = (s: HomeSearchInput): HomeSearch => ({ ...s, sort: s.sort ?? 'recent', page: s.page ?? 1 })

/** Entrada opcional nos links; saída sempre normalizada. */
export const validateHomeSearch = (search: Record<string, unknown>): HomeSearchInput => homeSearchSchema.parse(search)
