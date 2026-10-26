import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Server, Database, Shield, Globe, Cpu, Layers, Activity, Zap, Play, Pause,
  RotateCcw, AlertTriangle, CheckCircle2, HelpCircle, Github, Plus, Trash2,
  Settings, Award, Terminal, Flame, ChevronRight, Copy, Check, Download,
  FastForward, Eye, Sliders, Share2, Lock, Unlock, Box, HardDrive, Network,
  ArrowRight, Sparkles, Info, X, RefreshCw, ZoomIn, ZoomOut, Maximize2, Move,
  BookOpen, Search, Bot
} from 'lucide-react';

// ============================================================================
// 1. TRAFFIC TYPES (6 REALISTIC CLOUD TRAFFIC FLOWS)
// ============================================================================
const TRAFFIC_TYPES = {
  STATIC: {
    id: 'STATIC',
    name: 'Static Media & Assets',
    color: '#22c55e', // Green
    emoji: '🖼️',
    description: 'Images, CSS, and video chunks. Best offloaded at edge via CDN or S3.',
  },
  READ: {
    id: 'READ',
    name: 'Database Reads (SELECT)',
    color: '#38bdf8', // Sky Blue
    emoji: '📖',
    description: 'User feeds, profiles, and catalog queries. Cacheable in Redis or Read Replicas.',
  },
  WRITE: {
    id: 'WRITE',
    name: 'Persistent Writes (INSERT/TX)',
    color: '#f97316', // Orange
    emoji: '✍️',
    description: 'Orders, payments, and state mutations. Buffered via Kafka and written to ACID DB.',
  },
  SEARCH: {
    id: 'SEARCH',
    name: 'Full-Text Search Queries',
    color: '#06b6d4', // Cyan
    emoji: '🔍',
    description: 'Fuzzy searches & filters. Fast on Elasticsearch; heavy penalty on SQL.',
  },
  BOT: {
    id: 'BOT',
    name: 'Malicious DDoS & Bots',
    color: '#ef4444', // Red
    emoji: '👾',
    description: 'Abusive crawler spikes & volumetric attacks. Must be blocked at edge by WAF.',
  },
  AI_PROMPT: {
    id: 'AI_PROMPT',
    name: 'LLM & AI RAG Inference',
    color: '#d946ef', // Fuchsia
    emoji: '🤖',
    description: 'Vector embeddings and prompt generation. Requires GPU clusters & Vector DB.',
  }
};

// ============================================================================
// 2. COMPONENT CATALOG & ARCHITECTURAL CONFIGURATIONS
// ============================================================================
const COMPONENT_CATALOG = {
  SOURCE: {
    type: 'SOURCE',
    name: 'Internet Ingress',
    category: 'Edge',
    icon: Globe,
    color: 'from-sky-500 to-blue-600',
    borderColor: 'border-sky-500',
    baseCost: 0,
    baseCapacity: 100000,
    baseLatency: 5,
    description: 'Client traffic ingress generating live request streams.',
    isRemovable: false,
    beginnerTip: 'The front door of your cloud! All user requests enter here.',
    analogyTitle: 'The Stadium Turnstiles',
    analogyStory: 'Think of Internet Ingress like the front gates and ticket turnstiles of a 100,000-seat stadium. Fans (requests) arrive from everywhere across the city. Without proper gates, crowds crush into an uncontrollable bottleneck.',
    caseStudyCompany: 'Cloudflare & Akamai',
    caseStudyStory: 'Global Anycast DNS networks route billions of users to the nearest physical data center (PoP) in over 300 cities worldwide, terminating TLS handshake connections in single-digit milliseconds before forwarding traffic to origin servers.',
    architectureTips: 'Always placed as the origin source. Cannot be removed. Connect downstream to WAF, CDN, or Load Balancer.'
  },
  WAF: {
    type: 'WAF',
    name: 'WAF & Rate Limiter',
    category: 'Edge',
    icon: Shield,
    color: 'from-rose-500 to-red-600',
    borderColor: 'border-rose-500',
    baseCost: 45,
    baseCapacity: 25000,
    baseLatency: 4,
    description: 'Inspects L7 traffic. Filters 98% of malicious DDoS bots and rate-limits abusive spikes.',
    beginnerTip: 'Like the security bouncer at the gate checking IDs to keep pranksters and attackers out.',
    analogyTitle: 'The Nightclub Bouncer with a Metal Detector',
    analogyStory: 'Imagine an exclusive club where anyone can knock. Without a bouncer, rival mobs, pranksters with airhorns, and ticket scalpers flood the dance floor. The WAF checks every incoming request against a blacklist of bad behavior and turns malicious traffic away immediately.',
    caseStudyCompany: 'Cloudflare / AWS WAF',
    caseStudyStory: 'In 2022, Cloudflare mitigated a record-breaking 26 million request-per-second HTTPS DDoS attack targeting a customer portal. By terminating malicious IP swarms at the edge, the customer origin servers experienced zero load increase.',
    architectureTips: 'Position immediately after Internet Ingress (Source -> WAF). Blocking bad packets early prevents expensive CPU and database saturation downstream.',
    configOptions: {
      mode: { label: 'Protection Shield', values: ['Standard Rate Limit', 'AI Deep Inspection (+40% Cost)'], costMult: [1, 1.4] }
    }
  },
  CDN: {
    type: 'CDN',
    name: 'Cloud CDN Edge',
    category: 'Edge',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500',
    baseCost: 55,
    baseCapacity: 30000,
    baseLatency: 6,
    description: 'Edge cache terminating 95% of Static Media and 65-80% of Read requests at ultra-low 6ms latency.',
    beginnerTip: 'Like posting popular flyers on the school bulletin board so everyone does not have to ask the office.',
    analogyTitle: 'The Neighborhood Convenience Store (7-Eleven)',
    analogyStory: 'Instead of driving 40 miles to a distant dairy farm every time you want a carton of milk, your neighborhood 7-Eleven keeps milk in stock right down your street. A CDN places copies of images, CSS, and read queries in local edge caches right next to your users.',
    caseStudyCompany: 'Netflix Open Connect',
    caseStudyStory: 'Netflix built Open Connect, deploying custom storage appliances directly inside thousands of local Internet Service Providers (ISPs) worldwide. When you watch a movie, 100% of video bits stream from an ISP box down your street, completely bypassing transatlantic transit cables.',
    architectureTips: 'Place between Internet Ingress and your Load Balancer. Handles 95% of static assets and up to 80% of read queries at sub-10ms response times.',
    configOptions: {
      hitRatio: { label: 'Edge Cache Policy', values: ['Standard (65% Read Hit)', 'Aggressive Edge (80% Read Hit)'], hitRate: [0.65, 0.80], costMult: [1, 1.35] }
    }
  },
  LB: {
    type: 'LB',
    name: 'Load Balancer',
    category: 'Routing',
    icon: Network,
    color: 'from-indigo-500 to-purple-600',
    borderColor: 'border-indigo-500',
    baseCost: 45,
    baseCapacity: 30000,
    baseLatency: 5,
    description: 'Distributes traffic evenly across downstream compute servers with health checks.',
    beginnerTip: 'Like a smart traffic cop directing cars into multiple lanes so no single lane jams up.',
    analogyTitle: 'The Airport Security Line Coordinator',
    analogyStory: 'When 2,000 travelers arrive at an airport security checkpoint, a queuing marshal directs travelers to whichever metal detector line is currently shortest. If one screener takes a lunch break, the coordinator routes travelers to the other screening lanes.',
    caseStudyCompany: 'Uber Reverse Proxy & Envoy Mesh',
    caseStudyStory: 'Uber processes millions of rider/driver GPS heartbeats per second using Envoy load balancers. If a microservice pod crashes in AWS us-east-1, the load balancer removes it in under 200 milliseconds, routing traffic to healthy instances without dropping rides.',
    architectureTips: 'Position upstream of API/Web Servers. Essential for horizontal scaling and high availability—wiring 2+ servers behind an LB eliminates single points of failure (SPOF).',
    configOptions: {
      algorithm: { label: 'Routing Algorithm', values: ['Round Robin (1x)', 'Least Connections (+10% Cost)'], costMult: [1, 1.1] }
    }
  },
  WEB: {
    type: 'WEB',
    name: 'API / Web Server',
    category: 'Compute',
    icon: Server,
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500',
    baseCost: 60,
    baseCapacity: 2400,
    baseLatency: 18,
    description: 'Stateless compute instances running business logic and routing downstream queries.',
    beginnerTip: 'The waiters in a restaurant taking customer orders and communicating with the kitchen.',
    analogyTitle: 'The Restaurant Waitstaff',
    analogyStory: 'Waiters do not cook the steaks (databases do that) and they do not store the ingredients (storages do that). They greet diners, parse menu orders, calculate bills, and pass requests to the kitchen. When dining rooms get packed, you hire more waiters.',
    caseStudyCompany: 'Discord Kubernetes Fleet',
    caseStudyStory: 'Discord runs stateless Elixir & Rust microservices across tens of thousands of container pods. Because the web servers store zero session state in local memory, Discord can scale from 5,000 to 20,000 pods dynamically during global gaming spikes.',
    architectureTips: 'Keep servers stateless. Never store session files on local disks. Connect downstream to Caches, Databases, Queues, and Search clusters.',
    configOptions: {
      tier: { label: 'Instance Size', values: ['t3.medium (1x)', 'c6i.xlarge (2.5x)', 'c6i.4xlarge (5x)'], capMult: [1, 2.5, 5], costMult: [1, 2.1, 4.0] }
    }
  },
  CACHE: {
    type: 'CACHE',
    name: 'Redis Cache Cluster',
    category: 'Data',
    icon: Layers,
    color: 'from-red-500 to-rose-600',
    borderColor: 'border-red-500',
    baseCost: 70,
    baseCapacity: 16000,
    baseLatency: 3,
    description: 'In-memory key-value store. Absorbs 75-88% of database Read queries in 3ms.',
    beginnerTip: 'Writing answers on sticky notes on your desk so you answer instantly without opening the encyclopedia.',
    analogyTitle: 'The Sticky Note on Your Computer Monitor',
    analogyStory: 'If your coworker asks you for the office WiFi password 30 times a day, you do not unlock the heavy filing cabinet in the basement every time. You jot the password on a sticky note attached to your monitor for an instant 1-second answer.',
    caseStudyCompany: 'Twitter / X Home Timeline Cache',
    caseStudyStory: 'When 200 million users refresh their Twitter feeds, querying relational SQL tables would cause immediate disk collapse. Twitter stores serialized timeline IDs directly in Redis RAM clusters, serving 99% of read requests in under 4ms.',
    architectureTips: 'Place between Web Servers and PostgreSQL (Web -> Cache -> SQL). Absorbs 75-88% of read load, shielding slow disks from read saturation.',
    configOptions: {
      eviction: { label: 'Cache Strategy', values: ['Standard LRU (75% Hit)', 'Semantic + LRU (88% Hit)'], hitRate: [0.75, 0.88], costMult: [1, 1.5] }
    }
  },
  QUEUE: {
    type: 'QUEUE',
    name: 'Kafka Message Queue',
    category: 'Async',
    icon: Activity,
    color: 'from-fuchsia-500 to-pink-600',
    borderColor: 'border-fuchsia-500',
    baseCost: 75,
    baseCapacity: 22000,
    baseLatency: 8,
    description: 'Decouples heavy Write bursts! Buffers write spikes by 65% for downstream workers.',
    beginnerTip: 'A numbered ticket dispenser at a busy bakery so customers form an orderly line instead of mobbing the counter.',
    analogyTitle: 'The Delicatessen Numbered Ticket Dispenser',
    analogyStory: 'When 100 hungry shoppers enter a deli at lunchtime, having them all scream their sandwich orders at the lone chef causes total chaos and dropped orders. Instead, each customer takes a numbered ticket and waits calmly while the chef prepares orders in sequence.',
    caseStudyCompany: 'LinkedIn & Uber Event Streams',
    caseStudyStory: 'LinkedIn invented Apache Kafka to handle hundreds of billions of user clicks and analytics events per day. During massive traffic spikes, write events are safely written to sequential commit logs in milliseconds, allowing backend processors to catch up without data loss.',
    architectureTips: 'Place between Web Servers and Async Workers / Databases for heavy write workflows (checkouts, reservations, analytics). Prevents write spikes from locking relational tables.',
    configOptions: {
      partitions: { label: 'Broker Partitions', values: ['8 Partitions (1x)', '32 Partitions (2x)'], capMult: [1, 2], costMult: [1, 1.55] }
    }
  },
  WORKER: {
    type: 'WORKER',
    name: 'Async Worker Pool',
    category: 'Compute',
    icon: Cpu,
    color: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-500',
    baseCost: 65,
    baseCapacity: 4500,
    baseLatency: 15,
    description: 'Consumes jobs from Kafka Queue and writes batches asynchronously to the database.',
    beginnerTip: 'Chefs working quietly in the background processing tickets from the order rack.',
    analogyTitle: 'The Kitchen Prep Cook Team',
    analogyStory: 'While the front counter clerks greet visitors, the prep cooks in the back focus 100% on chopping vegetables and baking bread in batches. They do not talk to diners; they pull orders from the carousel rack and finish them efficiently.',
    caseStudyCompany: 'Shopify Flash Sale Batching',
    caseStudyStory: 'During Black Friday, Shopify processes over $3.3 billion in merchant orders. Background worker pools consume order messages from queues, running fraud checks, inventory adjustments, and email dispatches asynchronously without blocking the user checkout button.',
    architectureTips: 'Place downstream of Kafka Message Queue and upstream of SQL Database (Queue -> Worker -> SQL).',
    configOptions: {
      tier: { label: 'Worker Concurrency', values: ['4 Workers (1x)', '12 Workers (2.5x)'], capMult: [1, 2.5], costMult: [1, 2.0] }
    }
  },
  SQL: {
    type: 'SQL',
    name: 'PostgreSQL Database',
    category: 'Data',
    icon: Database,
    color: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-500',
    baseCost: 95,
    baseCapacity: 1800,
    baseLatency: 28,
    description: 'ACID relational primary database for state persistence. Heavy uncached reads saturate disk I/O.',
    beginnerTip: 'The master hardbound record notebook. Guaranteed not to lose entries, but gets crowded if everyone writes at once.',
    analogyTitle: 'The County Deeds & Land Title Registry',
    analogyStory: 'The city land registry holds the official deed to every home. It is guarded in a fireproof vault with strict legal verification (ACID guarantees). You can never erase or double-sell land, but getting a document notarized takes deliberate paperwork and time.',
    caseStudyCompany: 'Stripe Primary Ledger',
    caseStudyStory: 'Stripe processes hundreds of billions of dollars using PostgreSQL. To ensure not a single penny is duplicated or vanished, they rely on strict ACID transactions and Write-Ahead Logging (WAL), utilizing read replicas and partition sharding as transaction volumes scale.',
    architectureTips: 'The single source of truth for persistent data. Protect it from read saturation with Redis and from write stampedes with Kafka.',
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
    icon: Search,
    color: 'from-teal-500 to-emerald-600',
    borderColor: 'border-teal-500',
    baseCost: 85,
    baseCapacity: 5000,
    baseLatency: 12,
    description: 'Inverted-index search cluster optimized for fuzzy full-text queries at 12ms.',
    beginnerTip: 'The alphabetized index at the back of a library book, finding topics 10x faster than reading every page.',
    analogyTitle: 'The Back-of-the-Book Subject Index',
    analogyStory: 'If you want to find every mention of "photosynthesis" in an 800-page biology textbook, reading every page from page 1 takes 4 hours. Flipping to the alphabetical index in the back tells you "Pages 42, 118, 203" in 2 seconds flat.',
    caseStudyCompany: 'Wikipedia & GitHub Code Search',
    caseStudyStory: 'Wikipedia handles billions of monthly search queries across 60+ million articles using Elasticsearch. Inverted indexes tokenize every word into memory shards, returning relevant articles sorted by BM25 relevance in under 15 milliseconds.',
    architectureTips: 'Connect downstream from Web Servers. Offloads expensive fuzzy and text search queries from your primary relational database.',
    configOptions: {
      shards: { label: 'Index Sharding', values: ['2 Shards (1x)', '6 Shards + Replica (2.5x)'], capMult: [1, 2.5], costMult: [1, 1.8] }
    }
  },
  STORAGE: {
    type: 'STORAGE',
    name: 'S3 Object Storage',
    category: 'Data',
    icon: Box,
    color: 'from-lime-500 to-green-600',
    borderColor: 'border-lime-500',
    baseCost: 40,
    baseCapacity: 15000,
    baseLatency: 22,
    description: 'Cost-effective blob vault for static media and uploads that bypass edge CDN.',
    beginnerTip: 'The school basement warehouse storing all old yearbooks and large video recordings.',
    analogyTitle: 'The Shipping Container Storage Yard',
    analogyStory: 'Storing giant boxes of seasonal clothing and old furniture in your expensive downtown living room wastes money. You put them in an inexpensive, secure shipping container depot out of town. When you need a box, you drive over and fetch it.',
    caseStudyCompany: 'Airbnb Photo Vault on Amazon S3',
    caseStudyStory: 'Airbnb hosts upload millions of high-resolution house photos. Storing these on high-performance database SSDs would cost millions of dollars a month. Storing them on S3 object storage provides 99.999999999% (11 9s) durability at 1/10th the cost of database disks.',
    architectureTips: 'Connect to Web Servers or CDN for blob uploads, static files, and media archives. Cheap, durable, and highly available.',
    configOptions: {
      redundancy: { label: 'Storage Tier', values: ['Standard S3 (1x)', 'Multi-AZ Replicated (1.8x)'], capMult: [1, 1.8], costMult: [1, 1.4] }
    }
  },
  VECTOR_AI: {
    type: 'VECTOR_AI',
    name: 'Vector DB + GPU Node',
    category: 'AI / ML',
    icon: Sparkles,
    color: 'from-violet-500 to-purple-600',
    borderColor: 'border-violet-500',
    baseCost: 175,
    baseCapacity: 4500,
    baseLatency: 38,
    description: 'High-throughput embeddings and GPU LLM token generation for AI search queries.',
    beginnerTip: 'The high-tech AI robotics lab answering complex student questions.',
    analogyTitle: 'The University Think Tank Research Professor',
    analogyStory: 'While a clerk can stamp a parking pass in 2 seconds, an Oxford research professor synthesizing cross-disciplinary answers to complex questions needs intense focus and specialized brainpower. GPU nodes are the deep-thinking professors of your cloud.',
    caseStudyCompany: 'Perplexity & ChatGPT RAG Architecture',
    caseStudyStory: 'Modern AI search tools embed user questions into high-dimensional vector spaces (e.g., 1536 floats), perform cosine similarity search across vector indexes (Pinecone/Milvus), and stream context through GPU inference clusters using TensorRT-LLM continuous batching.',
    architectureTips: 'Position downstream from Web Servers. High compute and latency requirements; combine with semantic caching on Redis to avoid redundant LLM calls.',
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
// 3. CAMPAIGN SCENARIOS & GAME MODES
// ============================================================================
const CAMPAIGN_LEVELS = [
  {
    id: 1,
    title: 'Level 1: The Garage Startup',
    concept: 'Vertical Scaling & In-Memory Caching',
    brief: 'Your new social app went viral on Hacker News! Traffic is hitting 800 RPS. A single default Web Server and SQL Database will choke under the read load. Upgrade your Web tier or insert a Redis Cache.',
    beginnerAnalogy: 'A single waiter and cook are overwhelmed! Add a Redis sticky-note board so 75% of questions are answered without bugging the kitchen.',
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
    beginnerAnalogy: 'Do not make everyone enter the building for a copy of the poster! Put a Fast Photo Booth (CDN) at the school entrance.',
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
    beginnerAnalogy: 'Hire multiple order counters (Load Balancer -> 2 Servers) and photocopy the menu (Read Replicas) so the kitchen can focus on cooking orders.',
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
    beginnerAnalogy: 'Station security guards at the door to stop bots, send searchers to an index board, and hand out numbered tickets to buyers!',
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
    beginnerAnalogy: 'Build a multi-lane highway with an AI super-brain attached, designed so even if one bridge collapses, traffic immediately detours!',
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
// 4. REAL-TIME SIMULATION & TELEMETRY ENGINE
// ============================================================================
function getNodeEffectiveStats(node) {
  const spec = COMPONENT_CATALOG[node.type];
  if (!spec) return { cost: 0, capacity: 1000, latency: 10, hitRate: 0 };

  let cost = spec.baseCost;
  let capacity = spec.baseCapacity;
  let latency = spec.baseLatency;
  let hitRate = 0;

  if (node.type === 'CDN') {
    const idx = node.config?.hitRatio || 0;
    hitRate = spec.configOptions.hitRatio.hitRate[idx];
    cost *= spec.configOptions.hitRatio.costMult[idx];
  } else if (node.type === 'WAF') {
    const idx = node.config?.mode || 0;
    cost *= spec.configOptions.mode.costMult[idx];
  } else if (node.type === 'LB') {
    const idx = node.config?.algorithm || 0;
    cost *= spec.configOptions.algorithm.costMult[idx];
  } else if (node.type === 'WEB') {
    const idx = node.config?.tier || 0;
    capacity *= spec.configOptions.tier.capMult[idx];
    cost *= spec.configOptions.tier.costMult[idx];
  } else if (node.type === 'CACHE') {
    const idx = node.config?.eviction || 0;
    hitRate = spec.configOptions.eviction.hitRate[idx];
    cost *= spec.configOptions.eviction.costMult[idx];
  } else if (node.type === 'QUEUE') {
    const idx = node.config?.partitions || 0;
    capacity *= spec.configOptions.partitions.capMult[idx];
    cost *= spec.configOptions.partitions.costMult[idx];
  } else if (node.type === 'WORKER') {
    const idx = node.config?.tier || 0;
    capacity *= spec.configOptions.tier.capMult[idx];
    cost *= spec.configOptions.tier.costMult[idx];
  } else if (node.type === 'SQL') {
    const idx = node.config?.scaling || 0;
    capacity *= spec.configOptions.scaling.capMult[idx];
    cost *= spec.configOptions.scaling.costMult[idx];
    latency *= spec.configOptions.scaling.latencyMult[idx];
  } else if (node.type === 'SEARCH') {
    const idx = node.config?.shards || 0;
    capacity *= spec.configOptions.shards.capMult[idx];
    cost *= spec.configOptions.shards.costMult[idx];
  } else if (node.type === 'STORAGE') {
    const idx = node.config?.redundancy || 0;
    capacity *= spec.configOptions.redundancy.capMult[idx];
    cost *= spec.configOptions.redundancy.costMult[idx];
  } else if (node.type === 'VECTOR_AI') {
    const idx = node.config?.batching || 0;
    capacity *= spec.configOptions.batching.capMult[idx];
    cost *= spec.configOptions.batching.costMult[idx];
    latency *= spec.configOptions.batching.latencyMult[idx];
  }

  return {
    cost: Math.round(cost),
    capacity: Math.round(capacity),
    latency: Math.round(latency),
    hitRate
  };
}

function evaluateArchitecture(nodes, edges, incomingRps, trafficMix, maxBudgetHr) {
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
    nodeMetrics[sourceNode.id].trafficIn[tType] = rpsForType;
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
        // Blocks 98% of DDoS / Bot traffic cleanly at perimeter
        outTraffic.BOT = activeTraffic.BOT * 0.02;
      } else if (node.type === 'CDN') {
        // Offloads 95% of Static Media and hitRate% of Reads at edge
        outTraffic.STATIC = activeTraffic.STATIC * 0.05;
        outTraffic.READ = activeTraffic.READ * (1 - m.hitRate);
      } else if (node.type === 'CACHE') {
        // Offloads hitRate% of Read queries in memory
        outTraffic.READ = activeTraffic.READ * (1 - m.hitRate);
      } else if (node.type === 'QUEUE') {
        // Buffers and smooths burst Write spikes by 65%
        outTraffic.WRITE = activeTraffic.WRITE * 0.35;
      } else if (node.type === 'SEARCH') {
        // Terminates search queries efficiently
        outTraffic.SEARCH = activeTraffic.SEARCH * 0.05;
      } else if (node.type === 'STORAGE') {
        // Terminates static media uploads/fetches
        outTraffic.STATIC = activeTraffic.STATIC * 0.05;
      } else if (node.type === 'VECTOR_AI') {
        // Terminates AI RAG queries
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

  // Search without Elasticsearch penalty
  if ((trafficMix.SEARCH || 0) > 0.1 && searchNodes.length === 0 && incomingRps > 10) {
    p99Latency += 45; // Table scan latency penalty on SQL
  }

  p99Latency = Math.round(p99Latency);

  // Generate actionable Root-Cause Diagnostics
  nodes.forEach((n) => {
    const m = nodeMetrics[n.id];
    const spec = COMPONENT_CATALOG[n.type];
    if (!m || !spec) return;

    if (m.isCrashed) {
      diagnostics.push(`CHAOS OUTAGE: "${spec.name}" crashed! Traffic must fail over via Load Balancer to redundant instances.`);
    } else if (m.utilization > 1.0) {
      const pct = Math.round(m.utilization * 100);
      if (n.type === 'SQL') {
        diagnostics.push(
          `BOTTLENECK: ${spec.name} is overloaded at ${pct}% capacity! Add Redis Cache upstream, buffer writes via Kafka, or upgrade to Sharded Cluster.`
        );
      } else if (n.type === 'WEB') {
        diagnostics.push(
          `BOTTLENECK: ${spec.name} is saturated at ${pct}%! Add a Load Balancer with redundant Web Servers or offload reads with CDN.`
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
// 5. MAIN REACT APPLICATION COMPONENT
// ============================================================================
export default function App() {
  // Mode & Level State
  const [gameMode, setGameMode] = useState('CAMPAIGN'); // 'CAMPAIGN' | 'SURVIVAL' | 'SANDBOX'
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const currentLevel = CAMPAIGN_LEVELS[currentLevelIdx];

  // Topology State
  const [nodes, setNodes] = useState(CAMPAIGN_LEVELS[0].initialNodes);
  const [edges, setEdges] = useState(CAMPAIGN_LEVELS[0].initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState('web-1');
  const [connectingFromId, setConnectingFromId] = useState(null);

  // Progressive Level Unlocking State (Persisted in localStorage)
  const [unlockedLevelIdx, setUnlockedLevelIdx] = useState(() => {
    try {
      const saved = localStorage.getItem('archquest_unlocked_level');
      return saved !== null ? Math.min(CAMPAIGN_LEVELS.length - 1, Math.max(0, parseInt(saved, 10))) : 0;
    } catch (e) {
      return 0;
    }
  });

  // Welcome Screen & Component Details Modal States
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [detailModalComponent, setDetailModalComponent] = useState(null);

  // Simulation State
  const [isRunning, setIsRunning] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const [waveProgress, setWaveProgress] = useState(0); // 0 to 100%
  const [chaosActive, setChaosActive] = useState(false);
  const [survivalWave, setSurvivalWave] = useState(1);
  const [sandboxRps, setSandboxRps] = useState(12000);
  const [postMortemModal, setPostMortemModal] = useState(null);
  const [showBeginnerHints, setShowBeginnerHints] = useState(true);

  // Canvas Pan, Zoom & Drag State
  const canvasRef = useRef(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeCatalogTab, setActiveCatalogTab] = useState('ALL');

  // Load level when switched (validates unlocked levels)
  const selectLevel = useCallback((idx) => {
    if (idx > unlockedLevelIdx) return;
    const lvl = CAMPAIGN_LEVELS[idx];
    setCurrentLevelIdx(idx);
    setNodes(JSON.parse(JSON.stringify(lvl.initialNodes)));
    setEdges(JSON.parse(JSON.stringify(lvl.initialEdges)));
    setSelectedNodeId(lvl.initialNodes[1]?.id || 'src');
    setConnectingFromId(null);
    setIsRunning(false);
    setWaveProgress(0);
    setPostMortemModal(null);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, [unlockedLevelIdx]);

  const switchMode = (mode) => {
    setGameMode(mode);
    setIsRunning(false);
    setWaveProgress(0);
    setPostMortemModal(null);
    setPan({ x: 0, y: 0 });
    setZoom(1);

    if (mode === 'CAMPAIGN') {
      selectLevel(currentLevelIdx);
    } else if (mode === 'SURVIVAL') {
      setSurvivalWave(1);
      setNodes([
        { id: 'src', type: 'SOURCE', x: 50, y: 220, config: {} },
        { id: 'lb-1', type: 'LB', x: 260, y: 220, config: { algorithm: 0 } },
        { id: 'web-1', type: 'WEB', x: 480, y: 220, config: { tier: 1 } },
        { id: 'sql-1', type: 'SQL', x: 760, y: 220, config: { scaling: 0 } }
      ]);
      setEdges([
        { id: 'e1', from: 'src', to: 'lb-1' },
        { id: 'e2', from: 'lb-1', to: 'web-1' },
        { id: 'e3', from: 'web-1', to: 'sql-1' }
      ]);
      setSelectedNodeId('web-1');
    } else if (mode === 'SANDBOX') {
      setNodes([
        { id: 'src', type: 'SOURCE', x: 50, y: 220, config: {} },
        { id: 'cdn-1', type: 'CDN', x: 230, y: 220, config: { hitRatio: 1 } },
        { id: 'lb-1', type: 'LB', x: 410, y: 220, config: { algorithm: 1 } },
        { id: 'web-1', type: 'WEB', x: 590, y: 140, config: { tier: 1 } },
        { id: 'web-2', type: 'WEB', x: 590, y: 300, config: { tier: 1 } },
        { id: 'cache-1', type: 'CACHE', x: 770, y: 220, config: { eviction: 1 } },
        { id: 'sql-1', type: 'SQL', x: 940, y: 220, config: { scaling: 2 } }
      ]);
      setEdges([
        { id: 'e1', from: 'src', to: 'cdn-1' },
        { id: 'e2', from: 'cdn-1', to: 'lb-1' },
        { id: 'e3', from: 'lb-1', to: 'web-1' },
        { id: 'e4', from: 'lb-1', to: 'web-2' },
        { id: 'e5', from: 'web-1', to: 'cache-1' },
        { id: 'e6', from: 'web-2', to: 'cache-1' },
        { id: 'e7', from: 'cache-1', to: 'sql-1' }
      ]);
      setSelectedNodeId('web-1');
    }
  };

  // Calculate live RPS and active traffic mix
  const targetPeakRps = useMemo(() => {
    if (gameMode === 'CAMPAIGN') return currentLevel.targetRps;
    if (gameMode === 'SURVIVAL') return 3000 + survivalWave * 2500;
    return sandboxRps;
  }, [gameMode, currentLevel, survivalWave, sandboxRps]);

  const activeTrafficMix = useMemo(() => {
    if (gameMode === 'CAMPAIGN') return currentLevel.trafficMix;
    if (gameMode === 'SURVIVAL') {
      const botRatio = Math.min(0.25, survivalWave * 0.04);
      const aiRatio = survivalWave >= 3 ? 0.25 : 0;
      return {
        READ: 0.35,
        WRITE: 0.25,
        SEARCH: 0.15,
        STATIC: 0.15,
        BOT: botRatio,
        AI_PROMPT: aiRatio
      };
    }
    return { READ: 0.40, WRITE: 0.25, STATIC: 0.15, SEARCH: 0.10, BOT: 0.05, AI_PROMPT: 0.05 };
  }, [gameMode, currentLevel, survivalWave]);

  const [idleTick, setIdleTick] = useState(0);

  // Subtle heartbeat timer for natural baseline traffic variation
  useEffect(() => {
    const timer = setInterval(() => {
      setIdleTick((t) => (t + 1) % 100);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const currentLiveRps = useMemo(() => {
    if (!isRunning && waveProgress === 0) {
      // Real-time active baseline load with natural user traffic fluctuation
      const baseJitter = 1 + Math.sin(idleTick * 0.45) * 0.03;
      return Math.round(targetPeakRps * 0.38 * baseJitter);
    }
    const rampFactor = 0.25 + 0.75 * Math.min(1, waveProgress / 75);
    const jitter = isRunning ? 1 + Math.sin(waveProgress * 0.4) * 0.03 : 1;
    return Math.round(targetPeakRps * rampFactor * jitter);
  }, [isRunning, waveProgress, targetPeakRps, idleTick]);

  const currentMaxBudget = gameMode === 'CAMPAIGN' ? currentLevel.maxBudgetHr : null;

  // Run real-time simulation evaluation
  const evaluation = useMemo(() => {
    return evaluateArchitecture(nodes, edges, currentLiveRps, activeTrafficMix, currentMaxBudget);
  }, [nodes, edges, currentLiveRps, activeTrafficMix, currentMaxBudget]);

  // Global mouseup listener to reliably release drag and pan anywhere on window
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsPanning(false);
      setDraggingNodeId(null);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Non-passive wheel listener for smooth infinite pan and pinch/ctrl-wheel zoom
  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const handleWheelNative = (e) => {
      e.preventDefault();
      const rect = canvasEl.getBoundingClientRect();
      const mouseScreenX = e.clientX - rect.left;
      const mouseScreenY = e.clientY - rect.top;

      if (e.ctrlKey || e.metaKey) {
        // Pinch-zoom or Ctrl+scroll zoom centered at mouse pointer
        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
        setZoom((currentZoom) => {
          const newZoom = Math.max(0.35, Math.min(2.5, +(currentZoom * zoomFactor).toFixed(3)));
          setPan((currentPan) => {
            const worldX = (mouseScreenX - currentPan.x) / currentZoom;
            const worldY = (mouseScreenY - currentPan.y) / currentZoom;
            return {
              x: Math.round(mouseScreenX - worldX * newZoom),
              y: Math.round(mouseScreenY - worldY * newZoom)
            };
          });
          return newZoom;
        });
      } else {
        // 2-finger trackpad scroll or mousewheel pan
        setPan((prev) => ({
          x: Math.round(prev.x - e.deltaX),
          y: Math.round(prev.y - e.deltaY)
        }));
      }
    };

    canvasEl.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => canvasEl.removeEventListener('wheel', handleWheelNative);
  }, []);

  // Live simulation tick interval
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setWaveProgress((prev) => {
        const next = prev + 0.8 * simSpeed;

        // Mid-wave Chaos Monkey trigger (at ~50% progress in Level 5 or Chaos active)
        if (chaosActive && Math.floor(prev) < 50 && Math.floor(next) >= 50) {
          triggerManualChaos();
        }

        if (next >= 100) {
          setIsRunning(false);
          // Evaluate wave outcome
          const passedSLA =
            evaluation.uptimePct >= (gameMode === 'CAMPAIGN' ? currentLevel.minUptimePct : 98.0) &&
            evaluation.p99Latency <= (gameMode === 'CAMPAIGN' ? currentLevel.maxLatencyMs : 250);
          const passedBudget = !currentMaxBudget || evaluation.totalHourlyCost <= currentMaxBudget;

          if (gameMode === 'CAMPAIGN') {
            const isWon = passedSLA && passedBudget;
            if (isWon) {
              setUnlockedLevelIdx((prev) => {
                const updated = Math.min(CAMPAIGN_LEVELS.length - 1, Math.max(prev, currentLevelIdx + 1));
                try {
                  localStorage.setItem('archquest_unlocked_level', updated.toString());
                } catch (e) {}
                return updated;
              });
            }
            setPostMortemModal({
              won: isWon,
              passedSLA,
              passedBudget,
              p99Latency: evaluation.p99Latency,
              uptimePct: evaluation.uptimePct,
              totalCost: evaluation.totalHourlyCost
            });
          } else if (gameMode === 'SURVIVAL') {
            if (passedSLA) {
              setSurvivalWave((w) => w + 1);
              setWaveProgress(0);
              setIsRunning(true);
            } else {
              setPostMortemModal({
                won: false,
                survivalWave,
                p99Latency: evaluation.p99Latency,
                uptimePct: evaluation.uptimePct
              });
            }
          }
          return 100;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, simSpeed, chaosActive, evaluation, gameMode, currentLevel, currentMaxBudget, survivalWave, currentLevelIdx]);

  // Component Actions & Dragging
  const handleAddService = (type, explicitX, explicitY) => {
    const spec = COMPONENT_CATALOG[type];
    if (!spec) return;

    const defaultConfig = {};
    if (spec.configOptions) {
      Object.keys(spec.configOptions).forEach((k) => {
        defaultConfig[k] = 0;
      });
    }

    const countOfType = nodes.filter((n) => n.type === type).length;
    let spawnX = explicitX !== undefined ? explicitX : 400 + (countOfType % 3) * 30;
    let spawnY = explicitY !== undefined ? explicitY : 120 + ((countOfType * 110) % 330);

    if (explicitX === undefined && canvasRef.current && (Math.abs(pan.x) > 60 || Math.abs(pan.y) > 60 || zoom !== 1)) {
      const rect = canvasRef.current.getBoundingClientRect();
      spawnX = Math.round((-pan.x + rect.width / 2) / zoom - 88 + (countOfType % 3) * 25);
      spawnY = Math.round((-pan.y + rect.height / 2) / zoom - 55 + (countOfType % 3) * 25);
    }

    const newNode = {
      id: `${type.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      type,
      x: spawnX,
      y: spawnY,
      config: defaultConfig,
      crashed: false
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    return newNode;
  };

  const deleteNode = (nodeId) => {
    if (nodeId === 'src') return;
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.from !== nodeId && e.to !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId('src');
    if (connectingFromId === nodeId) setConnectingFromId(null);
  };

  const handlePortClick = (e, nodeId, portType) => {
    e.stopPropagation();
    if (portType === 'out') {
      setConnectingFromId(connectingFromId === nodeId ? null : nodeId);
    } else if (portType === 'in' && connectingFromId && connectingFromId !== nodeId) {
      const exists = edges.some((ed) => ed.from === connectingFromId && ed.to === nodeId);
      if (!exists) {
        setEdges((prev) => [
          ...prev,
          { id: `e_${Date.now()}`, from: connectingFromId, to: nodeId }
        ]);
      }
      setConnectingFromId(null);
    }
  };

  const handleMouseDownNode = (nodeId, e) => {
    e.stopPropagation();
    if (connectingFromId && connectingFromId !== nodeId && nodeId !== 'src') {
      handlePortClick(e, nodeId, 'in');
      return;
    }
    if (!canvasRef.current) return;
    setSelectedNodeId(nodeId);
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldX = (screenX - pan.x) / zoom;
    const worldY = (screenY - pan.y) / zoom;
    const node = nodes.find((n) => n.id === nodeId);
    setDraggingNodeId(nodeId);
    setDragOffset({
      x: worldX - (node?.x || 0),
      y: worldY - (node?.y || 0)
    });
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target.closest('.no-pan') || e.target.closest('button') || e.target.closest('input')) {
      return;
    }
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    };
    setConnectingFromId(null);
  };

  const handleCanvasMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const worldX = (screenX - pan.x) / zoom;
    const worldY = (screenY - pan.y) / zoom;
    setMousePos({ x: worldX, y: worldY });

    if (isPanning) {
      setPan({
        x: Math.round(e.clientX - panStartRef.current.x),
        y: Math.round(e.clientY - panStartRef.current.y)
      });
      return;
    }

    if (draggingNodeId) {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNodeId
            ? {
                ...n,
                x: Math.round(worldX - dragOffset.x),
                y: Math.round(worldY - dragOffset.y)
              }
            : n
        )
      );
    }
  };

  const fitView = useCallback(() => {
    if (!canvasRef.current || nodes.length === 0) {
      setPan({ x: 0, y: 0 });
      setZoom(1);
      return;
    }
    const rect = canvasRef.current.getBoundingClientRect();
    const minX = Math.min(...nodes.map((n) => n.x));
    const maxX = Math.max(...nodes.map((n) => n.x + 180));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxY = Math.max(...nodes.map((n) => n.y + 110));

    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;
    const padding = 70;

    const scaleX = (rect.width - padding * 2) / Math.max(1, graphWidth);
    const scaleY = (rect.height - padding * 2) / Math.max(1, graphHeight);
    const targetZoom = Math.max(0.4, Math.min(1.15, +(Math.min(scaleX, scaleY)).toFixed(2)));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setZoom(targetZoom);
    setPan({
      x: Math.round(rect.width / 2 - centerX * targetZoom),
      y: Math.round(rect.height / 2 - centerY * targetZoom)
    });
  }, [nodes]);

  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const triggerManualChaos = () => {
    const candidates = nodes.filter((n) => n.type !== 'SOURCE' && !n.crashed);
    if (candidates.length === 0) {
      setNodes((prev) => prev.map((n) => ({ ...n, crashed: false })));
      return;
    }
    const victim = candidates[Math.floor(Math.random() * candidates.length)];
    setNodes((prev) => prev.map((n) => (n.id === victim.id ? { ...n, crashed: true } : n)));
  };

  const resetWave = () => {
    setIsRunning(false);
    setWaveProgress(0);
    setPostMortemModal(null);
    setNodes((prev) => prev.map((n) => ({ ...n, crashed: false })));
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedSpec = selectedNode ? COMPONENT_CATALOG[selectedNode.type] : null;
  const selectedMetrics = selectedNode ? evaluation.nodeMetrics[selectedNode.id] : null;

  const availableCatalog = useMemo(() => {
    return Object.values(COMPONENT_CATALOG).filter(
      (item) => item.type !== 'SOURCE' && (activeCatalogTab === 'ALL' || item.category === activeCatalogTab)
    );
  }, [activeCatalogTab]);

  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none fixed inset-0">
      {/* =================================================================== */}
      {/* 1. TOP TELEMETRY & NAVIGATION HEADER                                */}
      {/* =================================================================== */}
      <header className="shrink-0 bg-slate-900/95 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm tracking-tight text-white">
                ArchQuest <span className="text-indigo-400">Simulator</span>
              </h1>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Cloud Architect
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Interactive Distributed Systems & Capacity Simulator</p>
          </div>

          {/* Mode Switcher */}
          <div className="hidden md:flex bg-slate-950 p-1 rounded-xl border border-slate-800 ml-2">
            {[
              { id: 'CAMPAIGN', label: '🎓 Campaign (5 Scenarios)' },
              { id: 'SURVIVAL', label: '🔥 Survival Wave' },
              { id: 'SANDBOX', label: '🧪 Sandbox Lab' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchMode(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  gameMode === tab.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Simulation SLA Metrics */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* RPS Counter */}
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isRunning ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="text-xs text-slate-400">
              {isRunning ? 'Wave Surge:' : 'Active Users:'}
            </span>
            <span className="text-xs font-mono font-bold text-white">{currentLiveRps.toLocaleString()} RPS</span>
          </div>

          {/* P99 Latency SLA */}
          <div
            className={`border px-3 py-1.5 rounded-xl flex items-center gap-2 ${
              evaluation.p99Latency > (gameMode === 'CAMPAIGN' ? currentLevel.maxLatencyMs : 200)
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                : 'bg-slate-950 border-slate-800 text-slate-200'
            }`}
          >
            <span className="text-xs text-slate-400">P99:</span>
            <span className="text-xs font-mono font-bold text-cyan-300">{evaluation.p99Latency}ms</span>
            {gameMode === 'CAMPAIGN' && (
              <span className="text-[10px] text-slate-500">(SLA &lt; {currentLevel.maxLatencyMs}ms)</span>
            )}
          </div>

          {/* Uptime % */}
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="text-xs text-slate-400">Uptime:</span>
            <span
              className={`text-xs font-mono font-bold ${
                evaluation.uptimePct < 99.0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {evaluation.uptimePct}%
            </span>
          </div>

          {/* Hourly Cost */}
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Cost:</span>
            <span
              className={`text-xs font-mono font-bold ${
                currentMaxBudget && evaluation.totalHourlyCost > currentMaxBudget
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`}
            >
              ${evaluation.totalHourlyCost}/hr
            </span>
            {currentMaxBudget && (
              <span className="text-[10px] text-slate-500">(&le; ${currentMaxBudget})</span>
            )}
          </div>

          {/* Simulation Controls */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                isRunning
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isRunning ? 'Pause Wave' : 'Simulate Peak Wave'}
            </button>
            <button
              onClick={() => setSimSpeed(simSpeed === 1 ? 2 : simSpeed === 2 ? 5 : 1)}
              className="px-2 py-1 rounded-lg text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-800"
              title="Simulation Speed"
            >
              {simSpeed}x
            </button>
            <button
              onClick={resetWave}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Reset Wave"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Chaos Monkey Trigger */}
          <button
            onClick={triggerManualChaos}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-xs text-amber-300 flex items-center gap-1.5 transition"
            title="Randomly crash an active node to test failover redundancy"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Chaos</span>
          </button>

          {/* Welcome Guide / Tutorial Trigger */}
          <button
            onClick={() => setShowWelcomeModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-950/70 border border-indigo-500/40 hover:bg-indigo-900 text-xs text-indigo-300 flex items-center gap-1.5 transition shadow-sm"
            title="Learn what you get from playing ArchQuest and how game modes work"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Guide</span>
          </button>
        </div>
      </header>

      {/* Campaign Level Progress / Navigation Rail */}
      {gameMode === 'CAMPAIGN' && (
        <div className="shrink-0 bg-slate-900 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between text-xs overflow-x-auto gap-4">
          <div className="flex items-center gap-2">
            {CAMPAIGN_LEVELS.map((lvl, idx) => {
              const isUnlocked = idx <= unlockedLevelIdx;
              const isPassed = idx < unlockedLevelIdx;
              const isCurrent = currentLevelIdx === idx;

              return (
                <button
                  key={lvl.id}
                  disabled={!isUnlocked}
                  onClick={() => isUnlocked && selectLevel(idx)}
                  title={isUnlocked ? lvl.title : `🔒 Pass Level ${idx} to unlock this scenario`}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1.5 shrink-0 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                      : isPassed
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/50'
                      : isUnlocked
                      ? 'bg-slate-950/80 text-slate-300 hover:text-white border border-slate-800'
                      : 'bg-slate-950/30 text-slate-600 border border-slate-900/40 cursor-not-allowed opacity-50'
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : isUnlocked ? (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                  <span>{lvl.title.split(':')[0]}</span>
                  {!isUnlocked && <span className="text-[10px] text-slate-500 font-normal">🔒 Locked</span>}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Wave Progress Bar */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Wave Progress:</span>
              <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-100"
                  style={{ width: `${waveProgress}%` }}
                />
              </div>
              <span className="font-mono text-[11px] text-slate-300">{Math.round(waveProgress)}%</span>
            </div>

            <button
              onClick={() => setShowBeginnerHints(!showBeginnerHints)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition ${
                showBeginnerHints
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{showBeginnerHints ? 'Hints On' : 'Hints Off'}</span>
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. MAIN WORKSPACE: PALETTE + INTERACTIVE GRAPH CANVAS + INSPECTOR    */}
      {/* =================================================================== */}
      <div className="flex-1 grid grid-cols-12 min-h-0 h-full overflow-hidden relative">
        {/* LEFT COLUMN: INFRASTRUCTURE COMPONENT PALETTE (3 Cols) */}
        <aside className="col-span-3 h-full bg-slate-900/80 border-r border-slate-800 flex flex-col p-3 min-h-0 overflow-hidden">
          {/* Category Filter Pills (Pinned Header) */}
          <div className="shrink-0 mb-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Cloud Components</span>
              <span className="text-[10px] text-indigo-400 font-medium">Drag or Click</span>
            </div>

            <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'Edge', label: 'Edge' },
                { id: 'Compute', label: 'Compute' },
                { id: 'Async', label: 'Queue' },
                { id: 'Data', label: 'Data' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveCatalogTab(t.id)}
                  className={`py-1 rounded-lg transition-all ${
                    activeCatalogTab === t.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Component Cards (Scrollable inside panel with Drag & Drop + Click to Inspect) */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
            {availableCatalog.map((item) => {
              const Icon = item.icon;
              const isAllowed = gameMode !== 'CAMPAIGN' || currentLevel.allowedComponents.includes(item.type);
              return (
                <div
                  key={item.type}
                  draggable={isAllowed}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/archquest-component', item.type);
                    e.dataTransfer.setData('text/plain', item.type);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => setDetailModalComponent(item.type)}
                  className={`group relative w-full text-left p-2.5 rounded-xl border transition-all select-none ${
                    isAllowed
                      ? 'bg-slate-950/90 hover:bg-slate-850 border-slate-800 hover:border-indigo-500/60 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-indigo-500/10'
                      : 'bg-slate-950/30 border-slate-900 opacity-40 cursor-not-allowed'
                  }`}
                >
                  {/* Hover Floating Guide Badge */}
                  {isAllowed && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-2.5 right-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-indigo-400/40 pointer-events-none z-30 flex items-center gap-1">
                      <span>💡 Click to see details • Drag & drop to use</span>
                    </div>
                  )}

                  <div className="flex items-start gap-2.5">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 shadow text-white`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-200 truncate">{item.name}</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">${item.baseCost}/hr</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <span>{(item.baseCapacity / 1000).toFixed(1)}k RPS</span>
                          <span>•</span>
                          <span className="text-cyan-300">{item.baseLatency}ms</span>
                        </div>
                        <span className="text-[9px] text-indigo-400 font-semibold group-hover:text-indigo-300">
                          Details &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Traffic Types Packet Legend (Pinned Footer) */}
          <div className="shrink-0 pt-2.5 mt-2 border-t border-slate-800 space-y-1 text-[11px] text-slate-400">
            <div className="font-semibold text-slate-300 text-xs mb-1">Traffic Flow Legend</div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              {Object.values(TRAFFIC_TYPES).map((t) => (
                <div key={t.id} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="truncate">{t.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: INTERACTIVE ARCHITECTURE CANVAS (6 Cols) */}
        <main
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={() => {
            setIsPanning(false);
            setDraggingNodeId(null);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={(e) => {
            e.preventDefault();
            const compType = e.dataTransfer.getData('application/archquest-component') || e.dataTransfer.getData('text/plain');
            if (compType && COMPONENT_CATALOG[compType]) {
              const isAllowed = gameMode !== 'CAMPAIGN' || currentLevel.allowedComponents.includes(compType);
              if (!isAllowed) return;
              const rect = canvasRef.current.getBoundingClientRect();
              const screenX = e.clientX - rect.left;
              const screenY = e.clientY - rect.top;
              const worldX = Math.round((screenX - pan.x) / zoom) - 88;
              const worldY = Math.round((screenY - pan.y) / zoom) - 44;
              handleAddService(compType, worldX, worldY);
            }
          }}
          className={`col-span-6 h-full relative bg-slate-950 flex flex-col overflow-hidden select-none min-h-0 ${
            isPanning ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(99, 102, 241, 0.16) 1.2px, transparent 1.2px)',
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        >
          {/* Top Helper / Connection Banner */}
          <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-30">
            <div className="bg-slate-900/90 backdrop-blur border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs text-slate-300 flex items-center gap-2 pointer-events-auto shadow-lg">
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {connectingFromId ? (
                  <span className="text-amber-300 font-bold">
                    Click another node&apos;s LEFT input port (or body) to wire connection...
                  </span>
                ) : (
                  'Drag canvas to pan anywhere • Scroll/pinch to zoom • Click a right port to wire • Click wire to delete'
                )}
              </span>
              {connectingFromId && (
                <button
                  onClick={() => setConnectingFromId(null)}
                  className="ml-2 px-2 py-0.5 rounded bg-slate-800 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
              )}
            </div>

            {gameMode === 'SANDBOX' && (
              <div className="bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300 flex items-center gap-2 pointer-events-auto shadow-lg">
                <span>Peak Load:</span>
                <input
                  type="range"
                  min={1000}
                  max={35000}
                  step={1000}
                  value={sandboxRps}
                  onChange={(e) => setSandboxRps(Number(e.target.value))}
                  className="w-24 accent-indigo-500"
                />
                <span className="font-mono font-bold text-indigo-400">{sandboxRps.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* FLOATING CANVAS HUD CONTROLS (BOTTOM-RIGHT) */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 z-30 pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-800 p-1 rounded-xl shadow-2xl">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.15).toFixed(2)))}
              className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetView}
              className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] font-mono text-slate-200 transition font-medium"
              title="Click to reset zoom to 100%"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.35, +(z - 0.15).toFixed(2)))}
              className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-slate-700 mx-0.5" />
            <button
              onClick={fitView}
              className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition"
              title="Center & Fit Graph in View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetView}
              className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition"
              title="Reset View to Origin (0,0)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* FLOATING STATUS PILL (BOTTOM-LEFT) */}
          <div className="absolute bottom-3 left-3 z-30 pointer-events-none flex items-center gap-2">
            <div className="bg-slate-900/85 backdrop-blur border border-slate-800 px-2.5 py-1 rounded-lg text-[10px] text-slate-400 font-mono flex items-center gap-2 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Canvas: ({Math.round(pan.x)}, {Math.round(pan.y)})</span>
              <span className="hidden sm:inline text-slate-500">• Pan anywhere</span>
            </div>
          </div>

          {/* GRAPH WORLD CONTAINER (TRANSFORMED BY PAN & ZOOM) */}
          <div
            className="absolute inset-0 origin-top-left pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          >
            {/* SVG WIRES & ANIMATED PARTICLES */}
            <svg className="overflow-visible absolute inset-0 pointer-events-none z-10" style={{ width: '1px', height: '1px' }}>
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Active Connection Preview Wire */}
              {connectingFromId && (() => {
                const srcNode = nodes.find((n) => n.id === connectingFromId);
                if (!srcNode) return null;
                const x1 = srcNode.x + 176;
                const y1 = srcNode.y + 44;
                const x2 = mousePos.x;
                const y2 = mousePos.y;
                return (
                  <path
                    d={`M ${x1} ${y1} C ${x1 + 60} ${y1}, ${x2 - 60} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                  />
                );
              })()}

              {/* Connected Edges */}
              {edges.map((edge) => {
                const fromNode = nodes.find((n) => n.id === edge.from);
                const toNode = nodes.find((n) => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                const x1 = fromNode.x + 176;
                const y1 = fromNode.y + 44;
                const x2 = toNode.x;
                const y2 = toNode.y + 44;
                const dx = Math.max(50, Math.abs(x2 - x1) * 0.5);
                const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                const flow = evaluation.edgeFlows[edge.id] || { flowRps: 0, dominantType: 'READ' };
                // Active users flow continuously through the network even before manual wave launch
                const hasTraffic = flow.flowRps > 0.1;
                const packetColor = TRAFFIC_TYPES[flow.dominantType]?.color || '#38bdf8';
                const animDuration = Math.max(0.55, 2.4 - Math.min(1.8, flow.flowRps / 2500));

                return (
                  <g key={edge.id} className="pointer-events-auto group">
                    {/* Invisible wider stroke for effortless clicking to delete */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="16"
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEdges((prev) => prev.filter((ed) => ed.id !== edge.id));
                      }}
                    />

                    {/* Base Wire */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={hasTraffic ? (isRunning ? '#64748b' : '#334155') : '#1e293b'}
                      strokeWidth={hasTraffic ? (isRunning ? 3 : 2.5) : 2}
                      className="group-hover:stroke-rose-500 transition-colors"
                    />

                    {/* Flowing Data Stream Line */}
                    {hasTraffic && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke={packetColor}
                        strokeWidth={isRunning ? 2.5 : 1.5}
                        strokeOpacity={isRunning ? 0.45 : 0.28}
                        strokeDasharray="6 8"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          from="14"
                          to="0"
                          dur={`${animDuration}s`}
                          repeatCount="indefinite"
                        />
                      </path>
                    )}

                    {/* Animated Active Packets (Continuously flowing for active users) */}
                    {hasTraffic && (
                      <>
                        {/* Packet 1 */}
                        <circle r={isRunning ? 4.5 : 3.5} fill={packetColor} filter="url(#glow)">
                          <animateMotion dur={`${animDuration}s`} repeatCount="indefinite" path={pathD} />
                        </circle>
                        {/* Packet 2 */}
                        <circle r={isRunning ? 4 : 3} fill={packetColor} opacity="0.85" filter="url(#glow)">
                          <animateMotion
                            dur={`${animDuration}s`}
                            begin={`${(animDuration * 0.33).toFixed(2)}s`}
                            repeatCount="indefinite"
                            path={pathD}
                          />
                        </circle>
                        {/* Packet 3 */}
                        <circle r={isRunning ? 3.5 : 2.5} fill={packetColor} opacity="0.7" filter="url(#glow)">
                          <animateMotion
                            dur={`${animDuration}s`}
                            begin={`${(animDuration * 0.66).toFixed(2)}s`}
                            repeatCount="indefinite"
                            path={pathD}
                          />
                        </circle>
                      </>
                    )}

                    {/* RPS Flow Label on Wire */}
                    <g
                      transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2 - 8})`}
                      className="cursor-pointer group/label"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEdges((prev) => prev.filter((ed) => ed.id !== edge.id));
                      }}
                    >
                      <rect
                        x="-28"
                        y="-10"
                        width="56"
                        height="18"
                        rx="6"
                        fill="#0f172a"
                        stroke={hasTraffic ? packetColor : '#334155'}
                        strokeWidth="1"
                        strokeOpacity={hasTraffic ? 0.75 : 1}
                        className="group-hover/label:stroke-rose-500 group-hover/label:fill-rose-950/80 transition-colors"
                      />
                      <text
                        textAnchor="middle"
                        y="2"
                        fill={hasTraffic ? '#f8fafc' : '#94a3b8'}
                        fontSize="9"
                        fontWeight="bold"
                        className="group-hover/label:fill-rose-300 select-none"
                      >
                        {flow.flowRps > 0.1
                          ? flow.flowRps >= 1000
                            ? `${(flow.flowRps / 1000).toFixed(1)}k/s`
                            : `${Math.round(flow.flowRps)}/s`
                          : 'wire ✕'}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>

            {/* INFRASTRUCTURE NODES ON CANVAS */}
            <div className="absolute inset-0 pointer-events-none">
              {nodes.map((node) => {
                const spec = COMPONENT_CATALOG[node.type];
                const isSelected = selectedNodeId === node.id;
                const isConnectingSource = connectingFromId === node.id;
                const m = evaluation.nodeMetrics[node.id] || { totalIn: 0, utilization: 0, effectiveLatency: spec.baseLatency, isCrashed: false };
                const utilPct = Math.round(m.utilization * 100);
                const Icon = spec.icon;

                let statusColor = 'border-slate-700/90 hover:border-slate-500';
                if (m.isCrashed) {
                  statusColor = 'border-rose-600 ring-2 ring-rose-600/50 animate-pulse';
                } else if (m.utilization > 1.0) {
                  statusColor = 'border-rose-500 ring-2 ring-rose-500/40';
                } else if (m.utilization > 0.78) {
                  statusColor = 'border-amber-500';
                } else if (isSelected) {
                  statusColor = 'border-indigo-400 ring-2 ring-indigo-500/30';
                }

                return (
                  <div
                    key={node.id}
                    style={{ left: node.x, top: node.y, width: 176 }}
                    onMouseDown={(e) => handleMouseDownNode(node.id, e)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (connectingFromId && connectingFromId !== node.id && node.type !== 'SOURCE') {
                        handlePortClick(e, node.id, 'in');
                        return;
                      }
                      setSelectedNodeId(node.id);
                    }}
                    className={`no-pan pointer-events-auto absolute z-20 bg-slate-900/95 backdrop-blur rounded-xl border ${statusColor} p-2.5 shadow-xl transition-shadow cursor-grab active:cursor-grabbing`}
                  >
                    {/* Left Input Port */}
                    {node.type !== 'SOURCE' && (
                      <button
                        onClick={(e) => handlePortClick(e, node.id, 'in')}
                        title="Input Port (Click to finish wire connection)"
                        className={`w-4 h-4 rounded-full border-2 absolute -left-2 top-10 transition-transform hover:scale-125 z-10 ${
                          connectingFromId && connectingFromId !== node.id
                            ? 'bg-amber-400 border-white scale-125 animate-bounce'
                            : 'bg-slate-800 border-slate-400 hover:border-indigo-400'
                        }`}
                      />
                    )}

                    {/* Right Output Port */}
                    <button
                      onClick={(e) => handlePortClick(e, node.id, 'out')}
                      title="Output Port (Click to start drawing wire)"
                      className={`w-4 h-4 rounded-full border-2 absolute -right-2 top-10 transition-transform hover:scale-125 z-10 ${
                        isConnectingSource
                          ? 'bg-indigo-400 border-white scale-125'
                          : 'bg-indigo-600 border-slate-200 hover:bg-indigo-400'
                      }`}
                    />

                    {/* Node Header */}
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${spec.color} flex items-center justify-center shrink-0 shadow text-white`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-white truncate">{spec.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {node.type === 'SOURCE' ? 'Ingress' : `$${m.cost}/hr`}
                          </div>
                        </div>
                      </div>

                      {node.type !== 'SOURCE' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNode(node.id);
                          }}
                          className="text-slate-500 hover:text-rose-400 p-0.5 transition"
                          title="Remove Node"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Live Node Metrics Footer */}
                    {m.isCrashed ? (
                      <div className="mt-2 bg-rose-950/90 border border-rose-600/50 rounded-lg px-2 py-1 flex items-center justify-between text-[10px] text-rose-300 font-bold">
                        <span>CRASHED</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNodes((prev) => prev.map((n) => (n.id === node.id ? { ...n, crashed: false } : n)));
                          }}
                          className="underline hover:text-white"
                        >
                          Reboot
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 pt-1.5 border-t border-slate-800/90 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">
                            {Math.round(m.totalIn).toLocaleString()} RPS
                          </span>
                          <span
                            className={`font-semibold ${
                              utilPct > 100 ? 'text-rose-400' : utilPct > 78 ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {node.type === 'SOURCE' ? 'Active' : `${utilPct}% Load`}
                          </span>
                        </div>

                        {node.type !== 'SOURCE' && (
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-200 ${
                                utilPct > 100 ? 'bg-rose-500' : utilPct > 78 ? 'bg-amber-400' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, utilPct)}%` }}
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[9px] pt-0.5 text-slate-400">
                          <span className="text-cyan-300 font-mono">{m.effectiveLatency}ms</span>
                          <span>Cap: {(m.capacity / 1000).toFixed(1)}k</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Win / Loss Modal */}
          {postMortemModal && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-6 z-40">
              <div className="max-w-md w-full bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 text-center shadow-2xl">
                <div className="text-4xl mb-2">{postMortemModal.won ? '🏆' : '💥'}</div>
                <h2 className="text-xl font-extrabold text-white">
                  {postMortemModal.won ? 'SLA Passed Successfully!' : 'SLA Target Breached'}
                </h2>
                <div className="mt-3 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>P99 Latency:</span>
                    <span className="font-mono font-bold text-cyan-300">{postMortemModal.p99Latency}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Final Uptime:</span>
                    <span className="font-mono font-bold text-emerald-400">{postMortemModal.uptimePct}%</span>
                  </div>
                  {postMortemModal.totalCost && (
                    <div className="flex justify-between">
                      <span>Hourly Cost:</span>
                      <span className="font-mono font-bold text-white">${postMortemModal.totalCost}/hr</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    onClick={resetWave}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                  >
                    🔄 Replay Wave
                  </button>
                  {postMortemModal.won && gameMode === 'CAMPAIGN' && currentLevelIdx < CAMPAIGN_LEVELS.length - 1 && (
                    <button
                      onClick={() => selectLevel(currentLevelIdx + 1)}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs shadow-lg"
                    >
                      Next Scenario ➡️
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT COLUMN: PROBLEM STATEMENT, INSPECTOR & LIVE MENTOR (3 Cols) */}
        <aside className="col-span-3 h-full bg-slate-900/80 border-l border-slate-800 flex flex-col overflow-y-auto p-3.5 space-y-4 min-h-0">
          {/* =============================================================== */}
          {/* 1. SCENARIO PROBLEM STATEMENT (TOP OF RIGHT PANEL)              */}
          {/* =============================================================== */}
          {gameMode === 'CAMPAIGN' ? (
            <div className="bg-slate-950/90 border border-indigo-500/40 rounded-2xl p-4 space-y-3 shadow-lg shadow-indigo-950/20">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>Problem Statement</span>
                </span>
                <span className="text-[11px] font-mono text-indigo-400 font-bold">
                  {currentLevel.title.split(':')[0]}
                </span>
              </div>

              {/* Title & Core Concept */}
              <div>
                <h3 className="text-sm font-extrabold text-white leading-tight">
                  {currentLevel.title}
                </h3>
                <div className="text-xs text-indigo-300 font-medium mt-0.5">
                  ⚡ Focus: {currentLevel.concept}
                </div>
              </div>

              {/* Problem Brief */}
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                {currentLevel.brief}
              </p>

              {/* SLA & Budget Constraints Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span>🎯 Target Peak Load</span>
                  </div>
                  <div className="font-mono font-bold text-white mt-0.5">
                    {currentLevel.targetRps.toLocaleString()} RPS
                  </div>
                </div>

                <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span>⏱️ Latency SLA</span>
                  </div>
                  <div className="font-mono font-bold text-cyan-300 mt-0.5">
                    &lt; {currentLevel.maxLatencyMs}ms
                  </div>
                </div>

                <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span>💰 Max Cloud Budget</span>
                  </div>
                  <div className="font-mono font-bold text-emerald-400 mt-0.5">
                    &le; ${currentLevel.maxBudgetHr}/hr
                  </div>
                </div>

                <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span>🛡️ Min Uptime SLA</span>
                  </div>
                  <div className="font-mono font-bold text-purple-300 mt-0.5">
                    &ge; {currentLevel.minUptimePct}%
                  </div>
                </div>
              </div>

              {/* Real-Life Everyday Analogy */}
              {currentLevel.beginnerAnalogy && (
                <div className="p-3 rounded-xl bg-amber-950/25 border border-amber-500/30 text-xs text-amber-200 leading-relaxed space-y-1">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <span>💡 Everyday Analogy</span>
                  </div>
                  <div>{currentLevel.beginnerAnalogy}</div>
                </div>
              )}

              {/* Architecture Hints & Solution Clues */}
              {currentLevel.hints && currentLevel.hints.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                    <span>🔍 Architectural Strategy Tips</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                    {currentLevel.hints.map((h, i) => (
                      <li key={i} className="leading-snug">{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : gameMode === 'SURVIVAL' ? (
            <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-4 space-y-2.5 shadow-lg shadow-amber-950/20">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Survival Mission</span>
                </span>
                <span className="text-[11px] font-mono text-amber-400 font-bold">
                  Wave {survivalWave}
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-white">
                Infinite Escalating Traffic Surge
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                Survive as many waves as possible! Traffic surges by +2,500 RPS every wave with malicious bot swarms and random Chaos Monkey server outages. Maintain &ge;98% availability to advance!
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Current Wave Load</span>
                  <div className="font-mono font-bold text-amber-300 mt-0.5">
                    {(3000 + survivalWave * 2500).toLocaleString()} RPS
                  </div>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Survival Target</span>
                  <div className="font-mono font-bold text-emerald-400 mt-0.5">
                    SLA &ge; 98.0%
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/90 border border-emerald-500/40 rounded-2xl p-4 space-y-2.5 shadow-lg shadow-emerald-950/20">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  🧪 Sandbox Lab
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  Freeform Workbench
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-white">
                Unrestricted Architectural Playground
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                Zero budget caps and zero constraints. Drag and deploy any cloud component, dial the peak load slider up to 35,000+ RPS, and stress-test custom topologies.
              </p>
            </div>
          )}

          {/* =============================================================== */}
          {/* 2. SELECTED COMPONENT INSPECTOR & TUNING                         */}
          {/* =============================================================== */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                <span>Component Inspector</span>
              </span>
              {selectedNode && selectedNode.type !== 'SOURCE' && (
                <button
                  onClick={() => deleteNode(selectedNode.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </div>

            {selectedNode && selectedSpec && selectedMetrics ? (
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-bold text-white">{selectedSpec.name}</div>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedSpec.description}</p>
                </div>

                {/* Telemetry Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">Total Ingress</div>
                    <div className="font-mono font-bold text-white mt-0.5">
                      {Math.round(selectedMetrics.totalIn).toLocaleString()} RPS
                    </div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">Latency</div>
                    <div className="font-mono font-bold text-cyan-300 mt-0.5">
                      {selectedMetrics.effectiveLatency}ms
                    </div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">Saturation</div>
                    <div className="font-mono font-bold text-amber-300 mt-0.5">
                      {Math.round(selectedMetrics.utilization * 100)}%
                    </div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">Hourly Cost</div>
                    <div className="font-mono font-bold text-emerald-400 mt-0.5">
                      ${selectedMetrics.cost}/hr
                    </div>
                  </div>
                </div>

                {/* Architectural Configuration Dropdowns */}
                {selectedSpec.configOptions && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-bold text-slate-300">Architectural Tuning:</span>
                    {Object.keys(selectedSpec.configOptions).map((configKey) => {
                      const opt = selectedSpec.configOptions[configKey];
                      const currentVal = selectedNode.config?.[configKey] || 0;
                      return (
                        <div key={configKey} className="space-y-1">
                          <label className="text-[10px] text-slate-400">{opt.label}</label>
                          <select
                            value={currentVal}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === selectedNode.id
                                    ? { ...n, config: { ...(n.config || {}), [configKey]: val } }
                                    : n
                                )
                              );
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            {opt.values.map((vName, idx) => (
                              <option key={vName} value={idx}>
                                {vName}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Optional Beginner Tip */}
                {showBeginnerHints && selectedSpec.beginnerTip && (
                  <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-200 leading-relaxed">
                    <strong>💡 Simple Analogy:</strong> {selectedSpec.beginnerTip}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center">
                Click any component node on the canvas to inspect its live load and tune configurations.
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* 3. LIVE ROOT-CAUSE ARCHITECTURE MENTOR & DIAGNOSTICS             */}
          {/* =============================================================== */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Architecture Mentor &amp; Diagnostics
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {evaluation.diagnostics.map((diag, i) => {
                const isCrit = diag.includes('CRITICAL') || diag.includes('ALERT') || diag.includes('OUTAGE');
                const isWarn = diag.includes('BOTTLENECK') || diag.includes('HIGH') || diag.includes('BUDGET');
                return (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg border text-[11px] leading-relaxed flex items-start gap-2 ${
                      isCrit
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                        : isWarn
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                        : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    }`}
                  >
                    <span className="mt-0.5">{isCrit ? '⚠️' : isWarn ? '⚡' : '✅'}</span>
                    <span>{diag}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* =================================================================== */}
      {/* 4. WELCOME & ORIENTATION MODAL (EXPLAINS REWARDS & 3 GAME MODES)   */}
      {/* =================================================================== */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto text-slate-100 max-h-[92vh] flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              title="Close Guide"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 mb-5 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-2xl">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Welcome to ArchQuest
                  </h2>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    Simulator
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Interactive Distributed Systems Architecture &amp; Capacity Simulator
                </p>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 min-h-0 text-xs sm:text-sm">
              {/* What You Will Get Section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>What You Will Gain By Playing</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>🧠 Real-World Architecture Mastery</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Bridge the gap between reading interview books and feeling how distributed systems actually scale under live traffic. Learn why Netflix needs CDNs and Twitter needs in-memory caches.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>⏱️ SLA Latency &amp; Bottleneck Diagnosis</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Diagnose exponential queuing latencies, server CPU saturation, database disk I/O bottlenecks, and single points of failure (SPOFs) before they cause outages.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>💰 Cloud Cost vs Performance Tradeoffs</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Experience the real tension of cloud budgeting! Satisfy sub-100ms latency SLAs while keeping AWS/GCP hourly compute bills within strict budget limits.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>💥 Chaos Engineering &amp; Self-Healing</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Trigger Chaos Monkey server crashes mid-wave. Test whether your multi-replica topologies and load balancers auto-heal traffic or drop requests.
                    </p>
                  </div>
                </div>
              </div>

              {/* Game Modes Section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2.5 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>3 Game Modes Available</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Campaign */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/30 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-indigo-300">🎓 1. Campaign Mode</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-200">
                          Progressive Lock
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        5 progressive real-world scenarios: Viral Launch ➔ Influencer CDN ➔ Black Friday Checkout ➔ Bot Attack ➔ Global AI Search.
                      </p>
                      <div className="text-[11px] text-amber-300/90 pt-1 border-t border-slate-800/80">
                        🔒 <strong>Progression Rule:</strong> Each level stays locked until you pass the preceding scenario&apos;s SLA and budget!
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        switchMode('CAMPAIGN');
                        setShowWelcomeModal(false);
                      }}
                      className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow"
                    >
                      Play Campaign &rarr;
                    </button>
                  </div>

                  {/* Survival */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-amber-300">🔥 2. Survival Wave</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200">
                          Endless
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Endless scaling stress test waves! Traffic surges by +2,500 RPS each wave with escalating bot swarms and random node crashes.
                      </p>
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                        ⚡ <strong>Goal:</strong> Test your cluster&apos;s breaking point. How many waves can you survive?
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        switchMode('SURVIVAL');
                        setShowWelcomeModal(false);
                      }}
                      className="w-full py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition shadow"
                    >
                      Play Survival &rarr;
                    </button>
                  </div>

                  {/* Sandbox */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-emerald-300">🧪 3. Sandbox Lab</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-200">
                          Unrestricted
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Freeform open architect workbench. Zero budget ceilings, custom traffic slider from 1,000 to 35,000+ RPS, and all 11 components unlocked.
                      </p>
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                        🛠️ <strong>Freedom:</strong> Experiment freely with sharding, caching, and GPU AI inference pipelines.
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        switchMode('SANDBOX');
                        setShowWelcomeModal(false);
                      }}
                      className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shadow"
                    >
                      Play Sandbox &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick How to Play */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                <div className="font-bold text-indigo-300 text-xs uppercase tracking-wider">
                  Quickstart Guide (4 Steps):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs text-slate-300">
                  <div>
                    <strong>1. Drag &amp; Drop:</strong> Drag any cloud component from the left palette directly onto the canvas.
                  </div>
                  <div>
                    <strong>2. Connect Wires:</strong> Click a right output port, then click a downstream left input port.
                  </div>
                  <div>
                    <strong>3. Tune Architectures:</strong> Click any node to switch instance sizes, read replicas, or cache policies.
                  </div>
                  <div>
                    <strong>4. Test the Wave:</strong> Press &quot;Simulate Peak Wave&quot; to test traffic and pass the SLA!
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer CTA */}
            <div className="pt-4 mt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-500">
                You can reopen this guide anytime using the <strong>Guide</strong> button in the top navigation.
              </span>
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition"
              >
                🚀 Start Playing (Level 1: Garage Startup) &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. COMPONENT DEEP-DIVE MODAL (CASE STUDY & REAL-LIFE ANALOGY)       */}
      {/* =================================================================== */}
      {detailModalComponent && (() => {
        const item = COMPONENT_CATALOG[detailModalComponent];
        if (!item) return null;
        const Icon = item.icon;

        return (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl my-auto text-slate-100 max-h-[90vh] flex flex-col">
              {/* Close Button */}
              <button
                onClick={() => setDetailModalComponent(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Component Header */}
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-800 shrink-0">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg text-white shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white">{item.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                </div>
              </div>

              {/* Modal Body Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs sm:text-sm min-h-0">
                {/* 1. Real Life Analogy */}
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <span>💡 Real-Life Everyday Analogy:</span>
                    <span>{item.analogyTitle}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.analogyStory}
                  </p>
                </div>

                {/* 2. Real World Tech Case Study */}
                <div className="p-4 rounded-2xl bg-indigo-950/25 border border-indigo-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                    <span>🏢 Production Tech Case Study:</span>
                    <span>{item.caseStudyCompany}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.caseStudyStory}
                  </p>
                </div>

                {/* 3. Architectural Role & Placement */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-300">
                    📐 Architecture Placement &amp; Specs:
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.architectureTips}
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400">Base Capacity</div>
                      <div className="font-mono font-bold text-white mt-0.5">
                        {(item.baseCapacity / 1000).toFixed(1)}k RPS
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400">Base Latency</div>
                      <div className="font-mono font-bold text-cyan-300 mt-0.5">
                        {item.baseLatency}ms
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400">Hourly Cost</div>
                      <div className="font-mono font-bold text-emerald-400 mt-0.5">
                        ${item.baseCost}/hr
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Configuration Options */}
                {item.configOptions && (
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="font-bold text-xs uppercase tracking-wider text-slate-300">
                      ⚙️ Architectural Tuning Available in Inspector:
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-400">
                      {Object.keys(item.configOptions).map((k) => (
                        <div key={k} className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                          <span className="font-medium text-slate-200">{item.configOptions[k].label}:</span>
                          <span className="text-[11px] text-indigo-300 font-mono">
                            {item.configOptions[k].values.join(' • ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
                <button
                  onClick={() => setDetailModalComponent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleAddService(detailModalComponent);
                    setDetailModalComponent(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Deploy to Canvas</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}