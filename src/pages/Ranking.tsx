import { useEffect, useRef, useState, useCallback } from 'react'
import { Trophy, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { api, type RankingEntry } from '../lib/api'
import LoadingSpinner, { ErrorState } from '../components/LoadingSpinner'

const POLL_INTERVAL = 10_000 // 10 seconds

// ── Podium card ──────────────────────────────────────────────────────────────
function PodiumCard({ entry, place }: { entry: RankingEntry; place: 1 | 2 | 3 }) {
  const config = {
    1: { border: 'rgba(255,215,0,0.4)', bg: 'rgba(255,215,0,0.07)', neon: '#ffd700', emoji: '🥇', pedestal: 90 },
    2: { border: 'rgba(192,192,192,0.3)', bg: 'rgba(192,192,192,0.04)', neon: '#c0c0c0', emoji: '🥈', pedestal: 60 },
    3: { border: 'rgba(205,127,50,0.3)', bg: 'rgba(205,127,50,0.04)', neon: '#cd7f32', emoji: '🥉', pedestal: 40 },
  }[place]

  return (
    <div style={{
      flex: 1, minWidth: 130, maxWidth: 200,
      background: config.bg,
      border: `1px solid ${config.border}`,
      borderRadius: 12,
      padding: '1.25rem 0.75rem',
      textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem',
      boxShadow: place === 1 ? `0 0 40px rgba(255,215,0,0.12)` : 'none',
    }}>
      <div style={{ fontSize: place === 1 ? '2.2rem' : '1.8rem' }}>{config.emoji}</div>
      <p style={{
        fontFamily: 'Orbitron, monospace', fontWeight: 900,
        fontSize: place === 1 ? '1rem' : '0.88rem',
        color: config.neon, wordBreak: 'break-all',
      }}>
        {entry.nickname}
      </p>
      {entry.score != null && (
        <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.78rem', color: 'var(--neon-green)' }}>
          {entry.score.toLocaleString()} pts
        </p>
      )}
      {entry.machineName && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{entry.machineName}</p>
      )}
      <div style={{
        width: '100%', height: config.pedestal,
        background: `linear-gradient(180deg, ${config.bg}, transparent)`,
        borderTop: `2px solid ${config.border}`,
        borderRadius: '0 0 8px 8px',
        marginTop: '0.35rem',
      }} />
    </div>
  )
}

// ── Position change indicator ────────────────────────────────────────────────
type Movement = 'up' | 'down' | 'same'

function MovementIcon({ dir }: { dir: Movement }) {
  if (dir === 'up')   return <TrendingUp  size={13} color="var(--neon-green)" />
  if (dir === 'down') return <TrendingDown size={13} color="var(--neon-pink)" />
  return <Minus size={13} color="var(--text-muted)" style={{ opacity: 0.4 }} />
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function Ranking() {
  const [entries, setEntries] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Track previous positions to detect movement
  const prevPositions = useRef<Map<string, number>>(new Map())
  const [movement, setMovement] = useState<Map<string, Movement>>(new Map())
  const movementTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const applyNewData = useCallback((data: RankingEntry[]) => {
    const newMovement = new Map<string, Movement>()
    data.forEach(e => {
      const prev = prevPositions.current.get(e.nickname)
      if (prev === undefined) {
        newMovement.set(e.nickname, 'same')
      } else if (e.position < prev) {
        newMovement.set(e.nickname, 'up')
      } else if (e.position > prev) {
        newMovement.set(e.nickname, 'down')
      } else {
        newMovement.set(e.nickname, 'same')
      }
    })
    prevPositions.current = new Map(data.map(e => [e.nickname, e.position]))
    setMovement(newMovement)
    setEntries(data)
    setLastUpdated(new Date())

    // Clear movement arrows after 4s
    if (movementTimer.current) clearTimeout(movementTimer.current)
    const hasChange = [...newMovement.values()].some(v => v !== 'same')
    if (hasChange) {
      movementTimer.current = setTimeout(
        () => setMovement(m => new Map([...m].map(([k]) => [k, 'same' as Movement]))),
        4000,
      )
    }
  }, [])

  const load = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      const data = await api.ranking()
      applyNewData(data)
      setError('')
    } catch {
      setError('Não foi possível carregar o ranking.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [applyNewData])

  // Initial load + 10s polling
  useEffect(() => {
    load()
    const id = setInterval(() => load(), POLL_INTERVAL)
    return () => {
      clearInterval(id)
      if (movementTimer.current) clearTimeout(movementTimer.current)
    }
  }, [load])

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="section">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-yellow" style={{ marginBottom: '0.75rem' }}>
            <Trophy size={10} /> RANKING GLOBAL
          </span>
          <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)' }}>Os Melhores Jogadores</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Atualiza automaticamente a cada 10 segundos.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="btn-neon btn-outline"
            style={{ fontSize: '0.8rem', padding: '0.6rem 1.2rem' }}
          >
            <RefreshCw
              size={14}
              style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}
            />
            Atualizar
          </button>
          {lastUpdated && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'Orbitron, monospace' }}>
              {formatTime(lastUpdated)}
            </p>
          )}
        </div>
      </div>

      {loading && <LoadingSpinner text="Carregando ranking..." />}
      {error && !loading && <ErrorState message={error} />}

      {!loading && !error && entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <Trophy size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.9rem' }}>
            Nenhum jogador no ranking ainda.<br />Seja o primeiro!
          </p>
        </div>
      )}

      {entries.length > 0 && (
        <>
          {/* Podium */}
          {top3.length > 0 && (
            <div style={{ marginBottom: '3rem' }}>
              <div style={{
                display: 'flex', gap: '0.75rem', alignItems: 'flex-end',
                justifyContent: 'center', flexWrap: 'wrap',
              }}>
                {top3[1] && <PodiumCard entry={top3[1]} place={2} />}
                {top3[0] && <PodiumCard entry={top3[0]} place={1} />}
                {top3[2] && <PodiumCard entry={top3[2]} place={3} />}
              </div>
            </div>
          )}

          {/* Rest of ranking */}
          {rest.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {/* Header row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '40px 20px 1fr auto auto',
                gap: '0.75rem',
                padding: '0.5rem 1rem',
                color: 'var(--text-muted)',
                fontSize: '0.72rem',
                fontFamily: 'Orbitron, monospace',
                letterSpacing: '0.08em',
              }}>
                <span>#</span>
                <span />
                <span>JOGADOR</span>
                <span style={{ textAlign: 'right' }}>MÁQUINA</span>
                <span style={{ textAlign: 'right' }}>PTS</span>
              </div>

              {rest.map((entry) => {
                const dir = movement.get(entry.nickname) ?? 'same'
                return (
                  <div
                    key={entry.nickname + entry.position}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 20px 1fr auto auto',
                      gap: '0.75rem',
                      alignItems: 'center',
                      padding: '0.85rem 1rem',
                      background: dir === 'up'
                        ? 'rgba(0,255,159,0.04)'
                        : dir === 'down'
                          ? 'rgba(255,45,120,0.04)'
                          : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${dir === 'up' ? 'rgba(0,255,159,0.12)' : dir === 'down' ? 'rgba(255,45,120,0.12)' : 'rgba(0,212,255,0.07)'}`,
                      borderRadius: 10,
                      transition: 'background 0.5s, border-color 0.5s',
                    }}
                  >
                    <span style={{
                      fontFamily: 'Orbitron, monospace', fontSize: '0.82rem',
                      color: 'var(--text-muted)', textAlign: 'center', fontWeight: 700,
                    }}>
                      {entry.position}
                    </span>

                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <MovementIcon dir={dir} />
                    </span>

                    <span style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.nickname}
                    </span>

                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.machineName ?? '—'}
                    </span>

                    <span style={{
                      fontFamily: 'Orbitron, monospace', fontSize: '0.8rem',
                      color: 'var(--neon-green)', fontWeight: 700, textAlign: 'right',
                      whiteSpace: 'nowrap',
                    }}>
                      {entry.score != null ? entry.score.toLocaleString() : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Live indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-green">
              <span className="pulse" style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--neon-green)', display: 'inline-block',
              }} />
              Ao vivo · atualiza em 10s
            </span>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
