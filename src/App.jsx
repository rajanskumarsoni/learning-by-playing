import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Server, Database, Shield, Globe, Cpu, Layers, Activity, Zap, Play, Pause,
  RotateCcw, AlertTriangle, CheckCircle2, HelpCircle, Github, Plus, Trash2,
  Settings, Award, Terminal, Flame, ChevronRight, Copy, Check, Download,
  FastForward, Eye, Sliders, Share2, Lock, Unlock, Box, HardDrive, Network,
  ArrowRight, Sparkles, Info, X, RefreshCw
} from 'lucide-react';

// ============================================================================
// 1. COMPONENT CATALOG & REALISTIC SYSTEM DESIGN SPECS
// ============================================================================
const COMPONENT_CATALOG = {
  SOURCE: {
    type: 'SOURCE',
    name: 'Internet Traffic',
    category: 'Entry',
    icon: Globe,
    color: 'from-sky-500 to-blue-600',
    borderColor: 'border-sky-500',
    textColor: 'text-sky-400',
    baseCost: 0,
    baseCapacity: 100000,
    baseLatency: 5,
    description: 'Incoming user requests (Read, Write, and potential Bot/DDoS traffic).',
    isRemovable: false,
  },
  WAF: {
    type: 'WAF',
    name: 'WAF & Rate Limiter',
    category: 'Edge',
    icon: Shield,
    color: 'from-rose-500 to-red-600',
    borderColor: 'border-rose-500',
    textColor: 'text-rose-400',
    baseCost: 45,
    baseCapacity: 25000,
    baseLatency: 4,
    description: 'Blocks 98% of malicious Bot/DDoS traffic and rate-limits abusive spikes.',
    configOptions: {
      mode: { label: 'Protection Mode', values: ['Standard', 'Strict AI Shield'], costMult: [1, 1.4] }
    }
  },
  CDN: {
    type: 'CDN',
    name: 'Cloud CDN Edge',
    category: 'Edge',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-400',
    baseCost: 60,
    baseCapacity: 30000,
    baseLatency: 6,
    description: 'Caches static media & edge reads. Offloads 70% of Read traffic at ultra-low 6ms latency.',
    configOptions: {
      hitRatio: { label: 'Edge Cache Policy', values: ['Standard (65%)', 'Aggressive (80%)'], hitRate: [0.65, 0.80], costMult: [1, 1.35] }
    }
  },
  LB: {
    type: 'LB',
    name: 'Load Balancer',
    category: 'Routing',
    icon: Network,
    color: 'from-indigo-500 to-purple-600',
    borderColor: 'border-indigo-500',
    textColor: 'text-indigo-400',
    baseCost: 50,
    baseCapacity: 25000,
    baseLatency: 5,
    description: 'Distributes incoming traffic across multiple healthy downstream instances.',
    configOptions: {
      algorithm: { label: 'Routing Algorithm', values: ['Round Robin', 'Least Connections'], costMult: [1, 1.1] }
    }
  },
  WEB: {
    type: 'WEB',
    name: 'API / Web Server',
    category: 'Compute',
    icon: Server,
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-400',
    baseCost: 65,
    baseCapacity: 2200,
    baseLatency: 18,
    description: 'Stateless application server executing business logic. Scale horizontally or vertically.',
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
    textColor: 'text-red-400',
    baseCost: 75,
    baseCapacity: 15000,
    baseLatency: 3,
    description: 'In-memory key-value store. Intercepts 75%+ of database Read queries in 3ms.',
    configOptions: {
      eviction: { label: 'Cache Strategy', values: ['LRU (75% Hit)', 'Semantic + LRU (88% Hit)'], hitRate: [0.75, 0.88], costMult: [1, 1.5] }
    }
  },
  QUEUE: {
    type: 'QUEUE',
    name: 'Kafka Message Queue',
    category: 'Async',
    icon: Activity,
    color: 'from-fuchsia-500 to-pink-600',
    borderColor: 'border-fuchsia-500',
    textColor: 'text-fuchsia-400',
    baseCost: 85,
    baseCapacity: 22000,
    baseLatency: 8,
    description: 'Decouples heavy Write spikes! Buffers and smooths bursts by 65% for downstream Workers/DBs.',
    configOptions: {
      partitions: { label: 'Broker Partitions', values: ['8 Partitions (1x)', '32 Partitions (2x)'], capMult: [1, 2], costMult: [1, 1.6] }
    }
  },
  WORKER: {
    type: 'WORKER',
    name: 'Async Worker Pool',
    category: 'Compute',
    icon: Cpu,
    color: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-500',
    textColor: 'text-cyan-400',
    baseCost: 70,
    baseCapacity: 4500,
    baseLatency: 15,
    description: 'Consumes jobs from Kafka Queue and writes batches safely into the Database.',
    configOptions: {
      tier: { label: 'Pool Concurrency', values: ['4 Workers (1x)', '12 Workers (2.5x)'], capMult: [1, 2.5], costMult: [1, 2.0] }
    }
  },
  SQL: {
    type: 'SQL',
    name: 'PostgreSQL Primary',
    category: 'Data',
    icon: Database,
    color: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
    baseCost: 95,
    baseCapacity: 1600,
    baseLatency: 28,
    description: 'ACID relational database for persistent Reads & Writes. Vulnerable to high uncached loads.',
    configOptions: {
      scaling: {
        label: 'Topology Mode',
        values: ['Single Node (1x)', '+2 Read Replicas (2.6x)', 'Sharded Cluster (5.5x)'],
        capMult: [1, 2.6, 5.5],
        costMult: [1, 2.1, 3.8],
        latencyMult: [1, 0.85, 0.7]
      }
    }
  },
  VECTOR_AI: {
    type: 'VECTOR_AI',
    name: 'Vector DB + GPU Node',
    category: 'AI / ML',
    icon: Sparkles,
    color: 'from-violet-500 to-purple-600',
    borderColor: 'border-violet-500',
    textColor: 'text-violet-400',
    baseCost: 190,
    baseCapacity: 4500,
    baseLatency: 42,
    description: 'Handles AI embeddings & RAG LLM inference. Required for AI-enabled traffic waves.',
    configOptions: {
      batching: {
        label: 'Inference Engine',
        values: ['Standard vLLM (1x)', 'TensorRT + FP8 Batching (2.5x)'],
        capMult: [1, 2.5],
        costMult: [1, 1.75],
        latencyMult: [1, 0.65]
      }
    }
  }
};

// ============================================================================
// 2. CAMPAIGN LEVELS & ARCHITECTURAL SCENARIOS
// ============================================================================
const CAMPAIGN_LEVELS = [
  {
    id: 1,
    title: 'Level 1: The Garage Startup',
    subtitle: 'Vertical Scaling & Basic Caching',
    brief: 'Your MVP social app just got featured on Hacker News! Traffic is ramping up to 800 RPS. A single default Web Server and SQL Database will buckle under the read load. Upgrade your tier or add a Redis Cache between your Web Server and SQL DB.',
    targetRps: 800,
    readRatio: 0.85,
    writeRatio: 0.15,
    botRatio: 0.0,
    requiresAI: false,
    chaosEnabled: false,
    maxLatencyMs: 120,
    minUptimePct: 99.0,
    maxBudgetHr: 260,
    allowedComponents: ['WEB', 'CACHE', 'SQL', 'LB'],
    hints: [
      'A default SQL Database can handle 1,600 RPS, wait—why is latency spiking? Because as load passes 50% capacity, database disk I/O queues up exponentially!',
      'Place a Redis Cache between your Web Server and PostgreSQL Primary (Web -> Cache -> SQL) so 75% of read requests never touch disk.',
      'Or upgrade your Web Server instance size if CPU saturation rises.'
    ],
    initialNodes: [
      { id: 'src-1', type: 'SOURCE', x: 70, y: 210, config: {} },
      { id: 'web-1', type: 'WEB', x: 360, y: 210, config: { tier: 0 } },
      { id: 'sql-1', type: 'SQL', x: 670, y: 210, config: { scaling: 0 } }
    ],
    initialEdges: [
      { id: 'e1', source: 'src-1', target: 'web-1' },
      { id: 'e2', source: 'web-1', target: 'sql-1' }
    ]
  },
  {
    id: 2,
    title: 'Level 2: The Viral Blog Post',
    subtitle: 'Edge Offloading with CDNs & In-Memory Cache',
    brief: 'A major tech influencer linked to your site! You are facing 3,500 RPS with 90% static & read-heavy traffic, and your SLA requires sub-80ms P99 latency on a tight $280/hr budget. Offload traffic at the edge before it melts your origin servers.',
    targetRps: 3500,
    readRatio: 0.90,
    writeRatio: 0.10,
    botRatio: 0.0,
    requiresAI: false,
    chaosEnabled: false,
    maxLatencyMs: 80,
    minUptimePct: 99.0,
    maxBudgetHr: 280,
    allowedComponents: ['CDN', 'LB', 'WEB', 'CACHE', 'SQL'],
    hints: [
      'Insert a Cloud CDN Edge right after Internet Traffic (Internet -> CDN -> Web Server). It intercepts up to 80% of read requests in 6ms!',
      'Combine a CDN upstream with a Redis Cache before your SQL Database so almost zero read queries hit the database.',
      'Watch your hourly budget ($280/hr limit)—1 CDN + 1 Web Server + 1 Redis Cache + 1 SQL DB costs only $290, or skip Redis and use Aggressive CDN + upgraded Web Server!'
    ],
    initialNodes: [
      { id: 'src-1', type: 'SOURCE', x: 60, y: 220, config: {} },
      { id: 'web-1', type: 'WEB', x: 420, y: 220, config: { tier: 0 } },
      { id: 'sql-1', type: 'SQL', x: 730, y: 220, config: { scaling: 0 } }
    ],
    initialEdges: [
      { id: 'e1', source: 'src-1', target: 'web-1' },
      { id: 'e2', source: 'web-1', target: 'sql-1' }
    ]
  },
  {
    id: 3,
    title: 'Level 3: Flash Sale Checkout',
    subtitle: 'Horizontal Scaling, Load Balancing & Read Replicas',
    brief: 'Black Friday Flash Sale! 8,000 RPS is incoming with a heavy 35% checkout Write ratio. A single Web Server and single SQL node will crash immediately. Use a Load Balancer, multiple Web Servers, Redis Cache, and Database Read Replicas/Sharding.',
    targetRps: 8000,
    readRatio: 0.65,
    writeRatio: 0.35,
    botRatio: 0.0,
    requiresAI: false,
    chaosEnabled: false,
    maxLatencyMs: 150,
    minUptimePct: 99.0,
    maxBudgetHr: 550,
    allowedComponents: ['CDN', 'LB', 'WEB', 'CACHE', 'SQL'],
    hints: [
      'Connect Internet Traffic -> CDN -> Load Balancer -> 2 (or more) Web Servers.',
      'Point your Web Servers to a Redis Cache, and connect the Redis Cache to your SQL Database.',
      'Because 35% of 8,000 RPS (2,800 RPS) are Writes that bypass cache, click your SQL Database and upgrade Topology Mode to "+2 Read Replicas" or "Sharded Cluster"!'
    ],
    initialNodes: [
      { id: 'src-1', type: 'SOURCE', x: 50, y: 220, config: {} },
      { id: 'lb-1', type: 'LB', x: 260, y: 220, config: { algorithm: 0 } },
      { id: 'web-1', type: 'WEB', x: 480, y: 130, config: { tier: 0 } },
      { id: 'sql-1', type: 'SQL', x: 760, y: 220, config: { scaling: 0 } }
    ],
    initialEdges: [
      { id: 'e1', source: 'src-1', target: 'lb-1' },
      { id: 'e2', source: 'lb-1', target: 'web-1' },
      { id: 'e3', source: 'web-1', target: 'sql-1' }
    ]
  },
  {
    id: 4,
    title: 'Level 4: Ticketmaster Drop Spike',
    subtitle: 'WAF Bot Mitigation & Async Kafka Write Queues',
    brief: 'A stadium concert ticket drop just triggered 15,000 RPS! Worse: 15% of traffic is malicious scalper bots, and 60% of legitimate traffic is concurrent ticket reservation Writes. Filter the bots at the edge and buffer writes using Kafka + Workers!',
    targetRps: 15000,
    readRatio: 0.30,
    writeRatio: 0.55,
    botRatio: 0.15,
    requiresAI: false,
    chaosEnabled: false,
    maxLatencyMs: 180,
    minUptimePct: 99.0,
    maxBudgetHr: 750,
    allowedComponents: ['WAF', 'CDN', 'LB', 'WEB', 'CACHE', 'QUEUE', 'WORKER', 'SQL'],
    hints: [
      'Unfiltered Red Bot traffic causes instant 15% packet errors! Put a WAF & Rate Limiter directly after Internet Traffic.',
      'To survive 8,250 Write RPS without bankrupting yourself on SQL clusters, route Web Servers -> Kafka Message Queue -> Async Worker Pool -> SQL Database (Sharded).',
      'Kafka smooths heavy write bursts by 65%, allowing downstream Workers and SQL to process reservations smoothly.'
    ],
    initialNodes: [
      { id: 'src-1', type: 'SOURCE', x: 40, y: 220, config: {} },
      { id: 'lb-1', type: 'LB', x: 270, y: 220, config: { algorithm: 0 } },
      { id: 'web-1', type: 'WEB', x: 490, y: 220, config: { tier: 1 } },
      { id: 'sql-1', type: 'SQL', x: 760, y: 220, config: { scaling: 1 } }
    ],
    initialEdges: [
      { id: 'e1', source: 'src-1', target: 'lb-1' },
      { id: 'e2', source: 'lb-1', target: 'web-1' },
      { id: 'e3', source: 'web-1', target: 'sql-1' }
    ]
  },
  {
    id: 5,
    title: 'Level 5: Global AI Search Launch',
    subtitle: 'RAG Vector Pipelines, Semantic Cache & Chaos Engineering',
    brief: 'The final boss! 20,000 RPS global launch of your AI Search engine. Every query requires both SQL storage AND Vector DB + GPU Inference, while Chaos Monkey will randomly crash one of your Web Servers mid-wave! Build a fault-tolerant architecture.',
    targetRps: 20000,
    readRatio: 0.65,
    writeRatio: 0.25,
    botRatio: 0.10,
    requiresAI: true,
    chaosEnabled: true,
    maxLatencyMs: 250,
    minUptimePct: 99.0,
    maxBudgetHr: 1200,
    allowedComponents: ['WAF', 'CDN', 'LB', 'WEB', 'CACHE', 'QUEUE', 'WORKER', 'SQL', 'VECTOR_AI'],
    hints: [
      'You MUST include at least one Vector DB + GPU Node connected downstream from your Web Servers (or Cache) to serve AI queries.',
      'Chaos Monkey will strike at 50% wave progress and disable a Web Server! Make sure your Load Balancer routes to at least 2 (ideally 3) Web Servers so traffic fails over cleanly.',
      'Enable "Semantic + LRU (88% Hit)" on your Redis Cache and "TensorRT + FP8 Batching" on your Vector DB + GPU Node.'
    ],
    initialNodes: [
      { id: 'src-1', type: 'SOURCE', x: 40, y: 230, config: {} },
      { id: 'waf-1', type: 'WAF', x: 200, y: 230, config: { mode: 0 } },
      { id: 'lb-1', type: 'LB', x: 370, y: 230, config: { algorithm: 1 } },
      { id: 'web-1', type: 'WEB', x: 550, y: 140, config: { tier: 1 } },
      { id: 'web-2', type: 'WEB', x: 550, y: 320, config: { tier: 1 } },
      { id: 'sql-1', type: 'SQL', x: 800, y: 230, config: { scaling: 1 } }
    ],
    initialEdges: [
      { id: 'e1', source: 'src-1', target: 'waf-1' },
      { id: 'e2', source: 'waf-1', target: 'lb-1' },
      { id: 'e3', source: 'lb-1', target: 'web-1' },
      { id: 'e4', source: 'lb-1', target: 'web-2' },
      { id: 'e5', source: 'web-1', target: 'sql-1' },
      { id: 'e6', source: 'web-2', target: 'sql-1' }
    ]
  },
  {
    id: 6,
    title: 'Sandbox Mode: Unlimited Architect',
    subtitle: 'Free-Form Distributed Systems Playground',
    brief: 'Experiment freely with any cloud architecture, test 25,000+ RPS spikes, toggle Chaos Monkey at will, and observe how caching, sharding, and message queues affect P99 latency.',
    targetRps: 12000,
    readRatio: 0.70,
    writeRatio: 0.20,
    botRatio: 0.10,
    requiresAI: false,
    chaosEnabled: false,
    maxLatencyMs: 200,
    minUptimePct: 99.0,
    maxBudgetHr: 2500,
    allowedComponents: ['WAF', 'CDN', 'LB', 'WEB', 'CACHE', 'QUEUE', 'WORKER', 'SQL', 'VECTOR_AI'],
    hints: [
      'In Sandbox mode, you can customize incoming traffic RPS or trigger Chaos Monkey manually anytime.',
      'Try comparing synchronous DB writes vs Kafka Queue + Worker Pool under extreme load!'
    ],
    initialNodes: [
      { id: 'src-1', type: 'SOURCE', x: 50, y: 220, config: {} },
      { id: 'cdn-1', type: 'CDN', x: 230, y: 220, config: { hitRatio: 1 } },
      { id: 'lb-1', type: 'LB', x: 410, y: 220, config: { algorithm: 1 } },
      { id: 'web-1', type: 'WEB', x: 590, y: 140, config: { tier: 1 } },
      { id: 'web-2', type: 'WEB', x: 590, y: 300, config: { tier: 1 } },
      { id: 'cache-1', type: 'CACHE', x: 770, y: 220, config: { eviction: 1 } },
      { id: 'sql-1', type: 'SQL', x: 940, y: 220, config: { scaling: 2 } }
    ],
    initialEdges: [
      { id: 'e1', source: 'src-1', target: 'cdn-1' },
      { id: 'e2', source: 'cdn-1', target: 'lb-1' },
      { id: 'e3', source: 'lb-1', target: 'web-1' },
      { id: 'e4', source: 'lb-1', target: 'web-2' },
      { id: 'e5', source: 'web-1', target: 'cache-1' },
      { id: 'e6', source: 'web-2', target: 'cache-1' },
      { id: 'e7', source: 'cache-1', target: 'sql-1' }
    ]
  }
];

// ============================================================================
// 3. CORE GRAPH SIMULATION & TELEMETRY ENGINE
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

function evaluateArchitecture(nodes, edges, incomingRps, level) {
  const nodeMetrics = {};
  const edgeFlows = {};
  let totalHourlyCost = 0;

  nodes.forEach((n) => {
    const stats = getNodeEffectiveStats(n);
    totalHourlyCost += stats.cost;
    nodeMetrics[n.id] = {
      inRead: 0,
      inWrite: 0,
      inBot: 0,
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
    edgeFlows[e.id] = { read: 0, write: 0, bot: 0, total: 0 };
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
      diagnostics: ['Missing Internet Traffic source node!']
    };
  }

  // Seed traffic at SOURCE
  const initialRead = incomingRps * level.readRatio;
  const initialWrite = incomingRps * level.writeRatio;
  const initialBot = incomingRps * (level.botRatio || 0);

  nodeMetrics[sourceNode.id].inRead = initialRead;
  nodeMetrics[sourceNode.id].inWrite = initialWrite;
  nodeMetrics[sourceNode.id].inBot = initialBot;

  // Traverse graph in bounded BFS topological passes (supports up to 8 hops)
  let frontier = [sourceNode.id];
  const visitedDepth = { [sourceNode.id]: 0 };

  while (frontier.length > 0) {
    const nextFrontier = [];

    for (const nodeId of frontier) {
      const node = nodes.find((n) => n.id === nodeId);
      const m = nodeMetrics[nodeId];
      if (!node || !m) continue;

      if (m.isCrashed) {
        m.totalIn = m.inRead + m.inWrite + m.inBot;
        m.dropped = m.totalIn;
        m.processed = 0;
        m.utilization = 1.0;
        continue;
      }

      let curRead = m.inRead;
      let curWrite = m.inWrite;
      let curBot = m.inBot;
      const totalIncoming = curRead + curWrite + curBot;
      m.totalIn = totalIncoming;

      if (totalIncoming <= 0.1) continue;

      // Check capacity & overload drops
      let passRatio = 1.0;
      if (totalIncoming > m.capacity) {
        m.dropped += totalIncoming - m.capacity;
        passRatio = m.capacity / totalIncoming;
      }

      curRead *= passRatio;
      curWrite *= passRatio;
      curBot *= passRatio;
      m.processed = curRead + curWrite + curBot;
      m.utilization = totalIncoming / m.capacity;

      // Exponential queuing latency curve as utilization nears 100%
      const clampedUtil = Math.min(1.35, m.utilization);
      const saturationPenalty =
        clampedUtil < 0.55
          ? 1 + clampedUtil * 0.25
          : 1 + Math.pow((clampedUtil - 0.45) * 2.1, 2.6);
      m.effectiveLatency = Math.round(m.effectiveLatency * saturationPenalty);

      // Apply component transformation rules
      let outRead = curRead;
      let outWrite = curWrite;
      let outBot = curBot;

      if (node.type === 'WAF') {
        // Blocks 98% of malicious Bot/DDoS traffic cleanly
        outBot = curBot * 0.02;
      } else if (node.type === 'CDN') {
        // Offloads hitRate % of Read traffic at edge
        outRead = curRead * (1 - m.hitRate);
      } else if (node.type === 'CACHE') {
        // Offloads hitRate % of Read traffic in memory
        outRead = curRead * (1 - m.hitRate);
      } else if (node.type === 'QUEUE') {
        // Buffers and smooths burst write spikes by 65% for downstream consumers
        outWrite = curWrite * 0.35;
      }

      // Find outgoing edges to healthy/connected targets
      const outEdges = edges.filter((e) => e.source === nodeId);
      if (outEdges.length === 0) continue;

      // If Load Balancer or multiple targets, split traffic across healthy targets first
      const healthyEdges = outEdges.filter((e) => {
        const targetNode = nodes.find((n) => n.id === e.target);
        return targetNode && !targetNode.crashed;
      });

      const activeEdges = healthyEdges.length > 0 ? healthyEdges : outEdges;
      const splitCount = activeEdges.length;

      activeEdges.forEach((edge) => {
        const rFlow = outRead / splitCount;
        const wFlow = outWrite / splitCount;
        const bFlow = outBot / splitCount;

        edgeFlows[edge.id] = {
          read: rFlow,
          write: wFlow,
          bot: bFlow,
          total: rFlow + wFlow + bFlow
        };

        const targetM = nodeMetrics[edge.target];
        if (targetM && (visitedDepth[nodeId] || 0) < 7) {
          targetM.inRead += rFlow;
          targetM.inWrite += wFlow;
          targetM.inBot += bFlow;
          if (!nextFrontier.includes(edge.target)) {
            nextFrontier.push(edge.target);
            visitedDepth[edge.target] = (visitedDepth[nodeId] || 0) + 1;
          }
        }
      });
    }

    frontier = nextFrontier;
  }

  // Validate architectural completeness & calculate end-to-end SLA metrics
  const diagnostics = [];
  let architecturalDrops = 0;

  const webNodes = nodes.filter((n) => n.type === 'WEB' && !n.crashed);
  const sqlNodes = nodes.filter((n) => n.type === 'SQL' && !n.crashed);
  const aiNodes = nodes.filter((n) => n.type === 'VECTOR_AI' && !n.crashed);

  const totalWebProcessed = webNodes.reduce((acc, n) => acc + (nodeMetrics[n.id]?.processed || 0), 0);
  const totalSqlIn = sqlNodes.reduce((acc, n) => acc + (nodeMetrics[n.id]?.totalIn || 0), 0);
  const totalAiIn = aiNodes.reduce((acc, n) => acc + (nodeMetrics[n.id]?.totalIn || 0), 0);

  if (totalWebProcessed < incomingRps * 0.1) {
    architecturalDrops += incomingRps * 0.9;
    diagnostics.push('CRITICAL: Traffic is not reaching any active API / Web Server! Connect Internet Traffic -> Web Server.');
  }

  if (totalSqlIn < 1 && incomingRps > 10) {
    architecturalDrops += incomingRps * 0.5;
    diagnostics.push('CRITICAL: No requests are reaching a PostgreSQL Database! Persistent writes and uncached reads are failing.');
  }

  if (level.requiresAI && totalAiIn < 1 && incomingRps > 10) {
    architecturalDrops += incomingRps * 0.35;
    diagnostics.push('CRITICAL: Level 5 requires a "Vector DB + GPU Node" connected downstream to process AI RAG queries!');
  }

  // Check if unfiltered Bot traffic reached Web/DB tiers
  const unfilteredBotsAtWeb = webNodes.reduce((acc, n) => acc + (nodeMetrics[n.id]?.inBot || 0), 0);
  if (unfilteredBotsAtWeb > incomingRps * 0.03) {
    architecturalDrops += unfilteredBotsAtWeb * 0.85;
    diagnostics.push('SECURITY ALERT: Malicious Bot/DDoS packets are hitting your Web Servers! Place a WAF & Rate Limiter at the edge.');
  }

  // Sum overloaded node drops
  const capacityDrops = Object.values(nodeMetrics).reduce((acc, m) => acc + m.dropped, 0);
  const totalDroppedRps = Math.min(incomingRps, capacityDrops + architecturalDrops);
  const uptimePct = incomingRps > 0 ? Math.max(0, ((incomingRps - totalDroppedRps) / incomingRps) * 100) : 100;

  // Compute weighted P99 Latency across active tiers
  let p99Latency = 12; // Base network RTT
  const activeTierTypes = ['WAF', 'CDN', 'LB', 'WEB', 'CACHE', 'QUEUE', 'WORKER', 'SQL', 'VECTOR_AI'];
  activeTierTypes.forEach((tType) => {
    const tierNodes = nodes.filter((n) => n.type === tType && nodeMetrics[n.id]?.totalIn > 1);
    if (tierNodes.length > 0) {
      const avgTierLatency =
        tierNodes.reduce((acc, n) => acc + nodeMetrics[n.id].effectiveLatency, 0) / tierNodes.length;
      const avgWeight =
        tierNodes.reduce((acc, n) => acc + Math.min(1, nodeMetrics[n.id].totalIn / Math.max(1, incomingRps)), 0) /
        tierNodes.length;
      p99Latency += avgTierLatency * Math.max(0.25, avgWeight);
    }
  });

  p99Latency = Math.round(p99Latency);

  // Generate helpful Root-Cause Diagnostics for overloaded or suboptimal nodes
  nodes.forEach((n) => {
    const m = nodeMetrics[n.id];
    const spec = COMPONENT_CATALOG[n.type];
    if (!m || !spec) return;

    if (m.isCrashed) {
      diagnostics.push(`CHAOS OUTAGE: "${spec.name}" crashed! Traffic must fail over via a Load Balancer to redundant nodes.`);
    } else if (m.utilization > 1.0) {
      const pct = Math.round(m.utilization * 100);
      if (n.type === 'SQL') {
        diagnostics.push(
          `BOTTLENECK: ${spec.name} is overloaded at ${pct}% capacity! Add a Redis Cache upstream for reads, a Kafka Queue for writes, or enable Read Replicas/Sharding.`
        );
      } else if (n.type === 'WEB') {
        diagnostics.push(
          `BOTTLENECK: ${spec.name} is at ${pct}% capacity! Add a Load Balancer with more Web Servers, upgrade Instance Size, or offload reads with a CDN.`
        );
      } else {
        diagnostics.push(`BOTTLENECK: ${spec.name} is overloaded at ${pct}%! Upgrade its configuration or add parallel instances.`);
      }
    } else if (m.utilization > 0.78) {
      diagnostics.push(
        `HIGH LATENCY WARNING: ${spec.name} is at ${Math.round(m.utilization * 100)}% load, causing queuing latency (${m.effectiveLatency}ms).`
      );
    }
  });

  if (totalHourlyCost > level.maxBudgetHr) {
    diagnostics.push(
      `BUDGET EXCEEDED: Current architecture costs $${totalHourlyCost}/hr (SLA limit: $${level.maxBudgetHr}/hr). Downsize over-provisioned tiers.`
    );
  }

  if (diagnostics.length === 0 && incomingRps > 50) {
    diagnostics.push('ALL SYSTEMS NOMINAL: Traffic flow, P99 latency, and resource saturation are well within SLA targets.');
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
// 4. GITHUB REPOSITORY EXPORT GENERATOR
// ============================================================================
const GITHUB_FILES = {
  'package.json': `{
  "name": "archquest-system-design-simulator",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.454.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "vite": "^5.4.10"
  }
}`,
  'README.md': `# ArchQuest: Interactive System Design Simulator

Learn distributed systems and cloud architecture by playing an interactive wave-defense simulation game!

## Features
- **5 Progressive Campaign Levels + Unlimited Sandbox Mode**:
  1. *The Garage Startup* (Vertical Scaling & In-Memory Caching)
  2. *The Viral Blog Post* (CDN Edge Offloading & Latency SLAs)
  3. *Flash Sale Checkout* (Load Balancing, Horizontal Scaling & DB Read Replicas)
  4. *Ticketmaster Drop Spike* (WAF Bot Mitigation & Async Kafka Write Queues)
  5. *Global AI Search Launch* (Vector DB + GPU RAG Pipelines & Chaos Monkey Failover)
- **Real-Time Graph Simulation Engine**: Computes live RPS flow, saturation queuing curves, P99 latency, and packet drops.
- **Root-Cause Architecture Mentor**: Live diagnostics explaining *why* bottlenecks occur and how to fix them.

## Quick Start
\`\`\`bash
npm install
npm run dev
\`\`\``,
  'git-commands.sh': `# 1. Create a new directory and initialize Git
mkdir archquest-simulator && cd archquest-simulator
git init

# 2. Install dependencies (after placing package.json and src/App.jsx)
npm install

# 3. Stage, commit, and push to your GitHub repository
git add .
git commit -m "feat: initial commit of ArchQuest System Design Simulator"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/archquest-simulator.git
git push -u origin main`
};

// ============================================================================
// 5. MAIN REACT APPLICATION COMPONENT
// ============================================================================
export default function App() {
  // Current Level & Game State
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const currentLevel = CAMPAIGN_LEVELS[currentLevelIdx];

  const [nodes, setNodes] = useState(currentLevel.initialNodes);
  const [edges, setEdges] = useState(currentLevel.initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [connectingFromId, setConnectingFromId] = useState(null);

  // Simulation Wave State
  const [isRunning, setIsRunning] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const [waveProgress, setWaveProgress] = useState(0); // 0 to 100%
  const [chaosActive, setChaosActive] = useState(false);
  const [sandboxRps, setSandboxRps] = useState(12000);
  const [completedLevels, setCompletedLevels] = useState({});
  const [postMortemModal, setPostMortemModal] = useState(null);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [showHintsModal, setShowHintsModal] = useState(false);
  const [copiedTab, setCopiedTab] = useState(null);
  const [activeGithubTab, setActiveGithubTab] = useState('git-commands.sh');

  // Telemetry History for Live Mini-Charts
  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const waveStatsRef = useRef({ peakLatency: 0, minUptime: 100, ticks: 0, slaBreaches: 0 });

  // Canvas Drag State
  const canvasRef = useRef(null);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Load level when switched
  const selectLevel = useCallback((idx) => {
    const lvl = CAMPAIGN_LEVELS[idx];
    setCurrentLevelIdx(idx);
    setNodes(JSON.parse(JSON.stringify(lvl.initialNodes)));
    setEdges(JSON.parse(JSON.stringify(lvl.initialEdges)));
    setSelectedNodeId(null);
    setConnectingFromId(null);
    setIsRunning(false);
    setWaveProgress(0);
    setChaosActive(lvl.chaosEnabled);
    setPostMortemModal(null);
    setTelemetryHistory([]);
    waveStatsRef.current = { peakLatency: 0, minUptime: 100, ticks: 0, slaBreaches: 0 };
  }, []);

  // Calculate current live RPS based on wave progress (ramps from 25% to 100% of target)
  const targetPeakRps = currentLevel.id === 6 ? sandboxRps : currentLevel.targetRps;
  const currentLiveRps = useMemo(() => {
    if (!isRunning && waveProgress === 0) {
      // Preview at 35% load while designing so user gets instant visual feedback
      return Math.round(targetPeakRps * 0.35);
    }
    const rampFactor = 0.25 + 0.75 * Math.min(1, waveProgress / 75);
    const jitter = isRunning ? 1 + Math.sin(waveProgress * 0.4) * 0.03 : 1;
    return Math.round(targetPeakRps * rampFactor * jitter);
  }, [isRunning, waveProgress, targetPeakRps]);

  // Run Graph Evaluation Engine
  const evaluation = useMemo(() => {
    return evaluateArchitecture(nodes, edges, currentLiveRps, currentLevel);
  }, [nodes, edges, currentLiveRps, currentLevel]);

  // Simulation Tick Loop
  useEffect(() => {
    if (!isRunning) return;

    const intervalMs = Math.round(300 / simSpeed);
    const timer = setInterval(() => {
      setWaveProgress((prev) => {
        const next = prev + 1.2;

        // Trigger Chaos Monkey around 50% wave progress if enabled
        if (chaosActive && prev < 48 && next >= 48) {
          setNodes((currNodes) => {
            const webCandidates = currNodes.filter((n) => n.type === 'WEB' && !n.crashed);
            if (webCandidates.length > 0) {
              const victim = webCandidates[Math.floor(Math.random() * webCandidates.length)];
              return currNodes.map((n) => (n.id === victim.id ? { ...n, crashed: true } : n));
            }
            return currNodes;
          });
        }

        if (next >= 100) {
          setIsRunning(false);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isRunning, simSpeed, chaosActive]);

  // Record Telemetry & Handle Wave Completion
  useEffect(() => {
    if (!isRunning && waveProgress < 100) return;

    waveStatsRef.current.ticks += 1;
    waveStatsRef.current.peakLatency = Math.max(waveStatsRef.current.peakLatency, evaluation.p99Latency);
    waveStatsRef.current.minUptime = Math.min(waveStatsRef.current.minUptime, evaluation.uptimePct);

    const latencyOk = evaluation.p99Latency <= currentLevel.maxLatencyMs;
    const uptimeOk = evaluation.uptimePct >= currentLevel.minUptimePct;
    const budgetOk = evaluation.totalHourlyCost <= currentLevel.maxBudgetHr;

    if (!latencyOk || !uptimeOk || !budgetOk) {
      waveStatsRef.current.slaBreaches += 1;
    }

    setTelemetryHistory((prev) => [
      ...prev.slice(-29),
      {
        rps: currentLiveRps,
        latency: evaluation.p99Latency,
        uptime: evaluation.uptimePct
      }
    ]);

    if (waveProgress >= 100 && !postMortemModal) {
      const passedUptime = evaluation.uptimePct >= currentLevel.minUptimePct;
      const passedLatency = evaluation.p99Latency <= currentLevel.maxLatencyMs;
      const passedBudget = evaluation.totalHourlyCost <= currentLevel.maxBudgetHr;

      let stars = 0;
      if (passedUptime && passedLatency && passedBudget) {
        stars = 3;
      } else if (passedUptime && (passedLatency || passedBudget)) {
        stars = 2;
      } else if (evaluation.uptimePct >= 90) {
        stars = 1;
      }

      if (stars >= 2) {
        setCompletedLevels((prev) => ({
          ...prev,
          [currentLevel.id]: Math.max(prev[currentLevel.id] || 0, stars)
        }));
      }

      setPostMortemModal({
        stars,
        passedUptime,
        passedLatency,
        passedBudget,
        finalRps: targetPeakRps,
        finalLatency: evaluation.p99Latency,
        finalUptime: evaluation.uptimePct,
        finalCost: evaluation.totalHourlyCost
      });
    }
  }, [waveProgress, isRunning, evaluation, currentLevel, currentLiveRps, targetPeakRps, postMortemModal]);

  // ============================================================================
  // 6. INTERACTIVE CANVAS & NODE ACTIONS
  // ============================================================================
  const addComponentNode = (type) => {
    const spec = COMPONENT_CATALOG[type];
    if (!spec) return;

    const defaultConfig = {};
    if (spec.configOptions) {
      Object.keys(spec.configOptions).forEach((k) => {
        defaultConfig[k] = 0;
      });
    }

    // Stagger position cleanly on canvas
    const countOfType = nodes.filter((n) => n.type === type).length;
    const columnMap = {
      WAF: 190,
      CDN: 240,
      LB: 370,
      WEB: 540,
      CACHE: 710,
      QUEUE: 690,
      WORKER: 830,
      SQL: 880,
      VECTOR_AI: 880
    };

    const newNode = {
      id: `${type.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      type,
      x: (columnMap[type] || 450) + (countOfType % 2) * 30,
      y: 110 + ((countOfType * 115) % 340),
      config: defaultConfig,
      crashed: false
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const deleteNode = (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || node.type === 'SOURCE') return;
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    if (connectingFromId === nodeId) setConnectingFromId(null);
  };

  const deleteEdge = (edgeId) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
  };

  const handlePortClick = (e, nodeId, portType) => {
    e.stopPropagation();
    if (portType === 'out') {
      setConnectingFromId(connectingFromId === nodeId ? null : nodeId);
    } else if (portType === 'in' && connectingFromId && connectingFromId !== nodeId) {
      const exists = edges.some((ed) => ed.source === connectingFromId && ed.target === nodeId);
      if (!exists) {
        setEdges((prev) => [
          ...prev,
          { id: `e-${Date.now()}`, source: connectingFromId, target: nodeId }
        ]);
      }
      setConnectingFromId(null);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (draggingNodeId) {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNodeId
            ? {
                ...n,
                x: Math.max(16, Math.min(rect.width - 190, x - dragOffset.x)),
                y: Math.max(16, Math.min(rect.height - 110, y - dragOffset.y))
              }
            : n
        )
      );
    }
  };

  const triggerManualChaos = () => {
    const healthyNodes = nodes.filter((n) => n.type !== 'SOURCE' && !n.crashed);
    if (healthyNodes.length === 0) {
      // Restore all crashed nodes
      setNodes((prev) => prev.map((n) => ({ ...n, crashed: false })));
      return;
    }
    const victim = healthyNodes[Math.floor(Math.random() * healthyNodes.length)];
    setNodes((prev) => prev.map((n) => (n.id === victim.id ? { ...n, crashed: true } : n)));
  };

  const resetWave = () => {
    setIsRunning(false);
    setWaveProgress(0);
    setPostMortemModal(null);
    setNodes((prev) => prev.map((n) => ({ ...n, crashed: false })));
    setTelemetryHistory([]);
    waveStatsRef.current = { peakLatency: 0, minUptime: 100, ticks: 0, slaBreaches: 0 };
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedSpec = selectedNode ? COMPONENT_CATALOG[selectedNode.type] : null;
  const selectedMetrics = selectedNode ? evaluation.nodeMetrics[selectedNode.id] : null;

  const copyToClipboard = (text, tabKey) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabKey);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* ====================================================================
          TOP NAVIGATION BAR & LEVEL SELECTOR
      ==================================================================== */}
      <header className="bg-slate-900/95 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Network className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight text-white">ArchQuest</h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                System Design Simulator
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Learn scalable distributed systems by surviving live traffic waves
            </p>
          </div>
        </div>

        {/* Campaign Level Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950/90 p-1.5 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          {CAMPAIGN_LEVELS.map((lvl, idx) => {
            const isSelected = idx === currentLevelIdx;
            const stars = completedLevels[lvl.id] || 0;
            return (
              <button
                key={lvl.id}
                onClick={() => selectLevel(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                <span>{lvl.id === 6 ? 'Sandbox' : `Lvl ${lvl.id}`}</span>
                {stars > 0 && (
                  <span className="text-amber-400 font-bold text-[10px]">
                    {'★'.repeat(stars)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Buttons: Hints & Export to GitHub */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHintsModal(true)}
            className="px-3 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Architecture Hints</span>
          </button>

          <button
            onClick={() => setShowGithubModal(true)}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition"
          >
            <Github className="w-4 h-4" />
            <span>Export for GitHub</span>
          </button>
        </div>
      </header>

      {/* ====================================================================
          MISSION BRIEF & LIVE SLA TELEMETRY BAR
      ==================================================================== */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-3 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Level Brief */}
        <div className="lg:col-span-5 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{currentLevel.title}</span>
            <span className="text-xs text-indigo-400 font-medium">— {currentLevel.subtitle}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{currentLevel.brief}</p>
        </div>

        {/* Live Telemetry Gauges */}
        <div className="lg:col-span-4 grid grid-cols-4 gap-2">
          {/* RPS Gauge */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Traffic Load</span>
              <Activity className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-base font-bold text-white mt-0.5">
              {currentLiveRps.toLocaleString()}{' '}
              <span className="text-[10px] font-normal text-slate-400">RPS</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Peak Goal: {targetPeakRps.toLocaleString()}
            </div>
          </div>

          {/* Latency Gauge */}
          <div
            className={`bg-slate-950/90 border rounded-xl p-2.5 ${
              evaluation.p99Latency > currentLevel.maxLatencyMs
                ? 'border-rose-500/60 bg-rose-950/20'
                : 'border-slate-800'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>P99 Latency</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div
              className={`text-base font-bold mt-0.5 ${
                evaluation.p99Latency > currentLevel.maxLatencyMs
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`}
            >
              {evaluation.p99Latency} <span className="text-[10px] font-normal">ms</span>
            </div>
            <div className="text-[10px] text-slate-400">SLA: &lt; {currentLevel.maxLatencyMs}ms</div>
          </div>

          {/* Uptime / Non-Dropped Gauge */}
          <div
            className={`bg-slate-950/90 border rounded-xl p-2.5 ${
              evaluation.uptimePct < currentLevel.minUptimePct
                ? 'border-rose-500/60 bg-rose-950/20'
                : 'border-slate-800'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Availability</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div
              className={`text-base font-bold mt-0.5 ${
                evaluation.uptimePct < currentLevel.minUptimePct
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`}
            >
              {evaluation.uptimePct}%
            </div>
            <div className="text-[10px] text-slate-400">
              Drops: {evaluation.droppedRps.toLocaleString()} RPS
            </div>
          </div>

          {/* Cloud Cost Gauge */}
          <div
            className={`bg-slate-950/90 border rounded-xl p-2.5 ${
              evaluation.totalHourlyCost > currentLevel.maxBudgetHr
                ? 'border-rose-500/60 bg-rose-950/20'
                : 'border-slate-800'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Cloud Cost</span>
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div
              className={`text-base font-bold mt-0.5 ${
                evaluation.totalHourlyCost > currentLevel.maxBudgetHr
                  ? 'text-rose-400'
                  : 'text-white'
              }`}
            >
              ${evaluation.totalHourlyCost}
              <span className="text-[10px] font-normal text-slate-400">/hr</span>
            </div>
            <div className="text-[10px] text-slate-400">Budget: ${currentLevel.maxBudgetHr}/hr</div>
          </div>
        </div>

        {/* Simulation Wave Controls */}
        <div className="lg:col-span-3 flex flex-col gap-2 bg-slate-950/90 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between gap-1.5">
            <button
              onClick={() => {
                if (waveProgress >= 100) resetWave();
                setIsRunning((prev) => !prev);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 shadow transition ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause Wave
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> {waveProgress > 0 && waveProgress < 100 ? 'Resume' : 'Start Stress Test'}
                </>
              )}
            </button>

            <button
              onClick={() => setSimSpeed((s) => (s === 1 ? 2 : 1))}
              title="Toggle Simulation Speed"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                simSpeed === 2
                  ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {simSpeed}x
            </button>

            <button
              onClick={triggerManualChaos}
              title="Chaos Monkey: Inject or Recover Random Node Failure"
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 flex items-center gap-1 transition"
            >
              <Flame className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Chaos</span>
            </button>

            <button
              onClick={resetWave}
              title="Reset Wave"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Wave Progress Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex items-center">
            <div
              className="bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 h-full transition-all duration-200"
              style={{ width: `${waveProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>
              {isRunning
                ? `Stress Testing Wave (${Math.round(waveProgress)}%)`
                : waveProgress === 0
                ? 'Design Mode (Previewing 35% Load)'
                : 'Wave Paused / Complete'}
            </span>
            <span>
              R:{Math.round(currentLevel.readRatio * 100)}% W:{Math.round(currentLevel.writeRatio * 100)}%
              {currentLevel.botRatio > 0 ? ` Bot:${Math.round(currentLevel.botRatio * 100)}%` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          MAIN WORKSPACE: PALETTE + INTERACTIVE GRAPH CANVAS + INSPECTOR
      ==================================================================== */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[540px] relative">
        {/* LEFT SIDEBAR: INFRASTRUCTURE COMPONENT PALETTE */}
        <aside className="lg:col-span-2 bg-slate-900/90 border-r border-slate-800 p-3 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Cloud Components
              </span>
              <span className="text-[10px] text-slate-500">Click to add</span>
            </div>

            <div className="space-y-2">
              {Object.values(COMPONENT_CATALOG)
                .filter((item) => item.type !== 'SOURCE')
                .map((item) => {
                  const Icon = item.icon;
                  const isAllowed = currentLevel.allowedComponents.includes(item.type);
                  return (
                    <button
                      key={item.type}
                      disabled={!isAllowed}
                      onClick={() => addComponentNode(item.type)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 group ${
                        isAllowed
                          ? 'bg-slate-950/90 hover:bg-slate-800/90 border-slate-800 hover:border-indigo-500/50 cursor-pointer'
                          : 'bg-slate-950/30 border-slate-900 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 shadow`}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                            {item.name}
                          </span>
                          {!isAllowed && <Lock className="w-3 h-3 text-slate-500 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                          <span className="text-emerald-400 font-medium">${item.baseCost}/hr</span>
                          <span>•</span>
                          <span>{(item.baseCapacity / 1000).toFixed(1)}k RPS</span>
                          <span>•</span>
                          <span>{item.baseLatency}ms</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-[11px] text-slate-400">
            <div className="font-semibold text-slate-300 mb-1">Packet Flow Legend</div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block shadow shadow-sky-400" />
              <span>Blue: Read / Static Queries</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow shadow-amber-400" />
              <span>Orange: Persistent DB Writes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow shadow-rose-500" />
              <span>Red: Malicious DDoS / Bots</span>
            </div>
          </div>
        </aside>

        {/* CENTER: INTERACTIVE ARCHITECTURE GRAPH CANVAS */}
        <main
          ref={canvasRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={() => setDraggingNodeId(null)}
          onClick={() => {
            setSelectedNodeId(null);
            setConnectingFromId(null);
          }}
          className="lg:col-span-7 relative bg-slate-950 overflow-hidden cursor-crosshair min-h-[480px]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(99, 102, 241, 0.14) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        >
          {/* Quick Helper Banner inside Canvas */}
          <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-20">
            <div className="bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300 flex items-center gap-2 pointer-events-auto">
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {connectingFromId ? (
                  <span className="text-amber-300 font-semibold">
                    Now click any node&apos;s LEFT input port (or node body) to connect wire...
                  </span>
                ) : (
                  'Drag nodes to arrange • Click a node’s RIGHT port then another node’s LEFT port to wire • Click any wire to delete'
                )}
              </span>
            </div>

            {currentLevel.id === 6 && (
              <div className="bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300 flex items-center gap-2 pointer-events-auto">
                <span>Sandbox Peak RPS:</span>
                <input
                  type="range"
                  min={1000}
                  max={35000}
                  step={1000}
                  value={sandboxRps}
                  onChange={(e) => setSandboxRps(Number(e.target.value))}
                  className="w-24 accent-indigo-500"
                />
                <span className="font-bold text-indigo-400">{sandboxRps.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* SVG WIRES & ANIMATED TRAFFIC PARTICLES */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
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
              const src = nodes.find((n) => n.id === edge.source);
              const tgt = nodes.find((n) => n.id === edge.target);
              if (!src || !tgt) return null;

              const x1 = src.x + 176;
              const y1 = src.y + 44;
              const x2 = tgt.x;
              const y2 = tgt.y + 44;
              const dx = Math.max(50, Math.abs(x2 - x1) * 0.5);
              const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

              const flow = evaluation.edgeFlows[edge.id] || { read: 0, write: 0, bot: 0, total: 0 };
              const hasTraffic = flow.total > 5;
              const animDuration = Math.max(0.45, 2.2 - Math.min(1.6, flow.total / 6000));

              return (
                <g key={edge.id} className="pointer-events-auto group">
                  {/* Invisible wider stroke for easy clicking to delete edge */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="16"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEdge(edge.id);
                    }}
                  />

                  {/* Base Wire */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={hasTraffic ? '#475569' : '#1e293b'}
                    strokeWidth={hasTraffic ? '3' : '2'}
                    className="group-hover:stroke-rose-500 transition-colors"
                  />

                  {/* Animated Read Packet (Blue) */}
                  {flow.read > 5 && (
                    <circle r="4" fill="#38bdf8" filter="url(#glow)">
                      <animateMotion
                        dur={`${animDuration}s`}
                        repeatCount="indefinite"
                        path={pathD}
                      />
                    </circle>
                  )}

                  {/* Animated Write Packet (Orange) */}
                  {flow.write > 5 && (
                    <circle r="4" fill="#fbbf24" filter="url(#glow)">
                      <animateMotion
                        dur={`${animDuration * 1.15}s`}
                        begin="0.25s"
                        repeatCount="indefinite"
                        path={pathD}
                      />
                    </circle>
                  )}

                  {/* Animated Bot Packet (Red) */}
                  {flow.bot > 5 && (
                    <circle r="4.5" fill="#f43f5e" filter="url(#glow)">
                      <animateMotion
                        dur={`${animDuration * 0.85}s`}
                        begin="0.1s"
                        repeatCount="indefinite"
                        path={pathD}
                      />
                    </circle>
                  )}

                  {/* RPS Flow Label on Wire */}
                  {hasTraffic && (
                    <g transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2 - 8})`}>
                      <rect
                        x="-28"
                        y="-10"
                        width="56"
                        height="16"
                        rx="4"
                        fill="#0f172a"
                        stroke="#334155"
                        strokeWidth="1"
                      />
                      <text
                        textAnchor="middle"
                        y="1"
                        fill="#94a3b8"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        {Math.round(flow.total) >= 1000
                          ? `${(flow.total / 1000).toFixed(1)}k/s`
                          : `${Math.round(flow.total)}/s`}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* INFRASTRUCTURE NODES ON CANVAS */}
          {nodes.map((node) => {
            const spec = COMPONENT_CATALOG[node.type];
            const m = evaluation.nodeMetrics[node.id] || {
              totalIn: 0,
              utilization: 0,
              effectiveLatency: spec.baseLatency,
              capacity: spec.baseCapacity,
              isCrashed: false
            };
            const Icon = spec.icon;
            const isSelected = selectedNodeId === node.id;
            const isConnectingSource = connectingFromId === node.id;
            const utilPct = Math.round(m.utilization * 100);

            let statusColor = 'border-slate-700/90';
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
                onMouseDown={(e) => {
                  e.stopPropagation();
                  if (connectingFromId && connectingFromId !== node.id && node.type !== 'SOURCE') {
                    handlePortClick(e, node.id, 'in');
                    return;
                  }
                  setSelectedNodeId(node.id);
                  const rect = canvasRef.current.getBoundingClientRect();
                  setDraggingNodeId(node.id);
                  setDragOffset({
                    x: e.clientX - rect.left - node.x,
                    y: e.clientY - rect.top - node.y
                  });
                }}
                onClick={(e) => e.stopPropagation()}
                className={`absolute z-20 bg-slate-900/95 backdrop-blur rounded-xl border ${statusColor} p-2.5 shadow-xl transition-shadow cursor-grab active:cursor-grabbing`}
              >
                {/* Left Input Port */}
                {node.type !== 'SOURCE' && (
                  <button
                    onClick={(e) => handlePortClick(e, node.id, 'in')}
                    title="Input Port (Click to finish wire connection)"
                    className={`w-4 h-4 rounded-full border-2 absolute -left-2 top-10 transition-transform hover:scale-125 ${
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
                  className={`w-4 h-4 rounded-full border-2 absolute -right-2 top-10 transition-transform hover:scale-125 ${
                    isConnectingSource
                      ? 'bg-indigo-400 border-white scale-125'
                      : 'bg-indigo-600 border-slate-200 hover:bg-indigo-400'
                  }`}
                />

                {/* Node Header */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-br ${spec.color} flex items-center justify-center shrink-0`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">{spec.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {node.type === 'SOURCE' ? 'Entry Point' : `$${m.cost}/hr`}
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
                    <span>NODE CRASHED</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNodes((prev) =>
                          prev.map((n) => (n.id === node.id ? { ...n, crashed: false } : n))
                        );
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
                          utilPct > 100
                            ? 'text-rose-400'
                            : utilPct > 78
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {node.type === 'SOURCE' ? 'Active' : `${utilPct}% Load`}
                      </span>
                    </div>

                    {node.type !== 'SOURCE' && (
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-200 ${
                            utilPct > 100
                              ? 'bg-rose-500'
                              : utilPct > 78
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, utilPct)}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </main>

        {/* RIGHT SIDEBAR: NODE CONFIGURATOR & LIVE ARCHITECTURE MENTOR */}
        <aside className="lg:col-span-3 bg-slate-900/90 border-l border-slate-800 p-3.5 flex flex-col justify-between gap-4 overflow-y-auto">
          {/* Selected Node Inspector */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
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

                {/* Live Telemetry Stats of Selected Node */}
                <div className="grid grid-cols-3 gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400">Throughput</div>
                    <div className="text-xs font-bold text-white">
                      {Math.round(selectedMetrics.totalIn).toLocaleString()} /{' '}
                      {(selectedMetrics.capacity / 1000).toFixed(1)}k
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Node Latency</div>
                    <div className="text-xs font-bold text-amber-400">
                      {selectedMetrics.effectiveLatency} ms
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Dropped</div>
                    <div className="text-xs font-bold text-rose-400">
                      {Math.round(selectedMetrics.dropped).toLocaleString()} RPS
                    </div>
                  </div>
                </div>

                {/* Configurable Tier / Policy Options */}
                {selectedSpec.configOptions &&
                  Object.entries(selectedSpec.configOptions).map(([configKey, opt]) => {
                    const currentIdx = selectedNode.config?.[configKey] || 0;
                    return (
                      <div key={configKey} className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 block">
                          {opt.label}
                        </label>
                        <div className="space-y-1">
                          {opt.values.map((valLabel, idx) => (
                            <button
                              key={valLabel}
                              onClick={() => {
                                setNodes((prev) =>
                                  prev.map((n) =>
                                    n.id === selectedNode.id
                                      ? { ...n, config: { ...n.config, [configKey]: idx } }
                                      : n
                                  )
                                );
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition flex items-center justify-between ${
                                currentIdx === idx
                                  ? 'bg-indigo-600/25 border-indigo-500 text-white'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <span>{valLabel}</span>
                              {currentIdx === idx && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">
                Click any component node on the canvas to inspect its live RPS load, latency curve, and upgrade its scaling tier or caching policy.
              </div>
            )}
          </div>

          {/* Root-Cause Debugger & Live Architecture Mentor */}
          <div className="flex-1 bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>Root-Cause Architecture Mentor</span>
              </span>
              <span className="text-[10px] text-slate-500">Live Diagnostics</span>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {evaluation.diagnostics.map((diag, i) => {
                const isCritical =
                  diag.startsWith('CRITICAL') ||
                  diag.startsWith('BOTTLENECK') ||
                  diag.startsWith('SECURITY') ||
                  diag.startsWith('CHAOS') ||
                  diag.startsWith('BUDGET');
                const isNominal = diag.startsWith('ALL SYSTEMS NOMINAL');

                return (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg border text-xs leading-relaxed flex items-start gap-2 ${
                      isCritical
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        : isNominal
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    }`}
                  >
                    {isCritical ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    ) : isNominal ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <span>{diag}</span>
                  </div>
                );
              })}
            </div>

            {/* Scrolling Telemetry Sparkline Bars */}
            <div className="mt-3 pt-2.5 border-t border-slate-800">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Live P99 Latency Trend</span>
                <span>Target: &lt;{currentLevel.maxLatencyMs}ms</span>
              </div>
              <div className="h-12 bg-slate-900 rounded-lg p-1.5 flex items-end gap-1 overflow-hidden">
                {telemetryHistory.length === 0 ? (
                  <div className="text-[10px] text-slate-500 m-auto">
                    Press &quot;Start Stress Test&quot; to record live telemetry...
                  </div>
                ) : (
                  telemetryHistory.map((pt, idx) => {
                    const heightPct = Math.min(100, Math.max(12, (pt.latency / 300) * 100));
                    const breached = pt.latency > currentLevel.maxLatencyMs;
                    return (
                      <div
                        key={idx}
                        style={{ height: `${heightPct}%` }}
                        className={`flex-1 rounded-t transition-all ${
                          breached ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        title={`${pt.latency}ms at ${pt.rps} RPS`}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ====================================================================
          MODAL 1: LEVEL POST-MORTEM & STAR RATING REPORT
      ==================================================================== */}
      {postMortemModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="text-center space-y-1">
              <div className="text-3xl tracking-widest text-amber-400">
                {'★'.repeat(postMortemModal.stars)}
                <span className="text-slate-700">{'★'.repeat(3 - postMortemModal.stars)}</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {postMortemModal.stars === 3
                  ? 'SLA Mastered! Production Ready'
                  : postMortemModal.stars === 2
                  ? 'Wave Survived (Minor SLA Breach)'
                  : 'System Outage — Post-Mortem Required'}
              </h2>
              <p className="text-xs text-slate-400">{currentLevel.title}</p>
            </div>

            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Availability / Uptime SLA (&ge;{currentLevel.minUptimePct}%)</span>
                <span
                  className={`font-bold ${
                    postMortemModal.passedUptime ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {postMortemModal.finalUptime}% {postMortemModal.passedUptime ? '✓' : '✗'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">P99 Latency SLA (&le;{currentLevel.maxLatencyMs}ms)</span>
                <span
                  className={`font-bold ${
                    postMortemModal.passedLatency ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {postMortemModal.finalLatency} ms {postMortemModal.passedLatency ? '✓' : '✗'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Hourly Cloud Budget (&le;${currentLevel.maxBudgetHr}/hr)</span>
                <span
                  className={`font-bold ${
                    postMortemModal.passedBudget ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  ${postMortemModal.finalCost}/hr {postMortemModal.passedBudget ? '✓' : '✗'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={resetWave}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Refine Architecture
              </button>
              {currentLevelIdx < CAMPAIGN_LEVELS.length - 1 && postMortemModal.stars >= 2 && (
                <button
                  onClick={() => selectLevel(currentLevelIdx + 1)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <span>Next Level</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: ARCHITECTURE HINTS & SOLUTION GUIDE
      ==================================================================== */}
      {showHintsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Architecture Blueprint Hints — {currentLevel.title}
                </h3>
              </div>
              <button
                onClick={() => setShowHintsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {currentLevel.hints.map((hint, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span>{hint}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowHintsModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Got It, Back to Canvas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: EXPORT FOR GITHUB REPOSITORY
      ==================================================================== */}
      {showGithubModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Github className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Push &quot;ArchQuest: System Design Simulator&quot; to GitHub
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ready-to-commit Vite + React + Tailwind project structure
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGithubModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* File Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              {Object.keys(GITHUB_FILES).map((fileKey) => (
                <button
                  key={fileKey}
                  onClick={() => setActiveGithubTab(fileKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeGithubTab === fileKey
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  {fileKey}
                </button>
              ))}
            </div>

            {/* Code Block */}
            <div className="relative">
              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 font-mono overflow-x-auto max-h-72 leading-relaxed">
                {GITHUB_FILES[activeGithubTab]}
              </pre>
              <button
                onClick={() => copyToClipboard(GITHUB_FILES[activeGithubTab], activeGithubTab)}
                className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 border border-slate-700"
              >
                {copiedTab === activeGithubTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </>
                )}
              </button>
            </div>

            <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3 text-xs text-indigo-200 leading-relaxed">
              <strong>How to push to GitHub:</strong> Save this editor file as{' '}
              <code className="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-300">src/App.jsx</code>{' '}
              inside a standard Vite React project, copy the{' '}
              <code className="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-300">package.json</code>{' '}
              and{' '}
              <code className="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-300">README.md</code>{' '}
              above, and run the commands in <code className="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-300">git-commands.sh</code>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}