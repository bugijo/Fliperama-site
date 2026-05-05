import { Link } from 'react-router-dom'
import { Gamepad2 } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-card)',
      padding: '2.5rem 1.5rem',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between',
        gap: '1.5rem',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <Gamepad2 size={20} color="var(--neon-green)" />
          <span style={{
            fontFamily: 'Orbitron, monospace', fontWeight: 900,
            fontSize: '1rem',
            background: 'linear-gradient(90deg, #00ff9f, #00d4ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            PLAYPRIZE
          </span>
        </Link>

        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
          {[
            { to: '/mapa', label: 'Mapa' },
            { to: '/ranking', label: 'Ranking' },
            { to: '/premios', label: 'Prêmios' },
            { to: '/como-funciona', label: 'Como Funciona' },
          ].map(l => (
            <Link
              key={l.to}
              to={l.to}
              style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} PlayPrize. Jogue. Ganhe. Resgate.
        </p>
      </div>
    </footer>
  )
}
