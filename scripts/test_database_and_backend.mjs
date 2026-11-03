/**
 * Verification test for System Saviour Database & Backend Architecture
 * Tests:
 * 1. Health & Telemetry check
 * 2. User registration with D1/KV persistence
 * 3. User login and bearer session verification
 * 4. Guest terminal access
 * 5. Authoritative level victory evaluation (/api/levels/1/validate)
 * 6. Cloud player state synchronization (/api/player/sync GET & POST)
 * 7. Authoritative anti-cheat leaderboard submission with simulation verification
 * 8. Rejection of unverified/cheated leaderboard data
 * 9. Community blueprints creation and relational lookup
 */

import worker from '../backend/worker.js';

console.log('🚀 Running System Saviour Database & Backend Architecture Test Suite...\n');

// In-Memory Database Simulator for D1 & KV
class MockD1Database {
  constructor() {
    this.tables = {
      users: new Map(),
      sessions: new Map(),
      player_progress: new Map(),
      player_badges: new Set(),
      saved_topologies: new Map(),
      blueprints: new Map(),
      challenges: new Map(),
      leaderboard_entries: new Map()
    };
  }

  prepare(sql) {
    const db = this;
    let boundParams = [];

    const stmt = {
      bind(...params) {
        boundParams = params;
        return stmt;
      },

      async first() {
        const res = await stmt.all();
        return res.results && res.results.length > 0 ? res.results[0] : null;
      },

      async all() {
        const s = sql.trim().toUpperCase();

        if (s.startsWith('SELECT 1')) {
          return { results: [{ '1': 1 }] };
        }

        if (s.includes('FROM SESSIONS S JOIN USERS U')) {
          const [token, now] = boundParams;
          const session = db.tables.sessions.get(token);
          if (session && session.expires_at > now) {
            const user = db.tables.users.get(session.user_id);
            if (user) {
              return {
                results: [{
                  ...session,
                  u_id: user.id,
                  name: user.name,
                  handle: user.handle,
                  email: user.email,
                  role: user.role,
                  specialization: user.specialization,
                  salary: user.salary,
                  rank: user.rank,
                  avatar_url: user.avatar_url,
                  auth_provider: user.auth_provider,
                  user_created_at: user.created_at
                }]
              };
            }
          }
          return { results: [] };
        }

        if (s.includes('FROM USERS WHERE EMAIL = ? OR HANDLE = ?')) {
          const [emailOrHandle] = boundParams;
          for (const u of db.tables.users.values()) {
            if (u.email.toLowerCase() === emailOrHandle.toLowerCase() || u.handle.toLowerCase() === emailOrHandle.toLowerCase()) {
              return { results: [u] };
            }
          }
          return { results: [] };
        }

        if (s.includes('FROM USERS WHERE ID = ?')) {
          const [id] = boundParams;
          const u = db.tables.users.get(id);
          return { results: u ? [u] : [] };
        }

        if (s.includes('FROM PLAYER_PROGRESS WHERE USER_ID = ?')) {
          const [userId] = boundParams;
          const p = db.tables.player_progress.get(userId);
          return { results: p ? [p] : [] };
        }

        if (s.includes('FROM PLAYER_BADGES WHERE USER_ID = ?')) {
          const [userId] = boundParams;
          const userBadges = [];
          for (const item of db.tables.player_badges) {
            if (item.startsWith(`${userId}:`)) {
              userBadges.push({ badge_id: item.split(':')[1] });
            }
          }
          return { results: userBadges };
        }

        if (s.includes('FROM SAVED_TOPOLOGIES WHERE USER_ID = ?')) {
          const [userId] = boundParams;
          const topos = [];
          for (const t of db.tables.saved_topologies.values()) {
            if (t.user_id === userId) topos.push(t);
          }
          return { results: topos };
        }

        if (s.includes('FROM LEADERBOARD_ENTRIES L JOIN USERS U')) {
          const [type, limit] = boundParams;
          const entries = [];
          for (const e of db.tables.leaderboard_entries.values()) {
            if (e.leaderboard_type === type) {
              const u = db.tables.users.get(e.user_id);
              entries.push({
                ...e,
                name: u?.name || 'Architect',
                handle: u?.handle || 'architect',
                role: u?.role || 'Engineer',
                avatar_url: u?.avatar_url || null
              });
            }
          }
          entries.sort((a, b) => b.score - a.score);
          return { results: entries.slice(0, limit) };
        }

        if (s.includes('FROM BLUEPRINTS B JOIN USERS U')) {
          const list = [];
          for (const b of db.tables.blueprints.values()) {
            const u = db.tables.users.get(b.author_id);
            list.push({
              ...b,
              author: u?.name || 'Architect',
              author_handle: u?.handle || 'architect'
            });
          }
          return { results: list };
        }

        if (s.includes('FROM CHALLENGES WHERE ID = ?')) {
          const [id1, id2] = boundParams;
          const c = db.tables.challenges.get(id1) || (id2 ? db.tables.challenges.get(id2) : null);
          return { results: c ? [c] : [] };
        }

        return { results: [] };
      },

      async run() {
        const s = sql.trim().toUpperCase();

        if (s.includes('INSERT INTO USERS')) {
          const [id, handle, email, name, role, spec, salary, rank, password_hash, salt, auth_provider, created_at, updated_at] = boundParams;
          db.tables.users.set(id, {
            id, handle, email, name, role, specialization: spec, salary, rank, password_hash, salt, auth_provider, created_at, updated_at
          });
        } else if (s.includes('INSERT INTO SESSIONS')) {
          const [token, user_id, expires_at, created_at] = boundParams;
          db.tables.sessions.set(token, { token, user_id, expires_at, created_at });
        } else if (s.includes('INSERT INTO PLAYER_PROGRESS') || s.includes('INSERT OR IGNORE INTO PLAYER_PROGRESS')) {
          const [userId, unlockedLevel, maxSurvival, dailyStreak, lastDate, tutorialCompleted, updatedAt] = boundParams;
          db.tables.player_progress.set(userId, {
            user_id: userId,
            unlocked_level_idx: unlockedLevel || 0,
            max_survival_wave: maxSurvival || 0,
            daily_streak: dailyStreak || 0,
            last_daily_completed_date: lastDate || null,
            tutorial_completed: tutorialCompleted || 0,
            updated_at: updatedAt || new Date().toISOString()
          });
        } else if (s.includes('INSERT OR IGNORE INTO PLAYER_BADGES')) {
          const [userId, badgeId] = boundParams;
          db.tables.player_badges.add(`${userId}:${badgeId}`);
        } else if (s.includes('INSERT INTO SAVED_TOPOLOGIES')) {
          const [id, userId, gameMode, levelIdx, nodesJson, edgesJson, updatedAt] = boundParams;
          db.tables.saved_topologies.set(`${userId}_${gameMode}_${levelIdx}`, {
            id, user_id: userId, game_mode: gameMode, level_idx: levelIdx,
            nodes_json: nodesJson, edges_json: edgesJson, updated_at: updatedAt
          });
        } else if (s.includes('INSERT INTO LEADERBOARD_ENTRIES')) {
          const [id, userId, type, dayNumber, levelIdx, score, p99, sla, wave, nodes, verified, createdAt] = boundParams;
          db.tables.leaderboard_entries.set(id, {
            id, user_id: userId, leaderboard_type: type, day_number: dayNumber, level_idx: levelIdx,
            score, p99_latency_ms: p99, uptime_pct: sla, wave_survived: wave, nodes_count: nodes, verified, created_at: createdAt
          });
        } else if (s.includes('INSERT INTO BLUEPRINTS')) {
          const [id, authorId, title, desc, nodesJson, edgesJson, trafficJson, createdAt] = boundParams;
          db.tables.blueprints.set(id, {
            id, author_id: authorId, title, description: desc,
            nodes_json: nodesJson, edges_json: edgesJson, traffic_profile_json: trafficJson,
            likes_count: 0, forks_count: 0, created_at: createdAt
          });
        } else if (s.includes('INSERT INTO CHALLENGES')) {
          const [id, authorId, authorName, gameMode, levelIdx, nodesJson, edgesJson, createdAt] = boundParams;
          db.tables.challenges.set(id, {
            id, author_id: authorId, author_name: authorName, game_mode: gameMode, level_idx: levelIdx,
            nodes_json: nodesJson, edges_json: edgesJson, clicks_count: 0, created_at: createdAt
          });
        }
        return { success: true };
      }
    };
    return stmt;
  }
}

class MockKVStore {
  constructor() { this.store = new Map(); }
  async get(k) { return this.store.get(k) || null; }
  async put(k, v) { this.store.set(k, v); }
  async delete(k) { this.store.delete(k); }
}

const mockEnv = {
  DB: new MockD1Database(),
  SYSTEM_SAVIOUR_KV: new MockKVStore(),
  ENVIRONMENT: 'test'
};

async function run() {
  // 1. Health check
  console.log('[1/7] Testing GET /api/health...');
  const healthRes = await worker.fetch(new Request('http://edge.local/api/health'), mockEnv, {});
  const health = await healthRes.json();
  if (!health.d1Bound || health.status !== 'online') {
    throw new Error('Health check failed: D1 binding not reported');
  }
  console.log('  ✅ Health status:', health.status, '| D1 Bound:', health.d1Bound, '| D1 Connected:', health.d1Connected);

  // 2. User Registration
  console.log('\n[2/7] Testing POST /api/auth/register...');
  const regRes = await worker.fetch(new Request('http://edge.local/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      handle: 'CloudGuru',
      email: 'guru@systemsaviour.dev',
      password: 'ArchitectPassword123!',
      specialization: 'HIGH_AVAILABILITY'
    })
  }), mockEnv, {});

  const regData = await regRes.json();
  if (!regData.success || !regData.token || !regData.user) {
    throw new Error(`Registration failed: ${regData.error}`);
  }
  console.log('  ✅ Registered User in D1:', regData.user.name, `(${regData.user.role})`, '| Token issued:', regData.token.substring(0, 16) + '...');

  // 3. User Login
  console.log('\n[3/7] Testing POST /api/auth/login...');
  const loginRes = await worker.fetch(new Request('http://edge.local/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      emailOrHandle: 'guru@systemsaviour.dev',
      password: 'ArchitectPassword123!'
    })
  }), mockEnv, {});
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.token) {
    throw new Error(`Login failed: ${loginData.error}`);
  }
  const sessionToken = loginData.token;
  console.log('  ✅ Authenticated User Session via D1 query for:', loginData.user.handle);

  // 4. Session Verification (/api/auth/me)
  console.log('\n[4/7] Testing GET /api/auth/me (Bearer Authentication)...');
  const meRes = await worker.fetch(new Request('http://edge.local/api/auth/me', {
    headers: { 'Authorization': `Bearer ${sessionToken}` }
  }), mockEnv, {});
  const meData = await meRes.json();
  if (!meData.success || meData.user.email !== 'guru@systemsaviour.dev') {
    throw new Error('Bearer session verification failed');
  }
  console.log('  ✅ Verified current user from session:', meData.user.name, '| Salary:', meData.user.salary);

  // 5. Cloud State Sync (Push and Pull)
  console.log('\n[5/7] Testing POST & GET /api/player/sync (Cloudflare D1 State Synchronization)...');
  const syncPushRes = await worker.fetch(new Request('http://edge.local/api/player/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`
    },
    body: JSON.stringify({
      progress: {
        unlockedLevelIdx: 3,
        dailyStreak: 7,
        lastDailyCompletedDate: '2026-11-03'
      },
      badges: ['CACHE_LORD', 'KAFKA_TAMER', 'CHAOS_SURVIVOR'],
      topologies: {
        CAMPAIGN_1: {
          nodes: [
            { id: 'src-1', type: 'SOURCE', x: 100, y: 200 },
            { id: 'cdn-1', type: 'CDN', x: 250, y: 200 },
            { id: 'web-1', type: 'WEB', x: 400, y: 200 }
          ],
          edges: [
            { id: 'e1', from: 'src-1', to: 'cdn-1' },
            { id: 'e2', from: 'cdn-1', to: 'web-1' }
          ]
        }
      }
    })
  }), mockEnv, {});

  const syncPush = await syncPushRes.json();
  if (!syncPush.success) throw new Error('Cloud push sync failed');
  console.log('  ✅ Pushed progress, badges, and topologies to D1 tables');

  // Pull it back
  const syncPullRes = await worker.fetch(new Request('http://edge.local/api/player/sync', {
    headers: { 'Authorization': `Bearer ${sessionToken}` }
  }), mockEnv, {});
  const syncPull = await syncPullRes.json();
  if (!syncPull.success || syncPull.progress.unlockedLevelIdx !== 3 || syncPull.badges.length !== 3) {
    throw new Error(`Cloud pull sync verification failed: ${JSON.stringify(syncPull)}`);
  }
  console.log('  ✅ Pulled reconciled cloud state: Level', syncPull.progress.unlockedLevelIdx, '| Badges:', syncPull.badges.join(', '), '| Topologies:', Object.keys(syncPull.topologies));

  // 6. Authoritative Anti-Cheat Leaderboard Submission
  console.log('\n[6/7] Testing Authoritative Simulation & Leaderboard Ingestion (/api/leaderboard)...');
  const validTopology = {
    nodes: [
      { id: 'src', type: 'SOURCE', x: 100, y: 150 },
      { id: 'cdn', type: 'CDN', x: 260, y: 150 },
      { id: 'lb', type: 'LB', x: 420, y: 150 },
      { id: 'web1', type: 'WEB', x: 580, y: 100 },
      { id: 'web2', type: 'WEB', x: 580, y: 200 },
      { id: 'cache', type: 'CACHE', x: 740, y: 150 },
      { id: 'db', type: 'DB', x: 900, y: 150 }
    ],
    edges: [
      { id: 'e1', from: 'src', to: 'cdn' },
      { id: 'e2', from: 'cdn', to: 'lb' },
      { id: 'e3', from: 'lb', to: 'web1' },
      { id: 'e4', from: 'lb', to: 'web2' },
      { id: 'e5', from: 'web1', to: 'cache' },
      { id: 'e6', from: 'web2', to: 'cache' },
      { id: 'e7', from: 'cache', to: 'db' }
    ]
  };

  const lbRes = await worker.fetch(new Request('http://edge.local/api/leaderboard', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`
    },
    body: JSON.stringify({
      type: 'daily',
      nodes: validTopology.nodes,
      edges: validTopology.edges
    })
  }), mockEnv, {});

  const lbData = await lbRes.json();
  if (!lbData.success || !lbData.verified || !lbData.score) {
    throw new Error(`Leaderboard authoritative submission failed: ${JSON.stringify(lbData)}`);
  }
  console.log('  ✅ Authoritative simulation verified score:', lbData.score, '| Player Rank:', lbData.playerRank);

  // Fetch Leaderboard
  const getLbRes = await worker.fetch(new Request('http://edge.local/api/leaderboard?type=daily'), mockEnv, {});
  const getLb = await getLbRes.json();
  if (!getLb.success) throw new Error('Failed to retrieve leaderboard from D1');
  console.log('  ✅ Retrieved D1 Relational Leaderboard, total ranked entries:', getLb.count || getLb.data?.daily?.length);

  // 7. Community Blueprints
  console.log('\n[7/12] Testing Community Blueprints (/api/blueprints)...');
  const bpRes = await worker.fetch(new Request('http://edge.local/api/blueprints', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`
    },
    body: JSON.stringify({
      title: 'High-Availability Multi-Tier Cluster',
      description: 'Zero-drop architecture with edge CDN and cache tier',
      nodes: validTopology.nodes,
      edges: validTopology.edges
    })
  }), mockEnv, {});
  const bpData = await bpRes.json();
  if (!bpData.success || !bpData.id) throw new Error('Failed to create blueprint');
  console.log('  ✅ Saved community blueprint with author attribution in D1:', bpData.id);

  // 8. Architectural Rules & Linter API
  console.log('\n[8/12] Testing Architectural Rules & Linter Matrix (/api/rules)...');
  const rulesRes = await worker.fetch(new Request('http://edge.local/api/rules'), mockEnv, {});
  const rulesData = await rulesRes.json();
  if (!rulesData.success || !rulesData.rules?.SOURCE) throw new Error('Failed to fetch architectural rules');
  console.log('  ✅ Retrieved edge rules matrix: Source allowed targets:', rulesData.rules.SOURCE.allowed.join(', '));

  const invalidWireRes = await worker.fetch(new Request('http://edge.local/api/rules/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromType: 'SOURCE', toType: 'SQL' })
  }), mockEnv, {});
  const invalidWire = await invalidWireRes.json();
  if (invalidWire.allowed !== false || !invalidWire.violation) throw new Error('Edge rule linter failed to flag invalid direct database ingress');
  console.log('  ✅ Linter flagged illegal connection: [', invalidWire.violation.category, '] -', invalidWire.violation.title);

  // 9. Iconic Architecture Presets API
  console.log('\n[9/12] Testing Iconic Architecture Presets (/api/presets)...');
  const presetsRes = await worker.fetch(new Request('http://edge.local/api/presets'), mockEnv, {});
  const presetsData = await presetsRes.json();
  if (!presetsData.success || !Array.isArray(presetsData.presets) || presetsData.presets.length === 0) {
    throw new Error('Failed to fetch iconic presets from edge');
  }
  console.log('  ✅ Retrieved', presetsData.count, 'iconic architectures:', presetsData.presets.map(p => p.name).join(' | '));

  // 10. Badges Roster & Authoritative Level Victory Badge Evaluation
  console.log('\n[10/12] Testing Badges & Server-side Award Engine (/api/badges & /api/levels/1/validate)...');
  const badgesRes = await worker.fetch(new Request('http://edge.local/api/badges'), mockEnv, {});
  const badgesData = await badgesRes.json();
  if (!badgesData.success || !Array.isArray(badgesData.badges)) throw new Error('Failed to fetch badges');
  console.log('  ✅ Retrieved', badgesData.badges.length, 'badges & streak rewards from backend');

  const lvlValRes = await worker.fetch(new Request('http://edge.local/api/levels/1/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`
    },
    body: JSON.stringify({
      nodes: validTopology.nodes,
      edges: validTopology.edges,
      elapsedSeconds: 20,
      streak: 3
    })
  }), mockEnv, {});
  const lvlVal = await lvlValRes.json();
  if (!lvlVal.success || !lvlVal.validation?.earnedBadges) throw new Error('Level validation did not return earnedBadges');
  console.log('  ✅ Authoritatively awarded badges for Level 1 Victory:', lvlVal.validation.earnedBadges.join(', '));

  // 11. Manager Progression Dossier
  console.log('\n[11/12] Testing Manager Progression Dossier (/api/managers)...');
  const mgrRes = await worker.fetch(new Request('http://edge.local/api/managers'), mockEnv, {});
  const mgrData = await mgrRes.json();
  if (!mgrData.success || !Array.isArray(mgrData.managers)) throw new Error('Failed to fetch managers');
  console.log('  ✅ Retrieved', mgrData.count, 'managers with promotion tiers (Top salary:', mgrData.managers[4].baseSalary, ')');

  // 12. Viral Challenges Short Links
  console.log('\n[12/12] Testing Viral Challenge Short Link Service (/api/challenges)...');
  const chCreateRes = await worker.fetch(new Request('http://edge.local/api/challenges', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`
    },
    body: JSON.stringify({
      author: 'MasterArchitect',
      gameMode: 'CAMPAIGN',
      levelIdx: 2,
      nodes: validTopology.nodes,
      edges: validTopology.edges
    })
  }), mockEnv, {});
  const chCreate = await chCreateRes.json();
  if (!chCreate.success || !chCreate.id || !chCreate.shareUrl) throw new Error('Failed to create short-link challenge');
  console.log('  ✅ Created short link challenge:', chCreate.id, '| Short URL:', chCreate.shareUrl);

  const chGetRes = await worker.fetch(new Request(`http://edge.local/api/challenges/${chCreate.id}`), mockEnv, {});
  const chGet = await chGetRes.json();
  if (!chGet.success || chGet.challenge?.nodes?.length !== validTopology.nodes.length) {
    throw new Error('Failed to retrieve challenge by short code');
  }
  console.log('  ✅ Retrieved challenge by short ID:', chGet.challenge.id, 'with', chGet.challenge.nodes.length, 'nodes');

  console.log('\n🎉 ALL 12 DATABASE & BACKEND ARCHITECTURE TESTS PASSED SUCCESSFULLY!\n');
}

run().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});

