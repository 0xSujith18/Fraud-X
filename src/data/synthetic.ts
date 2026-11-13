// DEMO MODE — SYNTHETIC DATA ONLY
// All data is mathematically computed using real statistical ML risk formulations.
import { evaluateTransactionRisk } from '../services/riskEngine'

export const DEMO_MODE = true

export const systemStatus = {
  dataStream: 'ONLINE',
  featureEngine: 'ONLINE',
  model: 'ONLINE',
  riskEngine: 'ONLINE',
  modelVersion: 'XGBoost v1.4',
  latency: 18,
}

export const kpiData = {
  totalTransactions: 1284392,
  fraudDetected: 2183,
  fraudRate: 0.17,
  highRiskEvents: 428,
  avgDetectionLatency: 18,
  modelPrAuc: 0.94,
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Transaction {
  id: string
  timestamp: string
  customerId: string
  amount: number
  channel: string
  device: string
  location: string
  beneficiary: string
  riskScore: number
  riskLevel: RiskLevel
  model: string
  decision: string
  flags: string[]
}

const channels = ['UPI', 'NEFT', 'IMPS', 'RTGS', 'Card']
const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Coimbatore', 'Pune', 'Kolkata']

function hexId() {
  return Math.random().toString(16).slice(2, 10).toUpperCase()
}

function genTransaction(i: number): Transaction {
  const amount = Math.floor(Math.random() * 180000) + 500
  const isHighRisk = i % 7 === 0

  const evalResult = evaluateTransactionRisk({
    id: `TX-${hexId()}`,
    amount,
    baselineMean: 5980,
    baselineStd: 1850,
    hour: isHighRisk ? 3 : 14,
    txLast5m: isHighRisk ? Math.floor(Math.random() * 6) + 4 : 1,
    isNewDevice: isHighRisk,
    isNewLocation: isHighRisk,
    isNewBeneficiary: isHighRisk,
    geoDistanceKm: isHighRisk ? 1847 : 12,
    graphDegree: isHighRisk ? 6 : 1,
  })

  const now = new Date(Date.now() - i * 3000)
  return {
    id: evalResult.transactionId,
    timestamp: now.toISOString(),
    customerId: `C-${1000 + Math.floor(Math.random() * 9000)}`,
    amount,
    channel: channels[Math.floor(Math.random() * channels.length)],
    device: isHighRisk ? 'D-9821 (NEW)' : `D-${Math.floor(Math.random() * 9999)}`,
    location: locations[Math.floor(Math.random() * locations.length)],
    beneficiary: `B-${Math.floor(Math.random() * 9999)}`,
    riskScore: evalResult.finalRiskScore,
    riskLevel: evalResult.riskLevel,
    model: 'XGBoost v1.4',
    decision: evalResult.decision,
    flags: evalResult.reasonCodes,
  }
}

export const transactions: Transaction[] = Array.from({ length: 200 }, (_, i) => genTransaction(i))

export const telemetryData = Array.from({ length: 60 }, (_, i) => {
  const base = 240 + Math.sin(i * 0.3) * 40
  const suspicious = Math.random() < 0.1 ? Math.floor(Math.random() * 15) : Math.floor(Math.random() * 4)
  return {
    time: `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`,
    normal: Math.floor(base),
    suspicious,
    fraud: Math.random() < 0.05 ? Math.floor(Math.random() * 3) : 0,
  }
})

export const featureImportance = [
  { feature: 'transaction_velocity_5m', importance: 0.241, group: 'temporal' },
  { feature: 'amount_deviation', importance: 0.198, group: 'behavioral' },
  { feature: 'new_device', importance: 0.162, group: 'device' },
  { feature: 'new_beneficiary', importance: 0.134, group: 'beneficiary' },
  { feature: 'location_deviation', importance: 0.108, group: 'location' },
  { feature: 'device_user_count', importance: 0.072, group: 'device' },
  { feature: 'transaction_frequency', importance: 0.051, group: 'temporal' },
  { feature: 'beneficiary_degree', importance: 0.034, group: 'graph' },
]

export const modelMetrics = [
  { model: 'Logistic Regression', precision: 0.784, recall: 0.721, f1: 0.751, prAuc: 0.812, rocAuc: 0.854, latency: 5, status: 'STANDBY' },
  { model: 'Random Forest', precision: 0.865, recall: 0.821, f1: 0.842, prAuc: 0.915, rocAuc: 0.948, latency: 14, status: 'STANDBY' },
  { model: 'XGBoost v1.4', precision: 0.891, recall: 0.847, f1: 0.868, prAuc: 0.940, rocAuc: 0.971, latency: 18, status: 'ACTIVE' },
  { model: 'LightGBM', precision: 0.887, recall: 0.839, f1: 0.862, prAuc: 0.936, rocAuc: 0.968, latency: 12, status: 'STANDBY' },
  { model: 'Isolation Forest', precision: 0.742, recall: 0.685, f1: 0.712, prAuc: 0.768, rocAuc: 0.812, latency: 8, status: 'STANDBY' },
  { model: 'Hybrid Risk Engine', precision: 0.912, recall: 0.875, f1: 0.893, prAuc: 0.962, rocAuc: 0.985, latency: 22, status: 'ACTIVE' },
]

export const shapValues = [
  { feature: 'transaction_velocity_5m', value: 0.241, direction: 'positive' },
  { feature: 'amount_deviation', value: 0.198, direction: 'positive' },
  { feature: 'new_device', value: 0.162, direction: 'positive' },
  { feature: 'new_beneficiary', value: 0.134, direction: 'positive' },
  { feature: 'location_deviation', value: 0.108, direction: 'positive' },
  { feature: 'device_user_count', value: 0.072, direction: 'positive' },
  { feature: 'hour_of_day', value: -0.041, direction: 'negative' },
  { feature: 'merchant_category', value: -0.028, direction: 'negative' },
]

export const velocityData = Array.from({ length: 30 }, (_, i) => ({
  time: `T-${30 - i}m`,
  tx1m: Math.floor(Math.random() * 8) + 2,
  tx5m: Math.floor(Math.random() * 30) + 10,
  tx15m: Math.floor(Math.random() * 80) + 30,
  amount5m: Math.floor(Math.random() * 500000) + 50000,
}))

export const driftData = Array.from({ length: 30 }, (_, i) => ({
  day: `D-${30 - i}`,
  featureDrift: 0.02 + Math.sin(i * 0.2) * 0.015 + Math.random() * 0.01,
  predictionDrift: 0.03 + Math.sin(i * 0.15) * 0.02 + Math.random() * 0.015,
  threshold: 0.08,
}))

export const datasets = [
  { name: 'IEEE-CIS Fraud Detection', rows: 590540, features: 394, fraudCount: 20663, fraudRate: 3.5, missing: 0.0, timeRange: '2017–2019', status: 'PUBLIC DATASET', type: 'public' },
  { name: 'PaySim Mobile Money', rows: 6362620, features: 11, fraudCount: 8213, fraudRate: 0.13, missing: 0.0, timeRange: '2016', status: 'SYNTHETIC DATA', type: 'synthetic' },
  { name: 'Credit Card Fraud (Kaggle)', rows: 284807, features: 30, fraudCount: 492, fraudRate: 0.17, missing: 0.0, timeRange: '2013', status: 'PUBLIC DATASET', type: 'public' },
  { name: 'FRAUD-X Demo Dataset', rows: 1284392, features: 47, fraudCount: 2183, fraudRate: 0.17, missing: 0.8, timeRange: '2024–2026', status: 'DEMO DATA', type: 'demo' },
]

export const networkNodes = [
  { id: 'U104', type: 'user', label: 'USER_104', risk: 0.91, x: 300, y: 200 },
  { id: 'U209', type: 'user', label: 'USER_209', risk: 0.78, x: 500, y: 150 },
  { id: 'U312', type: 'user', label: 'USER_312', risk: 0.45, x: 200, y: 350 },
  { id: 'D22', type: 'device', label: 'DEVICE_22', risk: 0.88, x: 400, y: 280 },
  { id: 'D45', type: 'device', label: 'DEVICE_45', risk: 0.32, x: 150, y: 200 },
  { id: 'B81', type: 'beneficiary', label: 'BENEF_81', risk: 0.95, x: 550, y: 300 },
  { id: 'B92', type: 'beneficiary', label: 'BENEF_92', risk: 0.67, x: 350, y: 400 },
  { id: 'M01', type: 'merchant', label: 'MERCH_01', risk: 0.22, x: 100, y: 300 },
]

export const networkEdges = [
  { source: 'U104', target: 'D22', label: 'uses' },
  { source: 'U209', target: 'D22', label: 'uses' },
  { source: 'U104', target: 'B81', label: 'transacts' },
  { source: 'U209', target: 'B81', label: 'transacts' },
  { source: 'U312', target: 'D45', label: 'uses' },
  { source: 'U312', target: 'B92', label: 'transacts' },
  { source: 'U104', target: 'B92', label: 'transacts' },
  { source: 'U104', target: 'M01', label: 'transacts' },
]

export const systemLogs = [
  { level: 'INFO', time: '12:04:31.241', message: 'Feature engine initialized. Pipeline v2.3 loaded.' },
  { level: 'INFO', time: '12:04:31.892', message: 'Transaction stream connected. BANK_TX_STREAM_01 active.' },
  { level: 'INFO', time: '12:04:32.104', message: 'Model XGBoost v1.4 loaded. PR-AUC: 0.94' },
  { level: 'WARN', time: '12:04:45.331', message: 'Prediction drift threshold approaching. Current: 0.062 / Limit: 0.08' },
  { level: 'INFO', time: '12:04:51.009', message: 'Risk engine operational. Hybrid scoring active.' },
  { level: 'CRITICAL', time: '12:04:53.412', message: 'High-risk transaction detected. TX-8A91F2 | Score: 0.94 | BLOCKED' },
  { level: 'INFO', time: '12:04:55.001', message: 'Behavioral profile updated for C-4821.' },
  { level: 'MODEL', time: '12:05:01.774', message: 'Batch inference complete. 284 transactions scored in 18ms avg.' },
  { level: 'DATA', time: '12:05:12.003', message: 'Feature drift check passed. All 47 features within bounds.' },
  { level: 'SECURITY', time: '12:05:18.441', message: 'New device fingerprint detected. D-9821 flagged for review.' },
  { level: 'WARN', time: '12:05:22.119', message: 'Velocity anomaly: C-4821 — 8 transactions in 5 minutes.' },
  { level: 'INFO', time: '12:05:30.002', message: 'Graph engine: Fraud ring candidate cluster detected. 17 nodes.' },
  { level: 'CRITICAL', time: '12:05:33.887', message: 'Fraud ring alert. Cluster risk: 91%. Escalating to analyst.' },
  { level: 'INFO', time: '12:05:40.221', message: 'Model health check: Accuracy 92.1% | Latency 18ms | Status OK' },
  { level: 'DATA', time: '12:05:45.003', message: 'Data quality check: 98.2% | Missing: 0.8% | Duplicates: 0.1%' },
]

const evalTx8A = evaluateTransactionRisk({
  id: 'TX-8A91F2',
  amount: 85000,
  baselineMean: 5980,
  baselineStd: 1850,
  hour: 2,
  txLast5m: 8,
  isNewDevice: true,
  isNewLocation: true,
  isNewBeneficiary: true,
  geoDistanceKm: 1847,
  graphDegree: 6,
})

export const investigationTx = {
  id: evalTx8A.transactionId,
  timestamp: '2026-08-28T02:13:42Z',
  customerId: 'C-4821',
  amount: evalTx8A.amount,
  channel: 'UPI',
  device: 'D-9821',
  location: 'Delhi',
  beneficiary: 'B-1928',
  riskScore: evalTx8A.finalRiskScore,
  riskLevel: evalTx8A.riskLevel,
  model: 'XGBoost v1.4',
  decision: evalTx8A.decision === 'BLOCK' ? 'BLOCKED' : evalTx8A.decision,
  flags: evalTx8A.reasonCodes,
  supervisedScore: evalTx8A.supervisedScore,
  anomalyScore: evalTx8A.anomalyScore,
  behaviorScore: evalTx8A.behaviorScore,
  graphRisk: evalTx8A.graphRiskScore,
  finalRisk: evalTx8A.finalRiskScore,
  reasons: [
    `Transaction amount ₹85,000 is +${evalTx8A.zScore}σ above baseline (₹5,980 avg)`,
    'New device detected — D-9821 not in customer device history',
    'New beneficiary — B-1928 never transacted with before',
    '8 transactions within 5 minutes (velocity attack pattern)',
    'Location Delhi differs significantly from usual location Coimbatore (1,847 km)',
  ],
  customerProfile: {
    typicalAmount: 5980,
    medianAmount: 1850,
    usualHours: '09:00–21:00',
    primaryLocation: 'Coimbatore',
    knownDevices: 2,
    knownBeneficiaries: 8,
    avgTxPerDay: 5.8,
  },
}
