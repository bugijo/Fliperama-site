import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Gift, Phone, User, CheckCircle2, AlertCircle,
  ChevronRight, Volume2, VolumeX, Trophy, MapPin, Clock, Ban,
} from 'lucide-react'
import { api, type Reward } from '../lib/api'
import Confetti from '../components/Confetti'
import CountdownTimer from '../components/CountdownTimer'
import { SkeletonBlock } from '../components/Skeleton'

// ── Sound engine ─────────────────────────────────────────────────────────────
function playWinSound() {
  try {
    const ctx = new AudioContext()
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.14
      gain.gain.setValueAtTime(0.25, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45)
      osc.start(t)
      osc.stop(t + 0.5)
    })
  } catch { /* Audio not supported */ }
}

// ── Phone helpers ─────────────────────────────────────────────────────────────
function stripPhone(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 11)
}
function displayPhone(d: string): string {
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`
}

type FormState = 'idle' | 'submitting' | 'success' | 'error'

// ── Animated orb ─────────────────────────────────────────────────────────────
function NeonOrb({ icon, color = '#00ff9f' }: { icon: React.ReactNode; color?: string }) {
  return (
    <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 1.5rem' }}>
      <div style={{
        position: 'absolute', inset: -10, borderRadius: '50%',
        border: `2px solid ${color}40`,
        animation: 'orbPulse 1.6s ease-in-out infinite',
      }} />
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: `radial-gradient(circle, ${color}22 0%, ${color}06 70%)`,
        border: `2px solid ${color}80`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 40px ${color}50, inset 0 0 20px ${color}15`,
        animation: 'orbGlow 2s ease-in-out infinite alternate',
      }}>
        {icon}
      </div>
    </div>
  )
}

// ── Reward detail card (shown before the form) ────────────────────────────────
function RewardInfoCard({ reward, onExpired }: { reward: Reward; onExpired: () => void }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(0,255,159,0.05), rgba(0,212,255,0.05))',
      border: '1px solid rgba(0,255,159,0.18)',
      borderRadius: 14, padding: '1.25rem',
      display: 'flex', flexDirection: 'column', gap: '0.85rem',
      marginBottom: '1.5rem',
    }}>
      {/* Prize image + name */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{
          width: 60, height: 60, borderRadius: 10, flexShrink: 0,
          background: 'rgba(0,255,159,0.08)',
          border: '1px solid rgba(0,255,159,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {reward.prizeImageUrl
            ? <img src={reward.prizeImageUrl} alt={reward.prizeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Gift size={26} color="var(--neon-green)" />
          }
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'Orbitron, monospace', fontWeight: 700,
            fontSize: '1rem', color: 'var(--neon-green)', marginBottom: '0.3rem',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {reward.prizeName}
          </p>
          {reward.prizeDescription && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.4 }}>
              {reward.prizeDescription}
            </p>
          )}
          {(reward.machineName || reward.location) && (
            <p style={{
              color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.4rem',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}>
              <MapPin size={10} />
              {[reward.machineName, reward.location].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* Validity countdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Clock size={12} /> Válido por:
        </span>
        <CountdownTimer expiresAt={reward.expiresAt} onExpired={onExpired} />
      </div>
    </div>
  )
}

// ── Reward skeleton ───────────────────────────────────────────────────────────
function RewardSkeleton() {
  return (
    <div style={{
      border: '1px solid rgba(0,255,159,0.1)', borderRadius: 14,
      padding: '1.25rem', marginBottom: '1.5rem',
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
    }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <SkeletonBlock width={60} height={60} radius={10} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <SkeletonBlock width="70%" height={16} />
          <SkeletonBlock width="90%" height={12} />
          <SkeletonBlock width="50%" height={12} />
        </div>
      </div>
      <SkeletonBlock width={160} height={28} radius={8} />
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Redeem() {
  const [params] = useSearchParams()
  const rewardId = params.get('rewardId') ?? ''

  const [reward, setReward] = useState<Reward | null>(null)
  const [loadingReward, setLoadingReward] = useState(true)
  const [rewardError, setRewardError] = useState('')
  const [expired, setExpired] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const soundRef = useRef(soundEnabled)
  soundRef.current = soundEnabled

  const handleExpired = useCallback(() => setExpired(true), [])

  useEffect(() => {
    if (!rewardId) { setLoadingReward(false); return }
    api.reward(rewardId)
      .then(r => {
        setReward(r)
        if (!r) setRewardError('Código de resgate inválido ou não encontrado.')
        else if (r.status === 'expired') setExpired(true)
      })
      .catch(() => setRewardError('Não foi possível carregar os dados do prêmio.'))
      .finally(() => setLoadingReward(false))
  }, [rewardId])

  const isValid = name.trim().length >= 2 && phone.length === 11

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValid || formState === 'submitting') return
    setFormState('submitting')
    setErrorMsg('')

    try {
      const res = await api.redeem({ reward_id: rewardId, name: name.trim(), phone })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.detail ?? body?.message ?? `Erro ${res.status}`)
      }
      const data = await res.json().catch(() => ({}))
      setSuccessMessage(data?.message ?? 'Prêmio registrado com sucesso!')
      setFormState('success')
      setShowConfetti(true)
      if (soundRef.current) playWinSound()
      setTimeout(() => setShowConfetti(false), 5500)
    } catch (err) {
      setFormState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao processar resgate. Tente novamente.')
    }
  }

  // ── No rewardId ───────────────────────────────────────────────────────────
  if (!rewardId) {
    return (
      <div className="section" style={{ textAlign: 'center', maxWidth: 460, paddingTop: '6rem' }}>
        <AlertCircle size={52} color="var(--neon-pink)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Link inválido</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
          Nenhum código de resgate encontrado.<br />
          Use o QR code gerado pela máquina após a vitória.
        </p>
        <Link to="/" className="btn-neon btn-outline">
          Ir para Home <ChevronRight size={14} />
        </Link>
      </div>
    )
  }

  // ── Reward not found ──────────────────────────────────────────────────────
  if (!loadingReward && rewardError) {
    return (
      <div className="section" style={{ textAlign: 'center', maxWidth: 460, paddingTop: '6rem' }}>
        <AlertCircle size={52} color="var(--neon-pink)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Código não encontrado</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>{rewardError}</p>
        <Link to="/" className="btn-neon btn-outline">Voltar ao Início</Link>
      </div>
    )
  }

  // ── Already redeemed ──────────────────────────────────────────────────────
  if (!loadingReward && reward?.status === 'redeemed') {
    return (
      <div className="section" style={{ textAlign: 'center', maxWidth: 460, paddingTop: '5rem' }}>
        <NeonOrb icon={<CheckCircle2 size={36} color="var(--neon-blue)" />} color="var(--neon-blue)" />
        <span className="badge badge-blue" style={{ marginBottom: '1rem' }}>Já utilizado</span>
        <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', marginBottom: '0.75rem' }}>
          Prêmio já resgatado
        </h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Este código já foi utilizado.<br />
          Jogue novamente para ganhar um novo prêmio!
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/mapa" className="btn-neon btn-primary"><MapPin size={16} /> Ver Máquinas</Link>
          <Link to="/" className="btn-neon btn-outline">Home</Link>
        </div>
      </div>
    )
  }

  // ── Expired ────────────────────────────────────────────────────────────────
  if ((!loadingReward && reward?.status === 'expired') || expired) {
    return (
      <div className="section" style={{ textAlign: 'center', maxWidth: 460, paddingTop: '5rem' }}>
        <NeonOrb icon={<Ban size={36} color="var(--neon-pink)" />} color="var(--neon-pink)" />
        <span className="badge badge-pink" style={{ marginBottom: '1rem' }}>Expirado</span>
        <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', marginBottom: '0.75rem' }}>
          Código expirado
        </h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Este código de resgate expirou e não pode mais ser utilizado.<br />
          Jogue novamente para ganhar um novo!
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/mapa" className="btn-neon btn-primary"><MapPin size={16} /> Jogar Novamente</Link>
          <Link to="/" className="btn-neon btn-outline">Home</Link>
        </div>
      </div>
    )
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (formState === 'success') {
    return (
      <>
        {showConfetti && <Confetti />}
        <div className="section fade-in-up" style={{ textAlign: 'center', maxWidth: 500, paddingTop: '4rem' }}>
          <NeonOrb icon={<CheckCircle2 size={40} color="var(--neon-green)" />} />

          <h1 className="glow-green" style={{
            fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
            color: 'var(--neon-green)', marginBottom: '1rem',
          }}>
            Prêmio Registrado!
          </h1>

          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '0.75rem', fontSize: '1rem' }}>
            Ótimo, <strong style={{ color: 'var(--text)' }}>{name}</strong>! 🎉
          </p>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
            Em breve entraremos em contato pelo WhatsApp{' '}
            <strong style={{ color: 'var(--text)' }}>{displayPhone(phone)}</strong>.
          </p>

          {/* Key instruction */}
          <div style={{
            margin: '1.75rem auto',
            padding: '1.1rem 1.5rem',
            background: 'rgba(0,212,255,0.06)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 12,
            maxWidth: 400,
          }}>
            <p style={{ color: 'var(--neon-blue)', fontFamily: 'Orbitron, monospace', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              PRÓXIMO PASSO
            </p>
            <p style={{ color: 'var(--text)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Apresente o código <strong style={{ color: 'var(--neon-green)' }}>{rewardId.toUpperCase()}</strong>
              {' '}na máquina ou no local para retirar seu prêmio.
            </p>
          </div>

          {successMessage && successMessage !== 'Prêmio registrado com sucesso!' && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              {successMessage}
            </p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/ranking" className="btn-neon btn-primary">
              <Trophy size={16} /> Ver Ranking
            </Link>
            <Link to="/" className="btn-neon btn-outline">Voltar ao Início</Link>
          </div>
        </div>

        <style>{`
          @keyframes orbGlow {
            from { box-shadow: 0 0 30px rgba(0,255,159,0.2); }
            to   { box-shadow: 0 0 60px rgba(0,255,159,0.5); }
          }
          @keyframes orbPulse {
            0%,100% { transform: scale(1); opacity: 0.6; }
            50%      { transform: scale(1.15); opacity: 1; }
          }
        `}</style>
      </>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="section" style={{ maxWidth: 480, paddingTop: '3rem' }}>

      {/* Sound toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={() => setSoundEnabled(s => !s)}
          style={{
            background: 'none',
            border: `1px solid ${soundEnabled ? 'rgba(0,255,159,0.3)' : 'var(--border)'}`,
            color: soundEnabled ? 'var(--neon-green)' : 'var(--text-muted)',
            borderRadius: 8, padding: '0.4rem 0.75rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontSize: '0.78rem', transition: 'all 0.2s',
          }}
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {soundEnabled ? 'Som ligado' : 'Som desligado'}
        </button>
      </div>

      {/* Victory header */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <NeonOrb icon={<Trophy size={36} color="var(--neon-green)" />} />
        <span className="badge badge-green" style={{ marginBottom: '0.9rem', fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
          🏆 Você ganhou!
        </span>
        <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '0.4rem' }}>
          Resgatar Prêmio
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
          Só nome e WhatsApp — sem CPF, sem cadastro.
        </p>
      </div>

      {/* Reward card */}
      {loadingReward && <RewardSkeleton />}
      {!loadingReward && reward && (
        <RewardInfoCard reward={reward} onExpired={handleExpired} />
      )}

      {/* Reward ID */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <span style={{
          display: 'inline-block',
          padding: '0.35rem 0.9rem',
          background: 'rgba(0,212,255,0.06)',
          border: '1px solid rgba(0,212,255,0.12)',
          borderRadius: 999,
          fontFamily: 'Orbitron, monospace', fontSize: '0.68rem',
          color: 'var(--text-muted)', letterSpacing: '0.1em',
        }}>
          {rewardId.toUpperCase()}
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.78rem', fontFamily: 'Orbitron, monospace', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            SEU NOME
          </label>
          <div style={{ position: 'relative' }}>
            <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Como você quer ser chamado"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ paddingLeft: '2.5rem', height: 52 }}
              required minLength={2} maxLength={60}
              autoComplete="given-name"
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.78rem', fontFamily: 'Orbitron, monospace', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            WHATSAPP
          </label>
          <div style={{ position: 'relative' }}>
            <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="tel"
              placeholder="(11) 99999-9999"
              value={displayPhone(phone)}
              onChange={e => setPhone(stripPhone(e.target.value))}
              style={{ paddingLeft: '2.5rem', height: 52 }}
              required autoComplete="tel" inputMode="numeric"
            />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '0.35rem' }}>
            Usado apenas para combinar a entrega do prêmio.
          </p>
        </div>

        {formState === 'error' && (
          <div style={{
            display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
            padding: '0.9rem 1rem',
            background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.25)',
            borderRadius: 8, color: 'var(--neon-pink)', fontSize: '0.88rem', lineHeight: 1.5,
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!isValid || formState === 'submitting'}
          className="btn-neon btn-primary"
          style={{
            width: '100%', justifyContent: 'center',
            fontSize: '1rem', height: 56,
            opacity: !isValid || formState === 'submitting' ? 0.45 : 1,
            cursor: !isValid || formState === 'submitting' ? 'not-allowed' : 'pointer',
          }}
        >
          {formState === 'submitting' ? (
            <>
              <span style={{ width: 18, height: 18, border: '2px solid rgba(7,7,15,0.3)', borderTop: '2px solid #07070f', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
              Registrando...
            </>
          ) : (
            <><Gift size={18} /> Confirmar Resgate</>
          )}
        </button>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.74rem', lineHeight: 1.5 }}>
          Ao confirmar, você concorda que entraremos em contato pelo WhatsApp informado.
        </p>
      </form>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes orbGlow {
          from { box-shadow: 0 0 30px rgba(0,255,159,0.2); }
          to   { box-shadow: 0 0 60px rgba(0,255,159,0.5); }
        }
        @keyframes orbPulse {
          0%,100% { transform: scale(1); opacity: 0.6; }
          50%      { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
