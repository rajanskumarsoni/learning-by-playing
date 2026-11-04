/**
 * System Saviour - Authoritative Cloudflare Edge Game & Business Logic Engine
 * Houses all simulation math, queueing theory formulas, SLA metrics,
 * level rules, component catalog, star ratings, and anti-cheat validation.
 */

// ============================================================================
// 1. TRAFFIC TYPES
// ============================================================================
export const TRAFFIC_TYPES = {
  STATIC: {
    id: 'STATIC',
    name: 'Static Media & Assets',
    color: '#22c55e',
    emoji: '🖼️',
    description: 'Images, CSS, and video chunks. Best offloaded at edge via CDN or S3.'
  },
  READ: {
    id: 'READ',
    name: 'Database Reads (SELECT)',
    color: '#38bdf8',
    emoji: '📖',
    description: 'User feeds, profiles, and catalog queries. Cacheable in Redis or Read Replicas.'
  },
  WRITE: {
    id: 'WRITE',
    name: 'Persistent Writes (INSERT/TX)',
    color: '#f97316',
    emoji: '✍️',
    description: 'Orders, payments, and state mutations. Buffered via Kafka and written to ACID DB.'
  },
  SEARCH: {
    id: 'SEARCH',
    name: 'Full-Text Search Queries',
    color: '#06b6d4',
    emoji: '🔍',
    description: 'Fuzzy searches & filters. Fast on Elasticsearch; heavy penalty on SQL.'
  },
  BOT: {
    id: 'BOT',
    name: 'Malicious DDoS & Bots',
    color: '#ef4444',
    emoji: '👾',
    description: 'Abusive crawler spikes & volumetric attacks. Must be blocked at edge by WAF.'
  },
  AI_PROMPT: {
    id: 'AI_PROMPT',
    name: 'LLM & AI RAG Inference',
    color: '#d946ef',
    emoji: '🤖',
    description: 'Vector embeddings and prompt generation. Requires GPU clusters & Vector DB.'
  }
};

// ============================================================================
// 2. COMPONENT CATALOG SPECIFICATIONS
// ============================================================================
export const COMPONENT_CATALOG = {
  SOURCE: {
    type: 'SOURCE',
    name: 'Internet Ingress',
    category: 'Edge',
    iconName: 'Globe',
    baseCost: 0,
    baseCapacity: 100000,
    baseLatency: 5,
    description: 'Client traffic ingress generating live request streams.',
    isRemovable: false,
    beginnerTip: 'The front door of your cloud! All user requests enter here.',
    analogyTitle: 'The Stadium Turnstiles',
    analogyStory: 'Think of Internet Ingress like the front gates and ticket turnstiles of a 100,000-seat stadium.',
    caseStudyCompany: 'Cloudflare & Akamai',
    caseStudyStory: 'Global Anycast DNS networks route billions of users to the nearest physical data center (PoP) in over 300 cities worldwide.',
    architectureTips: 'Always placed as origin source. Cannot be removed.'
  },
  WAF: {
    type: 'WAF',
    name: 'WAF & Rate Limiter',
    category: 'Edge',
    iconName: 'Shield',
    baseCost: 45,
    baseCapacity: 25000,
    baseLatency: 4,
    description: 'Inspects L7 traffic. Filters 98% of malicious DDoS bots and rate-limits abusive spikes.',
    beginnerTip: 'Like the security bouncer at the gate checking IDs to keep pranksters and attackers out.',
    analogyTitle: 'The Nightclub Bouncer with a Metal Detector',
    analogyStory: 'Checks every incoming request against a blacklist of bad behavior and turns malicious traffic away immediately.',
    caseStudyCompany: 'Cloudflare / AWS WAF',
    caseStudyStory: 'In 2022, Cloudflare mitigated a record-breaking 26M RPS HTTPS DDoS attack targeting a customer portal.',
    architectureTips: 'Position immediately after Internet Ingress. Blocking bad packets early prevents expensive downstream saturation.',
    configOptions: {
      mode: { label: 'Protection Shield', values: ['Standard Rate Limit', 'AI Deep Inspection (+40% Cost)'], costMult: [1, 1.4] }
    }
  },
  CDN: {
    type: 'CDN',
    name: 'Cloud CDN Edge',
    category: 'Edge',
    iconName: 'Zap',
    baseCost: 55,
    baseCapacity: 30000,
    baseLatency: 6,
    description: 'Edge cache terminating 95% of Static Media and 65-80% of Read requests at ultra-low 6ms latency.',
    beginnerTip: 'Like posting popular flyers on the school bulletin board so everyone does not have to ask the office.',
    analogyTitle: 'The Neighborhood Convenience Store (7-Eleven)',
    analogyStory: 'Instead of driving 40 miles to a distant dairy farm, 7-Eleven keeps milk in stock right down your street.',
    caseStudyCompany: 'Netflix Open Connect',
    caseStudyStory: 'Netflix built Open Connect, deploying custom storage appliances inside thousands of local ISPs worldwide.',
    architectureTips: 'Place between Internet Ingress and Load Balancer. Handles 95% of static assets and up to 80% of reads.',
    configOptions: {
      hitRatio: { label: 'Edge Cache Policy', values: ['Standard (65% Read Hit)', 'Aggressive Edge (80% Read Hit)'], hitRate: [0.65, 0.80], costMult: [1, 1.35] }
    }
  },
  LB: {
    type: 'LB',
    name: 'Load Balancer',
    category: 'Routing',
    iconName: 'Network',
    baseCost: 45,
    baseCapacity: 30000,
    baseLatency: 5,
    description: 'Distributes traffic evenly across downstream compute servers with health checks.',
    beginnerTip: 'Like a smart traffic cop directing cars into multiple lanes so no single lane jams up.',
    analogyTitle: 'The Airport Security Line Coordinator',
    analogyStory: 'When 2,000 travelers arrive at airport security, a coordinator directs travelers to whichever line is shortest.',
    caseStudyCompany: 'Uber Reverse Proxy & Envoy Mesh',
    caseStudyStory: 'Uber processes millions of rider/driver GPS heartbeats per second using Envoy load balancers.',
    architectureTips: 'Position upstream of API/Web Servers. Wiring 2+ servers behind an LB eliminates single points of failure.',
    configOptions: {
      algorithm: { label: 'Routing Algorithm', values: ['Round Robin (1x)', 'Least Connections (+10% Cost)'], costMult: [1, 1.1] }
    }
  },
  WEB: {
    type: 'WEB',
    name: 'API / Web Server',
    category: 'Compute',
    iconName: 'Server',
    baseCost: 60,
    baseCapacity: 2400,
    baseLatency: 18,
    description: 'Stateless compute instances running business logic and routing downstream queries.',
    beginnerTip: 'The waiters in a restaurant taking customer orders and communicating with the kitchen.',
    analogyTitle: 'The Restaurant Waitstaff',
    analogyStory: 'Waiters do not cook the steaks and do not store ingredients. They parse menu orders and pass requests to the kitchen.',
    caseStudyCompany: 'Discord Kubernetes Fleet',
    caseStudyStory: 'Discord runs stateless Elixir & Rust microservices across tens of thousands of container pods.',
    architectureTips: 'Keep servers stateless. Connect downstream to Caches, Databases, Queues, and Search clusters.',
    configOptions: {
      tier: { label: 'Instance Size', values: ['t3.medium (1x)', 'c6i.xlarge (2.5x)', 'c6i.4xlarge (5x)'], capMult: [1, 2.5, 5], costMult: [1, 2.1, 4.0] }
    }
  },
  CACHE: {
    type: 'CACHE',
    name: 'Redis Cache Cluster',
    category: 'Data',
    iconName: 'Layers',
    baseCost: 70,
    baseCapacity: 16000,
    baseLatency: 3,
    description: 'In-memory key-value store. Absorbs 75-88% of database Read queries in 3ms.',
    beginnerTip: 'Writing answers on sticky notes on your desk so you answer instantly without opening the encyclopedia.',
    analogyTitle: 'The Sticky Note on Your Computer Monitor',
    analogyStory: 'If your coworker asks for the office WiFi password 30 times a day, you keep it on a sticky note for an instant answer.',
    caseStudyCompany: 'Twitter / X Home Timeline Cache',
    caseStudyStory: 'Twitter stores serialized timeline IDs directly in Redis RAM clusters, serving 99% of read requests under 4ms.',
    architectureTips: 'Place between Web Servers and PostgreSQL (Web -> Cache -> SQL). Absorbs 75-88% of read load.',
    configOptions: {
      eviction: { label: 'Cache Strategy', values: ['Standard LRU (75% Hit)', 'Semantic + LRU (88% Hit)'], hitRate: [0.75, 0.88], costMult: [1, 1.5] }
    }
  },
  QUEUE: {
    type: 'QUEUE',
    name: 'Kafka Message Queue',
    category: 'Async',
    iconName: 'Activity',
    baseCost: 75,
    baseCapacity: 22000,
    baseLatency: 8,
    description: 'Decouples heavy Write bursts! Buffers write spikes by 65% for downstream workers.',
    beginnerTip: 'A numbered ticket dispenser at a busy bakery so customers form an orderly line instead of mobbing the counter.',
    analogyTitle: 'The Delicatessen Numbered Ticket Dispenser',
    analogyStory: 'Each customer takes a numbered ticket and waits calmly while the chef prepares orders sequentially.',
    caseStudyCompany: 'LinkedIn & Uber Event Streams',
    caseStudyStory: 'LinkedIn invented Apache Kafka to handle hundreds of billions of user clicks and analytics events per day.',
    architectureTips: 'Place between Web Servers and Async Workers / Databases for heavy write workflows.',
    configOptions: {
      partitions: { label: 'Broker Partitions', values: ['8 Partitions (1x)', '32 Partitions (2x)'], capMult: [1, 2], costMult: [1, 1.55] }
    }
  },
  WORKER: {
    type: 'WORKER',
    name: 'Async Worker Pool',
    category: 'Compute',
    iconName: 'Cpu',
    baseCost: 65,
    baseCapacity: 4500,
    baseLatency: 15,
    description: 'Consumes jobs from Kafka Queue and writes batches asynchronously to the database.',
    beginnerTip: 'Chefs working quietly in the background processing tickets from the order rack.',
    analogyTitle: 'The Kitchen Prep Cook Team',
    analogyStory: 'Prep cooks focus 100% on chopping vegetables and baking bread in batches.',
    caseStudyCompany: 'Shopify Flash Sale Batching',
    caseStudyStory: 'During Black Friday, background worker pools consume order messages from queues without blocking user checkouts.',
    architectureTips: 'Place downstream of Kafka Message Queue and upstream of SQL Database (Queue -> Worker -> SQL).',
    configOptions: {
      tier: { label: 'Worker Concurrency', values: ['4 Workers (1x)', '12 Workers (2.5x)'], capMult: [1, 2.5], costMult: [1, 2.0] }
    }
  },
  SQL: {
    type: 'SQL',
    name: 'PostgreSQL Database',
    category: 'Data',
    iconName: 'Database',
    baseCost: 95,
    baseCapacity: 1800,
    baseLatency: 28,
    description: 'ACID relational primary database for state persistence. Heavy uncached reads saturate disk I/O.',
    beginnerTip: 'The master hardbound record notebook. Guaranteed not to lose entries, but gets crowded if everyone writes at once.',
    analogyTitle: 'The County Deeds & Land Title Registry',
    analogyStory: 'The land registry holds official deeds in a fireproof vault with strict legal verification.',
    caseStudyCompany: 'Stripe Primary Ledger',
    caseStudyStory: 'Stripe processes hundreds of billions of dollars using PostgreSQL, relying on strict ACID transactions and WAL logs.',
    architectureTips: 'The single source of truth for persistent data. Protect from read saturation with Redis and write stampedes with Kafka.',
    configOptions: {
      scaling: {
        label: 'Topology Mode',
        values: ['Single Master (1x)', '+2 Read Replicas (2.6x)', 'Sharded Cluster (5.5x)'],
        capMult: [1, 2.6, 5.5],
        costMult: [1, 2.1, 3.8],
        latencyMult: [1, 0.85, 0.7]
      }
    }
  },
  SEARCH: {
    type: 'SEARCH',
    name: 'Elasticsearch Cluster',
    category: 'Data',
    iconName: 'Search',
    baseCost: 85,
    baseCapacity: 5000,
    baseLatency: 12,
    description: 'Inverted-index search cluster optimized for fuzzy full-text queries at 12ms.',
    beginnerTip: 'The alphabetized index at the back of a library book, finding topics 10x faster than reading every page.',
    analogyTitle: 'The Back-of-the-Book Subject Index',
    analogyStory: 'Flipping to the alphabetical index in the back tells you "Pages 42, 118, 203" in 2 seconds flat.',
    caseStudyCompany: 'Wikipedia & GitHub Code Search',
    caseStudyStory: 'Wikipedia handles billions of monthly search queries across 60+ million articles using Elasticsearch.',
    architectureTips: 'Connect downstream from Web Servers to offload expensive text searches from PostgreSQL.',
    configOptions: {
      shards: { label: 'Index Sharding', values: ['2 Shards (1x)', '6 Shards + Replica (2.5x)'], capMult: [1, 2.5], costMult: [1, 1.8] }
    }
  },
  STORAGE: {
    type: 'STORAGE',
    name: 'S3 Object Storage',
    category: 'Data',
    iconName: 'Box',
    baseCost: 40,
    baseCapacity: 15000,
    baseLatency: 22,
    description: 'Cost-effective blob vault for static media and uploads that bypass edge CDN.',
    beginnerTip: 'The school basement warehouse storing all old yearbooks and large video recordings.',
    analogyTitle: 'The Shipping Container Storage Yard',
    analogyStory: 'Storing giant boxes of seasonal items in an inexpensive shipping container yard outside town.',
    caseStudyCompany: 'Airbnb Photo Vault on Amazon S3',
    caseStudyStory: 'Airbnb hosts upload millions of photos to S3 for 99.999999999% durability at 1/10th the cost of database SSDs.',
    architectureTips: 'Connect to Web Servers or CDN for blob uploads, static files, and media archives.',
    configOptions: {
      redundancy: { label: 'Storage Tier', values: ['Standard S3 (1x)', 'Multi-AZ Replicated (1.8x)'], capMult: [1, 1.8], costMult: [1, 1.4] }
    }
  },
  VECTOR_AI: {
    type: 'VECTOR_AI',
    name: 'Vector DB + GPU Node',
    category: 'AI / ML',
    iconName: 'Sparkles',
    baseCost: 175,
    baseCapacity: 4500,
    baseLatency: 38,
    description: 'High-throughput embeddings and GPU LLM token generation for AI search queries.',
    beginnerTip: 'The high-tech AI robotics lab answering complex student questions.',
    analogyTitle: 'The University Think Tank Research Professor',
    analogyStory: 'GPU nodes are the deep-thinking Oxford professors synthesizing complex multi-step responses.',
    caseStudyCompany: 'Perplexity & ChatGPT RAG Architecture',
    caseStudyStory: 'Embeds user queries into 1536-dimensional vector spaces and performs cosine similarity search via GPU clusters.',
    architectureTips: 'Position downstream from Web Servers. Combine with Redis semantic caching to avoid redundant LLM calls.',
    configOptions: {
      batching: {
        label: 'Inference Accelerator',
        values: ['Standard vLLM (1x)', 'TensorRT + FP8 Batching (2.5x)'],
        capMult: [1, 2.5],
        costMult: [1, 1.75],
        latencyMult: [1, 0.65]
      }
    }
  }
};

// ============================================================================
// 3. CAMPAIGN SCENARIOS
// ============================================================================
export const CAMPAIGN_LEVELS = [
  {
    id: 1,
    title: 'Level 1: The Garage Startup',
    concept: 'Vertical Scaling & In-Memory Caching',
    brief: 'Your new social app went viral on Hacker News! Traffic is hitting 800 RPS. A single default Web Server and SQL Database will choke under the read load. Upgrade your Web tier or insert a Redis Cache.',
    targetRps: 800,
    trafficMix: { READ: 0.85, WRITE: 0.15, STATIC: 0.0, SEARCH: 0.0, BOT: 0.0, AI_PROMPT: 0.0 },
    maxLatencyMs: 120,
    minUptimePct: 99.0,
    maxBudgetHr: 260,
    allowedComponents: ['WEB', 'CACHE', 'SQL', 'LB'],
    initialNodes: [
      { id: 'src', type: 'SOURCE', x: 60, y: 210, config: {} },
      { id: 'web-1', type: 'WEB', x: 340, y: 210, config: { tier: 0 } },
      { id: 'sql-1', type: 'SQL', x: 640, y: 210, config: { scaling: 0 } }
    ],
    initialEdges: [
      { id: 'e1', from: 'src', to: 'web-1' },
      { id: 'e2', from: 'web-1', to: 'sql-1' }
    ],
    hints: [
      'As SQL load passes 50% capacity, disk I/O queues up exponentially!',
      'Place a Redis Cache between Web Server and PostgreSQL (Web -> Cache -> SQL) to absorb 75% of reads.',
      'Or upgrade your Web Server instance size from t3.medium to c6i.xlarge.'
    ]
  },
  {
    id: 2,
    title: 'Level 2: The Viral Media Post',
    concept: 'Edge Offloading via CDN & Object Storage',
    brief: 'A major influencer shared your video! Traffic spikes to 3,500 RPS with 60% Static Media and 30% DB reads. Your SLA requires sub-80ms P99 latency on a strict $280/hr budget.',
    targetRps: 3500,
    trafficMix: { STATIC: 0.60, READ: 0.30, WRITE: 0.10, SEARCH: 0.0, BOT: 0.0, AI_PROMPT: 0.0 },
    maxLatencyMs: 80,
    minUptimePct: 99.0,
    maxBudgetHr: 290,
    allowedComponents: ['CDN', 'STORAGE', 'LB', 'WEB', 'CACHE', 'SQL'],
    initialNodes: [
      { id: 'src', type: 'SOURCE', x: 50, y: 210, config: {} },
      { id: 'web-1', type: 'WEB', x: 370, y: 210, config: { tier: 0 } },
      { id: 'sql-1', type: 'SQL', x: 670, y: 210, config: { scaling: 0 } }
    ],
    initialEdges: [
      { id: 'e1', from: 'src', to: 'web-1' },
      { id: 'e2', from: 'web-1', to: 'sql-1' }
    ],
    hints: [
      'Insert Cloud CDN Edge between Internet and Web Server (Internet -> CDN -> Web).',
      'The CDN handles 95% of Green Static packets in 6ms, shielding your origin servers.',
      'Watch your budget! Avoid over-provisioning when an edge CDN solves the bottleneck.'
    ]
  },
  {
    id: 3,
    title: 'Level 3: Flash Sale Checkout',
    concept: 'Load Balancing, Horizontal Scale & Read Replicas',
    brief: 'Black Friday sale! 8,000 RPS is arriving with 35% concurrent checkout Writes. Distribute load using a Load Balancer, redundant Web Servers, and upgrade your SQL Database with Read Replicas or Sharding.',
    targetRps: 8000,
    trafficMix: { READ: 0.65, WRITE: 0.35, STATIC: 0.0, SEARCH: 0.0, BOT: 0.0, AI_PROMPT: 0.0 },
    maxLatencyMs: 140,
    minUptimePct: 99.0,
    maxBudgetHr: 580,
    allowedComponents: ['CDN', 'LB', 'WEB', 'CACHE', 'SQL'],
    initialNodes: [
      { id: 'src', type: 'SOURCE', x: 45, y: 220, config: {} },
      { id: 'lb-1', type: 'LB', x: 250, y: 220, config: { algorithm: 0 } },
      { id: 'web-1', type: 'WEB', x: 470, y: 130, config: { tier: 0 } },
      { id: 'sql-1', type: 'SQL', x: 740, y: 220, config: { scaling: 0 } }
    ],
    initialEdges: [
      { id: 'e1', from: 'src', to: 'lb-1' },
      { id: 'e2', from: 'lb-1', to: 'web-1' },
      { id: 'e3', from: 'web-1', to: 'sql-1' }
    ],
    hints: [
      'Add a second Web Server and wire Load Balancer to both Web Servers.',
      'Click the PostgreSQL Database and switch Topology Mode to "+2 Read Replicas" or "Sharded Cluster".',
      'Add a Redis Cache between Web Servers and SQL to intercept the 65% read traffic.'
    ]
  },
  {
    id: 4,
    title: 'Level 4: Stadium Ticket Drop & Bot Attack',
    concept: 'WAF Perimeter Defense, Search Indexes & Kafka Queues',
    brief: 'Stadium concert tickets just dropped! 15,000 RPS hits your site with 15% scalper DDoS bots, 25% search queries, and 35% checkout writes. Block bots at the edge, index searches, and buffer writes via Kafka.',
    targetRps: 15000,
    trafficMix: { BOT: 0.15, WRITE: 0.35, READ: 0.25, SEARCH: 0.25, STATIC: 0.0, AI_PROMPT: 0.0 },
    maxLatencyMs: 170,
    minUptimePct: 99.0,
    maxBudgetHr: 780,
    allowedComponents: ['WAF', 'CDN', 'LB', 'WEB', 'CACHE', 'QUEUE', 'WORKER', 'SQL', 'SEARCH'],
    initialNodes: [
      { id: 'src', type: 'SOURCE', x: 40, y: 220, config: {} },
      { id: 'lb-1', type: 'LB', x: 260, y: 220, config: { algorithm: 0 } },
      { id: 'web-1', type: 'WEB', x: 480, y: 220, config: { tier: 1 } },
      { id: 'sql-1', type: 'SQL', x: 760, y: 220, config: { scaling: 1 } }
    ],
    initialEdges: [
      { id: 'e1', from: 'src', to: 'lb-1' },
      { id: 'e2', from: 'lb-1', to: 'web-1' },
      { id: 'e3', from: 'web-1', to: 'sql-1' }
    ],
    hints: [
      'Place a WAF & Rate Limiter directly after Internet Traffic to eliminate 98% of Red DDoS packets.',
      'Route Web Servers -> Kafka Queue -> Async Worker Pool -> SQL to buffer ticket reservations.',
      'Add an Elasticsearch Cluster connected to Web Servers to answer search queries in 12ms.'
    ]
  },
  {
    id: 5,
    title: 'Level 5: Global AI Search Launch',
    concept: 'Vector DB + GPU Pipeline & Fault-Tolerant Redundancy',
    brief: 'The ultimate distributed challenge! 20,000 RPS global rollout of AI search. Requests require both SQL storage AND Vector DB + GPU LLM inference, while Chaos Monkey randomly drops a server mid-wave!',
    targetRps: 20000,
    trafficMix: { AI_PROMPT: 0.30, READ: 0.30, WRITE: 0.20, SEARCH: 0.10, BOT: 0.10, STATIC: 0.0 },
    maxLatencyMs: 220,
    minUptimePct: 99.0,
    maxBudgetHr: 1350,
    allowedComponents: ['WAF', 'CDN', 'LB', 'WEB', 'CACHE', 'QUEUE', 'WORKER', 'SQL', 'SEARCH', 'STORAGE', 'VECTOR_AI'],
    initialNodes: [
      { id: 'src', type: 'SOURCE', x: 40, y: 230, config: {} },
      { id: 'waf-1', type: 'WAF', x: 190, y: 230, config: { mode: 0 } },
      { id: 'lb-1', type: 'LB', x: 360, y: 230, config: { algorithm: 1 } },
      { id: 'web-1', type: 'WEB', x: 540, y: 140, config: { tier: 1 } },
      { id: 'web-2', type: 'WEB', x: 540, y: 320, config: { tier: 1 } },
      { id: 'sql-1', type: 'SQL', x: 790, y: 230, config: { scaling: 1 } }
    ],
    initialEdges: [
      { id: 'e1', from: 'src', to: 'waf-1' },
      { id: 'e2', from: 'waf-1', to: 'lb-1' },
      { id: 'e3', from: 'lb-1', to: 'web-1' },
      { id: 'e4', from: 'lb-1', to: 'web-2' },
      { id: 'e5', from: 'web-1', to: 'sql-1' },
      { id: 'e6', from: 'web-2', to: 'sql-1' }
    ],
    hints: [
      'You MUST connect at least one Vector DB + GPU Node downstream from your Web Servers.',
      'Have at least 2 (ideally 3) Web Servers behind the Load Balancer so when Chaos Monkey strikes, traffic auto-heals.',
      'Enable TensorRT + FP8 Batching on your GPU Node and Semantic Cache on Redis.'
    ]
  }
];

// ============================================================================
// 4. DETERMINISTIC DAILY INCIDENTS GENERATOR
// ============================================================================
const DAILY_INCIDENT_TEMPLATES = [
  {
    subTitle: 'The Midnight Botnet Wave',
    concept: 'L7 DDoS Scrubbing & Rate Limiting',
    brief: 'An extortionist botnet is flooding your API gateway at 3 AM! 50% of incoming traffic is malicious bot floods, while 35% is legitimate user reads. Filter bad actors at the perimeter without spiking latency.',
    targetRps: 6500,
    trafficMix: { BOT: 0.50, READ: 0.35, WRITE: 0.15, STATIC: 0.0, SEARCH: 0.0, AI_PROMPT: 0.0 },
    maxLatencyMs: 75,
    minUptimePct: 99.0,
    maxBudgetHr: 320,
    allowedComponents: ['WAF', 'CDN', 'LB', 'WEB', 'CACHE', 'SQL']
  },
  {
    subTitle: 'Black Friday Write Stampede',
    concept: 'Write Buffering & Async Decoupling',
    brief: 'The Black Friday doors opened! 9,000 shoppers per second are slamming the checkout cart. Database writes threaten total lock contention. Buffer persistent writes and decouple async workers.',
    targetRps: 9000,
    trafficMix: { WRITE: 0.55, READ: 0.30, STATIC: 0.15, SEARCH: 0.0, BOT: 0.0, AI_PROMPT: 0.0 },
    maxLatencyMs: 90,
    minUptimePct: 98.5,
    maxBudgetHr: 480,
    allowedComponents: ['WAF', 'CDN', 'LB', 'WEB', 'CACHE', 'QUEUE', 'WORKER', 'SQL']
  },
  {
    subTitle: 'Viral Influencer Media Surge',
    concept: 'Global Edge Caching & Origin Protection',
    brief: 'A TikTok video went viral with 15 million views! Heavy video media chunks and thumbnail requests are swamping the cluster. Offload at the edge before compute instances crash.',
    targetRps: 8000,
    trafficMix: { STATIC: 0.65, READ: 0.25, WRITE: 0.10, SEARCH: 0.0, BOT: 0.0, AI_PROMPT: 0.0 },
    maxLatencyMs: 65,
    minUptimePct: 99.2,
    maxBudgetHr: 350,
    allowedComponents: ['CDN', 'STORAGE', 'LB', 'WEB', 'CACHE', 'SQL']
  },
  {
    subTitle: 'The RAG Inference AI Stampede',
    concept: 'GPU Batch Acceleration & Semantic Caching',
    brief: 'A breaking product launch triggered 7,500 RPS of multi-turn AI chat queries! Uncached queries will exhaust GPU VRAM instantly. Pair semantic Redis caching with TensorRT batched inference.',
    targetRps: 7500,
    trafficMix: { AI_PROMPT: 0.45, READ: 0.35, WRITE: 0.15, STATIC: 0.05, SEARCH: 0.0, BOT: 0.0 },
    maxLatencyMs: 140,
    minUptimePct: 99.0,
    maxBudgetHr: 620,
    allowedComponents: ['WAF', 'CDN', 'LB', 'WEB', 'CACHE', 'VECTOR_AI', 'SQL']
  }
];

export function generateDailyIncident(dayOffset = 0) {
  const epoch = new Date('2025-01-01T00:00:00Z').getTime();
  const now = Date.now() + dayOffset * 86400000;
  const dayNumber = Math.max(1, Math.floor((now - epoch) / 86400000));
  const templateIdx = (dayNumber - 1) % DAILY_INCIDENT_TEMPLATES.length;
  const template = DAILY_INCIDENT_TEMPLATES[templateIdx];
  const dateKey = new Date(now).toISOString().split('T')[0];

  return {
    dayNumber,
    dateKey,
    title: `Daily Incident #${dayNumber}: ${template.subTitle}`,
    ...template
  };
}

// ============================================================================
// 5. NODE EFFECTIVE STATS CALCULATION
// ============================================================================
export function getNodeEffectiveStats(node) {
  const spec = COMPONENT_CATALOG[node.type];
  if (!spec) return { cost: 0, capacity: 1000, latency: 10, hitRate: 0 };

  let cost = spec.baseCost;
  let capacity = spec.baseCapacity;
  let latency = spec.baseLatency;
  let hitRate = 0;

  if (node.type === 'CDN') {
    const idx = node.config?.hitRatio || 0;
    hitRate = spec.configOptions.hitRatio.hitRate[idx] || 0.65;
    cost *= spec.configOptions.hitRatio.costMult[idx] || 1;
  } else if (node.type === 'WAF') {
    const idx = node.config?.mode || 0;
    cost *= spec.configOptions.mode.costMult[idx] || 1;
  } else if (node.type === 'LB') {
    const idx = node.config?.algorithm || 0;
    cost *= spec.configOptions.algorithm.costMult[idx] || 1;
  } else if (node.type === 'WEB') {
    const idx = node.config?.tier || 0;
    capacity *= spec.configOptions.tier.capMult[idx] || 1;
    cost *= spec.configOptions.tier.costMult[idx] || 1;
  } else if (node.type === 'CACHE') {
    const idx = node.config?.eviction || 0;
    hitRate = spec.configOptions.eviction.hitRate[idx] || 0.75;
    cost *= spec.configOptions.eviction.costMult[idx] || 1;
  } else if (node.type === 'QUEUE') {
    const idx = node.config?.partitions || 0;
    capacity *= spec.configOptions.partitions.capMult[idx] || 1;
    cost *= spec.configOptions.partitions.costMult[idx] || 1;
  } else if (node.type === 'WORKER') {
    const idx = node.config?.tier || 0;
    capacity *= spec.configOptions.tier.capMult[idx] || 1;
    cost *= spec.configOptions.tier.costMult[idx] || 1;
  } else if (node.type === 'SQL') {
    const idx = node.config?.scaling || 0;
    capacity *= spec.configOptions.scaling.capMult[idx] || 1;
    cost *= spec.configOptions.scaling.costMult[idx] || 1;
    latency *= spec.configOptions.scaling.latencyMult[idx] || 1;
  } else if (node.type === 'SEARCH') {
    const idx = node.config?.shards || 0;
    capacity *= spec.configOptions.shards.capMult[idx] || 1;
    cost *= spec.configOptions.shards.costMult[idx] || 1;
  } else if (node.type === 'STORAGE') {
    const idx = node.config?.redundancy || 0;
    capacity *= spec.configOptions.redundancy.capMult[idx] || 1;
    cost *= spec.configOptions.redundancy.costMult[idx] || 1;
  } else if (node.type === 'VECTOR_AI') {
    const idx = node.config?.batching || 0;
    capacity *= spec.configOptions.batching.capMult[idx] || 1;
    cost *= spec.configOptions.batching.costMult[idx] || 1;
    latency *= spec.configOptions.batching.latencyMult[idx] || 1;
  }

  return {
    cost: Math.round(cost),
    capacity: Math.round(capacity),
    latency: Math.round(latency),
    hitRate
  };
}

// ============================================================================
// 6. SIMULATION & TOPOLOGICAL EVALUATION ENGINE
// ============================================================================
export function evaluateArchitecture(nodes = [], edges = [], incomingRps = 1000, trafficMix = {}, maxBudgetHr = null, allowedComponents = null) {
  const nodeMetrics = {};
  const edgeFlows = {};
  let totalHourlyCost = 0;

  nodes.forEach((n) => {
    const stats = getNodeEffectiveStats(n);
    totalHourlyCost += stats.cost;
    nodeMetrics[n.id] = {
      trafficIn: { STATIC: 0, READ: 0, WRITE: 0, SEARCH: 0, BOT: 0, AI_PROMPT: 0 },
      totalIn: 0,
      processed: 0,
      dropped: 0,
      utilization: 0,
      effectiveLatency: stats.latency,
      capacity: stats.capacity,
      cost: stats.cost,
      hitRate: stats.hitRate,
      isCrashed: Boolean(n.crashed)
    };
  });

  edges.forEach((e) => {
    edgeFlows[e.id] = { flowRps: 0, dominantType: 'READ', total: 0 };
  });

  const sourceNode = nodes.find((n) => n.type === 'SOURCE');
  if (!sourceNode) {
    return {
      nodeMetrics,
      edgeFlows,
      totalHourlyCost,
      p99Latency: 0,
      droppedRps: incomingRps,
      uptimePct: 0,
      diagnostics: ['CRITICAL: Missing Internet Ingress source node!']
    };
  }

  // Seed traffic at SOURCE according to mix
  Object.keys(TRAFFIC_TYPES).forEach((tType) => {
    const rpsForType = incomingRps * (trafficMix[tType] || 0);
    if (nodeMetrics[sourceNode.id]) {
      nodeMetrics[sourceNode.id].trafficIn[tType] = rpsForType;
    }
  });

  // Traverse graph in BFS topological order
  let frontier = [sourceNode.id];
  const visitedDepth = { [sourceNode.id]: 0 };

  while (frontier.length > 0) {
    const nextFrontier = [];

    for (const nodeId of frontier) {
      const node = nodes.find((n) => n.id === nodeId);
      const m = nodeMetrics[nodeId];
      if (!node || !m) continue;

      const totalIncoming = Object.values(m.trafficIn).reduce((a, b) => a + b, 0);
      m.totalIn = totalIncoming;

      if (m.isCrashed) {
        m.dropped = totalIncoming;
        m.processed = 0;
        m.utilization = 1.0;
        continue;
      }

      if (totalIncoming <= 0.1) continue;

      // Calculate capacity saturation & overload drops
      let passRatio = 1.0;
      if (totalIncoming > m.capacity) {
        m.dropped += totalIncoming - m.capacity;
        passRatio = m.capacity / totalIncoming;
      }

      const activeTraffic = {};
      Object.keys(m.trafficIn).forEach((k) => {
        activeTraffic[k] = m.trafficIn[k] * passRatio;
      });

      m.processed = Object.values(activeTraffic).reduce((a, b) => a + b, 0);
      m.utilization = totalIncoming / m.capacity;

      // Exponential queuing latency penalty as utilization approaches 100%
      const clampedUtil = Math.min(1.4, m.utilization);
      const saturationPenalty =
        clampedUtil < 0.55
          ? 1 + clampedUtil * 0.25
          : 1 + Math.pow((clampedUtil - 0.45) * 2.1, 2.6);
      m.effectiveLatency = Math.round(m.effectiveLatency * saturationPenalty);

      // Component transformation rules
      const outTraffic = { ...activeTraffic };

      if (node.type === 'WAF') {
        outTraffic.BOT = activeTraffic.BOT * 0.02;
      } else if (node.type === 'CDN') {
        outTraffic.STATIC = activeTraffic.STATIC * 0.05;
        outTraffic.READ = activeTraffic.READ * (1 - m.hitRate);
      } else if (node.type === 'CACHE') {
        outTraffic.READ = activeTraffic.READ * (1 - m.hitRate);
      } else if (node.type === 'QUEUE') {
        outTraffic.WRITE = activeTraffic.WRITE * 0.35;
      } else if (node.type === 'SEARCH') {
        outTraffic.SEARCH = activeTraffic.SEARCH * 0.05;
      } else if (node.type === 'STORAGE') {
        outTraffic.STATIC = activeTraffic.STATIC * 0.05;
      } else if (node.type === 'VECTOR_AI') {
        outTraffic.AI_PROMPT = activeTraffic.AI_PROMPT * 0.05;
      }

      // Outgoing edges to healthy targets
      const outEdges = edges.filter((e) => e.from === nodeId);
      if (outEdges.length === 0) continue;

      const healthyEdges = outEdges.filter((e) => {
        const targetNode = nodes.find((n) => n.id === e.to);
        return targetNode && !targetNode.crashed;
      });

      const activeEdges = healthyEdges.length > 0 ? healthyEdges : outEdges;
      const splitCount = activeEdges.length;

      activeEdges.forEach((edge) => {
        let edgeTotal = 0;
        let maxType = 'READ';
        let maxVal = -1;

        Object.keys(outTraffic).forEach((tType) => {
          const flow = outTraffic[tType] / splitCount;
          edgeTotal += flow;
          if (flow > maxVal) {
            maxVal = flow;
            maxType = tType;
          }

          const targetM = nodeMetrics[edge.to];
          if (targetM && (visitedDepth[nodeId] || 0) < 7) {
            targetM.trafficIn[tType] += flow;
          }
        });

        edgeFlows[edge.id] = {
          flowRps: edgeTotal,
          dominantType: maxType,
          total: edgeTotal
        };

        if (!nextFrontier.includes(edge.to) && (visitedDepth[nodeId] || 0) < 7) {
          nextFrontier.push(edge.to);
          visitedDepth[edge.to] = (visitedDepth[nodeId] || 0) + 1;
        }
      });
    }

    frontier = nextFrontier;
  }

  // Architectural completeness & end-to-end SLA validation
  const diagnostics = [];
  let architecturalDrops = 0;

  const webNodes = nodes.filter((n) => n.type === 'WEB' && !n.crashed);
  const sqlNodes = nodes.filter((n) => n.type === 'SQL' && !n.crashed);
  const aiNodes = nodes.filter((n) => n.type === 'VECTOR_AI' && !n.crashed);
  const searchNodes = nodes.filter((n) => n.type === 'SEARCH' && !n.crashed);

  const totalWebProcessed = webNodes.reduce((acc, n) => acc + (nodeMetrics[n.id]?.processed || 0), 0);
  const totalSqlIn = sqlNodes.reduce((acc, n) => acc + (nodeMetrics[n.id]?.totalIn || 0), 0);
  const totalAiIn = aiNodes.reduce((acc, n) => acc + (nodeMetrics[n.id]?.totalIn || 0), 0);

  if (totalWebProcessed < incomingRps * 0.1) {
    architecturalDrops += incomingRps * 0.85;
    diagnostics.push('CRITICAL: Traffic is not reaching any active API / Web Server! Wire Ingress -> Web Server.');
  }

  if (totalSqlIn < 1 && incomingRps > 10 && (trafficMix.WRITE > 0 || trafficMix.READ > 0.1)) {
    architecturalDrops += incomingRps * 0.45;
    diagnostics.push('CRITICAL: No requests are reaching a PostgreSQL Database! Uncached reads and persistent writes are failing.');
  }

  if ((trafficMix.AI_PROMPT || 0) > 0.05 && totalAiIn < 1 && incomingRps > 10) {
    architecturalDrops += incomingRps * (trafficMix.AI_PROMPT || 0.2);
    diagnostics.push('AI SLA FAILURE: AI queries require a downstream "Vector DB + GPU Node"!');
  }

  // Check if unfiltered DDoS bots hit web/db
  const unfilteredBotsAtWeb = webNodes.reduce((acc, n) => acc + (nodeMetrics[n.id]?.trafficIn.BOT || 0), 0);
  if (unfilteredBotsAtWeb > incomingRps * 0.03) {
    architecturalDrops += unfilteredBotsAtWeb * 0.9;
    diagnostics.push('SECURITY ALERT: Malicious Bot/DDoS packets are hitting your Web Servers! Place a WAF at the perimeter.');
  }

  // Sum drops
  const capacityDrops = Object.values(nodeMetrics).reduce((acc, m) => acc + m.dropped, 0);
  const totalDroppedRps = Math.min(incomingRps, capacityDrops + architecturalDrops);
  const uptimePct = incomingRps > 0 ? Math.max(0, ((incomingRps - totalDroppedRps) / incomingRps) * 100) : 100;

  // Compute weighted P99 Latency across active tiers
  let p99Latency = 12; // Base client network RTT
  const activeTierTypes = ['WAF', 'CDN', 'LB', 'WEB', 'CACHE', 'QUEUE', 'WORKER', 'SQL', 'SEARCH', 'STORAGE', 'VECTOR_AI'];
  activeTierTypes.forEach((tType) => {
    const tierNodes = nodes.filter((n) => n.type === tType && (nodeMetrics[n.id]?.totalIn || 0) > 1);
    if (tierNodes.length > 0) {
      const avgTierLatency =
        tierNodes.reduce((acc, n) => acc + nodeMetrics[n.id].effectiveLatency, 0) / tierNodes.length;
      const avgWeight =
        tierNodes.reduce((acc, n) => acc + Math.min(1, nodeMetrics[n.id].totalIn / Math.max(1, incomingRps)), 0) /
        tierNodes.length;
      p99Latency += avgTierLatency * Math.max(0.25, avgWeight);
    }
  });

  if ((trafficMix.SEARCH || 0) > 0.1 && searchNodes.length === 0 && incomingRps > 10) {
    p99Latency += 45;
  }

  p99Latency = Math.round(p99Latency);

  // Diagnostics
  nodes.forEach((n) => {
    const m = nodeMetrics[n.id];
    const spec = COMPONENT_CATALOG[n.type];
    if (!m || !spec) return;

    if (m.isCrashed) {
      diagnostics.push(`CHAOS OUTAGE: "${spec.name}" crashed! Traffic must fail over via Load Balancer to redundant instances.`);
    } else if (m.utilization > 1.0) {
      const pct = Math.round(m.utilization * 100);
      if (n.type === 'SQL') {
        const canUseKafka = !allowedComponents || allowedComponents.includes('QUEUE');
        diagnostics.push(
          canUseKafka
            ? `BOTTLENECK: ${spec.name} is overloaded at ${pct}% capacity! Add Redis Cache upstream, buffer writes via Kafka, or upgrade to Sharded Cluster.`
            : `BOTTLENECK: ${spec.name} is overloaded at ${pct}% capacity! Add Redis Cache upstream to absorb reads, or upgrade Topology Mode to "+2 Read Replicas".`
        );
      } else if (n.type === 'WEB') {
        const canUseCDN = !allowedComponents || allowedComponents.includes('CDN');
        diagnostics.push(
          canUseCDN
            ? `BOTTLENECK: ${spec.name} is saturated at ${pct}%! Add a Load Balancer with redundant Web Servers or offload reads with CDN.`
            : `BOTTLENECK: ${spec.name} is saturated at ${pct}%! Add a Load Balancer with redundant Web Servers or upgrade instance tier.`
        );
      } else {
        diagnostics.push(`BOTTLENECK: ${spec.name} is overloaded at ${pct}% capacity! Tune its configuration tier or add parallel nodes.`);
      }
    } else if (m.utilization > 0.78) {
      diagnostics.push(`HIGH QUEUING: ${spec.name} is at ${Math.round(m.utilization * 100)}% load, causing elevated latency (${m.effectiveLatency}ms).`);
    }
  });

  if (maxBudgetHr && totalHourlyCost > maxBudgetHr) {
    diagnostics.push(`BUDGET EXCEEDED: Architecture costs $${totalHourlyCost}/hr (SLA budget: $${maxBudgetHr}/hr). Downsize over-provisioned nodes.`);
  }

  if (diagnostics.length === 0 && incomingRps > 50) {
    diagnostics.push('ALL SYSTEMS OPTIMAL: Traffic flow, P99 latency, and saturation are well within SLA targets.');
  }

  return {
    nodeMetrics,
    edgeFlows,
    totalHourlyCost,
    p99Latency,
    droppedRps: Math.round(totalDroppedRps),
    uptimePct: Number(uptimePct.toFixed(2)),
    diagnostics
  };
}

// ============================================================================
// 7. AUTHORITATIVE LEVEL VICTORY & ANTI-CHEAT VALIDATION
// ============================================================================
export function validateLevelOutcome(levelId, nodes, edges, elapsedSeconds = 20) {
  const level = CAMPAIGN_LEVELS.find((l) => l.id === Number(levelId));
  if (!level) {
    return { valid: false, error: `Level ${levelId} not found` };
  }

  // 1. Verify Allowed Components constraint
  const illegalNode = nodes.find((n) => n.type !== 'SOURCE' && !level.allowedComponents.includes(n.type));
  if (illegalNode) {
    return {
      valid: false,
      won: false,
      reason: `Component ${illegalNode.type} is locked in Level ${level.id}`,
      stars: 0
    };
  }

  // 2. Run Authoritative Simulation at Target RPS
  const evaluation = evaluateArchitecture(
    nodes,
    edges,
    level.targetRps,
    level.trafficMix,
    level.maxBudgetHr,
    level.allowedComponents
  );

  const passedUptime = evaluation.uptimePct >= level.minUptimePct;
  const passedLatency = evaluation.p99Latency <= level.maxLatencyMs;
  const passedSLA = passedUptime && passedLatency;
  const passedBudget = evaluation.totalHourlyCost <= level.maxBudgetHr;

  const won = passedSLA && passedBudget;

  // Star calculation
  let stars = 0;
  if (won) {
    stars = 1;
    if (evaluation.p99Latency <= level.maxLatencyMs * 0.75) stars += 1;
    if (evaluation.totalHourlyCost <= level.maxBudgetHr * 0.85) stars += 1;
    stars = Math.min(3, Math.max(1, stars));
  }

  // Authoritative Anti-Cheat Verification Hash
  const hashSeed = `${level.id}:${stars}:${evaluation.p99Latency}:${evaluation.uptimePct}:${evaluation.totalHourlyCost}:${elapsedSeconds}`;
  let hashVal = 0;
  for (let i = 0; i < hashSeed.length; i++) {
    hashVal = (hashVal << 5) - hashVal + hashSeed.charCodeAt(i);
    hashVal |= 0;
  }
  const validationToken = `cf_edge_val_${Math.abs(hashVal).toString(16)}_${Date.now()}`;

  const baseScore = won ? 5000 : 500;
  const latencyBonus = Math.max(0, Math.round((level.maxLatencyMs - evaluation.p99Latency) * 35));
  const budgetBonus = Math.max(0, Math.round((level.maxBudgetHr - evaluation.totalHourlyCost) * 15));
  const calculatedScore = baseScore + latencyBonus + budgetBonus;

  return {
    valid: true,
    won,
    levelId: level.id,
    levelTitle: level.title,
    stars,
    passedSLA,
    passedBudget,
    p99Latency: evaluation.p99Latency,
    uptimePct: evaluation.uptimePct,
    totalHourlyCost: evaluation.totalHourlyCost,
    score: calculatedScore,
    validationToken,
    diagnostics: evaluation.diagnostics
  };
}

// ============================================================================
// 8. AUTHORITATIVE CHAOS MONKEY STRIKE
// ============================================================================
export function triggerAuthoritativeChaos(nodes, preferredType = null) {
  const eligibleVictims = nodes.filter((n) => n.type !== 'SOURCE' && !n.crashed);
  if (eligibleVictims.length === 0) {
    return { error: 'No active nodes available to sabotage.' };
  }

  const victim = eligibleVictims[Math.floor(Math.random() * eligibleVictims.length)];
  const spec = COMPONENT_CATALOG[victim.type] || { name: victim.type };

  const attackVariants = [
    {
      type: 'KERNEL_PANIC',
      name: 'OOM Killer Invocator',
      toolIcon: '💥',
      dialogue: `Filled the heap memory on ${spec.name}! Triggered SIGKILL 137!`,
      tweetQuote: `Incident Alert: Memory exhaustion crash on ${spec.name}...`
    },
    {
      type: 'NETWORK_PARTITION',
      name: 'BGP Route Blackhole',
      toolIcon: '🔌',
      dialogue: `Yanked the redundant power and fiber lines from ${spec.name}!`,
      tweetQuote: `High severity: Network route flap disconnected ${spec.name}...`
    },
    {
      type: 'CERT_EXPIRY',
      name: 'Expired TLS Handshake',
      toolIcon: '⏰',
      dialogue: `Let the wildcard TLS certificate expire on ${spec.name}!`,
      tweetQuote: `Customer complaint: SSL Handshake failure on ${spec.name}...`
    }
  ];

  const attack = preferredType
    ? attackVariants.find((a) => a.type === preferredType) || attackVariants[0]
    : attackVariants[Math.floor(Math.random() * attackVariants.length)];

  return {
    success: true,
    victimNodeId: victim.id,
    victimType: victim.type,
    victimName: spec.name,
    attackType: attack.type,
    attackName: attack.name,
    toolIcon: attack.toolIcon,
    dialogue: attack.dialogue,
    tweetQuote: attack.tweetQuote,
    triggeredAt: new Date().toISOString()
  };
}

// ============================================================================
// 9. REAL-WORLD CLOUD ARCHITECTURE CONNECTION RULES & VALIDATION MATRIX
// ============================================================================
export const CLOUD_CONNECTION_RULES = {
  SOURCE: {
    allowed: ['WAF', 'CDN', 'LB', 'WEB'],
    rules: {
      SQL: {
        title: 'Direct Database Ingress Violation',
        category: 'Perimeter Security Rule',
        explanation: 'Relational databases (PostgreSQL/MySQL) reside strictly in isolated private VPC subnets. Exposing port 5432 directly to public Internet Ingress bypasses authentication, rate limiting, and connection pooling, risking massive DDoS attacks and immediate data exfiltration.',
        recommendation: 'Route traffic through a Load Balancer and API / Web Server first: Ingress ➔ Load Balancer ➔ Web Server ➔ PostgreSQL Database.'
      },
      CACHE: {
        title: 'Direct In-Memory Cache Ingress Violation',
        category: 'Perimeter Security Rule',
        explanation: 'Redis lacks robust HTTP perimeter protection and is designed strictly as an internal low-latency key-value store. Public clients cannot speak the Redis RESP protocol directly.',
        recommendation: 'Route traffic through an API / Web Server or Cloud CDN Edge before querying Redis.'
      },
      QUEUE: {
        title: 'Unauthenticated Event Ingress Violation',
        category: 'Perimeter Architecture Rule',
        explanation: 'Kafka broker ports should never face public client traffic directly. Unauthenticated internet traffic could flood partition commit logs, exhaust broker disk I/O, and compromise message schemas.',
        recommendation: 'Terminate incoming HTTP requests at an API / Web Server, which parses, validates, and publishes verified events to Kafka.'
      },
      WORKER: {
        title: 'Bypassed Orchestration Violation',
        category: 'Async Workflow Rule',
        explanation: 'Async Worker Pools do not run public HTTP listeners. Workers pull jobs asynchronously from message queues or task schedulers in the background.',
        recommendation: 'Route Ingress ➔ Web Server ➔ Kafka Queue ➔ Async Worker Pool.'
      },
      SEARCH: {
        title: 'Exposed Internal Search Cluster',
        category: 'Perimeter Security Rule',
        explanation: 'Elasticsearch clusters in internal VPCs must not accept raw unauthenticated HTTP requests. Wildcard search scans would quickly cause JVM heap exhaustion and cluster outages.',
        recommendation: 'Route queries through an API / Web Server to sanitize search parameters before querying Elasticsearch.'
      },
      STORAGE: {
        title: 'Direct Object Storage Ingress',
        category: 'Cloud Storage Rule',
        explanation: 'Raw public client requests should not hit private S3 buckets directly without caching or authentication.',
        recommendation: 'Deliver media via Cloud CDN Edge (for cached reads) or issue presigned URLs via an API / Web Server (for uploads).'
      },
      VECTOR_AI: {
        title: 'Unauthenticated GPU Cluster Exposure',
        category: 'Cost & Perimeter Rule',
        explanation: 'GPU LLM inference and Vector DB nodes are high-cost resources. Exposing them to raw public ingress invites immediate Denial of Wallet attacks.',
        recommendation: 'Shield GPU clusters behind an API / Web Server to enforce rate limits, user auth, and prompt validation.'
      },
      SOURCE: {
        title: 'Self-Connection Loop',
        category: 'Topology Rule',
        explanation: 'Internet Ingress is the root traffic origin and cannot route packets into itself.',
        recommendation: 'Connect Ingress downstream to WAF, CDN, Load Balancer, or Web Server.'
      }
    }
  },

  WAF: {
    allowed: ['CDN', 'LB', 'WEB', 'CACHE'],
    rules: {
      SOURCE: {
        title: 'Reverse Traffic Inversion',
        category: 'Dataflow Direction Rule',
        explanation: 'Traffic flows from the Internet into your cloud perimeter, not backwards into client ingress.',
        recommendation: 'Direct scrubbed traffic forward to a Load Balancer, Cloud CDN, or Web Server.'
      },
      WAF: {
        title: 'Redundant Perimeter Scrubbing',
        category: 'Optimization Rule',
        explanation: 'Chaining multiple WAF instances in series multiplies TLS termination latency without improving security posture.',
        recommendation: 'Direct scrubbed traffic downstream to a Load Balancer or Web Server.'
      },
      SQL: {
        title: 'Protocol Incompatibility: WAF to Database',
        category: 'Protocol Mismatch Rule',
        explanation: 'WAFs inspect Layer 7 HTTP/HTTPS traffic. They do not speak PostgreSQL wire protocols or parse SQL query statements.',
        recommendation: 'Connect WAF ➔ Load Balancer ➔ API / Web Server ➔ PostgreSQL Database.'
      },
      QUEUE: {
        title: 'Missing Event Serialization',
        category: 'Dataflow Rule',
        explanation: 'WAF proxies inspect and scrub HTTP headers/payloads; they cannot serialize messages into Kafka topic partitions.',
        recommendation: 'Route clean traffic to an API / Web Server, which serializes and dispatches events to Kafka.'
      },
      WORKER: {
        title: 'Worker Ingestion Mismatch',
        category: 'Async Architecture Rule',
        explanation: 'Async workers consume queue messages; they do not terminate HTTP connections from perimeter firewalls.',
        recommendation: 'Route through Web Server ➔ Kafka Queue ➔ Worker Pool.'
      },
      SEARCH: {
        title: 'Missing Query Parsing',
        category: 'Protocol Mismatch Rule',
        explanation: 'WAF does not generate Elasticsearch Query DSL from raw HTTP requests.',
        recommendation: 'Route through an API / Web Server.'
      },
      STORAGE: {
        title: 'Storage Routing Mismatch',
        category: 'Architecture Rule',
        explanation: 'WAF filters ingress traffic; it does not host an S3 object store.',
        recommendation: 'Route to Cloud CDN or an API / Web Server.'
      },
      VECTOR_AI: {
        title: 'Missing Inference Gateway',
        category: 'Compute Gateway Rule',
        explanation: 'WAF cannot generate vector embeddings or format JSON chat payloads for LLM inference engines.',
        recommendation: 'Route through an API / Web Server.'
      }
    }
  },

  CDN: {
    allowed: ['LB', 'WEB', 'STORAGE', 'WAF', 'CACHE'],
    rules: {
      SOURCE: {
        title: 'Reverse Traffic Inversion',
        category: 'Dataflow Direction Rule',
        explanation: 'Edge CDNs receive traffic from Ingress and forward origin cache misses inward, not back out to client ingress.',
        recommendation: 'Connect CDN downstream to an origin Load Balancer, Web Server, or S3 Storage bucket.'
      },
      CDN: {
        title: 'Edge CDN Loop Detected',
        category: 'Edge Topology Rule',
        explanation: 'Chaining edge CDNs to each other causes cache fragmentation, stale invalidations, and routing loops.',
        recommendation: 'Route cache misses directly to an origin Load Balancer or Web Server.'
      },
      SQL: {
        title: 'Protocol Incompatibility: CDN to Database',
        category: 'Protocol Mismatch Rule',
        explanation: 'CDNs cache and proxy HTTP content. They cannot connect over TCP sockets to PostgreSQL or execute relational queries.',
        recommendation: 'Connect CDN ➔ Load Balancer ➔ API / Web Server ➔ PostgreSQL Database.'
      },
      QUEUE: {
        title: 'Edge Proxy to Queue Mismatch',
        category: 'Async Architecture Rule',
        explanation: 'CDNs do not publish messages to Kafka message queues directly.',
        recommendation: 'Forward dynamic traffic to an API / Web Server first.'
      },
      WORKER: {
        title: 'Worker Decoupling Violation',
        category: 'Async Workflow Rule',
        explanation: 'CDN edge POPs do not invoke background compute workers directly.',
        recommendation: 'Route through Web Server ➔ Kafka Queue ➔ Async Workers.'
      },
      VECTOR_AI: {
        title: 'Missing Compute Orchestrator',
        category: 'Compute Rule',
        explanation: 'CDNs cannot run matrix math or vector indexing directly without an application server.',
        recommendation: 'Route dynamic AI queries through an API / Web Server.'
      }
    }
  },

  LB: {
    allowed: ['WEB', 'WAF', 'CDN', 'SEARCH', 'STORAGE', 'VECTOR_AI'],
    rules: {
      SOURCE: {
        title: 'Reverse Traffic Inversion',
        category: 'Dataflow Direction Rule',
        explanation: 'Load balancers distribute ingress traffic inward; they cannot send traffic back out to internet ingress.',
        recommendation: 'Connect Load Balancer to downstream API / Web Servers.'
      },
      LB: {
        title: 'Redundant Load Balancer Chaining',
        category: 'Network Optimization Rule',
        explanation: 'Chaining public application load balancers together introduces double-hop proxy latency without scaling backend capacity.',
        recommendation: 'Wire a single Load Balancer to multiple parallel Web Servers.'
      },
      SQL: {
        title: 'Missing Application Layer & Connection Pool',
        category: 'Protocol Mismatch Rule',
        explanation: 'HTTP Load Balancers route REST/HTTP packets, not SQL query connections. Relational databases require connection poolers and ORM logic.',
        recommendation: 'Wire Load Balancer to API / Web Servers, and connect Web Servers to PostgreSQL.'
      },
      CACHE: {
        title: 'Binary Protocol Mismatch: LB to Redis',
        category: 'Protocol Mismatch Rule',
        explanation: 'Standard HTTP load balancers cannot translate incoming REST requests into Redis key-value binary commands.',
        recommendation: 'Wire Load Balancer to Web Servers, which query Redis via an in-memory client.'
      },
      QUEUE: {
        title: 'Missing Message Producer',
        category: 'Event Architecture Rule',
        explanation: 'Load balancers forward HTTP streams; they do not serialize payloads into structured Kafka partition messages.',
        recommendation: 'Route traffic through an API / Web Server that formats and produces Kafka records.'
      },
      WORKER: {
        title: 'Direct Worker Invocation Antipattern',
        category: 'Coupling Antipattern Rule',
        explanation: 'Async workers process tasks from queues in the background; they do not accept incoming HTTP traffic from public load balancers.',
        recommendation: 'Connect Load Balancer ➔ Web Server ➔ Kafka Queue ➔ Async Workers.'
      }
    }
  },

  WEB: {
    allowed: ['CACHE', 'SQL', 'QUEUE', 'SEARCH', 'STORAGE', 'VECTOR_AI', 'LB', 'WEB'],
    rules: {
      SOURCE: {
        title: 'Reverse Traffic Inversion',
        category: 'Dataflow Direction Rule',
        explanation: 'Backend compute servers cannot route client requests backward into public internet ingress.',
        recommendation: 'Direct data requests downstream to Caches, Databases, Queues, or Search clusters.'
      },
      WAF: {
        title: 'Directional Inversion: Web to Perimeter WAF',
        category: 'Perimeter Rule',
        explanation: 'WAF is an ingress perimeter security filter. Application web servers do not route outgoing database/API traffic back to the perimeter.',
        recommendation: 'Place WAF upstream of Web Servers (Ingress ➔ WAF ➔ Web).'
      },
      CDN: {
        title: 'Directional Inversion: Web to Edge CDN',
        category: 'Edge Caching Rule',
        explanation: 'Edge CDNs sit in front of web servers to cache content before it reaches origin compute. Web servers do not push queries into a CDN.',
        recommendation: 'Place Cloud CDN between Internet Ingress and your Load Balancer / Web Servers.'
      },
      WORKER: {
        title: 'Tight Coupling Antipattern: Web to Worker',
        category: 'Decoupling Architecture Rule',
        explanation: 'Connecting Web Servers directly to Worker Pools introduces synchronous thread blocking and cascading failures under heavy load. In cloud systems, web servers must decouple background jobs via an asynchronous message buffer.',
        recommendation: 'Connect Web Server ➔ Kafka Message Queue ➔ Async Worker Pool to buffer write bursts cleanly!'
      }
    }
  },

  CACHE: {
    allowed: ['SQL', 'WEB', 'SEARCH', 'VECTOR_AI'],
    rules: {
      SOURCE: { title: 'Reverse Flow', category: 'Dataflow Rule', explanation: 'Internal caches cannot route back to external internet ingress.', recommendation: 'Connect Cache to PostgreSQL as a cache-aside fallback.' },
      WAF: { title: 'Directional Inversion', category: 'Dataflow Rule', explanation: 'Caches do not route to ingress perimeter firewalls.', recommendation: 'Connect Cache to PostgreSQL.' },
      CDN: { title: 'Tier Inversion', category: 'Dataflow Rule', explanation: 'Origin caches do not route upstream to edge CDNs.', recommendation: 'Connect Cache to PostgreSQL.' },
      LB: { title: 'Directional Inversion', category: 'Dataflow Rule', explanation: 'Internal caches do not route backwards to load balancers.', recommendation: 'Connect Cache to PostgreSQL.' },
      CACHE: { title: 'Redundant Cache Tiering', category: 'Optimization Rule', explanation: 'Chaining Redis to Redis directly causes dual-write anomalies and cache invalidation drift.', recommendation: 'Use a single configured Redis cluster with LRU eviction.' },
      QUEUE: { title: 'Protocol Mismatch', category: 'Dataflow Rule', explanation: 'Redis key-value stores do not produce streaming messages to Kafka.', recommendation: 'Have Web Servers publish to Kafka.' },
      WORKER: { title: 'Consumer Mismatch', category: 'Async Rule', explanation: 'Workers consume tasks from persistent commit logs, not ephemeral cache keys.', recommendation: 'Connect Kafka Queue ➔ Worker Pool.' },
      STORAGE: { title: 'Storage Pipeline Mismatch', category: 'Dataflow Rule', explanation: 'Redis does not archive directly to S3 without worker compute.', recommendation: 'Use an Async Worker to archive data to S3.' }
    }
  },

  QUEUE: {
    allowed: ['WORKER', 'SQL', 'SEARCH', 'STORAGE'],
    rules: {
      SOURCE: { title: 'Async Inversion', category: 'Dataflow Rule', explanation: 'Kafka brokers cannot send HTTP response packets to public ingress.', recommendation: 'Connect Kafka ➔ Async Worker Pool.' },
      WAF: { title: 'Directional Inversion', category: 'Dataflow Rule', explanation: 'Message queues do not route to perimeter firewalls.', recommendation: 'Connect Kafka ➔ Async Worker Pool.' },
      CDN: { title: 'Directional Inversion', category: 'Dataflow Rule', explanation: 'Message queues do not route to edge CDNs.', recommendation: 'Connect Kafka ➔ Async Worker Pool.' },
      LB: { title: 'Async Inversion', category: 'Dataflow Rule', explanation: 'Kafka cannot push asynchronous messages to synchronous HTTP load balancers.', recommendation: 'Connect Kafka ➔ Async Worker Pool.' },
      WEB: {
        title: 'Push vs. Pull Antipattern: Queue to Web Server',
        category: 'Async Workflow Rule',
        explanation: 'Kafka brokers do not push unsolicited messages back to synchronous stateless web servers. Web servers handle client request-response cycles, not async batch jobs.',
        recommendation: 'Connect Kafka ➔ Async Worker Pool, which polls and processes queue partitions.'
      },
      CACHE: { title: 'Invalid Cache Mutation', category: 'Dataflow Rule', explanation: 'Queues do not write directly to in-memory key-value caches without compute.', recommendation: 'Connect Kafka ➔ Worker, and have the Worker update Redis.' },
      QUEUE: { title: 'Redundant Queue Chaining', category: 'Optimization Rule', explanation: 'Chaining Kafka brokers directly to other Kafka brokers creates message lag and duplicate offsets.', recommendation: 'Connect Kafka ➔ Async Worker Pool.' }
    }
  },

  WORKER: {
    allowed: ['SQL', 'STORAGE', 'SEARCH', 'CACHE', 'VECTOR_AI', 'QUEUE'],
    rules: {
      SOURCE: { title: 'Reverse Flow', category: 'Dataflow Rule', explanation: 'Background worker pools cannot route packets back to public client ingress.', recommendation: 'Connect Worker to PostgreSQL or S3 Storage to persist job output.' },
      WAF: { title: 'Directional Inversion', category: 'Dataflow Rule', explanation: 'Workers do not route to perimeter firewalls.', recommendation: 'Connect Worker to PostgreSQL.' },
      CDN: { title: 'Directional Inversion', category: 'Dataflow Rule', explanation: 'Workers do not push directly to edge CDNs.', recommendation: 'Connect Worker to S3 Storage, then deliver via CDN.' },
      LB: { title: 'Directional Inversion', category: 'Dataflow Rule', explanation: 'Workers do not send traffic to ingress load balancers.', recommendation: 'Connect Worker to PostgreSQL.' },
      WEB: {
        title: 'Architectural Inversion: Worker to Web Server',
        category: 'Decoupling Rule',
        explanation: 'Background worker pools execute asynchronous tasks; they do not call frontend web servers. Workers write their completed status and output directly to databases, caches, or object stores.',
        recommendation: 'Connect Worker ➔ PostgreSQL Database or S3 Object Storage.'
      },
      WORKER: {
        title: 'Worker-to-Worker Tight Coupling',
        category: 'Decoupling Rule',
        explanation: 'Directly chaining worker pools creates brittle synchronous coupling between background jobs.',
        recommendation: 'Decouple multi-stage worker pipelines using a Kafka Message Queue (Worker ➔ Kafka ➔ Next Worker).'
      }
    }
  },

  SQL: {
    allowed: ['SQL', 'CACHE', 'SEARCH', 'STORAGE'],
    rules: {
      SOURCE: { title: 'Security Boundary Violation', category: 'Data Security Rule', explanation: 'Private databases must never route directly to public internet ingress.', recommendation: 'Traffic flows from Web Server ➔ PostgreSQL.' },
      WAF: { title: 'Security Inversion', category: 'Data Security Rule', explanation: 'Databases do not send packets to perimeter firewalls.', recommendation: 'Databases are terminal data tiers.' },
      CDN: { title: 'Security Inversion', category: 'Data Security Rule', explanation: 'Databases cannot connect directly to edge CDNs.', recommendation: 'Deliver cached reads via Web Server ➔ CDN.' },
      LB: { title: 'Security Inversion', category: 'Dataflow Rule', explanation: 'Databases do not route to application load balancers.', recommendation: 'Connect Web Server ➔ Database.' },
      WEB: {
        title: 'Dataflow Inversion: Database to Web Server',
        category: 'Dataflow Direction Rule',
        explanation: 'Traffic flows from Web Servers querying the Database, not from the Database pushing unsolicited traffic into Web Servers.',
        recommendation: 'Connect Web Server ➔ PostgreSQL Database.'
      },
      QUEUE: { title: 'Missing CDC Connector', category: 'Architecture Rule', explanation: 'Relational databases do not write to message queues without an application worker or Change Data Capture (CDC) agent.', recommendation: 'Use Web Servers or Workers to publish events.' },
      WORKER: { title: 'Push Inversion', category: 'Async Rule', explanation: 'Databases do not push jobs into worker pools.', recommendation: 'Workers query the database or consume from queues.' },
      VECTOR_AI: { title: 'Missing ML Orchestrator', category: 'Compute Rule', explanation: 'Relational databases cannot drive GPU inference without application compute.', recommendation: 'Connect Web Server ➔ Vector DB + GPU Node.' }
    }
  },

  SEARCH: {
    allowed: ['STORAGE'],
    rules: {
      SOURCE: { title: 'Security Boundary', category: 'Perimeter Rule', explanation: 'Elasticsearch clusters must be protected behind an API / Web Server.', recommendation: 'Connect Web Server ➔ Elasticsearch.' },
      WAF: { title: 'Directional Inversion', category: 'Dataflow Rule', explanation: 'Search indexes do not route to perimeter firewalls.', recommendation: 'Query search via Web Server.' },
      CDN: { title: 'Directional Inversion', category: 'Dataflow Rule', explanation: 'Search clusters do not route to edge CDNs directly.', recommendation: 'Query search via Web Server.' },
      LB: { title: 'Directional Inversion', category: 'Dataflow Rule', explanation: 'Search clusters do not route backwards to load balancers.', recommendation: 'Connect Load Balancer ➔ Web Server ➔ Search.' },
      WEB: { title: 'Terminal Query Sink', category: 'Dataflow Rule', explanation: 'Elasticsearch is a query termination index. It returns results to calling web servers, but does not initiate connections into web servers.', recommendation: 'Connect Web Server ➔ Elasticsearch.' },
      SQL: { title: 'Terminal Sink', category: 'Architecture Rule', explanation: 'Search indexes do not query relational databases directly.', recommendation: 'Sync data via Web Servers or Async Workers.' },
      CACHE: { title: 'Terminal Sink', category: 'Architecture Rule', explanation: 'Search clusters do not manage Redis caches.', recommendation: 'Cache search results at the Web Server layer.' },
      QUEUE: { title: 'Terminal Sink', category: 'Architecture Rule', explanation: 'Search clusters do not produce events to Kafka.', recommendation: 'Have Web Servers or Workers produce events.' },
      WORKER: { title: 'Terminal Sink', category: 'Architecture Rule', explanation: 'Search clusters do not dispatch tasks to worker pools.', recommendation: 'Use message queues to orchestrate workers.' },
      VECTOR_AI: { title: 'Index Mismatch', category: 'Compute Rule', explanation: 'Text search clusters do not run vector LLM inference directly.', recommendation: 'Connect Web Server to Vector DB + GPU Node.' },
      SEARCH: { title: 'Redundant Index Layering', category: 'Optimization Rule', explanation: 'Chaining search clusters directly together is not a standard cloud pattern.', recommendation: 'Scale Elasticsearch shards within a single cluster.' }
    }
  },

  STORAGE: {
    allowed: ['CDN', 'WORKER'],
    rules: {
      SOURCE: { title: 'Security Boundary', category: 'Perimeter Rule', explanation: 'Private S3 buckets cannot connect directly to internet ingress.', recommendation: 'Route public downloads via Cloud CDN.' },
      WAF: { title: 'Directional Inversion', category: 'Dataflow Rule', explanation: 'Object stores do not route to perimeter firewalls.', recommendation: 'Route uploads via Web Server.' },
      LB: { title: 'Directional Inversion', category: 'Dataflow Rule', explanation: 'Object storage does not route to load balancers.', recommendation: 'Connect Web Server to S3 Storage.' },
      WEB: { title: 'Static Blob Sink', category: 'Dataflow Rule', explanation: 'S3 stores blobs; it does not initiate connections into web servers.', recommendation: 'Connect Web Server ➔ S3 Storage.' },
      SQL: { title: 'Static Blob Sink', category: 'Dataflow Rule', explanation: 'Object storage cannot query relational SQL databases.', recommendation: 'Use an Async Worker to transfer data between S3 and SQL.' },
      CACHE: { title: 'Static Blob Sink', category: 'Dataflow Rule', explanation: 'S3 does not write directly into in-memory Redis caches.', recommendation: 'Cache media URLs in Redis via Web Servers.' },
      QUEUE: { title: 'Missing Event Driver', category: 'Dataflow Rule', explanation: 'S3 buckets do not publish directly to Kafka without S3 event notifications and workers.', recommendation: 'Connect S3 ➔ Async Worker.' },
      SEARCH: { title: 'Static Blob Sink', category: 'Dataflow Rule', explanation: 'S3 does not index itself into Elasticsearch.', recommendation: 'Use an Async Worker to parse and index S3 documents.' },
      STORAGE: { title: 'Redundant Storage Chaining', category: 'Optimization Rule', explanation: 'Direct bucket-to-bucket chaining is not a standard dataflow.', recommendation: 'Enable Multi-AZ replication in the storage node configuration.' },
      VECTOR_AI: { title: 'Missing Feature Extractor', category: 'Compute Rule', explanation: 'S3 cannot generate vector embeddings without compute.', recommendation: 'Connect Worker or Web Server ➔ Vector DB + GPU Node.' }
    }
  },

  VECTOR_AI: {
    allowed: ['SQL', 'STORAGE', 'CACHE'],
    rules: {
      SOURCE: { title: 'Perimeter Security Violation', category: 'Perimeter Rule', explanation: 'GPU clusters and Vector databases must be shielded behind an API / Web Server to prevent Denial of Wallet attacks.', recommendation: 'Connect Web Server ➔ Vector DB + GPU Node.' },
      WAF: { title: 'Directional Inversion', category: 'Dataflow Rule', explanation: 'Vector DBs do not route to perimeter firewalls.', recommendation: 'Route queries via Web Server.' },
      CDN: { title: 'Directional Inversion', category: 'Dataflow Rule', explanation: 'GPU clusters do not route to edge CDNs.', recommendation: 'Connect Web Server ➔ Vector DB + GPU Node.' },
      LB: { title: 'Directional Inversion', category: 'Dataflow Rule', explanation: 'GPU nodes do not route backwards to load balancers.', recommendation: 'Route through Load Balancer ➔ Web Server ➔ Vector DB.' },
      WEB: { title: 'Terminal Compute Sink', category: 'Dataflow Rule', explanation: 'Vector DB & GPU nodes return inference tokens to calling web servers, but do not initiate requests into web servers.', recommendation: 'Connect Web Server ➔ Vector DB + GPU Node.' },
      QUEUE: { title: 'Terminal Compute Sink', category: 'Dataflow Rule', explanation: 'Vector DBs do not publish to message queues natively.', recommendation: 'Use Web Servers or Workers to publish AI results.' },
      WORKER: { title: 'Terminal Compute Sink', category: 'Dataflow Rule', explanation: 'GPU nodes do not dispatch jobs to worker pools.', recommendation: 'Have Workers call Vector DB for batch embedding.' },
      SEARCH: { title: 'Architecture Mismatch', category: 'Architecture Rule', explanation: 'Vector search and Elasticsearch are separate search paradigms.', recommendation: 'Orchestrate hybrid search via an API / Web Server.' },
      VECTOR_AI: { title: 'Redundant Vector Node Chaining', category: 'Optimization Rule', explanation: 'Chaining GPU nodes directly together is not a valid pattern.', recommendation: 'Scale GPU batching options in node configuration.' }
    }
  }
};

export function isConnectionAllowed(fromType, toType) {
  if (!fromType || !toType) return false;
  const rule = CLOUD_CONNECTION_RULES[fromType];
  if (!rule) return true;
  return rule.allowed.includes(toType);
}

export function validateCloudConnection(fromType, toType, nodes = [], edges = [], fromId = null, toId = null, options = {}) {
  const isNewConnection = typeof options === 'boolean' ? options : (options.isNewConnection !== false);
  const currentEdgeId = options.currentEdgeId || null;

  if (!fromType || !toType) {
    return {
      allowed: false,
      violation: {
        title: 'Unknown Component Tier',
        category: 'Validation Error',
        explanation: 'One or both components could not be identified in the architecture catalog.',
        recommendation: 'Select valid components from the cloud components catalog.',
        validTargets: []
      }
    };
  }

  // 1. Self-Connection Loop
  if (fromId && toId && fromId === toId) {
    return {
      allowed: false,
      violation: {
        title: 'Self-Connection Loop Violation',
        category: 'Topology Constraint',
        explanation: 'A component cannot route traffic into its own input port. In distributed systems, this creates an instantaneous recursive packet cycle that causes buffer overflow.',
        recommendation: 'Connect this component downstream to a distinct service tier in your pipeline (e.g. Ingress ➔ Load Balancer, or Web Server ➔ Database).',
        validTargets: CLOUD_CONNECTION_RULES[fromType]?.allowed || []
      }
    };
  }

  // 2. Duplicate Wire
  if (fromId && toId) {
    const existingMatches = edges.filter((e) => e.from === fromId && e.to === toId && (!currentEdgeId || e.id !== currentEdgeId));
    if (isNewConnection ? existingMatches.length > 0 : existingMatches.length > 1) {
      return {
        allowed: false,
        violation: {
          title: 'Duplicate Wire Detected',
          category: 'Redundant Wiring',
          explanation: 'A communication wire already connects these two components. Adding duplicate wires between the exact same pair of nodes causes packet duplication.',
          recommendation: 'Configure concurrency or replicas on the existing component rather than adding parallel duplicate wires between the same nodes.',
          validTargets: CLOUD_CONNECTION_RULES[fromType]?.allowed || []
        }
      };
    }
  }

  // 3. Matrix Rule Lookup
  const sourceRules = CLOUD_CONNECTION_RULES[fromType];
  if (!sourceRules) {
    return { allowed: true };
  }

  const isAllowed = sourceRules.allowed.includes(toType);
  if (!isAllowed) {
    const specificRule = sourceRules.rules?.[toType] || {
      title: `Architectural Constraint: ${fromType} to ${toType}`,
      category: 'Cloud Engineering Rule',
      explanation: `In standard cloud architectures, ${COMPONENT_CATALOG[fromType]?.name || fromType} cannot route directly into ${COMPONENT_CATALOG[toType]?.name || toType}. Distributed systems require proper separation of concerns between perimeter, compute, and data tiers.`,
      recommendation: `Insert an appropriate intermediate tier (such as an API / Web Server or Load Balancer) between ${COMPONENT_CATALOG[fromType]?.name || fromType} and ${COMPONENT_CATALOG[toType]?.name || toType}.`
    };

    return {
      allowed: false,
      violation: {
        ...specificRule,
        validTargets: sourceRules.allowed || []
      }
    };
  }

  // 4. Circular Path Detection (Cycle Check)
  if (fromId && toId) {
    const visited = new Set();
    const queue = [toId];
    let hasCycle = false;

    const activeEdges = currentEdgeId
      ? edges.filter((e) => e.id !== currentEdgeId)
      : (isNewConnection ? edges : edges.filter((e) => !(e.from === fromId && e.to === toId)));

    while (queue.length > 0) {
      const curr = queue.shift();
      if (curr === fromId) {
        hasCycle = true;
        break;
      }
      visited.add(curr);
      const outgoing = activeEdges.filter((e) => e.from === curr).map((e) => e.to);
      for (const nextNode of outgoing) {
        if (!visited.has(nextNode)) {
          queue.push(nextNode);
        }
      }
    }

    if (hasCycle) {
      return {
        allowed: false,
        violation: {
          title: 'Infinite Circular Loop Detected',
          category: 'Topology Constraint',
          explanation: 'Connecting this node creates an infinite directed cycle in your network graph. Packets would loop endlessly between tiers, causing buffer overflow and exponential latency amplification.',
          recommendation: 'Cloud architectures must follow a Directed Acyclic Graph (DAG) for primary request pipelines. Remove the opposing wire before connecting in this direction.',
          validTargets: sourceRules.allowed || []
        }
      };
    }
  }

  return { allowed: true };
}

// ============================================================================
// 10. ICONIC REAL-WORLD ARCHITECTURE PRESETS
// ============================================================================
export const ICONIC_PRESETS = [
  {
    id: 'netflix',
    name: 'Netflix Open Connect & Microservices',
    company: 'Netflix',
    badge: '250M+ Subscribers',
    emoji: '🎬',
    color: 'from-red-600/30 to-rose-900/40',
    borderColor: 'border-red-500/50',
    tagline: 'Edge CDN caches 95% of video chunks while microservices handle millions of stream sessions via EVCache & Kafka telemetry.',
    targetRps: 32000,
    keyFeatures: ['Edge CDN Cache', 'Dual Web Services', 'EVCache (Redis)', 'Kafka Event Queue', 'Transcoder Workers'],
    nodes: [
      { id: 'src', type: 'SOURCE', x: 60, y: 220, config: {} },
      { id: 'cdn-1', type: 'CDN', x: 260, y: 120, config: { hitRatio: 1 } },
      { id: 'waf-1', type: 'WAF', x: 260, y: 320, config: { mode: 1 } },
      { id: 'lb-1', type: 'LB', x: 470, y: 220, config: { algorithm: 1 } },
      { id: 'web-1', type: 'WEB', x: 680, y: 120, config: { tier: 1 } },
      { id: 'web-2', type: 'WEB', x: 680, y: 320, config: { tier: 1 } },
      { id: 'cache-1', type: 'CACHE', x: 900, y: 120, config: { eviction: 1 } },
      { id: 'kafka-1', type: 'QUEUE', x: 900, y: 320, config: { partitions: 1 } },
      { id: 'sql-1', type: 'SQL', x: 1120, y: 120, config: { scaling: 1 } },
      { id: 'worker-1', type: 'WORKER', x: 1120, y: 320, config: { tier: 1 } }
    ],
    edges: [
      { id: 'e1', from: 'src', to: 'cdn-1' },
      { id: 'e2', from: 'src', to: 'waf-1' },
      { id: 'e3', from: 'cdn-1', to: 'lb-1' },
      { id: 'e4', from: 'waf-1', to: 'lb-1' },
      { id: 'e5', from: 'lb-1', to: 'web-1' },
      { id: 'e6', from: 'lb-1', to: 'web-2' },
      { id: 'e7', from: 'web-1', to: 'cache-1' },
      { id: 'e8', from: 'web-2', to: 'cache-1' },
      { id: 'e9', from: 'cache-1', to: 'sql-1' },
      { id: 'e10', from: 'web-1', to: 'kafka-1' },
      { id: 'e11', from: 'web-2', to: 'kafka-1' },
      { id: 'e12', from: 'kafka-1', to: 'worker-1' },
      { id: 'e13', from: 'worker-1', to: 'sql-1' }
    ]
  },
  {
    id: 'spotify',
    name: 'Spotify AI Audio & Discover Weekly',
    company: 'Spotify',
    badge: '100M+ Songs & AI RAG',
    emoji: '🎵',
    color: 'from-emerald-600/30 to-green-900/40',
    borderColor: 'border-emerald-500/50',
    tagline: 'High-speed audio CDN with real-time Vector DB + GPU LLM recommendations and persistent song metadata store.',
    targetRps: 28000,
    keyFeatures: ['Audio CDN Chunks', 'Vector Embeddings', 'GPU Inference Cluster', 'Redis Cache', 'Postgres Metadata'],
    nodes: [
      { id: 'src', type: 'SOURCE', x: 60, y: 220, config: {} },
      { id: 'cdn-1', type: 'CDN', x: 260, y: 140, config: { hitRatio: 1 } },
      { id: 'lb-1', type: 'LB', x: 470, y: 220, config: { algorithm: 1 } },
      { id: 'web-1', type: 'WEB', x: 680, y: 220, config: { tier: 1 } },
      { id: 'ai-1', type: 'VECTOR_AI', x: 920, y: 120, config: { batching: 1 } },
      { id: 'cache-1', type: 'CACHE', x: 920, y: 320, config: { eviction: 1 } },
      { id: 'sql-1', type: 'SQL', x: 1140, y: 220, config: { scaling: 1 } }
    ],
    edges: [
      { id: 'e1', from: 'src', to: 'cdn-1' },
      { id: 'e2', from: 'cdn-1', to: 'lb-1' },
      { id: 'e3', from: 'lb-1', to: 'web-1' },
      { id: 'e4', from: 'web-1', to: 'ai-1' },
      { id: 'e5', from: 'web-1', to: 'cache-1' },
      { id: 'e6', from: 'cache-1', to: 'sql-1' },
      { id: 'e7', from: 'ai-1', to: 'sql-1' }
    ]
  },
  {
    id: 'uber',
    name: 'Uber Real-Time Geospatial Dispatch',
    company: 'Uber',
    badge: '10M+ Concurrent Trips',
    emoji: '🚗',
    color: 'from-blue-600/30 to-slate-900/40',
    borderColor: 'border-blue-500/50',
    tagline: 'Surge-buffered Kafka streams decoupling GPS driver locations from trip-matching worker pools and in-memory spatial caches.',
    targetRps: 35000,
    keyFeatures: ['L7 WAF Bot Scrubbing', 'Kafka Event Stream', 'Ringpop Sharded Workers', 'Redis Geo-Index', 'Schemaless Sharded DB'],
    nodes: [
      { id: 'src', type: 'SOURCE', x: 60, y: 220, config: {} },
      { id: 'waf-1', type: 'WAF', x: 260, y: 220, config: { mode: 1 } },
      { id: 'lb-1', type: 'LB', x: 470, y: 220, config: { algorithm: 1 } },
      { id: 'web-1', type: 'WEB', x: 680, y: 220, config: { tier: 1 } },
      { id: 'kafka-1', type: 'QUEUE', x: 900, y: 150, config: { partitions: 1 } },
      { id: 'cache-1', type: 'CACHE', x: 900, y: 290, config: { eviction: 1 } },
      { id: 'worker-1', type: 'WORKER', x: 1120, y: 150, config: { tier: 1 } },
      { id: 'sql-1', type: 'SQL', x: 1120, y: 290, config: { scaling: 1 } }
    ],
    edges: [
      { id: 'e1', from: 'src', to: 'waf-1' },
      { id: 'e2', from: 'waf-1', to: 'lb-1' },
      { id: 'e3', from: 'lb-1', to: 'web-1' },
      { id: 'e4', from: 'web-1', to: 'kafka-1' },
      { id: 'e5', from: 'web-1', to: 'cache-1' },
      { id: 'e6', from: 'kafka-1', to: 'worker-1' },
      { id: 'e7', from: 'worker-1', to: 'sql-1' },
      { id: 'e8', from: 'cache-1', to: 'sql-1' }
    ]
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Edge Anycast & DDoS Shield',
    company: 'Cloudflare',
    badge: '300+ Edge Cities & 55M RPS',
    emoji: '🛡️',
    color: 'from-amber-600/30 to-orange-900/40',
    borderColor: 'border-orange-500/50',
    tagline: 'Perimeter Anycast edge terminating 99% of DDoS bot floods and serving static media at 6ms before reaching origin compute.',
    targetRps: 45000,
    keyFeatures: ['Anycast Edge DNS', 'Global CDN Cache', 'L7 Deep WAF Inspection', 'Load Balancer Origin', 'Postgres Primary Tier'],
    nodes: [
      { id: 'src', type: 'SOURCE', x: 60, y: 220, config: {} },
      { id: 'waf-1', type: 'WAF', x: 260, y: 150, config: { mode: 1 } },
      { id: 'cdn-1', type: 'CDN', x: 260, y: 290, config: { hitRatio: 1 } },
      { id: 'lb-1', type: 'LB', x: 490, y: 220, config: { algorithm: 1 } },
      { id: 'web-1', type: 'WEB', x: 720, y: 220, config: { tier: 1 } },
      { id: 'cache-1', type: 'CACHE', x: 940, y: 220, config: { eviction: 1 } },
      { id: 'sql-1', type: 'SQL', x: 1140, y: 220, config: { scaling: 1 } }
    ],
    edges: [
      { id: 'e1', from: 'src', to: 'waf-1' },
      { id: 'e2', from: 'src', to: 'cdn-1' },
      { id: 'e3', from: 'waf-1', to: 'lb-1' },
      { id: 'e4', from: 'cdn-1', to: 'lb-1' },
      { id: 'e5', from: 'lb-1', to: 'web-1' },
      { id: 'e6', from: 'web-1', to: 'cache-1' },
      { id: 'e7', from: 'cache-1', to: 'sql-1' }
    ]
  }
];

// ============================================================================
// 11. ARCHITECT BADGES & STREAK REWARDS
// ============================================================================
export const STREAK_REWARDS = [
  { day: 1, xpBonus: 50, title: 'Day 1: Incident Initiate', perk: '+50 XP Base Bonus', icon: '⚡' },
  { day: 2, xpBonus: 75, title: 'Day 2: Steady Hand', perk: '+75 XP & Low Latency Crest', icon: '🛡️' },
  { day: 3, xpBonus: 100, title: 'Day 3: Uptime Sentinel', perk: '🔥 1.25x XP Multiplier & Sentinel Badge', icon: '🔥' },
  { day: 4, xpBonus: 125, title: 'Day 4: Cluster Veteran', perk: '+125 XP & Surge Tolerance', icon: '🌊' },
  { day: 5, xpBonus: 150, title: 'Day 5: Chaos Shield', perk: '+150 XP & Auto-Heal Crest', icon: '🐒' },
  { day: 6, xpBonus: 200, title: 'Day 6: Staff Architect', perk: '+200 XP & Telemetry Halo', icon: '⭐' },
  { day: 7, xpBonus: 500, title: 'Day 7: Five-Nines Titan', perk: '👑 1.50x XP Multiplier & Titan Trophy', icon: '👑' }
];

export const ARCHITECT_BADGES = [
  {
    id: 'first_wire',
    title: 'First Pipeline Wire',
    icon: '🔌',
    rarity: 'Common',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300',
    xpReward: 100,
    description: 'Connect your first traffic flow wire between Internet Ingress and a compute node.'
  },
  {
    id: 'cache_king',
    title: 'Cache is King',
    icon: '⚡',
    rarity: 'Rare',
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300',
    xpReward: 200,
    description: 'Deploy a Redis Cache Cluster to absorb read queries and shield your relational database.'
  },
  {
    id: 'ddos_bastion',
    title: 'DDoS Bastion',
    icon: '🛡️',
    rarity: 'Rare',
    color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/40 text-indigo-300',
    xpReward: 250,
    description: 'Deploy a WAF & Rate Limiter to inspect L7 traffic and filter rogue packet floods.'
  },
  {
    id: 'chaos_tamer',
    title: 'Chaos Monkey Tamer',
    icon: '🐒',
    rarity: 'Epic',
    color: 'from-rose-500/20 to-red-500/20 border-rose-500/40 text-rose-300',
    xpReward: 350,
    description: 'Survive a live Chaos Monkey sabotage strike and successfully hotfix the severed node.'
  },
  {
    id: 'streak_fire',
    title: 'Uptime Sentinel',
    icon: '🔥',
    rarity: 'Epic',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300',
    xpReward: 300,
    description: 'Maintain a 3-day consecutive Daily Incident challenge streak.'
  },
  {
    id: 'streak_titan',
    title: 'Five-Nines Titan',
    icon: '👑',
    rarity: 'Legendary',
    color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/50 text-yellow-300',
    xpReward: 600,
    description: 'Maintain a 7-day consecutive Daily Incident challenge streak.'
  },
  {
    id: 'wave_conqueror',
    title: 'Tsunami Breaker',
    icon: '🌊',
    rarity: 'Epic',
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/40 text-blue-300',
    xpReward: 400,
    description: 'Survive Wave 3 or higher in Endless Survival Wave mode.'
  },
  {
    id: 'frugal_finops',
    title: 'Frugal FinOps Master',
    icon: '💰',
    rarity: 'Rare',
    color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/40 text-emerald-300',
    xpReward: 250,
    description: 'Pass any production mission with total hourly compute cost under $200/hr.'
  },
  {
    id: 'iconic_architect',
    title: 'Iconic Architect',
    icon: '🏛️',
    rarity: 'Rare',
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-300',
    xpReward: 200,
    description: 'Explore and deploy any Iconic Architecture Preset (Netflix, Spotify, Uber, Cloudflare).'
  },
  {
    id: 'staff_fellow',
    title: 'Mythic Reliability Fellow',
    icon: '⭐',
    rarity: 'Legendary',
    color: 'from-amber-400/25 to-yellow-300/25 border-yellow-400/70 text-yellow-200',
    xpReward: 1000,
    description: 'Conquer all 5 Campaign levels and achieve the highest title in distributed systems.'
  }
];

// ============================================================================
// 12. LEVEL MANAGERS & CAREER PROGRESSION DOSSIER
// ============================================================================
export const LEVEL_MANAGERS = [
  {
    level: 1,
    name: 'Kenji',
    roleTag: 'Startup Tech Lead',
    avatarKey: 'angry_manager',
    badgeColor: 'from-rose-500 to-amber-500',
    snackName: 'Crunchy Volcano Chips',
    snackEmoji: '🥔',
    snackSounds: ['*CRUNCH!*', '*CHOMP!*', '*CRUNCH CRUNCH!*'],
    drinkName: 'Code Fueled Coffee',
    drinkEmoji: '☕',
    baseSalary: '$95,000 / yr',
    hikeAmount: '+$50,000 / yr (+52.6% Hike!)',
    promotedSalary: '$145,000 / yr',
    currentJobTitle: 'Junior SRE Associate',
    promotedJobTitle: 'Mid-Level Infrastructure Engineer',
    scoldQuotes: [
      'FIX IT ASAP!! THE BOARD OF DIRECTORS IS WATCHING THE DASHBOARD!!',
      'P99 LATENCY IS SPIKING! ARE YOU RUNNING POSTGRES ON A TOASTER?!',
      'WHO MERGED TO PRODUCTION ON A FRIDAY?! REVERT OR DIE!!',
      'I DIDN\'T PROMISE 99.999% SLA SO YOU COULD SLEEP!',
      'EVERY PACKET YOU DROP IS COMING OUT OF MY ANNUAL BONUS!!',
      'WHY IS THE MESSAGE QUEUE BACKLOGGED?! DO WORKERS HAVE A UNION NOW?!'
    ],
    pokeQuotes: [
      'DON\'T CLICK ME!! CLICK THE DAMN SERVERS!!',
      'HEY! WATCH THE SUIT! YOU MADE ME DROP A VOLCANO CHIP!!',
      'WHAT DO YOU WANT?! ADD MORE CACHE AND LESS POKING!!'
    ],
    congratsTitle: 'HOLY CRAP, YOU ACTUALLY DID IT!!',
    congratsSpeech: 'I was convinced the database would melt and the VCs would pull our funding! But the cluster held! My quarterly bonus is safe! YOU EARNED THIS PROMOTION AND SALARY HIKE, ARCHITECT!!',
    nextManagerWarning: 'Beware... on Level 2, your new manager is Daiki. He is on a permanent donut sugar rush and his throughput expectations are completely unhinged. Good luck!'
  },
  {
    level: 2,
    name: 'Daiki',
    roleTag: 'Throughput & Scaling Guru',
    avatarKey: 'manager_daiki',
    badgeColor: 'from-pink-500 to-purple-500',
    snackName: 'Hyper-Glazed Sprinkles Donut',
    snackEmoji: '🍩',
    snackSounds: ['*NOM NOM!*', '*MUNCH!*', '*SUGAR RUSH!*'],
    drinkName: 'Triple-Shot Taro Boba',
    drinkEmoji: '🧋',
    baseSalary: '$145,000 / yr',
    hikeAmount: '+$65,000 / yr (+44.8% Hike!)',
    promotedSalary: '$210,000 / yr',
    currentJobTitle: 'Mid-Level Infrastructure Engineer',
    promotedJobTitle: 'Senior Distributed Systems Architect',
    scoldQuotes: [
      'P99 IS OVER 45MS?! WE ARE LOSING 10,000 VIRAL USERS PER MINUTE!!',
      'I EAT DONUTS WHEN I\'M ANXIOUS AND I\'VE EATEN FOURTEEN TODAY!!',
      'NOM NOM NOM... RE-ROUTE THROUGH THE CDN OR I\'M REVOKING AWS KEYS!!',
      'SCALE THE WEB REPLICAS! WHY IS HORIZONTAL AUTOSCALING SLEEPING?!',
      'DO NOT LOOK AT MY BOBA! LOOK AT THE TRAFFIC SATURATION BARS!!'
    ],
    pokeQuotes: [
      'HANDS OFF THE GLASSES! GO OPTIMIZE THE CACHE HIT RATIO!!',
      'YOU MADE ME DROP SPRINKLES ON THE PRODUCTION RUNBOOK!!',
      'I DON\'T HAVE TIME FOR YOUR CLICKS! 30,000 RPS IS ROLLING IN!!'
    ],
    congratsTitle: 'VIRAL LAUNCH SURVIVED!! SENSATIONAL WORK!!',
    congratsSpeech: 'The viral surge was off the charts, but your caching layer absorbed 88% of queries! Executive leadership was blown away! Here is your official promotion and a massive salary jump!',
    nextManagerWarning: 'Level 3 is headed by Director Ryoko from Security & Compliance. She is ruthless, eats pure wasabi, and will fail you if even one bot slips through!'
  },
  {
    level: 3,
    name: 'Ryoko',
    roleTag: 'Director of Security & Compliance',
    avatarKey: 'manager_ryoko',
    badgeColor: 'from-rose-600 to-red-800',
    snackName: 'Ultra-Spicy Wasabi Crackers',
    snackEmoji: '🍘',
    snackSounds: ['*CRUNCH!*', '*SPICY HUFF!*', '*WASABI CRUNCH!*'],
    drinkName: 'Pure Ceremonial Matcha',
    drinkEmoji: '🍵',
    baseSalary: '$210,000 / yr',
    hikeAmount: '+$90,000 / yr (+42.8% Hike!)',
    promotedSalary: '$300,000 / yr',
    currentJobTitle: 'Senior Distributed Systems Architect',
    promotedJobTitle: 'Principal Reliability & Security Commander',
    scoldQuotes: [
      'DDOS BOTS DETECTED! WHERE IS THE WAF SHIELD AT THE PERIMETER?!',
      'ZERO TRUST! ZERO EXCUSES! *CRUNCH* IS TRAFFIC PROPERLY FILTERED?!',
      'IF AUDITORS SEE UNFILTERED BOT PACKETS, WE\'RE WEARING ORANGE SUITS!!',
      'THE PERIMETER IS LEAKING! BLOCK THE BAD ACTORS IMMEDIATELY!!',
      'THIS WASABI IS BURNING MY TONGUE AND YOUR LATENCY IS BURNING MY EYES!!'
    ],
    pokeQuotes: [
      'DO NOT TOUCH COMPLIANCE PROTOCOLS!! GET BACK TO HARDENING THE PERIMETER!!',
      'YOU DARE INTERRUPT A ZERO-TRUST AUDIT WITH A MOUSE CLICK?!',
      'ONE MORE POKE AND I\'M QUARANTINING YOUR WORKSTATION!!'
    ],
    congratsTitle: 'PERIMETER SECURED! ZERO PENETRATIONS!!',
    congratsSpeech: '99.8% of malicious bot traffic dropped at the edge without single origin degradation. The CISO sent personal commendations. You\'ve earned this Senior Principal title and a lucrative pay bump!',
    nextManagerWarning: 'Brace yourself. Level 4 is commanded by Viktor. He runs live Chaos Monkey drills in production and eats popcorn while servers combust!'
  },
  {
    level: 4,
    name: 'Viktor',
    roleTag: 'Chaos Resilience Commander',
    avatarKey: 'manager_viktor',
    badgeColor: 'from-amber-500 to-orange-600',
    snackName: 'Mega-Butter Cyber-Popcorn',
    snackEmoji: '🍿',
    snackSounds: ['*CHOMP!*', '*POPCORN CRUNCH!*', '*BUTTERY MUNCH!*'],
    drinkName: 'High-Voltage Overclock Energy Drink',
    drinkEmoji: '⚡',
    baseSalary: '$300,000 / yr',
    hikeAmount: '+$120,000 / yr (+40.0% Hike!)',
    promotedSalary: '$420,000 / yr',
    currentJobTitle: 'Principal Reliability & Security Commander',
    promotedJobTitle: 'Chief Distinguished Infrastructure Fellow',
    scoldQuotes: [
      'CHAOS MONKEY IS RIPPING CORDS OUT OF THE SERVERS!! FAILOVER NOW!!',
      'THE QUEUE IS BURNING!! *CHOMP CHOMP* DECOUPLE THE WORKERS!!',
      'WHY ARE WE BUFFERING?! DO WORKERS HAVE A UNION MEETING RIGHT NOW?!',
      'MULTI-REGION REDUNDANCY! WHERE ARE THE STANDBY NODES?! MOVE!!',
      'I LOVE THE SMELL OF MELTING SERVERS WITH FRESH POPCORN!!'
    ],
    pokeQuotes: [
      'DON\'T POKE THE COMMANDER WHILE CHAOS MONKEY IS ON THE LOOSE!!',
      'YOU SHOOK MY POPCORN BUCKET! I\'M UNLEASHING ANOTHER OUTAGE!!',
      'FIRE IN THE HOLE! FIX THE REDUNDANT PATHWAYS!!'
    ],
    congratsTitle: 'CHAOS DEFEATED! UNBREAKABLE RESILIENCE!!',
    congratsSpeech: 'Instances were assassinated left and right, yet your decoupled pipeline rerouted packets in sub-20ms with 100% uptime! You are officially an Infrastructure Legend. Take this executive salary hike!',
    nextManagerWarning: 'The final frontier awaits: Level 5. Executive VP Hiroshi himself is overseeing the Black Friday global mega-sale. He eats gold-leaf macarons and fires people for 10ms spikes!'
  },
  {
    level: 5,
    name: 'Hiroshi',
    roleTag: 'Executive VP & Board Member',
    avatarKey: 'manager_hiroshi',
    badgeColor: 'from-amber-400 via-yellow-300 to-amber-600',
    snackName: '24k Gold-Leaf French Macarons',
    snackEmoji: '🧁',
    snackSounds: ['*DELICATE MUNCH!*', '*ROYAL CRUNCH!*', '*GOLDEN CHEW!*'],
    drinkName: 'Vintage Sparkling Glacier Water',
    drinkEmoji: '🍾',
    baseSalary: '$420,000 / yr',
    hikeAmount: '+$180,000 / yr + 15,000 RSUs (Ultimate Executive Package!)',
    promotedSalary: '$600,000 / yr + Equity',
    currentJobTitle: 'Chief Distinguished Infrastructure Fellow',
    promotedJobTitle: '👑 Global Chief Architecture Officer (Legendary Partner)',
    scoldQuotes: [
      'WALL STREET OPENS IN 5 MINUTES!! FIX THE BLACK FRIDAY TRAFFIC SURGE!!',
      'MY STOCK OPTIONS ARE MELTING!! *MUNCH* SCALE TO 50,000 RPS RIGHT NOW!!',
      'DO I LOOK LIKE A C-SUITE TITAN WHO ACCEPTS 99.9%?! FIVE NINES OR RETIREMENT IS OVER!!',
      'THE BOARD IS WATCHING THE TELEMETRY TICKER LIVE ON BLOOMBERG!!',
      'ONE GLITCH AND MY YACHT RESERVATION CANCELS!! FIX THE TOPOLOGY!!'
    ],
    pokeQuotes: [
      'DO NOT TOUCH MY BESPOKE PINSTRIPE SUIT WITH YOUR GREASY CODING HANDS!!',
      'YOU MADE ME CHOKE ON MY 24K GOLD-LEAF MACARON!! WORK FASTER!!',
      'DO YOU WANT ME TO FIRE YOUR ENTIRE DIVISION?! GO TUNE THE DATABASE!!'
    ],
    congratsTitle: '👑 THE PINNACLE OF CLOUD ARCHITECTURE REACHED!!',
    congratsSpeech: 'Black Friday traffic shattered all world records. Zero dropped packets. Sub-15ms P99 across the entire planetary grid. The Board of Directors has unanimously appointed you Global Chief Architecture Officer! You have conquered System Saviour!!',
    nextManagerWarning: 'You have conquered all 5 enterprise tiers! Enjoy your limitless sandbox and global leaderboards!'
  }
];

// Server-side Authoritative Badge Evaluation
export function evaluateUnlockedBadges(nodes = [], edges = [], outcome = {}, streak = 0) {
  const earned = [];
  const nodeTypes = new Set(nodes.map((n) => n.type));

  if (edges.length > 0) earned.push('first_wire');
  if (nodeTypes.has('CACHE') && outcome.won) earned.push('cache_king');
  if (nodeTypes.has('WAF') && outcome.won) earned.push('ddos_bastion');
  if (outcome.chaosSurvived) earned.push('chaos_tamer');
  if (streak >= 3) earned.push('streak_fire');
  if (streak >= 7) earned.push('streak_titan');
  if (outcome.survivalWave >= 3) earned.push('wave_conqueror');
  if (outcome.won && outcome.totalCost <= 200) earned.push('frugal_finops');
  if (outcome.isIconic) earned.push('iconic_architect');
  if (outcome.levelId >= 5 && outcome.won) earned.push('staff_fellow');

  return earned;
}

