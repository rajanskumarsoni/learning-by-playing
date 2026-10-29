import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACTS_DIR = '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c';

async function run() {
  console.log('🚀 Testing User Profile Button & Emerging Profile Pane...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  try {
    const page = await browser.newPage();

    // Set mock user first or test guest
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('systemsaviour_welcome_dismissed', 'true');
    });

    await page.goto('http://localhost:5175/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));

    // 1. Verify Profile Button exists in top-left
    console.log('1. Checking User Profile Button in top-left HUD...');
    const profileBtn = await page.waitForSelector('button[title="Click to open Architect Profile & Career Dossier"]', { timeout: 6000 });
    if (!profileBtn) throw new Error('Profile button not found in top-left header');

    const buttonDetails = await page.evaluate(() => {
      const btn = document.querySelector('button[title="Click to open Architect Profile & Career Dossier"]');
      return {
        text: btn ? btn.innerText.replace(/\n+/g, ' ') : null,
        hasAvatar: Boolean(btn?.querySelector('img') || btn?.querySelector('div')),
        hasChevron: Boolean(btn?.querySelector('svg'))
      };
    });
    console.log('Profile Button Details:', buttonDetails);

    const collapsedScreenshot = path.join(ARTIFACTS_DIR, 'hud_profile_button_collapsed.png');
    await page.screenshot({ path: collapsedScreenshot, fullPage: false });
    console.log(`📸 Saved collapsed profile button screenshot: ${collapsedScreenshot}`);

    // 2. Click the Profile Button to open the Emerging Profile Pane
    console.log('2. Clicking Profile Button to open Emerging Profile Pane...');
    await page.evaluate(() => {
      const btn = document.querySelector('button[title="Click to open Architect Profile & Career Dossier"]');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Verify pane is visible with all required details
    const paneDetails = await page.evaluate(() => {
      const pane = document.getElementById('emerging-profile-pane');
      if (!pane) return null;
      return {
        hasStanding: pane.innerText.includes('Current Standing') || pane.innerText.includes('Junior Systems Engineer') || pane.innerText.includes('Junior SRE'),
        hasSalary: pane.innerText.includes('Annual Base Pay') || pane.innerText.includes('$95,000') || pane.innerText.includes('$95k'),
        hasSupervisor: pane.innerText.includes('Direct Supervisor') || pane.innerText.includes('Kenji') || pane.innerText.includes('Daiki'),
        hasStats: pane.innerText.includes('Total XP') && pane.innerText.includes('Badges'),
        hasCareerDossierBtn: pane.innerText.includes('Inspect Career Dossier & Promotion SLA'),
        hasBadgesBtn: pane.innerText.includes('View Architect Badges & XP')
      };
    });
    console.log('Emerging Profile Pane Details:', paneDetails);
    if (!paneDetails || !paneDetails.hasStanding || !paneDetails.hasCareerDossierBtn) {
      throw new Error('Emerging profile pane did not render expected details');
    }

    const openScreenshot = path.join(ARTIFACTS_DIR, 'emerging_profile_pane_open.png');
    await page.screenshot({ path: openScreenshot, fullPage: false });
    console.log(`📸 Saved open profile pane screenshot: ${openScreenshot}`);

    // 3. Test clicking outside (canvas) closes the pane
    console.log('3. Testing click outside closes the pane...');
    await page.mouse.click(600, 400);
    await new Promise(r => setTimeout(r, 500));

    const isPaneClosed = await page.evaluate(() => {
      return !document.getElementById('emerging-profile-pane');
    });
    console.log('Pane closed on outside click:', isPaneClosed);
    if (!isPaneClosed) throw new Error('Profile pane failed to close on outside click');

    // 4. Test authenticated profile state (set real GitHub user)
    console.log('4. Testing Profile Button & Emerging Pane with Authenticated User...');
    await page.evaluate(() => {
      const user = {
        id: 'gh_rajan',
        name: 'Rajan kumar soni',
        handle: 'rajanskumarsoni',
        email: 'rajanskumarsoni@github.user',
        avatar: 'https://avatars.githubusercontent.com/u/10997744?v=4',
        role: 'GitHub Senior Architect',
        salary: '$165,000 / yr',
        authProvider: 'github'
      };
      localStorage.setItem('systemsaviour_auth_user', JSON.stringify(user));
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));

    const authButtonDetails = await page.evaluate(() => {
      const btn = document.querySelector('button[title="Click to open Architect Profile & Career Dossier"]');
      const img = btn?.querySelector('img');
      return {
        name: btn?.innerText.includes('Rajan kumar soni'),
        hasAvatarImg: Boolean(img && img.src.includes('avatars.githubusercontent.com')),
        role: btn?.innerText.includes('GitHub Senior Architect')
      };
    });
    console.log('Authenticated Profile Button:', authButtonDetails);
    if (!authButtonDetails.name || !authButtonDetails.hasAvatarImg) {
      throw new Error('Profile button did not display authenticated GitHub user');
    }

    // Open pane for authenticated user
    await page.evaluate(() => {
      const btn = document.querySelector('button[title="Click to open Architect Profile & Career Dossier"]');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const authPaneDetails = await page.evaluate(() => {
      const pane = document.getElementById('emerging-profile-pane');
      return {
        hasGitHubBadge: pane?.innerText.includes('GitHub'),
        hasManageAccountBtn: pane?.innerText.includes('Manage Account'),
        hasSignOutBtn: pane?.innerText.includes('Sign Out')
      };
    });
    console.log('Authenticated Profile Pane Details:', authPaneDetails);
    if (!authPaneDetails.hasGitHubBadge || !authPaneDetails.hasSignOutBtn) {
      throw new Error('Authenticated profile pane missing GitHub badge or Sign Out button');
    }

    const authScreenshot = path.join(ARTIFACTS_DIR, 'emerging_profile_pane_authenticated.png');
    await page.screenshot({ path: authScreenshot, fullPage: false });
    console.log(`📸 Saved authenticated profile pane screenshot: ${authScreenshot}`);

    console.log('🎉 ALL USER PROFILE PANE TESTS PASSED PERFECTLY!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
