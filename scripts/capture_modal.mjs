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
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));

    // Dismiss welcome guide
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[title="Close Guide"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    // Click Start Traffic Wave
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const simBtn = btns.find((b) => b.textContent.includes('Start Traffic') || b.textContent.includes('Simulate'));
      if (simBtn) simBtn.click();
    });

    console.log('Waiting 16 seconds for wave to complete...');
    await new Promise((r) => setTimeout(r, 16000));

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'authoritative_edge_verified_modal.png') });
    console.log('Saved authoritative_edge_verified_modal.png');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

main();
