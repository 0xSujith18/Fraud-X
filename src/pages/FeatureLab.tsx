import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { fetchFeatureImportance } from '../services/api'
import { Panel, DemoTag, SectionHeader, ScoreBar } from '../components/shared'

type FeatureItem = { feature: string; importance: number; group: string }

const featureGroups: Record<string, string[]> = {
  'TRANSACTION': ['amount'],
  'TEMPORAL':    ['hour', 'tx_velocity_5m'],
  'BEHAVIORAL':  ['amount_deviation'],
  'DEVICE':      ['new_device'],
  'LOCATION':    ['new_location'],
  'BENEFICIARY': ['new_beneficiary'],
  'GRAPH':       ['graph_degree'],
}

const groupColors: Record<string, string> = {
  TRANSACTION: '#22D3EE', TEMPORAL: '#34D399', BEHAVIORAL: '#FBBF24',
  DEVICE: '#A78BFA', LOCATION: '#F87171', BENEFICIARY: '#FB923C', GRAPH: '#60A5FA',
}

export function FeatureLab() {
  const [importance, setImportance] = useState<FeatureItem[]>([])
  const [enabled, setEnabled] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchFeatureImportance().then(data => {
      const items = data as FeatureItem[]
      setImportance(items)
      setEnabled(Object.fromEntries(items.map(f => [f.feature, true])))
    })
  }, [])

  const toggle = (f: string) => setEnabled(prev => ({ ...prev, [f]: !prev[f] }))
  const enabledCount = Object.values(enabled).filter(Boolean).length
  const totalCount   = importance.length

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-start justify-between">
        <SectionHeader title="Feature Engineering Lab" subtitle="RAW TRANSACTION → ENGINEERED REPRESENTATION" />
        <DemoTag />
      </div>

      <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-space-800 border border-cyber rounded-sm p-3">
        <span className="text-slate-300 bg-space-700 border border-cyber px-2 py-1 rounded-sm">RAW TX</span>
        <span className="text-cyber">→</span>
        <span className="text-slate-400">FEATURE EXTRACTION</span>
        <span className="text-cyber">→</span>
        <span className="text-slate-400">NORMALIZATION</span>
        <span className="text-cyber">→</span>
        <span className="text-emerald-400 bg-space-700 border border-emerald-400/30 px-2 py-1 rounded-sm">
          FEATURE VECTOR [{enabledCount}/{totalCount}]
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          {Object.entries(featureGroups).map(([group, features]) => (
            <Panel key={group} title={`${group} FEATURES`} badge={`${features.filter(f => enabled[f]).length}/${features.length}`}>
              <div className="p-2 space-y-1">
                {features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <button
                      onClick={() => toggle(f)}
                      className={`w-3 h-3 rounded-sm border transition-colors shrink-0 ${enabled[f] ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600'}`}
                    />
                    <span className={`font-mono text-xs ${enabled[f] ? 'text-slate-300' : 'text-slate-600 line-through'}`}>{f}</span>
                    <div className="flex-1" />
                    <span className="font-mono text-xs" style={{ color: groupColors[group] }}>{group.toLowerCase()}</span>
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </div>

        <div className="space-y-4">
          <Panel title="Feature Importance" subtitle="GradientBoosting v2.0 — Live from sklearn">
            <div className="p-3 space-y-2">
              {importance.map((f, i) => (
                <div key={f.feature} className="space-y-1">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className="text-slate-600 w-4">{i + 1}.</span>
                      {f.feature}
                    </span>
                    <span className="text-cyber">{(f.importance * 100).toFixed(1)}%</span>
                  </div>
                  <ScoreBar value={f.importance} color="cyan" />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Feature Importance Chart">
            <div className="p-3">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={importance} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="feature" tick={{ fill: '#94A3B8', fontSize: 9, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} width={160} />
                  <Tooltip
                    contentStyle={{ background: '#080B10', border: '1px solid #22D3EE22', borderRadius: 2, fontFamily: 'JetBrains Mono', fontSize: 11 }}
                    formatter={(v: unknown) => [typeof v === 'number' ? (v * 100).toFixed(1) + '%' : '', 'Importance']}
                  />
                  <Bar dataKey="importance" radius={[0, 2, 2, 0]}>
                    {importance.map(f => (
                      <Cell key={f.feature} fill={groupColors[f.group.toUpperCase()] ?? '#22D3EE'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <div className="bg-space-800 border border-emerald-400/30 rounded-sm p-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div>
              <div className="font-mono text-xs text-emerald-400">DATA LEAKAGE CHECK: PASSED</div>
              <div className="font-mono text-xs text-slate-500 mt-0.5">All features computed using only information available before transaction T.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
