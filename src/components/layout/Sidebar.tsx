import {
  Activity, BarChart2, BookOpen, Brain, Database,
  FlaskConical, GitBranch, Globe, Layers, Monitor, Network,
  Settings, Shield, Terminal, TrendingUp, Zap
} from 'lucide-react'
import clsx from 'clsx'
import { StatusDot } from '../shared'

const navItems = [
  { id: 'command', label: 'COMMAND CENTER', icon: Monitor, num: '01' },
  { id: 'transactions', label: 'LIVE TRANSACTIONS', icon: Activity, num: '02' },
  { id: 'fraud-intel', label: 'FRAUD INTELLIGENCE', icon: Shield, num: '03' },
  { id: 'fraud-orbit', label: 'GLOBAL FRAUD ORBIT', icon: Globe, num: '04' },
  { id: 'feature-lab', label: 'FEATURE LAB', icon: Layers, num: '05' },
  { id: 'behavior', label: 'BEHAVIOR ANALYTICS', icon: Brain, num: '06' },
  { id: 'network', label: 'NETWORK GRAPH', icon: Network, num: '07' },
  { id: 'models', label: 'ML MODELS', icon: BarChart2, num: '08' },
  { id: 'risk-engine', label: 'RISK ENGINE', icon: Zap, num: '09' },
  { id: 'xai', label: 'EXPLAINABLE AI', icon: GitBranch, num: '10' },
  { id: 'model-monitor', label: 'MODEL MONITOR', icon: TrendingUp, num: '11' },
  { id: 'experiments', label: 'EXPERIMENT LAB', icon: FlaskConical, num: '12' },
  { id: 'datasets', label: 'DATASETS', icon: Database, num: '13' },
  { id: 'research', label: 'RESEARCH HUB', icon: BookOpen, num: '14' },
  { id: 'logs', label: 'SYSTEM LOGS', icon: Terminal, num: '15' },
  { id: 'settings', label: 'SETTINGS', icon: Settings, num: '16' },
]

interface SidebarProps {
  active: string
  onNavigate: (id: string) => void
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="w-52 bg-space-900 border-r border-cyber flex flex-col shrink-0 overflow-hidden">
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map(({ id, label, icon: Icon, num }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={clsx(
              'w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all group',
              active === id
                ? 'bg-cyan-500/10 border-r-2 border-r-cyan-500 text-cyber'
                : 'text-slate-500 hover:text-slate-300 hover:bg-space-800'
            )}
          >
            <span className="font-mono text-xs text-slate-600 w-5 shrink-0">{num}</span>
            <Icon size={12} className={clsx('shrink-0', active === id ? 'text-cyber' : 'text-slate-600 group-hover:text-slate-400')} />
            <span className="font-mono text-xs tracking-wide truncate">{label}</span>
          </button>
        ))}
      </nav>

      {/* System Status */}
      <div className="border-t border-cyber p-3 space-y-1.5">
        <span className="font-mono text-xs text-slate-600 uppercase tracking-widest">System Status</span>
        <StatusRow label="DATA STREAM" status="online" />
        <StatusRow label="FEATURE ENGINE" status="online" />
        <StatusRow label="MODEL" status="online" />
        <StatusRow label="RISK ENGINE" status="online" />
      </div>
    </aside>
  )
}

function StatusRow({ label, status }: { label: string; status: 'online' | 'warn' | 'error' | 'idle' }) {
  const textColor = status === 'online' ? 'text-emerald-400' : status === 'warn' ? 'text-amber-400' : 'text-red-400'
  return (
    <div className="flex items-center gap-1.5">
      <StatusDot status={status} />
      <span className={clsx('font-mono text-xs', textColor)}>{label}</span>
    </div>
  )
}
