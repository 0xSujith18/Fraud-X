import { useState } from 'react'
import { Search, X, AlertTriangle } from 'lucide-react'
import { transactions, investigationTx, type Transaction } from '../data/synthetic'
import { RiskBadge, DemoTag, ScoreBar } from '../components/shared'

export function TransactionExplorer() {
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('ALL')

  const filtered = transactions.filter(tx => {
    const matchSearch = !search || tx.id.toLowerCase().includes(search.toLowerCase()) || tx.customerId.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || tx.riskLevel === filter
    return matchSearch && matchFilter
  }).slice(0, 100)

  const tx = selected?.id === investigationTx.id ? investigationTx : selected

  return (
    <div className="h-full flex overflow-hidden">
      <div className={`flex flex-col ${selected ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
        <div className="p-4 border-b border-cyber flex items-center gap-3 flex-wrap">
          <h2 className="font-display text-sm font-bold tracking-widest text-slate-200 uppercase">Live Transactions</h2>
          <DemoTag />
          <div className="flex-1" />
          <div className="flex items-center gap-2 bg-space-800 border border-cyber rounded-sm px-2 py-1">
            <Search size={11} className="text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search TX ID or Customer..."
              className="bg-transparent font-mono text-xs text-slate-300 placeholder-slate-600 outline-none w-40"
            />
          </div>
          {(['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-mono text-xs px-2 py-1 rounded-sm border transition-colors ${filter === f ? 'border-cyan-500 text-cyber bg-cyan-500/10' : 'border-cyber text-slate-500 hover:text-slate-300'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs font-mono">
            <thead className="sticky top-0 bg-space-900 z-10">
              <tr className="border-b border-cyber text-slate-500">
                <th className="text-left px-3 py-2">TX ID</th>
                <th className="text-left px-3 py-2">TIME</th>
                <th className="text-left px-3 py-2">CUSTOMER</th>
                <th className="text-left px-3 py-2">AMOUNT</th>
                <th className="text-left px-3 py-2">CHANNEL</th>
                <th className="text-left px-3 py-2">LOCATION</th>
                <th className="text-left px-3 py-2">RISK</th>
                <th className="text-left px-3 py-2">DECISION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row: Transaction) => (
                <tr
                  key={row.id}
                  onClick={() => setSelected(row.id === selected?.id ? null : row)}
                  className={`border-b border-cyber/20 cursor-pointer transition-colors ${selected?.id === row.id ? 'bg-cyan-500/10' : 'hover:bg-space-800'}`}
                >
                  <td className="px-3 py-1.5 text-cyber">{row.id}</td>
                  <td className="px-3 py-1.5 text-slate-500">{new Date(row.timestamp).toLocaleTimeString('en-US', { hour12: false })}</td>
                  <td className="px-3 py-1.5 text-slate-400">{row.customerId}</td>
                  <td className="px-3 py-1.5 text-slate-300">₹{row.amount.toLocaleString()}</td>
                  <td className="px-3 py-1.5 text-slate-400">{row.channel}</td>
                  <td className="px-3 py-1.5 text-slate-400">{row.location}</td>
                  <td className="px-3 py-1.5"><RiskBadge level={row.riskLevel} /></td>
                  <td className="px-3 py-1.5 text-slate-400">{row.decision}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="w-1/2 border-l border-cyber overflow-y-auto bg-space-900">
          <div className="p-4 border-b border-cyber flex items-center justify-between">
            <span className="font-display text-xs font-bold tracking-widest text-slate-200 uppercase">Transaction Intelligence</span>
            <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300">
              <X size={14} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {([
                ['TX ID', tx?.id],
                ['Amount', `₹${tx?.amount.toLocaleString()}`],
                ['Timestamp', tx ? new Date(tx.timestamp).toLocaleTimeString('en-US', { hour12: false }) : ''],
                ['Channel', tx?.channel],
                ['Device', tx?.device],
                ['Location', tx?.location],
                ['Beneficiary', tx?.beneficiary],
                ['Customer', tx?.customerId],
              ] as [string, string | undefined][]).map(([k, v]) => (
                <div key={k} className="bg-space-800 border border-cyber rounded-sm p-2">
                  <div className="font-mono text-xs text-slate-500">{k}</div>
                  <div className="font-mono text-xs text-slate-200 mt-0.5">{v}</div>
                </div>
              ))}
            </div>

            <div className="bg-space-800 border border-cyber rounded-sm p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-slate-400">RISK SCORE</span>
                <RiskBadge level={tx?.riskLevel ?? 'LOW'} />
              </div>
              <div className="font-display text-3xl font-bold text-red-400 mb-2">
                {((tx?.riskScore ?? 0) * 100).toFixed(0)}%
              </div>
              <ScoreBar value={tx?.riskScore ?? 0} color="red" />
              <div className="mt-2 font-mono text-xs text-slate-500">DECISION: <span className="text-slate-300">{tx?.decision}</span></div>
            </div>

            {tx?.id === investigationTx.id && (
              <div className="space-y-2">
                <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">Score Breakdown</span>
                {([
                  ['Supervised', investigationTx.supervisedScore],
                  ['Anomaly', investigationTx.anomalyScore],
                  ['Behavioral', investigationTx.behaviorScore],
                  ['Graph Risk', investigationTx.graphRisk],
                ] as [string, number][]).map(([label, val]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500 w-24">{label}</span>
                    <ScoreBar value={val} color="cyan" />
                    <span className="font-mono text-xs text-cyber w-10 text-right">{val.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {tx?.flags && tx.flags.length > 0 && (
              <div className="space-y-1">
                <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">Risk Signals</span>
                {tx.flags.map((f: string) => (
                  <div key={f} className="flex items-center gap-2 font-mono text-xs text-amber-400">
                    <AlertTriangle size={10} />
                    {f}
                  </div>
                ))}
              </div>
            )}

            {tx?.id === investigationTx.id && (
              <div className="space-y-2">
                <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">Why This Transaction Is Suspicious</span>
                {investigationTx.reasons.map((r: string, i: number) => (
                  <div key={i} className="flex gap-2 font-mono text-xs text-slate-400 bg-space-800 border border-cyber/30 rounded-sm p-2">
                    <span className="text-red-400 shrink-0">{i + 1}.</span>
                    {r}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
