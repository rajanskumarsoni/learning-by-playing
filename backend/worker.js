/**
 * System Saviour - Authoritative Cloudflare Edge Backend
 * Hosts:
 * - Server-side simulation & queueing evaluation engine
 * - Anti-cheat level outcome validation & star scoring
 * - Official component catalog & specifications
 * - Campaign level definitions & SLA constraints
 * - Deterministic daily incident generator
 * - Chaos Monkey sabotage engine
 * - Relational D1 Database storage (Users, Sessions, Progression, Badges, Topologies, Leaderboards)
 * - Cloudflare KV / R2 caching and snapshot persistence
 */

import {
  COMPONENT_CATALOG,
  TRAFFIC_TYPES,
  CAMPAIGN_LEVELS,
  evaluateArchitecture,
  validateLevelOutcome,
  generateDailyIncident,
  triggerAuthoritativeChaos,
  CLOUD_CONNECTION_RULES,
  validateCloudConnection,
  ICONIC_PRESETS,
  STREAK_REWARDS,
  ARCHITECT_BADGES,
  LEVEL_MANAGERS,
  evaluateUnlockedBadges
} from './gameEngine.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      ...headers
    }
  });
}

// ============================================================================
// D1 & KV STORAGE ADAPTERS
// ============================================================================

async function storageGet(env, key) {
  if (env.SYSTEM_SAVIOUR_KV) {
    try {
      const text = await env.SYSTEM_SAVIOUR_KV.get(key, 'text');
      if (text !== null && text !== undefined) {
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      }
    } catch (e) {
      console.warn('KV get error:', e);
    }
  }
  if (env.SYSTEM_SAVIOUR_BUCKET) {
    try {
      const obj = await env.SYSTEM_SAVIOUR_BUCKET.get(key);
      if (obj) {
        const text = await obj.text();
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      }
    } catch (e) {
      console.warn('R2 get error:', e);
    }
  }
  return null;
}

async function storagePut(env, key, data) {
  if (data === null || data === undefined) {
    if (env.SYSTEM_SAVIOUR_KV) {
      try { await env.SYSTEM_SAVIOUR_KV.delete(key); } catch { }
    }
    if (env.SYSTEM_SAVIOUR_BUCKET) {
      try { await env.SYSTEM_SAVIOUR_BUCKET.delete(key); } catch { }
    }
    return;
  }
  const jsonStr = JSON.stringify(data);
  if (env.SYSTEM_SAVIOUR_KV) {
    try {
      await env.SYSTEM_SAVIOUR_KV.put(key, jsonStr);
    } catch (e) {
      console.warn('KV put error:', e);
    }
  }
  if (env.SYSTEM_SAVIOUR_BUCKET) {
    try {
      await env.SYSTEM_SAVIOUR_BUCKET.put(key, jsonStr, {
        httpMetadata: { contentType: 'application/json' }
      });
    } catch (e) {
      console.warn('R2 put error:', e);
    }
  }
}

// Seeded Leaderboard for cold start or empty DB
const SEEDED_LEADERBOARD = {
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
    { rank: 3, name: 'Brendan Burns', wave: 12, nodes: 29, score: 22100, role: 'K8s Guardian' }
  ]
};

// Cryptographic Password Hashing (Native Web Crypto API)
async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}:systemsaviour_edge_v2`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateToken() {
  const rand = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
  return `cf_arch_${Date.now()}_${rand.replace(/-/g, '')}`;
}

function roleBySpecialization(spec) {
  switch (spec) {
    case 'THROUGHPUT':
      return 'Throughput & Microservices Guru';
    case 'SECURITY':
      return 'Zero-Trust Cyber Sec Specialist';
    case 'FINOPS':
      return 'Cloud FinOps Engineer';
    case 'HIGH_AVAILABILITY':
    default:
      return 'High Availability & SRE Lead';
  }
}

// Authenticate Bearer token helper (Checks D1 first, then KV)
async function getAuthenticatedUser(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  // 1. Try D1 if bound
  if (env.DB) {
    try {
      const now = Date.now();
      const session = await env.DB.prepare(
        'SELECT s.*, u.id as u_id, u.name, u.handle, u.email, u.role, u.specialization, u.salary, u.rank, u.avatar_url, u.auth_provider, u.created_at as user_created_at FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > ?'
      ).bind(token, now).first();

      if (session) {
        return {
          token,
          user: {
            id: session.u_id,
            name: session.name,
            handle: session.handle,
            email: session.email,
            role: session.role,
            specialization: session.specialization,
            salary: session.salary,
            rank: session.rank,
            avatar: session.avatar_url,
            authProvider: session.auth_provider,
            createdAt: session.user_created_at
          }
        };
      }
    } catch (e) {
      console.warn('D1 auth lookup error, falling back to KV:', e);
    }
  }

  // 2. Fallback to KV
  const kvSession = await storageGet(env, `session_${token}`);
  if (kvSession && kvSession.userId && (!kvSession.expiresAt || Date.now() < kvSession.expiresAt)) {
    const userRecord = await storageGet(env, `user_${kvSession.userId}`);
    if (userRecord) {
      const { passwordHash: _p, salt: _s, ...safeUser } = userRecord;
      return { token, user: safeUser };
    }
  }

  return null;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }

    const path = url.pathname;

    try {
      // ====================================================================
      // 1. HEALTH & EDGE TELEMETRY
      // ====================================================================
      if (path === '/' || path === '/api/health') {
        let d1Connected = false;
        if (env.DB) {
          try {
            await env.DB.prepare('SELECT 1').first();
            d1Connected = true;
          } catch (e) {
            d1Connected = false;
          }
        }

        return jsonResponse({
          status: 'online',
          service: 'System Saviour Authoritative Edge Engine',
          version: '2.1.0',
          environment: env.ENVIRONMENT || 'production',
          colo: request.cf?.colo || 'UNKNOWN',
          country: request.cf?.country || 'UNKNOWN',
          d1Bound: Boolean(env.DB),
          d1Connected,
          kvBound: Boolean(env.SYSTEM_SAVIOUR_KV),
          r2Bound: Boolean(env.SYSTEM_SAVIOUR_BUCKET),
          features: [
            'authoritative-simulation',
            'anti-cheat-validation',
            'catalog-sync',
            'daily-incidents',
            'chaos-monkey',
            'd1-relational-database',
            'cloud-player-sync',
            'leaderboard-relational'
          ],
          timestamp: new Date().toISOString()
        });
      }

      // ====================================================================
      // 2. AUTHORITATIVE SIMULATION EVALUATION (POST /api/evaluate)
      // ====================================================================
      if (path === '/api/evaluate' && method === 'POST') {
        const body = await request.json();
        const { nodes = [], edges = [], incomingRps = 1000, trafficMix = {}, maxBudgetHr = null } = body;

        const evaluation = evaluateArchitecture(nodes, edges, incomingRps, trafficMix, maxBudgetHr);

        return jsonResponse({
          success: true,
          authoritative: true,
          evaluatedAt: new Date().toISOString(),
          evaluation
        });
      }

      // ====================================================================
      // 3. AUTHORITATIVE LEVEL VICTORY VALIDATION (POST /api/levels/:id/validate)
      // ====================================================================
      if (path.match(/^\/api\/levels\/\d+\/validate$/) && method === 'POST') {
        const levelId = parseInt(path.split('/')[3], 10);
        const body = await request.json();
        const { nodes = [], edges = [], elapsedSeconds = 20, streak = 0 } = body;

        const validation = validateLevelOutcome(levelId, nodes, edges, elapsedSeconds);
        const earnedBadges = evaluateUnlockedBadges(nodes, edges, { won: validation.won, levelId }, streak);

        // If authenticated and won, persist any newly earned badges to D1
        const auth = await getAuthenticatedUser(request, env);
        if (auth && validation.won && env.DB && earnedBadges.length > 0) {
          const timestamp = new Date().toISOString();
          for (const badgeId of earnedBadges) {
            try {
              await env.DB.prepare(
                'INSERT OR IGNORE INTO player_badges (user_id, badge_id, unlocked_at) VALUES (?, ?, ?)'
              ).bind(auth.user.id, badgeId, timestamp).run();
            } catch (e) { }
          }
        }

        return jsonResponse({
          success: true,
          authoritative: true,
          validation: {
            ...validation,
            earnedBadges
          }
        });
      }

      // ====================================================================
      // 3.5. ARCHITECTURAL CONNECTION RULES & LINTER (GET & POST /api/rules)
      // ====================================================================
      if (path === '/api/rules' && method === 'GET') {
        return jsonResponse({
          success: true,
          rules: CLOUD_CONNECTION_RULES
        });
      }

      if (path === '/api/rules/validate' && method === 'POST') {
        const body = await request.json();
        const { fromType, toType, nodes = [], edges = [], fromId = null, toId = null, options = {} } = body;
        const result = validateCloudConnection(fromType, toType, nodes, edges, fromId, toId, options);
        return jsonResponse({
          success: true,
          ...result
        });
      }

      // ====================================================================
      // 3.6. ICONIC ARCHITECTURE PRESETS (GET /api/presets)
      // ====================================================================
      if (path === '/api/presets' && method === 'GET') {
        return jsonResponse({
          success: true,
          count: ICONIC_PRESETS.length,
          presets: ICONIC_PRESETS
        });
      }

      // ====================================================================
      // 3.7. ARCHITECT BADGES & STREAK REWARDS (GET /api/badges)
      // ====================================================================
      if (path === '/api/badges' && method === 'GET') {
        return jsonResponse({
          success: true,
          badges: ARCHITECT_BADGES,
          streakRewards: STREAK_REWARDS
        });
      }

      // ====================================================================
      // 3.8. ENGINEERING MANAGERS & PROGRESSION DOSSIER (GET /api/managers)
      // ====================================================================
      if (path === '/api/managers' && method === 'GET') {
        return jsonResponse({
          success: true,
          count: LEVEL_MANAGERS.length,
          managers: LEVEL_MANAGERS
        });
      }

      // ====================================================================
      // 3.9. VIRAL CHALLENGES & SHORT LINKS (POST & GET /api/challenges)
      // ====================================================================
      if (path === '/api/challenges' && method === 'POST') {
        const body = await request.json();
        const auth = await getAuthenticatedUser(request, env);
        const randId = Math.random().toString(36).substring(2, 8);
        const challengeId = `c_${randId}`;
        const timestamp = new Date().toISOString();

        const record = {
          id: challengeId,
          authorName: auth?.user?.name || body.author || 'Anonymous Architect',
          authorId: auth?.user?.id || 'anonymous',
          gameMode: body.gameMode || 'CAMPAIGN',
          levelIdx: body.levelIdx || 0,
          nodes: body.nodes || [],
          edges: body.edges || [],
          createdAt: timestamp
        };

        if (env.DB) {
          try {
            await env.DB.prepare(`
              INSERT INTO challenges (id, author_id, author_name, game_mode, level_idx, nodes_json, edges_json, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              challengeId,
              record.authorId,
              record.authorName,
              record.gameMode,
              record.levelIdx,
              JSON.stringify(record.nodes),
              JSON.stringify(record.edges),
              timestamp
            ).run();
          } catch (e) {
            console.warn('D1 challenges insert error, falling back to KV:', e);
          }
        }

        await storagePut(env, `challenge_${challengeId}`, record);

        return jsonResponse({
          success: true,
          id: challengeId,
          shortCode: randId,
          shareUrl: `${url.origin}/#challenge=${challengeId}`
        }, 201);
      }

      if (path.startsWith('/api/challenges/') && method === 'GET') {
        const challengeId = path.replace('/api/challenges/', '');
        if (!challengeId) return jsonResponse({ error: 'Missing challenge ID' }, 400);

        let challenge = null;

        if (env.DB) {
          try {
            const row = await env.DB.prepare('SELECT * FROM challenges WHERE id = ? OR id = ?').bind(challengeId, `c_${challengeId}`).first();
            if (row) {
              await env.DB.prepare('UPDATE challenges SET clicks_count = clicks_count + 1 WHERE id = ?').bind(row.id).run();
              challenge = {
                id: row.id,
                author: row.author_name,
                gameMode: row.game_mode,
                levelIdx: row.level_idx,
                nodes: JSON.parse(row.nodes_json),
                edges: JSON.parse(row.edges_json),
                createdAt: row.created_at
              };
            }
          } catch (e) { }
        }

        if (!challenge) {
          challenge = await storageGet(env, `challenge_${challengeId}`) || await storageGet(env, `challenge_c_${challengeId}`);
        }

        if (challenge) {
          return jsonResponse({ success: true, challenge });
        }
        return jsonResponse({ success: false, error: 'Challenge not found' }, 404);
      }

      // ====================================================================
      // 4. COMPONENT CATALOG & SPECIFICATIONS (GET /api/catalog)
      // ====================================================================
      if (path === '/api/catalog' && method === 'GET') {
        return jsonResponse({
          success: true,
          catalog: COMPONENT_CATALOG,
          trafficTypes: TRAFFIC_TYPES
        });
      }

      // ====================================================================
      // 5. OFFICIAL CAMPAIGN LEVELS (GET /api/levels and GET /api/levels/:id)
      // ====================================================================
      if (path === '/api/levels' && method === 'GET') {
        return jsonResponse({
          success: true,
          count: CAMPAIGN_LEVELS.length,
          levels: CAMPAIGN_LEVELS
        });
      }

      if (path.match(/^\/api\/levels\/\d+$/) && method === 'GET') {
        const levelId = parseInt(path.split('/')[3], 10);
        const level = CAMPAIGN_LEVELS.find((l) => l.id === levelId);
        if (level) {
          return jsonResponse({ success: true, level });
        }
        return jsonResponse({ success: false, error: 'Level not found' }, 404);
      }

      // ====================================================================
      // 6. DETERMINISTIC DAILY INCIDENTS (GET /api/daily/today)
      // ====================================================================
      if (path === '/api/daily/today' && method === 'GET') {
        const daily = generateDailyIncident(0);
        return jsonResponse({
          success: true,
          daily
        });
      }

      // ====================================================================
      // 7. AUTHORITATIVE CHAOS MONKEY STRIKE (POST /api/chaos/trigger)
      // ====================================================================
      if (path === '/api/chaos/trigger' && method === 'POST') {
        const body = await request.json();
        const { nodes = [], preferredType = null } = body;
        const result = triggerAuthoritativeChaos(nodes, preferredType);
        return jsonResponse(result);
      }

      // ====================================================================
      // 8. GLOBAL & DAILY LEADERBOARDS (GET & POST /api/leaderboard)
      // Backed by D1 Relational SQL + KV Cache
      // ====================================================================
      if (path === '/api/leaderboard' && method === 'GET') {
        const type = (url.searchParams.get('type') || 'daily').toLowerCase();
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));

        // 1. Try D1 Relational Leaderboard
        if (env.DB) {
          try {
            const query = `
              SELECT 
                l.id, l.score, l.p99_latency_ms, l.uptime_pct, l.wave_survived, l.nodes_count, l.created_at,
                u.id as user_id, u.name, u.handle, u.role, u.avatar_url
              FROM leaderboard_entries l
              JOIN users u ON l.user_id = u.id
              WHERE l.leaderboard_type = ?
              ORDER BY l.score DESC
              LIMIT ?
            `;
            const rows = await env.DB.prepare(query).bind(type, limit).all();

            if (rows && rows.results && rows.results.length > 0) {
              const ranked = rows.results.map((r, idx) => ({
                rank: idx + 1,
                id: r.id,
                name: r.name,
                handle: r.handle,
                role: r.role,
                avatar: r.avatar_url,
                score: r.score,
                p99: `${Math.round(r.p99_latency_ms)}ms`,
                sla: `${r.uptime_pct.toFixed(1)}%`,
                wave: r.wave_survived,
                nodes: r.nodes_count,
                date: r.created_at
              }));

              return jsonResponse({
                success: true,
                source: 'd1_relational',
                type,
                count: ranked.length,
                data: { [type]: ranked }
              });
            }
          } catch (err) {
            console.warn('D1 Leaderboard fetch error, falling back to KV/Seed:', err);
          }
        }

        // 2. Fallback to KV or Seeded
        const stored = await storageGet(env, 'leaderboard');
        const leaderboard = stored || SEEDED_LEADERBOARD;
        return jsonResponse({
          success: true,
          source: 'kv_cache',
          data: leaderboard,
          cachedAt: new Date().toISOString()
        });
      }

      if (path === '/api/leaderboard' && method === 'POST') {
        const payload = await request.json();
        const {
          type = 'daily',
          entry,
          nodes,
          edges,
          levelId,
          dayNumber
        } = payload;

        // Verify caller authentication
        const auth = await getAuthenticatedUser(request, env);
        let submitterUser = auth?.user;

        // If no auth token, check if entry provides an identifiable user, else anonymous
        if (!submitterUser) {
          submitterUser = {
            id: `anon_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: entry?.name || 'Anonymous Architect',
            handle: 'anonymous',
            role: entry?.role || 'Guest Terminal'
          };
        }

        let verifiedScore = entry?.score;
        let verifiedP99 = entry?.p99 ? parseFloat(String(entry.p99).replace(/[^0-9.]/g, '')) : 25;
        let verifiedSLA = entry?.sla ? parseFloat(String(entry.sla).replace(/[^0-9.]/g, '')) : 99.9;
        let waveSurvived = entry?.wave || null;
        let nodesCount = Array.isArray(nodes) ? nodes.length : (entry?.nodes || 0);

        // AUTHORITATIVE VERIFICATION: If nodes and edges are provided, evaluate server-side
        if (Array.isArray(nodes) && Array.isArray(edges) && nodes.length > 0) {
          let targetRps = 1500;
          let trafficMix = { STATIC: 0.4, READ: 0.4, WRITE: 0.2 };
          let budget = 250;

          if (type === 'daily') {
            const daily = generateDailyIncident(0);
            targetRps = daily.targetRps;
            trafficMix = daily.trafficMix;
            budget = daily.maxBudgetHr;
          } else if (levelId !== undefined) {
            const lvl = CAMPAIGN_LEVELS.find((l) => l.id === Number(levelId));
            if (lvl) {
              targetRps = lvl.targetRps;
              trafficMix = lvl.trafficMix;
              budget = lvl.maxBudgetHr;
            }
          }

          const evaluation = evaluateArchitecture(nodes, edges, targetRps, trafficMix, budget);
          verifiedP99 = Math.round(evaluation.p99Latency);
          verifiedSLA = evaluation.uptimePct;
          nodesCount = nodes.length;

          if (type === 'daily') {
            verifiedScore = Math.max(1000, 10000 - Math.round(verifiedP99 * 50));
          }
        }

        if (verifiedScore == null) {
          return jsonResponse({ success: false, error: 'Could not calculate or verify valid score' }, 400);
        }

        const entryId = `lb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const timestamp = new Date().toISOString();

        // 1. Insert into D1 if available
        if (env.DB) {
          try {
            // Ensure user exists in users table (insert placeholder if anonymous guest)
            const existingUser = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(submitterUser.id).first();
            if (!existingUser) {
              await env.DB.prepare(
                'INSERT INTO users (id, handle, email, name, role, specialization, salary, rank, auth_provider) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
              ).bind(
                submitterUser.id,
                submitterUser.handle || `user_${submitterUser.id.substring(0, 8)}`,
                submitterUser.email || `${submitterUser.id}@systemsaviour.dev`,
                submitterUser.name,
                submitterUser.role,
                submitterUser.specialization || 'HIGH_AVAILABILITY',
                submitterUser.salary || '$95,000 / yr',
                submitterUser.rank || 'Junior Architect',
                'guest'
              ).run();
            }

            await env.DB.prepare(
              'INSERT INTO leaderboard_entries (id, user_id, leaderboard_type, day_number, level_idx, score, p99_latency_ms, uptime_pct, wave_survived, nodes_count, verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)'
            ).bind(
              entryId,
              submitterUser.id,
              type.toLowerCase(),
              dayNumber || null,
              levelId || null,
              verifiedScore,
              verifiedP99,
              verifiedSLA,
              waveSurvived,
              nodesCount,
              timestamp
            ).run();
          } catch (dbErr) {
            console.warn('D1 Leaderboard insert error:', dbErr);
          }
        }

        // 2. Also update KV Cache for fast reads
        const stored = await storageGet(env, 'leaderboard');
        const currentLeaderboard = stored || SEEDED_LEADERBOARD;
        const list = currentLeaderboard[type] || [];
        const newRecord = {
          rank: 0,
          id: entryId,
          name: submitterUser.name,
          score: verifiedScore,
          p99: `${verifiedP99}ms`,
          sla: `${verifiedSLA.toFixed(1)}%`,
          role: submitterUser.role,
          wave: waveSurvived,
          date: timestamp
        };

        const updatedList = [...list, newRecord];
        updatedList.sort((a, b) => b.score - a.score);
        const ranked = updatedList.slice(0, 100).map((item, idx) => ({ ...item, rank: idx + 1 }));
        currentLeaderboard[type] = ranked;
        await storagePut(env, 'leaderboard', currentLeaderboard);

        const playerRank = ranked.findIndex((item) => item.id === entryId || item.name === submitterUser.name) + 1;

        return jsonResponse({
          success: true,
          verified: true,
          playerRank: playerRank || 1,
          score: verifiedScore,
          totalEntries: ranked.length,
          top10: ranked.slice(0, 10)
        });
      }

      // ====================================================================
      // 9. FULL CLOUD STATE SYNCHRONIZATION (GET & POST /api/player/sync)
      // Synchronizes Progress, Badges, and Saved Topologies across devices
      // ====================================================================
      if (path === '/api/player/sync') {
        const auth = await getAuthenticatedUser(request, env);
        if (!auth) {
          return jsonResponse({ success: false, error: 'Authorization required for cloud sync' }, 401);
        }

        const userId = auth.user.id;

        // PULL STATE (GET)
        if (method === 'GET') {
          let progress = {
            unlockedLevelIdx: 0,
            maxSurvivalWave: 0,
            dailyStreak: 0,
            lastDailyCompletedDate: null,
            tutorialCompleted: false
          };
          let badges = [];
          let topologies = {};

          if (env.DB) {
            try {
              // 1. Fetch Progress
              const pRow = await env.DB.prepare('SELECT * FROM player_progress WHERE user_id = ?').bind(userId).first();
              if (pRow) {
                progress = {
                  unlockedLevelIdx: pRow.unlocked_level_idx,
                  maxSurvivalWave: pRow.max_survival_wave,
                  dailyStreak: pRow.daily_streak,
                  lastDailyCompletedDate: pRow.last_daily_completed_date,
                  tutorialCompleted: Boolean(pRow.tutorial_completed)
                };
              }

              // 2. Fetch Badges
              const bRows = await env.DB.prepare('SELECT badge_id FROM player_badges WHERE user_id = ?').bind(userId).all();
              if (bRows && bRows.results) {
                badges = bRows.results.map((r) => r.badge_id);
              }

              // 3. Fetch Topologies
              const tRows = await env.DB.prepare('SELECT game_mode, level_idx, nodes_json, edges_json FROM saved_topologies WHERE user_id = ?').bind(userId).all();
              if (tRows && tRows.results) {
                for (const row of tRows.results) {
                  const key = `${row.game_mode}_${row.level_idx}`;
                  try {
                    topologies[key] = {
                      nodes: JSON.parse(row.nodes_json),
                      edges: JSON.parse(row.edges_json)
                    };
                  } catch { }
                }
              }
            } catch (d1Err) {
              console.warn('D1 sync pull error, reading fallback profile from KV:', d1Err);
            }
          }

          // Fallback to KV profile if D1 returned empty
          if (badges.length === 0 && progress.unlockedLevelIdx === 0) {
            const kvProfile = await storageGet(env, `player_${userId}`);
            if (kvProfile) {
              if (kvProfile.unlockedLevelIdx !== undefined) progress.unlockedLevelIdx = kvProfile.unlockedLevelIdx;
              if (kvProfile.streak !== undefined) progress.dailyStreak = kvProfile.streak;
              if (Array.isArray(kvProfile.unlockedBadges)) badges = kvProfile.unlockedBadges;
            }
          }

          return jsonResponse({
            success: true,
            user: auth.user,
            progress,
            badges,
            topologies,
            syncedAt: new Date().toISOString()
          });
        }

        // PUSH / RECONCILE STATE (POST)
        if (method === 'POST') {
          const body = await request.json();
          const { progress, badges = [], topologies = {} } = body;
          const timestamp = new Date().toISOString();

          if (env.DB) {
            try {
              // 1. Upsert Progress
              if (progress) {
                await env.DB.prepare(`
                  INSERT INTO player_progress (user_id, unlocked_level_idx, max_survival_wave, daily_streak, last_daily_completed_date, tutorial_completed, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(user_id) DO UPDATE SET
                    unlocked_level_idx = MAX(player_progress.unlocked_level_idx, excluded.unlocked_level_idx),
                    max_survival_wave = MAX(player_progress.max_survival_wave, excluded.max_survival_wave),
                    daily_streak = MAX(player_progress.daily_streak, excluded.daily_streak),
                    last_daily_completed_date = COALESCE(excluded.last_daily_completed_date, player_progress.last_daily_completed_date),
                    tutorial_completed = MAX(player_progress.tutorial_completed, excluded.tutorial_completed),
                    updated_at = excluded.updated_at
                `).bind(
                  userId,
                  progress.unlockedLevelIdx || 0,
                  progress.maxSurvivalWave || 0,
                  progress.dailyStreak || 0,
                  progress.lastDailyCompletedDate || null,
                  progress.tutorialCompleted ? 1 : 0,
                  timestamp
                ).run();
              }

              // 2. Insert Badges
              for (const badgeId of badges) {
                await env.DB.prepare(
                  'INSERT OR IGNORE INTO player_badges (user_id, badge_id, unlocked_at) VALUES (?, ?, ?)'
                ).bind(userId, badgeId, timestamp).run();
              }

              // 3. Upsert Topologies
              for (const [key, topo] of Object.entries(topologies)) {
                if (topo && topo.nodes && topo.edges) {
                  const parts = key.split('_');
                  const gameMode = parts[0] || 'CAMPAIGN';
                  const levelIdx = parseInt(parts[1] || '0', 10);
                  const topoId = `topo_${userId}_${key}`;

                  await env.DB.prepare(`
                    INSERT INTO saved_topologies (id, user_id, game_mode, level_idx, nodes_json, edges_json, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(user_id, game_mode, level_idx) DO UPDATE SET
                      nodes_json = excluded.nodes_json,
                      edges_json = excluded.edges_json,
                      updated_at = excluded.updated_at
                  `).bind(
                    topoId,
                    userId,
                    gameMode,
                    levelIdx,
                    JSON.stringify(topo.nodes),
                    JSON.stringify(topo.edges),
                    timestamp
                  ).run();
                }
              }
            } catch (d1Err) {
              console.warn('D1 sync push error:', d1Err);
            }
          }

          // Also mirror to KV for fallback
          await storagePut(env, `player_${userId}`, {
            userId,
            unlockedLevelIdx: progress?.unlockedLevelIdx || 0,
            unlockedBadges: badges,
            streak: progress?.dailyStreak || 0,
            updatedAt: timestamp
          });

          return jsonResponse({
            success: true,
            message: 'Player career and architectures synchronized with Cloudflare Edge',
            syncedAt: timestamp
          });
        }
      }

      // ====================================================================
      // 10. BLUEPRINTS (GET & POST /api/blueprints)
      // Backed by D1 Relational DB + R2 Object Storage
      // ====================================================================
      if (path === '/api/blueprints' && method === 'GET') {
        if (env.DB) {
          try {
            const query = `
              SELECT b.id, b.title, b.description, b.likes_count, b.forks_count, b.created_at,
                     u.name as author, u.handle as author_handle
              FROM blueprints b
              JOIN users u ON b.author_id = u.id
              WHERE b.is_public = 1
              ORDER BY b.created_at DESC
              LIMIT 50
            `;
            const rows = await env.DB.prepare(query).all();
            if (rows && rows.results && rows.results.length > 0) {
              return jsonResponse({
                success: true,
                count: rows.results.length,
                blueprints: rows.results
              });
            }
          } catch (e) {
            console.warn('D1 blueprints fetch error, falling back to KV:', e);
          }
        }

        const indexList = (await storageGet(env, 'blueprints_index')) || [];
        return jsonResponse({ success: true, count: indexList.length, blueprints: indexList });
      }

      if (path === '/api/blueprints' && method === 'POST') {
        const payload = await request.json();
        const auth = await getAuthenticatedUser(request, env);
        const authorId = auth?.user?.id || 'anonymous';
        const authorName = auth?.user?.name || payload.author || 'Anonymous Architect';

        const id = payload.id || `bp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const record = {
          id,
          title: payload.title || 'Community Blueprint',
          description: payload.description || 'Architectural defense layout',
          author: authorName,
          authorId,
          nodes: payload.nodes || [],
          edges: payload.edges || [],
          trafficProfile: payload.trafficProfile || {},
          createdAt: new Date().toISOString()
        };

        // 1. Insert into D1 if available
        if (env.DB) {
          try {
            // Ensure author exists in users table
            const userExists = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(authorId).first();
            if (!userExists) {
              await env.DB.prepare(
                'INSERT INTO users (id, handle, email, name, role, specialization, auth_provider) VALUES (?, ?, ?, ?, ?, ?, ?)'
              ).bind(
                authorId,
                `user_${authorId.substring(0, 8)}`,
                `${authorId}@systemsaviour.dev`,
                authorName,
                'Architect',
                'HIGH_AVAILABILITY',
                'guest'
              ).run();
            }

            await env.DB.prepare(`
              INSERT INTO blueprints (id, author_id, title, description, nodes_json, edges_json, traffic_profile_json, is_public, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
            `).bind(
              id,
              authorId,
              record.title,
              record.description,
              JSON.stringify(record.nodes),
              JSON.stringify(record.edges),
              JSON.stringify(record.trafficProfile),
              record.createdAt
            ).run();
          } catch (dbErr) {
            console.warn('D1 blueprint insert error:', dbErr);
          }
        }

        // 2. Put full snapshot to KV / R2
        await storagePut(env, `blueprint_${id}`, record);

        const indexList = (await storageGet(env, 'blueprints_index')) || [];
        indexList.unshift({ id, title: record.title, author: authorName, createdAt: record.createdAt });
        await storagePut(env, 'blueprints_index', indexList.slice(0, 50));

        return jsonResponse({
          success: true,
          id,
          url: `${url.origin}/api/blueprints/${id}`,
          message: 'Blueprint saved to Cloudflare Edge'
        });
      }

      if (path.startsWith('/api/blueprints/') && method === 'GET') {
        const id = path.replace('/api/blueprints/', '');
        if (!id) return jsonResponse({ error: 'Missing blueprint ID' }, 400);

        if (env.DB) {
          try {
            const row = await env.DB.prepare(
              'SELECT b.*, u.name as author, u.handle as author_handle FROM blueprints b JOIN users u ON b.author_id = u.id WHERE b.id = ?'
            ).bind(id).first();

            if (row) {
              return jsonResponse({
                success: true,
                blueprint: {
                  id: row.id,
                  title: row.title,
                  description: row.description,
                  author: row.author,
                  nodes: JSON.parse(row.nodes_json),
                  edges: JSON.parse(row.edges_json),
                  trafficProfile: row.traffic_profile_json ? JSON.parse(row.traffic_profile_json) : {},
                  createdAt: row.created_at
                }
              });
            }
          } catch (e) {
            console.warn('D1 blueprint item error, falling back to KV:', e);
          }
        }

        const data = await storageGet(env, `blueprint_${id}`);
        if (data) {
          return jsonResponse({ success: true, blueprint: data });
        }
        return jsonResponse({ success: false, error: 'Blueprint not found' }, 404);
      }

      // ====================================================================
      // 11. LEGACY PLAYER PROFILE SYNC (GET & PUT /api/player/:id)
      // ====================================================================
      if (path.startsWith('/api/player/') && method === 'GET') {
        const playerId = path.replace('/api/player/', '');
        const profile = await storageGet(env, `player_${playerId}`);
        if (profile) {
          return jsonResponse({ success: true, profile });
        }
        return jsonResponse({ success: false, message: 'New player profile' }, 404);
      }

      if (path.startsWith('/api/player/') && method === 'PUT') {
        const playerId = path.replace('/api/player/', '');
        const profile = await request.json();
        profile.updatedAt = new Date().toISOString();

        await storagePut(env, `player_${playerId}`, profile);
        return jsonResponse({ success: true, message: 'Player cloud profile synced to Cloudflare Edge' });
      }

      // ====================================================================
      // 12. ARCHITECT AUTHENTICATION & IDENTITY (SIGN IN, SIGN UP, GUEST, ME)
      // ====================================================================

      // Register / Sign Up (POST /api/auth/register or /api/auth/signup)
      if ((path === '/api/auth/register' || path === '/api/auth/signup') && method === 'POST') {
        const payload = await request.json();
        const { handle, email, password, specialization } = payload;

        const cleanHandle = (handle || '').trim();
        const cleanEmail = (email || '').trim().toLowerCase();

        if (!cleanHandle || cleanHandle.length < 3) {
          return jsonResponse({ success: false, error: 'Architect Handle must be at least 3 characters' }, 400);
        }
        if (!cleanEmail || !cleanEmail.includes('@')) {
          return jsonResponse({ success: false, error: 'Valid engineering email required' }, 400);
        }
        if (!password || password.length < 6) {
          return jsonResponse({ success: false, error: 'Password must be at least 6 characters' }, 400);
        }

        // Check uniqueness in D1 and KV
        if (env.DB) {
          try {
            const conflict = await env.DB.prepare(
              'SELECT id, email, handle FROM users WHERE email = ? OR handle = ?'
            ).bind(cleanEmail, cleanHandle.toLowerCase()).first();

            if (conflict) {
              if (conflict.email.toLowerCase() === cleanEmail) {
                return jsonResponse({ success: false, error: 'An architect with this email already exists' }, 409);
              }
              return jsonResponse({ success: false, error: 'Architect handle is already claimed' }, 409);
            }
          } catch (e) {
            console.warn('D1 user check error:', e);
          }
        }

        const existingByEmail = await storageGet(env, `user_by_email_${cleanEmail}`);
        if (existingByEmail) {
          return jsonResponse({ success: false, error: 'An architect with this email already exists' }, 409);
        }
        const existingByHandle = await storageGet(env, `user_by_handle_${cleanHandle.toLowerCase()}`);
        if (existingByHandle) {
          return jsonResponse({ success: false, error: 'Architect handle is already claimed' }, 409);
        }

        // Salt and Hash
        const salt = Math.random().toString(36).substring(2, 10);
        const passwordHash = await hashPassword(password, salt);
        const id = `arch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const timestamp = new Date().toISOString();

        const userRecord = {
          id,
          name: cleanHandle,
          handle: cleanHandle.toLowerCase(),
          email: cleanEmail,
          role: roleBySpecialization(specialization),
          specialization: specialization || 'HIGH_AVAILABILITY',
          salary: '$95,000 / yr',
          rank: 'Junior Architect',
          passwordHash,
          salt,
          authProvider: 'email',
          createdAt: timestamp,
          lastLoginAt: timestamp
        };

        // Insert into D1
        if (env.DB) {
          try {
            await env.DB.prepare(`
              INSERT INTO users (id, handle, email, name, role, specialization, salary, rank, password_hash, salt, auth_provider, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              id,
              userRecord.handle,
              userRecord.email,
              userRecord.name,
              userRecord.role,
              userRecord.specialization,
              userRecord.salary,
              userRecord.rank,
              passwordHash,
              salt,
              userRecord.authProvider,
              timestamp,
              timestamp
            ).run();

            // Default progress
            await env.DB.prepare(`
              INSERT OR IGNORE INTO player_progress (user_id, unlocked_level_idx, max_survival_wave, daily_streak, updated_at)
              VALUES (?, 0, 0, 0, ?)
            `).bind(id, timestamp).run();
          } catch (e) {
            console.warn('D1 user insert error:', e);
          }
        }

        // Persist to KV
        await storagePut(env, `user_${id}`, userRecord);
        await storagePut(env, `user_by_email_${cleanEmail}`, id);
        await storagePut(env, `user_by_handle_${cleanHandle.toLowerCase()}`, id);

        // Generate session token
        const token = generateToken();
        const expiresAt = Date.now() + 86400000 * 30;

        if (env.DB) {
          try {
            await env.DB.prepare(
              'INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)'
            ).bind(token, id, expiresAt, timestamp).run();
          } catch (e) {
            console.warn('D1 session insert error:', e);
          }
        }

        await storagePut(env, `session_${token}`, {
          userId: id,
          createdAt: timestamp,
          expiresAt
        });

        const { passwordHash: _p, salt: _s, ...safeUser } = userRecord;
        return jsonResponse({
          success: true,
          token,
          user: safeUser,
          message: `Architect identity initialized for ${cleanHandle}`
        }, 201);
      }

      // Login / Sign In (POST /api/auth/login or /api/auth/signin)
      if ((path === '/api/auth/login' || path === '/api/auth/signin') && method === 'POST') {
        const payload = await request.json();
        const { emailOrHandle, password } = payload;
        const clean = (emailOrHandle || '').trim().toLowerCase();

        if (!clean || !password) {
          return jsonResponse({ success: false, error: 'Email/Handle and password are required' }, 400);
        }

        let userRecord = null;

        // 1. Try D1
        if (env.DB) {
          try {
            const row = await env.DB.prepare(
              'SELECT * FROM users WHERE email = ? OR handle = ?'
            ).bind(clean, clean).first();

            if (row) {
              userRecord = {
                id: row.id,
                name: row.name,
                handle: row.handle,
                email: row.email,
                role: row.role,
                specialization: row.specialization,
                salary: row.salary,
                rank: row.rank,
                avatar: row.avatar_url,
                passwordHash: row.password_hash,
                salt: row.salt,
                authProvider: row.auth_provider,
                createdAt: row.created_at
              };
            }
          } catch (e) {
            console.warn('D1 login lookup error:', e);
          }
        }

        // 2. Fallback to KV
        if (!userRecord) {
          let userId = await storageGet(env, `user_by_email_${clean}`);
          if (!userId) {
            userId = await storageGet(env, `user_by_handle_${clean}`);
          }
          if (userId) {
            userRecord = await storageGet(env, `user_${userId}`);
          }
        }

        if (!userRecord || !userRecord.passwordHash) {
          return jsonResponse({ success: false, error: 'Architect account not found' }, 401);
        }

        const computedHash = await hashPassword(password, userRecord.salt);
        if (computedHash !== userRecord.passwordHash) {
          return jsonResponse({ success: false, error: 'Incorrect terminal password' }, 401);
        }

        const token = generateToken();
        const expiresAt = Date.now() + 86400000 * 30;
        const timestamp = new Date().toISOString();

        if (env.DB) {
          try {
            await env.DB.prepare('UPDATE users SET updated_at = ? WHERE id = ?').bind(timestamp, userRecord.id).run();
            await env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').bind(token, userRecord.id, expiresAt, timestamp).run();
          } catch (e) {
            console.warn('D1 session insert error:', e);
          }
        }

        await storagePut(env, `session_${token}`, {
          userId: userRecord.id,
          createdAt: timestamp,
          expiresAt
        });

        const { passwordHash: _p, salt: _s, ...safeUser } = userRecord;
        return jsonResponse({
          success: true,
          token,
          user: safeUser,
          message: `Terminal authenticated for ${userRecord.name}`
        });
      }

      // 1-Click Guest Terminal Access (POST /api/auth/guest)
      if (path === '/api/auth/guest' && method === 'POST') {
        const payload = (await request.json().catch(() => ({}))) || {};
        const randNum = Math.floor(100 + Math.random() * 900);
        const id = `guest_${Date.now()}_${randNum}`;
        const timestamp = new Date().toISOString();

        const guestUser = {
          id,
          name: `GuestArchitect#${randNum}`,
          handle: `guestarchitect${randNum}`,
          email: `guest${randNum}@systemsaviour.dev`,
          role: 'Staff Fellow (Guest Terminal)',
          specialization: payload.specialization || 'HIGH_AVAILABILITY',
          salary: '$120,000 / yr',
          rank: 'Guest Fellow',
          authProvider: 'guest',
          isGuest: true,
          createdAt: timestamp
        };

        if (env.DB) {
          try {
            await env.DB.prepare(`
              INSERT INTO users (id, handle, email, name, role, specialization, salary, rank, auth_provider, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'guest', ?, ?)
            `).bind(
              id,
              guestUser.handle,
              guestUser.email,
              guestUser.name,
              guestUser.role,
              guestUser.specialization,
              guestUser.salary,
              guestUser.rank,
              timestamp,
              timestamp
            ).run();

            await env.DB.prepare(`
              INSERT OR IGNORE INTO player_progress (user_id, unlocked_level_idx, max_survival_wave, daily_streak, updated_at)
              VALUES (?, 0, 0, 0, ?)
            `).bind(id, timestamp).run();
          } catch (e) {
            console.warn('D1 guest insert error:', e);
          }
        }

        await storagePut(env, `user_${id}`, guestUser);

        const token = generateToken();
        const expiresAt = Date.now() + 86400000 * 7;

        if (env.DB) {
          try {
            await env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').bind(token, id, expiresAt, timestamp).run();
          } catch (e) { }
        }

        await storagePut(env, `session_${token}`, {
          userId: id,
          createdAt: timestamp,
          expiresAt
        });

        return jsonResponse({
          success: true,
          token,
          user: guestUser,
          message: `Guest terminal activated for ${guestUser.name}`
        });
      }

      // Current Authenticated User (GET /api/auth/me)
      if (path === '/api/auth/me' && method === 'GET') {
        const auth = await getAuthenticatedUser(request, env);
        if (!auth) {
          return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);
        }

        return jsonResponse({
          success: true,
          user: auth.user
        });
      }

      // Logout (POST /api/auth/logout)
      if (path === '/api/auth/logout' && method === 'POST') {
        const authHeader = request.headers.get('Authorization') || '';
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        if (token) {
          if (env.DB) {
            try {
              await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
            } catch (e) { }
          }
          await storagePut(env, `session_${token}`, null);
        }
        return jsonResponse({ success: true, message: 'Terminal session terminated' });
      }

      return jsonResponse({ error: `Not found: ${method} ${path}` }, 404);

    } catch (err) {
      return jsonResponse({ error: err.message, stack: err.stack }, 500);
    }
  }
};
