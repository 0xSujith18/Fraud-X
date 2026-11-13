import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

const commands = [
  { id: 'command', label: 'Command Center', shortcut: '/dashboard' },
  { id: 'transactions', label: 'Live Transactions', shortcut: '/transactions' },
  { id: 'fraud-intel', label: 'Fraud Intelligence', shortcut: '/fraud' },
  { id: 'fraud-orbit', label: 'Global Fraud Orbit', shortcut: '/orbit' },
  { id: 'feature-lab', label: 'Feature Lab', shortcut: '/features' },
  { id: 'behavior', label: 'Behavior Analytics', shortcut: '/behavior' },
  { id: 'network', label: 'Network Graph', shortcut: '/network' },
  { id: 'models', label: 'ML Models', shortcut: '/models' },
  { id: 'risk-engine', label: 'Risk Engine', shortcut: '/risk' },
  { id: 'xai', label: 'Explainable AI', shortcut: '/xai' },
  { id: 'model-monitor', label: 'Model Monitor', shortcut: '/monitor' },
  { id: 'experiments', label: 'Experiment Lab', shortcut: '/experiments' },
  { id: 'datasets', label: 'Datasets', shortcut: '/datasets' },
  { id: 'research', label: 'Research Hub', shortcut: '/research' },
  { id: 'logs', label: 'System Logs', shortcut: '/logs' },
]

interface CommandPaletteProps {
  onNavigate: (id: string) => void
  onClose: () => void
}

export function CommandPalette({ onNavigate, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.shortcut.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setHighlighted(0)
  }, [query])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    if (e.key === 'Enter' && filtered[highlighted]) { onNavigate(filtered[highlighted].id); onClose() }
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24" onClick={onClose}>
      <div className="w-full max-w-lg bg-space-800 border border-cyan-500/50 rounded-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-cyber">
          <Search size={14} className="text-cyber" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search commands..."
            className="flex-1 bg-transparent font-mono text-sm text-slate-200 placeholder-slate-600 outline-none"
          />
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={14} />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto py-1">
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => { onNavigate(cmd.id); onClose() }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${i === highlighted ? 'bg-cyan-500/10 text-cyber' : 'text-slate-400 hover:bg-space-700 hover:text-slate-200'}`}
            >
              <span className="font-mono text-sm">{cmd.label}</span>
              <span className="font-mono text-xs text-slate-600">{cmd.shortcut}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center font-mono text-xs text-slate-600">No commands found</div>
          )}
        </div>
        <div className="px-4 py-2 border-t border-cyber flex gap-4 font-mono text-xs text-slate-600">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  )
}
