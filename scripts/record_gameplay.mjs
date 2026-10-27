import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function recordCinematicLevel1() {
  console.log('Starting Cinematic Level 1 Gameplay Recording...');

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--window-size=1280,720',
      '--hide-scrollbars'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });

  await page.goto('http://localhost:5173/learning-by-playing/', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));

  // Dismiss welcome modal if open to reveal arena
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Close Guide"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Output video paths
  const publicOut = path.resolve('public/gameplay_demo.mp4');
  const srcOut = path.resolve('src/assets/gameplay_demo.mp4');

  // Spawn ffmpeg
  const ffmpeg = spawn('/opt/homebrew/bin/ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', '25',
    '-i', '-',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    publicOut
  ]);

  ffmpeg.stderr.on('data', () => {});

  const client = await page.target().createCDPSession();
  let frameCount = 0;

  client.on('Page.screencastFrame', async (event) => {
    try {
      const buffer = Buffer.from(event.data, 'base64');
      if (ffmpeg.stdin.writable) {
        ffmpeg.stdin.write(buffer);
        frameCount++;
      }
      await client.send('Page.screencastFrameAck', { sessionId: event.sessionId });
    } catch (e) {}
  });

  // Inject Virtual Cyber Glove Hand and Story Overlays
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.id = 'virtual-hand-styles';
    style.innerHTML = `
      #virtual-hand-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        z-index: 99999999;
        pointer-events: none;
      }
      #virtual-hand-body {
        position: absolute;
        width: 58px;
        height: 58px;
        transform: translate3d(640px, 360px, 0);
        filter: drop-shadow(0 12px 24px rgba(0,0,0,0.85));
        transition: transform 0.04s linear;
      }
      .hand-ripple {
        position: absolute;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 2px solid #22d3ee;
        background: rgba(34, 211, 238, 0.4);
        transform: translate(-22px, -22px) scale(0.2);
        animation: rippleAnim 0.45s ease-out forwards;
      }
      .hand-ripple-red {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.4);
      }
      .hand-ripple-green {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.45);
      }
      @keyframes rippleAnim {
        0% { transform: translate(-22px, -22px) scale(0.2); opacity: 1; }
        100% { transform: translate(-22px, -22px) scale(2.0); opacity: 0; }
      }
      #virtual-drag-ghost {
        position: absolute;
        top: 24px;
        left: 10px;
        background: rgba(15, 23, 42, 0.96);
        border: 2px solid #06b6d4;
        border-radius: 12px;
        padding: 8px 14px;
        box-shadow: 0 14px 35px rgba(6, 182, 212, 0.5);
        display: none;
        align-items: center;
        gap: 10px;
        color: white;
        font-family: system-ui, sans-serif;
        font-size: 11px;
        font-weight: bold;
        white-space: nowrap;
      }
      #story-alert-banner {
        position: fixed;
        top: 68px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999999;
        pointer-events: none;
        font-family: system-ui, sans-serif;
        padding: 6px 16px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 800;
        display: none;
        align-items: center;
        gap: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        transition: all 0.3s ease;
      }
      .story-alert-red {
        background: rgba(127, 29, 29, 0.95);
        border: 1.5px solid #ef4444;
        color: #fca5a5;
        box-shadow: 0 0 25px rgba(239, 68, 68, 0.6) !important;
      }
      .story-alert-green {
        background: rgba(6, 78, 59, 0.95);
        border: 1.5px solid #10b981;
        color: #6ee7b7;
        box-shadow: 0 0 25px rgba(16, 185, 129, 0.6) !important;
      }
      .node-danger-pulse {
        border-color: #ef4444 !important;
        box-shadow: 0 0 35px rgba(239, 68, 68, 0.9), inset 0 0 15px rgba(239, 68, 68, 0.3) !important;
        animation: dangerPulse 0.6s infinite alternate !important;
      }
      .node-success-pulse {
        border-color: #10b981 !important;
        box-shadow: 0 0 35px rgba(16, 185, 129, 0.85), inset 0 0 15px rgba(16, 185, 129, 0.3) !important;
      }
      @keyframes dangerPulse {
        from { transform: scale(1); }
        to { transform: scale(1.03); }
      }
    `;
    document.head.appendChild(style);

    const banner = document.createElement('div');
    banner.id = 'story-alert-banner';
    document.body.appendChild(banner);

    const container = document.createElement('div');
    container.id = 'virtual-hand-container';
    container.innerHTML = `
      <div id="virtual-hand-body">
        <svg id="hand-pointer-svg" viewBox="0 0 64 64" width="58" height="58">
          <g transform="rotate(-15 32 32)">
            <rect x="22" y="44" width="20" height="14" rx="4" fill="#0f172a" stroke="#06b6d4" stroke-width="2" />
            <line x1="24" y1="48" x2="40" y2="48" stroke="#22d3ee" stroke-width="2" />
            <circle cx="32" cy="53" r="2" fill="#10b981" />
            <path d="M22 28 C20 32, 20 42, 24 46 L40 46 C44 42, 44 32, 42 28 Z" fill="#f8fafc" stroke="#334155" stroke-width="2" />
            <rect x="28" y="24" width="7" height="12" rx="3.5" fill="#e2e8f0" stroke="#475569" stroke-width="1.5" />
            <rect x="35" y="26" width="7" height="11" rx="3.5" fill="#e2e8f0" stroke="#475569" stroke-width="1.5" />
            <rect x="41" y="30" width="6" height="9" rx="3" fill="#cbd5e1" stroke="#475569" stroke-width="1.5" />
            <path d="M22 34 C16 32, 16 26, 20 25 C23 24, 25 28, 25 32 Z" fill="#f8fafc" stroke="#475569" stroke-width="1.5" />
            <path id="hand-index-finger" d="M22 26 L22 8 C22 4, 28 4, 28 8 L28 26 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="2" />
            <circle cx="25" cy="7" r="3" fill="#ffffff" />
          </g>
        </svg>

        <svg id="hand-grab-svg" viewBox="0 0 64 64" width="58" height="58" style="display: none;">
          <g transform="rotate(-5 32 32)">
            <rect x="22" y="44" width="20" height="14" rx="4" fill="#0f172a" stroke="#06b6d4" stroke-width="2" />
            <line x1="24" y1="48" x2="40" y2="48" stroke="#22d3ee" stroke-width="2" />
            <circle cx="32" cy="53" r="2" fill="#f59e0b" />
            <ellipse cx="32" cy="34" rx="14" ry="12" fill="#f8fafc" stroke="#334155" stroke-width="2" />
            <rect x="20" y="26" width="6" height="12" rx="3" fill="#e2e8f0" stroke="#475569" stroke-width="1.5" />
            <rect x="26" y="23" width="7" height="14" rx="3.5" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5" />
            <rect x="33" y="23" width="7" height="14" rx="3.5" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5" />
            <rect x="40" y="26" width="6" height="12" rx="3" fill="#cbd5e1" stroke="#475569" stroke-width="1.5" />
            <path d="M18 36 C18 28, 28 28, 30 32 C30 36, 22 40, 18 36 Z" fill="#f8fafc" stroke="#475569" stroke-width="1.5" />
          </g>
        </svg>

        <div id="virtual-drag-ghost">
          <span style="font-size: 16px;">⚡</span>
          <div>
            <div style="font-weight: 800; color: #22d3ee;">Redis Cache</div>
            <div style="font-size: 9px; color: #94a3b8;">In-Memory 75% Hit Rate</div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    window.__cinematic = {
      curX: 640,
      curY: 360,
      setPos(x, y) {
        this.curX = x;
        this.curY = y;
        const b = document.getElementById('virtual-hand-body');
        if (b) b.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      },
      async moveTo(toX, toY, durationMs = 500) {
        const startX = this.curX;
        const startY = this.curY;
        const startTime = performance.now();
        return new Promise((resolve) => {
          const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / durationMs);
            const ease = progress < 0.5
              ? 4 * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            this.curX = startX + (toX - startX) * ease;
            this.curY = startY + (toY - startY) * ease;
            const b = document.getElementById('virtual-hand-body');
            if (b) b.style.transform = `translate3d(${this.curX}px, ${this.curY}px, 0)`;
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              resolve();
            }
          };
          requestAnimationFrame(step);
        });
      },
      click(type = 'default') {
        const r = document.createElement('div');
        r.className = `hand-ripple ${type === 'red' ? 'hand-ripple-red' : type === 'green' ? 'hand-ripple-green' : ''}`;
        r.style.left = `${this.curX}px`;
        r.style.top = `${this.curY}px`;
        document.getElementById('virtual-hand-container').appendChild(r);
        setTimeout(() => r.remove(), 450);
      },
      setGrab(grabbing) {
        const pointer = document.getElementById('hand-pointer-svg');
        const grab = document.getElementById('hand-grab-svg');
        const ghost = document.getElementById('virtual-drag-ghost');
        if (pointer) pointer.style.display = grabbing ? 'none' : 'block';
        if (grab) grab.style.display = grabbing ? 'block' : 'none';
        if (ghost) ghost.style.display = grabbing ? 'flex' : 'none';
      },
      showBanner(msg, type = 'red') {
        const b = document.getElementById('story-alert-banner');
        if (!b) return;
        b.innerHTML = msg;
        b.className = `story-alert-${type}`;
        b.style.display = 'flex';
      },
      hideBanner() {
        const b = document.getElementById('story-alert-banner');
        if (b) b.style.display = 'none';
      }
    };

    window.__cinematic.setPos(640, 360);
  });

  // Start Screencast
  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 90,
    maxWidth: 1280,
    maxHeight: 720,
    everyNthFrame: 1
  });

  console.log('Screencast recording live...');

  // =========================================================================
  // SCENE 1: The Impending Crash (RED STATE)
  // =========================================================================
  console.log('Scene 1: Impending crash under unbuffered SQL reads...');
  await new Promise((r) => setTimeout(r, 600));

  // Hand moves to Simulate Peak Wave button
  await page.evaluate(async () => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Simulate Peak Wave'));
    if (btn) {
      const rect = btn.getBoundingClientRect();
      await window.__cinematic.moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2, 700);
      window.__cinematic.click();
      btn.click();
    }
  });

  // Wait 1.5s as wave hits 800 RPS
  await new Promise((r) => setTimeout(r, 1800));

  // Now trigger RED DANGER STATE: Show server about to crash!
  await page.evaluate(() => {
    window.__cinematic.showBanner(
      '🚨 CRITICAL BOTTLENECK: Database Overloaded • Latency 248ms (SLA Breached!) • Server Crash Imminent!',
      'red'
    );
    const sqlNode = document.querySelector('[data-node-id="sql-1"]');
    if (sqlNode) sqlNode.classList.add('node-danger-pulse');
  });

  // Let the red crisis state be clearly seen for 3.5 seconds
  await new Promise((r) => setTimeout(r, 3500));

  // Hand moves to stop the wave so we can fix it
  await page.evaluate(async () => {
    const stopBtn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.innerText.includes('Stop Wave') || b.innerText.includes('Pause') || b.innerText.includes('Simulating')
    );
    if (stopBtn) {
      const rect = stopBtn.getBoundingClientRect();
      await window.__cinematic.moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2, 500);
      window.__cinematic.click('red');
      stopBtn.click();
    }
  });
  await new Promise((r) => setTimeout(r, 600));

  // =========================================================================
  // SCENE 2: The Hand Picks up Redis Cache and Drags into Canvas
  // =========================================================================
  console.log('Scene 2: Hand picking Redis Cache from palette and dragging into canvas...');

  await page.evaluate(() => {
    window.__cinematic.showBanner('🖐️ Architect Intervention: Deploying In-Memory Redis Cache...', 'red');
  });

  // Hand moves to left palette over Redis Cache card
  await page.evaluate(async () => {
    // Scroll palette down to ensure Redis Cache is visible
    const palette = document.querySelector('.overflow-y-auto');
    const cacheCard = document.querySelector('[data-component-type="CACHE"]');
    if (cacheCard) {
      cacheCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    await new Promise((r) => setTimeout(r, 300));

    const card = document.querySelector('[data-component-type="CACHE"]');
    if (card) {
      const rect = card.getBoundingClientRect();
      await window.__cinematic.moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2, 800);
    }
  });
  await new Promise((r) => setTimeout(r, 400));

  // Hand Grabs the Redis Cache!
  await page.evaluate(() => {
    window.__cinematic.setGrab(true);
    window.__cinematic.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  // Hand drags the Redis Cache across the palette dividing line onto the canvas!
  // Target position between Web Server and Database: approx (x: 520, y: 340)
  await page.evaluate(async () => {
    await window.__cinematic.moveTo(340, 420, 450);
    await window.__cinematic.moveTo(520, 340, 600);
  });
  await new Promise((r) => setTimeout(r, 300));

  // Hand drops the Redis Cache onto the canvas!
  await page.evaluate(async () => {
    window.__cinematic.setGrab(false);
    window.__cinematic.click('green');

    // Deploy the actual Redis Cache component to canvas
    const cacheDeploy = Array.from(document.querySelectorAll('button')).find((b) => {
      const card = b.closest('[data-component-type="CACHE"]');
      return card && b.innerText.includes('Deploy');
    });
    if (cacheDeploy) cacheDeploy.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  // =========================================================================
  // SCENE 3: Attaching Edges (Rewiring Web -> Cache -> SQL)
  // =========================================================================
  console.log('Scene 3: Rewiring edges with the virtual hand...');

  await page.evaluate(() => {
    window.__cinematic.showBanner('⚡ Attaching High-Speed Cache Wires: Web ➔ Redis ➔ SQL', 'green');
  });

  // Hand moves to the direct wire between web-1 and sql-1 and deletes it
  await page.evaluate(async () => {
    const oldEdge = document.querySelector('[data-edge-from="web-1"][data-edge-to="sql-1"]');
    if (oldEdge) {
      const rect = oldEdge.getBoundingClientRect();
      await window.__cinematic.moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2, 600);
      window.__cinematic.click('red');
      oldEdge.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });
  await new Promise((r) => setTimeout(r, 600));

  // Hand clicks Web Server output port
  await page.evaluate(async () => {
    const webOut = document.querySelector('[data-port-node="web-1"][data-port-type="out"]');
    if (webOut) {
      const rect = webOut.getBoundingClientRect();
      await window.__cinematic.moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2, 500);
      window.__cinematic.click();
      webOut.click();
    }
  });
  await new Promise((r) => setTimeout(r, 500));

  // Hand clicks Redis Cache input port
  await page.evaluate(async () => {
    // Find newly added cache node
    const cacheNode = Array.from(document.querySelectorAll('[data-node-id]')).find((n) =>
      n.getAttribute('data-node-id').includes('cache')
    );
    if (cacheNode) {
      const cacheIn = cacheNode.querySelector('[data-port-type="in"]');
      if (cacheIn) {
        const rect = cacheIn.getBoundingClientRect();
        await window.__cinematic.moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2, 500);
        window.__cinematic.click('green');
        cacheIn.click();
      }
    }
  });
  await new Promise((r) => setTimeout(r, 600));

  // Hand clicks Redis Cache output port
  await page.evaluate(async () => {
    const cacheNode = Array.from(document.querySelectorAll('[data-node-id]')).find((n) =>
      n.getAttribute('data-node-id').includes('cache')
    );
    if (cacheNode) {
      const cacheOut = cacheNode.querySelector('[data-port-type="out"]');
      if (cacheOut) {
        const rect = cacheOut.getBoundingClientRect();
        await window.__cinematic.moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2, 500);
        window.__cinematic.click();
        cacheOut.click();
      }
    }
  });
  await new Promise((r) => setTimeout(r, 500));

  // Hand clicks SQL Database input port
  await page.evaluate(async () => {
    const sqlIn = document.querySelector('[data-port-node="sql-1"][data-port-type="in"]');
    if (sqlIn) {
      const rect = sqlIn.getBoundingClientRect();
      await window.__cinematic.moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2, 500);
      window.__cinematic.click('green');
      sqlIn.click();
    }
  });
  await new Promise((r) => setTimeout(r, 700));

  // =========================================================================
  // SCENE 4: Turning GREEN! The System is Rescued!
  // =========================================================================
  console.log('Scene 4: Simulating with Redis Cache - Everything turning GREEN!');

  // Hand moves up to Simulate Peak Wave
  await page.evaluate(async () => {
    const simBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.innerText.includes('Simulate Peak Wave')
    );
    if (simBtn) {
      const rect = simBtn.getBoundingClientRect();
      await window.__cinematic.moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2, 600);
      window.__cinematic.click('green');
      simBtn.click();
    }
  });

  // Transform to vibrant green state
  await page.evaluate(() => {
    const sqlNode = document.querySelector('[data-node-id="sql-1"]');
    if (sqlNode) {
      sqlNode.classList.remove('node-danger-pulse');
      sqlNode.classList.add('node-success-pulse');
    }
    window.__cinematic.showBanner(
      '🟢 RESCUED: Redis Absorbing 75% of Read Queries! Latency Dropped to 38ms (SLA Passing!)',
      'green'
    );
  });

  // Hand moves aside to showcase the beautiful green telemetry and flowing traffic
  await page.evaluate(async () => {
    await window.__cinematic.moveTo(1080, 260, 800);
  });

  // Let the green simulation run to completion and trigger victory modal
  console.log('Waiting for wave completion and victory modal...');
  for (let i = 0; i < 18; i++) {
    await new Promise((r) => setTimeout(r, 500));
  }

  // =========================================================================
  // SCENE 5: VICTORY MODAL CELEBRATION!
  // =========================================================================
  console.log('Scene 5: Victory screen active! Celebrating level win...');

  await page.evaluate(() => {
    window.__cinematic.hideBanner();
  });

  // Hand moves to celebrate over the Victory modal!
  await page.evaluate(async () => {
    await window.__cinematic.moveTo(640, 480, 700);
    window.__cinematic.click('green');
  });

  // Hold on the celebratory victory screen for 4 seconds
  await new Promise((r) => setTimeout(r, 4000));

  console.log('Recording finished! Total frames captured:', frameCount);

  await client.send('Page.stopScreencast');
  await new Promise((r) => setTimeout(r, 600));

  ffmpeg.stdin.end();

  await new Promise((resolve) => {
    ffmpeg.on('close', resolve);
  });

  console.log('MP4 encoding complete! Copying to src/assets...');
  fs.copyFileSync(publicOut, srcOut);
  console.log('Cinematic gameplay video saved successfully to:', publicOut, srcOut);

  await browser.close();
}

recordCinematicLevel1().catch(console.error);
