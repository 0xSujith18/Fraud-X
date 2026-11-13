import { type ReactNode } from 'react'
import clsx from 'clsx'
import type { RiskLevel } from '../../data/synthetic'

interface PanelProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  live?: boolean
  badge?: string
}

export function Panel({ title, subtitle, children, className, live, badge }: PanelProps) {
  return (
    <div className={clsx('bg-panel border border-cyber rounded-sm flex flex-col', className)}>
      {(title || live || badge) && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-cyber">
          <div className="flex items-center gap-2">
            {title && <span className="font-display text-xs font-semibold tracking-widest text-slate-300 uppercase">{title}</span>}
            {subtitle && <span className="font-mono text-xs text-slate-500">{subtitle}</span>}
          </div>
          <div className="flex items-center gap-2">
            {badge && <span className="font-mono text-xs text-slate-400 bg-space-700 px-2 py-0.5 rounded-sm border border-cyber">{badge}</span>}
            {live && (
              <span className="flex items-center gap-1 font-mono text-xs text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                LIVE
              </span>
            )}
          </div>
        </div>
      )}
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  )
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
    LOW: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5',
    MEDIUM: 'text-amber-400 border-amber-400/30 bg-amber-400/5',
    HIGH: 'text-orange-400 border-orange-400/30 bg-orange-400/5',
    CRITICAL: 'text-red-400 border-red-400/30 bg-red-400/5',
  }
  return (
    <span className={clsx('font-mono text-xs px-1.5 py-0.5 rounded-sm border', styles[level])}>
      {level}
    </span>
  )
}

export function StatusDot({ status }: { status: 'online' | 'warn' | 'error' | 'idle' }) {
  const colors = { online: 'bg-emerald-400', warn: 'bg-amber-400', error: 'bg-red-400', idle: 'bg-slate-500' }
  return <span className={clsx('w-1.5 h-1.5 rounded-full animate-pulse-dot', colors[status])} />
}

export function MetricCard({ label, value, unit, sub, color = 'cyan' }: {
  label: string; value: string | number; unit?: string; sub?: string; color?: 'cyan' | 'emerald' | 'amber' | 'red'
}) {
  const textColors = { cyan: 'text-cyber', emerald: 'text-emerald-400', amber: 'text-amber-400', red: 'text-red-400' }
  return (
    <div className="bg-panel-2 border border-cyber rounded-sm p-3 flex flex-col gap-1">
      <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={clsx('font-display text-2xl font-bold animate-count-up', textColors[color])}>{value}</span>
        {unit && <span className="font-mono text-xs text-slate-400">{unit}</span>}
      </div>
      {sub && <span className="font-mono text-xs text-slate-500">{sub}</span>}
    </div>
  )
}

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-sm font-bold tracking-widest text-slate-200 uppercase">{title}</h2>
      {subtitle && <p className="font-mono text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  )
}

export function DemoTag({ isLiveStream }: { isLiveStream?: boolean }) {
  if (isLiveStream) {
    return (
      <span className="flex items-center gap-1.5 font-mono text-xs text-emerald-400 border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 rounded-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        LIVE PRODUCTION STREAM (FASTAPI)
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 font-mono text-xs text-emerald-400 border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 rounded-sm">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      LIVE DATA STREAM (FASTAPI ML API)
    </span>
  )
}

export function NoData({ message = 'NO EXPERIMENTAL RESULT AVAILABLE' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
      <span className="font-mono text-xs text-slate-600 tracking-widest">{message}</span>
    </div>
  )
}

export function ScoreBar({ value, max = 1, color = 'cyan' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100)
  const barColor = color === 'cyan' ? 'bg-cyan-500' : color === 'red' ? 'bg-red-400' : color === 'emerald' ? 'bg-emerald-400' : 'bg-amber-400'
  return (
    <div className="w-full h-1 bg-space-600 rounded-full overflow-hidden">
      <div className={clsx('h-full rounded-full transition-all duration-700', barColor)} style={{ width: `${pct}%` }} />
    </div>
  )
}
