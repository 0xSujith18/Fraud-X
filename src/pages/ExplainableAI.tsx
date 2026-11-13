import { shapValues } from '../data/synthetic'
import { Panel, DemoTag, SectionHeader } from '../components/shared'

export function ExplainableAI() {
  const maxVal = Math.max(...shapValues.map(s => Math.abs(s.value)))

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-start justify-between">
        <SectionHeader title="Explainable AI" subtitle="SHAP-style feature contribution analysis" />
        <DemoTag />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Model Explanation" subtitle="TX-8A91F2 · XGBoost v1.4">
          <div className="p-4 space-y-4">
            <div className="bg-space-800 border border-red-400/30 rounded-sm p-3">
              <div className="font-mono text-xs text-slate-500">FRAUD PROBABILITY</div>
              <div className="font-display text-3xl font-bold text-red-400 mt-1">91%</div>
              <div className="font-mono text-xs text-slate-500 mt-1">Base rate: 0.17% → Prediction: 91%</div>
            </div>

            <div className="space-y-2">
              <div className="font-mono text-xs text-slate-500 uppercase tracking-widest">Feature Contributions (SHAP Values)</div>
              {shapValues.map(s => (
                <div key={s.feature} className="space-y-1">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-400">{s.feature}</span>
                    <span className={s.direction === 'positive' ? 'text-red-400' : 'text-emerald-400'}>
                      {s.direction === 'positive' ? '+' : ''}{s.value.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 h-3">
                    {s.direction === 'positive' ? (
                      <>
                        <div className="flex-1" />
                        <div className="h-full bg-red-400/60 rounded-sm" style={{ width: `${(s.value / maxVal) * 45}%` }} />
                      </>
                    ) : (
                      <>
                        <div className="h-full bg-emerald-400/60 rounded-sm" style={{ width: `${(Math.abs(s.value) / maxVal) * 45}%` }} />
                        <div className="flex-1" />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Model Reasoning Summary">
            <div className="p-4">
              <div className="bg-space-800 border border-cyan-500/20 rounded-sm p-4">
                <div className="font-mono text-xs text-cyan-400 mb-2">AI REASONING</div>
                <p className="font-mono text-xs text-slate-300 leading-relaxed">
                  "This transaction significantly deviates from the customer's historical behavior and exhibits multiple independent risk signals. The combination of high transaction velocity, new device fingerprint, new beneficiary, and geographic anomaly creates a compound risk profile consistent with account takeover fraud patterns."
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="Contribution Waterfall">
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-slate-500 w-32">Base rate</span>
                <div className="flex-1 h-4 bg-space-700 rounded-sm overflow-hidden">
                  <div className="h-full bg-slate-600 rounded-sm" style={{ width: '2%' }} />
                </div>
                <span className="text-slate-400 w-12 text-right">0.17%</span>
              </div>
              {shapValues.filter(s => s.direction === 'positive').map(s => (
                <div key={s.feature} className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-500 w-32 truncate">{s.feature}</span>
                  <div className="flex-1 h-4 bg-space-700 rounded-sm overflow-hidden">
                    <div className="h-full bg-red-400/70 rounded-sm" style={{ width: `${s.value * 100}%` }} />
                  </div>
                  <span className="text-red-400 w-12 text-right">+{(s.value * 100).toFixed(1)}%</span>
                </div>
              ))}
              {shapValues.filter(s => s.direction === 'negative').map(s => (
                <div key={s.feature} className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-500 w-32 truncate">{s.feature}</span>
                  <div className="flex-1 h-4 bg-space-700 rounded-sm overflow-hidden">
                    <div className="h-full bg-emerald-400/70 rounded-sm" style={{ width: `${Math.abs(s.value) * 100}%` }} />
                  </div>
                  <span className="text-emerald-400 w-12 text-right">{(s.value * 100).toFixed(1)}%</span>
                </div>
              ))}
              <div className="border-t border-cyber pt-2 flex items-center gap-2 font-mono text-xs">
                <span className="text-slate-300 w-32 font-bold">Final Score</span>
                <div className="flex-1 h-4 bg-space-700 rounded-sm overflow-hidden">
                  <div className="h-full bg-red-400 rounded-sm" style={{ width: '91%' }} />
                </div>
                <span className="text-red-400 font-bold w-12 text-right">91%</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
