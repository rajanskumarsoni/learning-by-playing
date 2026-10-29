import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    headless: true,
    args: ['--window-size=1600,1000', '--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  await page.goto('http://localhost:5175', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 800));

  // Dismiss welcome guide if present
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Close Guide"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Close Guide'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Measure header layout & wrapping metrics
  const metrics = await page.evaluate(() => {
    const header = document.querySelector('header');
    const hRect = header.getBoundingClientRect();
    const children = Array.from(header.children).map(c => {
      const r = c.getBoundingClientRect();
      return { tag: c.tagName, width: r.width, height: r.height, top: r.top, bottom: r.bottom };
    });
    return {
      headerHeight: hRect.height,
      children
    };
  });
  console.log('Header Metrics at 1600px Viewport:');
  console.log(JSON.stringify(metrics, null, 2));

  // Take screenshot of closed state
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'header_streamlined_closed.png') });
  console.log('Saved header_streamlined_closed.png');

  // Open mode selector dropdown
  await page.evaluate(() => {
    const btn = document.querySelector('button[title*="switch Game Mode"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Take screenshot of open dropdown
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'header_streamlined_open.png') });
  console.log('Saved header_streamlined_open.png');

  await browser.close();
}

test().catch(err => {
  console.error('Error running test:', err);
  process.exit(1);
});

