import { useState, useEffect } from 'react'
import { Bell, Search, User, Radio } from 'lucide-react'
import { fetchSystemStatus, fetchKpi } from '../../services/api'

type Status = { modelVersion: string; latency: number }
type Kpi    = { totalTransactions: number; highRiskEvents: number }

export function TopBar({ onCommandPalette }: { onCommandPalette: () => void }) {
  const [time, setTime] = useState(new Date())
  const [isLiveStream, setIsLiveStream] = useState(true)
  const [status, setStatus] = useState<Status>({ modelVersion: 'XGBoost v1.4', latency: 18 })
  const [kpi, setKpi] = useState<Kpi>({ totalTransactions: 1284392, highRiskEvents: 428 })

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    fetchSystemStatus().then(s => setStatus(s as Status))
    fetchKpi().then(k => setKpi(k as Kpi))
    const t = setInterval(() => fetchKpi().then(k => setKpi(k as Kpi)), 5000)
    return () => clearInterval(t)
  }, [])

  const fmt = (n: number) => n.toLocaleString()

  return (
    <header className="h-10 bg-space-900 border-b border-cyber flex items-center px-4 gap-4 shrink-0 z-50">
      {/* Brand */}
      <div className="flex items-center gap-2 mr-4">
        <div className="relative w-6 h-6">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <circle cx="12" cy="12" r="10" fill="none" stroke="#22D3EE" strokeWidth="0.5" opacity="0.4" />
            <circle cx="12" cy="12" r="6" fill="none" stroke="#22D3EE" strokeWidth="0.5" opacity="0.6" />
            <line x1="2" y1="12" x2="22" y2="12" stroke="#22D3EE" strokeWidth="0.5" opacity="0.3" />
            <line x1="12" y1="2" x2="12" y2="22" stroke="#22D3EE" strokeWidth="0.5" opacity="0.3" />
            <text x="12" y="16" textAnchor="middle" fill="#22D3EE" fontSize="10" fontWeight="bold" fontFamily="Space Grotesk">X</text>
          </svg>
        </div>
        <span className="font-display text-sm font-bold text-cyber tracking-widest">FRAUD-X</span>
      </div>

      {/* Status pills */}
      <div className="flex items-center gap-3 text-xs font-mono">
        <Pill label="SYSTEM" value="ONLINE" color="emerald" />
        <button
          onClick={() => setIsLiveStream(!isLiveStream)}
          className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/40 rounded-sm hover:bg-emerald-500/20 transition-all cursor-pointer"
          title="Toggle Real-Time Stream Mode"
        >
          <Radio size={10} className="text-emerald-400 animate-pulse" />
          <span className="text-slate-400">STREAM:</span>
          <span className="text-emerald-400 font-bold">{isLiveStream ? 'LIVE PRODUCTION' : 'PAUSED'}</span>
        </button>
        <Pill label="MODEL" value={status.modelVersion} color="cyan" />
        <Pill label="LATENCY" value={`${status.latency}ms`} color="cyan" />
      </div>

      <div className="flex-1" />

      {/* Stats */}
      <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-slate-400">
        <span>TX <span className="text-slate-200">{fmt(kpi.totalTransactions)}</span></span>
        <span>RISK <span className="text-red-400">{fmt(kpi.highRiskEvents)}</span></span>
        <span className="text-cyber">{time.toLocaleTimeString('en-US', { hour12: false })}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-2">
        <button
          onClick={onCommandPalette}
          className="flex items-center gap-1.5 px-2 py-1 bg-space-700 border border-cyber rounded-sm text-xs font-mono text-slate-400 hover:text-cyber hover:border-cyber-active transition-colors"
          title="Command Palette (Ctrl+K)"
        >
          <Search size={11} />
          <span className="hidden sm:inline">CTRL+K</span>
        </button>
        <button className="p-1.5 text-slate-400 hover:text-cyber transition-colors relative">
          <Bell size={14} />
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-400 rounded-full" />
        </button>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-space-700 border border-cyber rounded-sm">
          <User size={11} className="text-cyber" />
          <span className="font-mono text-xs text-slate-300">RESEARCH ADMIN</span>
        </div>
      </div>
    </header>
  )
}

function Pill({ label, value, color, pulse }: { label: string; value: string; color: 'cyan' | 'emerald'; pulse?: boolean }) {
  const textColor = color === 'cyan' ? 'text-cyber' : 'text-emerald-400'
  const dotColor = color === 'cyan' ? 'bg-cyan-400' : 'bg-emerald-400'
  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-space-800 border border-cyber rounded-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`w-1 h-1 rounded-full ${dotColor} ${pulse ? 'animate-pulse-dot' : ''}`} />
      <span className={textColor}>{value}</span>
    </div>
  )
}
