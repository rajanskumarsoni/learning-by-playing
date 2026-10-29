import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const KV_NAMESPACE_ID = '4dc06fdfe907434ab1294b3660fcd164';

console.log('🚀 Starting System Saviour Cloudflare KV & Cloud Sync...');
console.log(`Cloudflare Account ID: d6a573fb6c8125d26bf1e3bea89353c9`);
console.log(`KV Namespace ID: ${KV_NAMESPACE_ID}`);

function putKV(key, valueOrFilePath, isPath = false) {
  const flag = isPath ? `--path "${valueOrFilePath}"` : `"${valueOrFilePath.replace(/"/g, '\\"')}"`;
  const cmd = `cd backend && npx wrangler kv key put --namespace-id ${KV_NAMESPACE_ID} "${key}" ${flag} --remote`;
  console.log(`  ☁️ Writing key "${key}" to remote Cloudflare KV...`);
  execSync(cmd, { stdio: 'inherit' });
}

// 1. Sync Leaderboards
console.log('\n[1/3] Syncing data/leaderboards.json to Cloudflare KV...');
const leaderboardsPath = path.join(DATA_DIR, 'leaderboards.json');
putKV('leaderboard', leaderboardsPath, true);

// 2. Sync Daily Incidents
console.log('\n[2/3] Syncing data/daily_incidents.json to Cloudflare KV...');
const dailyPath = path.join(DATA_DIR, 'daily_incidents.json');
putKV('daily_incidents', dailyPath, true);

// 3. Sync Architectural Blueprints
console.log('\n[3/3] Syncing data/blueprints.json to Cloudflare KV...');
const blueprintsPath = path.join(DATA_DIR, 'blueprints.json');
const blueprints = JSON.parse(fs.readFileSync(blueprintsPath, 'utf-8'));

putKV('raw_blueprints', blueprintsPath, true);

const indexList = [];
for (const [key, bp] of Object.entries(blueprints)) {
  const id = bp.id || `bp-${key}`;
  const record = {
    id,
    title: bp.title,
    author: bp.author,
    description: bp.description,
    nodes: bp.nodes,
    edges: bp.edges,
    trafficProfile: bp.trafficProfile || {},
    createdAt: new Date().toISOString()
  };
  indexList.push({
    id: record.id,
    title: record.title,
    author: record.author,
    description: record.description,
    createdAt: record.createdAt
  });
  putKV(`blueprint_${id}`, JSON.stringify(record));
}

putKV('blueprints_index', JSON.stringify(indexList));

console.log('\n🎉 ALL DATA HAS BEEN SYNCED TO CLOUDFLARE CLOUD STORAGE (SYSTEM_SAVIOUR_KV)!');

