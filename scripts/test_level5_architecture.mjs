import { evaluateArchitecture, COMPONENT_CATALOG, CAMPAIGN_LEVELS } from '../backend/gameEngine.js';

const level5 = CAMPAIGN_LEVELS.find(l => l.id === 5);
console.log('Level 5 specs:', {
  targetRps: level5.targetRps,
  trafficMix: level5.trafficMix,
  maxBudgetHr: level5.maxBudgetHr,
  maxLatencyMs: level5.maxLatencyMs,
  minUptimePct: level5.minUptimePct
});

// Let's design a solid Level 5 architecture:
// Ingress -> WAF (blocks 98% bots) -> LB -> 3x WEB (c6i.xlarge, cap 6000 each = 18000 cap; or c6i.4xlarge cap 12000 each)
// Downstream from WEB:
// -> Redis CACHE (absorbs reads) -> SQL (Sharded Cluster, cap 9900)
// -> Vector AI (TensorRT + FP8, cap 4500 * 2.5 = 11250)
// -> Elasticsearch (Index Sharding 6 shards, cap 5000 * 2.5 = 12500)
// -> Kafka Queue (buffer writes) -> Worker -> SQL

const baseArch = {
  nodes: [
    { id: 'src', type: 'SOURCE', config: {} },
    { id: 'waf-1', type: 'WAF', config: { mode: 0 } }, // cost: 45
    { id: 'lb-1', type: 'LB', config: { algorithm: 1 } }, // cost: 45 * 1.1 = 50
    { id: 'web-1', type: 'WEB', config: { tier: 2 } }, // c6i.4xlarge: cost 240, cap 12000
    { id: 'web-2', type: 'WEB', config: { tier: 2 } }, // c6i.4xlarge: cost 240, cap 12000
    { id: 'cache-1', type: 'CACHE', config: { eviction: 1 } }, // Semantic+LRU: cost 105, hit 88%
    { id: 'sql-1', type: 'SQL', config: { scaling: 1 } }, // +2 Read Replicas: cost 200, cap 4680
    { id: 'vec-1', type: 'VECTOR_AI', config: { batching: 1 } }, // TensorRT: cost 175*1.75 = 306, cap 11250
    { id: 'search-1', type: 'SEARCH', config: { shards: 0 } } // 2 shards: cost 85, cap 5000
  ],
  edges: [
    { id: 'e1', from: 'src', to: 'waf-1' },
    { id: 'e2', from: 'waf-1', to: 'lb-1' },
    { id: 'e3', from: 'lb-1', to: 'web-1' },
    { id: 'e4', from: 'lb-1', to: 'web-2' },
    { id: 'e5', from: 'web-1', to: 'cache-1' },
    { id: 'e6', from: 'web-2', to: 'cache-1' },
    { id: 'e7', from: 'cache-1', to: 'sql-1' },
    { id: 'e8', from: 'web-1', to: 'vec-1' },
    { id: 'e9', from: 'web-2', to: 'vec-1' },
    { id: 'e10', from: 'web-1', to: 'search-1' },
    { id: 'e11', from: 'web-2', to: 'search-1' }
  ]
};

const resNominal = evaluateArchitecture(baseArch.nodes, baseArch.edges, level5.targetRps, level5.trafficMix, level5.maxBudgetHr, level5.allowedComponents);
console.log('\n--- Nominal State (No Crashes) ---');
console.log('Total Cost:', resNominal.totalHourlyCost, '(Budget:', level5.maxBudgetHr, ')');
console.log('Uptime:', resNominal.uptimePct, '%');
console.log('P99 Latency:', resNominal.p99Latency, 'ms');
console.log('Dropped RPS:', resNominal.droppedRps);
console.log('Diagnostics:', resNominal.diagnostics);

// Scenario A: web-1 crashes (Chaos Monkey strikes web-1)
const webCrashedNodes = baseArch.nodes.map(n => n.id === 'web-1' ? { ...n, crashed: true } : n);
const resWebCrash = evaluateArchitecture(webCrashedNodes, baseArch.edges, level5.targetRps, level5.trafficMix, level5.maxBudgetHr, level5.allowedComponents);
console.log('\n--- Scenario A: web-1 Crashes (Chaos Monkey hits Web Server) ---');
console.log('Total Cost:', resWebCrash.totalHourlyCost);
console.log('Uptime:', resWebCrash.uptimePct, '%');
console.log('P99 Latency:', resWebCrash.p99Latency, 'ms');
console.log('Dropped RPS:', resWebCrash.droppedRps);
console.log('Diagnostics:', resWebCrash.diagnostics);

// Scenario B: sql-1 crashes (Chaos Monkey strikes SQL)
const sqlCrashedNodes = baseArch.nodes.map(n => n.id === 'sql-1' ? { ...n, crashed: true } : n);
const resSqlCrash = evaluateArchitecture(sqlCrashedNodes, baseArch.edges, level5.targetRps, level5.trafficMix, level5.maxBudgetHr, level5.allowedComponents);
console.log('\n--- Scenario B: sql-1 Crashes (Chaos Monkey hits Database) ---');
console.log('Total Cost:', resSqlCrash.totalHourlyCost);
console.log('Uptime:', resSqlCrash.uptimePct, '%');
console.log('P99 Latency:', resSqlCrash.p99Latency, 'ms');
console.log('Dropped RPS:', resSqlCrash.droppedRps);
console.log('Diagnostics:', resSqlCrash.diagnostics);

// Scenario C: waf-1 crashes
const wafCrashedNodes = baseArch.nodes.map(n => n.id === 'waf-1' ? { ...n, crashed: true } : n);
const resWafCrash = evaluateArchitecture(wafCrashedNodes, baseArch.edges, level5.targetRps, level5.trafficMix, level5.maxBudgetHr, level5.allowedComponents);
console.log('\n--- Scenario C: waf-1 Crashes (Chaos Monkey hits WAF) ---');
console.log('Total Cost:', resWafCrash.totalHourlyCost);
console.log('Uptime:', resWafCrash.uptimePct, '%');
console.log('Dropped RPS:', resWafCrash.droppedRps);

