import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import { fetchDrift, fetchModelMetrics } from '../services/api'
import { Panel, DemoTag, SectionHeader, ScoreBar } from '../components/shared'

type DriftPoint = { day: string; featureDrift: number; predictionDrift: number; threshold: number }
type ModelMetric = { model: string; precision: number | null; recall: number | null; f1: number | null; prAuc: number | null; status: string }

export function ModelMonitor() {
  const [drift, setDrift] = useState<DriftPoint[]>([])
  const [metrics, setMetrics] = useState<ModelMetric[]>([])

  useEffect(() => {
    fetchDrift().then(data => setDrift(data as DriftPoint[]))
    fetchModelMetrics().then(data => setMetrics(data as ModelMetric[]))
    const t = setInterval(() => fetchDrift().then(data => setDrift(data as DriftPoint[])), 30_000)
    return () => clearInterval(t)
  }, [])

  const active = metrics.find(m => m.status === 'ACTIVE')
  const latest = drift[drift.length - 1]

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-start justify-between">
        <SectionHeader title="Model Monitor" subtitle="Real-time model health and drift detection" />
        <DemoTag />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {[
          { label: 'MODEL HEALTH', value: active ? `${(active.f1! * 100).toFixed(1)}%` : '—', color: 'emerald', status: 'HEALTHY' },
          { label: 'FEATURE DRIFT', value: latest ? latest.featureDrift.toFixed(3) : '—', color: 'cyan', status: latest && latest.featureDrift > 0.08 ? 'ALERT' : 'NORMAL' },
          { label: 'PRED DRIFT', value: latest ? latest.predictionDrift.toFixed(3) : '—', color: latest && latest.predictionDrift > 0.08 ? 'amber' : 'cyan', status: latest && latest.predictionDrift > 0.08 ? 'ELEVATED' : 'NORMAL' },
          { label: 'LATENCY', value: '18ms', color: 'cyan', status: 'OPTIMAL' },
        ].map(({ label, value, color, status }) => (
          <div key={label} className="bg-space-800 border border-cyber rounded-sm p-3">
            <div className="font-mono text-xs text-slate-500">{label}</div>
            <div className={`font-display text-xl font-bold mt-1 ${color === 'emerald' ? 'text-emerald-400' : color === 'amber' ? 'text-amber-400' : 'text-cyber'}`}>{value}</div>
            <div className={`font-mono text-xs mt-1 ${color === 'emerald' ? 'text-emerald-400' : color === 'amber' ? 'text-amber-400' : 'text-cyan-400'}`}>{status}</div>
          </div>
        ))}
      </div>

      <Panel title="Concept Drift Monitor" live>
        <div className="p-3">
          <div className="flex gap-4 mb-2 font-mono text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-cyan-500 inline-block" /> Feature Drift</span>
            <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-amber-400 inline-block" /> Prediction Drift</span>
            <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-red-400 inline-block" /> Threshold (0.08)</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={drift} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#22D3EE0A" />
              <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#080B10', border: '1px solid #22D3EE22', borderRadius: 2, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
              <ReferenceLine y={0.08} stroke="#EF4444" strokeDasharray="3 3" strokeWidth={1} />
              <Line type="monotone" dataKey="featureDrift"    stroke="#22D3EE" strokeWidth={1.5} dot={false} name="Feature Drift" />
              <Line type="monotone" dataKey="predictionDrift" stroke="#FBBF24" strokeWidth={1.5} dot={false} name="Prediction Drift" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {active && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Drift Status">
            <div className="p-4 space-y-3">
              {[
                ['Current Model', active.model],
                ['Feature Drift', latest ? (latest.featureDrift > 0.08 ? `HIGH (${latest.featureDrift.toFixed(3)})` : `LOW (${latest.featureDrift.toFixed(3)})`) : '—'],
                ['Prediction Drift', latest ? (latest.predictionDrift > 0.08 ? `HIGH (${latest.predictionDrift.toFixed(3)})` : `MEDIUM (${latest.predictionDrift.toFixed(3)})`) : '—'],
                ['Threshold', '0.08'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between font-mono text-xs border-b border-cyber/20 pb-1.5">
                  <span className="text-slate-500">{label}</span>
                  <span className={String(value).includes('HIGH') ? 'text-amber-400' : 'text-slate-200'}>{value}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Live Model Performance">
            <div className="p-4 space-y-3">
              {([
                ['Precision', active.precision],
                ['Recall', active.recall],
                ['F1 Score', active.f1],
                ['PR-AUC', active.prAuc],
              ] as [string, number | null][]).filter(([, v]) => v != null).map(([label, value]) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-cyber">{value!.toFixed(3)}</span>
                  </div>
                  <ScoreBar value={value!} color="cyan" />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </div>
  )
}
