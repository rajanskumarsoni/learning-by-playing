import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Server, Database, Shield, Globe, Cpu, Layers, Activity, Zap, Play, Pause,
  RotateCcw, AlertTriangle, CheckCircle2, HelpCircle, Github, Plus, Trash2,
  Settings, Award, Terminal, Flame, ChevronRight, Copy, Check, Download, Upload,
  FastForward, Eye, Sliders, Share2, Lock, Unlock, Box, HardDrive, Network,
  ArrowRight, Sparkles, Info, X, RefreshCw, ZoomIn, ZoomOut, Maximize2, Move,
  BookOpen, Search, Bot, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen,
  ChevronLeft, Star, Trophy, Radio, Target, Volume2, VolumeX, Music, Headphones, Mic,
  Link as LinkIcon, Calendar, Crown, Medal
} from 'lucide-react';
import mentorAdaImg from './assets/mentor_ada.jpg';
import chaosMonkeyImg from './assets/chaos_monkey.jpg';
import gameplayDemoVideo from './assets/gameplay_demo.mp4';
import heroImg from './assets/hero.png';
import devilImg from './assets/devil.png';
import heroCursorImg from './assets/hero_cursor.png';
import { sound } from './audioEngine.js';
import { introAudioTour, INTRO_TOUR_STEPS } from './introAudioTour.js';

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
// 3.5. ICONIC REAL-WORLD ARCHITECTURE PRESETS (NETFLIX, SPOTIFY, UBER, CLOUDFLARE)
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
      { id: 'e12', from: 'kafka-1', to: 'worker-1' }
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
      { id: 'cdn-1', type: 'CDN', x: 260, y: 120, config: { hitRatio: 1 } },
      { id: 'lb-1', type: 'LB', x: 260, y: 320, config: { algorithm: 1 } },
      { id: 'web-1', type: 'WEB', x: 480, y: 220, config: { tier: 1 } },
      { id: 'cache-1', type: 'CACHE', x: 700, y: 120, config: { eviction: 1 } },
      { id: 'sql-1', type: 'SQL', x: 920, y: 120, config: { scaling: 1 } },
      { id: 'vector-1', type: 'VECTOR', x: 700, y: 320, config: { indexing: 1 } },
      { id: 'gpu-1', type: 'GPU', x: 920, y: 320, config: { modelSize: 1 } }
    ],
    edges: [
      { id: 'e1', from: 'src', to: 'cdn-1' },
      { id: 'e2', from: 'src', to: 'lb-1' },
      { id: 'e3', from: 'lb-1', to: 'web-1' },
      { id: 'e4', from: 'web-1', to: 'cache-1' },
      { id: 'e5', from: 'cache-1', to: 'sql-1' },
      { id: 'e6', from: 'web-1', to: 'vector-1' },
      { id: 'e7', from: 'vector-1', to: 'gpu-1' }
    ]
  },
  {
    id: 'uber',
    name: 'Uber Real-Time Geospatial Dispatch',
    company: 'Uber',
    badge: '25M+ Daily Rides',
    emoji: '🚗',
    color: 'from-slate-600/30 to-zinc-900/40',
    borderColor: 'border-slate-400/50',
    tagline: 'Millisecond spatial driver-rider matching powered by Kafka H3 geospatial telemetry, parallel workers, and in-memory caches.',
    targetRps: 35000,
    keyFeatures: ['WAF Edge Security', 'Kafka Ingestion Stream', 'Dual Matching Workers', 'Redis Geo-Telemetry', 'ACID Trip Ledger'],
    nodes: [
      { id: 'src', type: 'SOURCE', x: 60, y: 220, config: {} },
      { id: 'waf-1', type: 'WAF', x: 250, y: 220, config: { mode: 1 } },
      { id: 'lb-1', type: 'LB', x: 440, y: 220, config: { algorithm: 1 } },
      { id: 'web-1', type: 'WEB', x: 640, y: 220, config: { tier: 1 } },
      { id: 'cache-1', type: 'CACHE', x: 840, y: 110, config: { eviction: 1 } },
      { id: 'kafka-1', type: 'QUEUE', x: 840, y: 260, config: { partitions: 1 } },
      { id: 'worker-1', type: 'WORKER', x: 1040, y: 180, config: { tier: 1 } },
      { id: 'worker-2', type: 'WORKER', x: 1040, y: 340, config: { tier: 1 } },
      { id: 'sql-1', type: 'SQL', x: 1250, y: 260, config: { scaling: 1 } }
    ],
    edges: [
      { id: 'e1', from: 'src', to: 'waf-1' },
      { id: 'e2', from: 'waf-1', to: 'lb-1' },
      { id: 'e3', from: 'lb-1', to: 'web-1' },
      { id: 'e4', from: 'web-1', to: 'cache-1' },
      { id: 'e5', from: 'web-1', to: 'kafka-1' },
      { id: 'e6', from: 'kafka-1', to: 'worker-1' },
      { id: 'e7', from: 'kafka-1', to: 'worker-2' },
      { id: 'e8', from: 'worker-1', to: 'sql-1' },
      { id: 'e9', from: 'worker-2', to: 'sql-1' }
    ]
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Sub-10ms Edge Defense',
    company: 'Cloudflare',
    badge: '20% of Global Web',
    emoji: '⚡',
    color: 'from-amber-600/30 to-orange-900/40',
    borderColor: 'border-orange-500/50',
    tagline: 'Hyper-optimized edge network absorbing volumetric DDoS attacks and serving cached content in single-digit milliseconds.',
    targetRps: 40000,
    keyFeatures: ['DDoS Mitigation WAF', 'Global Edge CDN', 'Edge KV Cache', 'Protected Origin DB'],
    nodes: [
      { id: 'src', type: 'SOURCE', x: 60, y: 220, config: {} },
      { id: 'waf-1', type: 'WAF', x: 260, y: 130, config: { mode: 1 } },
      { id: 'cdn-1', type: 'CDN', x: 260, y: 310, config: { hitRatio: 1 } },
      { id: 'cache-1', type: 'CACHE', x: 480, y: 220, config: { eviction: 1 } },
      { id: 'web-1', type: 'WEB', x: 700, y: 220, config: { tier: 1 } },
      { id: 'sql-1', type: 'SQL', x: 930, y: 220, config: { scaling: 1 } }
    ],
    edges: [
      { id: 'e1', from: 'src', to: 'waf-1' },
      { id: 'e2', from: 'src', to: 'cdn-1' },
      { id: 'e3', from: 'waf-1', to: 'cache-1' },
      { id: 'e4', from: 'cdn-1', to: 'cache-1' },
      { id: 'e5', from: 'cache-1', to: 'web-1' },
      { id: 'e6', from: 'web-1', to: 'sql-1' }
    ]
  }
];

// ============================================================================
// 3.6. ARCHITECT BADGES & STREAK REWARDS SYSTEM (TROPHIES & XP MULTIPLIERS)
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
// 4.5. VIRAL CHALLENGE ENCODING & URL DEEP-LINKING HELPERS
// ============================================================================

// Helper to encode challenge architecture to URL-safe base64
function encodeChallengePayload(data) {
  try {
    const jsonStr = JSON.stringify(data);
    const bytes = new TextEncoder().encode(jsonStr);
    let binString = '';
    for (let i = 0; i < bytes.length; i++) {
      binString += String.fromCharCode(bytes[i]);
    }
    return btoa(binString);
  } catch (e) {
    console.error('Failed to encode challenge payload:', e);
    return null;
  }
}

// Helper to decode challenge architecture from URL base64 string
function decodeChallengePayload(base64Str) {
  try {
    const binString = atob(base64Str);
    const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
    const jsonStr = new TextDecoder().decode(bytes);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to decode challenge payload:', e);
    return null;
  }
}

// Deterministic daily incident generator based on UTC calendar day
function getDailyIncident() {
  const epoch = new Date('2025-01-01T00:00:00Z').getTime();
  const now = Date.now();
  const dayNumber = Math.max(1, Math.floor((now - epoch) / 86400000));

  const INCIDENT_TEMPLATES = [
    {
      subTitle: 'The Midnight Botnet Wave',
      concept: 'L7 DDoS Scrubbing & Rate Limiting',
      brief: 'An extortionist botnet is flooding your API gateway at 3 AM! 50% of incoming traffic is malicious bot floods, while 35% is legitimate user reads. Filter bad actors at the perimeter without spiking latency.',
      targetRps: 6500,
      trafficMix: { BOT: 0.50, READ: 0.35, WRITE: 0.15, STATIC: 0.0, SEARCH: 0.0, AI_PROMPT: 0.0 },
      maxLatencyMs: 75,
      minUptimePct: 99.0,
      maxBudgetHr: 320,
      allowedComponents: ['WAF', 'CDN', 'LB', 'WEB', 'CACHE', 'SQL'],
      initialNodes: [
        { id: 'src', type: 'SOURCE', x: 60, y: 220, config: {} },
        { id: 'lb-1', type: 'LB', x: 280, y: 220, config: { algorithm: 0 } },
        { id: 'web-1', type: 'WEB', x: 500, y: 160, config: { tier: 0 } },
        { id: 'web-2', type: 'WEB', x: 500, y: 280, config: { tier: 0 } },
        { id: 'sql-1', type: 'SQL', x: 740, y: 220, config: { scaling: 0 } }
      ],
      initialEdges: [
        { id: 'e1', from: 'src', to: 'lb-1' },
        { id: 'e2', from: 'lb-1', to: 'web-1' },
        { id: 'e3', from: 'lb-1', to: 'web-2' },
        { id: 'e4', from: 'web-1', to: 'sql-1' },
        { id: 'e5', from: 'web-2', to: 'sql-1' }
      ]
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
      allowedComponents: ['WAF', 'CDN', 'LB', 'WEB', 'CACHE', 'KAFKA', 'WORKER', 'SQL'],
      initialNodes: [
        { id: 'src', type: 'SOURCE', x: 50, y: 220, config: {} },
        { id: 'lb-1', type: 'LB', x: 260, y: 220, config: { algorithm: 1 } },
        { id: 'web-1', type: 'WEB', x: 480, y: 220, config: { tier: 1 } },
        { id: 'sql-1', type: 'SQL', x: 760, y: 220, config: { scaling: 0 } }
      ],
      initialEdges: [
        { id: 'e1', from: 'src', to: 'lb-1' },
        { id: 'e2', from: 'lb-1', to: 'web-1' },
        { id: 'e3', from: 'web-1', to: 'sql-1' }
      ]
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
      allowedComponents: ['CDN', 'STORAGE', 'LB', 'WEB', 'CACHE', 'SQL'],
      initialNodes: [
        { id: 'src', type: 'SOURCE', x: 50, y: 220, config: {} },
        { id: 'web-1', type: 'WEB', x: 380, y: 220, config: { tier: 0 } },
        { id: 'sql-1', type: 'SQL', x: 700, y: 220, config: { scaling: 0 } }
      ],
      initialEdges: [
        { id: 'e1', from: 'src', to: 'web-1' },
        { id: 'e2', from: 'web-1', to: 'sql-1' }
      ]
    },
    {
      subTitle: 'The RAG Inference AI Stampede',
      concept: 'Vector DB Acceleration & LLM Compute',
      brief: 'Your new AI Copilot launched! Users are submitting 5,500 prompt queries/sec. Heavy vector embeddings choke standard relational tables. Route AI prompts to specialized Vector DB & GPU nodes.',
      targetRps: 5500,
      trafficMix: { AI_PROMPT: 0.50, READ: 0.35, WRITE: 0.15, STATIC: 0.0, SEARCH: 0.0, BOT: 0.0 },
      maxLatencyMs: 110,
      minUptimePct: 98.8,
      maxBudgetHr: 520,
      allowedComponents: ['AI', 'LB', 'WEB', 'CACHE', 'SQL', 'SEARCH'],
      initialNodes: [
        { id: 'src', type: 'SOURCE', x: 50, y: 220, config: {} },
        { id: 'lb-1', type: 'LB', x: 260, y: 220, config: { algorithm: 1 } },
        { id: 'web-1', type: 'WEB', x: 480, y: 220, config: { tier: 1 } },
        { id: 'sql-1', type: 'SQL', x: 760, y: 220, config: { scaling: 0 } }
      ],
      initialEdges: [
        { id: 'e1', from: 'src', to: 'lb-1' },
        { id: 'e2', from: 'lb-1', to: 'web-1' },
        { id: 'e3', from: 'web-1', to: 'sql-1' }
      ]
    },
    {
      subTitle: 'Catalog Search Index Meltdown',
      concept: 'Full-Text Inverted Index Offloading',
      brief: 'Shoppers are running complex multi-term search filters. The SQL database CPU spiked to 100% trying to execute LIKE queries. Stand up an Elasticsearch cluster to absorb search volume.',
      targetRps: 6000,
      trafficMix: { SEARCH: 0.50, READ: 0.30, WRITE: 0.20, STATIC: 0.0, BOT: 0.0, AI_PROMPT: 0.0 },
      maxLatencyMs: 80,
      minUptimePct: 99.0,
      maxBudgetHr: 440,
      allowedComponents: ['SEARCH', 'CACHE', 'LB', 'WEB', 'SQL', 'CDN'],
      initialNodes: [
        { id: 'src', type: 'SOURCE', x: 50, y: 220, config: {} },
        { id: 'lb-1', type: 'LB', x: 260, y: 220, config: { algorithm: 0 } },
        { id: 'web-1', type: 'WEB', x: 480, y: 220, config: { tier: 1 } },
        { id: 'sql-1', type: 'SQL', x: 760, y: 220, config: { scaling: 0 } }
      ],
      initialEdges: [
        { id: 'e1', from: 'src', to: 'lb-1' },
        { id: 'e2', from: 'lb-1', to: 'web-1' },
        { id: 'e3', from: 'web-1', to: 'sql-1' }
      ]
    }
  ];

  const template = INCIDENT_TEMPLATES[(dayNumber - 1) % INCIDENT_TEMPLATES.length];
  const dateKey = new Date().toISOString().split('T')[0];

  return {
    dayNumber,
    dateKey,
    title: `Daily Incident #${dayNumber}: ${template.subTitle}`,
    concept: template.concept,
    brief: template.brief,
    targetRps: template.targetRps,
    trafficMix: template.trafficMix,
    maxLatencyMs: template.maxLatencyMs,
    minUptimePct: template.minUptimePct,
    maxBudgetHr: template.maxBudgetHr,
    allowedComponents: template.allowedComponents,
    initialNodes: template.initialNodes,
    initialEdges: template.initialEdges
  };
}

// ============================================================================
// 4.3. ARCHITECT LEADERBOARD & HALL OF FAME DATA GENERATOR
// ============================================================================
function getDailyLeaderboardEntries(dayNumber, playerPersonalBest, playerStreak) {
  const baseEntries = [
    {
      id: 'ada-1',
      name: 'Ada Lovelace',
      role: 'Staff Reliability Lead',
      company: 'Hyperscale Cloud',
      avatar: '👩‍💻',
      baseLatency: 28,
      uptime: 99.98,
      cost: 210,
      streak: 19,
      stack: ['WAF', 'CDN', 'CACHE', 'WEB', 'SQL']
    },
    {
      id: 'linus-2',
      name: 'Linus T.',
      role: 'Kernel Core Architect',
      company: 'Kernel.org',
      avatar: '🐧',
      baseLatency: 34,
      uptime: 99.92,
      cost: 185,
      streak: 14,
      stack: ['LB', 'WEB', 'CACHE', 'KAFKA', 'WORKER']
    },
    {
      id: 'grace-3',
      name: 'Grace Hopper',
      role: 'Distributed Systems Pioneer',
      company: 'Naval Cyber Ops',
      avatar: '⚡',
      baseLatency: 39,
      uptime: 99.88,
      cost: 235,
      streak: 12,
      stack: ['WAF', 'LB', 'WEB', 'CACHE', 'SQL']
    },
    {
      id: 'margaret-4',
      name: 'Margaret H.',
      role: 'Flight Systems SRE',
      company: 'Mission Control',
      avatar: '🚀',
      baseLatency: 45,
      uptime: 99.84,
      cost: 170,
      streak: 9,
      stack: ['CDN', 'LB', 'WEB', 'CACHE']
    },
    {
      id: 'satoshi-5',
      name: 'Satoshi N.',
      role: 'Decentralized Architect',
      company: 'Consensus Lab',
      avatar: '🪙',
      baseLatency: 52,
      uptime: 99.78,
      cost: 160,
      streak: 7,
      stack: ['KAFKA', 'WORKER', 'SQL', 'CACHE']
    },
    {
      id: 'kelsey-6',
      name: 'Kelsey H.',
      role: 'Cloud Native Advocate',
      company: 'Open Infra',
      avatar: '☸️',
      baseLatency: 58,
      uptime: 99.72,
      cost: 215,
      streak: 11,
      stack: ['WAF', 'CDN', 'LB', 'WEB', 'CACHE']
    },
    {
      id: 'werner-7',
      name: 'Werner V.',
      role: 'Global Cloud CTO',
      company: 'Amazon Web',
      avatar: '☁️',
      baseLatency: 64,
      uptime: 99.65,
      cost: 230,
      streak: 6,
      stack: ['CDN', 'STORAGE', 'LB', 'WEB', 'SQL']
    },
    {
      id: 'leslie-8',
      name: 'Leslie L.',
      role: 'Paxos Consensus Lead',
      company: 'TLA+ Reliability',
      avatar: '📜',
      baseLatency: 71,
      uptime: 99.58,
      cost: 195,
      streak: 4,
      stack: ['LB', 'WEB', 'SQL', 'STORAGE']
    }
  ];

  // Adjust base latencies by dayNumber so scores vary slightly per day's incident difficulty
  const dayShift = (dayNumber * 7) % 11;
  const list = baseEntries.map((e) => ({
    ...e,
    latency: e.baseLatency + dayShift
  }));

  if (playerPersonalBest !== null && playerPersonalBest !== undefined && playerPersonalBest > 0) {
    list.push({
      id: 'player-you',
      name: 'You (Lead Architect)',
      role: 'System Saviour',
      company: 'Your Organization',
      avatar: '⭐',
      badge: 'YOU',
      latency: Math.round(playerPersonalBest),
      uptime: 99.8,
      cost: 190,
      streak: playerStreak || 1,
      isUser: true,
      stack: ['Active Cluster']
    });
  }

  list.sort((a, b) => a.latency - b.latency);

  // Re-assign rank badges
  return list.map((item, idx) => {
    let rankBadge = `#${idx + 1}`;
    if (idx === 0) rankBadge = '🥇 #1';
    else if (idx === 1) rankBadge = '🥈 #2';
    else if (idx === 2) rankBadge = '🥉 #3';
    return {
      ...item,
      rank: idx + 1,
      rankBadge: item.isUser ? 'YOU' : rankBadge
    };
  });
}

function getSurvivalLeaderboardEntries(playerBestWave) {
  const list = [
    { name: 'Chaos Conqueror', role: 'Staff SRE Lead', wave: 19, rps: '50,500', badge: '🥇 #1', streak: 16, avatar: '🛡️' },
    { name: 'Zero Downtime Dan', role: 'Principal Infra', wave: 16, rps: '43,000', badge: '🥈 #2', streak: 11, avatar: '⚡' },
    { name: 'High Availability Hannah', role: 'Cloud Architect', wave: 14, rps: '38,000', badge: '🥉 #3', streak: 14, avatar: '👑' },
    { name: 'Sub-Zero Latency', role: 'Performance Eng', wave: 12, rps: '33,000', badge: '#4', streak: 8, avatar: '🚀' },
    { name: 'Circuit Breaker Chris', role: 'Senior SRE', wave: 10, rps: '28,000', badge: '#5', streak: 5, avatar: '🔌' },
    { name: 'Load Shedder Sam', role: 'DevOps Architect', wave: 8, rps: '23,000', badge: '#6', streak: 6, avatar: '⚖️' }
  ];

  if (playerBestWave && playerBestWave > 1) {
    list.push({
      name: 'You (Lead Architect)',
      role: 'Active Challenger',
      wave: playerBestWave,
      rps: `${(3000 + playerBestWave * 2500).toLocaleString()}`,
      badge: 'YOU',
      isUser: true,
      streak: 1,
      avatar: '⭐'
    });
  }

  list.sort((a, b) => b.wave - a.wave);

  return list.map((item, idx) => {
    let rankBadge = `#${idx + 1}`;
    if (idx === 0) rankBadge = '🥇 #1';
    else if (idx === 1) rankBadge = '🥈 #2';
    else if (idx === 2) rankBadge = '🥉 #3';
    return {
      ...item,
      rank: idx + 1,
      rankBadge: item.isUser ? 'YOU' : rankBadge
    };
  });
}

// Helper to parse challenge from current URL hash or search params
function getChallengeFromUrl() {
  try {
    if (typeof window === 'undefined') return null;

    // Check for direct #leaderboard hash
    if (window.location.hash === '#leaderboard' || (window.location.search && window.location.search.includes('tab=leaderboard'))) {
      const daily = getDailyIncident();
      return {
        isLeaderboardDirect: true,
        gameMode: 'DAILY',
        author: 'Leaderboard',
        levelIdx: 0,
        survivalWave: 1,
        nodes: JSON.parse(JSON.stringify(daily.initialNodes)),
        edges: JSON.parse(JSON.stringify(daily.initialEdges))
      };
    }

    // Check for direct #daily hash
    if (window.location.hash === '#daily' || (window.location.search && window.location.search.includes('mode=daily'))) {
      const daily = getDailyIncident();
      return {
        gameMode: 'DAILY',
        isDailyDirect: true,
        author: 'Daily Incident Director',
        levelIdx: 0,
        survivalWave: 1,
        nodes: JSON.parse(JSON.stringify(daily.initialNodes)),
        edges: JSON.parse(JSON.stringify(daily.initialEdges))
      };
    }

    // Check for direct #chaos hash
    if (window.location.hash === '#chaos' || (window.location.search && window.location.search.includes('mode=chaos'))) {
      return {
        isChaosDirect: true,
        gameMode: 'CAMPAIGN',
        author: 'Chaos Monkey',
        levelIdx: 4,
        survivalWave: 1,
        nodes: JSON.parse(JSON.stringify(CAMPAIGN_LEVELS[4].initialNodes)),
        edges: JSON.parse(JSON.stringify(CAMPAIGN_LEVELS[4].initialEdges))
      };
    }

    // Check for direct #preset= or #presets hash
    if (window.location.hash === '#presets' || window.location.hash.startsWith('#preset=') || (window.location.search && window.location.search.includes('preset'))) {
      let presetId = 'netflix';
      if (window.location.hash.startsWith('#preset=')) {
        presetId = window.location.hash.replace('#preset=', '').toLowerCase();
      } else if (window.location.search) {
        const sp = new URLSearchParams(window.location.search);
        presetId = (sp.get('preset') || 'netflix').toLowerCase();
      }
      const matched = ICONIC_PRESETS.find((p) => p.id === presetId) || ICONIC_PRESETS[0];
      return {
        isPresetDirect: true,
        isPresetsModalOpen: window.location.hash === '#presets',
        gameMode: 'SANDBOX',
        author: matched.company,
        levelIdx: 0,
        survivalWave: 1,
        targetRps: matched.targetRps,
        presetName: matched.name,
        nodes: JSON.parse(JSON.stringify(matched.nodes)),
        edges: JSON.parse(JSON.stringify(matched.edges))
      };
    }

    // Check for direct #badges or #achievements hash
    if (window.location.hash === '#badges' || window.location.hash === '#achievements' || (window.location.search && window.location.search.includes('badges'))) {
      return {
        isBadgesDirect: true,
        gameMode: 'CAMPAIGN',
        author: 'Architect Showcase',
        levelIdx: 0,
        survivalWave: 1,
        nodes: JSON.parse(JSON.stringify(CAMPAIGN_LEVELS[0].initialNodes)),
        edges: JSON.parse(JSON.stringify(CAMPAIGN_LEVELS[0].initialEdges))
      };
    }

    let encoded = null;
    if (window.location.hash) {
      const hashStr = window.location.hash.replace(/^#/, '');
      const hashParams = new URLSearchParams(hashStr);
      encoded = hashParams.get('challenge');
      if (!encoded && hashStr.startsWith('challenge=')) {
        encoded = hashStr.substring('challenge='.length);
      }
    }
    if (!encoded && window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      encoded = searchParams.get('challenge');
    }
    if (!encoded) return null;

    const parsed = decodeChallengePayload(decodeURIComponent(encoded));
    if (parsed && Array.isArray(parsed.n) && Array.isArray(parsed.e)) {
      const validMode =
        parsed.m === 'SURVIVAL' || parsed.m === 'SANDBOX' || parsed.m === 'DAILY' || parsed.m === 'CAMPAIGN' ? parsed.m : 'CAMPAIGN';
      const validLevel =
        typeof parsed.l === 'number' && parsed.l >= 0 && parsed.l < CAMPAIGN_LEVELS.length ? parsed.l : 0;
      return {
        gameMode: validMode,
        levelIdx: validLevel,
        survivalWave: typeof parsed.w === 'number' ? parsed.w : 1,
        author: parsed.a || 'Architect',
        nodes: parsed.n.map((n) => {
          let nodeType = n.t;
          if (nodeType === 'REDIS') nodeType = 'CACHE';
          if (nodeType === 'DATABASE' || nodeType === 'POSTGRES') nodeType = 'SQL';
          if (!COMPONENT_CATALOG[nodeType]) nodeType = 'WEB';
          return {
            id: n.id,
            type: nodeType,
            x: n.x,
            y: n.y,
            tier: n.tier || 1,
            config: n.c || {},
            status: 'healthy',
            cpu: 0,
            rps: 0,
            errors: 0
          };
        }),
        edges: parsed.e.map((e, idx) => ({
          id: `e-${e.f}-${e.t}-${idx}`,
          from: e.f,
          to: e.t
        }))
      };
    }
  } catch (err) {
    console.error('Error parsing challenge from URL:', err);
  }
  return null;
}

// Helper to load saved topology from localStorage with fallback to default scenario layout
function getSavedTopology(mode, levelIdx) {
  const daily = getDailyIncident();
  try {
    const key =
      mode === 'CAMPAIGN'
        ? `systemsaviour_arch_CAMPAIGN_${levelIdx}`
        : mode === 'DAILY'
        ? `systemsaviour_arch_DAILY_${daily.dayNumber}`
        : `systemsaviour_arch_${mode}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges) && parsed.nodes.length > 0) {
        return { nodes: parsed.nodes, edges: parsed.edges };
      }
    }
  } catch (e) {
    console.error('Error reading saved architecture from localStorage:', e);
  }

  // Fallbacks:
  if (mode === 'DAILY') {
    return {
      nodes: JSON.parse(JSON.stringify(daily.initialNodes)),
      edges: JSON.parse(JSON.stringify(daily.initialEdges))
    };
  } else if (mode === 'CAMPAIGN') {
    const lvl = CAMPAIGN_LEVELS[levelIdx] || CAMPAIGN_LEVELS[0];
    return {
      nodes: JSON.parse(JSON.stringify(lvl.initialNodes)),
      edges: JSON.parse(JSON.stringify(lvl.initialEdges))
    };
  } else if (mode === 'SURVIVAL') {
    return {
      nodes: [
        { id: 'src', type: 'SOURCE', x: 50, y: 220, config: {} },
        { id: 'lb-1', type: 'LB', x: 260, y: 220, config: { algorithm: 0 } },
        { id: 'web-1', type: 'WEB', x: 480, y: 220, config: { tier: 1 } },
        { id: 'sql-1', type: 'SQL', x: 760, y: 220, config: { scaling: 0 } }
      ],
      edges: [
        { id: 'e1', from: 'src', to: 'lb-1' },
        { id: 'e2', from: 'lb-1', to: 'web-1' },
        { id: 'e3', from: 'web-1', to: 'sql-1' }
      ]
    };
  } else {
    return {
      nodes: [
        { id: 'src', type: 'SOURCE', x: 50, y: 220, config: {} },
        { id: 'cdn-1', type: 'CDN', x: 230, y: 220, config: { hitRatio: 1 } },
        { id: 'lb-1', type: 'LB', x: 410, y: 220, config: { algorithm: 1 } },
        { id: 'web-1', type: 'WEB', x: 590, y: 220, config: { tier: 1 } },
        { id: 'cache-1', type: 'REDIS', x: 770, y: 150, config: { cacheSize: 1 } },
        { id: 'sql-1', type: 'SQL', x: 770, y: 290, config: { scaling: 0 } }
      ],
      edges: [
        { id: 'e1', from: 'src', to: 'cdn-1' },
        { id: 'e2', from: 'cdn-1', to: 'lb-1' },
        { id: 'e3', from: 'lb-1', to: 'web-1' },
        { id: 'e4', from: 'web-1', to: 'cache-1' },
        { id: 'e5', from: 'web-1', to: 'sql-1' }
      ]
    };
  }
}

// ============================================================================
// 4.6. VICTORY CONFETTI CELEBRATION COMPONENT (PURE 2D CANVAS PARTICLES)
// ============================================================================
function ConfettiOverlay() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const colors = ['#f59e0b', '#10b981', '#38bdf8', '#fbbf24', '#ec4899', '#8b5cf6', '#ffffff'];
    const particles = [];
    const count = 90;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: width * 0.5 + (Math.random() - 0.5) * 120,
        y: height * 0.35,
        vx: (Math.random() - 0.5) * 18,
        vy: -Math.random() * 16 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 14,
        wobble: Math.random() * 10,
        opacity: 1
      });
    }

    let animationFrameId;
    const startTime = Date.now();

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, width, height);

      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.38; // gravity
        p.vx *= 0.98; // air drag
        p.rotation += p.rotationSpeed;
        p.wobble += 0.12;

        if (elapsed > 2000) {
          p.opacity = Math.max(0, 1 - (elapsed - 2000) / 1600);
        }

        if (p.opacity > 0 && p.y < height + 40) {
          alive = true;
          ctx.save();
          ctx.translate(p.x + Math.sin(p.wobble) * 5, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      }

      if (alive && elapsed < 3800) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-50 pointer-events-none w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}

// ============================================================================
// 4.7. REAL-TIME AUDIO VISUALIZER & ADAPTIVE TRAFFIC BEAT COMPONENT
// ============================================================================
function AudioVisualizerWidget({ soundEngine, isMuted, isPlaying, className = '' }) {
  const [bars, setBars] = useState([0.2, 0.4, 0.6, 0.3, 0.5]);
  const [beatInfo, setBeatInfo] = useState({ bpm: 124, playbackRate: '1.00', intensity: 'NORMAL' });

  useEffect(() => {
    let animId;
    let lastTime = 0;

    const updateBars = (time) => {
      if (time - lastTime > 40) { // ~25 fps update rate for smooth 60Hz response
        lastTime = time;
        if (soundEngine) {
          const data = soundEngine.getVisualizerData();
          setBars(data);
          setBeatInfo(soundEngine.getBeatInfo());
        }
      }
      animId = requestAnimationFrame(updateBars);
    };

    animId = requestAnimationFrame(updateBars);
    return () => cancelAnimationFrame(animId);
  }, [soundEngine]);

  const getBarColor = (intensity) => {
    if (intensity === 'CHAOS_P0') {
      return 'bg-gradient-to-t from-rose-600 via-red-500 to-amber-300 shadow-[0_0_8px_rgba(239,68,68,0.7)]';
    }
    if (intensity === 'OVERLOAD') {
      return 'bg-gradient-to-t from-amber-600 via-orange-500 to-yellow-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]';
    }
    if (intensity === 'SURGE') {
      return 'bg-gradient-to-t from-cyan-600 via-teal-400 to-emerald-300 shadow-[0_0_8px_rgba(20,184,166,0.5)]';
    }
    return 'bg-gradient-to-t from-indigo-500 via-cyan-400 to-emerald-300 shadow-[0_0_6px_rgba(56,189,248,0.4)]';
  };

  const isSilenced = isMuted || !isPlaying;

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-700/60 bg-slate-900/80 backdrop-blur-md shadow-md transition-all ${className}`}
      title={`Live Audio Spectrum • Adaptive Beat: ${beatInfo.bpm} BPM (${beatInfo.intensity})`}
    >
      {/* 5 Equalizer Frequency Spectrum Bars */}
      <div className="flex items-end gap-[3px] h-4 w-6 justify-center">
        {bars.map((val, idx) => {
          const heightPx = isSilenced ? 3 : Math.max(3, Math.round(val * 16));
          return (
            <div
              key={idx}
              className={`w-[3px] rounded-full transition-all duration-75 ${
                isSilenced ? 'bg-slate-700' : getBarColor(beatInfo.intensity)
              }`}
              style={{ height: `${heightPx}px` }}
            />
          );
        })}
      </div>

      {/* Dynamic Beat Rate / Intensity Indicator */}
      <div className="flex items-center gap-1 font-mono">
        <span
          className={`text-[11px] font-bold tracking-tight leading-none ${
            isSilenced
              ? 'text-slate-500'
              : beatInfo.intensity === 'CHAOS_P0'
              ? 'text-rose-400 font-extrabold animate-pulse'
              : beatInfo.intensity === 'OVERLOAD'
              ? 'text-amber-400 font-bold'
              : beatInfo.intensity === 'SURGE'
              ? 'text-cyan-300 font-bold'
              : 'text-indigo-300'
          }`}
        >
          {beatInfo.bpm}
          <span className="text-[8px] text-slate-400 ml-0.5">BPM</span>
        </span>
        {!isSilenced && beatInfo.intensity === 'CHAOS_P0' && (
          <span className="text-[10px] text-rose-400 animate-bounce leading-none" title="P0 High-Alert Tempo Surge!">🔥</span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 5. MAIN REACT APPLICATION COMPONENT
// ============================================================================
export default function App() {
  const initialChallengeRef = useRef(getChallengeFromUrl());
  const dailyIncident = useMemo(() => getDailyIncident(), []);

  // Daily Streak and Today's completion state
  const [dailyStreak, setDailyStreak] = useState(() => {
    try {
      const s = localStorage.getItem('systemsaviour_daily_streak');
      return s ? parseInt(s, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [isDailyCompletedToday, setIsDailyCompletedToday] = useState(() => {
    try {
      const lastDate = localStorage.getItem('systemsaviour_daily_last_completed_date');
      return lastDate === dailyIncident.dateKey;
    } catch {
      return false;
    }
  });

  const recordDailyCompletion = useCallback((p99) => {
    try {
      const today = dailyIncident.dateKey;
      const lastDate = localStorage.getItem('systemsaviour_daily_last_completed_date');
      let newStreak = dailyStreak;
      if (lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        newStreak = lastDate === yesterday ? dailyStreak + 1 : 1;
        localStorage.setItem('systemsaviour_daily_streak', newStreak.toString());
        localStorage.setItem('systemsaviour_daily_last_completed_date', today);
        setDailyStreak(newStreak);
        setIsDailyCompletedToday(true);
      }
      const bestKey = `systemsaviour_daily_best_${dailyIncident.dayNumber}`;
      const prevBest = localStorage.getItem(bestKey);
      if (!prevBest || p99 < parseFloat(prevBest)) {
        localStorage.setItem(bestKey, p99.toString());
      }
    } catch (err) {
      console.warn('Failed recording daily completion:', err);
    }
  }, [dailyIncident, dailyStreak]);

  const [activeChallengeBanner, setActiveChallengeBanner] = useState(() => {
    if (initialChallengeRef.current) {
      return {
        author: initialChallengeRef.current.author,
        levelIdx: initialChallengeRef.current.levelIdx,
        gameMode: initialChallengeRef.current.gameMode
      };
    }
    return null;
  });

  // Mode & Level State (Persisted in localStorage or restored from URL challenge)
  const [gameMode, setGameMode] = useState(() => {
    if (initialChallengeRef.current?.gameMode) {
      return initialChallengeRef.current.gameMode;
    }
    try {
      const saved = localStorage.getItem('systemsaviour_active_mode');
      return saved === 'SURVIVAL' || saved === 'SANDBOX' || saved === 'DAILY' || saved === 'CAMPAIGN' ? saved : 'CAMPAIGN';
    } catch {
      return 'CAMPAIGN';
    }
  });

  const [currentLevelIdx, setCurrentLevelIdx] = useState(() => {
    if (typeof initialChallengeRef.current?.levelIdx === 'number') {
      return initialChallengeRef.current.levelIdx;
    }
    try {
      const saved = localStorage.getItem('systemsaviour_active_level');
      const idx = saved !== null ? parseInt(saved, 10) : 0;
      return !isNaN(idx) && idx >= 0 && idx < CAMPAIGN_LEVELS.length ? idx : 0;
    } catch {
      return 0;
    }
  });

  const currentLevel = useMemo(() => {
    if (gameMode === 'DAILY') return dailyIncident;
    return CAMPAIGN_LEVELS[currentLevelIdx] || CAMPAIGN_LEVELS[0];
  }, [gameMode, currentLevelIdx, dailyIncident]);

  // Topology State (Restored from URL challenge or localStorage)
  const [nodes, setNodes] = useState(() => {
    if (initialChallengeRef.current?.nodes && initialChallengeRef.current.nodes.length > 0) {
      return initialChallengeRef.current.nodes;
    }
    const initMode = (() => {
      try {
        const saved = localStorage.getItem('systemsaviour_active_mode');
        return saved === 'SURVIVAL' || saved === 'SANDBOX' || saved === 'DAILY' || saved === 'CAMPAIGN' ? saved : 'CAMPAIGN';
      } catch { return 'CAMPAIGN'; }
    })();
    const initLvl = (() => {
      try {
        const saved = localStorage.getItem('systemsaviour_active_level');
        const idx = saved !== null ? parseInt(saved, 10) : 0;
        return !isNaN(idx) && idx >= 0 && idx < CAMPAIGN_LEVELS.length ? idx : 0;
      } catch { return 0; }
    })();
    return getSavedTopology(initMode, initLvl).nodes;
  });

  const [edges, setEdges] = useState(() => {
    if (initialChallengeRef.current?.edges && initialChallengeRef.current.edges.length > 0) {
      return initialChallengeRef.current.edges;
    }
    const initMode = (() => {
      try {
        const saved = localStorage.getItem('systemsaviour_active_mode');
        return saved === 'SURVIVAL' || saved === 'SANDBOX' || saved === 'DAILY' || saved === 'CAMPAIGN' ? saved : 'CAMPAIGN';
      } catch { return 'CAMPAIGN'; }
    })();
    const initLvl = (() => {
      try {
        const saved = localStorage.getItem('systemsaviour_active_level');
        const idx = saved !== null ? parseInt(saved, 10) : 0;
        return !isNaN(idx) && idx >= 0 && idx < CAMPAIGN_LEVELS.length ? idx : 0;
      } catch { return 0; }
    })();
    return getSavedTopology(initMode, initLvl).edges;
  });

  const [selectedNodeId, setSelectedNodeId] = useState('web-1');
  const [connectingFromId, setConnectingFromId] = useState(null);
  const [toastNotification, setToastNotification] = useState(null);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState(Date.now());

  // Progressive Level Unlocking State (Persisted in localStorage)
  const [unlockedLevelIdx, setUnlockedLevelIdx] = useState(() => {
    try {
      const saved = localStorage.getItem('systemsaviour_unlocked_level') || localStorage.getItem('archquest_unlocked_level');
      return saved !== null ? Math.min(CAMPAIGN_LEVELS.length - 1, Math.max(0, parseInt(saved, 10))) : 0;
    } catch (e) {
      return 0;
    }
  });

  // Welcome Screen, Level Targets Briefing & Component Details Modal States (Skip welcome if loading deep link challenge)
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => !initialChallengeRef.current);
  const [levelBriefingModal, setLevelBriefingModal] = useState(null); // { mode: 'CAMPAIGN' | 'SURVIVAL' | 'SANDBOX', levelIdx?: number }
  const [detailModalComponent, setDetailModalComponent] = useState(null);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(() => initialChallengeRef.current?.isLeaderboardDirect || false);
  const [showPresetsModal, setShowPresetsModal] = useState(() => initialChallengeRef.current?.isPresetsModalOpen || false);
  const [showBadgesModal, setShowBadgesModal] = useState(() => initialChallengeRef.current?.isBadgesDirect || false);
  const [isBadgesShareCopied, setIsBadgesShareCopied] = useState(false);
  const [badgeToast, setBadgeToast] = useState(null); // { badge, timestamp }
  const [leaderboardTab, setLeaderboardTab] = useState('DAILY'); // 'DAILY' | 'SURVIVAL'
  const [isLeaderboardShareCopied, setIsLeaderboardShareCopied] = useState(false);

  // Unlocked Badges persistence in localStorage
  const [unlockedBadges, setUnlockedBadges] = useState(() => {
    try {
      const saved = localStorage.getItem('systemsaviour_unlocked_badges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const unlockBadge = useCallback((badgeId) => {
    setUnlockedBadges((prev) => {
      if (prev.includes(badgeId)) return prev;
      const next = [...prev, badgeId];
      try {
        localStorage.setItem('systemsaviour_unlocked_badges', JSON.stringify(next));
      } catch {}
      const b = ARCHITECT_BADGES.find((x) => x.id === badgeId);
      if (b) {
        sound.playUpgrade();
        setBadgeToast(b);
        setTimeout(() => setBadgeToast((curr) => (curr?.id === b.id ? null : curr)), 4500);
      }
      return next;
    });
  }, []);

  // Game Audio Synthesizer State
  const [isSoundMuted, setIsSoundMuted] = useState(() => sound.isMuted);
  const toggleSound = () => {
    const next = sound.toggleMute();
    setIsSoundMuted(next);
    if (!next) sound.playClick();
  };

  // Intro Audio Tour & Saviour Background Music State
  const [audioTourState, setAudioTourState] = useState({ isPlaying: false, currentStepIdx: 0 });
  const [isSaviourMusicPlaying, setIsSaviourMusicPlaying] = useState(true);
  const [isAudioActive, setIsAudioActive] = useState(() => sound.isMusicActive());

  useEffect(() => {
    const unsub = introAudioTour.subscribe((state) => {
      setAudioTourState({
        isPlaying: state.isPlaying,
        currentStepIdx: state.currentStepIdx
      });
    });
    return () => unsub();
  }, []);

  // Default Background Warrior Music ON: Autostart immediately & ensure on first user interaction
  useEffect(() => {
    // Attempt immediate playback upon page load
    sound.ensureContext();
    sound.startSaviourTheme();

    const syncAudioState = () => {
      setIsAudioActive(sound.isMusicActive());
    };

    const handleUserGesture = () => {
      sound.unlockAudio();
      syncAudioState();
    };

    // Use capture phase so no child component can swallow or stop propagation of the unlock
    window.addEventListener('click', handleUserGesture, { capture: true });
    window.addEventListener('keydown', handleUserGesture, { capture: true });
    window.addEventListener('touchstart', handleUserGesture, { capture: true });
    window.addEventListener('pointerdown', handleUserGesture, { capture: true });

    // Polling sync to detect when audio begins playing or pauses
    const syncTimer = setInterval(syncAudioState, 350);

    return () => {
      clearInterval(syncTimer);
      window.removeEventListener('click', handleUserGesture, { capture: true });
      window.removeEventListener('keydown', handleUserGesture, { capture: true });
      window.removeEventListener('touchstart', handleUserGesture, { capture: true });
      window.removeEventListener('pointerdown', handleUserGesture, { capture: true });
    };
  }, []);

  // Handle shared challenge deep linking & live hash navigation
  useEffect(() => {
    if (initialChallengeRef.current && !initialChallengeRef.current.isLeaderboardDirect && !initialChallengeRef.current.isChaosDirect && !initialChallengeRef.current.isPresetDirect) {
      sound.playUpgrade();
      setToastNotification({
        type: 'success',
        message: `🏆 Challenge Blueprint from ${initialChallengeRef.current.author} Loaded! Click "Start Traffic" to test resilience.`
      });
      setTimeout(() => setToastNotification(null), 5000);
    }

    if (initialChallengeRef.current?.isPresetDirect) {
      sound.playUpgrade();
      setToastNotification({
        type: 'success',
        message: `🎬 ${initialChallengeRef.current.presetName} Architecture Loaded! Ready for stress testing.`
      });
      setTimeout(() => setToastNotification(null), 4500);
    }

    if (initialChallengeRef.current?.isChaosDirect) {
      setTimeout(() => triggerManualChaos(), 600);
    }

    const handleHashChange = () => {
      if (window.location.hash === '#leaderboard') {
        setShowLeaderboardModal(true);
        return;
      }
      if (window.location.hash === '#presets') {
        setShowPresetsModal(true);
        return;
      }
      if (window.location.hash === '#chaos') {
        triggerManualChaos();
        return;
      }
      const challenge = getChallengeFromUrl();
      if (challenge) {
        if (challenge.isLeaderboardDirect) {
          setShowLeaderboardModal(true);
          return;
        }
        if (challenge.isChaosDirect) {
          setTimeout(() => triggerManualChaos(), 300);
        }
        if (challenge.isPresetDirect) {
          setSandboxRps(challenge.targetRps || 30000);
        }
        setGameMode(challenge.gameMode);
        setCurrentLevelIdx(challenge.levelIdx);
        setNodes(challenge.nodes);
        setEdges(challenge.edges);
        setIsRunning(false);
        setWaveProgress(0);
        setActiveChallengeBanner({
          author: challenge.author,
          levelIdx: challenge.levelIdx,
          gameMode: challenge.gameMode
        });
        sound.playUpgrade();
        setToastNotification({
          type: 'success',
          message: `🏆 Shared Challenge Architecture Loaded! Can you beat this system?`
        });
        setTimeout(() => setToastNotification(null), 4500);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // When Welcome modal closes, only stop the voiceover tour if active
  useEffect(() => {
    if (!showWelcomeModal) {
      introAudioTour.stop();
    }
  }, [showWelcomeModal]);

  // Auto-scroll welcome modal pane to active card when voice tour plays
  useEffect(() => {
    if (showWelcomeModal && audioTourState.isPlaying) {
      const stepIds = [
        'intro-header-card',
        'intro-video-card',
        'intro-learning-grid',
        'intro-modes-grid',
        'intro-footer-card'
      ];
      const targetId = stepIds[audioTourState.currentStepIdx];
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [showWelcomeModal, audioTourState.isPlaying, audioTourState.currentStepIdx]);

  // Simulation State
  const [isRunning, setIsRunning] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const [waveProgress, setWaveProgress] = useState(0); // 0 to 100%
  const [chaosActive, setChaosActive] = useState(false);
  const [survivalWave, setSurvivalWave] = useState(1);
  const [bestSurvivalWave, setBestSurvivalWave] = useState(() => {
    try {
      const saved = localStorage.getItem('systemsaviour_best_survival_wave');
      return saved !== null ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });
  const [sandboxRps, setSandboxRps] = useState(12000);
  const [postMortemModal, setPostMortemModal] = useState(null);
  const [isScorecardCopied, setIsScorecardCopied] = useState(false);
  const [isChallengeLinkCopied, setIsChallengeLinkCopied] = useState(false);
  const [showBeginnerHints, setShowBeginnerHints] = useState(true);

  // Game Juice & Screen Shake State
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [isRedAlertActive, setIsRedAlertActive] = useState(false);

  // Interactive Chaos Monkey Encounter & Live Outage Ticker State
  const [chaosEncounter, setChaosEncounter] = useState(null); // { type, nodeId, nodeName, x, y, dialogue, toolIcon, startedAt }
  const [activeOutageTicker, setActiveOutageTicker] = useState(null); // { id, level, title, summary, tweetQuote, victimId, nodeName }
  const [isWarStoryCopied, setIsWarStoryCopied] = useState(false);

  const triggerScreenShake = useCallback((withRedAlert = true) => {
    setIsScreenShaking(true);
    if (withRedAlert) setIsRedAlertActive(true);
    setTimeout(() => {
      setIsScreenShaking(false);
    }, 450);
    if (withRedAlert) {
      setTimeout(() => {
        setIsRedAlertActive(false);
      }, 1200);
    }
  }, []);

  // Canvas Pan, Zoom & Drag State
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeCatalogTab, setActiveCatalogTab] = useState('ALL');
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  const mentorSectionRef = useRef(null);
  const prevDiagnosticsKeyRef = useRef('');
  const [highlightMentor, setHighlightMentor] = useState(false);
  const inspectorSectionRef = useRef(null);
  const [highlightInspector, setHighlightInspector] = useState(false);
  const touchStartDistRef = useRef(0);
  const touchStartZoomRef = useRef(1);
  const [chaosBanner, setChaosBanner] = useState(null);

  // Player Architect Rank progression based on cleared levels, survival waves, badges & streak
  const playerRank = useMemo(() => {
    const ranks = [
      { level: 1, title: 'Cadet Architect', badge: '🔰' },
      { level: 2, title: 'Junior SRE', badge: '🥉' },
      { level: 3, title: 'Senior Cloud Architect', badge: '🥈' },
      { level: 4, title: 'Staff Reliability Lead', badge: '🥇' },
      { level: 5, title: 'Legendary Cloud Saviour', badge: '👑' }
    ];
    const rankIdx = Math.min(unlockedLevelIdx, ranks.length - 1);
    const badgeBonusXp = unlockedBadges.reduce((sum, bId) => {
      const b = ARCHITECT_BADGES.find((x) => x.id === bId);
      return sum + (b?.xpReward || 0);
    }, 0);
    const streakBonusXp = Math.min(dailyStreak * 100, 1000);
    const baseCampaignXp = (unlockedLevelIdx + 1) * 350;
    const survivalXp = survivalWave > 1 ? (survivalWave - 1) * 200 : 0;
    const totalXp = baseCampaignXp + survivalXp + badgeBonusXp + streakBonusXp;
    return {
      ...ranks[rankIdx],
      xp: totalXp,
      badgeBonusXp,
      streakBonusXp,
      baseCampaignXp,
      survivalXp
    };
  }, [unlockedLevelIdx, survivalWave, unlockedBadges, dailyStreak]);

  // Automatic Architect Badges check
  useEffect(() => {
    if (edges.length > 0 && !unlockedBadges.includes('first_wire')) {
      unlockBadge('first_wire');
    }
    if (nodes.some((n) => n.type === 'CACHE') && !unlockedBadges.includes('cache_king')) {
      unlockBadge('cache_king');
    }
    if (nodes.some((n) => n.type === 'WAF') && !unlockedBadges.includes('ddos_bastion')) {
      unlockBadge('ddos_bastion');
    }
    if (dailyStreak >= 3 && !unlockedBadges.includes('streak_fire')) {
      unlockBadge('streak_fire');
    }
    if (dailyStreak >= 7 && !unlockedBadges.includes('streak_titan')) {
      unlockBadge('streak_titan');
    }
    if (bestSurvivalWave >= 3 && !unlockedBadges.includes('wave_conqueror')) {
      unlockBadge('wave_conqueror');
    }
    if (unlockedLevelIdx >= 4 && !unlockedBadges.includes('staff_fellow')) {
      unlockBadge('staff_fellow');
    }
  }, [edges, nodes, dailyStreak, bestSurvivalWave, unlockedLevelIdx, unlockedBadges, unlockBadge]);

  // Personal Best and Leaderboard Calculations
  const playerDailyBest = useMemo(() => {
    try {
      const v = localStorage.getItem(`systemsaviour_daily_best_${dailyIncident.dayNumber}`);
      return v ? parseFloat(v) : null;
    } catch {
      return null;
    }
  }, [dailyIncident.dayNumber, isDailyCompletedToday]);

  const dailyLeaderboardEntries = useMemo(() => {
    return getDailyLeaderboardEntries(dailyIncident.dayNumber, playerDailyBest, dailyStreak);
  }, [dailyIncident.dayNumber, playerDailyBest, dailyStreak]);

  const survivalLeaderboardEntries = useMemo(() => {
    return getSurvivalLeaderboardEntries(bestSurvivalWave);
  }, [bestSurvivalWave]);

  const userDailyStanding = useMemo(() => {
    const userEntry = dailyLeaderboardEntries.find((e) => e.isUser);
    if (!userEntry) return null;
    const rank = userEntry.rank;
    const percentile = Math.max(1, Math.min(99, Math.round((rank / (dailyLeaderboardEntries.length + 80)) * 100)));
    return {
      rank,
      percentile,
      latency: userEntry.latency,
      streak: userEntry.streak,
      userEntry
    };
  }, [dailyLeaderboardEntries]);

  const handleCopyLeaderboardShare = () => {
    sound.playClick();
    const rankText = userDailyStanding
      ? `🏆 Ranked #${userDailyStanding.rank} (Top ${userDailyStanding.percentile}%) on System Saviour Daily Incident #${dailyIncident.dayNumber}!\n⏱️ P99 Latency: ${userDailyStanding.latency}ms • 🔥 Streak: ${dailyStreak} Days\n\nCan your architecture beat my score? Test it in your browser:\n👉 ${window.location.origin + window.location.pathname}#daily`
      : `⚡ System Saviour Distributed Architecture Challenge\n📅 Daily Incident #${dailyIncident.dayNumber}: ${dailyIncident.title}\n🔥 Current Streak: ${dailyStreak} Days\n\nTest your distributed systems skills in your browser:\n👉 ${window.location.origin + window.location.pathname}#daily`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(rankText);
    }
    setIsLeaderboardShareCopied(true);
    setToastNotification({
      type: 'success',
      message: 'Leaderboard rank copied to clipboard! Share on Twitter or Discord 📋'
    });
    setTimeout(() => {
      setIsLeaderboardShareCopied(false);
      setToastNotification(null);
    }, 3500);
  };

  const handleTweetLeaderboardShare = () => {
    sound.playClick();
    const rankText = userDailyStanding
      ? `🏆 Ranked #${userDailyStanding.rank} (Top ${userDailyStanding.percentile}%) on System Saviour Daily Incident #${dailyIncident.dayNumber}!\n⏱️ P99 Latency: ${userDailyStanding.latency}ms • 🔥 Streak: ${dailyStreak} Days\n\nCan your architecture beat my score? Test it in your browser:`
      : `⚡ System Saviour Distributed Architecture Challenge\n📅 Daily Incident #${dailyIncident.dayNumber}: ${dailyIncident.title}\n🔥 Current Streak: ${dailyStreak} Days\n\nTest your distributed systems skills in your browser:`;
    const shareUrl = `${window.location.origin + window.location.pathname}#daily`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(rankText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };


  // Select node and smoothly bring Component Inspector into screen view in right panel
  const handleSelectNode = useCallback((nodeId) => {
    sound.playClick();
    setSelectedNodeId(nodeId);
    if (rightPanelCollapsed) {
      setRightPanelCollapsed(false);
    }
    setTimeout(() => {
      if (inspectorSectionRef.current) {
        inspectorSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
    setHighlightInspector(true);
    setTimeout(() => setHighlightInspector(false), 2200);
  }, [rightPanelCollapsed]);

  // Auto-Save Architecture State to localStorage whenever nodes or edges change
  useEffect(() => {
    if (!nodes || nodes.length === 0) return;
    try {
      const key =
        gameMode === 'CAMPAIGN'
          ? `systemsaviour_arch_CAMPAIGN_${currentLevelIdx}`
          : gameMode === 'DAILY'
          ? `systemsaviour_arch_DAILY_${dailyIncident.dayNumber}`
          : `systemsaviour_arch_${gameMode}`;
      localStorage.setItem(key, JSON.stringify({ nodes, edges, savedAt: Date.now() }));
      localStorage.setItem('systemsaviour_active_mode', gameMode);
      if (gameMode === 'CAMPAIGN') {
        localStorage.setItem('systemsaviour_active_level', currentLevelIdx.toString());
      }
      setLastSavedTimestamp(Date.now());
    } catch (e) {
      console.warn('Auto-save to localStorage failed:', e);
    }
  }, [nodes, edges, gameMode, currentLevelIdx, dailyIncident.dayNumber]);

  // Load level when switched (validates unlocked levels and restores saved progress)
  const selectLevel = useCallback((idx) => {
    if (idx > unlockedLevelIdx) return;
    sound.playSelect();
    setCurrentLevelIdx(idx);
    try {
      localStorage.setItem('systemsaviour_active_level', idx.toString());
    } catch (e) {}
    const saved = getSavedTopology('CAMPAIGN', idx);
    setNodes(saved.nodes);
    setEdges(saved.edges);
    setSelectedNodeId(saved.nodes[1]?.id || saved.nodes[0]?.id || 'src');
    setConnectingFromId(null);
    setIsRunning(false);
    setWaveProgress(0);
    setPostMortemModal(null);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, [unlockedLevelIdx]);

  const switchMode = (mode) => {
    sound.playSelect();
    setGameMode(mode);
    try {
      localStorage.setItem('systemsaviour_active_mode', mode);
    } catch (e) {}
    setIsRunning(false);
    setWaveProgress(0);
    setPostMortemModal(null);
    setPan({ x: 0, y: 0 });
    setZoom(1);

    if (mode === 'CAMPAIGN') {
      const saved = getSavedTopology('CAMPAIGN', currentLevelIdx);
      setNodes(saved.nodes);
      setEdges(saved.edges);
      setSelectedNodeId(saved.nodes[1]?.id || saved.nodes[0]?.id || 'src');
    } else if (mode === 'DAILY') {
      const saved = getSavedTopology('DAILY', 0);
      setNodes(saved.nodes);
      setEdges(saved.edges);
      setSelectedNodeId(saved.nodes[1]?.id || saved.nodes[0]?.id || 'src');
    } else {
      const saved = getSavedTopology(mode, 0);
      setNodes(saved.nodes);
      setEdges(saved.edges);
      setSelectedNodeId(saved.nodes[1]?.id || saved.nodes[0]?.id || 'src');
    }
  };

  // Reset current scenario or sandbox layout back to default starting architecture
  const resetCurrentTopology = () => {
    sound.playClick();
    const key =
      gameMode === 'CAMPAIGN'
        ? `systemsaviour_arch_CAMPAIGN_${currentLevelIdx}`
        : gameMode === 'DAILY'
        ? `systemsaviour_arch_DAILY_${dailyIncident.dayNumber}`
        : `systemsaviour_arch_${gameMode}`;
    try {
      localStorage.removeItem(key);
    } catch (e) {}

    let defaultNodes = [];
    let defaultEdges = [];

    if (gameMode === 'CAMPAIGN') {
      const lvl = CAMPAIGN_LEVELS[currentLevelIdx];
      defaultNodes = JSON.parse(JSON.stringify(lvl.initialNodes));
      defaultEdges = JSON.parse(JSON.stringify(lvl.initialEdges));
    } else if (gameMode === 'DAILY') {
      defaultNodes = JSON.parse(JSON.stringify(dailyIncident.initialNodes));
      defaultEdges = JSON.parse(JSON.stringify(dailyIncident.initialEdges));
    } else if (gameMode === 'SURVIVAL') {
      defaultNodes = [
        { id: 'src', type: 'SOURCE', x: 50, y: 220, config: {} },
        { id: 'lb-1', type: 'LB', x: 260, y: 220, config: { algorithm: 0 } },
        { id: 'web-1', type: 'WEB', x: 480, y: 220, config: { tier: 1 } },
        { id: 'sql-1', type: 'SQL', x: 760, y: 220, config: { scaling: 0 } }
      ];
      defaultEdges = [
        { id: 'e1', from: 'src', to: 'lb-1' },
        { id: 'e2', from: 'lb-1', to: 'web-1' },
        { id: 'e3', from: 'web-1', to: 'sql-1' }
      ];
    } else {
      defaultNodes = [
        { id: 'src', type: 'SOURCE', x: 50, y: 220, config: {} },
        { id: 'cdn-1', type: 'CDN', x: 230, y: 220, config: { hitRatio: 1 } },
        { id: 'lb-1', type: 'LB', x: 410, y: 220, config: { algorithm: 1 } },
        { id: 'web-1', type: 'WEB', x: 590, y: 140, config: { tier: 1 } },
        { id: 'web-2', type: 'WEB', x: 590, y: 300, config: { tier: 1 } },
        { id: 'cache-1', type: 'CACHE', x: 770, y: 220, config: { eviction: 1 } },
        { id: 'sql-1', type: 'SQL', x: 940, y: 220, config: { scaling: 2 } }
      ];
      defaultEdges = [
        { id: 'e1', from: 'src', to: 'cdn-1' },
        { id: 'e2', from: 'cdn-1', to: 'lb-1' },
        { id: 'e3', from: 'lb-1', to: 'web-1' },
        { id: 'e4', from: 'lb-1', to: 'web-2' },
        { id: 'e5', from: 'web-1', to: 'cache-1' },
        { id: 'e6', from: 'web-2', to: 'cache-1' },
        { id: 'e7', from: 'cache-1', to: 'sql-1' }
      ];
    }

    setNodes(defaultNodes);
    setEdges(defaultEdges);
    setSelectedNodeId(defaultNodes[1]?.id || defaultNodes[0]?.id || 'src');
    setConnectingFromId(null);
    setIsRunning(false);
    setWaveProgress(0);
    setToastNotification({
      type: 'info',
      message: 'Layout reset to starting blueprint.'
    });
    setTimeout(() => setToastNotification(null), 3000);
  };

  // Export current architecture graph as a downloadable .json blueprint
  const exportArchitectureBlueprint = () => {
    sound.playClick();
    const blueprint = {
      appName: 'System Saviour',
      version: 1,
      exportedAt: new Date().toISOString(),
      gameMode,
      levelIdx: currentLevelIdx,
      levelTitle: gameMode === 'CAMPAIGN' ? CAMPAIGN_LEVELS[currentLevelIdx].title : gameMode,
      nodes,
      edges
    };
    const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanMode = gameMode.toLowerCase();
    const fileName = `systemsaviour_${cleanMode}${gameMode === 'CAMPAIGN' ? `_lvl${currentLevelIdx + 1}` : ''}_blueprint.json`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setToastNotification({
      type: 'success',
      message: `Blueprint downloaded: ${fileName}`
    });
    setTimeout(() => setToastNotification(null), 3500);
  };

  // Import architecture graph from a .json blueprint file
  const handleImportBlueprintFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data.nodes) && Array.isArray(data.edges) && data.nodes.length > 0) {
          sound.playUpgrade();
          setNodes(data.nodes);
          setEdges(data.edges);
          setSelectedNodeId(data.nodes[0]?.id || null);
          setIsRunning(false);
          setWaveProgress(0);
          setToastNotification({
            type: 'success',
            message: `Blueprint loaded: ${data.nodes.length} nodes & ${data.edges.length} wires restored!`
          });
          setTimeout(() => setToastNotification(null), 3500);
        } else {
          alert('Invalid blueprint format: Must contain nodes and edges arrays.');
        }
      } catch (err) {
        alert('Error parsing JSON blueprint file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Generate 1-click playable challenge URL with current architecture
  const generateChallengeUrl = useCallback(() => {
    const payload = {
      v: 1,
      m: gameMode,
      l: currentLevelIdx,
      w: survivalWave,
      a: 'Architect',
      n: nodes.map((n) => ({
        id: n.id,
        t: n.type,
        x: Math.round(n.x),
        y: Math.round(n.y),
        c: n.config || {},
        tier: n.tier || 1
      })),
      e: edges.map((e) => ({
        f: e.from,
        t: e.to
      }))
    };
    const b64 = encodeChallengePayload(payload);
    if (!b64) return window.location.href;
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#challenge=${encodeURIComponent(b64)}`;
  }, [gameMode, currentLevelIdx, survivalWave, nodes, edges]);

  const handleCopyChallengeLink = () => {
    sound.playClick();
    const url = generateChallengeUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setIsChallengeLinkCopied(true);
    setToastNotification({
      type: 'success',
      message: '🔗 1-Click Challenge Link copied! Send it to anyone to test your architecture.'
    });
    setTimeout(() => {
      setIsChallengeLinkCopied(false);
      setToastNotification(null);
    }, 3500);
  };

  // Generate formatted Wordle-style text scorecard for viral sharing
  const generateScorecardText = useCallback(() => {
    if (!postMortemModal) return '';
    const modeName =
      gameMode === 'CAMPAIGN'
        ? CAMPAIGN_LEVELS[currentLevelIdx]?.title?.split(':')[0] || 'Level 1'
        : gameMode === 'DAILY'
        ? `Daily Incident #${dailyIncident.dayNumber} (${dailyIncident.dateKey})`
        : gameMode === 'SURVIVAL'
        ? `Survival Wave ${survivalWave}`
        : 'Sandbox Lab';
    const starsEmoji = postMortemModal.won ? '⭐'.repeat(postMortemModal.stars || 3) : '💥 Incident';
    const activeComponents = Array.from(
      new Set(
        nodes
          .filter((n) => n.type !== 'SOURCE')
          .map((n) => COMPONENT_CATALOG[n.type]?.name?.split(' ')[0] || n.type)
      )
    )
      .slice(0, 5)
      .join(' + ');

    const streakLine = gameMode === 'DAILY' ? `\n🔥 Streak: ${dailyStreak} Day${dailyStreak === 1 ? '' : 's'}` : '';
    const challengeUrl = generateChallengeUrl();

    return `⚡ System Saviour Distributed Simulator
🎮 ${modeName} — ${starsEmoji}
🟢 Availability: ${postMortemModal.uptimePct}%
⏱️ P99 Latency: ${postMortemModal.p99Latency}ms${postMortemModal.totalCost ? `\n💰 Cost: $${postMortemModal.totalCost}/hr` : ''}${streakLine}
🧠 Stack: ${activeComponents || 'Custom Cluster'}

Can your architecture beat this? Test it in your browser:
👉 ${challengeUrl}`;
  }, [postMortemModal, gameMode, currentLevelIdx, survivalWave, nodes, dailyIncident, dailyStreak, generateChallengeUrl]);

  const handleCopyScorecard = () => {
    sound.playClick();
    const text = generateScorecardText();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setIsScorecardCopied(true);
    setToastNotification({
      type: 'success',
      message: 'Scorecard copied to clipboard! Share on Discord, Twitter, or LinkedIn 📋'
    });
    setTimeout(() => {
      setIsScorecardCopied(false);
      setToastNotification(null);
    }, 3500);
  };

  const handleShareTweet = () => {
    sound.playClick();
    const text = generateScorecardText();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Calculate live RPS and active traffic mix
  const targetPeakRps = useMemo(() => {
    if (gameMode === 'CAMPAIGN' || gameMode === 'DAILY') return currentLevel.targetRps;
    if (gameMode === 'SURVIVAL') return 3000 + survivalWave * 2500;
    return sandboxRps;
  }, [gameMode, currentLevel, survivalWave, sandboxRps]);

  const activeTrafficMix = useMemo(() => {
    if (gameMode === 'CAMPAIGN' || gameMode === 'DAILY') return currentLevel.trafficMix;
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

  const currentMaxBudget = (gameMode === 'CAMPAIGN' || gameMode === 'DAILY') ? currentLevel.maxBudgetHr : null;

  // Run real-time simulation evaluation
  const evaluation = useMemo(() => {
    return evaluateArchitecture(nodes, edges, currentLiveRps, activeTrafficMix, currentMaxBudget);
  }, [nodes, edges, currentLiveRps, activeTrafficMix, currentMaxBudget]);

  // Real-time pass criteria evaluation
  const targetLatency = (gameMode === 'CAMPAIGN' || gameMode === 'DAILY') ? currentLevel.maxLatencyMs : 250;
  const targetMinUptime = (gameMode === 'CAMPAIGN' || gameMode === 'DAILY') ? currentLevel.minUptimePct : 98.0;
  const passedLatency = evaluation.p99Latency <= targetLatency;
  const passedUptime = evaluation.uptimePct >= targetMinUptime;
  const passedBudget = !currentMaxBudget || evaluation.totalHourlyCost <= currentMaxBudget;
  const isLevelPassing = passedLatency && passedUptime && passedBudget;

  // Drive Adaptive Traffic Beat Engine
  useEffect(() => {
    const loadRatio = Math.min(1.2, currentLiveRps / Math.max(1, targetPeakRps));
    const hasCrashedNodes = nodes.some((n) => n.crashed);
    const isIncident = chaosEncounter !== null || isRedAlertActive || hasCrashedNodes || evaluation.uptimePct < 98;
    sound.setAdaptiveTrafficBeat(loadRatio, isIncident, isRunning);
  }, [currentLiveRps, targetPeakRps, chaosEncounter, isRedAlertActive, nodes, evaluation.uptimePct, isRunning]);

  // Ada's Reactive Tactical Comms Advice
  const adaCurrentTip = useMemo(() => {
    const crashedCount = nodes.filter((n) => n.crashed).length;
    if (crashedCount > 0) {
      return {
        mood: 'DANGER',
        text: `Red Alert! ${crashedCount} service instance(s) crashed! Verify failover paths or click Chaos to restore.`,
        action: 'Check Outage'
      };
    }
    const targetLat = (gameMode === 'CAMPAIGN' || gameMode === 'DAILY') ? currentLevel.maxLatencyMs : 250;
    const targetUptime = (gameMode === 'CAMPAIGN' || gameMode === 'DAILY') ? currentLevel.minUptimePct : 98.0;
    const budgetLimit = currentMaxBudget;

    if (evaluation.p99Latency > targetLat) {
      return {
        mood: 'WARNING',
        text: `P99 Latency (${evaluation.p99Latency}ms) breaches SLA (<${targetLat}ms)! Mitigate queuing with Redis Cache or horizontal scaling.`,
        action: 'Add Cache / Scale'
      };
    }
    if (evaluation.uptimePct < targetUptime) {
      return {
        mood: 'WARNING',
        text: `Uptime SLA (${evaluation.uptimePct}%) is below target (≥${targetUptime}%). Bottlenecked nodes are dropping packets!`,
        action: 'Relieve Bottlenecks'
      };
    }
    if (budgetLimit && evaluation.totalHourlyCost > budgetLimit) {
      return {
        mood: 'WARNING',
        text: `Hourly compute cost ($${evaluation.totalHourlyCost}/hr) exceeds the budget limit ($${budgetLimit}/hr). Trim redundant instances!`,
        action: 'Optimize Cost'
      };
    }
    return {
      mood: 'NOMINAL',
      text: 'All architecture telemetry within SLA parameters! Defense grid armed and ready for Peak Wave simulation.',
      action: 'Launch Peak Wave'
    };
  }, [nodes, evaluation, gameMode, currentLevel, currentMaxBudget]);


  // Automatically scroll Architecture Mentor & Diagnostics into screen view when diagnostics change
  useEffect(() => {
    const currentKey = evaluation.diagnostics.join('||');
    if (prevDiagnosticsKeyRef.current && prevDiagnosticsKeyRef.current !== currentKey) {
      if (rightPanelCollapsed) {
        setRightPanelCollapsed(false);
      }
      // Small timeout to allow right panel expansion if it was collapsed
      setTimeout(() => {
        if (mentorSectionRef.current) {
          mentorSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 60);

      setHighlightMentor(true);
      const timer = setTimeout(() => setHighlightMentor(false), 2600);
      return () => clearTimeout(timer);
    }
    prevDiagnosticsKeyRef.current = currentKey;
  }, [evaluation.diagnostics, rightPanelCollapsed]);

  // Global mouseup and touchend listener to reliably release drag and pan anywhere on window
  useEffect(() => {
    const handleGlobalRelease = () => {
      setIsPanning(false);
      setDraggingNodeId(null);
      touchStartDistRef.current = 0;
    };
    window.addEventListener('mouseup', handleGlobalRelease);
    window.addEventListener('touchend', handleGlobalRelease);
    window.addEventListener('touchcancel', handleGlobalRelease);
    return () => {
      window.removeEventListener('mouseup', handleGlobalRelease);
      window.removeEventListener('touchend', handleGlobalRelease);
      window.removeEventListener('touchcancel', handleGlobalRelease);
    };
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

        // Mid-wave Chaos Monkey trigger (at ~50% progress in Level 5, Survival Wave 2+, or Chaos active)
        const shouldAutoChaos =
          (gameMode === 'SURVIVAL' && survivalWave >= 2) ||
          (gameMode === 'CAMPAIGN' && currentLevelIdx === 4) ||
          chaosActive;

        if (shouldAutoChaos && Math.floor(prev) < 50 && Math.floor(next) >= 50) {
          triggerManualChaos();
        }

        // Radar warning ping & subtle screen shake if system is experiencing severe SLA pressure
        const targetLat = (gameMode === 'CAMPAIGN' || gameMode === 'DAILY') ? currentLevel.maxLatencyMs : 250;
        if ((evaluation.p99Latency > targetLat || evaluation.uptimePct < 98) && Math.floor(next) % 25 === 0 && Math.floor(prev) % 25 !== 0) {
          sound.playWarning();
          triggerScreenShake(false);
        }

        if (next >= 100) {
          setIsRunning(false);
          sound.stopAmbientDrone();
          // Evaluate wave outcome
          const passedSLA =
            evaluation.uptimePct >= ((gameMode === 'CAMPAIGN' || gameMode === 'DAILY') ? currentLevel.minUptimePct : 98.0) &&
            evaluation.p99Latency <= ((gameMode === 'CAMPAIGN' || gameMode === 'DAILY') ? currentLevel.maxLatencyMs : 250);
          const passedBudget = !currentMaxBudget || evaluation.totalHourlyCost <= currentMaxBudget;

          if (gameMode === 'CAMPAIGN' || gameMode === 'DAILY') {
            const isWon = passedSLA && passedBudget;
            if (isWon) {
              sound.playVictory();
              if (evaluation.totalHourlyCost <= 200) {
                unlockBadge('frugal_finops');
              }
              if (gameMode === 'CAMPAIGN') {
                setUnlockedLevelIdx((prev) => {
                  const updated = Math.min(CAMPAIGN_LEVELS.length - 1, Math.max(prev, currentLevelIdx + 1));
                  try {
                    localStorage.setItem('systemsaviour_unlocked_level', updated.toString());
                    localStorage.setItem('archquest_unlocked_level', updated.toString());
                  } catch (e) {}
                  return updated;
                });
              } else if (gameMode === 'DAILY') {
                recordDailyCompletion(evaluation.p99Latency);
              }
            } else {
              sound.playDefeat();
            }
            const stars = isWon ? 1 + (passedSLA ? 1 : 0) + (passedBudget ? 1 : 0) : 0;
            setPostMortemModal({
              won: isWon,
              passedSLA,
              passedBudget,
              stars,
              p99Latency: evaluation.p99Latency,
              uptimePct: evaluation.uptimePct,
              totalCost: evaluation.totalHourlyCost
            });
          } else if (gameMode === 'SURVIVAL') {
            if (passedSLA) {
              sound.playVictory();
              setSurvivalWave((w) => {
                const nextWave = w + 1;
                setBestSurvivalWave((prevBest) => {
                  const updatedBest = Math.max(prevBest, nextWave);
                  try {
                    localStorage.setItem('systemsaviour_best_survival_wave', updatedBest.toString());
                  } catch (e) {}
                  return updatedBest;
                });
                return nextWave;
              });
              setWaveProgress(0);
              setIsRunning(true);
            } else {
              sound.playDefeat();
              setBestSurvivalWave((prevBest) => {
                const updatedBest = Math.max(prevBest, survivalWave);
                try {
                  localStorage.setItem('systemsaviour_best_survival_wave', updatedBest.toString());
                } catch (e) {}
                return updatedBest;
              });
              setPostMortemModal({
                won: false,
                survivalWave,
                stars: Math.max(1, Math.min(3, Math.floor(survivalWave / 2))),
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
    sound.playPlaceNode();
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
    sound.playDelete();
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.from !== nodeId && e.to !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId('src');
    if (connectingFromId === nodeId) setConnectingFromId(null);
  };

  const handlePortClick = (e, nodeId, portType) => {
    e.stopPropagation();
    if (portType === 'out') {
      sound.playClick();
      setConnectingFromId(connectingFromId === nodeId ? null : nodeId);
    } else if (portType === 'in' && connectingFromId && connectingFromId !== nodeId) {
      const exists = edges.some((ed) => ed.from === connectingFromId && ed.to === nodeId);
      if (!exists) {
        sound.playConnectWire();
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
    handleSelectNode(nodeId);
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

  // Touch event handlers for mobile panning, dragging nodes, and pinch-to-zoom
  const handleTouchStartNode = (nodeId, e) => {
    e.stopPropagation();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleMouseDownNode(nodeId, {
        clientX: touch.clientX,
        clientY: touch.clientY,
        stopPropagation: () => e.stopPropagation()
      });
    }
  };

  const handleCanvasTouchStart = (e) => {
    if (e.target.closest('.no-pan') || e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) {
      return;
    }
    if (e.touches.length === 1) {
      // 1-finger pan
      const touch = e.touches[0];
      setIsPanning(true);
      panStartRef.current = {
        x: touch.clientX - pan.x,
        y: touch.clientY - pan.y
      };
      setConnectingFromId(null);
    } else if (e.touches.length === 2) {
      // 2-finger pinch zoom
      setIsPanning(false);
      setDraggingNodeId(null);
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDistRef.current = Math.hypot(dx, dy);
      touchStartZoomRef.current = zoom;
    }
  };

  const handleCanvasTouchMove = (e) => {
    if (!canvasRef.current) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleCanvasMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY
      });
    } else if (e.touches.length === 2 && touchStartDistRef.current > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);
      const ratio = currentDist / touchStartDistRef.current;
      const newZoom = Math.max(0.35, Math.min(2.5, +(touchStartZoomRef.current * ratio).toFixed(2)));
      setZoom(newZoom);
    }
  };

  const handleCanvasTouchEnd = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
    touchStartDistRef.current = 0;
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

  const triggerManualChaos = (preferredType = null) => {
    const candidates = nodes.filter((n) => n.type !== 'SOURCE' && !n.crashed);
    if (candidates.length === 0) {
      sound.playUpgrade();
      setNodes((prev) => prev.map((n) => ({ ...n, crashed: false })));
      setChaosEncounter(null);
      setActiveOutageTicker(null);
      setToastNotification({
        type: 'success',
        message: 'All damaged nodes rebooted and restored to nominal service.'
      });
      setTimeout(() => setToastNotification(null), 3500);
      return;
    }

    sound.playChaosStrike();
    sound.playCrash();
    triggerScreenShake(true);

    // Pick victim node
    const victim = candidates[Math.floor(Math.random() * candidates.length)];
    const victimName = COMPONENT_CATALOG[victim.type]?.name || victim.type;

    // Multi-Vector Sabotage Attack Scenarios
    const attackVariants = [
      {
        type: 'POWER_CUT',
        name: 'Power Cable Severance',
        toolIcon: '✂️',
        dialogue: `Snip snip! Severed electrical feed to ${victimName}! Can your cluster fail over?`,
        tweetQuote: `Alert: Hardware power feed severed to ${victimName}! Failover in progress...`
      },
      {
        type: 'CACHE_FLUSH',
        name: 'Cache Eviction Storm',
        toolIcon: '🌪️',
        dialogue: `Whoosh! Evicted all cache keys! Stampede hitting database!`,
        tweetQuote: `Incident: 100% cache miss storm on ${victimName}! Read queue spiking...`
      },
      {
        type: 'DDOS_SWARM',
        name: 'Volumetric DDoS Attack',
        toolIcon: '👾',
        dialogue: `Injected 15,000 rogue bot requests directly into ${victimName}!`,
        tweetQuote: `SecOps: Malicious bot swarm detected targeting ${victimName}...`
      },
      {
        type: 'LATENCY_SPIKE',
        name: 'Fiber Packet Degradation',
        toolIcon: '🐢',
        dialogue: `Chewed the fiber route! Injected +250ms packet drop latency!`,
        tweetQuote: `Network telemetry: Major packet drop detected on ${victimName}...`
      }
    ];

    const attack = preferredType
      ? attackVariants.find((a) => a.type === preferredType) || attackVariants[0]
      : attackVariants[Math.floor(Math.random() * attackVariants.length)];

    // Crash the targeted victim node
    setNodes((prev) => prev.map((n) => (n.id === victim.id ? { ...n, crashed: true } : n)));

    // Set interactive canvas sprite encounter right above victim node
    setChaosEncounter({
      type: attack.type,
      nodeId: victim.id,
      nodeName: victimName,
      x: victim.x,
      y: victim.y,
      dialogue: attack.dialogue,
      toolIcon: attack.toolIcon,
      startedAt: Date.now()
    });

    // Set Live Breaking Outage Ticker
    setActiveOutageTicker({
      id: Date.now(),
      level: 'P0',
      title: `${attack.name} on ${victimName}`,
      summary: `Active Outage: ${victimName} knocked offline! P99 latency spiking!`,
      tweetQuote: attack.tweetQuote,
      victimId: victim.id,
      nodeName: victimName
    });
  };

  // Hotfix / Banish Chaos Monkey action
  const handleHotfixChaosNode = (nodeId) => {
    sound.playUpgrade();
    sound.playPlaceNode();
    unlockBadge('chaos_tamer');
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, crashed: false } : n)));
    setChaosEncounter(null);
    setActiveOutageTicker(null);
    setToastNotification({
      type: 'success',
      message: '⚡ SRE Self-Healing Triumph! Node rebooted & Chaos Monkey repelled! (+150 XP)'
    });
    setTimeout(() => setToastNotification(null), 3500);
  };

  // Share SRE War Story
  const handleShareWarStory = () => {
    sound.playClick();
    const story = activeOutageTicker
      ? `🚨 OUTAGE REPORT: Chaos Monkey executed a ${activeOutageTicker.title}!\n${activeOutageTicker.summary}\n\nOur architecture sustained ${evaluation.uptimePct}% uptime at ${evaluation.p99Latency}ms P99 latency!\n\nCan your distributed system survive Chaos Monkey?\nTest your resilience here 👉 ${window.location.origin + window.location.pathname}#chaos`
      : `🚨 SRE WAR STORY: Survived a surprise Chaos Monkey outage in System Saviour!\nCan your distributed architecture take a server crash?\nTest it here 👉 ${window.location.origin + window.location.pathname}#chaos`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(story);
    }
    setIsWarStoryCopied(true);
    setToastNotification({
      type: 'success',
      message: 'War story copied to clipboard! Share on Twitter or Slack 📋'
    });
    setTimeout(() => {
      setIsWarStoryCopied(false);
      setToastNotification(null);
    }, 3500);
  };

  const handleTweetWarStory = () => {
    sound.playClick();
    const story = activeOutageTicker
      ? `🚨 OUTAGE REPORT: Chaos Monkey executed a ${activeOutageTicker.title}!\n${activeOutageTicker.summary}\n\nCan your distributed architecture survive? Test it:`
      : `🚨 SRE WAR STORY: Survived a surprise Chaos Monkey outage in System Saviour!\nCan your distributed architecture take a server crash? Test it:`;
    const shareUrl = `${window.location.origin + window.location.pathname}#chaos`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(story)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  const resetWave = () => {
    sound.playClick();
    sound.stopAmbientDrone();
    setIsRunning(false);
    setWaveProgress(0);
    setPostMortemModal(null);
    setChaosEncounter(null);
    setActiveOutageTicker(null);
    setNodes((prev) => prev.map((n) => ({ ...n, crashed: false })));
  };

  // Deploy and share iconic architecture presets
  const handleLoadIconicPreset = (preset) => {
    sound.playUpgrade();
    sound.playPlaceNode();
    unlockBadge('iconic_architect');
    setGameMode('SANDBOX');
    setNodes(JSON.parse(JSON.stringify(preset.nodes)));
    setEdges(JSON.parse(JSON.stringify(preset.edges)));
    setSandboxRps(preset.targetRps);
    setIsRunning(false);
    setWaveProgress(0);
    setChaosEncounter(null);
    setActiveOutageTicker(null);
    setShowPresetsModal(false);
    setTimeout(() => resetView(), 80);
    setToastNotification({
      type: 'success',
      message: `🚀 Deployed ${preset.name}! Ready to stress-test in Sandbox Lab.`
    });
    setTimeout(() => setToastNotification(null), 4000);
  };

  const handleSharePreset = (preset) => {
    sound.playClick();
    const shareUrl = `${window.location.origin + window.location.pathname}#preset=${preset.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
    setToastNotification({
      type: 'success',
      message: `Link for ${preset.name} copied! Anyone can load this exact architecture 📋`
    });
    setTimeout(() => setToastNotification(null), 3500);
  };

  // Share Architect Badges & Trophy Showcase
  const handleShareBadges = () => {
    sound.playClick();
    const unlockedTitles = unlockedBadges
      .map((id) => ARCHITECT_BADGES.find((b) => b.id === id)?.title)
      .filter(Boolean)
      .slice(0, 4)
      .join(', ');
    const text = `🎖️ System Saviour Architect Credentials:\n👑 Rank: ${playerRank.title} (${playerRank.xp.toLocaleString()} XP)\n🔥 Daily Streak: ${dailyStreak} Day${dailyStreak === 1 ? '' : 's'}${dailyStreak >= 3 ? ' (1.25x Boost)' : ''}\n🏆 Badges: ${unlockedBadges.length}/${ARCHITECT_BADGES.length} Unlocked${unlockedTitles ? ` (${unlockedTitles}...)` : ''}\n\nCan your distributed architecture beat mine?\nTest your reliability in your browser 👉 ${window.location.origin + window.location.pathname}#badges`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setIsBadgesShareCopied(true);
    setToastNotification({
      type: 'success',
      message: 'Architect trophy scorecard copied! Ready to paste & flex on Twitter or Slack 🏆'
    });
    setTimeout(() => {
      setIsBadgesShareCopied(false);
      setToastNotification(null);
    }, 3500);
  };

  const handleTweetBadges = () => {
    sound.playClick();
    const text = `🎖️ System Saviour Architect Credentials:\n👑 Rank: ${playerRank.title} (${playerRank.xp.toLocaleString()} XP)\n🔥 Daily Streak: ${dailyStreak} Days\n🏆 Badges: ${unlockedBadges.length}/${ARCHITECT_BADGES.length} Unlocked\n\nCan your distributed architecture survive Chaos Monkey? Test it:`;
    const shareUrl = `${window.location.origin + window.location.pathname}#badges`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
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
    <div
      className="hero-cursor-game h-screen w-screen max-h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none fixed inset-0"
      style={{
        '--hero-cursor': `url(${heroCursorImg}) 4 6, auto`,
        cursor: `url(${heroCursorImg}) 4 6, auto`
      }}
    >
      {/* =================================================================== */}
      {/* 1. TOP TELEMETRY & NAVIGATION HEADER                                */}
      {/* =================================================================== */}
      <header className="shrink-0 glass-header px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 z-30 shadow-xl">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-base sm:text-lg shrink-0">
              ⚡
            </div>
            <span className="absolute -bottom-1 -right-1 text-[11px] leading-none" title={playerRank.title}>
              {playerRank.badge}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-black text-xs sm:text-sm tracking-wide text-white truncate font-display">
                System Saviour <span className="text-cyan-400">Simulator</span>
              </h1>
              <button
                onClick={() => {
                  sound.playClick();
                  setShowBadgesModal(true);
                }}
                className="cursor-pointer hover:border-indigo-400 hover:scale-105 transition text-[9px] sm:text-[10px] font-bold uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/40 shrink-0 flex items-center gap-1 shadow-sm active:scale-95"
                title="Click to view Architect Badges, Daily Streak Rewards & XP Showcase"
              >
                <span>{playerRank.badge}</span>
                <span className="hidden xs:inline">{playerRank.title}</span>
                <span className="text-amber-400 font-mono ml-0.5 font-black">🎖️{unlockedBadges.length}</span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span
                onClick={() => {
                  sound.playClick();
                  setShowBadgesModal(true);
                }}
                className="hidden sm:inline font-mono text-indigo-300 hover:text-white cursor-pointer transition font-bold"
                title="Total Architect XP (Click to view breakdown & badges)"
              >
                XP: {playerRank.xp.toLocaleString()}
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="hidden xs:inline">Ada AI Comms: Online</span>
              </span>
            </div>
          </div>

          {/* Mobile Mode Switcher Dropdown */}
          <div className="md:hidden">
            <select
              value={gameMode}
              onChange={(e) => setLevelBriefingModal({ mode: e.target.value, levelIdx: currentLevelIdx })}
              className="glass-subpanel text-indigo-300 text-xs font-bold rounded-lg px-2 py-1 outline-none font-display"
            >
              <option value="CAMPAIGN">🎓 Campaign</option>
              <option value="DAILY">📅 Daily #{dailyIncident.dayNumber} {dailyStreak > 0 ? `🔥${dailyStreak}` : ''}</option>
              <option value="SURVIVAL">🔥 Survival Wave</option>
              <option value="SANDBOX">🧪 Sandbox</option>
            </select>
          </div>

          {/* Desktop Mode Switcher */}
          <div className="hidden md:flex glass-subpanel p-1 rounded-xl ml-2">
            {[
              { id: 'CAMPAIGN', label: '🎓 Campaign' },
              {
                id: 'DAILY',
                label: `📅 Daily #${dailyIncident.dayNumber}${dailyStreak > 0 ? ` (🔥${dailyStreak})` : ''}`
              },
              { id: 'SURVIVAL', label: '🔥 Survival Wave' },
              { id: 'SANDBOX', label: '🧪 Sandbox Lab' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLevelBriefingModal({ mode: tab.id, levelIdx: currentLevelIdx })}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-display tracking-wide transition-all ${
                  gameMode === tab.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Simulation SLA Metrics */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-0.5 scrollbar-none shrink-0">
          {/* RPS Counter */}
          <div className="glass-subpanel px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isRunning ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="text-[11px] sm:text-xs text-slate-400 whitespace-nowrap">
              {isRunning ? 'Wave Surge:' : 'Active:'}
            </span>
            <span className="text-xs font-mono font-bold text-white whitespace-nowrap">{currentLiveRps.toLocaleString()} RPS</span>
          </div>

          {/* P99 Latency SLA */}
          <div
            className={`border px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 sm:gap-2 shrink-0 backdrop-blur-md ${
              passedLatency
                ? 'bg-slate-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/50 border-rose-500/50 text-rose-300'
            }`}
            title={`P99 Latency: ${evaluation.p99Latency}ms (Target: < ${targetLatency}ms)`}
          >
            <span className="text-[11px] sm:text-xs text-slate-400">P99:</span>
            <span className="text-xs font-mono font-bold">{evaluation.p99Latency}ms</span>
            <span className="text-[10px] text-slate-500 hidden sm:inline">(&lt;{targetLatency}ms)</span>
            <span className={`text-[10px] font-bold ${passedLatency ? 'text-emerald-400' : 'text-rose-400'}`}>
              {passedLatency ? '✓' : '✗'}
            </span>
          </div>

          {/* Uptime % */}
          <div
            className={`border px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 sm:gap-2 shrink-0 backdrop-blur-md ${
              passedUptime
                ? 'bg-slate-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/50 border-rose-500/50 text-rose-300'
            }`}
            title={`Uptime: ${evaluation.uptimePct}% (Target: ≥ ${targetMinUptime}%)`}
          >
            <span className="text-[11px] sm:text-xs text-slate-400">Uptime:</span>
            <span className="text-xs font-mono font-bold">{evaluation.uptimePct}%</span>
            <span className="text-[10px] text-slate-500 hidden sm:inline">(&ge;{targetMinUptime}%)</span>
            <span className={`text-[10px] font-bold ${passedUptime ? 'text-emerald-400' : 'text-rose-400'}`}>
              {passedUptime ? '✓' : '✗'}
            </span>
          </div>

          {/* Hourly Cost */}
          <div
            className={`border px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0 backdrop-blur-md ${
              passedBudget
                ? 'bg-slate-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/50 border-rose-500/50 text-rose-300'
            }`}
            title={`Hourly Cost: $${evaluation.totalHourlyCost}/hr ${currentMaxBudget ? `(Budget: ≤ $${currentMaxBudget})` : ''}`}
          >
            <span className="text-[11px] sm:text-xs text-slate-400">Cost:</span>
            <span className="text-xs font-mono font-bold">${evaluation.totalHourlyCost}/hr</span>
            {currentMaxBudget && (
              <span className="text-[10px] text-slate-500 hidden sm:inline">(&le;${currentMaxBudget})</span>
            )}
            {currentMaxBudget && (
              <span className={`text-[10px] font-bold ${passedBudget ? 'text-emerald-400' : 'text-rose-400'}`}>
                {passedBudget ? '✓' : '✗'}
              </span>
            )}
          </div>

          {/* Overall Level Readiness Pill (Campaign Mode) */}
          {gameMode === 'CAMPAIGN' && (
            <div
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold shrink-0 backdrop-blur-md ${
                isLevelPassing
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
              }`}
              title={isLevelPassing ? 'Current system status meets all targets to pass this level!' : 'Current system status breaches latency or uptime targets'}
            >
              <span>{isLevelPassing ? '✅ Ready to Pass' : '❌ Targets Breached'}</span>
            </div>
          )}
        </div>

        {/* Simulation Controls & Quick Toggles */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Simulation Controls */}
          <div className="flex items-center gap-1 glass-subpanel p-1 rounded-xl">
            <button
              onClick={() => {
                const next = !isRunning;
                setIsRunning(next);
                if (next) {
                  sound.playSimStart();
                  sound.startAmbientDrone();
                } else {
                  sound.playSimPause();
                  sound.stopAmbientDrone();
                }
              }}
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
              onClick={() => {
                sound.playClick();
                setSimSpeed(simSpeed === 1 ? 2 : simSpeed === 2 ? 5 : 1);
              }}
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

          {/* Panel Layout Toggles (Make Canvas Larger or Smaller) */}
          <div className="flex items-center gap-1 glass-subpanel p-1 rounded-xl">
            <button
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
              className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                !leftPanelCollapsed
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title={leftPanelCollapsed ? "Expand Component Palette (Make Canvas Smaller)" : "Collapse Component Palette (Make Canvas Bigger)"}
            >
              {leftPanelCollapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
              <span className="hidden xl:inline text-[11px]">Palette</span>
            </button>
            <button
              onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
              className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                !rightPanelCollapsed
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title={rightPanelCollapsed ? "Expand Mission & Inspector (Make Canvas Smaller)" : "Collapse Mission & Inspector (Make Canvas Bigger)"}
            >
              <span className="hidden xl:inline text-[11px]">Inspector</span>
              {rightPanelCollapsed ? <PanelRightOpen className="w-3.5 h-3.5" /> : <PanelRightClose className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Real-Time Audio Visualizer & Adaptive Traffic Beat Engine */}
          <AudioVisualizerWidget
            soundEngine={sound}
            isMuted={isSoundMuted}
            isPlaying={isAudioActive}
            className="hidden sm:flex"
          />

          {/* Audio Synthesizer Mute / Unmute Button */}
          <button
            onClick={toggleSound}
            className={`px-2.5 py-1 rounded-xl border text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md ${
              isSoundMuted
                ? 'bg-slate-900/60 backdrop-blur-md border-slate-800 text-slate-500 hover:text-slate-300'
                : 'bg-gradient-to-r from-indigo-950/80 to-purple-950/80 backdrop-blur-md border-indigo-500/40 text-indigo-300 hover:text-white shadow-indigo-950/40'
            }`}
            title={isSoundMuted ? 'Game Audio is Muted — Click to Enable Sound' : 'Game Audio is Active — Click to Mute'}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse text-indigo-400" />}
            <span className="font-bold hidden md:inline">{isSoundMuted ? 'Muted' : 'Sound ON'}</span>
          </button>

          {/* Warrior Battle Music Track Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              sound.ensureContext();
              const next = sound.toggleSaviourTheme();
              setIsSaviourMusicPlaying(next);
              setIsAudioActive(sound.isMusicActive());
            }}
            className={`px-2.5 py-1 rounded-xl border text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md ${
              isAudioActive && !isSoundMuted
                ? 'bg-amber-500/20 backdrop-blur-md border-amber-500/50 text-amber-300 shadow-amber-500/20'
                : 'bg-slate-900/60 backdrop-blur-md border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title="Warrior Battle Music Soundtrack (Click to Toggle)"
          >
            <Music className={`w-3.5 h-3.5 ${isAudioActive && !isSoundMuted ? 'animate-bounce text-amber-400' : ''}`} />
            <span className="font-bold hidden lg:inline">Theme: {isAudioActive && !isSoundMuted ? 'ON (75%)' : 'OFF'}</span>
          </button>

          {/* Chaos Monkey Incident Trigger */}
          <button
            onClick={triggerManualChaos}
            className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-rose-950/80 to-purple-950/80 backdrop-blur-md border border-rose-500/50 hover:border-rose-400 text-xs text-rose-200 flex items-center gap-1.5 transition shadow-md shadow-rose-950/30 group active:scale-95"
            title="Summon Chaos Monkey to snip an instance and test system failover!"
          >
            <div className="relative">
              <img
                src={chaosMonkeyImg}
                alt="Chaos Monkey"
                className="w-5 h-5 rounded-full object-cover ring-1 ring-rose-400/80 group-hover:scale-110 transition-transform"
              />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <span className="font-bold text-rose-300 hidden sm:inline">Chaos</span>
          </button>

          {/* Global Architect Leaderboard Button */}
          <button
            onClick={() => {
              sound.playClick();
              setShowLeaderboardModal(true);
            }}
            className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-950/80 to-yellow-950/80 backdrop-blur-md border border-amber-500/50 hover:border-amber-400 text-xs text-amber-200 flex items-center gap-1.5 transition shadow-md shadow-amber-950/30 group active:scale-95"
            title="View Daily Incident & Survival Leaderboard / Hall of Fame"
          >
            <Trophy className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-amber-300 hidden sm:inline">Leaderboard</span>
          </button>

          {/* Iconic Presets Button */}
          <button
            onClick={() => {
              sound.playClick();
              setShowPresetsModal(true);
            }}
            className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-950/80 to-indigo-950/80 backdrop-blur-md border border-purple-500/50 hover:border-purple-400 text-xs text-purple-200 flex items-center gap-1.5 transition shadow-md shadow-purple-950/30 group active:scale-95"
            title="Explore and deploy battle-tested architectures from Netflix, Spotify, Uber & Cloudflare"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="font-bold text-purple-300 hidden sm:inline">Presets</span>
          </button>

          {/* Architect Badges & Streak Rewards Button */}
          <button
            onClick={() => {
              sound.playClick();
              setShowBadgesModal(true);
            }}
            className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 backdrop-blur-md border border-emerald-500/50 hover:border-emerald-400 text-xs text-emerald-200 flex items-center gap-1.5 transition shadow-md shadow-emerald-950/30 group active:scale-95"
            title="View Architect Badges, Daily Streak Rewards & Trophy Showcase"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-emerald-300 hidden sm:inline">Badges ({unlockedBadges.length})</span>
          </button>

          {/* Ada AI Mentor Guide Trigger */}
          <button
            onClick={() => setShowWelcomeModal(true)}
            className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-950/90 to-cyan-950/90 backdrop-blur-md border border-cyan-500/40 hover:border-cyan-400 text-xs text-cyan-200 flex items-center gap-1.5 transition shadow-md shadow-cyan-950/30 group active:scale-95"
            title="Consult Ada (AI Cloud Architect Lead) for briefing & game tutorial"
          >
            <img
              src={mentorAdaImg}
              alt="Ada Mentor"
              className="w-5 h-5 rounded-full object-cover ring-1 ring-cyan-400/80 group-hover:scale-110 transition-transform"
            />
            <span className="font-bold text-cyan-300 hidden sm:inline">Ada Guide</span>
          </button>
        </div>
      </header>

      {/* Campaign Level Progress / Navigation Rail */}
      {gameMode === 'CAMPAIGN' && (
        <div className="shrink-0 glass-header px-4 py-1.5 flex items-center justify-between text-xs overflow-x-auto gap-4">
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
                  className={`px-3 py-1 rounded-lg font-bold font-display tracking-wide text-xs transition flex items-center gap-1.5 shrink-0 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                      : isPassed
                      ? 'bg-emerald-950/60 backdrop-blur text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/50'
                      : isUnlocked
                      ? 'glass-subpanel text-slate-300 hover:text-white'
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

            {/* Inspect Targets & Briefing Button */}
            <button
              onClick={() => setLevelBriefingModal({ mode: 'CAMPAIGN', levelIdx: currentLevelIdx })}
              className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold font-display tracking-wide flex items-center gap-1.5 transition shrink-0 ml-1 shadow-sm active:scale-95"
              title="Inspect mission objectives and SLA targets to achieve"
            >
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>Targets &amp; Briefing</span>
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Wave Progress Bar */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Wave Progress:</span>
              <div className="w-32 h-2 bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-100"
                  style={{ width: `${waveProgress}%` }}
                />
              </div>
              <span className="font-mono text-[11px] text-slate-300">{Math.round(waveProgress)}%</span>
            </div>

            {/* Auto-Save & Blueprint Controls */}
            <div className="hidden md:flex items-center gap-1.5 glass-subpanel px-2 py-1 rounded-xl">
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono" title="Architectural layout and progress are automatically saved to your browser localStorage">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Auto-Saved
              </span>
              <div className="w-px h-3 bg-indigo-500/20" />
              <button
                onClick={resetCurrentTopology}
                className="px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
                title="Reset current architecture to initial level blueprint"
              >
                Reset
              </button>
              <button
                onClick={exportArchitectureBlueprint}
                className="px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80 transition flex items-center gap-1"
                title="Export blueprint as JSON file"
              >
                <Download className="w-3 h-3" />
                <span>Export</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80 transition flex items-center gap-1"
                title="Import blueprint from JSON file"
              >
                <Upload className="w-3 h-3" />
                <span>Import</span>
              </button>
              <button
                onClick={handleCopyChallengeLink}
                className="px-2 py-0.5 rounded text-[11px] text-cyan-300 hover:text-cyan-100 hover:bg-cyan-950/60 transition flex items-center gap-1 border border-cyan-500/20"
                title="Copy 1-click shareable challenge link with current architecture"
              >
                {isChallengeLinkCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <LinkIcon className="w-3 h-3 text-cyan-400" />}
                <span>{isChallengeLinkCopied ? 'Copied!' : 'Share Link'}</span>
              </button>
            </div>

            <button
              onClick={() => setShowBeginnerHints(!showBeginnerHints)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition ${
                showBeginnerHints
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'glass-subpanel text-slate-400'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{showBeginnerHints ? 'Hints On' : 'Hints Off'}</span>
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* LIVE P0 OUTAGE & INCIDENT TICKER (SRE COMMAND CENTER)               */}
      {/* =================================================================== */}
      {activeOutageTicker && (
        <div className="shrink-0 bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-y border-rose-500/60 px-4 py-2 flex items-center justify-between text-xs text-white shadow-xl shadow-rose-950/50 z-30 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] tracking-wider uppercase animate-pulse shadow-md shadow-rose-600/50 shrink-0">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>LIVE P0 INCIDENT</span>
            </div>
            <div className="min-w-0 flex items-center gap-2">
              <span className="font-bold text-rose-300 truncate">
                {activeOutageTicker.title}
              </span>
              <span className="text-slate-400 hidden md:inline">•</span>
              <span className="text-slate-300 text-[11px] truncate hidden md:inline">
                {activeOutageTicker.tweetQuote}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-2 py-0.5 rounded-lg bg-black/40 border border-rose-500/30 text-[10px] font-mono">
              <span>P99: <strong className="text-rose-400">{evaluation.p99Latency}ms</strong></span>
              <span>SLA: <strong className={evaluation.uptimePct >= 98 ? 'text-emerald-400' : 'text-rose-400'}>{evaluation.uptimePct}%</strong></span>
            </div>

            {activeOutageTicker.victimId && (
              <button
                onClick={() => handleHotfixChaosNode(activeOutageTicker.victimId)}
                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition active:scale-95 shadow flex items-center gap-1"
                title="Immediately restore and reboot the crashed service"
              >
                <span>🔧 Reboot</span>
              </button>
            )}

            <button
              onClick={handleShareWarStory}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/30 font-bold text-xs transition active:scale-95 flex items-center gap-1"
              title="Copy SRE Outage War Story to clipboard"
            >
              <Share2 className="w-3 h-3" />
              <span className="hidden sm:inline">{isWarStoryCopied ? 'Copied!' : 'War Story'}</span>
            </button>

            <button
              onClick={handleTweetWarStory}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/30 font-bold text-xs transition active:scale-95 flex items-center gap-1"
              title="Post outage war story directly to Twitter / X"
            >
              <span>Post</span>
            </button>

            <button
              onClick={() => setActiveOutageTicker(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. MAIN WORKSPACE: PALETTE + INTERACTIVE GRAPH CANVAS + INSPECTOR    */}
      {/* =================================================================== */}
      <div className="flex-1 flex min-h-0 h-full overflow-hidden relative bg-[#070a13]">
        {/* Ambient Cosmic Diffused Glows for Glass Refraction */}
        <div className="absolute top-0 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[140px] pointer-events-none z-0" />

        {/* Mobile Backdrop for Left Panel */}
        {!leftPanelCollapsed && (
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setLeftPanelCollapsed(true)}
          />
        )}

        {/* LEFT COLUMN: INFRASTRUCTURE COMPONENT PALETTE */}
        <aside
          className={`h-full glass-panel border-r flex flex-col min-h-0 overflow-hidden transition-all duration-300 ease-in-out shrink-0 z-40 max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:w-80 max-lg:max-w-[85vw] max-lg:shadow-2xl ${
            leftPanelCollapsed
              ? 'w-0 p-0 border-r-0 opacity-0 pointer-events-none max-lg:-translate-x-full'
              : 'w-72 xl:w-80 2xl:w-88 p-3 opacity-100 max-lg:translate-x-0'
          }`}
        >
          {/* Category Filter Pills (Pinned Header) */}
          <div className="shrink-0 mb-2">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">Cloud Components</span>
                <span className="text-[10px] text-indigo-400 font-medium hidden xl:inline">• Drag or Click</span>
              </div>
              <button
                onClick={() => setLeftPanelCollapsed(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
                title="Collapse Component Palette"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-1 glass-subpanel p-1 rounded-xl text-[10px] font-bold">
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
                    activeCatalogTab === t.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Component Cards (Scrollable inside panel with Drag & Drop + Direct Deploy + Click to Inspect) */}
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
                  data-component-type={item.type}
                  className={`group relative w-full text-left p-2.5 rounded-xl border transition-all select-none ${
                    isAllowed
                      ? 'glass-card cursor-grab active:cursor-grabbing shadow-sm hover:shadow-indigo-500/20'
                      : 'bg-slate-950/30 border-slate-900/60 opacity-40 cursor-not-allowed'
                  }`}
                >
                  {/* Hover Floating Guide Badge */}
                  {isAllowed && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-2.5 right-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-indigo-400/40 pointer-events-none z-30 flex items-center gap-1">
                      <span>💡 Click details • Deploy button to use</span>
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
                        <div className="flex items-center gap-1.5">
                          {isAllowed && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddService(item.type);
                                if (window.innerWidth < 1024) {
                                  setLeftPanelCollapsed(true);
                                }
                              }}
                              className="px-2 py-0.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] shadow flex items-center gap-0.5 active:scale-95 transition"
                              title="Deploy to canvas"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Deploy</span>
                            </button>
                          )}
                          <span className="text-[9px] text-indigo-400 font-semibold group-hover:text-indigo-300">
                            Details &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Traffic Types Packet Legend (Pinned Footer) */}
          <div className="shrink-0 pt-2.5 mt-2 border-t border-indigo-500/20 space-y-1 text-[11px] text-slate-400">
            <div className="font-semibold text-slate-300 text-xs mb-1 font-display">Traffic Flow Legend</div>
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
          onTouchStart={handleCanvasTouchStart}
          onTouchMove={handleCanvasTouchMove}
          onTouchEnd={handleCanvasTouchEnd}
          onTouchCancel={handleCanvasTouchEnd}
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
          className={`flex-1 min-w-0 h-full relative bg-slate-950 flex flex-col overflow-hidden select-none min-h-0 cyber-grid-overlay transition-all duration-300 ${
            isPanning ? 'cursor-grabbing' : 'cursor-grab'
          } ${
            isRunning
              ? 'shadow-[inset_0_0_120px_rgba(244,63,94,0.18)] ring-1 ring-rose-500/30'
              : 'shadow-[inset_0_0_80px_rgba(99,102,241,0.06)]'
          } ${isScreenShaking ? 'animate-screen-shake' : ''}`}
          style={{
            touchAction: 'none',
            backgroundImage: 'radial-gradient(circle, rgba(99, 102, 241, 0.16) 1.2px, transparent 1.2px)',
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        >
          {/* Disaster / Chaos Red Perimeter Flash Overlay */}
          {isRedAlertActive && (
            <div className="absolute inset-0 z-40 pointer-events-none animate-perimeter-alert border-4 border-rose-500/90 shadow-[inset_0_0_90px_rgba(239,68,68,0.75)]" />
          )}

          {/* Cyber Defense Grid Corner Brackets */}
          <div className="absolute top-2 left-2 pointer-events-none z-10 flex items-center gap-1.5 text-[9px] font-mono text-cyan-500/40 select-none">
            <span className="w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-500/60" />
            <span className="hidden sm:inline">SECTOR 01 // ARCH-GRID ONLINE</span>
          </div>
          <div className="absolute top-2 right-2 pointer-events-none z-10 flex items-center gap-1.5 text-[9px] font-mono text-cyan-500/40 select-none">
            <span className="hidden sm:inline">TELEMETRY MATRIX: ACTIVE</span>
            <span className="w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-500/60" />
          </div>
          <div className="absolute bottom-16 lg:bottom-2 left-2 pointer-events-none z-10 flex items-center gap-1.5 text-[9px] font-mono text-cyan-500/30 select-none">
            <span className="w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-500/50" />
            <span className="hidden sm:inline">GRID SYNC: 60Hz</span>
          </div>
          <div className="absolute bottom-16 lg:bottom-2 right-2 pointer-events-none z-10 flex items-center gap-1.5 text-[9px] font-mono text-cyan-500/30 select-none">
            <span className="hidden sm:inline">CHAOS MONKEY SHIELD: ARMED</span>
            <span className="w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-500/50" />
          </div>

          {/* Surge Alert Ambient Banner (when Peak Wave is active) */}
          {isRunning && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-pulse">
              <div className="px-3.5 py-1 rounded-full bg-rose-950/90 border border-rose-500/60 text-rose-300 text-[11px] font-bold flex items-center gap-2 shadow-2xl backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                <span>⚡ LIVE PEAK WAVE: SIMULATING MAXIMUM SURGE LOAD</span>
              </div>
            </div>
          )}

          {/* Floating Ada Tactical Advisor Widget */}
          <div className="absolute bottom-16 lg:bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
            <div
              onClick={() => {
                setRightPanelCollapsed(false);
                setTimeout(() => {
                  if (mentorSectionRef.current) {
                    mentorSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }, 50);
              }}
              className="group cursor-pointer flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/95 border border-cyan-500/50 hover:border-cyan-400 text-slate-200 shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95"
              title="Click to consult Ada's full diagnosis"
            >
              <div className="relative">
                <img
                  src={mentorAdaImg}
                  alt="Ada Mentor"
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-cyan-400"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-900 ${
                    adaCurrentTip.mood === 'DANGER'
                      ? 'bg-rose-500 animate-ping'
                      : adaCurrentTip.mood === 'WARNING'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-bold text-cyan-300">Ada:</span>
                <span className="text-[11px] text-slate-300 max-w-[200px] sm:max-w-xs md:max-w-sm truncate">
                  {adaCurrentTip.text}
                </span>
                <span className="text-[10px] text-indigo-400 font-semibold group-hover:text-indigo-300 ml-1">
                  Inspect &rarr;
                </span>
              </div>
            </div>
          </div>
          {/* Floating Expand Left Panel Button (When Collapsed) */}
          {leftPanelCollapsed && (
            <button
              onClick={() => setLeftPanelCollapsed(false)}
              className="absolute left-3 top-14 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-indigo-500/50 text-xs font-bold text-indigo-300 hover:text-white hover:bg-slate-800 shadow-2xl transition hover:scale-105 pointer-events-auto"
              title="Expand Component Palette"
            >
              <PanelLeftOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Components</span>
            </button>
          )}

          {/* Floating Expand Right Panel Button (When Collapsed) */}
          {rightPanelCollapsed && (
            <button
              onClick={() => setRightPanelCollapsed(false)}
              className={`absolute right-3 top-14 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border text-xs font-bold transition hover:scale-105 pointer-events-auto shadow-2xl ${
                highlightMentor
                  ? 'border-amber-400 ring-2 ring-amber-400/60 bg-amber-950/80 text-amber-200 animate-pulse'
                  : 'border-indigo-500/50 text-indigo-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Expand Problem & Inspector"
            >
              <span className="hidden sm:inline">Problem &amp; Inspector</span>
              {highlightMentor && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
              <PanelRightOpen className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          )}

          {/* Active Shared Challenge Banner */}
          {activeChallengeBanner && (
            <div className="absolute top-12 left-3 right-3 flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/90 backdrop-blur-md border border-cyan-500/50 shadow-2xl shadow-cyan-950/60 z-30 pointer-events-auto">
              <div className="flex items-center gap-2.5 text-xs text-cyan-200 min-w-0">
                <span className="text-base shrink-0">🏆</span>
                <div className="truncate">
                  <span className="font-bold text-white font-display">Shared Challenge Blueprint</span>
                  <span className="text-cyan-300 ml-2 hidden sm:inline">
                    Created by <span className="font-mono font-semibold text-white">{activeChallengeBanner.author}</span>. Test if this cluster survives!
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsRunning(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/30 active:scale-95 flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-slate-950" />
                  <span>Test System</span>
                </button>
                <button
                  onClick={() => setActiveChallengeBanner(null)}
                  className="p-1 rounded-lg text-cyan-400 hover:text-white hover:bg-cyan-900/40 transition"
                  title="Dismiss challenge banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Top Helper / Connection Banner */}
          <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-30">
            <div className="bg-slate-900/90 backdrop-blur border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs text-slate-300 flex items-center gap-2 pointer-events-auto shadow-lg max-w-full overflow-hidden truncate">
              <Share2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">
                {connectingFromId ? (
                  <span className="text-amber-300 font-bold">
                    Tap/click target node to wire...
                  </span>
                ) : (
                  '1-finger pan • 2-finger zoom • tap node ports to wire'
                )}
              </span>
              {connectingFromId && (
                <button
                  onClick={() => setConnectingFromId(null)}
                  className="ml-2 px-2 py-0.5 rounded bg-slate-800 text-xs text-slate-300 hover:text-white shrink-0"
                >
                  Cancel
                </button>
              )}
            </div>

            {gameMode === 'SANDBOX' && (
              <div className="flex items-center gap-2 pointer-events-auto">
                <div className="bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300 flex items-center gap-2 shadow-lg">
                  <span>Peak Load:</span>
                  <input
                    type="range"
                    min={1000}
                    max={40000}
                    step={1000}
                    value={sandboxRps}
                    onChange={(e) => setSandboxRps(Number(e.target.value))}
                    className="w-24 accent-indigo-500"
                  />
                  <span className="font-mono font-bold text-indigo-400">{sandboxRps.toLocaleString()} RPS</span>
                </div>

                <button
                  onClick={() => setShowPresetsModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95"
                  title="Load iconic real-world architectures (Netflix, Spotify, Uber, Cloudflare)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Iconic Presets</span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-200 px-1.5 py-0.2 rounded-full border border-amber-400/30">
                    4 Architectures
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* FLOATING CANVAS HUD CONTROLS (BOTTOM-RIGHT) */}
          <div className="absolute bottom-16 lg:bottom-3 right-3 flex items-center gap-1 z-30 pointer-events-auto glass-panel p-1 rounded-xl shadow-2xl">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.15).toFixed(2)))}
              className="w-7 h-7 rounded-lg bg-slate-800/60 hover:bg-slate-700/70 text-slate-200 flex items-center justify-center transition"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetView}
              className="px-2 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700/70 text-[11px] font-mono text-slate-200 transition font-medium"
              title="Click to reset zoom to 100%"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.35, +(z - 0.15).toFixed(2)))}
              className="w-7 h-7 rounded-lg bg-slate-800/60 hover:bg-slate-700/70 text-slate-200 flex items-center justify-center transition"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-indigo-500/20 mx-0.5" />
            <button
              onClick={fitView}
              className="w-7 h-7 rounded-lg bg-slate-800/60 hover:bg-slate-700/70 text-slate-200 flex items-center justify-center transition"
              title="Center & Fit Graph in View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetView}
              className="w-7 h-7 rounded-lg bg-slate-800/60 hover:bg-slate-700/70 text-slate-200 flex items-center justify-center transition"
              title="Reset View to Origin (0,0)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-indigo-500/20 mx-0.5" />
            <button
              onClick={resetCurrentTopology}
              className="px-2 py-1 rounded-lg bg-slate-800/60 hover:bg-rose-900/40 text-[11px] text-slate-300 hover:text-rose-300 transition flex items-center gap-1 font-medium"
              title="Reset layout to starting blueprint"
            >
              <RotateCcw className="w-3 h-3 text-rose-400" />
              <span className="hidden sm:inline">Reset Layout</span>
            </button>
            <button
              onClick={exportArchitectureBlueprint}
              className="px-2 py-1 rounded-lg bg-slate-800/60 hover:bg-indigo-900/50 text-[11px] text-slate-300 hover:text-indigo-300 transition flex items-center gap-1 font-medium"
              title="Export architecture blueprint (.json)"
            >
              <Download className="w-3 h-3 text-indigo-400" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 rounded-lg bg-slate-800/60 hover:bg-indigo-900/50 text-[11px] text-slate-300 hover:text-indigo-300 transition flex items-center gap-1 font-medium"
              title="Import architecture blueprint (.json)"
            >
              <Upload className="w-3 h-3 text-indigo-400" />
              <span className="hidden sm:inline">Import</span>
            </button>
            <button
              onClick={handleCopyChallengeLink}
              className="px-2 py-1 rounded-lg bg-slate-800/60 hover:bg-cyan-900/50 text-[11px] text-cyan-300 hover:text-cyan-200 transition flex items-center gap-1 font-medium border border-cyan-500/20"
              title="Copy 1-click shareable challenge link"
            >
              {isChallengeLinkCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <LinkIcon className="w-3 h-3 text-cyan-400" />}
              <span className="hidden sm:inline">{isChallengeLinkCopied ? 'Copied!' : 'Share Link'}</span>
            </button>
          </div>

          {/* FLOATING STATUS PILL (BOTTOM-LEFT) */}
          <div className="absolute bottom-16 lg:bottom-3 left-3 z-30 pointer-events-none flex items-center gap-2">
            <div className="glass-pill px-2.5 py-1 rounded-lg text-[10px] text-slate-300 font-mono flex items-center gap-2 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>({Math.round(pan.x)}, {Math.round(pan.y)})</span>
              <span className="hidden sm:inline text-slate-400">• Pan anywhere</span>
            </div>
            <div className="glass-pill px-2.5 py-1 rounded-lg text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 shadow-lg hidden md:flex" title="Changes auto-saved to browser localStorage">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Auto-Saved</span>
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
                        sound.playDelete();
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
                      data-edge-id={edge.id}
                      data-edge-from={edge.from}
                      data-edge-to={edge.to}
                      transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2 - 8})`}
                      className="cursor-pointer group/label"
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playDelete();
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
                const spec = COMPONENT_CATALOG[node.type] || COMPONENT_CATALOG.WEB;
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
                    data-node-id={node.id}
                    style={{ left: node.x, top: node.y, width: 176, touchAction: 'none' }}
                    onMouseDown={(e) => handleMouseDownNode(node.id, e)}
                    onTouchStart={(e) => handleTouchStartNode(node.id, e)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (connectingFromId && connectingFromId !== node.id && node.type !== 'SOURCE') {
                        handlePortClick(e, node.id, 'in');
                        return;
                      }
                      handleSelectNode(node.id);
                    }}
                    title="Click to inspect and configure this component"
                    className={`no-pan pointer-events-auto absolute z-20 glass-subpanel rounded-xl border ${statusColor} p-2.5 shadow-2xl transition-all cursor-pointer group hover:border-indigo-400/60`}
                  >
                    {/* Hover "Click to Inspect" Floating Badge */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-40 whitespace-nowrap">
                      <div className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold shadow-2xl flex items-center gap-1 border border-indigo-400/50 animate-bounce">
                        <Sliders className="w-2.5 h-2.5 text-indigo-200" />
                        <span>Click to inspect</span>
                      </div>
                    </div>

                    {/* Left Input Port */}
                    {node.type !== 'SOURCE' && (
                      <button
                        data-port-node={node.id}
                        data-port-type="in"
                        onClick={(e) => handlePortClick(e, node.id, 'in')}
                        onTouchEnd={(e) => {
                          e.stopPropagation();
                          handlePortClick(e, node.id, 'in');
                        }}
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
                      data-port-node={node.id}
                      data-port-type="out"
                      onClick={(e) => handlePortClick(e, node.id, 'out')}
                      onTouchEnd={(e) => {
                        e.stopPropagation();
                        handlePortClick(e, node.id, 'out');
                      }}
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

                        {/* Subtle Hover Hint inside Node */}
                        <div className="hidden group-hover:flex items-center justify-center gap-1 pt-1 border-t border-indigo-500/20 text-[9px] text-indigo-300 font-semibold transition-all">
                          <Sliders className="w-2.5 h-2.5" />
                          <span>Click to inspect &amp; tune</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Interactive Chaos Monkey Hover Sprite on Victim Node */}
              {chaosEncounter && (
                <div
                  style={{
                    left: chaosEncounter.x + 88,
                    top: chaosEncounter.y - 82,
                    touchAction: 'none'
                  }}
                  className="absolute pointer-events-auto z-40 -translate-x-1/2 transition-all duration-300 animate-in fade-in zoom-in-75"
                >
                  <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-900/95 border-2 border-rose-500 shadow-2xl shadow-rose-950/90 backdrop-blur-md">
                    <div className="relative shrink-0">
                      <img
                        src={chaosMonkeyImg}
                        alt="Chaos Monkey"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-400 animate-bounce"
                      />
                      <span className="absolute -bottom-1 -right-1 text-xs select-none">
                        {chaosEncounter.toolIcon || '✂️'}
                      </span>
                    </div>

                    <div className="space-y-0.5 pr-1">
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-400">
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span>Chaos Sabotage!</span>
                      </div>
                      <div className="text-[11px] font-bold text-white max-w-[210px] leading-tight">
                        &ldquo;{chaosEncounter.dialogue}&rdquo;
                      </div>
                      <div className="pt-1 flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHotfixChaosNode(chaosEncounter.nodeId);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] shadow active:scale-95 transition flex items-center gap-1"
                          title="Instantly reboot the damaged node and banish Chaos Monkey"
                        >
                          <span>🔧 Hotfix &amp; Banish</span>
                          <span className="text-[9px] text-emerald-950 font-extrabold bg-emerald-300 px-1 rounded-full">+150 XP</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Win / Loss Modal with Character Assets & Star Rating */}
          {postMortemModal && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-40 overflow-hidden">
              {/* 3-Star Golden Confetti Celebration Burst */}
              {postMortemModal.won && postMortemModal.stars === 3 && <ConfettiOverlay />}
              <div className="max-w-md w-full bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden z-10">
                {/* Glow backdrop */}
                <div
                  className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
                    postMortemModal.won ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                  }`}
                />

                {/* Character Hero Artwork */}
                <div className="relative mb-3 flex justify-center">
                  <div className="relative">
                    <img
                      src={postMortemModal.won ? mentorAdaImg : chaosMonkeyImg}
                      alt={postMortemModal.won ? 'Ada Mentor' : 'Chaos Monkey'}
                      className={`w-20 h-20 rounded-2xl object-cover shadow-2xl ring-4 ${
                        postMortemModal.won
                          ? 'ring-emerald-400 shadow-emerald-500/30'
                          : 'ring-rose-500 shadow-rose-500/30'
                      }`}
                    />
                    <span className="absolute -bottom-2 -right-2 text-xl">
                      {postMortemModal.won ? '🏆' : '👾'}
                    </span>
                  </div>
                </div>

                {/* Star Rating on Victory */}
                {postMortemModal.won && (
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-6 h-6 transition-all ${
                          starIdx <= (postMortemModal.stars || 3)
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-bounce'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                )}

                <h2 className="text-xl font-black text-white">
                  {postMortemModal.won ? 'Mission Complete: SLA Sustained!' : 'Incident Alert: SLA Target Breached'}
                </h2>

                {/* Character Speech Quote */}
                <div
                  className={`mt-2 p-2.5 rounded-xl border text-[11px] leading-relaxed italic ${
                    postMortemModal.won
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                  }`}
                >
                  {postMortemModal.won ? (
                    <p>&ldquo;Spectacular architecture, Architect! Your system gracefully absorbed peak traffic wave within latency and uptime targets.&rdquo; &mdash; <strong>Ada</strong></p>
                  ) : (
                    <p>&ldquo;Hehe! Volumetric overload crashed the servers! Don&apos;t worry, real SREs learn from outages&mdash;check Ada&apos;s diagnostics &amp; optimize!&rdquo; &mdash; <strong>Chaos Monkey</strong></p>
                  )}
                </div>

                {/* Telemetry Summary Card */}
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
                  {userDailyStanding?.userEntry && (
                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-700/60">
                      <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Global Benchmark:</span>
                      </span>
                      <span className="font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full text-[11px]">
                        Rank #{userDailyStanding.rank} (Top {userDailyStanding.percentile}%)
                      </span>
                    </div>
                  )}
                </div>

                {/* Viral Shareable Architect Scorecard (Wordle Style) */}
                <div className="mt-3.5 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 shadow-lg text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider font-display">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Architect Scorecard</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Ready to Share
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">
                    Brag about your SLA stats, latency, and system stack with your engineering friends or community:
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleCopyScorecard}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition active:scale-95 shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5"
                      title="Copy formatted scorecard with stats and challenge link to clipboard"
                    >
                      {isScorecardCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isScorecardCopied ? 'Copied!' : 'Scorecard'}</span>
                    </button>
                    <button
                      onClick={handleCopyChallengeLink}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950/50"
                      title="Copy 1-click playable challenge link so anyone can test your exact architecture"
                    >
                      {isChallengeLinkCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />}
                      <span>{isChallengeLinkCopied ? 'Link Copied!' : 'Challenge Link'}</span>
                    </button>
                    <button
                      onClick={handleShareTweet}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/40 font-bold text-xs transition active:scale-95 flex items-center gap-1.5"
                      title="Share directly to Twitter / X"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2.5 flex-wrap">
                  <button
                    onClick={resetWave}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs active:scale-95 transition"
                  >
                    🔄 Replay Wave
                  </button>
                  <button
                    onClick={() => setShowLeaderboardModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs active:scale-95 transition flex items-center gap-1.5"
                    title="View Daily Incident & Survival Leaderboards"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Leaderboard</span>
                  </button>
                  {postMortemModal.won && gameMode === 'CAMPAIGN' && currentLevelIdx < CAMPAIGN_LEVELS.length - 1 && (
                    <button
                      onClick={() => {
                        setPostMortemModal(null);
                        setLevelBriefingModal({ mode: 'CAMPAIGN', levelIdx: currentLevelIdx + 1 });
                      }}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition flex items-center gap-1.5"
                    >
                      <span>Next Mission Briefing</span>
                      <span>➡️</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Mobile Backdrop for Right Panel */}
        {!rightPanelCollapsed && (
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setRightPanelCollapsed(true)}
          />
        )}

        {/* RIGHT COLUMN: PROBLEM STATEMENT, INSPECTOR & LIVE MENTOR */}
        <aside
          className={`h-full glass-panel border-l flex flex-col overflow-y-auto min-h-0 transition-all duration-300 ease-in-out shrink-0 z-40 max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:w-88 max-lg:max-w-[90vw] max-lg:shadow-2xl ${
            rightPanelCollapsed
              ? 'w-0 p-0 border-l-0 opacity-0 pointer-events-none max-lg:translate-x-full'
              : 'w-80 xl:w-96 2xl:w-[420px] p-3.5 space-y-4 opacity-100 max-lg:translate-x-0'
          }`}
        >
          {/* Panel Header & Collapse Action */}
          <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
                Problem &amp; Diagnostics
              </span>
              {highlightMentor && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  Mentor Alert
                </span>
              )}
            </div>
            <button
              onClick={() => setRightPanelCollapsed(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              title="Collapse Panel (Make Canvas Bigger)"
            >
              <PanelRightClose className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* =============================================================== */}
          {/* 1. SCENARIO PROBLEM STATEMENT (TOP OF RIGHT PANEL)              */}
          {/* =============================================================== */}
          {gameMode === 'CAMPAIGN' || gameMode === 'DAILY' ? (
            <div className="glass-subpanel rounded-2xl p-4 space-y-3 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between">
                {gameMode === 'DAILY' ? (
                  <>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-purple-400" />
                      <span>Daily Incident #{dailyIncident.dayNumber}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-amber-400 font-bold">
                        🔥 Streak: {dailyStreak}d
                      </span>
                      {isDailyCompletedToday && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-lg">
                          ✅ Solved
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>Problem Statement</span>
                    </span>
                    <span className="text-[11px] font-mono text-indigo-400 font-bold">
                      {currentLevel.title.split(':')[0]}
                    </span>
                  </>
                )}
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
              <p className="text-xs text-slate-300 leading-relaxed glass-card p-3 rounded-xl">
                {currentLevel.brief}
              </p>

              {/* CURRENT STATUS vs. TARGET TO PASS LEVEL */}
              <div className="glass-card rounded-2xl p-3.5 space-y-3 shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-200">
                      System Status vs. Target to Pass
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                      isLevelPassing
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {isLevelPassing ? '✅ Ready to Pass' : '❌ Targets Breached'}
                  </span>
                </div>

                {/* Side-by-Side Comparison Rows */}
                <div className="space-y-2 text-xs">
                  {/* Metric 1: Traffic Load */}
                  <div className="glass-subpanel p-2.5 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">1. Peak Traffic Load</div>
                      <div className="font-mono text-xs font-bold mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-400">Current:</span>
                        <span className="text-amber-300">{currentLiveRps.toLocaleString()} RPS</span>
                        <span className="text-slate-600">→</span>
                        <span className="text-slate-400">Target:</span>
                        <span className="text-cyan-300 font-extrabold">{currentLevel.targetRps.toLocaleString()} RPS</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700/60">
                        {isRunning ? `Surge ${Math.round(waveProgress)}%` : 'Baseline'}
                      </span>
                    </div>
                  </div>

                  {/* Metric 2: P99 Latency SLA */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors backdrop-blur-md ${
                      passedLatency
                        ? 'bg-slate-950/60 border-emerald-500/30'
                        : 'bg-rose-950/30 border-rose-500/40'
                    }`}
                  >
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">2. P99 Latency SLA</div>
                      <div className="font-mono text-xs font-bold mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-400">Current:</span>
                        <span className={passedLatency ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {evaluation.p99Latency}ms
                        </span>
                        <span className="text-slate-600">→</span>
                        <span className="text-slate-400">Target:</span>
                        <span className="text-cyan-300">&lt; {currentLevel.maxLatencyMs}ms</span>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                          passedLatency
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {passedLatency ? '✅ Passing' : '❌ Breached'}
                      </span>
                    </div>
                  </div>

                  {/* Metric 3: Uptime SLA */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors backdrop-blur-md ${
                      passedUptime
                        ? 'bg-slate-950/60 border-emerald-500/30'
                        : 'bg-rose-950/30 border-rose-500/40'
                    }`}
                  >
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">3. Uptime SLA</div>
                      <div className="font-mono text-xs font-bold mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-400">Current:</span>
                        <span className={passedUptime ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {evaluation.uptimePct}%
                        </span>
                        <span className="text-slate-600">→</span>
                        <span className="text-slate-400">Target:</span>
                        <span className="text-purple-300">&ge; {currentLevel.minUptimePct}%</span>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                          passedUptime
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {passedUptime ? '✅ Passing' : '❌ Dropping'}
                      </span>
                    </div>
                  </div>

                  {/* Metric 4: Cloud Budget */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors backdrop-blur-md ${
                      passedBudget
                        ? 'bg-slate-950/60 border-emerald-500/30'
                        : 'bg-rose-950/30 border-rose-500/40'
                    }`}
                  >
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">4. Cloud Budget</div>
                      <div className="font-mono text-xs font-bold mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-400">Current:</span>
                        <span className={passedBudget ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          ${evaluation.totalHourlyCost}/hr
                        </span>
                        <span className="text-slate-600">→</span>
                        <span className="text-slate-400">Target:</span>
                        <span className="text-emerald-300">&le; ${currentLevel.maxBudgetHr}/hr</span>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                          passedBudget
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {passedBudget ? '✅ Within Budget' : '❌ Over Budget'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instruction / Action Banner to Pass Level */}
                <div
                  className={`p-2.5 rounded-xl border text-[11px] flex items-center justify-between gap-2 backdrop-blur-md ${
                    isLevelPassing
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{isLevelPassing ? '🎉' : '⚠️'}</span>
                    <span>
                      {isLevelPassing
                        ? 'All SLA targets currently met! Run the Peak Wave to pass this scenario.'
                        : 'Resolve the bottleneck above to bring latency & uptime within targets.'}
                    </span>
                  </div>
                  {!isRunning && (
                    <button
                      onClick={() => setIsRunning(true)}
                      className={`px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider shrink-0 transition shadow ${
                        isLevelPassing
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {isLevelPassing ? 'Simulate Wave ▶' : 'Test Wave ▶'}
                    </button>
                  )}
                </div>
              </div>

              {/* Real-Life Everyday Analogy */}
              {currentLevel.beginnerAnalogy && (
                <div className="p-3 rounded-xl bg-amber-950/25 border border-amber-500/30 text-xs text-amber-200 leading-relaxed space-y-1 backdrop-blur-md">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <span>💡 Everyday Analogy</span>
                  </div>
                  <div>{currentLevel.beginnerAnalogy}</div>
                </div>
              )}

              {/* Architecture Hints & Solution Clues */}
              {currentLevel.hints && currentLevel.hints.length > 0 && (
                <div className="p-3 rounded-xl glass-card space-y-1.5">
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
            <div className="glass-subpanel border-amber-500/40 rounded-2xl p-4 space-y-2.5 shadow-xl shadow-amber-950/20">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Survival Mission</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">
                    Best: <span className="text-amber-400 font-bold">Wave {bestSurvivalWave}</span>
                  </span>
                  <span className="text-[11px] font-mono text-amber-300 font-extrabold bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-lg">
                    Wave {survivalWave}
                  </span>
                </div>
              </div>
              <h3 className="text-sm font-extrabold text-white">
                Infinite Escalating Traffic Surge
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed glass-card p-2.5 rounded-xl">
                Survive as many waves as possible! Traffic surges by +2,500 RPS every wave with malicious bot swarms and random Chaos Monkey server outages. Maintain &ge;98% availability to advance!
              </p>
              {/* Live Status vs Survival Target */}
              <div className="space-y-2 text-xs glass-card p-2.5 rounded-xl">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider pb-1 border-b border-indigo-500/20">
                  <span>System Status vs Target</span>
                  <span className={passedUptime && passedLatency ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {passedUptime && passedLatency ? '✅ Passing' : '❌ Failing'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Wave Load:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {currentLiveRps.toLocaleString()} / {(3000 + survivalWave * 2500).toLocaleString()} RPS
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">P99 Latency:</span>
                  <span className="font-mono font-bold flex items-center gap-1.5">
                    <span className={passedLatency ? 'text-emerald-400' : 'text-rose-400'}>{evaluation.p99Latency}ms</span>
                    <span className="text-slate-500 font-normal">(&le; 250ms)</span>
                    <span>{passedLatency ? '✓' : '✗'}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Uptime SLA:</span>
                  <span className="font-mono font-bold flex items-center gap-1.5">
                    <span className={passedUptime ? 'text-emerald-400' : 'text-rose-400'}>{evaluation.uptimePct}%</span>
                    <span className="text-slate-500 font-normal">(&ge; 98%)</span>
                    <span>{passedUptime ? '✓' : '✗'}</span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-subpanel border-emerald-500/40 rounded-2xl p-4 space-y-2.5 shadow-xl shadow-emerald-950/20">
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
              <p className="text-xs text-slate-300 leading-relaxed glass-card p-2.5 rounded-xl">
                Zero budget caps and zero constraints. Drag and deploy any cloud component, dial the peak load slider up to 35,000+ RPS, and stress-test custom topologies.
              </p>
            </div>
          )}

          {/* =============================================================== */}
          {/* 2. SELECTED COMPONENT INSPECTOR & TUNING                         */}
          {/* =============================================================== */}
          <div
            ref={inspectorSectionRef}
            className={`glass-subpanel rounded-2xl p-3.5 space-y-3 transition-all duration-500 ${
              highlightInspector
                ? 'border-indigo-400 ring-2 ring-indigo-400/50 bg-indigo-950/40 shadow-2xl scale-[1.01]'
                : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 font-display">
                <Settings className={`w-3.5 h-3.5 ${highlightInspector ? 'animate-spin text-indigo-300' : ''}`} />
                <span>Component Inspector</span>
              </span>
              <div className="flex items-center gap-2">
                {highlightInspector && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500 text-white animate-pulse">
                    Inspecting
                  </span>
                )}
                {selectedNode && selectedNode.type !== 'SOURCE' && (
                  <button
                    onClick={() => deleteNode(selectedNode.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
              </div>
            </div>

            {selectedNode && selectedSpec && selectedMetrics ? (
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-bold text-white">{selectedSpec.name}</div>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedSpec.description}</p>
                </div>

                {/* Telemetry Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="glass-card p-2 rounded-lg">
                    <div className="text-[10px] text-slate-400">Total Ingress</div>
                    <div className="font-mono font-bold text-white mt-0.5">
                      {Math.round(selectedMetrics.totalIn).toLocaleString()} RPS
                    </div>
                  </div>
                  <div className="glass-card p-2 rounded-lg">
                    <div className="text-[10px] text-slate-400">Latency</div>
                    <div className="font-mono font-bold text-cyan-300 mt-0.5">
                      {selectedMetrics.effectiveLatency}ms
                    </div>
                  </div>
                  <div className="glass-card p-2 rounded-lg">
                    <div className="text-[10px] text-slate-400">Saturation</div>
                    <div className="font-mono font-bold text-amber-300 mt-0.5">
                      {Math.round(selectedMetrics.utilization * 100)}%
                    </div>
                  </div>
                  <div className="glass-card p-2 rounded-lg">
                    <div className="text-[10px] text-slate-400">Hourly Cost</div>
                    <div className="font-mono font-bold text-emerald-400 mt-0.5">
                      ${selectedMetrics.cost}/hr
                    </div>
                  </div>
                </div>

                {/* Architectural Configuration Dropdowns */}
                {selectedSpec.configOptions && (
                  <div className="space-y-2 pt-2 border-t border-indigo-500/20">
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
                              sound.playUpgrade();
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === selectedNode.id
                                    ? { ...n, config: { ...(n.config || {}), [configKey]: val } }
                                    : n
                                )
                              );
                            }}
                            className="w-full glass-subpanel rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
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
                  <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-200 leading-relaxed backdrop-blur-md">
                    <strong>💡 Simple Analogy:</strong> {selectedSpec.beginnerTip}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-4 text-center">
                Click any component node on the canvas to inspect its live load and tune configurations.
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* 3. LIVE ROOT-CAUSE ARCHITECTURE MENTOR & DIAGNOSTICS             */}
          {/* =============================================================== */}
          <div
            ref={mentorSectionRef}
            className={`glass-subpanel rounded-2xl p-3.5 space-y-3 transition-all duration-500 ${
              highlightMentor
                ? 'border-amber-400 ring-2 ring-amber-400/50 bg-amber-950/20 shadow-2xl scale-[1.01]'
                : 'border-cyan-500/30 shadow-xl'
            }`}
          >
            {/* Mentor Character Header */}
            <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={mentorAdaImg}
                    alt="Ada SRE Mentor"
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-cyan-400/80 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white">Ada</span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      Chief Architect AI
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                    <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                    <span>Live Architecture Comms</span>
                  </div>
                </div>
              </div>
              {highlightMentor && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 animate-pulse shrink-0">
                  Live Alert
                </span>
              )}
            </div>

            {/* Ada's Reactive Speech Bubble */}
            <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed backdrop-blur-md">
              <p className="text-[11px] font-medium italic">
                &ldquo;{adaCurrentTip.text}&rdquo;
              </p>
            </div>

            {/* Diagnostics List */}
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-0.5">
                Telemetry Diagnostics:
              </div>
              {evaluation.diagnostics.map((diag, i) => {
                const isCrit = diag.includes('CRITICAL') || diag.includes('ALERT') || diag.includes('OUTAGE');
                const isWarn = diag.includes('BOTTLENECK') || diag.includes('HIGH') || diag.includes('BUDGET');
                return (
                  <div
                    key={i}
                    className={`p-2 rounded-lg border text-[11px] leading-relaxed flex items-start gap-2 backdrop-blur-md ${
                      isCrit
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                        : isWarn
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                        : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    }`}
                  >
                    <span className="mt-0.5 shrink-0">{isCrit ? '⚠️' : isWarn ? '⚡' : '✅'}</span>
                    <span>{diag}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* =================================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR (< lg screens)                         */}
      {/* =================================================================== */}
      <nav className="lg:hidden shrink-0 glass-header border-t px-3 py-2 flex items-center justify-around z-30 shadow-2xl safe-bottom">
        <button
          type="button"
          onClick={() => {
            setRightPanelCollapsed(true);
            setLeftPanelCollapsed(!leftPanelCollapsed);
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-xl transition ${
            !leftPanelCollapsed ? 'text-indigo-400 bg-indigo-500/15' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Components</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setLeftPanelCollapsed(true);
            setRightPanelCollapsed(true);
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-xl transition ${
            leftPanelCollapsed && rightPanelCollapsed ? 'text-indigo-400 bg-indigo-500/15' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Move className="w-4 h-4" />
          <span>Canvas</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const next = !isRunning;
            setIsRunning(next);
            if (next) {
              sound.playSimStart();
              sound.startAmbientDrone();
            } else {
              sound.playSimPause();
              sound.stopAmbientDrone();
            }
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-xl transition ${
            isRunning ? 'text-amber-300 bg-amber-500/20' : 'text-emerald-400 bg-emerald-500/15'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? 'Pause' : 'Simulate'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playSelect();
            setLevelBriefingModal({ mode: gameMode, levelIdx: currentLevelIdx });
          }}
          className="flex flex-col items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-xl transition text-slate-400 hover:text-white"
        >
          <Target className="w-4 h-4" />
          <span>Targets</span>
        </button>
      </nav>

      {/* =================================================================== */}
      {/* 4. WELCOME & ORIENTATION MODAL (EXPLAINS REWARDS & 3 GAME MODES)   */}
      {/* =================================================================== */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-[#070a13] flex items-center justify-center p-4 z-50 overflow-y-auto overflow-x-hidden">
          {/* Subtle Ambient Arena Lighting (Solid backdrop, zero pass-through to game) */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/25 via-slate-950 to-red-950/25 pointer-events-none" />

          {/* ================================================================= */}
          {/* BIG BACKGROUND HERO (LEFT) & DEVIL (RIGHT)                        */}
          {/* ================================================================= */}
          {/* BIG HERO IN BACKGROUND (LEFT) */}
          <div className="fixed -left-8 sm:-left-4 lg:left-0 2xl:left-6 top-1/2 -translate-y-1/2 z-20 pointer-events-none select-none flex flex-col items-start">
            <div className="relative">
              <div className="absolute -inset-14 bg-cyan-500/30 rounded-full blur-3xl animate-pulse pointer-events-none" />
              <img
                src={heroImg}
                alt="System Saviour Hero"
                className="w-72 sm:w-88 md:w-[440px] lg:w-[500px] xl:w-[580px] 2xl:w-[680px] max-h-[94vh] object-contain animate-hero-zoom drop-shadow-[0_0_60px_rgba(56,189,248,0.8)]"
              />
            </div>
          </div>

          {/* ARCHITECT HERO NAME BADGE - MOVED FAR LEFT */}
          <div className="fixed left-3 sm:left-6 md:left-8 xl:left-12 bottom-5 sm:bottom-7 z-40 pointer-events-auto select-none flex flex-col items-start">
            <div className="px-3 sm:px-4 py-1.5 rounded-full bg-slate-950/90 border border-cyan-400 text-cyan-300 font-black text-xs sm:text-sm uppercase tracking-wider backdrop-blur-md shadow-[0_0_30px_rgba(34,211,238,0.5)] flex items-center gap-2 ring-2 ring-cyan-500/50 whitespace-nowrap">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Architect Hero</span>
            </div>
            <span className="text-[10px] sm:text-xs font-mono text-cyan-300/90 mt-1 font-bold pl-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap">
              High Availability Guardian
            </span>
          </div>

          {/* BIG DEVIL IN BACKGROUND (RIGHT) */}
          <div className="fixed -right-8 sm:-right-4 lg:right-0 2xl:right-6 top-1/2 -translate-y-1/2 z-20 pointer-events-none select-none flex flex-col items-end">
            <div className="relative">
              <div className="absolute -inset-14 bg-red-500/30 rounded-full blur-3xl animate-pulse pointer-events-none" />
              <img
                src={devilImg}
                alt="Chaos Outage Devil"
                className="w-72 sm:w-88 md:w-[440px] lg:w-[500px] xl:w-[580px] 2xl:w-[680px] max-h-[94vh] object-contain animate-devil-zoom drop-shadow-[0_0_60px_rgba(239,68,68,0.8)]"
              />
            </div>
          </div>

          {/* CHAOS DEVIL NAME BADGE - MOVED FAR RIGHT */}
          <div className="fixed right-3 sm:right-6 md:right-8 xl:right-12 bottom-5 sm:bottom-7 z-40 pointer-events-auto select-none flex flex-col items-end">
            <div className="px-3 sm:px-4 py-1.5 rounded-full bg-slate-950/90 border border-red-500 text-red-300 font-black text-xs sm:text-sm uppercase tracking-wider backdrop-blur-md shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center gap-2 ring-2 ring-red-500/50 whitespace-nowrap">
              <Flame className="w-4 h-4 text-red-400" />
              <span>Chaos Devil</span>
            </div>
            <span className="text-[10px] sm:text-xs font-mono text-red-300/90 mt-1 font-bold pr-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap">
              Outages &amp; Chaos Demon
            </span>
          </div>

          {/* Transparent Glass Info Pane (Entire Content Scrollable) */}
          <div className="relative max-w-3xl xl:max-w-4xl w-full bg-slate-950/40 border border-indigo-400/35 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(0,0,0,0.6)] my-auto text-slate-100 max-h-[90vh] overflow-y-auto z-30 backdrop-blur-md space-y-4">
            {/* Sticky Floating Close Button */}
            <div className="sticky top-0 z-50 flex justify-end -mt-1 -mr-1 pointer-events-none">
              <button
                onClick={() => {
                  introAudioTour.stop();
                  setShowWelcomeModal(false);
                }}
                className="pointer-events-auto p-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white transition shadow-xl backdrop-blur-md active:scale-95"
                title="Close Guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. TOP BAR: AUDIO GUIDE MODE & SAVIOUR WARRIOR MUSIC CONTROLS */}
            <div className="rounded-2xl bg-slate-950/50 backdrop-blur-sm border border-indigo-500/30 p-2.5 sm:p-3 shadow-xl flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                    audioTourState.isPlaying 
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-400' 
                      : 'bg-slate-900/40 border-slate-700/60 text-slate-400'
                  }`}>
                    <Headphones className="w-4 h-4" />
                  </div>
                  {audioTourState.isPlaying && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Mic className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Audio Guide Mode:</span>
                    </span>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 truncate max-w-[220px]">
                      {audioTourState.isPlaying 
                        ? INTRO_TOUR_STEPS[audioTourState.currentStepIdx]?.badge
                        : 'Interactive Voice Tour Ready'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate max-w-sm sm:max-w-md">
                    {audioTourState.isPlaying
                      ? INTRO_TOUR_STEPS[audioTourState.currentStepIdx]?.shortDesc
                      : 'Listen to Ada explain every component, text, and level walkthrough.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Play/Pause, Prev, Next, Saviour Music Toggle */}
              <div className="flex items-center gap-2 flex-wrap ml-auto">
                {/* Play / Pause Voice Tour Button */}
                <button
                  onClick={() => {
                    sound.playClick();
                    if (audioTourState.isPlaying) {
                      introAudioTour.pause();
                    } else {
                      introAudioTour.start(audioTourState.currentStepIdx);
                      setIsSaviourMusicPlaying(true);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-lg ${
                    audioTourState.isPlaying
                      ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300 hover:bg-rose-500/30'
                      : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black shadow-cyan-500/25 ring-1 ring-cyan-300'
                  }`}
                >
                  {audioTourState.isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Voice Tour</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-slate-950" />
                      <span>Explain Screen (Voice)</span>
                    </>
                  )}
                </button>

                {/* Tour navigation buttons (Prev / Next) */}
                <div className="flex items-center gap-1 bg-slate-900/40 border border-slate-700/60 rounded-xl p-0.5 backdrop-blur-sm">
                  <button
                    onClick={() => {
                      sound.playClick();
                      introAudioTour.prev();
                    }}
                    disabled={audioTourState.currentStepIdx === 0}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition"
                    title="Previous Tour Step"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-slate-400 px-1">
                    {audioTourState.currentStepIdx + 1}/{INTRO_TOUR_STEPS.length}
                  </span>
                  <button
                    onClick={() => {
                      sound.playClick();
                      introAudioTour.next();
                    }}
                    disabled={audioTourState.currentStepIdx >= INTRO_TOUR_STEPS.length - 1}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition"
                    title="Next Tour Step"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Real-time Spectrum Visualizer */}
                <AudioVisualizerWidget
                  soundEngine={sound}
                  isMuted={isSoundMuted}
                  isPlaying={isAudioActive}
                  className="bg-amber-950/30 border-amber-500/30"
                />

                {/* Warrior Battle Soundtrack Toggle */}
                <button
                  onClick={() => {
                    sound.playClick();
                    sound.ensureContext();
                    const nextPlaying = sound.toggleSaviourTheme();
                    setIsSaviourMusicPlaying(nextPlaying);
                    setIsAudioActive(sound.isMusicActive());
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition backdrop-blur-sm ${
                    isAudioActive
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Toggle Epic Warrior Battle Theme (High 75% volume, audibly ducked to 30% while Ada narrates)"
                >
                  <Music className={`w-3.5 h-3.5 ${isAudioActive ? 'animate-bounce text-amber-400' : ''}`} />
                  <span>Warrior Theme: {isAudioActive ? 'ON (75%)' : 'OFF'}</span>
                </button>
              </div>
            </div>

            {/* Immediate Sound Activation Prompt (Transparent Glass) */}
            {!isAudioActive && (
              <div
                onClick={() => {
                  sound.unlockAudio();
                  setIsAudioActive(true);
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-amber-950/25 backdrop-blur-sm border border-amber-400/60 shadow-lg shadow-amber-950/30 flex items-center justify-between gap-3 cursor-pointer hover:border-amber-300 transition-all group animate-pulse"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                    <Music className="w-4 h-4 animate-bounce" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-amber-200 flex items-center gap-1.5">
                      <span>WARRIOR BATTLE SOUNDTRACK READY</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/30 text-red-200 border border-red-500/40">75% Volume</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Tap or click anywhere on the screen to unleash the background soundtrack!
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.unlockAudio();
                    setIsAudioActive(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 group-hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition active:scale-95 shrink-0 flex items-center gap-1"
                >
                  <span>Start Music</span>
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 2. MODAL HEADER WITH ADA MENTOR BRIEFING */}
            <div
              id="intro-header-card"
              className={`flex items-start sm:items-center gap-4 p-4 rounded-2xl bg-indigo-950/25 backdrop-blur-sm border shadow-lg transition-all duration-300 ${
                audioTourState.isPlaying && audioTourState.currentStepIdx === 0
                  ? 'border-cyan-400 ring-2 ring-cyan-400/80 shadow-cyan-500/30'
                  : 'border-cyan-500/30'
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={mentorAdaImg}
                  alt="Ada Chief Systems Architect"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-cyan-400 shadow-xl shadow-cyan-950/50"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-2xl font-black text-white tracking-wide font-display">
                    Welcome to System Saviour
                  </h2>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Mission Briefing
                  </span>
                  {audioTourState.isPlaying && audioTourState.currentStepIdx === 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-bold flex items-center gap-1 animate-pulse">
                      <Volume2 className="w-3 h-3" />
                      Ada Speaking
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-cyan-100 mt-1 leading-snug">
                  &ldquo;Greetings, Architect! I&apos;m <strong>Ada</strong>, your Principal SRE Lead. Welcome to our distributed systems simulator. Ready to design battle-hardened architectures?&rdquo;
                </p>
              </div>
            </div>

            {/* Modal Body (Scrolls together seamlessly) */}
            <div className="space-y-6 text-xs sm:text-sm">
              {/* Gameplay Preview Video Section (First Level Demo - Transparent Glass) */}
              <div
                id="intro-video-card"
                className={`rounded-2xl bg-slate-950/25 backdrop-blur-sm border p-3 sm:p-4 shadow-xl space-y-3 transition-all duration-300 ${
                  audioTourState.isPlaying && audioTourState.currentStepIdx === 1
                    ? 'border-cyan-400 ring-2 ring-cyan-400/80 shadow-cyan-500/30'
                    : 'border-indigo-500/30'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1.5">
                      <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                      <span>Level 1 Gameplay Walkthrough (The Garage Startup)</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {audioTourState.isPlaying && audioTourState.currentStepIdx === 1 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-bold flex items-center gap-1 animate-pulse">
                        <Volume2 className="w-3 h-3" />
                        Ada Explaining Video
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                      HD Gameplay Preview
                    </span>
                  </div>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-slate-950/60 border border-slate-800/80 shadow-2xl group aspect-video max-h-[300px]">
                  <video
                    src={gameplayDemoVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-cyan-300 font-mono border border-cyan-500/30 flex items-center gap-1.5 pointer-events-none shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Watch: Insert Redis Cache ➔ Rewire ➔ 800 RPS SLA Victory!</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  🎬 <strong>How to Play Level 1:</strong> Your viral social app receives 800 RPS of heavy read queries that choke default SQL storage. Insert a Redis Cache between the Web Server and Database to absorb 75% of reads and maintain sub-120ms P99 latency!
                </p>
              </div>

              {/* What You Will Get Section */}
              <div
                id="intro-learning-grid"
                className={`transition-all duration-300 p-2.5 rounded-2xl ${
                  audioTourState.isPlaying && audioTourState.currentStepIdx === 2
                    ? 'ring-2 ring-cyan-400/80 bg-cyan-950/20 shadow-cyan-500/20'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>What You Will Gain By Playing</span>
                  </h3>
                  {audioTourState.isPlaying && audioTourState.currentStepIdx === 2 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-bold flex items-center gap-1 animate-pulse">
                      <Volume2 className="w-3 h-3" />
                      Ada Explaining Skills
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950/30 backdrop-blur-sm border border-slate-700/40 space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>🧠 Real-World Architecture Mastery</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Bridge the gap between reading interview books and feeling how distributed systems actually scale under live traffic. Learn why Netflix needs CDNs and Twitter needs in-memory caches.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/30 backdrop-blur-sm border border-slate-700/40 space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>⏱️ SLA Latency &amp; Bottleneck Diagnosis</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Diagnose exponential queuing latencies, server CPU saturation, database disk I/O bottlenecks, and single points of failure (SPOFs) before they cause outages.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/30 backdrop-blur-sm border border-slate-700/40 space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>💰 Cloud Cost vs Performance Tradeoffs</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Experience the real tension of cloud budgeting! Satisfy sub-100ms latency SLAs while keeping AWS/GCP hourly compute bills within strict budget limits.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/30 backdrop-blur-sm border border-slate-700/40 space-y-1">
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
              <div
                id="intro-modes-grid"
                className={`transition-all duration-300 p-2.5 rounded-2xl ${
                  audioTourState.isPlaying && audioTourState.currentStepIdx === 3
                    ? 'ring-2 ring-cyan-400/80 bg-purple-950/20 shadow-purple-500/20'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>4 Game Modes Available</span>
                  </h3>
                  {audioTourState.isPlaying && audioTourState.currentStepIdx === 3 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-bold flex items-center gap-1 animate-pulse">
                      <Volume2 className="w-3 h-3" />
                      Ada Explaining Modes
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Campaign */}
                  <div className="p-4 rounded-2xl bg-slate-950/30 backdrop-blur-sm border border-indigo-500/30 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-indigo-300">🎓 1. Campaign</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-200">
                          5 Levels
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Progressive real-world scenarios: Viral Launch ➔ Influencer CDN ➔ Black Friday ➔ DDoS ➔ AI Copilot.
                      </p>
                      <div className="text-[11px] text-amber-300/90 pt-1 border-t border-slate-800/80">
                        🔒 <strong>Rule:</strong> Clear preceding SLAs to unlock!
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        introAudioTour.stop();
                        setShowWelcomeModal(false);
                        setLevelBriefingModal({ mode: 'CAMPAIGN', levelIdx: currentLevelIdx });
                      }}
                      className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow flex items-center justify-center gap-1.5"
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>Select Level &rarr;</span>
                    </button>
                  </div>

                  {/* Daily Incident Challenge */}
                  <div className="p-4 rounded-2xl bg-slate-950/30 backdrop-blur-sm border border-purple-500/40 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-purple-300">📅 2. Daily Incident</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-200">
                          Rotates 24h
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Deterministic 24h global outage challenge! Build daily streaks and share Wordle-style scorecards.
                      </p>
                      <div className="text-[11px] text-purple-300/90 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                        <span>🔥 Streak: {dailyStreak}d</span>
                        {isDailyCompletedToday && <span className="text-emerald-400 font-bold">✅ Solved</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        introAudioTour.stop();
                        setShowWelcomeModal(false);
                        setLevelBriefingModal({ mode: 'DAILY' });
                      }}
                      className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Daily Briefing &rarr;</span>
                    </button>
                  </div>

                  {/* Survival with Chaos Monkey */}
                  <div className="p-4 rounded-2xl bg-slate-950/30 backdrop-blur-sm border border-amber-500/30 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={chaosMonkeyImg}
                            alt="Chaos Monkey"
                            className="w-5 h-5 rounded-lg object-cover ring-1 ring-amber-400"
                          />
                          <span className="font-bold text-sm text-amber-300">3. Survival Wave</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200">
                          Chaos
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Endless scaling stress test waves! Traffic surges by +2,500 RPS while Chaos Monkey randomly terminates servers.
                      </p>
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                        ⚡ <strong>Goal:</strong> How many waves can you survive?
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        introAudioTour.stop();
                        setShowWelcomeModal(false);
                        setLevelBriefingModal({ mode: 'SURVIVAL' });
                      }}
                      className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition shadow flex items-center justify-center gap-1.5"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Survival Targets &rarr;</span>
                    </button>
                  </div>

                  {/* Sandbox */}
                  <div className="p-4 rounded-2xl bg-slate-950/30 backdrop-blur-sm border border-emerald-500/30 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-emerald-300">🧪 4. Sandbox Lab</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-200">
                          Freeform
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Freeform open architect workbench. Zero budget ceilings, custom traffic slider from 1k to 35k+ RPS.
                      </p>
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                        🛠️ <strong>Freedom:</strong> Sharding, caching &amp; AI vector pipelines.
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        introAudioTour.stop();
                        setShowWelcomeModal(false);
                        setLevelBriefingModal({ mode: 'SANDBOX' });
                      }}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shadow flex items-center justify-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Open Sandbox &rarr;</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick How to Play (Transparent Glass) */}
              <div
                id="intro-footer-card"
                className={`p-4 rounded-2xl border space-y-2 transition-all duration-300 ${
                  audioTourState.isPlaying && audioTourState.currentStepIdx === 4
                    ? 'bg-indigo-950/40 backdrop-blur-sm border-cyan-400 ring-2 ring-cyan-400/80 shadow-cyan-500/30'
                    : 'bg-indigo-950/20 backdrop-blur-sm border-indigo-500/25'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-indigo-300 text-xs uppercase tracking-wider">
                    Quickstart Guide (4 Steps):
                  </div>
                  {audioTourState.isPlaying && audioTourState.currentStepIdx === 4 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-bold flex items-center gap-1 animate-pulse">
                      <Volume2 className="w-3 h-3" />
                      Ada Explaining Steps
                    </span>
                  )}
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
            <div className="pt-4 mt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Choose any game mode above to inspect its <strong>mission targets &amp; level briefing</strong> before entering the arena.</span>
              </span>
              <button
                onClick={() => {
                  introAudioTour.stop();
                  setShowWelcomeModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900/50 hover:bg-slate-800/70 text-slate-300 hover:text-white font-bold text-xs transition border border-slate-700/60 backdrop-blur-sm"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4B. LEVEL & MODE MISSION BRIEFING MODAL (TARGETS & SLA OBJECTIVES)   */}
      {/* =================================================================== */}
      {levelBriefingModal && (() => {
        const modalMode = levelBriefingModal.mode;
        const selectedLvlIdx = levelBriefingModal.levelIdx !== undefined ? levelBriefingModal.levelIdx : currentLevelIdx;
        const selectedLvl = modalMode === 'DAILY' ? dailyIncident : (CAMPAIGN_LEVELS[selectedLvlIdx] || CAMPAIGN_LEVELS[0]);

        return (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="relative max-w-3xl w-full bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto text-slate-100 max-h-[92vh] flex flex-col">
              {/* Close Button */}
              <button
                onClick={() => setLevelBriefingModal(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                title="Close Briefing"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              {modalMode === 'CAMPAIGN' ? (
                <div>
                  <div className="flex items-center gap-3.5 mb-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-cyan-950/80 border border-cyan-500/40 shadow-xl">
                    <img
                      src={mentorAdaImg}
                      alt="Ada Systems Architect"
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-cyan-400 shadow-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          Campaign Mission #{selectedLvl.id}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          {selectedLvl.concept}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-1 truncate">
                        {selectedLvl.title}
                      </h2>
                    </div>
                  </div>

                  {/* Campaign Level Selector Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 border-b border-slate-800">
                    <span className="text-xs text-slate-400 font-bold shrink-0 mr-1">Choose Level:</span>
                    {CAMPAIGN_LEVELS.map((lvl, idx) => {
                      const isUnlocked = idx <= unlockedLevelIdx;
                      const isPassed = idx < unlockedLevelIdx;
                      const isSelected = selectedLvlIdx === idx;

                      return (
                        <button
                          key={lvl.id}
                          disabled={!isUnlocked}
                          onClick={() => setLevelBriefingModal({ mode: 'CAMPAIGN', levelIdx: idx })}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400'
                              : isPassed
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/50'
                              : isUnlocked
                              ? 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                              : 'bg-slate-950/40 text-slate-600 border border-slate-900 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {isPassed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : isUnlocked ? (
                            <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          )}
                          <span>Level {lvl.id}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : modalMode === 'DAILY' ? (
                <div className="flex items-center gap-3.5 mb-4 p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/40 shadow-xl">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-300 shrink-0">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        Rotates Every 24h UTC
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        🔥 Streak: {dailyStreak} Day{dailyStreak === 1 ? '' : 's'}
                      </span>
                      {isDailyCompletedToday && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          ✅ Cleared Today
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-1 truncate">
                      {dailyIncident.title}
                    </h2>
                  </div>
                </div>
              ) : modalMode === 'SURVIVAL' ? (
                <div className="flex items-center gap-3.5 mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-rose-950/80 border border-amber-500/40 shadow-xl">
                  <img
                    src={chaosMonkeyImg}
                    alt="Chaos Monkey"
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-amber-400 shadow-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Chaos Engineering Mode
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        Endless Scaling Stress Test
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-1">
                      Survival Wave Mode
                    </h2>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3.5 mb-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/40 shadow-xl">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0">
                    <Sliders className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Open Architecture Playground
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                        No Budget Constraints
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-1">
                      Sandbox Architecture Lab
                    </h2>
                  </div>
                </div>
              )}

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0 text-xs sm:text-sm">
                {/* Scenario Box */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-indigo-400">
                    <BookOpen className="w-4 h-4" />
                    <span>Mission Scenario</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {modalMode === 'CAMPAIGN' || modalMode === 'DAILY'
                      ? selectedLvl.brief
                      : modalMode === 'SURVIVAL'
                      ? 'Endless scaling stress test waves! Traffic surges by +2,500 RPS each wave while Chaos Monkey randomly terminates active servers and unleashes DDoS bot swarms. Test your cluster failover resilience and see how many waves you can withstand.'
                      : 'Freeform open architect workbench. Build any distributed system topology with zero budget ceilings, all 11 cloud components unlocked, and live interactive traffic simulation from 1,000 to 35,000+ RPS.'}
                  </p>
                  {modalMode === 'CAMPAIGN' && selectedLvl.beginnerAnalogy && (
                    <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200">
                      💡 <strong>Real-Life Analogy:</strong> {selectedLvl.beginnerAnalogy}
                    </div>
                  )}
                </div>

                {/* TARGETS TO ACHIEVE (SLA REQUIREMENTS) */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2.5 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <span>Targets You Must Achieve To Pass</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Target 1: Peak Traffic */}
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Peak Traffic</span>
                      <div className="text-base sm:text-lg font-black font-mono text-cyan-300 mt-1">
                        {modalMode === 'CAMPAIGN' || modalMode === 'DAILY'
                          ? `${selectedLvl.targetRps.toLocaleString()} RPS`
                          : modalMode === 'SURVIVAL'
                          ? '3,000+ RPS'
                          : 'Up to 35k RPS'}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1">
                        {modalMode === 'CAMPAIGN' || modalMode === 'DAILY' ? 'Client request surge' : modalMode === 'SURVIVAL' ? '+2.5k RPS / wave' : 'Adjustable slider'}
                      </span>
                    </div>

                    {/* Target 2: Latency SLA */}
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">P99 Latency SLA</span>
                      <div className="text-base sm:text-lg font-black font-mono text-indigo-300 mt-1">
                        {modalMode === 'CAMPAIGN' || modalMode === 'DAILY' ? `< ${selectedLvl.maxLatencyMs} ms` : modalMode === 'SURVIVAL' ? '< 250 ms' : 'Live Benchmark'}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1">
                        {modalMode === 'SANDBOX' ? 'Telemetry tracking' : 'Max allowable SLA'}
                      </span>
                    </div>

                    {/* Target 3: Uptime SLA */}
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Uptime SLA</span>
                      <div className="text-base sm:text-lg font-black font-mono text-emerald-300 mt-1">
                        {modalMode === 'CAMPAIGN' || modalMode === 'DAILY' ? `≥ ${selectedLvl.minUptimePct}%` : modalMode === 'SURVIVAL' ? '≥ 98.0%' : 'Live Telemetry'}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1">
                        Zero dropped requests
                      </span>
                    </div>

                    {/* Target 4: Cloud Budget */}
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Hourly Budget</span>
                      <div className="text-base sm:text-lg font-black font-mono text-amber-300 mt-1">
                        {modalMode === 'CAMPAIGN' || modalMode === 'DAILY' ? `≤ $${selectedLvl.maxBudgetHr}/hr` : 'Unlimited ($∞)'}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1">
                        {modalMode === 'CAMPAIGN' || modalMode === 'DAILY' ? 'Cost SLA constraint' : 'Zero budget limit'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Traffic Breakdown for Campaign & Daily */}
                {(modalMode === 'CAMPAIGN' || modalMode === 'DAILY') && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Incoming Traffic Composition:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedLvl.trafficMix)
                        .filter(([, ratio]) => ratio > 0)
                        .map(([typeKey, ratio]) => {
                          const spec = TRAFFIC_TYPES[typeKey];
                          if (!spec) return null;
                          return (
                            <span
                              key={typeKey}
                              className="px-2.5 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1.5"
                              style={{
                                backgroundColor: `${spec.color}18`,
                                borderColor: `${spec.color}40`,
                                color: spec.color
                              }}
                            >
                              <span>{spec.emoji}</span>
                              <span>{Math.round(ratio * 100)}% {spec.name.split('(')[0]}</span>
                            </span>
                          );
                        })}
                    </div>
                  </div>
                )}


                {/* Tactical Directives / Hints */}
                {modalMode === 'CAMPAIGN' && selectedLvl.hints && selectedLvl.hints.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Architect Directives from Ada:</span>
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {selectedLvl.hints.map((hint, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                          <span>{hint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-4 mt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <button
                  onClick={() => {
                    setLevelBriefingModal(null);
                    setShowWelcomeModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition border border-slate-700 flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Modes</span>
                </button>

                <button
                  onClick={() => {
                    if (modalMode === 'CAMPAIGN') {
                      selectLevel(selectedLvlIdx);
                      setGameMode('CAMPAIGN');
                    } else {
                      switchMode(modalMode);
                    }
                    setLevelBriefingModal(null);
                  }}
                  className={`px-6 py-2.5 rounded-xl font-black text-xs shadow-xl transition flex items-center gap-2 ${
                    modalMode === 'CAMPAIGN'
                      ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-indigo-500/30'
                      : modalMode === 'DAILY'
                      ? 'bg-gradient-to-r from-purple-500 via-indigo-600 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white shadow-purple-500/30'
                      : modalMode === 'SURVIVAL'
                      ? 'bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-amber-500/30'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/30'
                  }`}
                >
                  <span>
                    {modalMode === 'CAMPAIGN'
                      ? `🚀 Open Game Arena for Level ${selectedLvl.id}`
                      : modalMode === 'DAILY'
                      ? `📅 Enter Daily Incident Arena #${dailyIncident.dayNumber}`
                      : modalMode === 'SURVIVAL'
                      ? '🔥 Open Survival Arena & Challenge Chaos Monkey'
                      : '🧪 Open Sandbox Arena & Build Architecture'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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

      {/* ========================================================================= */}
      {/* ARCHITECT HALL OF FAME & DAILY INCIDENT LEADERBOARD MODAL                 */}
      {/* ========================================================================= */}
      {showLeaderboardModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowLeaderboardModal(false)}
        >
          <div
            className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl shadow-indigo-950/60 overflow-hidden text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 pb-4 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25">
                  <Trophy className="w-6 h-6 fill-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black font-display tracking-tight text-white">
                      Architect Hall of Fame
                    </h2>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                      Global Benchmark
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Compare your P99 latency and system uptime against legendary cloud architects
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLeaderboardModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab selector & Peer Benchmark Card */}
            <div className="p-4 bg-slate-950/60 border-b border-slate-800/60 space-y-3">
              {/* Tabs */}
              <div className="flex p-1 rounded-2xl bg-slate-900 border border-slate-800 max-w-md mx-auto">
                <button
                  onClick={() => setLeaderboardTab('DAILY')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    leaderboardTab === 'DAILY'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Daily Incident #{dailyIncident.dayNumber}</span>
                </button>
                <button
                  onClick={() => setLeaderboardTab('SURVIVAL')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    leaderboardTab === 'SURVIVAL'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Survival Waves</span>
                </button>
              </div>

              {/* User Benchmark Summary Card */}
              {leaderboardTab === 'DAILY' ? (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Your Benchmark Status</span>
                    </div>
                    {userDailyStanding?.userEntry ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-amber-300 font-display">
                          Rank #{userDailyStanding.rank}
                        </span>
                        <span className="text-xs text-slate-300">
                          • Better than <span className="text-emerald-400 font-bold">{100 - userDailyStanding.percentile}%</span> of cloud engineers (Top {userDailyStanding.percentile}%)
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-300">
                        No run logged for Day #{dailyIncident.dayNumber} yet! Solve today's incident to record your rank.
                      </div>
                    )}
                    <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-0.5 font-mono">
                      <span>⏱️ Best P99: <strong className="text-cyan-300">{playerDailyBest ? `${Math.round(playerDailyBest)}ms` : 'None'}</strong></span>
                      <span>🔥 Daily Streak: <strong className="text-amber-400">{dailyStreak} Days</strong></span>
                    </div>
                  </div>

                  {/* Share Rank Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyLeaderboardShare}
                      className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition active:scale-95 shadow flex items-center gap-1.5"
                      title="Copy your rank and benchmark to clipboard"
                    >
                      {isLeaderboardShareCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isLeaderboardShareCopied ? 'Rank Copied!' : 'Copy Rank'}</span>
                    </button>
                    <button
                      onClick={handleTweetLeaderboardShare}
                      className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/30 font-bold text-xs transition active:scale-95 flex items-center gap-1.5"
                      title="Share your rank on Twitter / X"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-950 border border-purple-500/30 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-purple-300" />
                      <span>Survival Endurance Record</span>
                    </div>
                    <div className="text-lg font-black text-purple-300 font-display">
                      Personal Record: Wave {bestSurvivalWave}
                    </div>
                    <p className="text-xs text-slate-400">
                      Defend against endless escalating traffic surges to climb the leaderboard!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowLeaderboardModal(false);
                      switchMode('SURVIVAL');
                    }}
                    className="py-2 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition active:scale-95 shadow-md flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Play Survival</span>
                  </button>
                </div>
              )}
            </div>

            {/* Podium for Top 3 */}
            <div className="px-5 py-3 bg-slate-950/40 border-b border-slate-800/40 grid grid-cols-3 gap-3">
              {(leaderboardTab === 'DAILY' ? dailyLeaderboardEntries : survivalLeaderboardEntries).slice(0, 3).map((podiumEntry, idx) => {
                const podiumColors = [
                  'from-amber-500/20 border-amber-500/40 text-amber-300',
                  'from-slate-400/20 border-slate-400/40 text-slate-300',
                  'from-amber-700/20 border-amber-700/40 text-amber-500'
                ];
                const podiumIcons = ['🥇 1st', '🥈 2nd', '🥉 3rd'];
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-2xl bg-gradient-to-b ${podiumColors[idx]} border flex flex-col items-center text-center relative overflow-hidden`}
                  >
                    <span className="text-xs font-black uppercase font-mono tracking-wider">{podiumIcons[idx]}</span>
                    <div className="text-2xl my-1">{podiumEntry.avatar || '👨‍💻'}</div>
                    <div className="text-xs font-bold text-white truncate max-w-full flex items-center gap-1">
                      <span>{podiumEntry.name}</span>
                      {podiumEntry.isUser && (
                        <span className="text-[9px] bg-indigo-500 text-white px-1.5 py-0.2 rounded-full font-bold">YOU</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-full">{podiumEntry.role}</div>
                    <div className="mt-1.5 text-xs font-mono font-bold text-cyan-300">
                      {leaderboardTab === 'DAILY' ? `${podiumEntry.latency}ms P99` : `Wave ${podiumEntry.wave}`}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Leaderboard Entries List / Table */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
              {(leaderboardTab === 'DAILY' ? dailyLeaderboardEntries : survivalLeaderboardEntries).map((entry, index) => {
                const isUser = entry.isUser;
                return (
                  <div
                    key={entry.id || index}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isUser
                        ? 'bg-indigo-950/70 border-indigo-400/80 ring-2 ring-indigo-500/30 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Left: Rank & Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 text-center font-mono font-black text-sm ${
                        index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-slate-500'
                      }`}>
                        {entry.rankBadge || `#${index + 1}`}
                      </div>
                      <div className="text-xl">{entry.avatar || '👨‍💻'}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold truncate ${isUser ? 'text-indigo-200' : 'text-white'}`}>
                            {entry.name}
                          </span>
                          {isUser && (
                            <span className="text-[10px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                              YOU
                            </span>
                          )}
                          {entry.streak && entry.streak > 1 && (
                            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.2 rounded-full">
                              🔥 {entry.streak}d
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {entry.role} • {entry.company || (entry.rps ? `${entry.rps} RPS Peak` : '')}
                        </div>
                      </div>
                    </div>

                    {/* Right: Architecture Stack & Latency / Wave */}
                    <div className="flex items-center gap-4 shrink-0 text-right">
                      {entry.stack && (
                        <div className="hidden sm:flex items-center gap-1">
                          {entry.stack.map((s, sIdx) => (
                            <span key={sIdx} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="min-w-[70px]">
                        {leaderboardTab === 'DAILY' ? (
                          <div>
                            <div className="font-mono font-black text-sm text-cyan-300">
                              {entry.latency}ms
                            </div>
                            <div className="text-[10px] font-mono text-emerald-400">
                              {entry.uptime}% SLA
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-mono font-black text-sm text-purple-300">
                              Wave {entry.wave}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {entry.rps} RPS
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Leaderboard updates deterministically daily at 00:00 UTC</span>
              </div>
              <div className="flex items-center gap-2">
                {gameMode !== 'DAILY' && (
                  <button
                    onClick={() => {
                      setShowLeaderboardModal(false);
                      switchMode('DAILY');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs transition"
                  >
                    ⚡ Play Today's Incident
                  </button>
                )}
                <button
                  onClick={() => setShowLeaderboardModal(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ICONIC PRODUCTION ARCHITECTURES SHOWCASE MODAL (NETFLIX, SPOTIFY, UBER)    */}
      {/* ========================================================================= */}
      {showPresetsModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowPresetsModal(false)}
        >
          <div
            className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl shadow-indigo-950/60 overflow-hidden text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 pb-4 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black font-display tracking-tight text-white">
                      Iconic Production Architectures
                    </h2>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
                      1-Click Deploy
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Deploy, inspect, and stress-test real-world hyperscale architectures from top tech companies
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPresetsModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Grid */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
              {ICONIC_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${preset.color} border ${preset.borderColor} flex flex-col justify-between gap-3 shadow-lg relative group transition-all duration-200 hover:scale-[1.01]`}
                >
                  <div className="space-y-2">
                    {/* Header: Emoji, Title & Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl select-none">{preset.emoji}</span>
                        <div>
                          <h3 className="text-base font-black text-white font-display leading-snug">
                            {preset.name}
                          </h3>
                          <div className="text-[11px] font-bold text-slate-400">
                            {preset.company} Engineering
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20 whitespace-nowrap">
                        {preset.badge}
                      </span>
                    </div>

                    {/* Tagline / Architectural Summary */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {preset.tagline}
                    </p>

                    {/* Component Stack Pills */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {preset.keyFeatures.map((feat, fIdx) => (
                        <span
                          key={fIdx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/40 text-slate-200 border border-white/10 font-medium"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions: Deploy to Canvas & Share Link */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleSharePreset(preset)}
                      className="py-1.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-sky-400 border border-sky-500/30 text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow"
                      title="Copy 1-click playable link to this preset"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Share Link</span>
                    </button>

                    <button
                      onClick={() => handleLoadIconicPreset(preset)}
                      className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs transition shadow-md shadow-indigo-500/30 flex items-center gap-1.5 active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Deploy to Canvas</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All presets are 100% interactive — scale peak RPS or unleash Chaos Monkey after deploying!</span>
              </div>
              <button
                onClick={() => setShowPresetsModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ARCHITECT BADGES & DAILY STREAK REWARDS SHOWCASE MODAL                    */}
      {/* ========================================================================= */}
      {showBadgesModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowBadgesModal(false)}
        >
          <div
            className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900/95 border border-amber-500/40 shadow-2xl shadow-amber-950/60 overflow-hidden text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 pb-4 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-amber-950/50 to-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
                  <Award className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black font-display tracking-tight text-white">
                      Architect Badges &amp; Streak Rewards
                    </h2>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                      {unlockedBadges.length} / {ARCHITECT_BADGES.length} Unlocked
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Earn permanent SRE trophies, stack consecutive daily streak XP multipliers, and flex your reliability credentials
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBadgesModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 min-h-0">
              {/* Career Banner: Rank + XP Breakdown + Streak Multiplier */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-indigo-400/40 flex items-center justify-center text-3xl shadow-inner shadow-indigo-500/20">
                    {playerRank.badge}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                        Architect Rank (Level {playerRank.level}/5)
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white">{playerRank.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                      <span className="text-amber-300 font-bold">{playerRank.xp.toLocaleString()} XP</span>
                      <span>•</span>
                      <span>Campaign: +{playerRank.baseCampaignXp}</span>
                      <span>•</span>
                      <span>Badges: +{playerRank.badgeBonusXp}</span>
                      <span>•</span>
                      <span>Streak: +{playerRank.streakBonusXp}</span>
                    </div>
                  </div>
                </div>

                {/* Active Daily Streak Status */}
                <div className="flex items-center gap-3 bg-amber-950/40 border border-amber-500/40 rounded-xl px-4 py-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl">
                    🔥
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-400 font-mono">Current Daily Streak</div>
                    <div className="text-sm font-black text-white">
                      {dailyStreak} Day{dailyStreak === 1 ? '' : 's'} Consecutive
                    </div>
                    <div className="text-[10px] text-amber-300/80 font-mono">
                      {dailyStreak >= 7 ? '👑 1.50x XP Multiplier Active!' : dailyStreak >= 3 ? '🔥 1.25x XP Multiplier Active!' : 'Target: 3 Days for 1.25x Boost'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 7-Day Streak Rewards Track */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono flex items-center gap-1.5">
                    <span>🔥</span>
                    <span>7-Day Daily Incident Streak Track</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Resets if a day is missed</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                  {STREAK_REWARDS.map((tier) => {
                    const isClaimed = dailyStreak >= tier.day;
                    const isNext = dailyStreak + 1 === tier.day;
                    return (
                      <div
                        key={tier.day}
                        className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                          isClaimed
                            ? 'bg-gradient-to-b from-amber-500/20 to-orange-500/10 border-amber-400/60 shadow-md shadow-amber-950/40'
                            : isNext
                            ? 'bg-slate-900/60 border-amber-400/40 ring-1 ring-amber-400/30 animate-pulse'
                            : 'bg-slate-900/40 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="text-xl mb-1">{tier.icon}</div>
                        <div className="text-[11px] font-black text-white font-mono">Day {tier.day}</div>
                        <div className="text-[9px] font-mono text-amber-300 font-bold mt-0.5">+{tier.xpBonus} XP</div>
                        <div className="text-[8px] text-slate-400 mt-1 leading-tight line-clamp-2">{tier.perk}</div>
                        <div className="mt-2 text-[9px] font-bold">
                          {isClaimed ? (
                            <span className="text-emerald-400 font-mono">✓ Claimed</span>
                          ) : isNext ? (
                            <span className="text-amber-400 font-mono">Next Target</span>
                          ) : (
                            <span className="text-slate-600 font-mono">Locked</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 10 Architect Badges Grid */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono flex items-center gap-1.5">
                    <span>🎖️</span>
                    <span>Engineering Milestone Badges</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {unlockedBadges.length} of {ARCHITECT_BADGES.length} Unlocked
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ARCHITECT_BADGES.map((badge) => {
                    const isUnlocked = unlockedBadges.includes(badge.id);
                    return (
                      <div
                        key={badge.id}
                        className={`p-3.5 rounded-2xl border flex items-start gap-3.5 transition-all ${
                          isUnlocked
                            ? `bg-gradient-to-br ${badge.color} shadow-md`
                            : 'bg-slate-900/40 border-slate-800/80 opacity-60 hover:opacity-80'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                          isUnlocked ? 'bg-slate-900/80 border border-white/10 shadow-inner' : 'bg-slate-950/80 border border-slate-800 text-slate-600'
                        }`}>
                          {isUnlocked ? badge.icon : '🔒'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className={`text-sm font-bold truncate ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                              {badge.title}
                            </h5>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              badge.rarity === 'Legendary'
                                ? 'bg-amber-400/20 text-yellow-300 border border-yellow-400/40'
                                : badge.rarity === 'Epic'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : badge.rarity === 'Rare'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'bg-slate-700/40 text-slate-300 border border-slate-600/40'
                            }`}>
                              {badge.rarity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300/90 mt-1 leading-snug">
                            {badge.description}
                          </p>
                          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/40 text-[10px] font-mono">
                            <span className="text-amber-400 font-bold">+{badge.xpReward} XP Reward</span>
                            <span className={isUnlocked ? 'text-emerald-400 font-bold flex items-center gap-1' : 'text-slate-500 flex items-center gap-1'}>
                              {isUnlocked ? '✓ UNLOCKED' : 'LOCKED'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer (Share & Close) */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Total XP Earned:</span>
                <span className="text-amber-300 font-mono font-bold">{playerRank.xp.toLocaleString()} XP</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareBadges}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600/60 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition active:scale-95 shadow-md"
                  title="Copy formatted trophy stats to clipboard"
                >
                  {isBadgesShareCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <span>{isBadgesShareCopied ? 'Trophies Copied!' : 'Copy Showcase'}</span>
                </button>

                <button
                  onClick={handleTweetBadges}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-lg shadow-sky-500/25"
                  title="Share on Twitter / X"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Flex on X</span>
                </button>

                <button
                  onClick={() => setShowBadgesModal(false)}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition active:scale-95 shadow-md shadow-indigo-600/30"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input for Blueprint Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportBlueprintFile}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Newly Unlocked Trophy / Badge Toast Notification */}
      {badgeToast && (
        <div
          onClick={() => {
            sound.playClick();
            setShowBadgesModal(true);
          }}
          className="fixed top-16 right-4 z-50 p-4 rounded-2xl bg-slate-900/95 border-2 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.5)] backdrop-blur-xl flex items-center gap-3.5 cursor-pointer animate-in slide-in-from-top duration-300 group max-w-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
            {badgeToast.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                🏆 Trophy Unlocked!
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-bold">
                +{badgeToast.xpReward} XP
              </span>
            </div>
            <h4 className="text-sm font-bold text-white truncate">{badgeToast.title}</h4>
            <p className="text-xs text-slate-300 line-clamp-1">{badgeToast.description}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
        </div>
      )}

      {/* Floating Glass Toast Notification Banner */}
      {toastNotification && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300">
          <div className="px-4 py-2 rounded-xl backdrop-blur-xl bg-slate-900/95 border border-indigo-500/50 text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-100">{toastNotification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}