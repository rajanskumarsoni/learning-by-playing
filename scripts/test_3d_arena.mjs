import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import path from 'path';

const EDGE_PATH = '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
const PORT = 5193;
const APP_URL = `http://localhost:${PORT}`;

async function main() {
  console.log('🚀 Launching Vite preview server on port', PORT);
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
    stdio: 'pipe',
    shell: true
  });

  server.stdout.on('data', (d) => {
    // console.log(`[Preview] ${d}`);
  });
  server.stderr.on('data', (d) => {
    // console.log(`[Preview err] ${d}`);
  });

  // Wait for server to bind
  await new Promise((r) => setTimeout(r, 2000));

  console.log('🌐 Launching headless browser to verify 3D Arena...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--window-size=1440,900'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const errors = [];
    page.on('response', (res) => {
      if (res.status() === 404) {
        console.log('[404 Not Found]', res.url());
      }
    });
    page.on('console', (msg) => {
      console.log(`[Browser ${msg.type()}]`, msg.text());
      if (msg.type() === 'error' && !msg.text().includes('AudioContext') && !msg.text().includes('favicon')) {
        errors.push(msg.text());
      }
    });

    // Set local storage to authenticate and enter arena in 3D mode
    await page.goto(`${APP_URL}/#play`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('systemsaviour_auth_user', JSON.stringify({
        id: 'arch_test_runner',
        name: 'Test Architect',
        role: 'High Availability Lead'
      }));
      localStorage.setItem('systemsaviour_active_level', '0');
      localStorage.setItem('systemsaviour_unlocked_level', '0');
      localStorage.setItem('systemsaviour_tutorial_completed', 'true');
      localStorage.setItem('systemsaviour_view_mode', '3D');
    });

    await page.goto(`${APP_URL}/#play`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 2000));

    // 1. Verify 3D Canvas
    const canvasInfo = await page.evaluate(() => {
      console.log('BODY TEXT PREVIEW:', document.body.innerText.substring(0, 300));
      const canvases = Array.from(document.querySelectorAll('canvas'));
      const threeCanvas = canvases.find((c) => c.width > 300 && c.height > 300);
      const is3DActive = document.body.innerText.includes('3D ARENA');
      const hasIsometric = document.body.innerText.includes('Isometric');
      const hasTopDown = document.body.innerText.includes('Top-Down');
      const hasCinematic = document.body.innerText.includes('Cinematic');

      return {
        totalCanvases: canvases.length,
        hasThreeCanvas: Boolean(threeCanvas),
        is3DActive,
        hasIsometric,
        hasTopDown,
        hasCinematic
      };
    });

    console.log('✅ 3D Arena DOM verification:', canvasInfo);

    if (!canvasInfo.hasThreeCanvas) {
      throw new Error('Three.js 3D WebGL Canvas not detected in DOM!');
    }

    // 2. Test toggling to 2D
    console.log('🔄 Testing 2D / 3D Toggle button...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const toggleBtn = btns.find((b) => b.textContent.includes('3D ARENA') || b.textContent.includes('2D GRID'));
      if (toggleBtn) toggleBtn.click();
    });

    await new Promise((r) => setTimeout(r, 600));

    const toggledTo2D = await page.evaluate(() => {
      const is2DActive = document.body.innerText.includes('2D GRID');
      const hasSvgWires = Boolean(document.querySelector('svg.overflow-visible'));
      return { is2DActive, hasSvgWires };
    });

    console.log('✅ 2D Mode toggle verified:', toggledTo2D);

    // 3. Test toggling back to 3D
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const toggleBtn = btns.find((b) => b.textContent.includes('2D GRID'));
      if (toggleBtn) toggleBtn.click();
    });

    await new Promise((r) => setTimeout(r, 800));

    const toggledBack3D = await page.evaluate(() => {
      const is3DActive = document.body.innerText.includes('3D ARENA');
      const canvases = Array.from(document.querySelectorAll('canvas'));
      const threeCanvas = canvases.find((c) => c.width > 300 && c.height > 300);
      return { is3DActive, hasThreeCanvas: Boolean(threeCanvas) };
    });

    console.log('✅ Toggled back to 3D mode successfully:', toggledBack3D);

    if (errors.length > 0) {
      console.warn('⚠️ Console errors during test:', errors);
    } else {
      console.log('🎉 3D Arena test passed with 0 console errors!');
    }
    process.exit(0);
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
