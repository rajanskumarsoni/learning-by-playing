import { evaluateArchitecture, COMPONENT_CATALOG, CAMPAIGN_LEVELS } from '../backend/gameEngine.js';

const level5 = CAMPAIGN_LEVELS.find(l => l.id === 5);

// Let's test a well-tuned Level 5 architecture with CDN, WAF, LB, 3x Web Servers, etc.
const tunedArch = {
  nodes: [
    { id: 'src', type: 'SOURCE', config: {} },
    { id: 'waf-1', type: 'WAF', config: { mode: 0 } }, // $45
    { id: 'cdn-1', type: 'CDN', config: { hitRatio: 0 } }, // $55, terminates 65% of reads (3900 reads)
    { id: 'lb-1', type: 'LB', config: { algorithm: 1 } }, // $50
    { id: 'web-1', type: 'WEB', config: { tier: 1 } }, // $126, cap 6000
    { id: 'web-2', type: 'WEB', config: { tier: 1 } }, // $126, cap 6000
    { id: 'web-3', type: 'WEB', config: { tier: 1 } }, // $126, cap 6000 (total cap 18000)
    { id: 'cache-1', type: 'CACHE', config: { eviction: 1 } }, // $105, hit 88%
    { id: 'sql-1', type: 'SQL', config: { scaling: 1 } }, // $200, cap 4680
    { id: 'vec-1', type: 'VECTOR_AI', config: { batching: 1 } }, // $306, cap 11250
    { id: 'search-1', type: 'SEARCH', config: { shards: 1 } } // $153, 6 shards, cap 12500
  ],
  edges: [
    { id: 'e1', from: 'src', to: 'waf-1' },
    { id: 'e2', from: 'waf-1', to: 'cdn-1' },
    { id: 'e3', from: 'cdn-1', to: 'lb-1' },
    { id: 'e4', from: 'lb-1', to: 'web-1' },
    { id: 'e5', from: 'lb-1', to: 'web-2' },
    { id: 'e6', from: 'lb-1', to: 'web-3' },
    { id: 'e7', from: 'web-1', to: 'cache-1' },
    { id: 'e8', from: 'web-2', to: 'cache-1' },
    { id: 'e9', from: 'web-3', to: 'cache-1' },
    { id: 'e10', from: 'cache-1', to: 'sql-1' },
    { id: 'e11', from: 'web-1', to: 'vec-1' },
    { id: 'e12', from: 'web-2', to: 'vec-1' },
    { id: 'e13', from: 'web-3', to: 'vec-1' },
    { id: 'e14', from: 'web-1', to: 'search-1' },
    { id: 'e15', from: 'web-2', to: 'search-1' },
    { id: 'e16', from: 'web-3', to: 'search-1' }
  ]
};

const resNominal = evaluateArchitecture(tunedArch.nodes, tunedArch.edges, level5.targetRps, level5.trafficMix, level5.maxBudgetHr, level5.allowedComponents);
console.log('--- Nominal (No Crashes) ---');
console.log('Total Cost:', resNominal.totalHourlyCost, '(Budget:', level5.maxBudgetHr, ')');
console.log('Uptime:', resNominal.uptimePct, '%');
console.log('P99 Latency:', resNominal.p99Latency, 'ms');
console.log('Dropped RPS:', resNominal.droppedRps);
console.log('Diagnostics:', resNominal.diagnostics);

// When web-1 crashes:
const webCrashedNodes = tunedArch.nodes.map(n => n.id === 'web-1' ? { ...n, crashed: true } : n);
const resWebCrash = evaluateArchitecture(webCrashedNodes, tunedArch.edges, level5.targetRps, level5.trafficMix, level5.maxBudgetHr, level5.allowedComponents);
console.log('\n--- web-1 Crashes (Chaos Monkey hits Web Server) ---');
console.log('Total Cost:', resWebCrash.totalHourlyCost);
console.log('Uptime:', resWebCrash.uptimePct, '%');
console.log('P99 Latency:', resWebCrash.p99Latency, 'ms');
console.log('Dropped RPS:', resWebCrash.droppedRps);
console.log('Diagnostics:', resWebCrash.diagnostics);

