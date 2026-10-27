import { z } from 'zod'

/** Contrato do evento `nft.updated` no transporte (docs/contracts/events.md). */
export const nftUpdatedDto = z.object({
  id: z.string().min(1),
  resource: z.object({ type: z.literal('nft'), id: z.string().min(1) }),
  version: z.number().int().nonnegative(),
  occurredAt: z.string(),
  data: z.object({
    priceEth: z.string().regex(/^\d+(\.\d{1,18})?$/),
    editions: z.array(z.object({ label: z.string(), available: z.number().int().nonnegative() })),
  }),
})
export type NftUpdatedDto = z.infer<typeof nftUpdatedDto>
