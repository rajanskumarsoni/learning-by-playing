-- ============================================================================
-- System Saviour - Cloudflare D1 Initial Seed Data
-- ============================================================================

-- 1. Legendary Cloud Architects & Mentors
INSERT OR IGNORE INTO users (id, handle, email, name, role, specialization, salary, rank, auth_provider) VALUES
('usr_jeff', 'jeffdean', 'jeff@google.com', 'Jeff Dean', 'Fellow Architect', 'DISTRIBUTED_SCALE', '$1,000,000 / yr', 'Fellow Architect', 'email'),
('usr_werner', 'waboriginal', 'werner@allthingsdistributed.com', 'Werner Vogels', 'Principal SRE', 'GLOBAL_AVAILABILITY', '$850,000 / yr', 'Distinguished VP', 'email'),
('usr_brendan', 'brendanburns', 'brendan@k8s.io', 'Brendan Burns', 'K8s Guardian', 'CONTAINER_ORCHESTRATION', '$600,000 / yr', 'Chief Architect', 'email'),
('usr_kelsey', 'kelseyhightower', 'kelsey@nocode.io', 'Kelsey Hightower', 'NoCode Sage', 'DEV_OPS', '$550,000 / yr', 'Distinguished Architect', 'email'),
('usr_ada', 'mentor_ada', 'ada@systemsaviour.io', 'Ada (Staff Mentor)', 'Architect Mentor', 'TEACHING_AND_RESILIENCE', '$300,000 / yr', 'Staff Mentor', 'email');

-- 2. Player Progress for Legend Architects
INSERT OR REPLACE INTO player_progress (user_id, unlocked_level_idx, max_survival_wave, daily_streak, last_daily_completed_date, tutorial_completed) VALUES
('usr_jeff', 4, 32, 28, '2026-11-03', 1),
('usr_werner', 4, 26, 21, '2026-11-03', 1),
('usr_brendan', 4, 22, 14, '2026-11-02', 1),
('usr_kelsey', 4, 19, 10, '2026-11-02', 1),
('usr_ada', 4, 18, 7, '2026-11-01', 1);

-- 3. Badges Unlocked for Legends
INSERT OR IGNORE INTO player_badges (user_id, badge_id) VALUES
('usr_jeff', 'first_wire'),
('usr_jeff', 'cache_king'),
('usr_jeff', 'ddos_bastion'),
('usr_jeff', 'kafka_stream'),
('usr_jeff', 'zero_down'),
('usr_jeff', 'staff_plus'),
('usr_jeff', 'chaos_tamer'),
('usr_jeff', 'cost_slasher'),
('usr_werner', 'first_wire'),
('usr_werner', 'cache_king'),
('usr_werner', 'ddos_bastion'),
('usr_werner', 'zero_down'),
('usr_brendan', 'first_wire'),
('usr_brendan', 'kafka_stream'),
('usr_brendan', 'chaos_tamer'),
('usr_kelsey', 'first_wire'),
('usr_kelsey', 'cost_slasher'),
('usr_ada', 'first_wire'),
('usr_ada', 'cache_king');

-- 4. Iconic Community Blueprints
INSERT OR REPLACE INTO blueprints (id, author_id, title, description, nodes_json, edges_json, traffic_profile_json, likes_count, forks_count, is_public) VALUES
(
  'bp-netflix-zuul',
  'usr_werner',
  'Netflix Video Streaming Pipeline',
  'High-throughput Zuul edge proxy routing through multi-tiered caching into stateless microservices.',
  '[{"id":"n1","type":"SOURCE","x":80,"y":220},{"id":"n2","type":"WAF","x":260,"y":220},{"id":"n3","type":"LB","x":440,"y":220},{"id":"n4","type":"WEB","x":620,"y":220,"count":6},{"id":"n5","type":"CACHE","x":800,"y":140,"count":3},{"id":"n6","type":"SQL","x":980,"y":220,"count":2}]',
  '[{"id":"e1","from":"n1","to":"n2"},{"id":"e2","from":"n2","to":"n3"},{"id":"e3","from":"n3","to":"n4"},{"id":"e4","from":"n4","to":"n5"},{"id":"e5","from":"n5","to":"n6"}]',
  '{"READ":0.8,"WRITE":0.1,"STATIC":0.1}',
  142,
  58,
  1
),
(
  'bp-spotify-audio',
  'usr_jeff',
  'Spotify Real-time Audio Distribution',
  'Edge CDN termination delivering sub-10ms audio metadata directly from distributed Cassandra/Redis stores.',
  '[{"id":"s1","type":"SOURCE","x":80,"y":220},{"id":"s2","type":"CDN","x":260,"y":220},{"id":"s3","type":"WEB","x":440,"y":220,"count":4},{"id":"s4","type":"CACHE","x":620,"y":140,"count":4},{"id":"s5","type":"QUEUE","x":620,"y":300,"count":2},{"id":"s6","type":"SQL","x":800,"y":300,"count":2}]',
  '[{"id":"se1","from":"s1","to":"s2"},{"id":"se2","from":"s2","to":"s3"},{"id":"se3","from":"s3","to":"s4"},{"id":"se4","from":"s3","to":"s5"},{"id":"se5","from":"s5","to":"s6"}]',
  '{"STATIC":0.7,"READ":0.2,"WRITE":0.1}',
  210,
  94,
  1
),
(
  'bp-cloudflare-workers',
  'usr_kelsey',
  'Cloudflare Edge WAF & Serverless Mesh',
  'Layer 7 DDoS filtering, edge worker computation, and globally replicated KV caching.',
  '[{"id":"c1","type":"SOURCE","x":80,"y":220},{"id":"c2","type":"WAF","x":260,"y":220,"count":4},{"id":"c3","type":"CDN","x":440,"y":220,"count":3},{"id":"c4","type":"CACHE","x":620,"y":150,"count":4},{"id":"c5","type":"WEB","x":620,"y":290,"count":4}]',
  '[{"id":"ce1","from":"c1","to":"c2"},{"id":"ce2","from":"c2","to":"c3"},{"id":"ce3","from":"c3","to":"c4"},{"id":"ce4","from":"c3","to":"c5"}]',
  '{"STATIC":0.5,"READ":0.4,"BOT":0.1}',
  188,
  81,
  1
);

-- 5. Authoritative Daily Incident Leaderboard Entries
INSERT OR REPLACE INTO leaderboard_entries (id, user_id, leaderboard_type, day_number, score, p99_latency_ms, uptime_pct, nodes_count, verified) VALUES
('lb_daily_1', 'usr_jeff', 'daily', 667, 9940, 18.2, 99.99, 6, 1),
('lb_daily_2', 'usr_werner', 'daily', 667, 9810, 24.1, 99.98, 7, 1),
('lb_daily_3', 'usr_brendan', 'daily', 667, 9750, 31.0, 99.95, 6, 1),
('lb_daily_4', 'usr_kelsey', 'daily', 667, 9680, 35.5, 99.92, 5, 1),
('lb_daily_5', 'usr_ada', 'daily', 667, 9550, 42.0, 99.90, 5, 1);

-- 6. Authoritative Survival Mode Leaderboard Entries
INSERT OR REPLACE INTO leaderboard_entries (id, user_id, leaderboard_type, score, wave_survived, p99_latency_ms, uptime_pct, nodes_count, verified) VALUES
('lb_surv_1', 'usr_jeff', 'survival', 34200, 18, 19.5, 99.99, 42, 1),
('lb_surv_2', 'usr_werner', 'survival', 28500, 15, 26.3, 99.98, 36, 1),
('lb_surv_3', 'usr_brendan', 'survival', 22100, 12, 33.1, 99.95, 29, 1),
('lb_surv_4', 'usr_kelsey', 'survival', 19800, 11, 38.0, 99.92, 25, 1),
('lb_surv_5', 'usr_ada', 'survival', 17400, 10, 44.5, 99.90, 22, 1);

-- 7. Seed Viral Challenges
INSERT OR REPLACE INTO challenges (id, author_id, author_name, game_mode, level_idx, nodes_json, edges_json, clicks_count, completions_count) VALUES
(
  'c_starter_resilience',
  'usr_ada',
  'Ada (Staff Mentor)',
  'CAMPAIGN',
  0,
  '[{"id":"src","type":"SOURCE","x":60,"y":210,"config":{}},{"id":"web-1","type":"WEB","x":340,"y":210,"config":{"tier":0}},{"id":"sql-1","type":"SQL","x":640,"y":210,"config":{"scaling":0}}]',
  '[{"id":"e1","from":"src","to":"web-1"},{"id":"e2","from":"web-1","to":"sql-1"}]',
  152,
  49
),
(
  'c_netflix_benchmark',
  'usr_werner',
  'Werner Vogels',
  'SANDBOX',
  2,
  '[{"id":"src","type":"SOURCE","x":60,"y":220,"config":{}},{"id":"cdn-1","type":"CDN","x":260,"y":120,"config":{"hitRatio":1}},{"id":"waf-1","type":"WAF","x":260,"y":320,"config":{"mode":1}},{"id":"lb-1","type":"LB","x":470,"y":220,"config":{"algorithm":1}},{"id":"web-1","type":"WEB","x":680,"y":120,"config":{"tier":1}},{"id":"cache-1","type":"CACHE","x":900,"y":120,"config":{"eviction":1}}]',
  '[{"id":"e1","from":"src","to":"cdn-1"},{"id":"e2","from":"src","to":"waf-1"},{"id":"e3","from":"cdn-1","to":"lb-1"},{"id":"e4","from":"waf-1","to":"lb-1"},{"id":"e5","from":"lb-1","to":"web-1"},{"id":"e6","from":"web-1","to":"cache-1"}]',
  318,
  112
);

