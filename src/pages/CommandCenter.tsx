import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { fetchKpi, fetchStreamTransactions, fetchTelemetry, fetchLogs } from '../services/api'
import { type Transaction } from '../data/synthetic'
import { Panel, MetricCard, DemoTag, RiskBadge } from '../components/shared'

type KpiData = {
  totalTransactions: number
  fraudDetected: number
  fraudRate: number
  highRiskEvents: number
  avgDetectionLatency: number
  modelPrAuc: number
}

type TelemetryPoint = { time: string; normal: number; suspicious: number; fraud: number }
type LogEntry = { level: string; time: string; message: string }

export function CommandCenter() {
  const [kpi, setKpi] = useState<KpiData | null>(null)
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([])
  const [streamEvents, setStreamEvents] = useState<Transaction[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])

  // Initial load
  useEffect(() => {
    fetchKpi().then(setKpi)
    fetchTelemetry().then(setTelemetry)
    fetchLogs(15).then(setLogs)
  }, [])

  // Live stream — every 1.5s
  useEffect(() => {
    const tick = async () => {
      const txs = await fetchStreamTransactions(1)
      if (txs.length > 0) {
        setStreamEvents(prev => [txs[0] as Transaction, ...prev.slice(0, 7)])
        setKpi(prev => prev ? { ...prev, totalTransactions: prev.totalTransactions + 1 } : prev)
      }
    }
    tick()
    const t = setInterval(tick, 1500)
    return () => clearInterval(t)
  }, [])

  // Refresh telemetry + logs every 10s
  useEffect(() => {
    const t = setInterval(() => {
      fetchTelemetry().then(setTelemetry)
      fetchLogs(15).then(setLogs)
    }, 10_000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-base font-bold tracking-widest text-slate-100 uppercase">Financial Risk Command Center</h1>
          <p className="font-mono text-xs text-slate-500 mt-0.5">Real-time monitoring of high-frequency digital banking activity.</p>
        </div>
        <DemoTag isLiveStream={true} />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <MetricCard label="Total Transactions" value={kpi ? kpi.totalTransactions.toLocaleString() : '—'} color="cyan" />
        <MetricCard label="Fraud Detected"     value={kpi ? kpi.fraudDetected.toLocaleString() : '—'} color="red" />
        <MetricCard label="Fraud Rate"         value={kpi ? `${kpi.fraudRate}%` : '—'} color="amber" />
        <MetricCard label="High-Risk Events"   value={kpi ? kpi.highRiskEvents : '—'} color="red" />
        <MetricCard label="Avg Detection"      value={kpi ? `${kpi.avgDetectionLatency}ms` : '—'} color="emerald" />
        <MetricCard label="Model PR-AUC"       value={kpi ? kpi.modelPrAuc : '—'} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Telemetry Chart */}
        <Panel title="Transaction Telemetry" live className="lg:col-span-2" badge="BANK_TX_STREAM_01 (FASTAPI LIVE)">
          <div className="p-3">
            <div className="flex gap-4 mb-2 font-mono text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-cyan-500 inline-block" /> Normal</span>
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-amber-400 inline-block" /> Suspicious</span>
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-red-400 inline-block" /> Fraud</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={telemetry} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSuspicious" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#FBBF24" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FBBF24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#22D3EE0A" />
                <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} interval={9} />
                <YAxis tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#080B10', border: '1px solid #22D3EE22', borderRadius: 2, fontFamily: 'JetBrains Mono', fontSize: 11 }} labelStyle={{ color: '#94A3B8' }} />
                <Area type="monotone" dataKey="normal"     stroke="#06B6D4" strokeWidth={1.5} fill="url(#gNormal)" />
                <Area type="monotone" dataKey="suspicious" stroke="#FBBF24" strokeWidth={1}   fill="url(#gSuspicious)" />
                <Area type="monotone" dataKey="fraud"      stroke="#EF4444" strokeWidth={1}   fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Live Threat Stream */}
        <Panel title="Live Threat Stream (FastAPI)" live>
          <div className="h-[240px] overflow-y-auto p-2 space-y-1">
            {streamEvents.map((tx, i) => (
              <div key={`${tx.id}-${i}`} className="font-mono text-xs border border-cyber rounded-sm p-2 bg-space-800 animate-float-up">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400">[{new Date(tx.timestamp).toLocaleTimeString('en-US', { hour12: false })}]</span>
                  <RiskBadge level={tx.riskLevel} />
                </div>
                <div className="text-cyber">{tx.id}</div>
                <div className="text-slate-400">SCORE: <span className={tx.riskScore > 0.7 ? 'text-red-400' : 'text-emerald-400'}>{tx.riskScore.toFixed(2)}</span></div>
                {tx.flags.map(f => <div key={f} className="text-amber-400 text-xs">{f}</div>)}
                <div className="text-slate-500">STATUS: {tx.decision}</div>
              </div>
            ))}
            {streamEvents.length === 0 && (
              <div className="font-mono text-xs text-slate-600 text-center pt-8">Connecting to stream...</div>
            )}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Risk Events */}
        <Panel title="Recent Risk Events">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-cyber text-slate-500">
                  <th className="text-left px-3 py-2">TX ID</th>
                  <th className="text-left px-3 py-2">AMOUNT</th>
                  <th className="text-left px-3 py-2">CHANNEL</th>
                  <th className="text-left px-3 py-2">RISK</th>
                  <th className="text-left px-3 py-2">DECISION</th>
                </tr>
              </thead>
              <tbody>
                {streamEvents
                  .filter(t => t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL' || t.riskLevel === 'MEDIUM')
                  .slice(0, 8)
                  .map(tx => (
                    <tr key={tx.id} className="border-b border-cyber/30 hover:bg-space-800 transition-colors">
                      <td className="px-3 py-1.5 text-cyber">{tx.id}</td>
                      <td className="px-3 py-1.5 text-slate-300">₹{tx.amount.toLocaleString()}</td>
                      <td className="px-3 py-1.5 text-slate-400">{tx.channel}</td>
                      <td className="px-3 py-1.5"><RiskBadge level={tx.riskLevel} /></td>
                      <td className="px-3 py-1.5 text-slate-400">{tx.decision}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* System Logs */}
        <Panel title="System Logs" badge="FASTAPI LIVE">
          <div className="h-[200px] overflow-y-auto p-2 space-y-0.5">
            {logs.map((log, i) => (
              <div key={i} className="font-mono text-xs flex gap-2">
                <span className="text-slate-600 shrink-0">{log.time}</span>
                <span className={
                  log.level === 'CRITICAL' ? 'text-red-400 shrink-0' :
                  log.level === 'WARN'     ? 'text-amber-400 shrink-0' :
                  log.level === 'MODEL'    ? 'text-cyan-400 shrink-0' :
                  log.level === 'SECURITY' ? 'text-purple-400 shrink-0' :
                  log.level === 'DATA'     ? 'text-blue-400 shrink-0' :
                  'text-emerald-400 shrink-0'
                }>[{log.level}]</span>
                <span className="text-slate-400">{log.message}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
