import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface Remaining { h: number; m: number; s: number; totalMs: number }

function calc(isoDate: string): Remaining | null {
  const diff = new Date(isoDate).getTime() - Date.now()
  if (diff <= 0) return null
  return {
    h: Math.floor(diff / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1_000),
    totalMs: diff,
  }
}

function pad(n: number) { return String(n).padStart(2, '0') }

interface Props {
  expiresAt: string
  onExpired?: () => void
}

export default function CountdownTimer({ expiresAt, onExpired }: Props) {
  const [remaining, setRemaining] = useState<Remaining | null>(() => calc(expiresAt))

  useEffect(() => {
    const id = setInterval(() => {
      const r = calc(expiresAt)
      setRemaining(r)
      if (!r) onExpired?.()
    }, 1_000)
    return () => clearInterval(id)
  }, [expiresAt, onExpired])

  if (!remaining) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.35rem 0.85rem', borderRadius: 8,
        background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.25)',
        color: 'var(--neon-pink)', fontSize: '0.8rem', fontFamily: 'Orbitron, monospace',
      }}>
        <Clock size={12} /> EXPIRADO
      </div>
    )
  }

  // Urgency: red when < 10 min
  const urgent = remaining.totalMs < 10 * 60_000
  const color = urgent ? 'var(--neon-pink)' : remaining.totalMs < 30 * 60_000 ? 'var(--neon-yellow)' : 'var(--neon-green)'
  const bg    = urgent ? 'rgba(255,45,120,0.08)'  : remaining.totalMs < 30 * 60_000 ? 'rgba(255,215,0,0.08)' : 'rgba(0,255,159,0.08)'
  const bdr   = urgent ? 'rgba(255,45,120,0.25)'  : remaining.totalMs < 30 * 60_000 ? 'rgba(255,215,0,0.25)' : 'rgba(0,255,159,0.25)'

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.35rem 0.9rem', borderRadius: 8,
      background: bg, border: `1px solid ${bdr}`,
      color, fontSize: '0.85rem', fontFamily: 'Orbitron, monospace',
      animation: urgent ? 'pulseGlow 1s ease-in-out infinite' : 'none',
    }}>
      <Clock size={13} />
      {remaining.h > 0 && <>{pad(remaining.h)}h </>}
      {pad(remaining.m)}m {pad(remaining.s)}s
    </div>
  )
}
