import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Gamepad2, Menu, X } from 'lucide-react'

const links = [
  { to: '/', label: 'Home' },
  { to: '/mapa', label: 'Mapa' },
  { to: '/ranking', label: 'Ranking' },
  { to: '/premios', label: 'Prêmios' },
  { to: '/como-funciona', label: 'Como Funciona' },
  { to: '/perfil', label: 'Perfil' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(7, 7, 15, 0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(0, 212, 255, 0.12)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 1.5rem',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #00ff9f, #00d4ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(0, 255, 159, 0.5)',
          }}>
            <Gamepad2 size={20} color="#07070f" strokeWidth={2.5} />
          </div>
          <span style={{
            fontFamily: 'Orbitron, monospace', fontWeight: 900,
            fontSize: '1.1rem', letterSpacing: '0.05em',
            background: 'linear-gradient(90deg, #00ff9f, #00d4ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            PLAYPRIZE
          </span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: '0.25rem' }} className="desktop-nav">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              style={({ isActive }) => ({
                padding: '0.5rem 0.9rem',
                borderRadius: 6,
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontFamily: 'Orbitron, monospace',
                fontWeight: 600,
                letterSpacing: '0.05em',
                color: isActive ? 'var(--neon-green)' : 'var(--text-muted)',
                background: isActive ? 'rgba(0, 255, 159, 0.08)' : 'transparent',
                transition: 'color 0.2s, background 0.2s',
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 4 }}
          className="mobile-menu-btn"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          padding: '1rem 1.5rem',
          display: 'flex', flexDirection: 'column', gap: '0.25rem',
        }}>
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                padding: '0.75rem 1rem',
                borderRadius: 8,
                textDecoration: 'none',
                fontFamily: 'Orbitron, monospace',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: isActive ? 'var(--neon-green)' : 'var(--text)',
                background: isActive ? 'rgba(0, 255, 159, 0.08)' : 'transparent',
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-menu-btn { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
