import { useState, useEffect, useCallback } from 'react'
import { TopBar } from './components/layout/TopBar'
import { Sidebar } from './components/layout/Sidebar'
import { CommandPalette } from './components/layout/CommandPalette'
import { InitScreen } from './pages/InitScreen'
import { CommandCenter } from './pages/CommandCenter'
import { TransactionExplorer } from './pages/TransactionExplorer'
import { FraudIntelligence } from './pages/FraudIntelligence'
import { GlobalFraudOrbit } from './pages/GlobalFraudOrbit'
import { FeatureLab } from './pages/FeatureLab'
import { BehaviorAnalytics, VelocityAnalytics } from './pages/BehaviorAnalytics'
import { NetworkGraph } from './pages/NetworkGraph'
import { MLModels } from './pages/MLModels'
import { RiskEngine } from './pages/RiskEngine'
import { ExplainableAI } from './pages/ExplainableAI'
import { ModelMonitor } from './pages/ModelMonitor'
import { ExperimentLab, DatasetManager, ResearchHub, SystemLogs, Settings } from './pages/OtherPages'

const pages: Record<string, React.ComponentType> = {
  command: CommandCenter,
  transactions: TransactionExplorer,
  'fraud-intel': FraudIntelligence,
  'fraud-orbit': GlobalFraudOrbit,
  'feature-lab': FeatureLab,
  behavior: BehaviorAnalytics,
  velocity: VelocityAnalytics,
  network: NetworkGraph,
  models: MLModels,
  'risk-engine': RiskEngine,
  xai: ExplainableAI,
  'model-monitor': ModelMonitor,
  experiments: ExperimentLab,
  datasets: DatasetManager,
  research: ResearchHub,
  logs: SystemLogs,
  settings: Settings,
}

export default function App() {
  const [initialized, setInitialized] = useState(false)
  const [activePage, setActivePage] = useState('command')
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      setCommandPaletteOpen(o => !o)
    }
    if (e.key === 'Escape') setCommandPaletteOpen(false)
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!initialized) {
    return <InitScreen onComplete={() => setInitialized(true)} />
  }

  const PageComponent = pages[activePage] ?? CommandCenter

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-space-950">
      <TopBar onCommandPalette={() => setCommandPaletteOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={activePage} onNavigate={setActivePage} />
        <main className="flex-1 overflow-hidden bg-space-950">
          <PageComponent />
        </main>
      </div>
      {commandPaletteOpen && (
        <CommandPalette
          onNavigate={setActivePage}
          onClose={() => setCommandPaletteOpen(false)}
        />
      )}
    </div>
  )
}
