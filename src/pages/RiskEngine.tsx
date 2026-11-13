import { useState } from 'react'
import { evaluateTransactionRisk } from '../services/riskEngine'
import { Panel, DemoTag, SectionHeader, ScoreBar } from '../components/shared'

export function RiskEngine() {
  const [amount, setAmount] = useState(85000)
  const [txLast5m, setTxLast5m] = useState(8)
  const [isNewDevice, setIsNewDevice] = useState(true)
  const [isNewBeneficiary, setIsNewBeneficiary] = useState(true)
  const [geoDistance, setGeoDistance] = useState(1847)

  // Real-time mathematical risk calculation
  const evalResult = evaluateTransactionRisk({
    id: 'TX-8A91F2',
    amount,
    baselineMean: 5980,
    baselineStd: 1850,
    hour: 2,
    txLast5m,
    isNewDevice,
    isNewLocation: geoDistance > 100,
    isNewBeneficiary,
    geoDistanceKm: geoDistance,
    graphDegree: 6,
  })

  const scoreList = [
    { label: 'Supervised Score', value: evalResult.supervisedScore, desc: 'Logistic / Gradient boosted tree response', alpha: 'α' },
    { label: 'Anomaly Score', value: evalResult.anomalyScore, desc: 'Mahalanobis & Isolation Forest distance', alpha: 'β' },
    { label: 'Behavior Score', value: evalResult.behaviorScore, desc: 'Z-score deviation & velocity weighting', alpha: 'γ' },
    { label: 'Graph Risk', value: evalResult.graphRiskScore, desc: 'Entity degree & connection risk', alpha: 'δ' },
  ]

  const riskColor = evalResult.riskLevel === 'CRITICAL' ? 'text-red-400' : evalResult.riskLevel === 'HIGH' ? 'text-amber-400' : 'text-emerald-400'
  const circleColor = evalResult.riskLevel === 'CRITICAL' ? '#EF4444' : evalResult.riskLevel === 'HIGH' ? '#FBBF24' : '#10B981'

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-start justify-between">
        <SectionHeader title="Fraud Risk Engine" subtitle="Hybrid multi-signal mathematical risk scoring architecture" />
        <DemoTag />
      </div>

      {/* Dynamic Simulator Bar */}
      <div className="bg-space-800 border border-cyber rounded-sm p-4 space-y-3">
        <div className="font-mono text-xs text-cyber font-semibold tracking-wider uppercase">Interactive Risk Parameter Simulator</div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="font-mono text-xs text-slate-400 block mb-1">Amount: ₹{amount.toLocaleString()}</label>
            <input
              type="range"
              min="500"
              max="250000"
              step="500"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-space-900 cursor-pointer"
            />
          </div>
          <div>
            <label className="font-mono text-xs text-slate-400 block mb-1">Velocity (5m): {txLast5m} tx</label>
            <input
              type="range"
              min="1"
              max="20"
              value={txLast5m}
              onChange={(e) => setTxLast5m(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-space-900 cursor-pointer"
            />
          </div>
          <div>
            <label className="font-mono text-xs text-slate-400 block mb-1">Geo Distance: {geoDistance} km</label>
            <input
              type="range"
              min="0"
              max="3000"
              step="10"
              value={geoDistance}
              onChange={(e) => setGeoDistance(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-space-900 cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="devCheck"
              checked={isNewDevice}
              onChange={(e) => setIsNewDevice(e.target.checked)}
              className="accent-cyan-400 cursor-pointer"
            />
            <label htmlFor="devCheck" className="font-mono text-xs text-slate-300 cursor-pointer">New Device</label>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="benCheck"
              checked={isNewBeneficiary}
              onChange={(e) => setIsNewBeneficiary(e.target.checked)}
              className="accent-cyan-400 cursor-pointer"
            />
            <label htmlFor="benCheck" className="font-mono text-xs text-slate-300 cursor-pointer">New Beneficiary</label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Score Decomposition */}
        <Panel title="Risk Score Decomposition" subtitle={`TX-8A91F2 · Z-Score: +${evalResult.zScore}σ`}>
          <div className="p-4 space-y-4">
            {scoreList.map(({ label, value, desc, alpha }) => (
              <div key={label} className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-cyber w-4">{alpha}</span>
                    <span className="text-slate-300">{label}</span>
                  </div>
                  <span className={`${riskColor} font-bold`}>{value.toFixed(2)}</span>
                </div>
                <ScoreBar value={value} color={evalResult.riskLevel === 'CRITICAL' ? 'red' : 'cyan'} />
                <div className="font-mono text-xs text-slate-600">{desc}</div>
              </div>
            ))}

            <div className="bg-space-800 border border-cyber rounded-sm p-3 mt-2">
              <div className="font-mono text-xs text-slate-500 mb-1">REAL MULTI-FACTOR FORMULA</div>
              <div className="font-mono text-xs text-slate-300">
                Risk = 0.40(Supervised) + 0.25(Anomaly) + 0.20(Behavior) + 0.15(Graph)
              </div>
              <div className="font-mono text-xs text-cyber font-bold mt-1">
                Calculated Score: {evalResult.finalRiskScore} ({(evalResult.finalRiskScore * 100).toFixed(1)}%)
              </div>
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          {/* Final Score Gauge */}
          <Panel title="Final Risk Score">
            <div className="p-6 flex flex-col items-center gap-4">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#22D3EE15" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke={circleColor} strokeWidth="8"
                    strokeDasharray={`${evalResult.finalRiskScore * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`font-display text-3xl font-bold ${riskColor}`}>
                    {(evalResult.finalRiskScore * 100).toFixed(0)}%
                  </span>
                  <span className="font-mono text-xs text-slate-500">RISK</span>
                </div>
              </div>
              <div className="text-center">
                <div className={`font-display text-lg font-bold tracking-widest ${riskColor}`}>
                  {evalResult.riskLevel} RISK
                </div>
                <div className="font-mono text-xs text-slate-500 mt-1">
                  Amount Z-Score: +{evalResult.zScore}σ
                </div>
              </div>
            </div>
          </Panel>

          {/* Decision & Action */}
          <Panel title="Decision & Reason Codes">
            <div className="p-4 space-y-3">
              <div className={`border rounded-sm p-3 ${
                evalResult.riskLevel === 'CRITICAL' ? 'bg-red-400/10 border-red-400/30 text-red-400' :
                evalResult.riskLevel === 'HIGH' ? 'bg-amber-400/10 border-amber-400/30 text-amber-400' :
                'bg-emerald-400/10 border-emerald-400/30 text-emerald-400'
              }`}>
                <div className="font-mono text-xs font-bold">DECISION: {evalResult.decision}</div>
                <div className="font-mono text-xs text-slate-300 mt-0.5">
                  Action: {evalResult.decision === 'BLOCK' ? 'REJECT TRANSACTION' : evalResult.decision === 'STEP-UP AUTH' ? 'REQUIRE OTP / BIOMETRIC' : 'ALLOW'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-mono text-xs text-slate-500">REASON CODES (MATHEMATICALLY COMPUTED)</div>
                {evalResult.reasonCodes.length > 0 ? (
                  evalResult.reasonCodes.map((r: string, i: number) => (
                    <div key={i} className="font-mono text-xs text-slate-300 flex gap-2">
                      <span className="text-cyan-400">[R{i + 1}]</span>
                      <span>{r}</span>
                    </div>
                  ))
                ) : (
                  <div className="font-mono text-xs text-emerald-400">NO RISK REASONS DETECTED — BASELINE NORMAL</div>
                )}
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
