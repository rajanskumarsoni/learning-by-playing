import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play, Pause, RotateCcw, Trash2, Shield, Cpu, Database,
  Zap, Award, AlertTriangle, CheckCircle2, DollarSign, Heart,
  Activity, Wrench, ArrowUpCircle, BookOpen, Sparkles, Flame,
  Code, Clock, Copy, Check, Terminal, HelpCircle, Layers
} from 'lucide-react';

// ============================================================================
// 1. TRAFFIC TYPES (Color-Coded Packets with Class 10 + Pro Modes)
// ============================================================================
const TRAFFIC_TYPES = {
  STATIC: {
    id: 'STATIC',
    kidName: 'Photos & Videos',
    proName: 'STATIC Media (CDN/S3)',
    color: '#22c55e', // Green
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    reward: 0.6,
    emoji: '🖼️',
    hint: 'Resolved at the edge by a CDN (95%) or stored in Object Storage.'
  },
  READ: {
    id: 'READ',
    kidName: 'Profile / Feed Read',
    proName: 'DB READ (SELECT)',
    color: '#3b82f6', // Blue
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
    reward: 0.9,
    emoji: '📖',
    hint: '75% absorbed by Redis Cache; remainder goes to Read Replicas or DB.'
  },
  WRITE: {
    id: 'WRITE',
    kidName: 'New Order / Save',
    proName: 'DB WRITE (INSERT/TX)',
    color: '#f97316', // Orange
    badgeClass: 'bg-orange-500/15 text-orange-300 border-orange-500/40',
    reward: 1.4,
    emoji: '✍️',
    hint: 'Must reach a persistent SQL Master or NoSQL Database (buffered by Kafka Queue).'
  },
  SEARCH: {
    id: 'SEARCH',
    kidName: 'Search Query',
    proName: 'Full-Text SEARCH',
    color: '#06b6d4', // Cyan
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
    reward: 1.3,
    emoji: '🔍',
    hint: '3x faster on Elasticsearch Index; heavy latency penalty on SQL DB.'
  },
  MALICIOUS: {
    id: 'MALICIOUS',
    kidName: 'Hacker DDoS Bot',
    proName: 'DDoS / Bot Attack',
    color: '#ef4444', // Red
    badgeClass: 'bg-red-500/15 text-red-300 border-red-500/40',
    reward: 0.5,
    emoji: '👾',
    hint: 'Must be filtered at the perimeter by a WAF / Firewall!'
  },
  AI_PROMPT: {
    id: 'AI_PROMPT',
    kidName: 'AI Chat Prompt',
    proName: 'LLM GPU Inference',
    color: '#d946ef', // Fuchsia
    badgeClass: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40',
    reward: 2.2,
    emoji: '🤖',
    hint: 'Requires an AI GPU Inference Cluster (or Semantic Cache).'
  }
};

// ============================================================================
// 2. INFRASTRUCTURE COMPONENT CATALOG (Includes Base Latency & Saturation)
// ============================================================================
const SERVICE_CATALOG = {
  INTERNET: {
    type: 'INTERNET',
    category: 'SOURCE',
    proName: 'Client Traffic Generator',
    kidName: '🌍 Live App Users',
    cost: 0,
    upkeep: 0,
    baseCap: 999,
    baseLatencyMs: 5,
    color: '#64748b',
    emoji: '🌍',
    kidDesc: 'Students and users clicking buttons on your app!',
    proDesc: 'External ingress traffic source.'
  },
  FIREWALL: {
    type: 'FIREWALL',
    category: 'EDGE',
    proName: 'WAF & DDoS Shield',
    kidName: '🛡️ Security Bouncer (WAF)',
    cost: 40,
    upkeep: 4,
    baseCap: 40,
    baseLatencyMs: 4,
    color: '#ef4444',
    emoji: '🛡️',
    kidDesc: 'Stands at the front gate! Blocks Red Hacker Bots (👾) and lets real users inside.',
    proDesc: 'Edge Web Application Firewall. Drops malicious DDoS packets.'
  },
  CDN: {
    type: 'CDN',
    category: 'EDGE',
    proName: 'Cloud Edge CDN',
    kidName: '⚡ Fast Photo Booth (CDN)',
    cost: 60,
    upkeep: 5,
    baseCap: 55,
    baseLatencyMs: 6,
    color: '#22c55e',
    emoji: '⚡',
    kidDesc: 'Serves Green Photos & Videos (🖼️) right at the door in 6ms so your servers relax!',
    proDesc: 'Edge Content Delivery Network. Terminates 95% of STATIC media requests.'
  },
  LOAD_BALANCER: {
    type: 'LOAD_BALANCER',
    category: 'EDGE',
    proName: 'NGINX Load Balancer',
    kidName: '🚦 Traffic Cop (Balancer)',
    cost: 50,
    upkeep: 6,
    baseCap: 50,
    baseLatencyMs: 5,
    color: '#6366f1',
    emoji: '🚦',
    kidDesc: 'Splits incoming traffic evenly across multiple App Servers so none overheat.',
    proDesc: 'L7 Reverse Proxy distributing requests across stateless compute nodes.'
  },
  COMPUTE: {
    type: 'COMPUTE',
    category: 'COMPUTE',
    proName: 'Stateless API Server',
    kidName: '💻 App Worker (Server)',
    cost: 60,
    upkeep: 10,
    baseCap: 15,
    baseLatencyMs: 18,
    color: '#3b82f6',
    emoji: '💻',
    kidDesc: 'Runs your core app code and routes queries to caches, queues, or databases.',
    proDesc: 'Application compute instance. Executes business logic and downstream routing.'
  },
  QUEUE: {
    type: 'QUEUE',
    category: 'ASYNC',
    proName: 'Kafka Message Queue',
    kidName: '🎟️ Waiting Line (Queue)',
    cost: 45,
    upkeep: 4,
    baseCap: 60,
    baseLatencyMs: 10,
    color: '#eab308',
    emoji: '🎟️',
    kidDesc: 'Smooths out sudden Orange Write spikes (✍️) by holding orders in an orderly line!',
    proDesc: 'Asynchronous pub/sub event buffer that prevents database lockups.'
  },
  CACHE: {
    type: 'CACHE',
    category: 'DATA',
    proName: 'Redis Memory Cache',
    kidName: '🧠 Sticky-Note Cache',
    cost: 60,
    upkeep: 8,
    baseCap: 40,
    baseLatencyMs: 3,
    color: '#ec4899',
    emoji: '🧠',
    kidDesc: 'Remembers popular Blue Read answers (📖) in 3ms! Saves 75% of database work.',
    proDesc: 'In-memory key-value store. 75% cache hit ratio with ultra-low 3ms latency.'
  },
  STORAGE: {
    type: 'STORAGE',
    category: 'DATA',
    proName: 'S3 Object Storage',
    kidName: '📦 Photo Locker (S3)',
    cost: 35,
    upkeep: 4,
    baseCap: 30,
    baseLatencyMs: 25,
    color: '#10b981',
    emoji: '📦',
    kidDesc: 'Giant vault for Green Photos & Videos (🖼️) that miss the CDN.',
    proDesc: 'Durable blob storage for static assets and media uploads.'
  },
  SQL_DB: {
    type: 'SQL_DB',
    category: 'DATA',
    proName: 'PostgreSQL Master DB',
    kidName: '🗄️ Master Notebook (SQL)',
    cost: 120,
    upkeep: 18,
    baseCap: 14,
    baseLatencyMs: 42,
    color: '#8b5cf6',
    emoji: '🗄️',
    kidDesc: 'Saves Orange Orders (✍️) and answers Blue Reads (📖). Reliable, but slow under heavy load!',
    proDesc: 'ACID Relational Database. Handles READ, WRITE, and fallback SEARCH.'
  },
  READ_REPLICA: {
    type: 'READ_REPLICA',
    category: 'DATA',
    proName: 'SQL Read Replica',
    kidName: '📑 Photocopy Book (Replica)',
    cost: 85,
    upkeep: 10,
    baseCap: 22,
    baseLatencyMs: 24,
    color: '#60a5fa',
    emoji: '📑',
    kidDesc: 'Extra copy of the database that only answers Blue Reads (📖). Cannot take Orange Writes!',
    proDesc: 'Asynchronous Read-Only DB Replica to scale SELECT queries horizontally.'
  },
  NOSQL_DB: {
    type: 'NOSQL_DB',
    category: 'DATA',
    proName: 'DynamoDB NoSQL',
    kidName: '🚀 Turbo Vault (NoSQL)',
    cost: 95,
    upkeep: 12,
    baseCap: 28,
    baseLatencyMs: 14,
    color: '#f97316',
    emoji: '🚀',
    kidDesc: 'Super fast at Orange Writes (✍️) and Blue Reads (📖), but cannot do Cyan Searches (🔍)!',
    proDesc: 'Partitioned key-value/document store for high-throughput writes & reads.'
  },
  SEARCH_ENGINE: {
    type: 'SEARCH_ENGINE',
    category: 'DATA',
    proName: 'Elasticsearch Cluster',
    kidName: '🔍 Smart Index (Search)',
    cost: 110,
    upkeep: 14,
    baseCap: 25,
    baseLatencyMs: 16,
    color: '#06b6d4',
    emoji: '🔍',
    kidDesc: 'Built specifically to answer Cyan Search Bar queries (🔍) in 16ms!',
    proDesc: 'Inverted-index search engine. 3x faster than SQL LIKE queries.'
  },
  GPU_CLUSTER: {
    type: 'GPU_CLUSTER',
    category: 'COMPUTE',
    proName: 'H100 GPU Inference Node',
    kidName: '🤖 AI GPU Super-Brain',
    cost: 210,
    upkeep: 28,
    baseCap: 16,
    baseLatencyMs: 65,
    color: '#d946ef',
    emoji: '🤖',
    kidDesc: 'High-powered AI brain that answers Purple AI Chat Prompts (🤖)!',
    proDesc: 'Batched LLM token generation cluster for AI inference.'
  }
};

// ============================================================================
// 3. 5 PROGRESSIVE LEVELS (Combining SLA Latency Targets + School Analogies)
// ============================================================================
const CAMPAIGN_LEVELS = [
  {
    id: 1,
    chapter: 'Tier 1: The Garage Startup',
    title: 'Level 1: First Homework App',
    concept: 'Client → Stateless Server → Relational DB',
    kidStory: 'You launched a homework tracker for your school! Wire your App Worker (💻) to the Master Notebook (🗄️ SQL DB) and survive 25 requests while keeping response latency under 180ms.',
    schoolAnalogy: 'The App Worker (💻) is like a waiter taking orders, and the SQL Database (🗄️) is the kitchen cooking the food!',
    startBudget: 260,
    targetProcessed: 25,
    maxLatencySla: 180,
    baseRps: 6,
    trafficMix: { READ: 70, WRITE: 30 },
    unlockedTools: ['COMPUTE', 'SQL_DB'],
    initialNodes: [
      { id: 'src', type: 'INTERNET', x: 55, y: 200, tier: 1, health: 100 },
      { id: 'n1', type: 'COMPUTE', x: 300, y: 200, tier: 1, health: 100 },
      { id: 'n2', type: 'SQL_DB', x: 560, y: 200, tier: 1, health: 100 }
    ],
    initialEdges: [{ id: 'e1', from: 'src', to: 'n1' }],
    hint: 'Click "🔗 Wire" on the App Worker (💻), then click the Master Notebook (🗄️) to connect them. Hit START WAVE!'
  },
  {
    id: 2,
    chapter: 'Tier 1: Edge Offloading',
    title: 'Level 2: Viral School Meme Post',
    concept: 'CDN Edge Offloading & Object Storage',
    kidStory: 'A funny school meme went viral! 60% of traffic is now Green Photos & Videos (🖼️). SQL Databases CANNOT store media files! Add a Fast Photo Booth (⚡ CDN) at the front door to keep P99 latency under 110ms.',
    schoolAnalogy: 'Instead of making every student walk to the principal’s office for the exam schedule, pin a giant poster at the school gate (⚡ CDN)!',
    startBudget: 320,
    targetProcessed: 45,
    maxLatencySla: 110,
    baseRps: 12,
    trafficMix: { STATIC: 60, READ: 30, WRITE: 10 },
    unlockedTools: ['CDN', 'COMPUTE', 'STORAGE', 'SQL_DB'],
    initialNodes: [
      { id: 'src', type: 'INTERNET', x: 50, y: 200, tier: 1, health: 100 },
      { id: 'n1', type: 'COMPUTE', x: 340, y: 245, tier: 1, health: 100 },
      { id: 'n2', type: 'SQL_DB', x: 590, y: 245, tier: 1, health: 100 }
    ],
    initialEdges: [
      { id: 'e1', from: 'src', to: 'n1' },
      { id: 'e2', from: 'n1', to: 'n2' }
    ],
    hint: 'Place a "⚡ Fast Photo Booth (CDN)" and a "📦 Photo Locker (S3)". Wire Internet → CDN → App Worker, and App Worker → Photo Locker!'
  },
  {
    id: 3,
    chapter: 'Tier 2: Horizontal Scale & Caching',
    title: 'Level 3: Exam Results Stampede',
    concept: 'In-Memory Redis Caching & Read Replicas',
    kidStory: 'Exam results are out! 80% of requests are Blue Reads (📖) at 18 req/sec. A single SQL Database maxes out at 14 req/sec and its latency spikes! Place a Sticky-Note Cache (🧠) in front of your database.',
    schoolAnalogy: 'A Memory Cache (🧠) is like writing the top 10 math formulas on a sticky note on your desk so you answer in 3ms instead of searching a 500-page textbook!',
    startBudget: 360,
    targetProcessed: 70,
    maxLatencySla: 95,
    baseRps: 18,
    trafficMix: { READ: 80, WRITE: 20 },
    unlockedTools: ['CDN', 'LOAD_BALANCER', 'COMPUTE', 'CACHE', 'READ_REPLICA', 'SQL_DB'],
    initialNodes: [
      { id: 'src', type: 'INTERNET', x: 50, y: 200, tier: 1, health: 100 },
      { id: 'n1', type: 'COMPUTE', x: 280, y: 200, tier: 2, health: 100 },
      { id: 'n2', type: 'SQL_DB', x: 580, y: 200, tier: 1, health: 100 }
    ],
    initialEdges: [
      { id: 'e1', from: 'src', to: 'n1' },
      { id: 'e2', from: 'n1', to: 'n2' }
    ],
    hint: 'Add a "🧠 Sticky-Note Cache" and wire App Worker → Cache → SQL DB. The Cache absorbs 75% of Blue Reads in just 3ms!'
  },
  {
    id: 4,
    chapter: 'Tier 3: Security & Async Queues',
    title: 'Level 4: Rival School DDoS & Ticket Drop',
    concept: 'WAF Perimeter Defense, Search Index & Write Buffering',
    kidStory: 'A rival school launched Red DDoS Bots (👾) right during your fest ticket sale! Block the bots at the gate with a Security Bouncer (🛡️ WAF), and route Cyan Searches (🔍) to a Smart Index.',
    schoolAnalogy: 'A Firewall (🛡️) is the school gate guard checking ID cards so pranksters cannot jam the hallways!',
    startBudget: 490,
    targetProcessed: 95,
    maxLatencySla: 140,
    baseRps: 24,
    trafficMix: { MALICIOUS: 25, READ: 30, WRITE: 25, SEARCH: 20 },
    unlockedTools: ['FIREWALL', 'LOAD_BALANCER', 'COMPUTE', 'QUEUE', 'CACHE', 'SEARCH_ENGINE', 'NOSQL_DB', 'SQL_DB'],
    initialNodes: [
      { id: 'src', type: 'INTERNET', x: 45, y: 210, tier: 1, health: 100 },
      { id: 'c1', type: 'COMPUTE', x: 350, y: 210, tier: 2, health: 100 },
      { id: 'db1', type: 'SQL_DB', x: 620, y: 210, tier: 2, health: 100 }
    ],
    initialEdges: [],
    hint: 'Wire Internet → Security Bouncer (🛡️) → App Worker (💻). Then wire App Worker to Cache (🧠), Smart Index (🔍), and SQL DB (🗄️)!'
  },
  {
    id: 5,
    chapter: 'Tier 4: The AI & Chaos Wave',
    title: 'Level 5: Global AI Tutor Launch',
    concept: 'GPU Inference Routing & High Availability',
    kidStory: 'Your app now features a live AI Study Tutor! Route Purple AI Prompts (🤖) to an AI GPU Super-Brain while defending against hackers, caching reads, and surviving a Chaos Monkey test!',
    schoolAnalogy: 'Standard computers do basic arithmetic, but AI Chatbots need a dedicated Science Super-Lab (🤖 GPU Cluster) to generate answers!',
    startBudget: 780,
    targetProcessed: 130,
    maxLatencySla: 165,
    baseRps: 30,
    trafficMix: { AI_PROMPT: 30, READ: 25, STATIC: 20, WRITE: 15, MALICIOUS: 10 },
    unlockedTools: Object.keys(SERVICE_CATALOG).filter(k => k !== 'INTERNET'),
    initialNodes: [
      { id: 'src', type: 'INTERNET', x: 45, y: 210, tier: 1, health: 100 }
    ],
    initialEdges: [],
    hint: 'Build a complete pipeline: Internet → Security Bouncer (🛡️) → CDN (⚡) → Load Balancer (🚦) → App Workers (💻) → GPU Brain (🤖) + Cache (🧠) + SQL/NoSQL DB!'
  }
];

// ============================================================================
// 4. GRAPH ROUTING SOLVER
// ============================================================================
function canNodeResolveTraffic(nodeType, trafficType) {
  if (trafficType === 'MALICIOUS') return nodeType === 'FIREWALL';
  if (trafficType === 'STATIC') return nodeType === 'CDN' || nodeType === 'STORAGE';
  if (trafficType === 'READ') return ['CACHE', 'READ_REPLICA', 'SQL_DB', 'NOSQL_DB'].includes(nodeType);
  if (trafficType === 'WRITE') return ['SQL_DB', 'NOSQL_DB'].includes(nodeType);
  if (trafficType === 'SEARCH') return ['SEARCH_ENGINE', 'SQL_DB'].includes(nodeType);
  if (trafficType === 'AI_PROMPT') return nodeType === 'GPU_CLUSTER';
  return false;
}

function canPathResolve(startNodeId, trafficType, nodesMap, edges, visited = new Set()) {
  if (visited.has(startNodeId)) return false;
  visited.add(startNodeId);
  const node = nodesMap.get(startNodeId);
  if (!node || node.health <= 0) return false;
  if (canNodeResolveTraffic(node.type, trafficType)) return true;

  const outEdges = edges.filter(e => e.from === startNodeId);
  for (const edge of outEdges) {
    if (canPathResolve(edge.to, trafficType, nodesMap, edges, new Set(visited))) {
      return true;
    }
  }
  return false;
}

export default function App() {
  // Mode & Level State
  const [gameMode, setGameMode] = useState('CAMPAIGN'); // 'CAMPAIGN' | 'SURVIVAL' | 'SANDBOX'
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const currentLevel = CAMPAIGN_LEVELS[currentLevelIdx];

  // Topology State
  const [nodes, setNodes] = useState(CAMPAIGN_LEVELS[0].initialNodes);
  const [edges, setEdges] = useState(CAMPAIGN_LEVELS[0].initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState('n1');
  const [connectingFromId, setConnectingFromId] = useState(null);

  // Telemetry, SLA & Economy State (Best of V1 + V2)
  const [isRunning, setIsRunning] = useState(false);
  const [money, setMoney] = useState(CAMPAIGN_LEVELS[0].startBudget);
  const [reputation, setReputation] = useState(100);
  const [p99Latency, setP99Latency] = useState(42);
  const [processedCount, setProcessedCount] = useState(0);
  const [kidFriendlyMode, setKidFriendlyMode] = useState(true);
  const [autoRepair, setAutoRepair] = useState(false);

  // Custom Sandbox / Survival Sliders
  const [customRps, setCustomRps] = useState(16);
  const [customMix] = useState({
    STATIC: 20, READ: 35, WRITE: 20, SEARCH: 10, MALICIOUS: 10, AI_PROMPT: 5
  });

  // Feedback, Modals & GitHub Export Tabs
  const [failureBadges, setFailureBadges] = useState([]);
  const [coachMessage, setCoachMessage] = useState({
    type: 'info',
    title: '👋 Welcome to ArchQuest x CloudDefender!',
    text: CAMPAIGN_LEVELS[0].hint
  });
  const [levelStatus, setLevelStatus] = useState('PLAYING'); // 'PLAYING' | 'WON' | 'LOST'
  const [earnedStars, setEarnedStars] = useState(3);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubTab, setGithubTab] = useState('COMMANDS');
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeToolbarTab, setActiveToolbarTab] = useState('ALL');

  // Dragging refs
  const svgRef = useRef(null);
  const draggingNodeRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Reset or Switch Level/Mode
  const loadScenario = (mode, levelIndex = 0) => {
    setIsRunning(false);
    setConnectingFromId(null);
    setFailureBadges([]);
    setProcessedCount(0);
    setReputation(100);
    setP99Latency(38);
    setLevelStatus('PLAYING');

    if (mode === 'CAMPAIGN') {
      const lvl = CAMPAIGN_LEVELS[levelIndex];
      setNodes(lvl.initialNodes.map(n => ({ ...n, handledRps: 0, dropReason: null, nodeLatency: 0 })));
      setEdges(lvl.initialEdges.map(e => ({ ...e, flowRps: 0 })));
      setMoney(lvl.startBudget);
      setSelectedNodeId(lvl.initialNodes[1]?.id || 'src');
      setCoachMessage({
        type: 'info',
        title: `🎯 ${lvl.title} (${lvl.concept})`,
        text: lvl.hint
      });
    } else if (mode === 'SURVIVAL') {
      setNodes([
        { id: 'src', type: 'INTERNET', x: 50, y: 210, tier: 1, health: 100, handledRps: 0 },
        { id: 'fw1', type: 'FIREWALL', x: 230, y: 210, tier: 1, health: 100, handledRps: 0 },
        { id: 'c1', type: 'COMPUTE', x: 420, y: 210, tier: 1, health: 100, handledRps: 0 },
        { id: 'db1', type: 'SQL_DB', x: 630, y: 210, tier: 1, health: 100, handledRps: 0 }
      ]);
      setEdges([
        { id: 'e1', from: 'src', to: 'fw1', flowRps: 0 },
        { id: 'e2', from: 'fw1', to: 'c1', flowRps: 0 },
        { id: 'e3', from: 'c1', to: 'db1', flowRps: 0 }
      ]);
      setMoney(520);
      setCustomRps(12);
      setCoachMessage({
        type: 'info',
        title: '🔥 Endless Survival Mode',
        text: 'RPS ramps up every tick! Watch your P99 latency, repair degraded servers, and survive!'
      });
    } else {
      setNodes([{ id: 'src', type: 'INTERNET', x: 55, y: 210, tier: 1, health: 100, handledRps: 0 }]);
      setEdges([]);
      setMoney(9999);
      setCustomRps(22);
      setCoachMessage({
        type: 'info',
        title: '🧪 Free Sandbox Architect Lab',
        text: 'Infinite budget ($9,999) and all 12 cloud components unlocked! Test Chaos Monkey strikes and latency curves.'
      });
    }
  };

  // Chaos Monkey Feature (from V1!)
  const triggerChaosMonkey = () => {
    const breakable = nodes.filter(n => n.type !== 'INTERNET' && n.health > 0);
    if (breakable.length === 0) return;
    const victim = breakable[Math.floor(Math.random() * breakable.length)];
    const spec = SERVICE_CATALOG[victim.type];
    setNodes(prev =>
      prev.map(n =>
        n.id === victim.id
          ? { ...n, health: 0, dropReason: '🐒 CHAOS MONKEY CRASH! Click 🔧 Fix or route around!' }
          : n
      )
    );
    setCoachMessage({
      type: 'error',
      title: '🐒 Chaos Monkey Struck!',
      text: `Chaos Monkey took down "${kidFriendlyMode ? spec.kidName : spec.proName}"! Repair it immediately or use redundant nodes!`
    });
  };

  // ============================================================================
  // 5. SIMULATION ENGINE (Combines V1 Latency Math + V2 Packet Flow & Economy)
  // ============================================================================
  useEffect(() => {
    if (!isRunning || levelStatus !== 'PLAYING') return;

    const timer = setInterval(() => {
      const activeRps = gameMode === 'CAMPAIGN' ? currentLevel.baseRps : customRps;
      const activeMix = gameMode === 'CAMPAIGN' ? currentLevel.trafficMix : customMix;

      if (gameMode === 'SURVIVAL') {
        setCustomRps(prev => Math.min(95, +(prev + 0.35).toFixed(1)));
      }

      const nodesMap = new Map();
      nodes.forEach(n => {
        const spec = SERVICE_CATALOG[n.type];
        const tierMult = n.tier === 1 ? 1 : n.tier === 2 ? 1.75 : 2.6;
        nodesMap.set(n.id, {
          ...n,
          capacity: Math.round(spec.baseCap * tierMult),
          inFlows: { STATIC: 0, READ: 0, WRITE: 0, SEARCH: 0, MALICIOUS: 0, AI_PROMPT: 0 },
          handledRps: 0,
          droppedRps: 0,
          nodeLatency: spec.baseLatencyMs,
          dropReason: null
        });
      });

      const edgeFlows = new Map();
      edges.forEach(e => edgeFlows.set(e.id, { total: 0, byType: {} }));

      const srcNode = nodesMap.get('src');
      if (srcNode) {
        Object.entries(activeMix).forEach(([tType, pct]) => {
          if (pct > 0) srcNode.inFlows[tType] = (activeRps * pct) / 100;
        });
      }

      let tickMoneyEarned = 0;
      let tickRequestsSucceeded = 0;
      let tickRequestsFailed = 0;
      let tickMaliciousLeaked = 0;
      let weightedLatencySum = 0;
      let newBadges = [];

      const processedNodes = new Set();
      let queue = ['src'];

      for (let hop = 0; hop < 7; hop++) {
        const nextQueue = [];
        for (const nodeId of queue) {
          if (processedNodes.has(nodeId)) continue;
          const node = nodesMap.get(nodeId);
          if (!node) continue;
          processedNodes.add(nodeId);

          const totalIncoming = Object.values(node.inFlows).reduce((a, b) => a + b, 0);
          if (totalIncoming <= 0.05) continue;

          if (node.type !== 'INTERNET' && node.health <= 0) {
            node.droppedRps += totalIncoming;
            node.dropReason = '💥 CRASHED! Click 🔧 Fix!';
            tickRequestsFailed += totalIncoming;
            newBadges.push({ nodeId: node.id, x: node.x, y: node.y, text: '💥 CRASHED! Needs Repair!' });
            continue;
          }

          // V1 Exponential Saturation Latency Curve: Base / (1 - (Load/Cap)^2)
          const spec = SERVICE_CATALOG[node.type];
          const loadRatio = node.type === 'INTERNET' ? 0.1 : Math.min(0.94, totalIncoming / node.capacity);
          const actualNodeLatency = Math.round(
            spec.baseLatencyMs * (1 / (1 - Math.pow(loadRatio, 2) * 0.78))
          );
          node.nodeLatency = actualNodeLatency;

          let capacityFactor = 1;
          if (node.type !== 'INTERNET' && totalIncoming > node.capacity) {
            const overflow = totalIncoming - node.capacity;
            capacityFactor = node.capacity / totalIncoming;
            node.droppedRps += overflow;
            node.dropReason = `🔥 Overloaded (${Math.round(totalIncoming)}/${node.capacity} RPS)`;
            tickRequestsFailed += overflow;
            newBadges.push({
              nodeId: node.id,
              x: node.x,
              y: node.y,
              text: `🔥 Bottleneck! (${Math.round(totalIncoming)}/${node.capacity}/s)`
            });
          }

          node.handledRps = totalIncoming * capacityFactor;
          weightedLatencySum += actualNodeLatency * (node.handledRps / Math.max(1, activeRps));

          Object.entries(node.inFlows).forEach(([tType, rawAmount]) => {
            let amount = rawAmount * capacityFactor;
            if (amount <= 0.05) return;
            const tSpec = TRAFFIC_TYPES[tType];

            // Edge & Cache Interceptions
            if (node.type === 'FIREWALL' && tType === 'MALICIOUS') {
              tickMoneyEarned += amount * tSpec.reward;
              tickRequestsSucceeded += amount;
              return;
            }
            if (node.type === 'CDN' && tType === 'STATIC') {
              const hit = amount * 0.95;
              tickMoneyEarned += hit * tSpec.reward * 1.1;
              tickRequestsSucceeded += hit;
              amount *= 0.05;
            }
            if (node.type === 'CACHE' && tType === 'READ') {
              const hit = amount * 0.75;
              tickMoneyEarned += hit * tSpec.reward * 1.2;
              tickRequestsSucceeded += hit;
              amount *= 0.25;
            }

            // Terminal Storage / DB / AI Resolution
            const isTerminal =
              (node.type === 'STORAGE' && tType === 'STATIC') ||
              (node.type === 'READ_REPLICA' && tType === 'READ') ||
              (node.type === 'SQL_DB' && ['READ', 'WRITE', 'SEARCH'].includes(tType)) ||
              (node.type === 'NOSQL_DB' && ['READ', 'WRITE'].includes(tType)) ||
              (node.type === 'SEARCH_ENGINE' && tType === 'SEARCH') ||
              (node.type === 'GPU_CLUSTER' && tType === 'AI_PROMPT');

            if (isTerminal) {
              // SQL DB gets extra latency penalty on full-text SEARCH
              if (node.type === 'SQL_DB' && tType === 'SEARCH') {
                weightedLatencySum += 45;
              }
              tickMoneyEarned += amount * tSpec.reward;
              tickRequestsSucceeded += amount;
              return;
            }

            if (tType === 'MALICIOUS' && node.type !== 'INTERNET' && node.type !== 'FIREWALL') {
              tickMaliciousLeaked += amount;
              node.dropReason = '👾 DDoS Hit! Add Security Bouncer (WAF)!';
              newBadges.push({ nodeId: node.id, x: node.x, y: node.y, text: '👾 Hacker Bot Leaked!' });
              return;
            }

            const outEdges = edges.filter(e => e.from === node.id);
            if (outEdges.length === 0) {
              node.droppedRps += amount;
              tickRequestsFailed += amount;
              let msg = `Missing route for ${tSpec.emoji} ${kidFriendlyMode ? tSpec.kidName : tSpec.proName}`;
              if (node.type === 'SQL_DB' && tType === 'STATIC') {
                msg = '🗄️ SQL DB cannot store Photos! Add CDN or Photo Locker.';
              } else if (node.type === 'READ_REPLICA' && tType === 'WRITE') {
                msg = '📑 Read Replica cannot take Orange Writes!';
              } else if (node.type === 'SQL_DB' && tType === 'AI_PROMPT') {
                msg = '🗄️ SQL DB cannot run AI! Add an AI GPU Brain.';
              }
              node.dropReason = msg;
              newBadges.push({ nodeId: node.id, x: node.x, y: node.y, text: msg });
              return;
            }

            const smartEdges = outEdges.filter(e => canPathResolve(e.to, tType, nodesMap, edges));
            const targetEdges = smartEdges.length > 0 ? smartEdges : outEdges;
            const splitAmount = amount / targetEdges.length;

            targetEdges.forEach(edge => {
              const targetNode = nodesMap.get(edge.to);
              if (targetNode) {
                targetNode.inFlows[tType] = (targetNode.inFlows[tType] || 0) + splitAmount;
                const ef = edgeFlows.get(edge.id);
                if (ef) {
                  ef.total += splitAmount;
                  ef.byType[tType] = (ef.byType[tType] || 0) + splitAmount;
                }
                if (!nextQueue.includes(targetNode.id)) nextQueue.push(targetNode.id);
              }
            });
          });
        }
        queue = nextQueue;
      }

      // Upkeep & Wear
      let totalUpkeepPerTick = 0;
      nodesMap.forEach(n => {
        if (n.type === 'INTERNET') return;
        const spec = SERVICE_CATALOG[n.type];
        totalUpkeepPerTick += ((spec.upkeep * (1 + (n.tier - 1) * 0.4)) / 60) * 0.6;
        const util = n.handledRps / Math.max(1, n.capacity);
        const wear = util > 0.85 ? 2.0 : util > 0.45 ? 0.6 : 0.15;
        let nextHp = Math.max(0, n.health - wear);
        if (autoRepair && nextHp < 75 && money > 15) {
          nextHp = 100;
          totalUpkeepPerTick += spec.cost * 0.1;
        }
        n.health = +nextHp.toFixed(1);
      });

      const computedP99 = Math.max(12, Math.round(weightedLatencySum + (tickRequestsFailed > 0 ? 65 : 0)));
      setP99Latency(computedP99);

      setNodes(Array.from(nodesMap.values()));
      setEdges(prev =>
        prev.map(e => {
          const ef = edgeFlows.get(e.id) || { total: 0, byType: {} };
          let dominantType = 'READ';
          let maxVal = 0;
          Object.entries(ef.byType).forEach(([k, v]) => {
            if (v > maxVal) {
              maxVal = v;
              dominantType = k;
            }
          });
          return { ...e, flowRps: ef.total, dominantType };
        })
      );

      setFailureBadges(newBadges.slice(0, 4));

      const netCashDelta = (tickMoneyEarned - totalUpkeepPerTick) * 0.45;
      const newCompleted = Math.round(tickRequestsSucceeded * 0.35);

      setMoney(prev => +(prev + netCashDelta).toFixed(1));
      setProcessedCount(prev => {
        const updated = prev + newCompleted;
        if (gameMode === 'CAMPAIGN' && updated >= currentLevel.targetProcessed) {
          const stars =
            computedP99 <= currentLevel.maxLatencySla && reputation >= 90
              ? 3
              : computedP99 <= currentLevel.maxLatencySla * 1.25
                ? 2
                : 1;
          setEarnedStars(stars);
          setLevelStatus('WON');
          setIsRunning(false);
          setCoachMessage({
            type: 'success',
            title: `🏆 Level ${currentLevel.id} Cleared (${stars}/3 Stars)!`,
            text: `P99 Latency: ${computedP99}ms (Target <${currentLevel.maxLatencySla}ms). You mastered ${currentLevel.concept}!`
          });
        }
        return updated;
      });

      setReputation(prev => {
        let repDelta =
          tickRequestsSucceeded > 0 && tickRequestsFailed === 0 && tickMaliciousLeaked === 0
            ? 0.4
            : -(tickRequestsFailed / Math.max(5, activeRps)) * 3.0 - tickMaliciousLeaked * 1.8;
        const nextRep = Math.max(0, Math.min(100, +(prev + repDelta).toFixed(1)));
        if (gameMode !== 'SANDBOX' && (nextRep <= 0 || money < -250)) {
          setLevelStatus('LOST');
          setIsRunning(false);
        }
        return nextRep;
      });
    }, 600);

    return () => clearInterval(timer);
  }, [isRunning, nodes, edges, gameMode, currentLevel, customRps, customMix, autoRepair, money, levelStatus, kidFriendlyMode, reputation]);

  // ============================================================================
  // 6. NODE ACTIONS & DRAGGING
  // ============================================================================
  const handleAddService = (serviceType) => {
    const spec = SERVICE_CATALOG[serviceType];
    if (gameMode !== 'SANDBOX' && money < spec.cost) {
      setCoachMessage({
        type: 'warning',
        title: '💰 Insufficient Cloud Budget',
        text: `You need $${spec.cost} to deploy ${kidFriendlyMode ? spec.kidName : spec.proName}.`
      });
      return;
    }
    const newId = `n_${Date.now().toString().slice(-4)}`;
    const offset = (nodes.length % 5) * 30;
    if (gameMode !== 'SANDBOX') setMoney(prev => +(prev - spec.cost).toFixed(1));
    setNodes(prev => [
      ...prev,
      {
        id: newId,
        type: serviceType,
        x: 270 + offset,
        y: 100 + offset,
        tier: 1,
        health: 100,
        handledRps: 0,
        nodeLatency: spec.baseLatencyMs
      }
    ]);
    setSelectedNodeId(newId);
  };

  const handleUpgradeNode = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || node.tier >= 3) return;
    const spec = SERVICE_CATALOG[node.type];
    const cost = Math.round(spec.cost * 0.8 * node.tier);
    if (gameMode !== 'SANDBOX' && money < cost) return;
    if (gameMode !== 'SANDBOX') setMoney(prev => +(prev - cost).toFixed(1));
    setNodes(prev => prev.map(n => (n.id === nodeId ? { ...n, tier: n.tier + 1, health: 100 } : n)));
  };

  const handleRepairNode = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const spec = SERVICE_CATALOG[node.type];
    const cost = Math.max(5, Math.round(spec.cost * 0.15));
    if (gameMode !== 'SANDBOX' && money < cost) return;
    if (gameMode !== 'SANDBOX') setMoney(prev => +(prev - cost).toFixed(1));
    setNodes(prev => prev.map(n => (n.id === nodeId ? { ...n, health: 100, dropReason: null } : n)));
  };

  const handleDeleteNode = (nodeId) => {
    if (nodeId === 'src') return;
    const node = nodes.find(n => n.id === nodeId);
    if (node && gameMode !== 'SANDBOX') {
      setMoney(prev => +(prev + SERVICE_CATALOG[node.type].cost * 0.5).toFixed(1));
    }
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.from !== nodeId && e.to !== nodeId));
    setSelectedNodeId('src');
  };

  const handleNodeClick = (nodeId, e) => {
    e.stopPropagation();
    if (connectingFromId) {
      if (connectingFromId !== nodeId && nodeId !== 'src') {
        const exists = edges.some(ed => ed.from === connectingFromId && ed.to === nodeId);
        if (!exists) {
          setEdges(prev => [...prev, { id: `e_${Date.now()}`, from: connectingFromId, to: nodeId, flowRps: 0 }]);
        }
      }
      setConnectingFromId(null);
    } else {
      setSelectedNodeId(nodeId);
    }
  };

  const handleMouseDownNode = (nodeId, e) => {
    e.stopPropagation();
    if (connectingFromId || !svgRef.current) return;
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const rect = svgRef.current.getBoundingClientRect();
    draggingNodeRef.current = nodeId;
    dragOffsetRef.current = { x: e.clientX - rect.left - node.x, y: e.clientY - rect.top - node.y };
    setSelectedNodeId(nodeId);
  };

  const handleMouseMoveCanvas = (e) => {
    if (!draggingNodeRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const nx = Math.max(15, Math.min(rect.width - 175, e.clientX - rect.left - dragOffsetRef.current.x));
    const ny = Math.max(15, Math.min(rect.height - 105, e.clientY - rect.top - dragOffsetRef.current.y));
    setNodes(prev => prev.map(n => (n.id === draggingNodeRef.current ? { ...n, x: nx, y: ny } : n)));
  };

  const selectedNode = useMemo(
    () => nodes.find(n => n.id === selectedNodeId) || nodes[0],
    [nodes, selectedNodeId]
  );

  const availableServices = useMemo(() => {
    return Object.keys(SERVICE_CATALOG)
      .filter(k => k !== 'INTERNET')
      .filter(k => activeToolbarTab === 'ALL' || SERVICE_CATALOG[k].category === activeToolbarTab);
  }, [activeToolbarTab]);

  const activeTrafficMix = gameMode === 'CAMPAIGN' ? currentLevel.trafficMix : customMix;

  const githubFiles = {
    COMMANDS: `# 1. Scaffold a clean Vite + React project
npm create vite@latest archquest-cloud-defender -- --template react
cd archquest-cloud-defender

# 2. Install Lucide Icons & Tailwind CSS
npm install lucide-react tailwindcss @tailwindcss/vite

# 3. Replace src/App.jsx with this canvas code, then push to GitHub:
git init
git add .
git commit -m "feat: ArchQuest x CloudDefender System Design Game"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/archquest-cloud-defender.git
git push -u origin main`,
    PACKAGE: `{
  "name": "archquest-cloud-defender",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^1.16.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.0",
    "vite": "^6.0.0"
  }
}`,
    README: `# 🏰 ArchQuest x CloudDefender: System Design Game

An original interactive System Design & Cloud Architecture game built with React, SVG particle telemetry, and Tailwind CSS.

### ✨ Key Features
- **Dual Persona Toggle:** Switch seamlessly between **Class 10 Simple Mode** (School Analogies) and **Pro Cloud Architect Mode** (P99 Latency SLAs, Redis, Kafka, WAF, H100 GPUs).
- **Live Telemetry & Exponential Latency Math:** Real-time calculation of node saturation, P99 latency (ms), cache hit ratios, and health degradation.
- **Chaos Monkey Fault Injection:** Test high-availability topologies by randomly crashing active nodes mid-wave.`
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* =================================================================== */}
      {/* TOP TELEMETRY & NAVIGATION HEADER (Merged V1 + V2)                  */}
      {/* =================================================================== */}
      <header className="bg-slate-900/95 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-xl">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-white">
                ArchQuest <span className="text-indigo-400">×</span> CloudDefender
              </h1>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                100% Original Hybrid UI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive System Design & Tower-Defense Simulator
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="hidden lg:flex bg-slate-950 p-1 rounded-xl border border-slate-800 ml-2">
            {[
              { id: 'CAMPAIGN', label: '🎓 Campaign (5 Levels)' },
              { id: 'SURVIVAL', label: '🔥 Survival Wave' },
              { id: 'SANDBOX', label: '🧪 Sandbox Lab' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setGameMode(tab.id);
                  loadScenario(tab.id, currentLevelIdx);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${gameMode === tab.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live SLA & Economy Metrics (From V1 + V2) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Budget */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-semibold">Budget</div>
              <div className="text-xs font-extrabold text-emerald-400">${money.toFixed(0)}</div>
            </div>
          </div>

          {/* P99 Latency SLA (Brought back from V1!) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-semibold">
                P99 Latency {gameMode === 'CAMPAIGN' && `(SLA <${currentLevel.maxLatencySla}ms)`}
              </div>
              <div
                className={`text-xs font-extrabold ${gameMode === 'CAMPAIGN' && p99Latency > currentLevel.maxLatencySla
                  ? 'text-red-400 animate-pulse'
                  : 'text-cyan-300'
                  }`}
              >
                {p99Latency} ms
              </div>
            </div>
          </div>

          {/* Reputation / Uptime SLA */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-semibold">SLA Uptime</div>
              <div className="text-xs font-extrabold text-rose-300">{reputation}%</div>
            </div>
          </div>

          {/* Class 10 vs Pro Engineer Toggle */}
          <button
            onClick={() => setKidFriendlyMode(!kidFriendlyMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${kidFriendlyMode
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
              }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {kidFriendlyMode ? 'UI: Class 10 Simple' : 'UI: Pro Engineer'}
          </button>

          {/* Chaos Monkey Button (Brought back from V1!) */}
          <button
            onClick={triggerChaosMonkey}
            className="px-2.5 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 border border-orange-500/30 text-xs font-bold flex items-center gap-1"
            title="Test Fault Tolerance: Randomly crash a server!"
          >
            🐒 Chaos
          </button>

          {/* Start / Pause Wave */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all ${isRunning
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
              }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isRunning ? 'PAUSE' : 'START WAVE'}
          </button>

          <button
            onClick={() => loadScenario(gameMode, currentLevelIdx)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Reset Level"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowGithubModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-bold flex items-center gap-1.5"
          >
            <Code className="w-3.5 h-3.5 text-indigo-400" />
            Export GitHub
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* SUB-BAR: CAMPAIGN LEVEL STEPPER & COLORED PACKET MIX                */}
      {/* =================================================================== */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {gameMode === 'CAMPAIGN' ? (
            CAMPAIGN_LEVELS.map((lvl, idx) => (
              <button
                key={lvl.id}
                onClick={() => {
                  setCurrentLevelIdx(idx);
                  loadScenario('CAMPAIGN', idx);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${currentLevelIdx === idx
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
              >
                L{lvl.id}: {lvl.title.split(':')[1]}
              </button>
            ))
          ) : (
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-300">Ingress Traffic: {customRps} RPS</span>
              <input
                type="range"
                min="5"
                max="85"
                value={customRps}
                onChange={e => setCustomRps(+e.target.value)}
                className="w-28 accent-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Packet Color Legend */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-semibold mr-1">Traffic Mix:</span>
          {Object.entries(activeTrafficMix).map(([tType, pct]) => {
            if (!pct) return null;
            const spec = TRAFFIC_TYPES[tType];
            return (
              <span
                key={tType}
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${spec.badgeClass}`}
                title={spec.hint}
              >
                <span>{spec.emoji}</span>
                <span>{kidFriendlyMode ? spec.kidName : spec.id}: {pct}%</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3-COLUMN HYBRID WORKSPACE                                           */}
      {/* =================================================================== */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* LEFT COLUMN: MISSION BRIEF & COMPONENT PALETTE (3 Cols) */}
        <aside className="col-span-3 bg-slate-900/80 border-r border-slate-800 flex flex-col overflow-y-auto p-3 gap-3">
          {gameMode === 'CAMPAIGN' && (
            <div className="bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl p-3.5 shadow">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded">
                  {currentLevel.chapter}
                </span>
                <span className="text-xs font-extrabold text-amber-300">
                  {processedCount}/{currentLevel.targetProcessed} reqs
                </span>
              </div>
              <h2 className="font-extrabold text-sm text-white mt-1.5">{currentLevel.title}</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{currentLevel.kidStory}</p>
              <div className="mt-2.5 pt-2 border-t border-indigo-500/20 text-[11px] text-amber-200/90">
                <strong>💡 School Analogy:</strong> {currentLevel.schoolAnalogy}
              </div>
            </div>
          )}

          {/* Component Palette */}
          <div>
            <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-2 text-[10px] font-bold">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'EDGE', label: 'Edge' },
                { id: 'COMPUTE', label: 'Compute' },
                { id: 'ASYNC', label: 'Queue' },
                { id: 'DATA', label: 'Data' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveToolbarTab(t.id)}
                  className={`py-1 rounded-lg transition-all ${activeToolbarTab === t.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {availableServices.map(key => {
                const service = SERVICE_CATALOG[key];
                const isUnlocked = gameMode !== 'CAMPAIGN' || currentLevel.unlockedTools.includes(key);
                return (
                  <button
                    key={key}
                    disabled={!isUnlocked}
                    onClick={() => handleAddService(key)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${isUnlocked
                      ? 'bg-slate-950/90 hover:bg-slate-800/90 border-slate-800 hover:border-indigo-500/50 cursor-pointer'
                      : 'bg-slate-950/30 border-slate-900 opacity-40 cursor-not-allowed'
                      }`}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: `${service.color}20`, border: `1px solid ${service.color}55` }}
                    >
                      {isUnlocked ? service.emoji : '🔒'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-100 truncate">
                          {kidFriendlyMode ? service.kidName : service.proName}
                        </span>
                        <span className="text-xs font-extrabold text-emerald-400">${service.cost}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        {kidFriendlyMode ? service.kidDesc : service.proDesc}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-semibold">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                          Cap: {service.baseCap}/s
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                          ~{service.baseLatencyMs}ms
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: INTERACTIVE SVG ARCHITECTURE CANVAS (6 Cols) */}
        <main className="col-span-6 relative bg-slate-950 flex flex-col overflow-hidden">
          {/* Live AI Mentor Banner */}
          <div
            className={`mx-3 mt-3 px-3.5 py-2 rounded-xl border flex items-center justify-between gap-3 z-10 ${coachMessage.type === 'error'
              ? 'bg-red-950/80 border-red-500/50 text-red-200'
              : coachMessage.type === 'warning'
                ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
                : coachMessage.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-900/90 border-slate-700/80 text-slate-200'
              }`}
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="text-base">🧑‍🏫</span>
              <div>
                <span className="font-extrabold mr-1.5">{coachMessage.title}</span>
                <span className="text-slate-300">{coachMessage.text}</span>
              </div>
            </div>
            {connectingFromId && (
              <button
                onClick={() => setConnectingFromId(null)}
                className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-extrabold text-xs shrink-0 animate-bounce"
              >
                Click Target Node (or Cancel)
              </button>
            )}
          </div>

          <div className="flex-1 relative">
            <svg
              ref={svgRef}
              onMouseMove={handleMouseMoveCanvas}
              onMouseUp={() => {
                draggingNodeRef.current = null;
              }}
              onClick={() => setConnectingFromId(null)}
              className="w-full h-full cursor-crosshair"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.14) 1px, transparent 0)',
                backgroundSize: '28px 28px'
              }}
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
                </marker>
              </defs>

              {/* Wires & Animated Packet Particles */}
              {edges.map(edge => {
                const fromNode = nodes.find(n => n.id === edge.from);
                const toNode = nodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                const x1 = fromNode.x + 156;
                const y1 = fromNode.y + 44;
                const x2 = toNode.x;
                const y2 = toNode.y + 44;
                const cx1 = x1 + Math.max(40, (x2 - x1) * 0.45);
                const cx2 = x2 - Math.max(40, (x2 - x1) * 0.45);
                const pathData = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;

                const activeRpsOnEdge = edge.flowRps || 0;
                const domType = edge.dominantType || 'READ';
                const packetColor = TRAFFIC_TYPES[domType]?.color || '#3b82f6';

                return (
                  <g key={edge.id}>
                    <path
                      d={pathData}
                      fill="none"
                      stroke={activeRpsOnEdge > 0.2 ? packetColor : '#334155'}
                      strokeOpacity={activeRpsOnEdge > 0.2 ? 0.55 : 0.7}
                      strokeWidth={activeRpsOnEdge > 10 ? 4 : 2.5}
                      markerEnd="url(#arrow)"
                    />
                    {isRunning && activeRpsOnEdge > 0.2 && (
                      <>
                        <circle r="5" fill={packetColor}>
                          <animateMotion
                            dur={`${Math.max(0.4, 1.7 - activeRpsOnEdge * 0.04)}s`}
                            repeatCount="indefinite"
                            path={pathData}
                          />
                        </circle>
                        <circle r="4" fill={packetColor} opacity="0.75">
                          <animateMotion
                            dur={`${Math.max(0.4, 1.7 - activeRpsOnEdge * 0.04)}s`}
                            begin="0.45s"
                            repeatCount="indefinite"
                            path={pathData}
                          />
                        </circle>
                      </>
                    )}
                    <g
                      transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2 - 8})`}
                      className="cursor-pointer group"
                      onClick={e => {
                        e.stopPropagation();
                        setEdges(prev => prev.filter(ed => ed.id !== edge.id));
                      }}
                    >
                      <rect x="-28" y="-10" width="56" height="18" rx="6" fill="#0f172a" stroke="#334155" />
                      <text textAnchor="middle" y="2" className="text-[9px] fill-slate-300 font-bold group-hover:fill-red-400">
                        {activeRpsOnEdge > 0.1 ? `${Math.round(activeRpsOnEdge)}/s ✕` : 'wire ✕'}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map(node => {
                const spec = SERVICE_CATALOG[node.type];
                const isSelected = selectedNodeId === node.id;
                const isConnectingSource = connectingFromId === node.id;
                const tierMult = node.tier === 1 ? 1 : node.tier === 2 ? 1.75 : 2.6;
                const maxCap = Math.round(spec.baseCap * tierMult);
                const loadPct =
                  node.type === 'INTERNET'
                    ? 40
                    : Math.min(100, Math.round(((node.handledRps || 0) / maxCap) * 100));

                return (
                  <foreignObject
                    key={node.id}
                    x={node.x}
                    y={node.y}
                    width="162"
                    height="104"
                    className="overflow-visible"
                  >
                    <div
                      onMouseDown={e => handleMouseDownNode(node.id, e)}
                      onClick={e => handleNodeClick(node.id, e)}
                      className={`w-[156px] rounded-2xl p-2.5 bg-slate-900/95 border-2 transition-all shadow-xl cursor-grab active:cursor-grabbing ${isConnectingSource
                        ? 'border-amber-400 ring-4 ring-amber-400/30'
                        : isSelected
                          ? 'border-indigo-400 ring-2 ring-indigo-500/30'
                          : node.dropReason
                            ? 'border-red-500 animate-pulse'
                            : 'border-slate-700/90 hover:border-slate-500'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-base">{spec.emoji}</span>
                          <span className="text-[11px] font-extrabold text-white truncate">
                            {kidFriendlyMode ? spec.kidName.replace(/^[^\s]+\s/, '') : spec.proName}
                          </span>
                        </div>
                        {node.type !== 'INTERNET' && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                            T{node.tier}
                          </span>
                        )}
                      </div>

                      {node.type !== 'INTERNET' ? (
                        <div className="mt-1.5 space-y-1">
                          <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                            <span>{Math.round(node.handledRps || 0)}/{maxCap} rps</span>
                            <span className="text-cyan-300">{node.nodeLatency || spec.baseLatencyMs}ms</span>
                            <span className={node.health < 45 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                              {Math.round(node.health)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${loadPct > 90 ? 'bg-red-500' : loadPct > 70 ? 'bg-amber-400' : 'bg-cyan-400'
                                }`}
                              style={{ width: `${loadPct}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1.5 text-[10px] text-emerald-300 font-bold">
                          Ingress: {gameMode === 'CAMPAIGN' ? currentLevel.baseRps : customRps} req/sec
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between gap-1">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setConnectingFromId(connectingFromId === node.id ? null : node.id);
                          }}
                          className={`flex-1 py-0.5 px-1.5 rounded text-[9px] font-bold border transition-all ${isConnectingSource
                            ? 'bg-amber-400 text-slate-950 border-amber-300'
                            : 'bg-slate-800 hover:bg-indigo-600 text-slate-200 border-slate-700'
                            }`}
                        >
                          {isConnectingSource ? '📍 Target' : '🔗 Wire'}
                        </button>
                        {node.type !== 'INTERNET' && node.health < 90 && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleRepairNode(node.id);
                            }}
                            className="py-0.5 px-1.5 rounded text-[9px] font-bold bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/40"
                          >
                            🔧 Fix
                          </button>
                        )}
                      </div>
                    </div>
                  </foreignObject>
                );
              })}

              {/* Floating Failure Badges */}
              {failureBadges.map((b, i) => (
                <foreignObject
                  key={`${b.nodeId}_${i}`}
                  x={Math.max(10, b.x - 10)}
                  y={Math.max(5, b.y - 32)}
                  width="205"
                  height="30"
                >
                  <div className="px-2 py-0.5 rounded-lg bg-red-600/95 text-white text-[10px] font-extrabold shadow-lg border border-red-300 truncate animate-bounce">
                    {b.text}
                  </div>
                </foreignObject>
              ))}
            </svg>

            {/* Win / Loss Post-Mortem Overlay with 1-to-3 Star Grading */}
            {levelStatus !== 'PLAYING' && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-6 z-30">
                <div className="max-w-md w-full bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 text-center shadow-2xl">
                  <div className="text-4xl mb-2">
                    {levelStatus === 'WON' ? '⭐'.repeat(earnedStars) : '💥🚒'}
                  </div>
                  <h2 className="text-xl font-extrabold text-white">
                    {levelStatus === 'WON' ? `SLA Passed (${earnedStars}/3 Stars)!` : 'SLA Breached (System Outage)'}
                  </h2>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{coachMessage.text}</p>

                  {gameMode === 'CAMPAIGN' && (
                    <div className="mt-4 p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-left text-xs">
                      <div className="font-bold text-indigo-300 mb-1">
                        🎓 Key Takeaway ({currentLevel.concept}):
                      </div>
                      <p className="text-slate-300">{currentLevel.schoolAnalogy}</p>
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-center gap-3">
                    <button
                      onClick={() => loadScenario(gameMode, currentLevelIdx)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                    >
                      🔄 Replay
                    </button>
                    {levelStatus === 'WON' &&
                      gameMode === 'CAMPAIGN' &&
                      currentLevelIdx < CAMPAIGN_LEVELS.length - 1 && (
                        <button
                          onClick={() => {
                            const next = currentLevelIdx + 1;
                            setCurrentLevelIdx(next);
                            loadScenario('CAMPAIGN', next);
                          }}
                          className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs shadow-lg"
                        >
                          Next Level ➡️
                        </button>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT COLUMN: COMPONENT INSPECTOR & ROUTING GUIDE (3 Cols) */}
        <aside className="col-span-3 bg-slate-900/80 border-l border-slate-800 flex flex-col overflow-y-auto p-3 gap-3">
          {selectedNode && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  🔍 Node Telemetry Inspector
                </span>
                {selectedNode.id !== 'src' && (
                  <button
                    onClick={() => handleDeleteNode(selectedNode.id)}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Decommission (+50%)
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 mt-2">
                <div className="text-2xl">{SERVICE_CATALOG[selectedNode.type].emoji}</div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    {kidFriendlyMode
                      ? SERVICE_CATALOG[selectedNode.type].kidName
                      : SERVICE_CATALOG[selectedNode.type].proName}
                  </h3>
                  <span className="text-[11px] text-indigo-400 font-semibold">
                    {kidFriendlyMode
                      ? `Pro Term: ${SERVICE_CATALOG[selectedNode.type].proName}`
                      : `Simple Analogy: ${SERVICE_CATALOG[selectedNode.type].kidName}`}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {kidFriendlyMode
                  ? SERVICE_CATALOG[selectedNode.type].kidDesc
                  : SERVICE_CATALOG[selectedNode.type].proDesc}
              </p>

              {selectedNode.type !== 'INTERNET' && (
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Instance Tier:</span>
                    <span className="font-bold text-indigo-300">Tier {selectedNode.tier} / 3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Node Latency:</span>
                    <span className="font-bold text-cyan-300">
                      {selectedNode.nodeLatency || SERVICE_CATALOG[selectedNode.type].baseLatencyMs} ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Server Health:</span>
                    <span className="font-bold text-emerald-400">{Math.round(selectedNode.health)}%</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {selectedNode.tier < 3 && (
                      <button
                        onClick={() => handleUpgradeNode(selectedNode.id)}
                        className="py-2 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1"
                      >
                        <ArrowUpCircle className="w-3.5 h-3.5" />
                        Scale Up (${Math.round(SERVICE_CATALOG[selectedNode.type].cost * 0.8 * selectedNode.tier)})
                      </button>
                    )}
                    <button
                      onClick={() => handleRepairNode(selectedNode.id)}
                      className="py-2 px-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      Repair
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Traffic Routing Reference */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              🗺️ Packet Routing Matrix
            </h3>
            <div className="space-y-2 text-xs">
              {Object.values(TRAFFIC_TYPES).map(t => (
                <div key={t.id} className="p-2 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-start gap-2">
                  <span className="text-base">{t.emoji}</span>
                  <div className="flex-1">
                    <div className="font-bold text-slate-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                      <span>{kidFriendlyMode ? t.kidName : t.proName}</span>
                      <span className="text-[10px] text-emerald-400 ml-auto">+${t.reward}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t.hint}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* =================================================================== */}
      {/* MULTI-TAB GITHUB EXPORT MODAL (Brought back from V1!)               */}
      {/* =================================================================== */}
      {showGithubModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                Export Original Hybrid Game to GitHub
              </h2>
              <button
                onClick={() => setShowGithubModal(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Close ✕
              </button>
            </div>

            <div className="flex gap-2 mt-4">
              {[
                { id: 'COMMANDS', label: '1. git-commands.sh' },
                { id: 'PACKAGE', label: '2. package.json' },
                { id: 'README', label: '3. README.md' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setGithubTab(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${githubTab === t.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative mt-3">
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-300 overflow-x-auto font-mono text-xs leading-relaxed">
                {githubFiles[githubTab]}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(githubFiles[githubTab]);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 1800);
                }}
                className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 border border-slate-700"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}