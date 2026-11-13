import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts'
import { investigationTx, velocityData } from '../data/synthetic'
import { Panel, DemoTag, SectionHeader, ScoreBar } from '../components/shared'

const radarData = [
  { axis: 'Amount', current: 95, baseline: 20 },
  { axis: 'Velocity', current: 88, baseline: 15 },
  { axis: 'Location', current: 82, baseline: 10 },
  { axis: 'Device', current: 90, baseline: 5 },
  { axis: 'Time', current: 75, baseline: 30 },
  { axis: 'Beneficiary', current: 85, baseline: 25 },
]

export function BehaviorAnalytics() {
  const { customerProfile } = investigationTx

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-start justify-between">
        <SectionHeader title="Behavior Analytics" subtitle="Customer behavioral profiling and deviation analysis" />
        <DemoTag />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Customer Profile */}
        <Panel title="Customer Behavior Profile" subtitle="C-4821">
          <div className="p-3 space-y-2">
            {[
              ['Typical Amount', `₹${customerProfile.typicalAmount.toLocaleString()}`],
              ['Median Amount', `₹${customerProfile.medianAmount.toLocaleString()}`],
              ['Usual Hours', customerProfile.usualHours],
              ['Primary Location', customerProfile.primaryLocation],
              ['Known Devices', customerProfile.knownDevices],
              ['Known Beneficiaries', customerProfile.knownBeneficiaries],
              ['Avg TX / Day', customerProfile.avgTxPerDay],
            ].map(([k, v]) => (
              <div key={k as string} className="flex items-center justify-between font-mono text-xs border-b border-cyber/20 pb-1.5">
                <span className="text-slate-500">{k}</span>
                <span className="text-slate-200">{v}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Current Transaction Comparison */}
        <Panel title="Current Transaction" subtitle="DEVIATION ANALYSIS">
          <div className="p-3 space-y-2">
            {[
              ['Amount', `₹${investigationTx.amount.toLocaleString()}`, '+14.2σ', 'red'],
              ['Time', '03:14 AM', 'OUTSIDE NORMAL', 'red'],
              ['Location', investigationTx.location, 'ANOMALY', 'red'],
              ['Device', investigationTx.device, 'NEW DEVICE', 'red'],
              ['Beneficiary', investigationTx.beneficiary, 'NEW', 'amber'],
            ].map(([k, v, flag, color]) => (
              <div key={k as string} className="flex items-center justify-between font-mono text-xs border-b border-cyber/20 pb-1.5">
                <span className="text-slate-500">{k}</span>
                <span className="text-slate-200">{v}</span>
                <span className={color === 'red' ? 'text-red-400' : 'text-amber-400'}>{flag}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Behavioral Deviation Radar */}
        <Panel title="Behavioral Deviation Radar">
          <div className="p-3">
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#22D3EE15" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Radar name="Current" dataKey="current" stroke="#EF4444" fill="#EF4444" fillOpacity={0.15} strokeWidth={1.5} />
                <Radar name="Baseline" dataKey="baseline" stroke="#22D3EE" fill="#22D3EE" fillOpacity={0.1} strokeWidth={1} strokeDasharray="3 3" />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center font-mono text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-400 inline-block" /> Current TX</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-cyan-500 inline-block border-dashed" /> Baseline</span>
            </div>
          </div>
        </Panel>

        {/* Deviation Summary */}
        <Panel title="Deviation Summary">
          <div className="p-3 space-y-3">
            {[
              { label: 'Amount Deviation', value: 0.95, text: '+14.2σ above mean' },
              { label: 'Velocity Deviation', value: 0.88, text: '8 TX in 5 min' },
              { label: 'Location Deviation', value: 0.82, text: '1,847 km from usual' },
              { label: 'Device Risk', value: 0.90, text: 'First-time device' },
              { label: 'Time Anomaly', value: 0.75, text: '03:14 AM — unusual' },
            ].map(({ label, value, text }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-red-400">{text}</span>
                </div>
                <ScoreBar value={value} color="red" />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

export function VelocityAnalytics() {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-start justify-between">
        <SectionHeader title="Transaction Velocity Engine" subtitle="Real-time velocity monitoring and attack detection" />
        <DemoTag />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {[
          { label: 'TX / 1 MIN', value: '8', status: 'ATTACK PATTERN', color: 'red' },
          { label: 'TX / 5 MIN', value: '24', status: 'SUSPICIOUS', color: 'amber' },
          { label: 'TX / 15 MIN', value: '31', status: 'ELEVATED', color: 'amber' },
          { label: 'TX / 1 HOUR', value: '47', status: 'NORMAL', color: 'emerald' },
        ].map(({ label, value, status, color }) => (
          <div key={label} className="bg-space-800 border border-cyber rounded-sm p-3">
            <div className="font-mono text-xs text-slate-500">{label}</div>
            <div className={`font-display text-2xl font-bold mt-1 ${color === 'red' ? 'text-red-400' : color === 'amber' ? 'text-amber-400' : 'text-emerald-400'}`}>{value}</div>
            <div className={`font-mono text-xs mt-1 ${color === 'red' ? 'text-red-400' : color === 'amber' ? 'text-amber-400' : 'text-emerald-400'}`}>{status}</div>
          </div>
        ))}
      </div>

      <Panel title="Velocity Timeline" live>
        <div className="p-3">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={velocityData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gVel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#22D3EE0A" />
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#080B10', border: '1px solid #22D3EE22', borderRadius: 2, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
              <ReferenceLine y={20} stroke="#EF4444" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'THRESHOLD', fill: '#EF4444', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <Area type="monotone" dataKey="tx5m" stroke="#22D3EE" strokeWidth={1.5} fill="url(#gVel)" name="TX/5min" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  )
}
