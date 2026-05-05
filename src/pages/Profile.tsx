import { useState, useCallback } from 'react'
import { User, Search, Trophy, Gift, MapPin, Clock, AlertCircle } from 'lucide-react'
import { api, type PlayerHistory, type PlayerHistoryEntry } from '../lib/api'

// ── Status badge ──────────────────────────────────────────────────────────────
function HistoryStatusBadge({ status }: { status: string }) {
  if (status === 'redeemed') return <span className="badge badge-blue">✓ Utilizado</span>
  if (status === 'expired')  return <span className="badge badge-pink">Expirado</span>
  return <span className="badge badge-green"><span className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--neon-green)', display: 'inline-block' }} /> Disponível</span>
}

// ── History entry row ─────────────────────────────────────────────────────────
function HistoryRow({ entry, index }: { entry: PlayerHistoryEntry; index: number }) {
  const date = new Date(entry.date)
  const formatted = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })

  return (
    <div
      className="card"
      style={{
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        padding: '1rem 1.25rem',
        animationDelay: `${index * 0.06}s`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.3 }}>
            {entry.prizeName}
          </p>
          {(entry.machineName || entry.location) && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.3rem' }}>
              <MapPin size={10} />
              {entry.machineName ?? entry.location}
            </p>
          )}
        </div>
        <HistoryStatusBadge status={entry.status} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.73rem' }}>
        <Clock size={10} /> {formatted}
      </div>
    </div>
  )
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar({ history }: { history: PlayerHistory }) {
  const total    = history.prizes.length
  const redeemed = history.prizes.filter(p => p.status === 'redeemed').length
  const pending  = history.prizes.filter(p => p.status !== 'redeemed' && p.status !== 'expired').length

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '0.75rem',
      marginBottom: '1.75rem',
    }}>
      {[
        { label: 'Total de Prêmios', value: total, color: 'var(--neon-blue)' },
        { label: 'Utilizados', value: redeemed, color: 'var(--neon-green)' },
        { label: 'Disponíveis', value: pending, color: 'var(--neon-yellow)' },
        ...(history.rankingPosition != null
          ? [{ label: 'Posição Ranking', value: `#${history.rankingPosition}`, color: 'var(--neon-pink)' }]
          : []),
        ...(history.bestScore != null
          ? [{ label: 'Melhor Score', value: history.bestScore.toLocaleString('pt-BR'), color: 'var(--neon-pink)' }]
          : []),
      ].map(stat => (
        <div
          key={stat.label}
          className="card"
          style={{ padding: '1rem', textAlign: 'center', cursor: 'default' }}
        >
          <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.4rem', fontWeight: 900, color: stat.color }}>
            {stat.value}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.25rem', fontFamily: 'Orbitron, monospace', letterSpacing: '0.04em' }}>
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Profile() {
  const [query, setQuery]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [history, setHistory]   = useState<PlayerHistory | null>(null)
  const [searched, setSearched] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  const search = useCallback(async () => {
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setSearched(false)
    setHistory(null)
    setNotFound(false)
    setUnavailable(false)

    const result = await api.playerHistory(q)
    setLoading(false)
    setSearched(true)

    if (result === null) {
      // endpoint returned null — either not available or truly no result
      setUnavailable(true)
      return
    }
    if (!result.prizes || result.prizes.length === 0) {
      setNotFound(true)
      return
    }
    setHistory(result)
  }, [query])

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') search()
  }

  return (
    <div className="section">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge badge-blue" style={{ marginBottom: '0.75rem' }}>
          <User size={10} /> PERFIL
        </span>
        <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', marginBottom: '0.5rem' }}>
          Meu Histórico
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Pesquise pelo seu apelido ou telefone para ver seus prêmios e posição no ranking.
        </p>
      </div>

      {/* Search box */}
      <div style={{ maxWidth: 520, marginBottom: '2.5rem' }}>
        <div style={{ position: 'relative', display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{
              position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }} />
            <input
              placeholder="Apelido ou telefone..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              style={{ paddingLeft: '2.5rem' }}
              autoComplete="off"
            />
          </div>
          <button
            className="btn-neon btn-primary"
            onClick={search}
            disabled={loading || !query.trim()}
            style={{ whiteSpace: 'nowrap', opacity: loading || !query.trim() ? 0.5 : 1 }}
          >
            {loading ? '...' : 'Buscar'}
          </button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.6rem' }}>
          Ex: "SuperJogador" ou "11999998888"
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="skeleton" style={{ height: 88, borderRadius: 12 }} />
          ))}
        </div>
      )}

      {/* Endpoint unavailable */}
      {!loading && searched && unavailable && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '1rem', padding: '3rem 1rem', textAlign: 'center',
          color: 'var(--text-muted)',
        }}>
          <AlertCircle size={40} style={{ opacity: 0.35 }} />
          <div>
            <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.88rem', marginBottom: '0.4rem' }}>
              Histórico indisponível no momento
            </p>
            <p style={{ fontSize: '0.8rem' }}>
              Este recurso ainda está sendo ativado. Tente novamente em breve.
            </p>
          </div>
        </div>
      )}

      {/* Not found */}
      {!loading && searched && notFound && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '1rem', padding: '3rem 1rem', textAlign: 'center',
          color: 'var(--text-muted)',
        }}>
          <User size={40} style={{ opacity: 0.3 }} />
          <div>
            <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.88rem', marginBottom: '0.4rem' }}>
              Nenhum histórico encontrado
            </p>
            <p style={{ fontSize: '0.8rem' }}>
              Verifique o apelido ou telefone e tente novamente.
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && history && (
        <div className="slide-in">
          {/* Player identity header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            marginBottom: '1.75rem',
            padding: '1rem 1.25rem',
            background: 'rgba(0, 212, 255, 0.05)',
            border: '1px solid rgba(0, 212, 255, 0.15)',
            borderRadius: 12,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(255,45,120,0.2))',
              border: '2px solid rgba(0,212,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <User size={22} color="var(--neon-blue)" />
            </div>
            <div>
              <p style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1rem' }}>
                {history.nickname}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                {history.rankingPosition != null && (
                  <span className="badge badge-pink" style={{ fontSize: '0.65rem' }}>
                    <Trophy size={9} /> #{history.rankingPosition} Ranking
                  </span>
                )}
                <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>
                  <Gift size={9} /> {history.prizes.length} prêmio{history.prizes.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <StatsBar history={history} />

          {/* Prize list */}
          <p style={{
            color: 'var(--text-muted)', fontSize: '0.75rem',
            fontFamily: 'Orbitron, monospace', letterSpacing: '0.06em',
            marginBottom: '1rem',
          }}>
            HISTÓRICO DE PRÊMIOS
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.prizes.map((entry, i) => (
              <HistoryRow key={i} entry={entry} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Initial state — no search yet */}
      {!loading && !searched && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '1rem', padding: '4rem 1rem', textAlign: 'center',
          color: 'var(--text-muted)',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(0,212,255,0.06)',
            border: '1px solid rgba(0,212,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User size={30} style={{ opacity: 0.4 }} />
          </div>
          <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.85rem' }}>
            Digite seu apelido ou telefone para começar
          </p>
        </div>
      )}
    </div>
  )
}
