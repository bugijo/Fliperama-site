const COLORS = ['#00ff9f', '#ff2d78', '#00d4ff', '#ffd700', '#a855f7', '#ff6b35']

interface Piece {
  id: number
  left: number
  delay: number
  duration: number
  color: string
  size: number
  rotate: number
  drift: number
  round: boolean
}

// Generated once at module load — keeps Math.random() out of render
function rng(min: number, max: number) { return min + Math.random() * (max - min) }
const PIECES: Piece[] = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: rng(0, 100),
  delay: rng(0, 2.5),
  duration: rng(2, 4),
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
  size: rng(6, 12),
  rotate: rng(0, 360),
  drift: rng(-60, 60),
  round: Math.random() > 0.5,
}))

export default function Confetti() {
  const pieces = PIECES

  return (
    <div style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none', overflow: 'hidden',
      zIndex: 9999,
    }}>
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: -16,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.round ? '50%' : 2,
            opacity: 0,
            // Use CSS custom properties to pass per-piece drift into keyframe
            ['--drift' as string]: `${p.drift}px`,
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            boxShadow: `0 0 6px ${p.color}80`,
          }}
        />
      ))}

      <style>{`
        @keyframes confettiFall {
          0%   { transform: rotate(0deg) translateX(0);                  opacity: 1; top: -16px; }
          100% { transform: rotate(540deg) translateX(var(--drift, 0px)); opacity: 0; top: 110vh; }
        }
      `}</style>
    </div>
  )
}
