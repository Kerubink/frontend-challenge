import type { NftUpdatedEvent } from '../../domain/events/nft-updated'
import { nftUpdatedDto } from '../dtos/events'

/** DTO → domínio. Payload inválido é descartado (retorna null) em vez de quebrar a UI. */
export function toNftUpdated(payload: unknown): NftUpdatedEvent | null {
  const parsed = nftUpdatedDto.safeParse(payload)
  return parsed.success ? parsed.data : null
}
