import { useState, useEffect } from 'react'
import { fetchModelMetrics } from '../services/api'
import { Panel, DemoTag, SectionHeader, ScoreBar } from '../components/shared'

type ModelMetric = {
  model: string; precision: number | null; recall: number | null
  f1: number | null; prAuc: number | null; rocAuc: number | null
  latency: number; status: string
}

export function MLModels() {
  const [metrics, setMetrics] = useState<ModelMetric[]>([])

  useEffect(() => {
    fetchModelMetrics().then(data => setMetrics(data as ModelMetric[]))
  }, [])

  const active = metrics.find(m => m.status === 'ACTIVE')

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-start justify-between">
        <SectionHeader title="ML Model Lab" subtitle="Live model comparison — metrics computed from trained sklearn models" />
        <DemoTag />
      </div>

      <Panel title="Model Comparison Matrix">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-cyber text-slate-500">
                <th className="text-left px-4 py-2">MODEL</th>
                <th className="text-left px-4 py-2">PRECISION</th>
                <th className="text-left px-4 py-2">RECALL</th>
                <th className="text-left px-4 py-2">F1</th>
                <th className="text-left px-4 py-2">PR-AUC</th>
                <th className="text-left px-4 py-2">ROC-AUC</th>
                <th className="text-left px-4 py-2">LATENCY</th>
                <th className="text-left px-4 py-2">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map(m => (
                <tr key={m.model} className="border-b border-cyber/20 hover:bg-space-800 transition-colors">
                  <td className="px-4 py-2.5 text-slate-200 font-semibold">{m.model}</td>
                  {m.precision != null ? (
                    <>
                      <td className="px-4 py-2.5 text-cyber">{m.precision.toFixed(3)}</td>
                      <td className="px-4 py-2.5 text-cyber">{m.recall!.toFixed(3)}</td>
                      <td className="px-4 py-2.5 text-cyber">{m.f1!.toFixed(3)}</td>
                      <td className="px-4 py-2.5 text-emerald-400 font-bold">{m.prAuc!.toFixed(3)}</td>
                      <td className="px-4 py-2.5 text-emerald-400">{m.rocAuc!.toFixed(3)}</td>
                      <td className="px-4 py-2.5 text-slate-300">{m.latency}ms</td>
                    </>
                  ) : (
                    <td colSpan={6} className="px-4 py-2.5 text-slate-600 italic">— awaiting experiment —</td>
                  )}
                  <td className="px-4 py-2.5">
                    <span className={`font-mono text-xs px-1.5 py-0.5 rounded-sm border ${
                      m.status === 'ACTIVE' ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5' : 'text-slate-600 border-slate-700'
                    }`}>{m.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {active && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Active Model Card" subtitle={active.model}>
            <div className="p-4 space-y-3">
              {[
                ['Model Name', active.model],
                ['Training Dataset', 'FRAUD-X Synthetic (5,000 samples)'],
                ['Features', '8 engineered features'],
                ['Algorithm', 'Gradient Boosted Trees (sklearn)'],
                ['Precision', active.precision?.toFixed(3) ?? '—'],
                ['Recall', active.recall?.toFixed(3) ?? '—'],
                ['F1 Score', active.f1?.toFixed(3) ?? '—'],
                ['PR-AUC', active.prAuc?.toFixed(3) ?? '—'],
                ['Inference Latency', `${active.latency}ms avg`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between font-mono text-xs border-b border-cyber/20 pb-1.5">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-200">{v}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Performance Metrics">
            <div className="p-4 space-y-3">
              {([
                ['Precision', active.precision],
                ['Recall', active.recall],
                ['F1 Score', active.f1],
                ['PR-AUC', active.prAuc],
                ['ROC-AUC', active.rocAuc],
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
