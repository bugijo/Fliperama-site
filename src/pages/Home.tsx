import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Trophy, Zap, ChevronRight, Star, Coins } from 'lucide-react'
import { api, type RankingEntry, type Machine } from '../lib/api'

function RankingTicker({ entries }: { entries: RankingEntry[] }) {
  if (!entries.length) return null
  const doubled = [...entries, ...entries]

  return (
    <div style={{
      background: 'rgba(0, 212, 255, 0.06)',
      borderTop: '1px solid rgba(0, 212, 255, 0.12)',
      borderBottom: '1px solid rgba(0, 212, 255, 0.12)',
      overflow: 'hidden',
      padding: '0.6rem 0',
    }}>
      <div className="ticker-track">
        {doubled.map((e, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0 2rem',
            fontFamily: 'Orbitron, monospace', fontSize: '0.78rem',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
          }}>
            <Trophy size={12} color="var(--neon-yellow)" />
            <span style={{ color: 'var(--neon-yellow)' }}>#{e.position}</span>
            <span style={{ color: 'var(--text)' }}>{e.nickname}</span>
            {e.score != null && (
              <span style={{ color: 'var(--neon-green)' }}>{e.score.toLocaleString()} pts</span>
            )}
            {e.location && <span>— {e.location}</span>}
            <span style={{ color: 'rgba(0,212,255,0.3)', marginLeft: '0.5rem' }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function MachineCard({ machine }: { machine: Machine }) {
  return (
    <div className="card" style={{ cursor: 'default' }}>
      <div style={{
        width: '100%', height: 140, borderRadius: 8, marginBottom: '1rem',
        background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(255,45,120,0.08))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(0,212,255,0.1)',
        overflow: 'hidden',
      }}>
        {machine.imageUrl
          ? <img src={machine.imageUrl} alt={machine.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '3rem' }}>🕹️</span>
        }
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
            {machine.name}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={12} /> {machine.location}
          </p>
        </div>
        <span className={`badge ${machine.status === 'maintenance' ? 'badge-pink' : 'badge-green'}`}>
          {machine.status === 'maintenance' ? 'Manutenção' : 'Ativa'}
        </span>
      </div>
    </div>
  )
}

export default function Home() {
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [machines, setMachines] = useState<Machine[]>([])

  useEffect(() => {
    api.ranking().then(setRanking).catch(() => {})
    api.machines().then(setMachines).catch(() => {})
  }, [])

  const topMachines = machines.slice(0, 3)

  return (
    <div>
      {/* Ranking ticker */}
      <RankingTicker entries={ranking} />

      {/* Hero */}
      <section className="grid-bg" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,159,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="section" style={{ textAlign: 'center', position: 'relative' }}>
          <div className="badge badge-blue" style={{ marginBottom: '1.5rem' }}>
            <Zap size={10} /> AO VIVO AGORA
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 7vw, 4.5rem)',
            lineHeight: 1.1,
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
          }}>
            <span className="glow-green" style={{ color: 'var(--neon-green)' }}>JOGUE.</span>{' '}
            <span className="glow-pink" style={{ color: 'var(--neon-pink)' }}>GANHE.</span>{' '}
            <span className="glow-blue" style={{ color: 'var(--neon-blue)' }}>RESGATE.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: 'var(--text-muted)',
            maxWidth: 560,
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}>
            Fliperama real. Prêmios reais. Encontre a máquina mais próxima,
            dispute o ranking e resgate sua recompensa na hora.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/mapa" className="btn-neon btn-primary">
              <MapPin size={16} /> Ver Mapa
            </Link>
            <Link to="/como-funciona" className="btn-neon btn-outline">
              Como Funciona <ChevronRight size={16} />
            </Link>
          </div>

          {/* Stats bar */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            gap: '2rem', marginTop: '4rem',
          }}>
            {[
              { icon: <MapPin size={18} />, value: machines.length || '?', label: 'Máquinas ativas' },
              { icon: <Trophy size={18} />, value: ranking.length || '?', label: 'Jogadores no ranking' },
              { icon: <Star size={18} />, value: '24h', label: 'Suporte ao resgate' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--neon-blue)', marginBottom: '0.35rem', display: 'flex', justifyContent: 'center' }}>
                  {s.icon}
                </div>
                <div style={{
                  fontFamily: 'Orbitron, monospace', fontWeight: 900,
                  fontSize: '1.8rem', color: 'var(--text)',
                }}>
                  {s.value}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Machines highlight */}
      {topMachines.length > 0 && (
        <section className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-pink" style={{ marginBottom: '0.75rem' }}>
                <Zap size={10} /> DESTAQUE
              </span>
              <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)' }}>Máquinas em Destaque</h2>
            </div>
            <Link to="/mapa" className="btn-neon btn-outline" style={{ fontSize: '0.8rem', padding: '0.6rem 1.2rem' }}>
              Ver todas <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            {topMachines.map(m => <MachineCard key={m.id} machine={m} />)}
          </div>
        </section>
      )}

      {/* Top ranking preview */}
      {ranking.length > 0 && (
        <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge badge-yellow" style={{ marginBottom: '0.75rem' }}>
                  <Trophy size={10} /> AO VIVO
                </span>
                <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)' }}>Ranking Global</h2>
              </div>
              <Link to="/ranking" className="btn-neon btn-outline" style={{ fontSize: '0.8rem', padding: '0.6rem 1.2rem' }}>
                Ranking completo <ChevronRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {ranking.slice(0, 5).map((entry, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem 1.25rem',
                  background: i === 0 ? 'rgba(255, 215, 0, 0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${i === 0 ? 'rgba(255,215,0,0.2)' : 'rgba(0,212,255,0.08)'}`,
                  borderRadius: 10,
                }}>
                  <span style={{
                    fontFamily: 'Orbitron, monospace', fontWeight: 900,
                    fontSize: '1rem', minWidth: 32, textAlign: 'center',
                    color: i === 0 ? 'var(--neon-yellow)' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--text-muted)',
                  }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${entry.position}`}
                  </span>
                  <span style={{ flex: 1, fontWeight: 600 }}>{entry.nickname}</span>
                  {entry.machineName && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{entry.machineName}</span>
                  )}
                  {entry.score != null && (
                    <span style={{
                      fontFamily: 'Orbitron, monospace', fontSize: '0.85rem',
                      color: 'var(--neon-green)', fontWeight: 700,
                    }}>
                      {entry.score.toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA banner */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,255,159,0.08), rgba(0,212,255,0.08))',
          border: '1px solid rgba(0,255,159,0.2)',
          borderRadius: 16, padding: 'clamp(2rem, 5vw, 3.5rem)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -60, right: -60,
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,255,159,0.08) 0%, transparent 70%)',
          }} />
          <Coins size={40} color="var(--neon-green)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', marginBottom: '0.75rem' }}>
            Pronto para ganhar?
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: 420, margin: '0 auto 2rem' }}>
            Encontre uma máquina perto de você, jogue, e resgate seu prêmio com apenas nome e WhatsApp.
          </p>
          <Link to="/mapa" className="btn-neon btn-primary">
            <MapPin size={16} /> Encontrar Máquina
          </Link>
        </div>
      </section>
    </div>
  )
}
