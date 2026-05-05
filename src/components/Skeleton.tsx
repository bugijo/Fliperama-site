/** Reusable shimmer-skeleton blocks. */

interface BlockProps {
  width?: string | number
  height?: string | number
  radius?: string | number
  style?: React.CSSProperties
}

export function SkeletonBlock({ width = '100%', height = 16, radius = 6, style }: BlockProps) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}

/** Skeleton for a prize card */
export function PrizeCardSkeleton() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <SkeletonBlock height={155} radius={8} />
      <SkeletonBlock width="70%" height={14} />
      <SkeletonBlock width="90%" height={12} />
      <SkeletonBlock width="55%" height={12} />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 4 }}>
        <SkeletonBlock width={80} height={22} radius={999} />
        <SkeletonBlock width={60} height={22} radius={999} />
      </div>
    </div>
  )
}

/** Skeleton for a ranking row */
export function RankingRowSkeleton() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '40px 20px 1fr auto auto',
      gap: '0.75rem', alignItems: 'center',
      padding: '0.85rem 1rem',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(0,212,255,0.07)',
      borderRadius: 10,
    }}>
      <SkeletonBlock width={32} height={14} radius={4} />
      <SkeletonBlock width={14} height={14} radius={4} />
      <SkeletonBlock width="60%" height={14} radius={4} />
      <SkeletonBlock width={70} height={14} radius={4} />
      <SkeletonBlock width={50} height={14} radius={4} />
    </div>
  )
}
