# System Saviour: Interactive System Design Simulator

[![Play Online](https://img.shields.io/badge/🎮_Play_Online-GitHub_Pages-6366f1?style=for-the-badge)](https://rajanskumarsoni.github.io/learning-by-playing/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-cyan.svg?style=for-the-badge)](CONTRIBUTING.md)
[![Open Source Love](https://img.shields.io/badge/Open_Source-❤️-pink.svg?style=for-the-badge)](https://github.com/rajanskumarsoni/learning-by-playing)

> **Play Live Online:** [https://rajanskumarsoni.github.io/learning-by-playing/](https://rajanskumarsoni.github.io/learning-by-playing/)

**System Saviour** is an open-source, interactive distributed systems and cloud architecture simulator disguised as a cyberpunk tower-defense game. Design battle-hardened architectures, wire up caches and load balancers, survive malicious DDoS botnets, and conquer Chaos Monkey outages in real time!

---

## 🌐 Live Game
Play directly in your browser with zero installation:  
👉 **[https://rajanskumarsoni.github.io/learning-by-playing/](https://rajanskumarsoni.github.io/learning-by-playing/)**

---

## 🚀 Key Features

- **🎓 5 Progressive Campaign Scenarios + Unlimited Sandbox Mode**:
  1. *The Garage Startup*: Vertical scaling limits & in-memory caching (Redis).
  2. *The Viral Blog Post*: CDN Edge offloading & meeting strict P99 latency SLAs.
  3. *Flash Sale Checkout*: Load balancing, horizontal compute scaling & DB read replicas.
  4. *Ticketmaster Drop Spike*: Layer 7 WAF rate limiting & asynchronous Kafka write queues.
  5. *Global AI Search Launch*: GPU semantic vector search, RAG pipelines & Chaos Monkey resilience.
- **⚡ Real-Time Graph Simulation Engine**: Models live RPS traffic, queuing theory saturation curves, P99 latency penalties, and packet drop physics.
- **🤖 Ada AI Mentor**: Intelligent root-cause diagnostics explaining exactly *why* a bottleneck occurred and architectural best practices to resolve it.
- **🛡️ Interactive Chaos Monkey**: Manually snip servers or let automated chaos test system failover and high-availability design.
- **🎵 Zero-Dependency Web Audio Synthesizer**: Custom procedural audio engine generating synthwave drones and epic battle soundtrack themes.

---

## 🛠️ Quick Start (Local Development)

```bash
# 1. Clone the repository
git clone https://github.com/rajanskumarsoni/learning-by-playing.git
cd learning-by-playing

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production
```bash
npm run build
```

---

## 🤝 Open Source & Contributing

**System Saviour is 100% free, open-source, and community-driven!** Everyone is welcome to contribute.

Whether you're an experienced cloud architect, a software engineer preparing for system design interviews, or a student learning distributed computing, your ideas and PRs are wanted!

### 🌟 Great First Contribution Ideas:
- [ ] **Design New Scenarios**: Add Level 6+ (e.g., *WhatsApp End-to-End Chat*, *Uber Real-Time Geohashing*, *Netflix Video Streaming*).
- [ ] **Add New Cloud Components**: Introduce Cassandra NoSQL, Elasticsearch, GraphQL Federations, or Object Storage (S3/GCS).
- [ ] **Refine Simulation Math**: Tune queuing curves, failover delays, or cost formulas.
- [ ] **UI & Mobile Enhancements**: Add touch gesture shortcuts, dark/light themes, or custom wire animations.
- [ ] **New Audio Themes**: Add sound effects or soundtrack variations in `src/audioEngine.js`.

👉 **Check out the [CONTRIBUTING.md](CONTRIBUTING.md) guide** for detailed instructions on adding levels and components in under 5 minutes!

---

## 📜 Community & Code of Conduct

Please help us maintain a friendly, welcoming, and inclusive space by adhering to our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — you are free to use, modify, distribute, and build upon it!

