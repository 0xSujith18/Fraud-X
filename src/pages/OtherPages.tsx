import { useState } from 'react'
import { Play, Save, Download } from 'lucide-react'
import { datasets, systemLogs } from '../data/synthetic'
import { Panel, DemoTag, SectionHeader, NoData } from '../components/shared'

export function ExperimentLab() {
  const [running, setRunning] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const configs = [
    { id: 'A', label: 'Config A', desc: 'Raw Features Only', features: 12 },
    { id: 'B', label: 'Config B', desc: 'Raw + Temporal', features: 19 },
    { id: 'C', label: 'Config C', desc: 'Raw + Temporal + Behavioral', features: 31 },
    { id: 'D', label: 'Config D', desc: 'Full Architecture (47 features)', features: 47 },
  ]

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-start justify-between">
        <SectionHeader title="Experiment Lab" subtitle="Research experimentation and ablation studies" />
        <DemoTag />
      </div>

      <Panel title="Behavioral Feature Impact Study" subtitle="EXP-2026-001">
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {configs.map(c => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id === selected ? null : c.id)}
                className={`p-3 rounded-sm border text-left transition-all ${selected === c.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-cyber bg-space-800 hover:border-cyan-500/50'}`}
              >
                <div className="font-display text-lg font-bold text-cyber">{c.id}</div>
                <div className="font-mono text-xs text-slate-300 mt-1">{c.label}</div>
                <div className="font-mono text-xs text-slate-500 mt-0.5">{c.desc}</div>
                <div className="font-mono text-xs text-slate-600 mt-1">{c.features} features</div>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setRunning(true); setTimeout(() => setRunning(false), 3000) }}
              disabled={running}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500 rounded-sm font-mono text-xs text-cyber hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
            >
              <Play size={12} />
              {running ? 'RUNNING...' : 'RUN EXPERIMENT'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-space-800 border border-cyber rounded-sm font-mono text-xs text-slate-400 hover:text-slate-200 transition-colors">
              <Save size={12} />
              SAVE
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-space-800 border border-cyber rounded-sm font-mono text-xs text-slate-400 hover:text-slate-200 transition-colors">
              <Download size={12} />
              EXPORT
            </button>
          </div>

          <div className="bg-space-800 border border-cyber rounded-sm p-4">
            <div className="font-mono text-xs text-slate-500 mb-3">EXPERIMENT RESULTS</div>
            {running ? (
              <div className="font-mono text-xs text-cyan-400 animate-pulse">Running experiment... Please wait.</div>
            ) : (
              <NoData message="NO EXPERIMENTAL RESULT AVAILABLE — Run an experiment to generate results." />
            )}
          </div>

          <div className="bg-amber-400/5 border border-amber-400/20 rounded-sm p-3">
            <div className="font-mono text-xs text-amber-400">RESEARCH INTEGRITY NOTICE</div>
            <div className="font-mono text-xs text-slate-400 mt-1">
              All experiment results must be traceable to actual runs. Metrics are only displayed after a real experiment execution with a valid dataset, model configuration, and random seed.
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}

export function DatasetManager() {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-start justify-between">
        <SectionHeader title="Dataset Management" subtitle="Research datasets and data quality control" />
        <DemoTag />
      </div>

      <Panel title="Available Datasets">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-cyber text-slate-500">
                <th className="text-left px-4 py-2">DATASET</th>
                <th className="text-left px-4 py-2">ROWS</th>
                <th className="text-left px-4 py-2">FEATURES</th>
                <th className="text-left px-4 py-2">FRAUD COUNT</th>
                <th className="text-left px-4 py-2">FRAUD RATE</th>
                <th className="text-left px-4 py-2">MISSING</th>
                <th className="text-left px-4 py-2">TIME RANGE</th>
                <th className="text-left px-4 py-2">TYPE</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((d: any) => (
                <tr key={d.name} className="border-b border-cyber/20 hover:bg-space-800 transition-colors">
                  <td className="px-4 py-2.5 text-slate-200">{d.name}</td>
                  <td className="px-4 py-2.5 text-slate-400">{d.rows.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-slate-400">{d.features}</td>
                  <td className="px-4 py-2.5 text-slate-400">{d.fraudCount.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-amber-400">{d.fraudRate}%</td>
                  <td className="px-4 py-2.5 text-slate-400">{d.missing}%</td>
                  <td className="px-4 py-2.5 text-slate-500">{d.timeRange}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded-sm border font-mono text-xs ${
                      d.type === 'public' ? 'text-cyan-400 border-cyan-400/30 bg-cyan-400/5' :
                      d.type === 'synthetic' ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5' :
                      'text-amber-400 border-amber-400/30 bg-amber-400/5'
                    }`}>{d.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {[
          { label: 'DATA QUALITY', value: '98.2%', color: 'emerald' },
          { label: 'MISSING VALUES', value: '0.8%', color: 'amber' },
          { label: 'DUPLICATES', value: '0.1%', color: 'emerald' },
          { label: 'FRAUD CLASS', value: '0.17%', color: 'amber' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-space-800 border border-cyber rounded-sm p-3">
            <div className="font-mono text-xs text-slate-500">{label}</div>
            <div className={`font-display text-xl font-bold mt-1 ${color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'}`}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ResearchHub() {
  const sections = [
    { id: 'problem', title: 'Research Problem', content: 'High-frequency digital banking fraud detection requires real-time feature engineering architectures capable of processing thousands of transactions per second while maintaining high precision and recall.' },
    { id: 'objectives', title: 'Research Objectives', content: '1. Design a feature engineering architecture for real-time fraud detection\n2. Evaluate the contribution of each feature group via ablation studies\n3. Compare supervised, unsupervised, and hybrid detection approaches\n4. Analyze concept drift and model degradation over time' },
    { id: 'questions', title: 'Research Questions', content: 'RQ1: Which feature groups contribute most to fraud detection performance?\nRQ2: How does behavioral profiling improve detection of account takeover?\nRQ3: What is the optimal balance between precision and recall for banking fraud?\nRQ4: How quickly do fraud patterns evolve and how should models adapt?' },
    { id: 'gap', title: 'Research Gap', content: 'Existing literature focuses on static feature sets and offline evaluation. This research addresses the gap in real-time, streaming feature engineering with temporal validation and concept drift monitoring.' },
    { id: 'methodology', title: 'Methodology', content: 'Temporal train-test split (no data leakage). Feature engineering pipeline with 7 feature groups. Ablation study across feature configurations A-D. Model comparison: LR, RF, XGBoost, LightGBM, Isolation Forest, Hybrid.' },
  ]

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-start justify-between">
        <SectionHeader title="Research Hub" subtitle="Feature Engineering Architectures for High-Frequency Fraud Detection in Digital Banking Systems" />
        <DemoTag />
      </div>

      <div className="space-y-3">
        {sections.map(s => (
          <Panel key={s.id} title={s.title}>
            <div className="p-4">
              <p className="font-mono text-xs text-slate-400 leading-relaxed whitespace-pre-line">{s.content}</p>
            </div>
          </Panel>
        ))}

        <Panel title="Experiment Results Workspace">
          <div className="p-4">
            <NoData message="ATTACH EXPERIMENT RESULTS — Run experiments in the Experiment Lab to populate this section." />
          </div>
        </Panel>
      </div>
    </div>
  )
}

export function SystemLogs() {
  const [filter, setFilter] = useState('ALL')
  const levels = ['ALL', 'INFO', 'WARN', 'CRITICAL', 'MODEL', 'DATA', 'SECURITY']

  const filtered = filter === 'ALL' ? systemLogs : systemLogs.filter((l: any) => l.level === filter)

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-cyber flex items-center gap-3">
        <span className="font-display text-sm font-bold tracking-widest text-slate-200 uppercase">System Logs</span>
        <div className="flex-1" />
        {levels.map(l => (
          <button
            key={l}
            onClick={() => setFilter(l)}
            className={`font-mono text-xs px-2 py-1 rounded-sm border transition-colors ${filter === l ? 'border-cyan-500 text-cyber bg-cyan-500/10' : 'border-cyber text-slate-500 hover:text-slate-300'}`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5 font-mono text-xs">
        {filtered.map((log: any, i: number) => (
          <div key={i} className="flex gap-3 py-0.5 hover:bg-space-800 px-2 rounded-sm">
            <span className="text-slate-600 shrink-0 w-24">{log.time}</span>
            <span className={`shrink-0 w-16 ${
              log.level === 'CRITICAL' ? 'text-red-400' :
              log.level === 'WARN' ? 'text-amber-400' :
              log.level === 'MODEL' ? 'text-cyan-400' :
              log.level === 'SECURITY' ? 'text-purple-400' :
              log.level === 'DATA' ? 'text-blue-400' :
              'text-emerald-400'
            }`}>[{log.level}]</span>
            <span className="text-slate-400">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Settings() {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <SectionHeader title="Settings" subtitle="System configuration and preferences" />
      <Panel title="Display">
        <div className="p-4 space-y-3">
          {[
            { label: 'Theme', value: 'DARK COMMAND MODE' },
            { label: 'Refresh Rate', value: '2 seconds' },
            { label: 'Chart Animation', value: 'Enabled' },
            { label: 'Sound Alerts', value: 'Disabled' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between font-mono text-xs border-b border-cyber/20 pb-2">
              <span className="text-slate-500">{label}</span>
              <span className="text-slate-200">{value}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="System">
        <div className="p-4 space-y-3">
          {[
            { label: 'API Endpoint', value: 'http://localhost:8000/api' },
            { label: 'Auth Mode', value: 'JWT (Research Admin)' },
            { label: 'Data Mode', value: 'DEMO — SYNTHETIC DATA' },
            { label: 'Version', value: 'FRAUD-X v2.0.0' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between font-mono text-xs border-b border-cyber/20 pb-2">
              <span className="text-slate-500">{label}</span>
              <span className="text-slate-200">{value}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
