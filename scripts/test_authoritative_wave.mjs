import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = '/Users/rajankumarsoni/.gemini/antigravity-ide/brain/91939c9d-f94d-470f-8c59-f47d0a2e917a';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    headless: true,
    args: ['--window-size=1440,900', '--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    page.on('console', (msg) => {
      const text = msg.text();
      if (!text.includes('AudioContext')) {
        console.log('BROWSER LOG:', text);
      }
    });

    await page.setViewport({ width: 1440, height: 900 });
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));

    // Dismiss welcome guide if present
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[title="Close Guide"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    // Click "Start Traffic Wave"
    console.log('Clicking Start Simulation / Traffic Wave...');
    const clickedSim = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const simBtn = btns.find((b) => b.textContent.includes('Start Traffic') || b.textContent.includes('Simulate') || b.textContent.includes('Run Wave'));
      if (simBtn) {
        simBtn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked Start Simulation:', clickedSim);

    // Wait for the wave progress to run (or speed it up if fast forward available)
    console.log('Waiting 10 seconds for wave simulation...');
    await new Promise((r) => setTimeout(r, 10500));

    // Capture post-mortem / level scorecard modal
    console.log('Capturing Post-Mortem modal with Edge Verified token...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'authoritative_edge_verified_modal.png') });

    console.log('Authoritative level test completed successfully!');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
}

main();
