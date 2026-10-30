import puppeteer from 'puppeteer-core';

async function testWelcomeScreenAfterAuth() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  console.log('1. Loading root URL with clean state...');
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  // Verify initial screen is AuthModal
  const authState = await page.evaluate(() => {
    const authHeading = document.querySelector('h2');
    const emailInput = document.querySelector('input[type="text"], input[type="email"]');
    const guestBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Continue as Guest Architect'));
    return {
      heading: authHeading ? authHeading.innerText : null,
      hasEmailInput: Boolean(emailInput),
      hasGuestBtn: Boolean(guestBtn)
    };
  });
  console.log('Initial Auth Screen State:', authState);
  await page.screenshot({ path: '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c/step1_initial_auth_screen.png' });

  // Click "Continue as Guest Architect"
  console.log('2. Clicking "Continue as Guest Architect"...');
  await page.evaluate(() => {
    const guestBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Continue as Guest Architect'));
    if (guestBtn) guestBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Verify Welcome Screen with Video, Game Modes & Briefing is now visible!
  const welcomeState = await page.evaluate(() => {
    const videoCard = document.getElementById('intro-video-card');
    const headerCard = document.getElementById('intro-header-card');
    const modesGrid = document.getElementById('intro-modes-grid');
    const videoEl = document.querySelector('video');
    const headings = Array.from(document.querySelectorAll('h2, h3, h4')).map(h => h.innerText);
    const modeCards = Array.from(document.querySelectorAll('span, div')).filter(el =>
      el.textContent && (
        el.textContent.includes('1. Campaign') ||
        el.textContent.includes('2. Daily Incident') ||
        el.textContent.includes('3. Survival') ||
        el.textContent.includes('4. Sandbox')
      )
    );

    return {
      hasHeaderCard: Boolean(headerCard),
      hasVideoCard: Boolean(videoCard),
      hasVideoElement: Boolean(videoEl),
      videoSrc: videoEl ? videoEl.currentSrc || videoEl.src : null,
      welcomeHeading: headings.find(h => h.includes('Welcome to System Saviour')),
      videoHeading: headings.find(h => h.includes('Level 1 Gameplay Walkthrough')),
      modeCount: modeCards.length
    };
  });
  console.log('Welcome Screen after Auth:', JSON.stringify(welcomeState, null, 2));

  await page.screenshot({ path: '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c/step2_welcome_modes_and_video_screen.png' });
  console.log('📸 Saved step2_welcome_modes_and_video_screen.png');

  // Verify clicking "Close Guide" enters the arena
  console.log('3. Clicking "Close Guide"...');
  await page.evaluate(() => {
    const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Close Guide'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const arenaState = await page.evaluate(() => {
    const header = document.querySelector('header');
    const canvas = document.querySelector('canvas') || document.querySelector('.react-flow');
    return {
      hasHeader: Boolean(header),
      hasCanvas: Boolean(canvas)
    };
  });
  console.log('Arena State after closing guide:', arenaState);
  await page.screenshot({ path: '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c/step3_arena_after_guide.png' });

  const passed = authState.hasGuestBtn && welcomeState.hasVideoCard && welcomeState.welcomeHeading && arenaState.hasHeader;
  console.log(`\nOVERALL TEST STATUS: ${passed ? '✅ PASSED 100%' : '❌ FAILED'}`);

  await browser.close();
  if (!passed) process.exit(1);
}

testWelcomeScreenAfterAuth().catch(err => {
  console.error(err);
  process.exit(1);
});
