import puppeteer from 'puppeteer-core';
import path from 'path';

const artifactsDir = '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c';

async function run() {
  console.log('🚀 Verifying Designation Button Click Behavior...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();

  // Reset to Level 0 (Level 1)
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('systemsaviour_welcome_dismissed', 'true');
    localStorage.setItem('systemsaviour_active_mode', 'CAMPAIGN');
    localStorage.setItem('systemsaviour_active_level', '0');
    localStorage.setItem('systemsaviour_unlocked_level', '0');
  });

  await page.goto('http://localhost:5175/', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1200));

  // Dismiss any welcome modal if open
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Close Guide"]') ||
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('✕'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // 1. Verify Level is Level 1 initially
  const initialLevel = await page.evaluate(() => {
    const modeBtn = document.querySelector('button[title*="switch Game Mode"]');
    return modeBtn ? modeBtn.innerText : '';
  });
  console.log('Initial Game Mode Pill Text:', initialLevel);
  if (!initialLevel.includes('Lvl 1/5')) {
    throw new Error('Expected initial level to be Level 1');
  }

  // 2. Click the Designation button in the HUD
  console.log('🔍 Clicking Designation / Salary Button in HUD...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const designationBtn = btns.find(b => b.title?.includes('Designation:') || b.innerText.includes('$95,000'));
    if (designationBtn) designationBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  // 3. Inspect the modal content
  const modalInfo = await page.evaluate(() => {
    const text = document.body.innerText.toLowerCase();
    const hasDossierTitle = text.includes('architect career dossier') || text.includes('current designation & standing');
    const hasCurrentSalary = text.includes('$95,000');
    const hasPromotionLocked = text.includes('promotion locked');
    const hasHowToEarn = text.includes('how to earn this promotion');
    const hasNoAutoPromoteBtn = !Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('Accept Promotion'));
    const hasReturnToArenaBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('Return to Arena'));
    return {
      hasDossierTitle,
      hasCurrentSalary,
      hasPromotionLocked,
      hasHowToEarn,
      hasNoAutoPromoteBtn,
      hasReturnToArenaBtn
    };
  });
  console.log('Designation Modal Inspection:', modalInfo);

  // Take screenshot
  const screenshotPath = path.join(artifactsDir, 'designation_details_modal.png');
  await page.screenshot({ path: screenshotPath });
  console.log(`📸 Saved designation details screenshot: ${screenshotPath}`);

  if (!modalInfo.hasPromotionLocked || !modalInfo.hasNoAutoPromoteBtn) {
    throw new Error('Designation modal should show promotion locked and have NO auto-promote button!');
  }

  // 4. Click Return to Arena button to close modal
  console.log('🔍 Clicking "Got It • Return to Arena" button...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const closeBtn = btns.find(b => b.innerText.includes('Return to Arena'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // 5. Verify the player is STILL on Level 1 (NOT promoted without playing!)
  const finalLevel = await page.evaluate(() => {
    const modeBtn = document.querySelector('button[title*="switch Game Mode"]');
    return modeBtn ? modeBtn.innerText : '';
  });
  console.log('Game Mode Pill Text after closing modal:', finalLevel);

  if (!finalLevel.includes('Lvl 1/5')) {
    throw new Error('Level was erroneously changed! Player should still be on Level 1.');
  }

  console.log('✅ Level remained Level 1 without unearned promotion!');
  await browser.close();
  console.log('🎉 Designation Button Inspection Verification PASSED!');
}

run().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
