import { useState } from 'react'
import { transactions } from '../data/synthetic'
import { Panel, DemoTag, SectionHeader, RiskBadge } from '../components/shared'

const attackScenarios = [
  { id: 'ato', label: 'Account Takeover', desc: 'New device + location + high amount' },
  { id: 'velocity', label: 'Velocity Attack', desc: 'Multiple rapid transactions' },
  { id: 'beneficiary', label: 'New Beneficiary Attack', desc: 'Funds to unknown accounts' },
  { id: 'device', label: 'Device Switching', desc: 'Rapid device changes' },
  { id: 'location', label: 'Location Anomaly', desc: 'Geographic impossibility' },
  { id: 'ring', label: 'Fraud Ring', desc: 'Coordinated multi-account attack' },
  { id: 'amount', label: 'Unusual Amount', desc: 'Statistical outlier transaction' },
]

export function FraudIntelligence() {
  const [simRunning, setSimRunning] = useState(false)
  const [simScenario, setSimScenario] = useState<string | null>(null)
  const [simEvents, setSimEvents] = useState<typeof transactions>([])

  const runSim = (id: string) => {
    setSimScenario(id)
    setSimRunning(true)
    setSimEvents([])
    const interval = setInterval(() => {
      setSimEvents(prev => {
        if (prev.length >= 6) { clearInterval(interval); setSimRunning(false); return prev }
        const tx = transactions[Math.floor(Math.random() * 20)]
        return [...prev, { ...tx, id: `SIM-${Math.random().toString(16).slice(2, 8).toUpperCase()}`, riskLevel: 'HIGH', riskScore: 0.7 + Math.random() * 0.3 }]
      })
    }, 600)
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-start justify-between">
        <SectionHeader title="Fraud Intelligence" subtitle="Attack pattern analysis and simulation" />
        <DemoTag />
      </div>

      {/* Attack Simulator */}
      <Panel title="Fraud Attack Simulator" subtitle="ACADEMIC SIMULATION — SYNTHETIC EVENTS ONLY">
        <div className="p-4 space-y-4">
          <div className="bg-amber-400/5 border border-amber-400/20 rounded-sm p-2 font-mono text-xs text-amber-400">
            ⚠ SIMULATION MODE — All events are synthetically generated for research purposes only.
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {attackScenarios.map(s => (
              <button
                key={s.id}
                onClick={() => runSim(s.id)}
                disabled={simRunning}
                className={`p-3 rounded-sm border text-left transition-all disabled:opacity-50 ${simScenario === s.id ? 'border-red-400 bg-red-400/10' : 'border-cyber bg-space-800 hover:border-red-400/50'}`}
              >
                <div className="font-mono text-xs text-slate-300 font-semibold">{s.label}</div>
                <div className="font-mono text-xs text-slate-600 mt-0.5">{s.desc}</div>
              </button>
            ))}
          </div>

          {simEvents.length > 0 && (
            <div className="space-y-1">
              <div className="font-mono text-xs text-slate-500">SIMULATION OUTPUT</div>
              {simEvents.map((tx, i) => (
                <div key={i} className="font-mono text-xs flex items-center gap-3 bg-space-800 border border-red-400/20 rounded-sm p-2">
                  <span className="text-slate-600">[{new Date().toLocaleTimeString('en-US', { hour12: false })}]</span>
                  <span className="text-red-400">{tx.id}</span>
                  <span className="text-slate-400">₹{tx.amount.toLocaleString()}</span>
                  <span className="text-slate-400">{tx.channel}</span>
                  <RiskBadge level={tx.riskLevel} />
                  <span className="text-red-400">SCORE: {tx.riskScore.toFixed(2)}</span>
                </div>
              ))}
              {simRunning && <div className="font-mono text-xs text-cyan-400 animate-pulse">Generating events...</div>}
            </div>
          )}
        </div>
      </Panel>

      {/* Global Fraud Map (simplified) */}
      <Panel title="Global Transaction Activity" subtitle="SYNTHETIC DATA — NOT REAL BANKING ACTIVITY">
        <div className="p-4">
          <div className="relative bg-space-950 rounded-sm overflow-hidden" style={{ height: 280 }}>
            <svg viewBox="0 0 800 400" className="w-full h-full opacity-60">
              {/* Simplified world map outline */}
              <rect x="0" y="0" width="800" height="400" fill="#05070A" />
              {/* Grid */}
              {Array.from({ length: 8 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 50} x2="800" y2={i * 50} stroke="#22D3EE08" strokeWidth="0.5" />
              ))}
              {Array.from({ length: 16 }, (_, i) => (
                <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="400" stroke="#22D3EE08" strokeWidth="0.5" />
              ))}

              {/* Location nodes */}
              {[
                { name: 'India', x: 580, y: 200, fraud: 48, tx: 24183 },
                { name: 'Singapore', x: 650, y: 230, fraud: 12, tx: 8421 },
                { name: 'UAE', x: 530, y: 185, fraud: 8, tx: 5832 },
                { name: 'UK', x: 380, y: 130, fraud: 22, tx: 15291 },
                { name: 'USA', x: 180, y: 160, fraud: 31, tx: 42183 },
                { name: 'Germany', x: 420, y: 125, fraud: 15, tx: 11284 },
              ].map(loc => (
                <g key={loc.name}>
                  <circle cx={loc.x} cy={loc.y} r={loc.fraud > 30 ? 12 : 8} fill="#22D3EE10" stroke="#22D3EE" strokeWidth="0.5" />
                  <circle cx={loc.x} cy={loc.y} r={loc.fraud > 30 ? 12 : 8} fill="none" stroke="#22D3EE" strokeWidth="0.5" opacity="0.4">
                    <animate attributeName="r" values={`${loc.fraud > 30 ? 12 : 8};${loc.fraud > 30 ? 20 : 14};${loc.fraud > 30 ? 12 : 8}`} dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <text x={loc.x} y={loc.y + 4} textAnchor="middle" fill="#22D3EE" fontSize="7" fontFamily="JetBrains Mono">{loc.name}</text>
                  {/* Connection lines */}
                  <line x1={loc.x} y1={loc.y} x2="580" y2="200" stroke="#22D3EE15" strokeWidth="0.5" strokeDasharray="4 4" />
                </g>
              ))}
            </svg>
            <div className="absolute bottom-2 left-2 font-mono text-xs text-slate-600">
              SYNTHETIC DATA — NOT REAL BANKING ACTIVITY
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}
