import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c';

async function runTest() {
  console.log('Testing tight coupling: Web -> Worker in Sandbox...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    headless: true,
    args: ['--window-size=1600,1000', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  await page.goto('http://localhost:5175', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('systemsaviour_active_mode', 'SANDBOX');
    localStorage.setItem('systemsaviour_tutorial_completed', 'true');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 800));

  // Dismiss guide if open
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Close Guide"]') ||
      Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('✕'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  // Deploy an Async Worker Pool
  const deployed = await page.evaluate(() => {
    const card = document.querySelector('[data-component-type="WORKER"]');
    if (!card) return false;
    const btn = card.querySelector('button[title="Deploy to canvas"]');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Deployed Worker via Palette:', deployed);
  await new Promise((r) => setTimeout(r, 600));

  const workerNodeId = await page.evaluate(() => {
    const workerNode = Array.from(document.querySelectorAll('[data-node-id]')).find(el => {
      const id = el.getAttribute('data-node-id');
      return id && id.startsWith('worker-');
    });
    return workerNode ? workerNode.getAttribute('data-node-id') : null;
  });
  console.log('Found Worker Node ID:', workerNodeId);

  if (workerNodeId) {
    // Start wire from web-1 out port
    await page.evaluate(() => {
      const out = document.querySelector('button[data-port-node="web-1"][data-port-type="out"]');
      if (out) out.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    // Try to connect to worker input port
    await page.evaluate((wId) => {
      const inPort = document.querySelector(`button[data-port-node="${wId}"][data-port-type="in"]`);
      if (inPort) inPort.click();
    }, workerNodeId);
    await new Promise((r) => setTimeout(r, 800));

    const modalInfo = await page.evaluate(() => {
      const modal = document.querySelector('.glass-panel.border-2.border-rose-500\\/60');
      if (!modal) return null;
      return {
        title: modal.querySelector('h3')?.textContent,
        category: modal.querySelector('.font-mono')?.textContent,
        explanation: modal.querySelector('p')?.textContent
      };
    });
    console.log('Worker Coupling Violation Modal:', modalInfo);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'worker_coupling_violation.png') });
    console.log('Captured worker_coupling_violation.png');
  }

  await browser.close();
  console.log('Test completed successfully!');
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
