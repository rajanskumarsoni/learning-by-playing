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
    maxBudgetHr: 560,
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
export function evaluateArchitecture(nodes = [], edges = [], incomingRps = 1000, trafficMix = {}, maxBudgetHr = null) {
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
        diagnostics.push(`BOTTLENECK: ${spec.name} is overloaded at ${pct}% capacity! Add Redis Cache upstream, buffer writes via Kafka, or upgrade to Sharded Cluster.`);
      } else if (n.type === 'WEB') {
        diagnostics.push(`BOTTLENECK: ${spec.name} is saturated at ${pct}%! Add a Load Balancer with redundant Web Servers or offload reads with CDN.`);
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
    level.maxBudgetHr
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
