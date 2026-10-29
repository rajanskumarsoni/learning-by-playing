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

  // Step 1: Capture Collapsed State (Circular button visible, list hidden)
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'circular_button_collapsed.png') });
  console.log('Saved circular_button_collapsed.png');

  // Step 2: Hover on the circular button
  const circularBtn = await page.waitForSelector('button[title*="Quick Utilities"]');
  await circularBtn.hover();
  await new Promise(r => setTimeout(r, 300));

  // Step 3: Capture Expanded State (Full list expanded)
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'circular_button_expanded.png') });
  console.log('Saved circular_button_expanded.png');

  // Step 4: Click an item in the expanded list, e.g. "Leaderboard"
  const leaderboardBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.includes('Leaderboard'));
    if (b) {
      b.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Leaderboard button:', leaderboardBtn);
  await new Promise(r => setTimeout(r, 500));

  // Step 5: Capture Leaderboard Modal open
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'leaderboard_opened_from_expanded_list.png') });
  console.log('Saved leaderboard_opened_from_expanded_list.png');

  await browser.close();
}

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

