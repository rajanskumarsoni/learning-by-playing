/**
 * Wait until wave completes and inspect victory modals
 */
import puppeteer from 'puppeteer-core';

const EDGE_PATH = '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
const APP_URL = 'http://localhost:5175';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const winningNodes = [
    { id: 'src', type: 'CLIENT_SRC', label: 'Global Traffic Source', x: 80, y: 300, config: { concurrency: 800 } },
    { id: 'web-1', type: 'WEB', label: 'Primary Web Cluster', x: 380, y: 300, config: { size: 'c6i.xlarge', count: 2, maxRpsPerInstance: 600 } },
    { id: 'cache-1', type: 'CACHE', label: 'Redis Cache Cluster', x: 680, y: 300, config: { hitRatio: 0.85, memoryMb: 1024 } },
    { id: 'db-1', type: 'DB_SQL', label: 'PostgreSQL Primary', x: 980, y: 300, config: { size: 'db.t3.large', iops: 1000 } }
  ];
  const winningEdges = [
    { id: 'e1', from: 'src', to: 'web-1' },
    { id: 'e2', from: 'web-1', to: 'cache-1' },
    { id: 'e3', from: 'cache-1', to: 'db-1' }
  ];

  await page.goto(`${APP_URL}/#play`, { waitUntil: 'networkidle2' });
  await page.evaluate(({ nodes, edges }) => {
    localStorage.setItem('systemsaviour_auth_user', JSON.stringify({ id: 'u1', name: 'Tester', role: 'Architect' }));
    localStorage.setItem('systemsaviour_active_level', '0');
    localStorage.setItem('systemsaviour_unlocked_level', '0');
    localStorage.setItem('systemsaviour_tutorial_completed', 'true');
    localStorage.setItem('systemsaviour_arch_CAMPAIGN_0', JSON.stringify({ nodes, edges, savedAt: Date.now() }));
  }, { nodes: winningNodes, edges: winningEdges });

  await page.goto(`${APP_URL}/#play`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Clicking SIMULATE PEAK WAVE and switching to 4x speed...');
  await page.evaluate(() => {
    const simBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('SIMULATE PEAK WAVE'));
    if (simBtn) simBtn.click();
    const btn4x = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === '4x');
    if (btn4x) btn4x.click();
  });

  console.log('Waiting for wave completion...');
  let completed = false;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 500));
    const isDone = await page.evaluate(() => {
      const simBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('SIMULAT'));
      return !simBtn; // Button text reverts or modal appears
    });
    if (isDone) {
      console.log(`Simulation finished at ${(i + 1) * 0.5}s!`);
      completed = true;
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));

  const modals = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('.fixed.inset-0'));
    return els.map((el, i) => ({
      index: i,
      className: el.className,
      snippet: el.innerText.trim().substring(0, 160).replace(/\n/g, ' '),
      buttons: Array.from(el.querySelectorAll('button')).map(b => b.innerText.trim().replace(/\n/g, ' '))
    }));
  });

  console.log('\n--- ACTIVE MODALS IN DOM UPON LEVEL 1 WIN ---');
  console.dir(modals, { depth: 4 });

  // Now click the accept / next level button
  console.log('\nClicking action button...');
  const clickedBtn = await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const b = allButtons.find(btn => 
      btn.innerText.includes('Accept Promotion') || 
      btn.innerText.includes('View Level 2') ||
      btn.innerText.includes('Level 2:') ||
      btn.innerText.includes('Next Level')
    );
    if (b) {
      b.click();
      return b.innerText;
    }
    return null;
  });
  console.log('Clicked button text:', clickedBtn);

  await new Promise(r => setTimeout(r, 1000));

  const modalsAfter = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('.fixed.inset-0'));
    return els.map((el, i) => ({
      index: i,
      className: el.className,
      snippet: el.innerText.trim().substring(0, 160).replace(/\n/g, ' '),
      buttons: Array.from(el.querySelectorAll('button')).map(b => b.innerText.trim().replace(/\n/g, ' '))
    }));
  });

  console.log('\n--- ACTIVE MODALS AFTER CLICKING ACTION BUTTON ---');
  console.dir(modalsAfter, { depth: 4 });

  await browser.close();
}

run().catch(console.error);
