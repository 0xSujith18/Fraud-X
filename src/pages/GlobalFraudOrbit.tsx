import { useState, useEffect } from 'react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip
} from 'recharts'
import {
  Globe, Play, Pause, SkipBack, SkipForward, ShieldAlert,
  Filter, Network, Zap
} from 'lucide-react'
import { Panel, ScoreBar } from '../components/shared'

// -------------------------------------------------------------------
// LOCATION & FLOW DEFINITIONS (1000 x 500 Equirectangular Projection)
// -------------------------------------------------------------------

interface LocationNode {
  id: string
  name: string
  country: string
  x: number // 0..1000
  y: number // 0..500
  textAnchor: 'start' | 'middle' | 'end'
  textDx: number
  textDy: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  txCount: number
  avgRisk: number
  newDevices: number
  newBeneficiaries: number
  behaviorDeviations: number
}

interface OrbitFlow {
  id: string
  from: string
  to: string
  label: string
  risk: number
  flowType: 'OBSERVED TRANSACTION FLOW' | 'INFERRED RISK RELATIONSHIP' | 'SYNTHETIC DEMO FLOW'
  volume: number
}

interface TrajectoryStep {
  step: string
  time: string
  timeOffset: string
  location: string
  device: string
  amount: number
  event: string
  deviation: string
  riskScore: number
  evidenceStrength: number
  signalType: string
  description: string
}

const mapLocations: LocationNode[] = [
  { id: 'IN', name: 'Mumbai / India Hub', country: 'India', x: 705, y: 195, textAnchor: 'start', textDx: 12, textDy: 14, riskLevel: 'LOW', txCount: 1420, avgRisk: 0.18, newDevices: 12, newBeneficiaries: 45, behaviorDeviations: 8 },
  { id: 'SG', name: 'Singapore Gateway', country: 'Singapore', x: 788, y: 246, textAnchor: 'start', textDx: 12, textDy: 4, riskLevel: 'MEDIUM', txCount: 840, avgRisk: 0.42, newDevices: 34, newBeneficiaries: 68, behaviorDeviations: 24 },
  { id: 'AE', name: 'Dubai / UAE Hub', country: 'UAE', x: 645, y: 185, textAnchor: 'end', textDx: -12, textDy: -6, riskLevel: 'CRITICAL', txCount: 620, avgRisk: 0.89, newDevices: 89, newBeneficiaries: 112, behaviorDeviations: 76 },
  { id: 'UK', name: 'London / UK Node', country: 'United Kingdom', x: 475, y: 105, textAnchor: 'end', textDx: -10, textDy: -8, riskLevel: 'MEDIUM', txCount: 510, avgRisk: 0.38, newDevices: 18, newBeneficiaries: 31, behaviorDeviations: 15 },
  { id: 'US', name: 'New York / US East', country: 'USA', x: 285, y: 140, textAnchor: 'end', textDx: -12, textDy: 4, riskLevel: 'HIGH', txCount: 930, avgRisk: 0.65, newDevices: 42, newBeneficiaries: 84, behaviorDeviations: 48 },
  { id: 'DE', name: 'Frankfurt / EU Central', country: 'Germany', x: 535, y: 100, textAnchor: 'start', textDx: 10, textDy: -8, riskLevel: 'LOW', txCount: 410, avgRisk: 0.15, newDevices: 5, newBeneficiaries: 19, behaviorDeviations: 4 },
]

const orbitFlows: OrbitFlow[] = [
  { id: 'F1', from: 'IN', to: 'SG', label: 'India → Singapore', risk: 0.45, flowType: 'OBSERVED TRANSACTION FLOW', volume: 420 },
  { id: 'F2', from: 'SG', to: 'AE', label: 'Singapore → UAE', risk: 0.88, flowType: 'INFERRED RISK RELATIONSHIP', volume: 180 },
  { id: 'F3', from: 'AE', to: 'UK', label: 'UAE → London', risk: 0.72, flowType: 'SYNTHETIC DEMO FLOW', volume: 95 },
  { id: 'F4', from: 'IN', to: 'UK', label: 'India → UK Direct', risk: 0.35, flowType: 'OBSERVED TRANSACTION FLOW', volume: 310 },
  { id: 'F5', from: 'UK', to: 'US', label: 'UK → New York', risk: 0.61, flowType: 'INFERRED RISK RELATIONSHIP', volume: 240 },
]

const trajectorySteps: TrajectoryStep[] = [
  { step: 'T-00', time: '09:19:10', timeOffset: '-47 min', location: 'India (Mumbai)', device: 'D-4812 (Known)', amount: 2430, event: 'Normal Activity Baseline', deviation: '0.0σ Baseline', riskScore: 0.12, evidenceStrength: 0.15, signalType: 'Behavior', description: 'Customer initiated baseline transaction from primary device.' },
  { step: 'T-01', time: '09:34:22', timeOffset: '-32 min', location: 'India → Singapore', device: 'D-9821 (NEW DEVICE)', amount: 4800, event: 'New Device Fingerprint', deviation: '+1.4σ Device Shift', riskScore: 0.38, evidenceStrength: 0.82, signalType: 'Device', description: 'Unrecognized device D-9821 introduced into account stream.' },
  { step: 'T-02', time: '09:51:05', timeOffset: '-15 min', location: 'Singapore', device: 'D-9821', amount: 12500, event: 'Location Deviation & Amount Spike', deviation: '+3.8σ Amount', riskScore: 0.64, evidenceStrength: 0.88, signalType: 'Location', description: 'Transaction location shifted to Singapore with amount 5.1× baseline.' },
  { step: 'T-03', time: '10:02:18', timeOffset: '-4 min', location: 'Singapore → UAE', device: 'D-9821', amount: 35000, event: 'First-time Beneficiary B-1928', deviation: 'New Beneficiary Node', riskScore: 0.79, evidenceStrength: 0.91, signalType: 'Beneficiary', description: 'Fund transfer requested to newly added external beneficiary.' },
  { step: 'T-04', time: '10:04:42', timeOffset: '-2 min', location: 'UAE (Dubai)', device: 'D-9821', amount: 58000, event: 'High Velocity Attack (8 tx / 5m)', deviation: '+8.2σ Velocity', riskScore: 0.88, evidenceStrength: 0.94, signalType: 'Velocity', description: 'Rapid sequential transfer attempts executed within 5 minutes.' },
  { step: 'T-05', time: '10:06:42', timeOffset: 'CRITICAL ALERT', location: 'UAE (Dubai)', device: 'D-9821', amount: 85000, event: 'High-Risk Fraud Signal (BLOCKED)', deviation: '+14.2σ Final Risk', riskScore: 0.94, evidenceStrength: 0.98, signalType: 'Risk Engine', description: 'Multi-factor risk threshold exceeded. Transaction auto-blocked.' },
]

const radarMetrics = [
  { dimension: 'Velocity', score: 94 },
  { dimension: 'Temporal', score: 91 },
  { dimension: 'Device', score: 88 },
  { dimension: 'Behavior', score: 82 },
  { dimension: 'Beneficiary', score: 79 },
  { dimension: 'Network', score: 71 },
  { dimension: 'Location', score: 64 },
]

export function GlobalFraudOrbit() {
  const [selectedNode, setSelectedNode] = useState<LocationNode | null>(mapLocations[2])
  const [selectedFlow, setSelectedFlow] = useState<OrbitFlow | null>(orbitFlows[1])
  const [activeStepIndex, setActiveStepIndex] = useState<number>(5)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [timeWindow, setTimeWindow] = useState<'15m' | '1h' | '6h' | '24h'>('1h')
  const [riskFilter, setRiskFilter] = useState<string>('ALL')
  const [behaviorMode, setBehaviorMode] = useState<'BEFORE' | 'AFTER'>('AFTER')
  const [investigationOpen, setInvestigationOpen] = useState<boolean>(false)
  const [investigationDecision, setInvestigationDecision] = useState<string | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStepIndex((prev) => (prev + 1) % trajectorySteps.length)
      }, 2000)
    }
    return () => clearInterval(timer)
  }, [isPlaying])

  const currentStep = trajectorySteps[activeStepIndex]

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 bg-space-950 text-slate-100">
      
      {/* HEADER & TOP CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-space-900 border border-cyber p-4 rounded-sm">
        <div>
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-cyber animate-pulse" />
            <h1 className="font-display text-base font-bold tracking-widest text-slate-100 uppercase">
              GLOBAL FRAUD ORBIT
            </h1>
            <span className="font-mono text-xs text-cyber bg-cyan-500/10 border border-cyber px-2 py-0.5 rounded-sm">
              GLOBAL FINANCIAL BEHAVIOR INTELLIGENCE
            </span>
          </div>
          <p className="font-mono text-xs text-slate-400 mt-1">
            Trace behavioral shifts, transaction flows, and connected risk evidence across time.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 rounded-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>GLOBAL STREAM ACTIVE</span>
          </div>
          <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/40 text-amber-400 rounded-sm">
            SYNTHETIC / DEMO DATA
          </div>
          <button
            onClick={() => setInvestigationOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/20 border border-cyan-500 text-cyber hover:bg-cyan-500/30 transition-all rounded-sm font-semibold cursor-pointer"
          >
            <ShieldAlert size={12} />
            <span>OPEN INVESTIGATION</span>
          </button>
        </div>
      </div>

      {/* MAP FILTERS & DATA DISCLOSURE */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-space-900 border border-cyber/50 p-2.5 rounded-sm font-mono text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter size={12} className="text-cyber" />
            <span>FILTERS:</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">TIME:</span>
            {(['15m', '1h', '6h', '24h'] as const).map((w) => (
              <button
                key={w}
                onClick={() => setTimeWindow(w)}
                className={`px-2 py-0.5 rounded-sm cursor-pointer transition-colors ${timeWindow === w ? 'bg-cyan-500/20 text-cyber border border-cyber' : 'text-slate-400 hover:bg-space-800'}`}
              >
                {w}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">RISK:</span>
            {['ALL', 'LOW', 'MEDIUM', 'CRITICAL'].map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-2 py-0.5 rounded-sm cursor-pointer transition-colors ${riskFilter === r ? 'bg-cyan-500/20 text-cyber border border-cyber' : 'text-slate-400 hover:bg-space-800'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-cyan-400 inline-block" /> OBSERVED FLOW</span>
          <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-amber-400 inline-block" /> INFERRED RISK</span>
          <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-red-400 inline-block" /> DEMO TRAJECTORY</span>
        </div>
      </div>

      {/* HERO WORLD MAP & SIDE PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* HERO REALISTIC HIGH-CONTRAST WORLD MAP */}
        <Panel title="GLOBAL TRANSACTION ORBIT MAP" subtitle="Spacecraft-Style Financial Telemetry Projection" className="lg:col-span-2 relative min-h-[460px]">
          <div className="relative w-full h-full min-h-[440px] bg-space-950 overflow-hidden flex items-center justify-center p-2 rounded-sm border border-cyber/30">
            
            <svg viewBox="0 0 1000 500" className="w-full h-full max-h-[440px] select-none">
              
              <defs>
                {/* Cyber Dot-Grid Matrix Pattern */}
                <pattern id="dot-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="#22D3EE" opacity="0.1" />
                </pattern>
                {/* Glow Filter for Coastlines */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Ocean Grid Background */}
              <rect width="1000" height="500" fill="#030712" />
              <rect width="1000" height="500" fill="url(#dot-grid)" />

              {/* Latitude and Longitude Telemetry Grid */}
              <g stroke="#22D3EE" strokeWidth="0.6" opacity="0.18" strokeDasharray="4 4">
                {[50, 100, 150, 200, 250, 300, 350, 400, 450].map((y) => (
                  <line key={`lat-${y}`} x1="0" y1={y} x2="1000" y2={y} />
                ))}
                {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((x) => (
                  <line key={`lon-${x}`} x1={x} y1="0" x2={x} y2="500" />
                ))}
                <line x1="0" y1="250" x2="1000" y2="250" stroke="#06B6D4" strokeWidth="1.2" opacity="0.4" /> {/* Equator */}
                <line x1="500" y1="0" x2="500" y2="500" stroke="#06B6D4" strokeWidth="1.2" opacity="0.4" /> {/* Prime Meridian */}
              </g>

              {/* HIGH-CONTRAST GLOWING WORLD CONTINENT VECTOR PATHS */}
              <g fill="#0D1929" stroke="#22D3EE" strokeWidth="1.4" strokeOpacity="0.65" filter="url(#glow)">
                
                {/* 1. North America */}
                <path d="M 50 70 L 100 65 L 140 45 L 200 35 L 270 30 L 330 45 L 375 70 L 385 90 L 350 95 L 320 85 L 295 100 L 305 125 L 285 145 L 250 150 L 230 170 L 215 200 L 195 215 L 180 195 L 175 165 L 160 145 L 120 155 L 90 135 L 50 100 Z" />
                
                {/* Greenland */}
                <path d="M 380 20 L 440 15 L 470 35 L 420 55 L 375 35 Z" />

                {/* 2. South America */}
                <path d="M 215 200 L 250 195 L 285 210 L 325 225 L 345 255 L 335 295 L 305 340 L 280 400 L 255 435 L 245 420 L 255 360 L 240 310 L 225 260 L 210 220 Z" />

                {/* 3. Europe */}
                <path d="M 445 85 L 485 70 L 535 65 L 575 80 L 565 110 L 540 130 L 515 135 L 495 150 L 470 145 L 455 130 L 475 105 Z" />
                
                {/* Scandinavia */}
                <path d="M 500 45 L 535 35 L 555 60 L 530 80 Z" />
                
                {/* British Isles (UK & Ireland) */}
                <path d="M 465 95 L 490 90 L 485 120 L 465 115 Z" />

                {/* 4. Africa */}
                <path d="M 455 145 L 495 150 L 535 145 L 590 170 L 615 205 L 600 245 L 565 285 L 540 345 L 505 375 L 490 345 L 480 285 L 445 235 L 425 195 L 445 165 Z" />
                
                {/* Madagascar */}
                <path d="M 615 305 L 630 300 L 620 360 L 605 355 Z" />

                {/* 5. Arabian Peninsula & Middle East */}
                <path d="M 590 160 L 635 155 L 670 180 L 655 220 L 610 215 L 590 180 Z" />

                {/* 6. Eurasia / Russia / China */}
                <path d="M 575 80 L 655 55 L 755 50 L 855 60 L 925 85 L 915 135 L 865 165 L 815 180 L 755 170 L 715 185 L 665 160 Z" />

                {/* 7. India Subcontinent */}
                <path d="M 665 160 L 715 185 L 740 225 L 720 275 L 690 245 L 675 195 Z" />
                
                {/* Sri Lanka */}
                <path d="M 720 280 L 730 280 L 725 295 L 715 290 Z" />

                {/* 8. Southeast Asia & Indochina */}
                <path d="M 755 170 L 805 180 L 820 220 L 790 255 L 765 215 Z" />

                {/* 9. Indonesia & Philippines */}
                <path d="M 775 260 L 835 280 L 855 290 L 795 275 Z" />
                <path d="M 815 240 L 850 240 L 845 270 L 815 265 Z" />
                <path d="M 860 195 L 875 200 L 865 235 L 855 225 Z" />

                {/* 10. Japan */}
                <path d="M 885 120 L 910 115 L 900 165 L 880 160 Z" />

                {/* 11. Australia & New Zealand */}
                <path d="M 815 315 L 895 305 L 940 345 L 915 405 L 855 420 L 805 380 L 815 345 Z" />
                <path d="M 955 395 L 970 415 L 955 455 L 945 425 Z" />

              </g>

              {/* Radar Sweep Circle & Line */}
              <circle cx="500" cy="250" r="220" fill="none" stroke="#22D3EE" strokeWidth="0.8" opacity="0.2" />
              <circle cx="500" cy="250" r="140" fill="none" stroke="#22D3EE" strokeWidth="0.6" opacity="0.15" />
              <line x1="500" y1="250" x2="680" y2="130" stroke="#22D3EE" strokeWidth="1.5" opacity="0.5" className="animate-spin origin-[500px_250px]" />

              {/* Animated Transaction Orbit Arcs */}
              {orbitFlows.map((flow) => {
                const source = mapLocations.find((l) => l.id === flow.from)
                const target = mapLocations.find((l) => l.id === flow.to)
                if (!source || !target) return null

                const strokeColor = flow.risk > 0.8 ? '#EF4444' : flow.risk > 0.5 ? '#FBBF24' : '#22D3EE'
                const midX = (source.x + target.x) / 2
                const midY = (source.y + target.y) / 2 - 45 // Arc height

                return (
                  <g key={flow.id} className="cursor-pointer" onClick={() => setSelectedFlow(flow)}>
                    <path
                      d={`M ${source.x} ${source.y} Q ${midX} ${midY} ${target.x} ${target.y}`}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={selectedFlow?.id === flow.id ? '3.5' : '2'}
                      strokeDasharray="6 4"
                      opacity={selectedFlow?.id === flow.id ? 0.95 : 0.75}
                    />
                    <circle cx={midX} cy={midY} r="4.5" fill={strokeColor} className="animate-ping" />
                  </g>
                )
              })}

              {/* Interactive Location Nodes with Non-Overlapping Offset Labels */}
              {mapLocations.map((loc) => {
                const isSelected = selectedNode?.id === loc.id
                const nodeColor = loc.riskLevel === 'CRITICAL' ? '#EF4444' : loc.riskLevel === 'HIGH' ? '#F97316' : loc.riskLevel === 'MEDIUM' ? '#FBBF24' : '#22D3EE'

                return (
                  <g key={loc.id} className="cursor-pointer" onClick={() => setSelectedNode(loc)}>
                    {/* Outer Pulsing Aura */}
                    <circle cx={loc.x} cy={loc.y} r={isSelected ? '16' : '10'} fill={nodeColor} opacity="0.3" className="animate-pulse" />
                    {/* Inner Core Node */}
                    <circle cx={loc.x} cy={loc.y} r={isSelected ? '8' : '5'} fill={nodeColor} stroke="#05070A" strokeWidth="2" />
                    
                    {/* Connection leader dot */}
                    <circle cx={loc.x + loc.textDx} cy={loc.y + loc.textDy - 3} r="1.5" fill="#38BDF8" opacity="0.6" />

                    {/* Node Text Label (NON-OVERLAPPING OFFSET) */}
                    <text
                      x={loc.x + loc.textDx}
                      y={loc.y + loc.textDy}
                      textAnchor={loc.textAnchor}
                      fill="#F8FAFC"
                      fontSize="11"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                      className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                    >
                      {loc.name.split('/')[0]}
                    </text>
                  </g>
                )
              })}

            </svg>

            <div className="absolute top-3 left-3 bg-space-900/90 border border-cyber/60 px-3 py-1.5 rounded-sm font-mono text-xs space-y-0.5 backdrop-blur-sm">
              <div className="text-slate-400">ACTIVE TRAJECTORY: <span className="text-cyber font-bold">CUSTOMER_4821</span></div>
              <div className="text-slate-500">CURRENT STEP: <span className="text-amber-400 font-bold">{currentStep.step} ({currentStep.timeOffset})</span></div>
              <div className="text-slate-500">EARLIEST SIGNAL: <span className="text-cyan-400">India → D-9821 (-47 min)</span></div>
            </div>

            <div className="absolute bottom-3 inset-x-4 bg-space-900/95 border border-cyber p-2.5 rounded-sm flex flex-wrap items-center justify-between gap-3 font-mono text-xs backdrop-blur-md">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1 px-3 py-1 bg-cyan-500/20 border border-cyber text-cyber rounded-sm hover:bg-cyan-500/30 cursor-pointer font-bold"
                >
                  {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                  <span>{isPlaying ? 'PAUSE' : 'TIME TRAVEL PLAY'}</span>
                </button>
                <button
                  onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                  className="p-1 bg-space-800 border border-cyber/50 text-slate-300 hover:text-cyber rounded-sm cursor-pointer"
                >
                  <SkipBack size={12} />
                </button>
                <button
                  onClick={() => setActiveStepIndex((prev) => Math.min(trajectorySteps.length - 1, prev + 1))}
                  className="p-1 bg-space-800 border border-cyber/50 text-slate-300 hover:text-cyber rounded-sm cursor-pointer"
                >
                  <SkipForward size={12} />
                </button>
              </div>

              <div className="flex items-center gap-1">
                {trajectorySteps.map((s, idx) => (
                  <button
                    key={s.step}
                    onClick={() => setActiveStepIndex(idx)}
                    className={`px-2 py-0.5 rounded-sm text-xs cursor-pointer transition-all ${activeStepIndex === idx ? 'bg-cyan-500 border border-cyan-400 text-space-950 font-bold' : 'bg-space-800 text-slate-400 border border-cyber/30 hover:bg-space-700'}`}
                  >
                    {s.step}
                  </button>
                ))}
              </div>

              <div className="text-slate-400">
                ACTIVE STEP: <span className="text-cyan-400 font-bold">{currentStep.event}</span>
              </div>
            </div>

          </div>
        </Panel>

        {/* LOCATION & FLOW INTELLIGENCE SIDE PANEL */}
        <div className="space-y-4">
          
          {selectedNode ? (
            <Panel title="LOCATION INTELLIGENCE" subtitle={selectedNode.name} badge="SYNTHETIC DEMO">
              <div className="p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-cyber/30 pb-2">
                  <span className="text-slate-500">REGION / COUNTRY</span>
                  <span className="text-slate-200 font-bold">{selectedNode.country}</span>
                </div>
                <div className="flex items-center justify-between border-b border-cyber/30 pb-2">
                  <span className="text-slate-500">TRANSACTION DENSITY</span>
                  <span className="text-cyber font-bold">{selectedNode.txCount.toLocaleString()} tx/h</span>
                </div>
                <div className="flex items-center justify-between border-b border-cyber/30 pb-2">
                  <span className="text-slate-500">AVERAGE RISK SCORE</span>
                  <span className={selectedNode.avgRisk > 0.6 ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>
                    {(selectedNode.avgRisk * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-cyber/30 pb-2">
                  <span className="text-slate-500">BEHAVIOR DEVIATIONS</span>
                  <span className="text-amber-400 font-bold">{selectedNode.behaviorDeviations} events</span>
                </div>
                <div className="flex items-center justify-between border-b border-cyber/30 pb-2">
                  <span className="text-slate-500">UNSEEN DEVICES</span>
                  <span className="text-slate-200">{selectedNode.newDevices} detected</span>
                </div>
                <div className="flex items-center justify-between border-b border-cyber/30 pb-2">
                  <span className="text-slate-500">NEW BENEFICIARIES</span>
                  <span className="text-slate-200">{selectedNode.newBeneficiaries} added</span>
                </div>
                <div className="bg-space-800 border border-cyber/40 rounded-sm p-2.5 text-slate-400 leading-relaxed">
                  <span className="text-cyber font-semibold">OBSERVATION:</span> Location reflects elevated behavioral deviation driven by new-device fingerprints & velocity spikes.
                </div>
              </div>
            </Panel>
          ) : null}

          <Panel title="GLOBAL RISK INDEX" subtitle="Aggregated Network Signals">
            <div className="p-4 flex flex-col items-center gap-3">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#22D3EE15" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke="#F59E0B" strokeWidth="8"
                    strokeDasharray={`${0.72 * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                  <span className="font-display text-2xl font-bold text-amber-400">72%</span>
                  <span className="text-[10px] text-slate-500">INDEX</span>
                </div>
              </div>

              <div className="w-full space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-400"><span>Behavior</span><span className="text-cyber font-bold">81%</span></div>
                <ScoreBar value={0.81} color="cyan" />
                <div className="flex justify-between text-slate-400"><span>Velocity</span><span className="text-amber-400 font-bold">76%</span></div>
                <ScoreBar value={0.76} color="amber" />
                <div className="flex justify-between text-slate-400"><span>Device</span><span className="text-amber-400 font-bold">68%</span></div>
                <ScoreBar value={0.68} color="amber" />
              </div>
            </div>
          </Panel>

        </div>
      </div>

      {/* PLOT TWIST: "THE RISK DID NOT START HERE" & BEHAVIORAL TRAJECTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        <div className="lg:col-span-2 bg-gradient-to-br from-space-900 via-space-900 to-cyan-950/40 border-2 border-cyan-500/50 rounded-sm p-4 space-y-3 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between border-b border-cyber/50 pb-2">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-400 animate-pulse" />
              <h2 className="font-display text-sm font-bold tracking-widest text-cyber uppercase">
                THE RISK DID NOT START HERE — THE SIGNAL BEFORE THE SIGNAL
              </h2>
            </div>
            <span className="font-mono text-xs text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-sm">
              RESEARCH SIGNATURE FEATURE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-space-800 border border-cyber/40 p-2.5 rounded-sm">
              <span className="text-slate-500 block">CURRENT LOCATION</span>
              <span className="text-red-400 font-bold text-sm">Dubai / UAE</span>
              <span className="text-slate-400 block mt-1">Alert: 10:06:42</span>
            </div>
            <div className="bg-space-800 border border-cyber/40 p-2.5 rounded-sm">
              <span className="text-slate-500 block">CURRENT RISK SCORE</span>
              <span className="text-red-400 font-bold text-sm">94% (CRITICAL)</span>
              <span className="text-slate-400 block mt-1">Blocked Transaction</span>
            </div>
            <div className="bg-space-800 border border-cyber/40 p-2.5 rounded-sm">
              <span className="text-slate-500 block">EARLIEST DETECTABLE SIGNAL</span>
              <span className="text-cyan-400 font-bold text-sm">India (Mumbai)</span>
              <span className="text-slate-400 block mt-1">T-01 (09:34:22)</span>
            </div>
            <div className="bg-space-800 border border-cyber/40 p-2.5 rounded-sm">
              <span className="text-slate-500 block">EARLY SIGNAL LEAD TIME</span>
              <span className="text-emerald-400 font-bold text-sm">47 MINUTES</span>
              <span className="text-slate-400 block mt-1">Before Alert Threshold</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="font-mono text-xs text-slate-400 flex items-center justify-between">
              <span>EVOLUTION OF BEHAVIORAL DEVIATION (CUSTOMER_4821):</span>
              <span className="text-cyber">LABEL: EARLIEST DETECTABLE SIGNAL (NOT "FRAUD STARTED HERE")</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 font-mono text-xs">
              {trajectorySteps.map((step, idx) => (
                <div
                  key={step.step}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`p-2.5 border rounded-sm cursor-pointer transition-all ${activeStepIndex === idx ? 'bg-cyan-500/20 border-cyan-400 text-slate-100 shadow-md' : 'bg-space-800 border-cyber/30 text-slate-400 hover:bg-space-700'}`}
                >
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>{step.step}</span>
                    <span className="text-cyan-400">{step.timeOffset}</span>
                  </div>
                  <div className="font-semibold text-slate-200 truncate">{step.event}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{step.location}</div>
                  <div className={`text-[10px] font-bold mt-1 ${step.riskScore > 0.8 ? 'text-red-400' : step.riskScore > 0.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    Risk: {(step.riskScore * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-space-800/80 border border-cyber/50 rounded-sm p-3 font-mono text-xs text-slate-300 flex items-start gap-2">
            <ShieldAlert size={14} className="text-cyber shrink-0 mt-0.5" />
            <div>
              <span className="text-cyber font-bold uppercase">RESEARCH INTERPRETATION: </span>
              "The final transaction at 10:06:42 received a high-risk classification (94%), but the earliest detectable behavioral anomaly occurred 47 minutes earlier (09:34:22) via new device registration D-9821. Temporal context provides predictive lead time before final fraud escalation."
            </div>
          </div>
        </div>

        {/* BEHAVIOR BEFORE VS BEHAVIOR AFTER CARD */}
        <Panel title="BEHAVIORAL COMPARISON" subtitle="Baseline Profile vs Current Anomaly Window">
          <div className="p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-cyber/40 pb-2">
              <span className="text-slate-400">METRIC</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setBehaviorMode('BEFORE')}
                  className={`px-2 py-0.5 rounded-sm cursor-pointer ${behaviorMode === 'BEFORE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500' : 'text-slate-500'}`}
                >
                  BEFORE
                </button>
                <button
                  onClick={() => setBehaviorMode('AFTER')}
                  className={`px-2 py-0.5 rounded-sm cursor-pointer ${behaviorMode === 'AFTER' ? 'bg-amber-500/20 text-amber-400 border border-amber-500' : 'text-slate-500'}`}
                >
                  AFTER
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center border-b border-cyber/20 pb-1.5">
              <span className="text-slate-500">Average Amount</span>
              <span className="text-slate-300">₹2,430</span>
              <span className="text-amber-400 font-bold">₹18,420 (7.5×)</span>
            </div>
            <div className="flex justify-between items-center border-b border-cyber/20 pb-1.5">
              <span className="text-slate-500">Transactions / Hour</span>
              <span className="text-slate-300">1.8 tx/h</span>
              <span className="text-amber-400 font-bold">7.4 tx/h (4.1×)</span>
            </div>
            <div className="flex justify-between items-center border-b border-cyber/20 pb-1.5">
              <span className="text-slate-500">Known Devices</span>
              <span className="text-slate-300">2 registered</span>
              <span className="text-red-400 font-bold">3 (Unseen D-9821)</span>
            </div>
            <div className="flex justify-between items-center border-b border-cyber/20 pb-1.5">
              <span className="text-slate-500">Known Beneficiaries</span>
              <span className="text-slate-300">8 historical</span>
              <span className="text-red-400 font-bold">10 (First-time B-1928)</span>
            </div>
            <div className="flex justify-between items-center border-b border-cyber/20 pb-1.5">
              <span className="text-slate-500">Location Variance</span>
              <span className="text-slate-300">Mumbai (Home)</span>
              <span className="text-amber-400 font-bold">Singapore / Dubai</span>
            </div>

            <div className="pt-2">
              <span className="text-slate-500 block mb-1">PROPOSED RESEARCH METRIC: EVIDENCE COVERAGE</span>
              <div className="flex items-center justify-between font-bold">
                <span className="text-cyan-400">5 / 6 Dimensions Supported</span>
                <span className="text-emerald-400">83.3% COVERAGE</span>
              </div>
              <ScoreBar value={0.833} color="cyan" />
            </div>
          </div>
        </Panel>

      </div>

      {/* EVIDENCE TRAIL & EARLY SIGNAL RADAR & NETWORK TRACE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <Panel title="GLOBAL EVIDENCE TRAIL" subtitle="Multi-Dimensional Signal Attributes">
          <div className="p-3 space-y-2 font-mono text-xs">
            {[
              { signal: 'LOCATION EVIDENCE', detail: 'New region detected (Singapore → UAE)', strength: 0.64, severity: 'MEDIUM' },
              { signal: 'DEVICE EVIDENCE', detail: 'Unseen device fingerprint D-9821', strength: 0.88, severity: 'HIGH' },
              { signal: 'TEMPORAL EVIDENCE', detail: 'Unusual 02:13 AM transaction window', strength: 0.91, severity: 'HIGH' },
              { signal: 'VELOCITY EVIDENCE', detail: '8 transactions within 5 minutes', strength: 0.94, severity: 'CRITICAL' },
              { signal: 'BENEFICIARY EVIDENCE', detail: 'First-time beneficiary node B-1928', strength: 0.79, severity: 'HIGH' },
              { signal: 'NETWORK EVIDENCE', detail: 'Device D-9821 shared across 4 accounts', strength: 0.71, severity: 'MEDIUM' },
            ].map((item) => (
              <div key={item.signal} className="p-2 bg-space-800 border border-cyber/30 rounded-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-cyber font-bold">{item.signal}</span>
                  <span className={item.severity === 'CRITICAL' ? 'text-red-400 font-bold' : 'text-amber-400'}>{item.severity}</span>
                </div>
                <div className="text-slate-300">{item.detail}</div>
                <div className="flex items-center justify-between text-slate-500 text-[10px]">
                  <span>Evidence Strength: {(item.strength * 100).toFixed(0)}%</span>
                  <span>Confidence: HIGH</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="EARLY SIGNAL RADAR" subtitle="Dimensional Anomaly Magnitude" badge="ILLUSTRATIVE DEMO">
          <div className="p-2 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarMetrics} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="#22D3EE22" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar name="Signal Magnitude" dataKey="score" stroke="#22D3EE" fill="#06B6D4" fillOpacity={0.4} />
                <Tooltip contentStyle={{ background: '#080B10', border: '1px solid #22D3EE33', fontFamily: 'JetBrains Mono', fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="font-mono text-[10px] text-slate-500 text-center mt-1">
              Evaluated across 7 independent behavioral dimensions.
            </div>
          </div>
        </Panel>

        <Panel title="RISK PROPAGATION INTELLIGENCE" subtitle="Shared Device & Beneficiary Topology">
          <div className="p-4 space-y-3 font-mono text-xs">
            <div className="bg-space-800 border border-cyber/40 p-3 rounded-sm text-center space-y-1">
              <div className="text-slate-500">ENTITY GRAPH TOPOLOGY</div>
              <div className="text-slate-200 font-bold tracking-widest text-xs">
                CUSTOMER-104 ── D-9821 ── BENEF-1928 ── ACC-92
              </div>
              <div className="text-amber-400 text-[11px] pt-1">POTENTIAL COORDINATED ACTIVITY DETECTED</div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between border-b border-cyber/20 pb-1">
                <span className="text-slate-500">CONNECTED ENTITIES</span>
                <span className="text-cyber font-bold">17 nodes</span>
              </div>
              <div className="flex justify-between border-b border-cyber/20 pb-1">
                <span className="text-slate-500">SHARED DEVICES</span>
                <span className="text-amber-400 font-bold">4 accounts share D-9821</span>
              </div>
              <div className="flex justify-between border-b border-cyber/20 pb-1">
                <span className="text-slate-500">SHARED BENEFICIARIES</span>
                <span className="text-amber-400 font-bold">6 transfers to B-1928</span>
              </div>
              <div className="flex justify-between border-b border-cyber/20 pb-1">
                <span className="text-slate-500">CLUSTER RISK LEVEL</span>
                <span className="text-red-400 font-bold">HIGH RISK CLUSTER</span>
              </div>
            </div>

            <button
              onClick={() => alert("Tracing network graph across 17 connected entity nodes...")}
              className="w-full py-2 bg-cyan-500/20 border border-cyan-500 text-cyber hover:bg-cyan-500/30 transition-all font-bold rounded-sm cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Network size={12} />
              <span>TRACE NETWORK GRAPH</span>
            </button>
          </div>
        </Panel>

      </div>

      {/* RESEARCH METRICS & SIGNATURE FOOTER */}
      <div className="bg-space-900 border border-cyber p-4 rounded-sm space-y-2 text-center font-mono text-xs">
        <div className="text-slate-400 uppercase tracking-widest text-xs font-bold">
          EARLY SIGNAL LEAD TIME RESEARCH EXPERIMENT
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-slate-300 py-1">
          <span>Median Lead Time: <strong className="text-cyan-400">42.0 min</strong></span>
          <span>Mean Lead Time: <strong className="text-cyan-400">45.3 min</strong></span>
          <span>P25 Lead Time: <strong className="text-slate-200">28.0 min</strong></span>
          <span>P75 Lead Time: <strong className="text-slate-200">58.0 min</strong></span>
          <span>False Alert Rate: <strong className="text-amber-400">1.8%</strong></span>
        </div>
        <div className="text-slate-500 pt-2 border-t border-cyber/40 max-w-3xl mx-auto italic">
          "Fraud detection should not only identify suspicious transactions. It should identify the behavioral changes that make a transaction suspicious."
        </div>
      </div>

      {/* HUMAN INVESTIGATION MODAL */}
      {investigationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-space-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-space-900 border-2 border-cyan-500 rounded-sm p-5 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-cyber pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-red-400" />
                <span className="font-display text-sm font-bold text-slate-100 tracking-wider">
                  HUMAN INVESTIGATION CASE #CASE-8A91F2
                </span>
              </div>
              <button onClick={() => setInvestigationOpen(false)} className="text-slate-500 hover:text-slate-200">✕</button>
            </div>

            <div className="space-y-2 text-slate-300 leading-relaxed bg-space-800 p-3 border border-cyber/40 rounded-sm">
              <div className="text-cyber font-bold">AUTOMATED EVIDENCE NARRATIVE:</div>
              <p className="text-slate-300">
                "At 09:19, the customer initiated activity from a previously unseen device. At 09:34, transaction velocity increased above historical baseline. At 09:51, a new beneficiary was introduced. At 10:06, the transaction received a high-risk classification (94%)."
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-400">
              <div>CUSTOMER ID: <span className="text-slate-200">C-4821</span></div>
              <div>TRANSACTION ID: <span className="text-cyan-400">TX-8A91F2</span></div>
              <div>AMOUNT: <span className="text-slate-200">₹85,000</span></div>
              <div>EARLIEST SIGNAL: <span className="text-emerald-400">India → D-9821 (-47m)</span></div>
            </div>

            <div className="space-y-2 pt-2 border-t border-cyber">
              <div className="text-slate-400">INVESTIGATOR DECISION:</div>
              <div className="flex gap-3">
                <button
                  onClick={() => setInvestigationDecision('CONFIRMED_FRAUD')}
                  className={`flex-1 py-2 rounded-sm font-bold cursor-pointer transition-all border ${investigationDecision === 'CONFIRMED_FRAUD' ? 'bg-red-500 text-white border-red-400' : 'bg-red-500/10 text-red-400 border-red-500/40 hover:bg-red-500/20'}`}
                >
                  CONFIRM FRAUD
                </button>
                <button
                  onClick={() => setInvestigationDecision('FALSE_POSITIVE')}
                  className={`flex-1 py-2 rounded-sm font-bold cursor-pointer transition-all border ${investigationDecision === 'FALSE_POSITIVE' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/20'}`}
                >
                  FALSE POSITIVE
                </button>
                <button
                  onClick={() => setInvestigationDecision('NEEDS_REVIEW')}
                  className={`flex-1 py-2 rounded-sm font-bold cursor-pointer transition-all border ${investigationDecision === 'NEEDS_REVIEW' ? 'bg-amber-500 text-white border-amber-400' : 'bg-amber-500/10 text-amber-400 border-amber-500/40 hover:bg-amber-500/20'}`}
                >
                  NEEDS REVIEW
                </button>
              </div>
            </div>

            {investigationDecision && (
              <div className="p-2.5 bg-space-800 border border-cyber text-center text-cyan-400 font-bold">
                DECISION RECORDED: {investigationDecision} — LOGGED TO SYSTEM AUDIT TRAIL
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInvestigationOpen(false)}
                className="px-4 py-1.5 bg-space-800 border border-cyber text-slate-300 hover:text-slate-100 rounded-sm cursor-pointer"
              >
                CLOSE INVESTIGATION
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
