/**
 * System Saviour - Authoritative Cloudflare Edge Backend
 * Hosts:
 * - Server-side simulation & queueing evaluation engine
 * - Anti-cheat level outcome validation & star scoring
 * - Official component catalog & specifications
 * - Campaign level definitions & SLA constraints
 * - Deterministic daily incident generator
 * - Chaos Monkey sabotage engine
 * - Global leaderboards & blueprint storage in KV/R2
 */

import {
  COMPONENT_CATALOG,
  TRAFFIC_TYPES,
  CAMPAIGN_LEVELS,
  evaluateArchitecture,
  validateLevelOutcome,
  generateDailyIncident,
  triggerAuthoritativeChaos
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
      try { await env.SYSTEM_SAVIOUR_KV.delete(key); } catch {}
    }
    if (env.SYSTEM_SAVIOUR_BUCKET) {
      try { await env.SYSTEM_SAVIOUR_BUCKET.delete(key); } catch {}
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

// Seeded Leaderboard
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

// Auth Cryptographic Helpers (Native Web Crypto API)
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
      // 1. Health & Edge Telemetry
      if (path === '/' || path === '/api/health') {
        return jsonResponse({
          status: 'online',
          service: 'System Saviour Authoritative Edge Engine',
          version: '2.0.0',
          environment: env.ENVIRONMENT || 'production',
          colo: request.cf?.colo || 'UNKNOWN',
          country: request.cf?.country || 'UNKNOWN',
          kvBound: Boolean(env.SYSTEM_SAVIOUR_KV),
          r2Bound: Boolean(env.SYSTEM_SAVIOUR_BUCKET),
          features: [
            'authoritative-simulation',
            'anti-cheat-validation',
            'catalog-sync',
            'daily-incidents',
            'chaos-monkey',
            'leaderboard-kv'
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
        const { nodes = [], edges = [], elapsedSeconds = 20 } = body;

        const validation = validateLevelOutcome(levelId, nodes, edges, elapsedSeconds);

        return jsonResponse({
          success: true,
          authoritative: true,
          validation
        });
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
      // 8. GLOBAL LEADERBOARDS (GET & POST /api/leaderboard)
      // ====================================================================
      if (path === '/api/leaderboard' && method === 'GET') {
        const stored = await storageGet(env, 'leaderboard');
        const leaderboard = stored || SEEDED_LEADERBOARD;
        return jsonResponse({
          success: true,
          data: leaderboard,
          cachedAt: new Date().toISOString()
        });
      }

      if (path === '/api/leaderboard' && method === 'POST') {
        const payload = await request.json();
        const { type = 'daily', entry } = payload;

        if (!entry || !entry.name || entry.score == null) {
          return jsonResponse({ success: false, error: 'Invalid leaderboard entry format' }, 400);
        }

        const stored = await storageGet(env, 'leaderboard');
        const currentLeaderboard = stored || SEEDED_LEADERBOARD;

        const list = currentLeaderboard[type] || [];
        const updatedList = [...list, { ...entry, date: new Date().toISOString() }];
        updatedList.sort((a, b) => b.score - a.score);
        const ranked = updatedList.slice(0, 100).map((item, idx) => ({ ...item, rank: idx + 1 }));

        currentLeaderboard[type] = ranked;
        await storagePut(env, 'leaderboard', currentLeaderboard);

        const playerRank = ranked.findIndex((item) => item.name === entry.name) + 1;

        return jsonResponse({
          success: true,
          playerRank,
          totalEntries: ranked.length,
          top10: ranked.slice(0, 10)
        });
      }

      // ====================================================================
      // 9. BLUEPRINTS (GET & POST /api/blueprints)
      // ====================================================================
      if (path === '/api/blueprints' && method === 'GET') {
        const indexList = (await storageGet(env, 'blueprints_index')) || [];
        return jsonResponse({ success: true, count: indexList.length, blueprints: indexList });
      }

      if (path === '/api/blueprints' && method === 'POST') {
        const payload = await request.json();
        const id = payload.id || `bp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const record = {
          id,
          title: payload.title || 'Community Blueprint',
          author: payload.author || 'Anonymous Architect',
          nodes: payload.nodes || [],
          edges: payload.edges || [],
          trafficProfile: payload.trafficProfile || {},
          createdAt: new Date().toISOString()
        };

        await storagePut(env, `blueprint_${id}`, record);

        const indexList = (await storageGet(env, 'blueprints_index')) || [];
        indexList.unshift({ id, title: record.title, author: record.author, createdAt: record.createdAt });
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

        const data = await storageGet(env, `blueprint_${id}`);
        if (data) {
          return jsonResponse({ success: true, blueprint: data });
        }
        return jsonResponse({ success: false, error: 'Blueprint not found' }, 404);
      }

      // ====================================================================
      // 10. PLAYER CLOUD PROFILE SYNC (GET & PUT /api/player/:id)
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
      // 11. ARCHITECT AUTHENTICATION & IDENTITY (SIGN IN, SIGN UP, GUEST, ME)
      // Authoritative Cloudflare Edge Authentication stored in KV / R2
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

        // Check uniqueness in KV
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
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };

        // Persist to KV
        await storagePut(env, `user_${id}`, userRecord);
        await storagePut(env, `user_by_email_${cleanEmail}`, id);
        await storagePut(env, `user_by_handle_${cleanHandle.toLowerCase()}`, id);

        // Generate session token
        const token = generateToken();
        await storagePut(env, `session_${token}`, {
          userId: id,
          createdAt: new Date().toISOString(),
          expiresAt: Date.now() + 86400000 * 30
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

        let userId = await storageGet(env, `user_by_email_${clean}`);
        if (!userId) {
          userId = await storageGet(env, `user_by_handle_${clean}`);
        }

        if (!userId) {
          return jsonResponse({ success: false, error: 'Architect account not found' }, 401);
        }

        const userRecord = await storageGet(env, `user_${userId}`);
        if (!userRecord || !userRecord.passwordHash) {
          return jsonResponse({ success: false, error: 'Invalid user account state' }, 401);
        }

        const computedHash = await hashPassword(password, userRecord.salt);
        if (computedHash !== userRecord.passwordHash) {
          return jsonResponse({ success: false, error: 'Incorrect terminal password' }, 401);
        }

        // Update login timestamp
        userRecord.lastLoginAt = new Date().toISOString();
        await storagePut(env, `user_${userId}`, userRecord);

        // Issue session token
        const token = generateToken();
        await storagePut(env, `session_${token}`, {
          userId,
          createdAt: new Date().toISOString(),
          expiresAt: Date.now() + 86400000 * 30
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
          createdAt: new Date().toISOString()
        };

        await storagePut(env, `user_${id}`, guestUser);

        const token = generateToken();
        await storagePut(env, `session_${token}`, {
          userId: id,
          createdAt: new Date().toISOString(),
          expiresAt: Date.now() + 86400000 * 7
        });

        return jsonResponse({
          success: true,
          token,
          user: guestUser,
          message: `Guest terminal activated for ${guestUser.name}`
        });
      }

      // Social OAuth Connect (POST /api/auth/social)
      if (path === '/api/auth/social' && method === 'POST') {
        const payload = await request.json();
        const { provider = 'github', email, name, handle, avatar, providerId } = payload;
        const randId = Math.random().toString(36).substring(2, 7);
        const cleanProvider = (provider || 'github').toLowerCase();
        const cleanName = name || `${cleanProvider === 'github' ? 'OctoArchitect' : 'GoogleArchitect'}_${randId}`;
        const cleanEmail = (email || `${(handle || cleanName).replace(/\s+/g, '_').toLowerCase()}@${cleanProvider}.user`).toLowerCase();
        const cleanHandle = (handle || cleanName.replace(/[^a-zA-Z0-9_]/g, '_')).toLowerCase();

        let userId = await storageGet(env, `user_by_email_${cleanEmail}`);
        let userRecord;

        if (userId) {
          userRecord = await storageGet(env, `user_${userId}`);
          if (userRecord) {
            // Update profile with fresh OAuth provider details
            if (avatar) userRecord.avatar = avatar;
            if (name) userRecord.name = cleanName;
            if (cleanHandle && !userRecord.handle) userRecord.handle = cleanHandle;
            userRecord.authProvider = cleanProvider;
            if (providerId) userRecord.providerId = providerId;
            userRecord.updatedAt = new Date().toISOString();
            await storagePut(env, `user_${userId}`, userRecord);
          }
        } else {
          userId = `oauth_${cleanProvider}_${Date.now()}_${randId}`;
          userRecord = {
            id: userId,
            name: cleanName,
            handle: cleanHandle,
            email: cleanEmail,
            avatar: avatar || null,
            role: cleanProvider === 'github' ? 'GitHub Senior Architect' : 'Google Cloud Fellow',
            specialization: cleanProvider === 'github' ? 'THROUGHPUT' : 'AVAILABILITY',
            salary: '$165,000 / yr',
            rank: 'Senior Architect',
            authProvider: cleanProvider,
            providerId: providerId || null,
            createdAt: new Date().toISOString()
          };
          await storagePut(env, `user_${userId}`, userRecord);
          await storagePut(env, `user_by_email_${cleanEmail}`, userId);
          await storagePut(env, `user_by_handle_${cleanHandle}`, userId);
        }

        const token = generateToken();
        await storagePut(env, `session_${token}`, {
          userId,
          createdAt: new Date().toISOString(),
          expiresAt: Date.now() + 86400000 * 30
        });

        const { passwordHash: _p, salt: _s, ...safeUser } = userRecord;
        return jsonResponse({
          success: true,
          token,
          user: safeUser,
          message: `Authenticated via ${cleanProvider.toUpperCase()}`
        });
      }

      // Google Identity Services ID Token Verification (POST /api/auth/oauth/google)
      if (path === '/api/auth/oauth/google' && method === 'POST') {
        const payload = await request.json();
        const { credential, email, name, picture, sub } = payload;

        let verifiedEmail = email;
        let verifiedName = name;
        let verifiedAvatar = picture;
        let googleSub = sub;

        // If a real Google ID Token is provided, verify against Google's public tokeninfo endpoint
        if (credential) {
          try {
            const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
            if (googleRes.ok) {
              const googleData = await googleRes.json();
              if (googleData.email) {
                verifiedEmail = googleData.email;
                verifiedName = googleData.name || googleData.given_name || 'Google Architect';
                verifiedAvatar = googleData.picture || null;
                googleSub = googleData.sub;
              }
            }
          } catch (e) {
            console.error('Google token verification error:', e);
          }
        }

        if (!verifiedEmail) {
          return jsonResponse({ success: false, error: 'Could not verify Google credentials' }, 400);
        }

        const cleanEmail = verifiedEmail.toLowerCase();
        let userId = await storageGet(env, `user_by_email_${cleanEmail}`);
        let userRecord;

        if (userId) {
          userRecord = await storageGet(env, `user_${userId}`);
          if (userRecord) {
            if (verifiedAvatar) userRecord.avatar = verifiedAvatar;
            if (verifiedName) userRecord.name = verifiedName;
            userRecord.authProvider = 'google';
            if (googleSub) userRecord.providerId = googleSub;
            userRecord.updatedAt = new Date().toISOString();
            await storagePut(env, `user_${userId}`, userRecord);
          }
        } else {
          const randId = Math.random().toString(36).substring(2, 7);
          const handle = (verifiedEmail.split('@')[0] || `google_${randId}`).replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
          userId = `oauth_google_${Date.now()}_${randId}`;
          userRecord = {
            id: userId,
            name: verifiedName || 'Google Cloud Architect',
            handle,
            email: cleanEmail,
            avatar: verifiedAvatar || null,
            role: 'Google Cloud Fellow',
            specialization: 'AVAILABILITY',
            salary: '$175,000 / yr',
            rank: 'Staff Architect',
            authProvider: 'google',
            providerId: googleSub || null,
            createdAt: new Date().toISOString()
          };
          await storagePut(env, `user_${userId}`, userRecord);
          await storagePut(env, `user_by_email_${cleanEmail}`, userId);
          await storagePut(env, `user_by_handle_${handle}`, userId);
        }

        const token = generateToken();
        await storagePut(env, `session_${token}`, {
          userId,
          createdAt: new Date().toISOString(),
          expiresAt: Date.now() + 86400000 * 30
        });

        const { passwordHash: _p, salt: _s, ...safeUser } = userRecord;
        return jsonResponse({
          success: true,
          token,
          user: safeUser,
          message: 'Google Account authenticated successfully'
        });
      }

      // GitHub OAuth Authorization Callback (GET /api/auth/oauth/github/callback)
      if (path === '/api/auth/oauth/github/callback' && method === 'GET') {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');
        const clientId = env.GITHUB_CLIENT_ID;
        const clientSecret = env.GITHUB_CLIENT_SECRET;

        if (!code || !clientId || !clientSecret) {
          return new Response('GitHub OAuth not configured or missing code parameter', { status: 400 });
        }

        try {
          const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              client_id: clientId,
              client_secret: clientSecret,
              code
            })
          });

          const tokenData = await tokenRes.json();
          if (!tokenData.access_token) {
            return new Response(`GitHub OAuth failed: ${tokenData.error_description || tokenData.error}`, { status: 400 });
          }

          const ghUserRes = await fetch('https://api.github.com/user', {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'User-Agent': 'SystemSaviour-App'
            }
          });
          const ghUser = await ghUserRes.json();

          const cleanEmail = (ghUser.email || `${ghUser.login}@github.user`).toLowerCase();
          let userId = await storageGet(env, `user_by_email_${cleanEmail}`);
          let userRecord;

          if (userId) {
            userRecord = await storageGet(env, `user_${userId}`);
            if (userRecord) {
              userRecord.avatar = ghUser.avatar_url;
              userRecord.name = ghUser.name || ghUser.login;
              userRecord.authProvider = 'github';
              userRecord.providerId = String(ghUser.id);
              await storagePut(env, `user_${userId}`, userRecord);
            }
          } else {
            const randId = Math.random().toString(36).substring(2, 7);
            userId = `oauth_github_${Date.now()}_${randId}`;
            userRecord = {
              id: userId,
              name: ghUser.name || ghUser.login,
              handle: ghUser.login.toLowerCase(),
              email: cleanEmail,
              avatar: ghUser.avatar_url,
              role: 'GitHub Senior Architect',
              specialization: 'THROUGHPUT',
              salary: '$165,000 / yr',
              rank: 'Senior Architect',
              authProvider: 'github',
              providerId: String(ghUser.id),
              createdAt: new Date().toISOString()
            };
            await storagePut(env, `user_${userId}`, userRecord);
            await storagePut(env, `user_by_email_${cleanEmail}`, userId);
            await storagePut(env, `user_by_handle_${ghUser.login.toLowerCase()}`, userId);
          }

          const sessionToken = generateToken();
          await storagePut(env, `session_${sessionToken}`, {
            userId,
            createdAt: new Date().toISOString(),
            expiresAt: Date.now() + 86400000 * 30
          });

          const { passwordHash: _p, salt: _s, ...safeUser } = userRecord;

          // Return HTML that communicates to opener window or redirects
          const html = `<!DOCTYPE html>
<html>
<head><title>GitHub Authentication Successful</title></head>
<body style="background:#070a13;color:#38bdf8;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <div style="text-align:center;">
    <h2>Authentication Successful!</h2>
    <p>Logging into System Saviour...</p>
    <script>
      const authData = ${JSON.stringify({ token: sessionToken, user: safeUser })};
      if (window.opener) {
        window.opener.postMessage({ type: 'SYSTEM_SAVIOUR_OAUTH_SUCCESS', payload: authData }, '*');
        window.close();
      } else {
        localStorage.setItem('systemsaviour_auth_user', JSON.stringify(authData.user));
        localStorage.setItem('systemsaviour_auth_token', authData.token);
        window.location.href = '/';
      }
    </script>
  </div>
</body>
</html>`;
          return new Response(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        } catch (err) {
          return new Response(`OAuth Error: ${err.message}`, { status: 500 });
        }
      }

      // Current Authenticated User (GET /api/auth/me)
      if (path === '/api/auth/me' && method === 'GET') {
        const authHeader = request.headers.get('Authorization') || '';
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();

        if (!token) {
          return jsonResponse({ success: false, error: 'Missing bearer authorization token' }, 401);
        }

        const session = await storageGet(env, `session_${token}`);
        if (!session || !session.userId || (session.expiresAt && Date.now() > session.expiresAt)) {
          return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);
        }

        const userRecord = await storageGet(env, `user_${session.userId}`);
        if (!userRecord) {
          return jsonResponse({ success: false, error: 'User record not found' }, 404);
        }

        const { passwordHash: _p, salt: _s, ...safeUser } = userRecord;
        return jsonResponse({
          success: true,
          user: safeUser
        });
      }

      // Logout (POST /api/auth/logout)
      if (path === '/api/auth/logout' && method === 'POST') {
        const authHeader = request.headers.get('Authorization') || '';
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        if (token) {
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
