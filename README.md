<div align="center">

# ⚡ SYSTEM SAVIOUR ⚡
### *The High-Stakes Cloud Architecture & Wave-Defense Simulator*

**Stop reading boring system design textbooks. Start defending live systems.**

[![Play Online](https://img.shields.io/badge/🎮_PLAY_NOW-GitHub_Pages-6366f1?style=for-the-badge&logo=googlechrome&logoColor=white)](https://rajanskumarsoni.github.io/learning-by-playing/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-cyan.svg?style=for-the-badge)](CONTRIBUTING.md)
[![Zero Install](https://img.shields.io/badge/Zero_Install-Runs_in_Browser-amber.svg?style=for-the-badge)](https://rajanskumarsoni.github.io/learning-by-playing/)

---

### 👉 **[LAUNCH THE SIMULATOR NOW — 100% FREE IN YOUR BROWSER](https://rajanskumarsoni.github.io/learning-by-playing/)** 👈
*(Zero account required. Zero downloads. Zero lag.)*

---

</div>

## 💥 The Premise: Can You Keep The System Alive?

It’s 2:00 AM. Your startup just hit the front page of Hacker News, TikTok, and Reddit all at once. 

**Traffic surges from 500 RPS to 35,000 RPS in seconds.**
Servers start smoking. Databases deadlock. Latency skyrockets from 20ms to 4,500ms. And just when you think you have it under control... **Chaos Monkey unplugs an entire database rack.**

Welcome to **System Saviour** — an open-source, interactive distributed systems simulator disguised as an adrenaline-fueled cyberpunk wave-defense game. 

Instead of passive diagrams on a whiteboard, **you are the Lead Cloud Architect**. You drag, wire, and hot-patch live infrastructure while real-time packet physics test every single bottleneck in your design.

---

## 🎮 What Makes It Addictive?

### ⚡ 1. Real-Time Queuing & Latency Physics
Every request packet that enters your architecture is computed through real queuing theory math. Put a single SQL database behind 10,000 RPS? Watch the CPU saturation gauge turn red, queues back up, and requests crash into packet drop oblivion.

### 🛡️ 2. Build Your Defense Arsenal
Deploy and wire together real industry components:
- **Cloud CDN Edge**: Cache static assets and terminate 95% of read queries at the edge.
- **Layer 7 WAF & Rate Limiter**: Filter out malicious botnets, scraper swarms, and DDoS floods.
- **Load Balancers & Autoscaling Compute**: Distribute traffic evenly across stateless server tiers.
- **Redis In-Memory Caches**: Sub-millisecond reads that rescue your struggling database.
- **Kafka Asynchronous Message Streams**: Decouple spike writes so checkout services never choke.
- **Postgres Read Replicas & Connection Pooling**: Scale SQL reads across multiple standby nodes.
- **GPU Semantic Vector Clusters**: Power modern AI search and RAG pipelines at scale.

### 🤖 3. Ada AI — Your Real-Time Chief SRE Mentor
You’re never left guessing. When your cluster breaches its SLA, **Ada** (Chief SRE Architect) immediately flags the root cause:
> *“Warning, Architect! Ingress traffic is 1,200 RPS but your SQL Database caps at 350 RPS. Saturation is 100%. Latency is spiking exponentially. Insert a Redis Cache between the Web Tier and Database to absorb repeated read queries!”*

### 🔥 4. Chaos Monkey Strikes!
Think your architecture is flawless? Summon the **Chaos Monkey** button to randomly snip an instance in half. If you didn’t configure multi-AZ redundancy or auto-failover, watch your uptime plummet!

### 🎵 5. Procedural Warrior Battle Soundtrack
Equipped with a built-in, zero-dependency **Web Audio Synthesizer**, featuring custom ambient synthwave drones, tactile mechanical click effects, and an epic warrior battle theme soundtrack.

---

## 🏆 Game Modes

| Mode | The Challenge | Objective |
| :--- | :--- | :--- |
| **🎓 Campaign Mode** | **5 Progressive Crisis Scenarios** | Graduate from garage startup to global cloud enterprise with strict budgets, latency SLAs, and uptime targets. |
| **🔥 Survival Wave Mode** | **Infinite Escalating Chaos** | Traffic ramps up by **+2,500 RPS every wave** with random server outages and bot attacks. How many waves can you survive? |
| **🧪 Sandbox Lab** | **Unrestricted Supercomputer** | Zero budget caps, zero rules. Crank the live traffic slider to **35,000+ RPS** and design custom distributed systems. |

---

## 🎓 The 5 Campaign Scenarios

1. **Level 1: The Garage Startup**
   * *The Crisis:* Your tiny social app went viral! 800 RPS is choking your single SQL server.
   * *Core Concept:* Vertical compute scaling & In-memory Redis caching.

2. **Level 2: The Viral Blog Post**
   * *The Crisis:* Global readers are experiencing painful 800ms load times.
   * *Core Concept:* CDN Edge caching, SSL termination, and strict P99 latency SLAs.

3. **Level 3: Black Friday Flash Sale**
   * *The Crisis:* 3,500 checkout requests/sec are crushing your single API server.
   * *Core Concept:* Round-Robin Load Balancing, Stateless Compute Clusters & DB Read Replicas.

4. **Level 4: The Ticketmaster Drop Surge**
   * *The Crisis:* Scalper botnets and 8,000 RPS concurrent write spikes are causing database timeouts.
   * *Core Concept:* L7 WAF bot mitigation & Asynchronous Kafka event buffers.

5. **Level 5: Global AI Search Engine Launch**
   * *The Crisis:* A massive multi-region 18,000 RPS surge querying AI embeddings under active Chaos Monkey outages!
   * *Core Concept:* GPU Vector DB clusters, RAG caching & multi-AZ failover resilience.

---

## 🕹️ How to Play in 3 Simple Steps

```
[ 1. Inspect The Crisis ] ➔ [ 2. Deploy & Wire Nodes ] ➔ [ 3. Simulate Peak Wave ]
          ▼                               ▼                              ▼
  Read Ada's briefing &          Drag Cloud Services from       Hit "Simulate Peak Wave".
 SLA targets (P99 latency,      the catalog & click port dots    Watch live packet flow.
     budget, uptime %).          to connect the data wires.      Pass the SLA to win!
```

---

## 🛠️ Local Development (Run in 30 Seconds)

Want to run the game locally or hack on the simulation engine?

```bash
# 1. Clone the repo
git clone https://github.com/rajanskumarsoni/learning-by-playing.git
cd learning-by-playing

# 2. Install dependencies
npm install

# 3. Start dev server (with instant Hot Module Reloading)
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🤝 Open Source & Contributions Welcome!

**System Saviour is 100% free and open-source under the MIT License.**

We want this to be the most engaging, interactive way on the internet to master system design. We welcome PRs from developers, students, and cloud enthusiasts of all skill levels!

### 💡 Ideas You Can Build Today:
- 🗺️ **Add Level 6+**: Propose a new real-world scenario (e.g. *Uber Real-Time Driver Geohashing*, *Netflix Video Chunking*, *WhatsApp End-to-End Chat*).
- 🧩 **Add New Components**: Introduce Cassandra NoSQL, Elasticsearch, GraphQL Gateway, or AWS S3 Object Storage.
- 🎛️ **Enhance Simulation Physics**: Balance queuing math, connection pooling limits, or packet drop equations.
- 🎨 **UI & Sound Design**: Add custom particle effects, sound clips, or dark-mode themes.

👉 **Check out [CONTRIBUTING.md](CONTRIBUTING.md)** for our 3-minute guide to adding new levels and components!

---

## 📄 License

Distributed under the [MIT License](LICENSE). Feel free to use, modify, learn from, and share!

<div align="center">

**[⚡ Click Here to Play System Saviour in Your Browser Now ⚡](https://rajanskumarsoni.github.io/learning-by-playing/)**

*Crafted for system architects, by system architects.*

</div>


