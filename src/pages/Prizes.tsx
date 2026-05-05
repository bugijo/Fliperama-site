import { useEffect, useState, useMemo } from 'react'
import { Gift, MapPin, Zap, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { api, type Prize } from '../lib/api'
import { PrizeCardSkeleton } from '../components/Skeleton'
import { ErrorState } from '../components/LoadingSpinner'

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status?: string }) {
  if (!status || status === 'pending') {
    return <span className="badge badge-green"><span className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--neon-green)', display: 'inline-block' }} /> Disponível</span>
  }
  if (status === 'redeemed') return <span className="badge badge-blue">✓ Utilizado</span>
  if (status === 'expired')  return <span className="badge badge-pink">Expirado</span>
  return null
}

// ── Prize card ────────────────────────────────────────────────────────────────
function PrizeCard({ prize }: { prize: Prize }) {
  return (
    <div
      className="card card-glow-pink"
      style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', cursor: 'default' }}
    >
      {/* Image */}
      <div style={{
        width: '100%', aspectRatio: '16/9', borderRadius: 8,
        background: 'linear-gradient(135deg, rgba(255,45,120,0.08), rgba(0,212,255,0.08))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(255,45,120,0.12)',
        overflow: 'hidden', flexShrink: 0,
      }}>
        {prize.imageUrl
          ? <img src={prize.imageUrl} alt={prize.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '3rem' }}>🎁</span>
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        <h3 style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.9rem', lineHeight: 1.3 }}>
          {prize.name}
        </h3>

        {prize.description && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
            {prize.description}
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.4rem', alignItems: 'center' }}>
          <StatusBadge />
          {prize.value != null && (
            <span className="badge badge-yellow">R$ {prize.value.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Machine group ─────────────────────────────────────────────────────────────
function MachineGroup({ groupKey, prizes }: { groupKey: string; prizes: Prize[] }) {
  const [expanded, setExpanded] = useState(true)
  const sample = prizes[0]

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* Group header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '0.75rem 0', width: '100%', textAlign: 'left',
          borderBottom: '1px solid rgba(0,212,255,0.1)',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'rgba(255,45,120,0.1)',
          border: '1px solid rgba(255,45,120,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Zap size={16} color="var(--neon-pink)" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'Orbitron, monospace', fontWeight: 700,
            fontSize: '0.9rem', color: 'var(--text)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {groupKey}
          </p>
          {sample.location && groupKey !== sample.location && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: 2 }}>
              <MapPin size={10} /> {sample.location}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <span className="badge badge-pink" style={{ fontSize: '0.68rem' }}>
            {prizes.length} prêmio{prizes.length !== 1 ? 's' : ''}
          </span>
          {expanded
            ? <ChevronUp size={16} color="var(--text-muted)" />
            : <ChevronDown size={16} color="var(--text-muted)" />
          }
        </div>
      </button>

      {/* Prize grid */}
      {expanded && (
        <div
          className="stagger"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {prizes.map(p => <PrizeCard key={p.id} prize={p} />)}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Prizes() {
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.prizes()
      .then(setPrizes)
      .catch(() => setError('Não foi possível carregar os prêmios.'))
      .finally(() => setLoading(false))
  }, [])

  // Filter by search
  const filtered = useMemo(() => {
    if (!search.trim()) return prizes
    const q = search.toLowerCase()
    return prizes.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.machineName ?? '').toLowerCase().includes(q) ||
      (p.location ?? '').toLowerCase().includes(q)
    )
  }, [prizes, search])

  // Group by machine name, then location, then "Outros"
  const groups = useMemo(() => {
    const map = new Map<string, Prize[]>()
    for (const p of filtered) {
      const key = p.machineName || p.location || 'Outros'
      const list = map.get(key) ?? []
      list.push(p)
      map.set(key, list)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtered])

  return (
    <div className="section">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge badge-pink" style={{ marginBottom: '0.75rem' }}>
          <Gift size={10} /> PRÊMIOS
        </span>
        <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', marginBottom: '0.5rem' }}>
          Prêmios Disponíveis
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Veja o que pode ganhar em cada máquina. Jogue, ganhe, resgate.
        </p>
      </div>

      {/* Search */}
      {!loading && prizes.length > 0 && (
        <div style={{ position: 'relative', maxWidth: 440, marginBottom: '2rem' }}>
          <Search size={15} style={{
            position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            placeholder="Buscar prêmio ou máquina..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {Array.from({ length: 6 }, (_, i) => <PrizeCardSkeleton key={i} />)}
        </div>
      )}

      {error && <ErrorState message={error} />}

      {/* Empty states */}
      {!loading && !error && prizes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <Gift size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.9rem' }}>
            Nenhum prêmio disponível ainda.<br />Fique de olho!
          </p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && prizes.length > 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.85rem' }}>
            Nenhum resultado para "<strong>{search}</strong>".
          </p>
        </div>
      )}

      {/* Groups */}
      {!loading && !error && groups.length > 0 && (
        <div>
          <p style={{
            color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '1.75rem',
            fontFamily: 'Orbitron, monospace', letterSpacing: '0.06em',
          }}>
            {filtered.length} prêmio{filtered.length !== 1 ? 's' : ''} em {groups.length} máquina{groups.length !== 1 ? 's' : ''}
          </p>

          {groups.map(([key, list]) => (
            <MachineGroup key={key} groupKey={key} prizes={list} />
          ))}
        </div>
      )}
    </div>
  )
}
