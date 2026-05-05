import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Gamepad2, Navigation, ExternalLink } from 'lucide-react'
import { api, type Machine } from '../lib/api'
import LoadingSpinner, { ErrorState } from '../components/LoadingSpinner'

// ── Custom SVG markers ────────────────────────────────────────────────────────
function makeSvgIcon(fill: string, stroke: string) {
  return new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">
        <ellipse cx="16" cy="41" rx="6" ry="2.5" fill="rgba(0,0,0,0.35)"/>
        <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 28 16 28S32 28 32 16C32 7.16 24.84 0 16 0z"
          fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="7" fill="${stroke}" opacity="0.9"/>
        <path d="M12 16h8M16 12v8" stroke="${fill}" stroke-width="2.2" stroke-linecap="round"/>
      </svg>
    `),
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -44],
  })
}

function makeSelectedIcon(fill: string, stroke: string) {
  return new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="38" height="52" viewBox="0 0 38 52">
        <ellipse cx="19" cy="49" rx="7" ry="3" fill="rgba(0,0,0,0.4)"/>
        <path d="M19 0C8.51 0 0 8.51 0 19c0 14 19 33 19 33S38 33 38 19C38 8.51 29.49 0 19 0z"
          fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <circle cx="19" cy="19" r="9" fill="${stroke}"/>
        <path d="M14 19h10M19 14v10" stroke="${fill}" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    `),
    iconSize: [38, 52],
    iconAnchor: [19, 52],
    popupAnchor: [0, -52],
  })
}

const icons = {
  active:             makeSvgIcon('#00ff9f', '#07070f'),
  maintenance:        makeSvgIcon('#ff2d78', '#07070f'),
  activeSelected:     makeSelectedIcon('#00ff9f', '#07070f'),
  maintenanceSelected:makeSelectedIcon('#ff2d78', '#07070f'),
}

// ── Map controller: fly to selected machine ──────────────────────────────────
function MapFlyTo({ target }: { target: Machine | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 16, { duration: 0.8 })
  }, [target, map])
  return null
}

// ── Google Maps route link ────────────────────────────────────────────────────
function routeUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

// ── Popup content ─────────────────────────────────────────────────────────────
function MachinePopup({ m }: { m: Machine }) {
  const active = m.status !== 'maintenance'
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 180 }}>
      <p style={{ fontWeight: 700, marginBottom: 4, fontSize: '0.95rem' }}>{m.name}</p>
      <p style={{ color: '#888', fontSize: '0.82rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
        📍 {m.location}
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{
          padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
          background: active ? '#00ff9f20' : '#ff2d7820',
          color: active ? '#00ff9f' : '#ff2d78',
          border: `1px solid ${active ? '#00ff9f40' : '#ff2d7840'}`,
        }}>
          {active ? 'Ativa' : 'Manutenção'}
        </span>
        <a
          href={routeUrl(m.lat, m.lng)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 6,
            background: '#00d4ff20', color: '#00d4ff',
            border: '1px solid #00d4ff40',
            fontSize: '0.7rem', fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          <ExternalLink size={10} /> Traçar rota
        </a>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MapPage() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Machine | null>(null)

  useEffect(() => {
    api.machines()
      .then(setMachines)
      .catch(() => setError('Não foi possível carregar as máquinas.'))
      .finally(() => setLoading(false))
  }, [])

  const activeMachines = machines.filter(m => m.status !== 'maintenance')
  const center: [number, number] = machines.length
    ? [machines[0].lat, machines[0].lng]
    : [-15.77972, -47.92972]

  return (
    <div>
      {/* Page header */}
      <div className="section" style={{ paddingBottom: '1.5rem' }}>
        <span className="badge badge-green" style={{ marginBottom: '0.75rem' }}>
          <MapPin size={10} /> LOCALIZAÇÃO
        </span>
        <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', marginBottom: '0.5rem' }}>
          Mapa de Máquinas
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Encontre a máquina mais próxima e vá jogar agora.
        </p>

        {machines.length > 0 && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <div className="badge badge-green">
              <Gamepad2 size={10} /> {activeMachines.length} ativas
            </div>
            {machines.length - activeMachines.length > 0 && (
              <div className="badge badge-pink">
                {machines.length - activeMachines.length} em manutenção
              </div>
            )}
          </div>
        )}
      </div>

      {loading && <LoadingSpinner text="Carregando máquinas..." />}
      {error && <ErrorState message={error} />}

      {!loading && !error && (
        <div style={{ display: 'flex', height: 'calc(100vh - 280px)', minHeight: 440, position: 'relative' }}>

          {/* Sidebar */}
          <div
            className="map-sidebar"
            style={{
              width: 290, flexShrink: 0,
              background: 'var(--bg-card)',
              borderRight: '1px solid var(--border)',
              overflowY: 'auto',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <p style={{
                fontFamily: 'Orbitron, monospace', fontSize: '0.72rem',
                color: 'var(--text-muted)', letterSpacing: '0.1em',
              }}>
                {machines.length} MÁQUINAS ENCONTRADAS
              </p>
            </div>

            {machines.length === 0 && (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Nenhuma máquina cadastrada.
              </div>
            )}

            {machines.map(m => {
              const isSelected = selected?.id === m.id
              const active = m.status !== 'maintenance'
              return (
                <button
                  key={m.id}
                  onClick={() => setSelected(isSelected ? null : m)}
                  style={{
                    background: isSelected
                      ? active ? 'rgba(0,255,159,0.07)' : 'rgba(255,45,120,0.07)'
                      : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    borderLeft: isSelected
                      ? `3px solid ${active ? 'var(--neon-green)' : 'var(--neon-pink)'}`
                      : '3px solid transparent',
                    cursor: 'pointer',
                    padding: '0.9rem 1rem',
                    textAlign: 'left',
                    transition: 'background 0.15s, border-color 0.15s',
                    color: 'var(--text)',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.25rem',
                        color: isSelected ? (active ? 'var(--neon-green)' : 'var(--neon-pink)') : 'var(--text)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {m.name}
                      </p>
                      <p style={{
                        color: 'var(--text-muted)', fontSize: '0.75rem',
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        <MapPin size={10} /> {m.location}
                      </p>
                    </div>
                    <span
                      className={`badge ${active ? 'badge-green' : 'badge-pink'}`}
                      style={{ flexShrink: 0, fontSize: '0.62rem' }}
                    >
                      {active ? 'Ativa' : 'Manutenção'}
                    </span>
                  </div>

                  {/* Expanded: route button when selected */}
                  {isSelected && (
                    <a
                      href={routeUrl(m.lat, m.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{
                        marginTop: '0.75rem',
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.45rem 0.85rem',
                        background: 'rgba(0,212,255,0.1)',
                        border: '1px solid rgba(0,212,255,0.25)',
                        borderRadius: 7,
                        color: 'var(--neon-blue)',
                        fontSize: '0.78rem', fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      <Navigation size={12} /> Traçar rota no Google Maps
                    </a>
                  )}
                </button>
              )
            })}
          </div>

          {/* Map */}
          <div style={{ flex: 1, position: 'relative' }}>
            <MapContainer
              center={center}
              zoom={machines.length > 1 ? 12 : 14}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />

              <MapFlyTo target={selected} />

              {machines.map(m => {
                const isSelected = selected?.id === m.id
                const isMaintenance = m.status === 'maintenance'
                const icon = isSelected
                  ? (isMaintenance ? icons.maintenanceSelected : icons.activeSelected)
                  : (isMaintenance ? icons.maintenance : icons.active)

                return (
                  <Marker
                    key={m.id}
                    position={[m.lat, m.lng]}
                    icon={icon}
                    eventHandlers={{ click: () => setSelected(prev => prev?.id === m.id ? null : m) }}
                  >
                    <Popup>
                      <MachinePopup m={m} />
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>

            {/* Empty state overlay */}
            {machines.length === 0 && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(7,7,15,0.7)', zIndex: 1000,
                flexDirection: 'column', gap: '0.75rem', pointerEvents: 'none',
              }}>
                <Navigation size={32} color="var(--neon-blue)" />
                <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Nenhuma máquina cadastrada ainda
                </p>
              </div>
            )}

            {/* Mobile: selected machine bottom sheet */}
            {selected && (
              <div
                className="mobile-sheet"
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'var(--bg-card)',
                  borderTop: '1px solid var(--border)',
                  padding: '1rem 1.25rem',
                  zIndex: 1000,
                  display: 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{selected.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={11} /> {selected.location}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
                <a
                  href={routeUrl(selected.lat, selected.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginTop: '0.75rem',
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.6rem 1rem',
                    background: 'rgba(0,212,255,0.1)',
                    border: '1px solid rgba(0,212,255,0.25)',
                    borderRadius: 8,
                    color: 'var(--neon-blue)',
                    fontSize: '0.85rem', fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <Navigation size={14} /> Traçar rota no Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .leaflet-container { background: #07070f; }
        .leaflet-popup-content-wrapper {
          background: #0f0f1e !important;
          border: 1px solid rgba(0,212,255,0.2) !important;
          border-radius: 10px !important;
          box-shadow: 0 4px 24px rgba(0,0,0,0.6) !important;
        }
        .leaflet-popup-content { margin: 12px 14px !important; }
        .leaflet-popup-tip { background: #0f0f1e !important; }
        .leaflet-popup-close-button { color: #6b6b99 !important; top: 8px !important; right: 8px !important; }

        @media (max-width: 640px) {
          .map-sidebar { display: none !important; }
          .mobile-sheet { display: block !important; }
        }
      `}</style>
    </div>
  )
}
