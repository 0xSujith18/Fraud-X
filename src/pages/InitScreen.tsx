import { useState, useEffect } from 'react'

const initSteps = [
  'Loading transaction engine',
  'Loading feature pipeline',
  'Loading behavioral engine',
  'Loading anomaly detector',
  'Loading graph engine',
  'Loading risk engine',
  'Loading explainability engine',
  'Loading telemetry',
]

interface InitScreenProps {
  onComplete: () => void
}

export function InitScreen({ onComplete }: InitScreenProps) {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (step < initSteps.length) {
      const t = setTimeout(() => setStep(s => s + 1), 200)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => setDone(true), 400)
      return () => clearTimeout(t)
    }
  }, [step])

  useEffect(() => {
    if (done) {
      const t = setTimeout(onComplete, 800)
      return () => clearTimeout(t)
    }
  }, [done, onComplete])

  return (
    <div className="fixed inset-0 bg-space-950 flex flex-col items-center justify-center z-50">
      <div className="absolute inset-0 grid-bg opacity-20" />

      {/* Animated logo */}
      <div className="relative mb-8">
        <svg viewBox="0 0 120 120" className="w-24 h-24">
          <circle cx="60" cy="60" r="55" fill="none" stroke="#22D3EE" strokeWidth="0.5" opacity="0.2" />
          <circle cx="60" cy="60" r="40" fill="none" stroke="#22D3EE" strokeWidth="0.5" opacity="0.4">
            <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="8s" repeatCount="indefinite" />
          </circle>
          <circle cx="60" cy="60" r="25" fill="none" stroke="#22D3EE" strokeWidth="0.5" opacity="0.6">
            <animateTransform attributeName="transform" type="rotate" from="360 60 60" to="0 60 60" dur="5s" repeatCount="indefinite" />
          </circle>
          <line x1="5" y1="60" x2="115" y2="60" stroke="#22D3EE" strokeWidth="0.5" opacity="0.3" />
          <line x1="60" y1="5" x2="60" y2="115" stroke="#22D3EE" strokeWidth="0.5" opacity="0.3" />
          <text x="60" y="70" textAnchor="middle" fill="#22D3EE" fontSize="28" fontWeight="bold" fontFamily="Space Grotesk">X</text>
        </svg>
      </div>

      <h1 className="font-display text-3xl font-bold text-cyber tracking-widest mb-1">FRAUD-X</h1>
      <p className="font-mono text-xs text-slate-500 mb-8 tracking-widest">INITIALIZATION SEQUENCE</p>

      <div className="w-80 space-y-1.5">
        {initSteps.map((s, i) => (
          <div key={s} className={`flex items-center gap-3 font-mono text-xs transition-all duration-300 ${i < step ? 'opacity-100' : 'opacity-20'}`}>
            <span className={i < step ? 'text-emerald-400' : 'text-slate-600'}>[{i < step ? 'OK' : '  '}]</span>
            <span className={i < step ? 'text-slate-300' : 'text-slate-600'}>{s}</span>
          </div>
        ))}
      </div>

      {done && (
        <div className="mt-6 font-display text-sm font-bold text-cyber tracking-widest animate-float-up">
          MISSION CONTROL READY
        </div>
      )}
    </div>
  )
}
