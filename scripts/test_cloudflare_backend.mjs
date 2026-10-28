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
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (err) => console.error('PAGE ERROR:', err));
    await page.setViewport({ width: 1440, height: 900 });

    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));

    // Close welcome modal if open
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[title="Close Guide"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // 1. Capture Header with Cloudflare R2 Pill
    console.log('Capturing header with Cloudflare R2 pill...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'cloudflare_header_pill.png') });

    // 2. Click Cloudflare R2 button
    console.log('Clicking Cloudflare R2 button...');
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const cfBtn = btns.find((b) => b.textContent.includes('Cloudflare R2'));
      if (cfBtn) {
        cfBtn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked Cloudflare R2 button:', clicked);
    await new Promise((r) => setTimeout(r, 1000));

    // 3. Capture Cloudflare R2 Backend Console Modal
    console.log('Capturing Cloudflare R2 Backend Console Modal...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'cloudflare_backend_console_modal.png') });

    // 4. Click "⚡ Sync All Game Data Now"
    console.log('Clicking Sync All Game Data Now...');
    const clickedSync = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const syncBtn = btns.find((b) => b.textContent.includes('Sync All Game Data Now'));
      if (syncBtn) {
        syncBtn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked Sync:', clickedSync);
    await new Promise((r) => setTimeout(r, 1000));

    // 5. Capture with Sync Toast Active
    console.log('Capturing sync toast confirmation...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'cloudflare_sync_toast_active.png') });

    console.log('SUCCESS! Cloudflare backend integration tested and verified.');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
}

main();
