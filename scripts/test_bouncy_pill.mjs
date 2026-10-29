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
  await new Promise(r => setTimeout(r, 600));

  // Dismiss welcome guide if present
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Close Guide"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Close Guide'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // 1. Collapsed state screenshot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'bouncy_pill_collapsed.png') });
  console.log('Saved bouncy_pill_collapsed.png');

  // 2. Hover over Ada circular button
  const adaBtn = await page.waitForSelector('button[title*="Quick Utilities"]');
  await adaBtn.hover();
  await new Promise(r => setTimeout(r, 350));

  // 3. Expanded state screenshot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'bouncy_pill_expanded.png') });
  console.log('Saved bouncy_pill_expanded.png');

  // 4. Click Presets button
  const clickedPresets = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pBtn = btns.find(b => b.textContent.includes('Presets'));
    if (pBtn) {
      pBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Presets:', clickedPresets);
  await new Promise(r => setTimeout(r, 400));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'presets_modal_opened.png') });
  console.log('Saved presets_modal_opened.png');

  await browser.close();
}

test().catch(err => {
  console.error('Error in test:', err);
  process.exit(1);
});

