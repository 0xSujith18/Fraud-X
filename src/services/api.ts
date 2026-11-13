/**
 * FRAUD-X API Service
 * Fetches from FastAPI backend. Falls back to synthetic data if backend is offline.
 */
import {
  kpiData, telemetryData, transactions, systemLogs,
  modelMetrics, featureImportance, driftData, networkNodes, networkEdges,
} from '../data/synthetic'

const BASE = 'http://localhost:8000'

async function get<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return fallback
    return (await res.json()) as T
  } catch {
    return fallback
  }
}

export async function fetchKpi() {
  return get('/api/kpi', kpiData)
}

export async function fetchSystemStatus() {
  return get('/api/system/status', {
    status: 'ONLINE', dataStream: 'ONLINE', featureEngine: 'ONLINE',
    model: 'ONLINE', riskEngine: 'ONLINE', modelVersion: 'XGBoost v1.4', latency: 18,
  })
}

export async function fetchStreamTransactions(count = 1) {
  return get(`/api/stream/transactions?count=${count}`, transactions.slice(0, count))
}

export async function fetchTelemetry() {
  return get('/api/telemetry', telemetryData)
}

export async function fetchLogs(limit = 20) {
  return get(`/api/system/logs?limit=${limit}`, systemLogs)
}

export async function fetchModelMetrics() {
  return get('/api/models/metrics', modelMetrics)
}

export async function fetchFeatureImportance() {
  return get('/api/feature-importance', featureImportance)
}

export async function fetchDrift() {
  return get('/api/drift', driftData)
}

export async function fetchNetwork() {
  return get('/api/network', { nodes: networkNodes, edges: networkEdges })
}
