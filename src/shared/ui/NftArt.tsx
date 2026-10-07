import { cn } from '@/shared/lib/cn'

const PALETTE = [
  'var(--primary)',
  'var(--text-accent)',
  'var(--brand-secondary)',
  'var(--text-secondary)',
  'var(--text-coral)',
  'var(--surface-raised)',
]

function rng(seed: number) {
  let s = seed || 1
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

/**
 * Arte determinística do NFT gerada em SVG com os tokens do tema.
 * Substitui os assets do Figma (não disponíveis) — documentar em ARCHITECTURE.md.
 */
export function NftArt({ seed, alt, variant = 0, className }: { seed: number; alt: string; variant?: number; className?: string }) {
  const r = rng(seed * 31 + variant * 7 + 3)
  const shapes = Array.from({ length: 6 }, (_, i) => ({
    cx: 10 + r() * 80,
    cy: 10 + r() * 80,
    size: 8 + r() * 26,
    fill: PALETTE[Math.floor(r() * PALETTE.length)],
    round: r() > 0.5,
    key: i,
  }))
  return (
    <svg role="img" aria-label={alt} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className={cn('block size-full', className)}>
      <rect width="100" height="100" fill="var(--surface-dark)" />
      {shapes.map((s) =>
        s.round ? (
          <circle key={s.key} cx={s.cx} cy={s.cy} r={s.size} fill={s.fill} opacity={0.85} />
        ) : (
          <rect key={s.key} x={s.cx - s.size} y={s.cy - s.size} width={s.size * 2} height={s.size * 2} rx={4} fill={s.fill} opacity={0.85} />
        ),
      )}
    </svg>
  )
}
