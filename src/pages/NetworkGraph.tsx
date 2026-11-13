import { useState, useEffect } from 'react'
import { fetchNetwork } from '../services/api'
import { DemoTag, SectionHeader } from '../components/shared'

type NetworkNode = { id: string; type: string; label: string; risk: number; x: number; y: number }
type NetworkEdge = { source: string; target: string; label: string }

const nodeColors: Record<string, string> = {
  user: '#22D3EE', device: '#A78BFA', beneficiary: '#F87171', merchant: '#34D399',
}

export function NetworkGraph() {
  const [nodes, setNodes] = useState<NetworkNode[]>([])
  const [edges, setEdges] = useState<NetworkEdge[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    fetchNetwork().then(data => {
      const d = data as { nodes: NetworkNode[]; edges: NetworkEdge[] }
      setNodes(d.nodes)
      setEdges(d.edges)
    })
  }, [])

  const selectedNode   = nodes.find(n => n.id === selected)
  const connectedEdges = edges.filter(e => e.source === selected || e.target === selected)
  const connectedIds   = new Set(connectedEdges.flatMap(e => [e.source, e.target]))

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b border-cyber flex items-center justify-between">
        <SectionHeader title="Fraud Network Intelligence" subtitle="Transaction network topology — risk scores computed live by ML model" />
        <DemoTag />
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative bg-space-950 overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <svg className="w-full h-full" viewBox="0 0 700 500">
            {edges.map((edge, i) => {
              const src = nodes.find(n => n.id === edge.source)
              const tgt = nodes.find(n => n.id === edge.target)
              if (!src || !tgt) return null
              const isHighlighted = selected ? (edge.source === selected || edge.target === selected) : false
              return (
                <g key={i}>
                  <line x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                    stroke={isHighlighted ? '#22D3EE' : '#22D3EE22'}
                    strokeWidth={isHighlighted ? 1.5 : 0.5}
                    strokeDasharray={isHighlighted ? undefined : '4 4'}
                  />
                  {isHighlighted && (
                    <text x={(src.x + tgt.x) / 2} y={(src.y + tgt.y) / 2 - 4}
                      fill="#22D3EE88" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">
                      {edge.label}
                    </text>
                  )}
                </g>
              )
            })}

            {nodes.map(node => {
              const color      = nodeColors[node.type]
              const isSelected = node.id === selected
              const isConn     = connectedIds.has(node.id)
              const opacity    = selected ? (isSelected || isConn ? 1 : 0.3) : 1
              return (
                <g key={node.id} onClick={() => setSelected(node.id === selected ? null : node.id)}
                  style={{ cursor: 'pointer', opacity }}>
                  {isSelected && <circle cx={node.x} cy={node.y} r={22} fill="none" stroke={color} strokeWidth={0.5} opacity={0.4} />}
                  <circle cx={node.x} cy={node.y} r={14} fill={`${color}15`} stroke={color} strokeWidth={isSelected ? 2 : 1} />
                  {node.risk > 0.7 && (
                    <circle cx={node.x} cy={node.y} r={14} fill="none" stroke={color} strokeWidth={0.5} opacity={0.4}>
                      <animate attributeName="r" values="14;20;14" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <text x={node.x} y={node.y + 4} textAnchor="middle" fill={color} fontSize="8" fontFamily="JetBrains Mono" fontWeight="bold">
                    {node.type === 'user' ? 'U' : node.type === 'device' ? 'D' : node.type === 'beneficiary' ? 'B' : 'M'}
                  </text>
                  <text x={node.x} y={node.y + 26} textAnchor="middle" fill="#94A3B8" fontSize="7" fontFamily="JetBrains Mono">
                    {node.label.split('_')[1]}
                  </text>
                  {node.risk > 0.7 && <circle cx={node.x + 10} cy={node.y - 10} r={4} fill="#EF4444" />}
                </g>
              )
            })}
          </svg>

          <div className="absolute bottom-4 left-4 flex gap-3 font-mono text-xs">
            {Object.entries(nodeColors).map(([type, color]) => (
              <span key={type} className="flex items-center gap-1" style={{ color }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
                {type}
              </span>
            ))}
          </div>
        </div>

        <div className="w-64 border-l border-cyber overflow-y-auto">
          <div className="p-3 border-b border-cyber">
            <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">Network Intelligence</span>
          </div>

          {selectedNode ? (
            <div className="p-3 space-y-3">
              <div className="font-mono text-xs space-y-1.5">
                {[
                  ['Node', selectedNode.label],
                  ['Type', selectedNode.type.toUpperCase()],
                  ['Risk Score (Live)', selectedNode.risk.toFixed(3)],
                  ['Connections', String(connectedEdges.length)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-slate-500">{k}</span>
                    <span className={k === 'Risk Score (Live)' ? (selectedNode.risk > 0.7 ? 'text-red-400' : 'text-emerald-400') : 'text-slate-200'}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <span className="font-mono text-xs text-slate-500">Connected to:</span>
                {connectedEdges.map((e, i) => {
                  const otherId = e.source === selected ? e.target : e.source
                  const other   = nodes.find(n => n.id === otherId)
                  if (!other) return null
                  return (
                    <div key={i} className="font-mono text-xs flex justify-between">
                      <span className="text-slate-400">{other.label}</span>
                      <span className="text-slate-600">{e.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              <div className="font-mono text-xs space-y-2">
                {[['Connected Accounts', '17'], ['Shared Devices', '4'], ['Shared Beneficiaries', '6'], ['Cluster Risk', '91%']].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-cyber/20 pb-1.5">
                    <span className="text-slate-500">{k}</span>
                    <span className={k === 'Cluster Risk' ? 'text-red-400 font-bold' : 'text-slate-200'}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="bg-red-400/10 border border-red-400/30 rounded-sm p-2">
                <div className="font-mono text-xs text-red-400 font-bold">FRAUD RING: DETECTED</div>
                <div className="font-mono text-xs text-slate-400 mt-1">Suspicious cluster identified. Click nodes to investigate.</div>
              </div>
              <div className="font-mono text-xs text-slate-600">Click a node to inspect connections.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
