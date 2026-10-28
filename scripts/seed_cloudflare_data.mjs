import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 1. Initial Leaderboards dataset
const leaderboards = {
  daily: [
    { rank: 1, name: 'Jeff Dean', score: 9940, p99: '18ms', sla: '99.99%', role: 'Fellow Architect', date: new Date().toISOString() },
    { rank: 2, name: 'Werner Vogels', score: 9810, p99: '24ms', sla: '99.98%', role: 'Principal SRE', date: new Date().toISOString() },
    { rank: 3, name: 'Brendan Burns', score: 9750, p99: '31ms', sla: '99.95%', role: 'K8s Guardian', date: new Date().toISOString() },
    { rank: 4, name: 'Kelsey Hightower', score: 9680, p99: '35ms', sla: '99.92%', role: 'NoCode Sage', date: new Date().toISOString() },
    { rank: 5, name: 'Ada (Staff Mentor)', score: 9550, p99: '42ms', sla: '99.90%', role: 'Architect Mentor', date: new Date().toISOString() }
  ],
  survival: [
    { rank: 1, name: 'Jeff Dean', wave: 18, nodes: 42, score: 34200, role: 'Fellow Architect' },
    { rank: 2, name: 'Werner Vogels', wave: 15, nodes: 36, score: 28500, role: 'Principal SRE' },
    { rank: 3, name: 'Brendan Burns', wave: 12, nodes: 29, score: 22100, role: 'K8s Guardian' },
    { rank: 4, name: 'Kelsey Hightower', wave: 11, nodes: 25, score: 19800, role: 'NoCode Sage' },
    { rank: 5, name: 'Ada (Staff Mentor)', wave: 10, nodes: 22, score: 17400, role: 'Architect Mentor' }
  ]
};

// 2. Iconic Architectural Blueprints
const blueprints = {
  netflix: {
    id: 'bp-netflix-zuul',
    title: 'Netflix Video Streaming Pipeline',
    author: 'Netflix Open Source',
    description: 'High-throughput Zuul edge proxy routing through multi-tiered caching into stateless microservices.',
    nodes: [
      { id: 'n1', type: 'SOURCE', x: 80, y: 220 },
      { id: 'n2', type: 'WAF', x: 260, y: 220 },
      { id: 'n3', type: 'LB', x: 440, y: 220 },
      { id: 'n4', type: 'WEB', x: 620, y: 220, count: 6 },
      { id: 'n5', type: 'CACHE', x: 800, y: 140, count: 3 },
      { id: 'n6', type: 'SQL', x: 980, y: 220, count: 2 }
    ],
    edges: [
      { id: 'e1', from: 'n1', to: 'n2' },
      { id: 'e2', from: 'n2', to: 'n3' },
      { id: 'e3', from: 'n3', to: 'n4' },
      { id: 'e4', from: 'n4', to: 'n5' },
      { id: 'e5', from: 'n5', to: 'n6' }
    ]
  },
  spotify: {
    id: 'bp-spotify-audio',
    title: 'Spotify Real-time Audio Distribution',
    author: 'Spotify Engineering',
    description: 'Edge CDN termination delivering sub-10ms audio metadata directly from distributed Cassandra/Redis stores.',
    nodes: [
      { id: 's1', type: 'SOURCE', x: 80, y: 220 },
      { id: 's2', type: 'CDN', x: 260, y: 220 },
      { id: 's3', type: 'WEB', x: 440, y: 220, count: 4 },
      { id: 's4', type: 'CACHE', x: 620, y: 140, count: 4 },
      { id: 's5', type: 'QUEUE', x: 620, y: 300, count: 2 },
      { id: 's6', type: 'SQL', x: 800, y: 300, count: 2 }
    ],
    edges: [
      { id: 'se1', from: 's1', to: 's2' },
      { id: 'se2', from: 's2', to: 's3' },
      { id: 'se3', from: 's3', to: 's4' },
      { id: 'se4', from: 's3', to: 's5' },
      { id: 'se5', from: 's5', to: 's6' }
    ]
  },
  cloudflare: {
    id: 'bp-cloudflare-workers',
    title: 'Cloudflare Edge WAF & Serverless Mesh',
    author: 'Cloudflare Edge Network',
    description: 'Layer 7 DDoS filtering, edge worker computation, and globally replicated KV caching.',
    nodes: [
      { id: 'c1', type: 'SOURCE', x: 80, y: 220 },
      { id: 'c2', type: 'WAF', x: 260, y: 220, count: 4 },
      { id: 'c3', type: 'CDN', x: 440, y: 220, count: 3 },
      { id: 'c4', type: 'CACHE', x: 620, y: 150, count: 4 },
      { id: 'c5', type: 'WEB', x: 620, y: 290, count: 4 }
    ],
    edges: [
      { id: 'ce1', from: 'c1', to: 'c2' },
      { id: 'ce2', from: 'c2', to: 'c3' },
      { id: 'ce3', from: 'c3', to: 'c4' },
      { id: 'ce4', from: 'c3', to: 'c5' }
    ]
  }
};

// 3. Daily Incidents Catalog
const dailyIncidents = [
  {
    dayIndex: 665,
    title: 'Black Friday Flash Mob',
    threat: 'Massive flash crowd spike with 88% burst reads',
    targetRps: 18000,
    allowedBudget: 600,
    maxLatencyMs: 80
  },
  {
    dayIndex: 666,
    title: 'Botnet SYN Flood Attack',
    threat: 'Volumetric Layer 7 assault with spoofed query storms',
    targetRps: 28000,
    allowedBudget: 850,
    maxLatencyMs: 65
  },
  {
    dayIndex: 667,
    title: 'Thundering Herd Cache Wipe',
    threat: 'Simultaneous cold-cache eviction forcing direct DB lockups',
    targetRps: 14000,
    allowedBudget: 500,
    maxLatencyMs: 90
  }
];

fs.writeFileSync(path.join(DATA_DIR, 'leaderboards.json'), JSON.stringify(leaderboards, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'blueprints.json'), JSON.stringify(blueprints, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'daily_incidents.json'), JSON.stringify(dailyIncidents, null, 2));

console.log('✅ Cloudflare backend seed files written to data/ :');
console.log('  - data/leaderboards.json');
console.log('  - data/blueprints.json');
console.log('  - data/daily_incidents.json');
