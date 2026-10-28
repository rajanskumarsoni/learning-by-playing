# Contributing to System Saviour ⚡

Welcome, Architect! Thank you for considering contributing to **System Saviour** — an open-source interactive distributed systems simulator.

Whether you are fixing a typo, balancing simulation latency formulas, designing a new campaign scenario, or adding a new cloud component (like Cassandra, GraphQL Gateway, or Snowflake), your contributions are deeply appreciated!

---

## 🌟 Ways to Contribute

1. **Design New Scenarios & Levels**: Add real-world system design challenges (e.g., WhatsApp Messaging, Uber Geohashing, Netflix CDN Streaming).
2. **Add New Cloud Components**: Introduce new architectural building blocks (e.g., gRPC Gateway, Elasticsearch cluster, Blob Storage).
3. **Refine Simulation Math**: Tune queuing theory, saturation curves, or latency calculation formulas.
4. **UI & Audio Design**: Enhance canvas interactions, sound effects, themes, or animations.
5. **Documentation & Educational Tutorials**: Clarify system design analogies, mentor guidance tips, or architectural cheat-sheets.

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Fork & Clone
```bash
# 1. Fork the repo on GitHub: https://github.com/rajanskumarsoni/learning-by-playing
# 2. Clone your fork locally:
git clone https://github.com/<your-username>/learning-by-playing.git
cd learning-by-playing

# 3. Add upstream remote:
git remote add upstream https://github.com/rajanskumarsoni/learning-by-playing.git
```

### 3. Install Dependencies & Run
```bash
# Install node packages
npm install

# Start local development server with Hot Module Reloading (HMR)
npm run dev
```

Visit `http://localhost:5173` in your browser. Any change you save in `src/` will instantly update live!

### 4. Build & Validate
Before committing, ensure the production bundle builds without errors:
```bash
npm run build
```

---

## 📐 Project Architecture Overview

The codebase is organized cleanly for easy extension:

```
learning-by-playing/
├── public/                 # Static assets (images, icons)
├── src/
│   ├── assets/             # Media assets (warrior theme, character art)
│   ├── App.jsx             # Main game logic, state machine & React canvas UI
│   │   ├── COMPONENT_CATALOG   # Specs for all available cloud components
│   │   ├── CAMPAIGN_LEVELS     # Scenario missions, targets, budgets & hints
│   │   └── evaluateArchitecture() # Real-time queuing and latency physics engine
│   ├── audioEngine.js      # Zero-dependency Web Audio API synthesizer
│   └── index.css           # Tailwind + Custom Cyberpunk Glassmorphic design tokens
└── .github/
    └── workflows/deploy.yml # Auto-deployment to GitHub Pages
```

---

## 💡 How-To Guides for Quick Contributions

### How to Add a New Campaign Level (Scenario)
In [`src/App.jsx`](src/App.jsx), locate the `CAMPAIGN_LEVELS` array. Append your new level object:

```javascript
{
  id: 'LEVEL_6',
  title: 'Level 6: Global Ride Hailing (Geohashing & Dispatch)',
  concept: 'Spatial Indexing & In-Memory Redis Geospatial',
  brief: 'Your ride-hailing startup is receiving 15,000 driver coordinate pings per second. Direct DB writes are timing out! Insert a Redis Geospatial Cache and a Kafka buffer to process location pings.',
  targetRps: 15000,
  maxLatencyMs: 120,
  minUptimePct: 99.5,
  maxBudgetHr: 500,
  allowedComponents: ['LB', 'WEB_TIER', 'REDIS_CACHE', 'SQL_DB', 'KAFKA_QUEUE'],
  beginnerAnalogy: 'Think of this like a postal dispatch center sorting letters by zip code before handing them to delivery drivers.',
  hints: [
    'Route location writes into Kafka first so the database does not lock up.',
    'Use Redis Geospatial cache to calculate driver-rider proximity in milliseconds.'
  ],
  initialNodes: [ ... ],
  initialConnections: [ ... ]
}
```

### How to Add a New Cloud Component
In [`src/App.jsx`](src/App.jsx), locate `COMPONENT_CATALOG`. Add your new component definition:

```javascript
CASSANDRA_DB: {
  type: 'CASSANDRA_DB',
  name: 'Cassandra NoSQL',
  category: 'Data',
  icon: Database,
  color: 'from-blue-600 to-indigo-700',
  description: 'Wide-column distributed NoSQL database with masterless peer-to-peer write scaling.',
  baseCapacity: 12000,
  baseLatency: 8,
  baseCost: 95,
  failureRate: 0.0005,
  configOptions: {
    replicationFactor: {
      label: 'Replication Factor',
      values: ['RF = 1 (Fastest, High Risk)', 'RF = 3 (Quorum Resilient)', 'RF = 5 (Multi-DC)']
    }
  },
  beginnerTip: 'A database that splits data across many servers so no single machine gets overloaded by writes.'
}
```

---

## 🌿 Git Branch & PR Workflow

1. **Create a branch** for your work:
   ```bash
   git checkout -b feature/new-level-geohashing
   ```
2. **Make your changes** and test locally (`npm run dev` and `npm run build`).
3. **Commit** using clear, descriptive messages:
   ```bash
   git commit -m "feat(levels): add Level 6 ride hailing geohash scenario"
   ```
4. **Push** to your fork:
   ```bash
   git push origin feature/new-level-geohashing
   ```
5. **Open a Pull Request** against `main` on the upstream repository. Fill out the PR template so reviewers know what changed.

---

## 🤝 Code of Conduct

Please review and adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). We are committed to providing a friendly, safe, and welcoming environment for everyone.

Have questions or need help? Feel free to open an Issue or start a Discussion on GitHub!
