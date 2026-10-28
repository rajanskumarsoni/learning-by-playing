/**
 * System Saviour - Cloudflare Worker Backend
 * Serves Global Leaderboards, Shared Blueprints, and Cloud Sync via Cloudflare R2
 */

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

// Fallback in-memory / seeded records if R2 bucket is initializing
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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    // Handle Preflight CORS Requests
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }

    const path = url.pathname;

    try {
      // 1. Health & Server Telemetry
      if (path === '/' || path === '/api/health') {
        return jsonResponse({
          status: 'online',
          service: 'System Saviour Cloudflare Edge API',
          version: '1.0.0',
          environment: env.ENVIRONMENT || 'production',
          colo: request.cf?.colo || 'UNKNOWN',
          country: request.cf?.country || 'UNKNOWN',
          r2Bound: Boolean(env.SYSTEM_SAVIOUR_BUCKET),
          timestamp: new Date().toISOString()
        });
      }

      // 2. Leaderboard: GET /api/leaderboard
      if (path === '/api/leaderboard' && method === 'GET') {
        let leaderboard = SEEDED_LEADERBOARD;
        if (env.SYSTEM_SAVIOUR_BUCKET) {
          const obj = await env.SYSTEM_SAVIOUR_BUCKET.get('leaderboard.json');
          if (obj) {
            leaderboard = await obj.json();
          }
        }
        return jsonResponse({
          success: true,
          data: leaderboard,
          cachedAt: new Date().toISOString()
        });
      }

      // 3. Leaderboard: POST /api/leaderboard
      if (path === '/api/leaderboard' && method === 'POST') {
        const payload = await request.json();
        const { type = 'daily', entry } = payload;

        if (!entry || !entry.name || entry.score == null) {
          return jsonResponse({ success: false, error: 'Invalid leaderboard entry format' }, 400);
        }

        let currentLeaderboard = SEEDED_LEADERBOARD;
        if (env.SYSTEM_SAVIOUR_BUCKET) {
          const obj = await env.SYSTEM_SAVIOUR_BUCKET.get('leaderboard.json');
          if (obj) {
            currentLeaderboard = await obj.json();
          }
        }

        const list = currentLeaderboard[type] || [];
        const updatedList = [...list, { ...entry, date: new Date().toISOString() }];
        // Sort descending by score
        updatedList.sort((a, b) => b.score - a.score);
        // Re-index ranks
        const ranked = updatedList.slice(0, 100).map((item, idx) => ({ ...item, rank: idx + 1 }));

        currentLeaderboard[type] = ranked;

        if (env.SYSTEM_SAVIOUR_BUCKET) {
          await env.SYSTEM_SAVIOUR_BUCKET.put('leaderboard.json', JSON.stringify(currentLeaderboard), {
            httpMetadata: { contentType: 'application/json' }
          });
        }

        const playerRank = ranked.findIndex((item) => item.name === entry.name) + 1;

        return jsonResponse({
          success: true,
          playerRank,
          totalEntries: ranked.length,
          top10: ranked.slice(0, 10)
        });
      }

      // 4. Blueprints: GET /api/blueprints
      if (path === '/api/blueprints' && method === 'GET') {
        let blueprints = [];
        if (env.SYSTEM_SAVIOUR_BUCKET) {
          const listed = await env.SYSTEM_SAVIOUR_BUCKET.list({ prefix: 'blueprints/' });
          for (const key of listed.objects.slice(0, 20)) {
            const obj = await env.SYSTEM_SAVIOUR_BUCKET.get(key.key);
            if (obj) {
              const data = await obj.json();
              blueprints.push({ id: key.key.replace('blueprints/', '').replace('.json', ''), ...data });
            }
          }
        }
        return jsonResponse({ success: true, count: blueprints.length, blueprints });
      }

      // 5. Blueprints: POST /api/blueprints
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

        if (env.SYSTEM_SAVIOUR_BUCKET) {
          await env.SYSTEM_SAVIOUR_BUCKET.put(`blueprints/${id}.json`, JSON.stringify(record), {
            httpMetadata: { contentType: 'application/json' }
          });
        }

        return jsonResponse({
          success: true,
          id,
          url: `${url.origin}/api/blueprints/${id}`,
          message: 'Blueprint saved to Cloudflare R2'
        });
      }

      // 6. Blueprints: GET /api/blueprints/:id
      if (path.startsWith('/api/blueprints/') && method === 'GET') {
        const id = path.replace('/api/blueprints/', '');
        if (!id) return jsonResponse({ error: 'Missing blueprint ID' }, 400);

        if (env.SYSTEM_SAVIOUR_BUCKET) {
          const obj = await env.SYSTEM_SAVIOUR_BUCKET.get(`blueprints/${id}.json`);
          if (obj) {
            const data = await obj.json();
            return jsonResponse({ success: true, blueprint: data });
          }
        }

        return jsonResponse({ success: false, error: 'Blueprint not found' }, 404);
      }

      // 7. Player Cloud Sync: GET /api/player/:id
      if (path.startsWith('/api/player/') && method === 'GET') {
        const playerId = path.replace('/api/player/', '');
        if (env.SYSTEM_SAVIOUR_BUCKET) {
          const obj = await env.SYSTEM_SAVIOUR_BUCKET.get(`players/${playerId}.json`);
          if (obj) {
            const profile = await obj.json();
            return jsonResponse({ success: true, profile });
          }
        }
        return jsonResponse({ success: false, message: 'New player profile' }, 404);
      }

      // 8. Player Cloud Sync: PUT /api/player/:id
      if (path.startsWith('/api/player/') && method === 'PUT') {
        const playerId = path.replace('/api/player/', '');
        const profile = await request.json();
        profile.updatedAt = new Date().toISOString();

        if (env.SYSTEM_SAVIOUR_BUCKET) {
          await env.SYSTEM_SAVIOUR_BUCKET.put(`players/${playerId}.json`, JSON.stringify(profile), {
            httpMetadata: { contentType: 'application/json' }
          });
        }

        return jsonResponse({ success: true, message: 'Player cloud profile synced to Cloudflare R2' });
      }

      // 404 Not Found
      return jsonResponse({ error: `Not found: ${method} ${path}` }, 404);

    } catch (err) {
      return jsonResponse({ error: err.message, stack: err.stack }, 500);
    }
  }
};
