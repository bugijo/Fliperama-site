export default function LoadingSpinner({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '1rem', padding: '4rem 1rem',
    }}>
      <div style={{
        width: 48, height: 48,
        border: '3px solid rgba(0, 212, 255, 0.15)',
        borderTop: '3px solid var(--neon-blue)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: 'var(--text-muted)', fontFamily: 'Orbitron, monospace', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
        {text}
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '0.75rem', padding: '4rem 1rem',
      color: 'var(--neon-pink)',
      textAlign: 'center',
    }}>
      <span style={{ fontSize: '2rem' }}>⚠</span>
      <p style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.85rem' }}>{message}</p>
    </div>
  )
}
