import puppeteer from 'puppeteer-core';

async function runTest() {
  console.log('Testing valid connection: Web -> Kafka -> Worker...');
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

  // Deploy QUEUE (Kafka)
  await page.evaluate(() => {
    const card = document.querySelector('[data-component-type="QUEUE"]');
    if (card) {
      const btn = card.querySelector('button[title="Deploy to canvas"]');
      if (btn) btn.click();
    }
  });
  await new Promise((r) => setTimeout(r, 400));

  // Deploy WORKER
  await page.evaluate(() => {
    const card = document.querySelector('[data-component-type="WORKER"]');
    if (card) {
      const btn = card.querySelector('button[title="Deploy to canvas"]');
      if (btn) btn.click();
    }
  });
  await new Promise((r) => setTimeout(r, 400));

  const nodeIds = await page.evaluate(() => {
    const qNode = Array.from(document.querySelectorAll('[data-node-id]')).find(el => el.getAttribute('data-node-id')?.startsWith('queue-'));
    const wNode = Array.from(document.querySelectorAll('[data-node-id]')).find(el => el.getAttribute('data-node-id')?.startsWith('worker-'));
    return {
      qId: qNode?.getAttribute('data-node-id'),
      wId: wNode?.getAttribute('data-node-id')
    };
  });
  console.log('Deployed Nodes:', nodeIds);

  // Wire web-1 -> queue
  await page.evaluate((qId) => {
    const out = document.querySelector('button[data-port-node="web-1"][data-port-type="out"]');
    if (out) out.click();
    setTimeout(() => {
      const inPort = document.querySelector(`button[data-port-node="${qId}"][data-port-type="in"]`);
      if (inPort) inPort.click();
    }, 200);
  }, nodeIds.qId);
  await new Promise((r) => setTimeout(r, 600));

  // Wire queue -> worker
  await page.evaluate((ids) => {
    const out = document.querySelector(`button[data-port-node="${ids.qId}"][data-port-type="out"]`);
    if (out) out.click();
    setTimeout(() => {
      const inPort = document.querySelector(`button[data-port-node="${ids.wId}"][data-port-type="in"]`);
      if (inPort) inPort.click();
    }, 200);
  }, nodeIds);
  await new Promise((r) => setTimeout(r, 600));

  // Verify wires exist in DOM
  const edgesState = await page.evaluate((ids) => {
    const edges = Array.from(document.querySelectorAll('g[data-edge-id]')).map(g => ({
      from: g.getAttribute('data-edge-from'),
      to: g.getAttribute('data-edge-to')
    }));
    return {
      edges,
      hasWebToQueue: edges.some(e => e.from === 'web-1' && e.to === ids.qId),
      hasQueueToWorker: edges.some(e => e.from === ids.qId && e.to === ids.wId)
    };
  }, nodeIds);

  console.log('Edges Verification:', edgesState);

  await browser.close();
  console.log('Valid connections test complete!');
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
