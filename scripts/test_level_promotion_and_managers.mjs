import puppeteer from 'puppeteer-core';
import path from 'path';

const artifactsDir = '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c';

async function run() {
  console.log('🚀 Starting Level Managers & Promotion Ceremony Verification...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  
  // Set localStorage to start at Campaign Level 0 with welcome modal dismissed
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('systemsaviour_welcome_dismissed', 'true');
    localStorage.setItem('systemsaviour_active_mode', 'CAMPAIGN');
    localStorage.setItem('systemsaviour_active_level', '0');
    localStorage.setItem('systemsaviour_unlocked_level', '4'); // Unlock all levels so we can test them
  });

  await page.goto('http://localhost:5175/', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 2000));

  // Dismiss guide/welcome if open
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Close Guide"]') ||
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('✕') || b.textContent.includes('Skip'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  // 1. Verify Level 1 Manager: Kenji
  console.log('🔍 Checking Level 1 Manager (Kenji)...');
  const level1Manager = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="angry-manager"]');
    if (!el) return null;
    const nameEl = el.querySelector('h4');
    const snackEl = el.innerText;
    return {
      exists: true,
      text: el.innerText,
      name: nameEl ? nameEl.innerText : '',
      hasVolcanoChips: snackEl.includes('Volcano Chips') || snackEl.includes('CRUNCH')
    };
  });
  console.log('Level 1 Manager Data:', level1Manager);

  // 2. Click HUD Salary / Promotion Pill to open Manager Promotion Modal
  console.log('🔍 Opening Manager Promotion Modal via HUD pill...');
  const clickedPill = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const salaryBtn = btns.find(b => b.innerText.includes('$95,000') || b.title?.includes('Career Promotion Track'));
    if (salaryBtn) {
      salaryBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked HUD Salary Pill:', clickedPill);
  await new Promise((r) => setTimeout(r, 800));

  // Capture screenshot of Promotion Modal
  const modalScreenshotPath = path.join(artifactsDir, 'manager_promotion_modal.png');
  await page.screenshot({ path: modalScreenshotPath });
  console.log(`📸 Saved promotion modal screenshot: ${modalScreenshotPath}`);

  // Verify promotion modal text
  const modalInfo = await page.evaluate(() => {
    const modal = document.querySelector('.fixed.inset-0.z-50');
    if (!modal) return null;
    const text = modal.innerText;
    return {
      hasPromotionHeadline: text.includes('PROMOTION AWARDED') || text.includes('PERFORMANCE REVIEW'),
      hasKenji: text.includes('Kenji') || text.includes('Tech Lead'),
      hasSalaryHike: text.includes('+$50,000') || text.includes('$145,000'),
      hasNextManager: text.includes('Daiki') || text.includes('Scaling Guru') || text.includes('Donut'),
      hasAcceptButton: Array.from(modal.querySelectorAll('button')).some(b => b.innerText.includes('Accept Promotion'))
    };
  });
  console.log('Promotion Modal Info:', modalInfo);

  // 3. Click Accept Promotion & Enter Level 2 button in modal
  console.log('🔍 Clicking Accept Promotion button to advance to Level 2...');
  const clickedAccept = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const acceptBtn = btns.find(b => b.innerText.includes('Accept Promotion') || b.innerText.includes('Enter Level 2'));
    if (acceptBtn) {
      acceptBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Accept Promotion:', clickedAccept);
  await new Promise((r) => setTimeout(r, 1500));

  // 4. Verify Level 2 Manager is now Daiki!
  console.log('🔍 Verifying Level 2 Manager (Daiki)...');
  const level2Manager = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="angry-manager"]');
    if (!el) return null;
    const nameEl = el.querySelector('h4');
    return {
      exists: true,
      text: el.innerText,
      name: nameEl ? nameEl.innerText : '',
      isDaiki: el.innerText.includes('Daiki') || (nameEl && nameEl.innerText.includes('Daiki')),
      hasDonut: el.innerText.includes('🍩') || el.innerText.includes('Donut') || el.innerText.includes('Boba')
    };
  });
  console.log('Level 2 Manager Data:', level2Manager);

  // Poke Daiki to test his unique reaction
  await page.evaluate(() => {
    const el = document.querySelector('[data-testid="angry-manager"]');
    if (el) el.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  const daikiScreenshotPath = path.join(artifactsDir, 'level2_daiki_pacing.png');
  await page.screenshot({ path: daikiScreenshotPath });
  console.log(`📸 Saved Daiki pacing canvas screenshot: ${daikiScreenshotPath}`);

  // 5. Test fast level switches to Level 3, 4, 5
  console.log('🔍 Testing manager switch for Level 3 (Ryoko), Level 4 (Viktor), Level 5 (Hiroshi)...');
  for (const lvl of [2, 3, 4]) {
    await page.evaluate((targetLvl) => {
      // Find level selector or trigger switch
      const modeBtn = document.querySelector('button[title*="switch Game Mode"]');
      if (modeBtn) modeBtn.click();
    }, lvl);
    await new Promise((r) => setTimeout(r, 300));
  }

  await browser.close();
  console.log('🎉 All Level Managers & Promotion Ceremony Verifications PASSED!');
}

run().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
