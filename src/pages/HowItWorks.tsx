import { Link } from 'react-router-dom'
import { CreditCard, Gamepad2, Trophy, Gift, ChevronRight, HelpCircle } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: <CreditCard size={28} />,
    title: 'Pague',
    description: 'Insira moedas ou créditos na máquina de sua escolha. Sem cadastro, sem burocracia.',
    color: 'var(--neon-blue)',
    bg: 'rgba(0, 212, 255, 0.08)',
    border: 'rgba(0, 212, 255, 0.2)',
  },
  {
    number: '02',
    icon: <Gamepad2 size={28} />,
    title: 'Jogue',
    description: 'Mostre suas habilidades. Cada máquina tem seu desafio. Domine o jogo e suba no ranking.',
    color: 'var(--neon-pink)',
    bg: 'rgba(255, 45, 120, 0.08)',
    border: 'rgba(255, 45, 120, 0.2)',
  },
  {
    number: '03',
    icon: <Trophy size={28} />,
    title: 'Ganhe',
    description: 'Atingiu a pontuação mínima? Você ganhou! A máquina libera um código de resgate único.',
    color: 'var(--neon-yellow)',
    bg: 'rgba(255, 215, 0, 0.08)',
    border: 'rgba(255, 215, 0, 0.2)',
  },
  {
    number: '04',
    icon: <Gift size={28} />,
    title: 'Resgate',
    description: 'Use o código para acessar /resgatar, informe seu nome e WhatsApp. Receba seu prêmio.',
    color: 'var(--neon-green)',
    bg: 'rgba(0, 255, 159, 0.08)',
    border: 'rgba(0, 255, 159, 0.2)',
  },
]

const faqs = [
  {
    q: 'Preciso me cadastrar para jogar?',
    a: 'Não! Você joga direto na máquina. O cadastro (nome + WhatsApp) só é pedido caso você ganhe e queira resgatar seu prêmio.',
  },
  {
    q: 'Quais dados são pedidos no resgate?',
    a: 'Somente seu nome e número de WhatsApp. Nada mais. Sem CPF, sem email, sem senha.',
  },
  {
    q: 'Onde ficam as máquinas?',
    a: 'Veja o Mapa completo com todas as localizações. Novas máquinas são adicionadas constantemente.',
  },
  {
    q: 'O código de resgate tem validade?',
    a: 'Sim, o código é válido por tempo limitado após a vitória. Resgate assim que possível!',
  },
  {
    q: 'Posso aparecer no ranking sem ganhar?',
    a: 'O ranking é baseado nas pontuações das partidas. Sua melhor pontuação fica registrada automaticamente.',
  },
]

export default function HowItWorks() {
  return (
    <div>
      {/* Hero */}
      <section className="section" style={{ textAlign: 'center', paddingBottom: '2rem' }}>
        <span className="badge badge-blue" style={{ marginBottom: '1rem' }}>
          <HelpCircle size={10} /> COMO FUNCIONA
        </span>
        <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', marginBottom: '0.75rem' }}>
          Simples como deve ser
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto', fontSize: '1rem', lineHeight: 1.6 }}>
          4 passos. Zero burocracia. Só diversão e prêmios reais.
        </p>
      </section>

      {/* Steps */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="section">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0', maxWidth: 700, margin: '0 auto' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '1.5rem', position: 'relative' }}>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    left: 35,
                    top: 72,
                    width: 2,
                    height: 'calc(100% - 16px)',
                    background: `linear-gradient(180deg, ${step.color}40, transparent)`,
                  }} />
                )}

                {/* Icon */}
                <div style={{
                  width: 70, height: 70, borderRadius: 12, flexShrink: 0,
                  background: step.bg, border: `1.5px solid ${step.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: step.color,
                  boxShadow: `0 0 20px ${step.bg}`,
                  position: 'relative', zIndex: 1,
                }}>
                  {step.icon}
                </div>

                {/* Content */}
                <div style={{ padding: '0.75rem 0 2.5rem' }}>
                  <div style={{
                    fontFamily: 'Orbitron, monospace', fontSize: '0.7rem',
                    color: step.color, letterSpacing: '0.15em', marginBottom: '0.4rem',
                  }}>
                    PASSO {step.number}
                  </div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text)' }}>
                    {step.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', marginBottom: '2rem', textAlign: 'center' }}>
          Dúvidas Frequentes
        </h2>

        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map((faq, i) => (
            <details
              key={i}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <summary style={{
                padding: '1rem 1.25rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                listStyle: 'none',
                userSelect: 'none',
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {faq.q}
                <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0, transition: 'transform 0.2s' }} />
              </summary>
              <div style={{
                padding: '0 1.25rem 1rem',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                borderTop: '1px solid rgba(255,255,255,0.05)',
                paddingTop: '0.75rem',
              }}>
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0, textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,45,120,0.08), rgba(0,255,159,0.08))',
          border: '1px solid rgba(0,255,159,0.15)',
          borderRadius: 14, padding: '2.5rem',
        }}>
          <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', marginBottom: '0.75rem' }}>
            Pronto para jogar?
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Encontre a máquina mais perto de você agora.
          </p>
          <Link to="/mapa" className="btn-neon btn-primary">
            <Gamepad2 size={16} /> Ir para o Mapa
          </Link>
        </div>
      </section>

      <style>{`
        details[open] > summary svg:last-child { transform: rotate(90deg); }
      `}</style>
    </div>
  )
}
