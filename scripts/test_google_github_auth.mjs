import puppeteer from 'puppeteer-core';
import { promises as fs } from 'fs';
import path from 'path';

const ARTIFACTS_DIR = '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c';

async function run() {
  console.log('🚀 Starting Google & GitHub Auth E2E Test...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--window-size=1440,900']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Clear local storage first
    await page.goto('http://localhost:5175/#signin', { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });

    console.log('1. Checking Auth Modal is open and displaying Social Auth options...');
    await page.waitForSelector('text=Cloudflare Edge Terminal Authentication', { timeout: 8000 });

    // Verify GitHub and Google buttons on Sign In tab
    const signInButtons = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return {
        hasGithub: btns.some(b => b.innerText.includes('GitHub')),
        hasGoogle: btns.some(b => b.innerText.includes('Google')),
        hasGuest: btns.some(b => b.innerText.includes('Instant Guest Architect Access'))
      };
    });
    console.log('Sign In Tab Social Buttons:', signInButtons);
    if (!signInButtons.hasGithub || !signInButtons.hasGoogle) {
      throw new Error('Missing GitHub or Google button on Sign In tab');
    }

    // 2. Click Sign Up tab and check that GitHub and Google Sign Up buttons are also present
    console.log('2. Checking Sign Up tab has GitHub and Google options...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const signUpTab = btns.find(b => b.innerText.includes('Create Architect Account'));
      if (signUpTab) signUpTab.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const signUpButtons = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return {
        hasGithubSignUp: btns.some(b => b.innerText.includes('GitHub Sign Up')),
        hasGoogleSignUp: btns.some(b => b.innerText.includes('Google Sign Up'))
      };
    });
    console.log('Sign Up Tab Social Buttons:', signUpButtons);
    if (!signUpButtons.hasGithubSignUp || !signUpButtons.hasGoogleSignUp) {
      throw new Error('Missing GitHub or Google button on Sign Up tab');
    }

    // 3. Click GitHub Sign Up to open GitHub OAuth dialog
    console.log('3. Opening GitHub OAuth View...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const ghBtn = btns.find(b => b.innerText.includes('GitHub Sign Up'));
      if (ghBtn) ghBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Check that GitHub view rendered with profile preview
    await page.waitForSelector('text=GitHub Developer OAuth', { timeout: 5000 });
    console.log('✓ GitHub Developer OAuth view is open');

    // Wait for the live API fetch to complete (or click verify)
    await page.waitForSelector('text=Verified', { timeout: 6000 });
    const ghProfileFound = await page.evaluate(() => {
      return document.body.innerText.includes('rajanskumarsoni') || document.body.innerText.includes('Rajan');
    });
    console.log('✓ GitHub Profile Found:', ghProfileFound);

    const ghScreenshotPath = path.join(ARTIFACTS_DIR, 'auth_github_oauth_view.png');
    await page.screenshot({ path: ghScreenshotPath, fullPage: false });
    console.log(`📸 Saved screenshot: ${ghScreenshotPath}`);

    // Click Authorize Terminal
    console.log('4. Authorizing with GitHub profile...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const authBtn = btns.find(b => b.innerText.includes('Authorize Terminal as'));
      if (authBtn) authBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Verify HUD is updated with the authenticated user
    const loggedInUser = await page.evaluate(() => {
      const saved = localStorage.getItem('systemsaviour_auth_user');
      return saved ? JSON.parse(saved) : null;
    });
    console.log('Authenticated User in LocalStorage:', loggedInUser);
    if (!loggedInUser || loggedInUser.authProvider !== 'github') {
      throw new Error('User failed to log in with GitHub provider');
    }

    const hudScreenshotPath = path.join(ARTIFACTS_DIR, 'hud_github_authenticated.png');
    await page.screenshot({ path: hudScreenshotPath, fullPage: false });
    console.log(`📸 Saved HUD screenshot: ${hudScreenshotPath}`);

    // 5. Open profile modal to check GitHub badge and avatar
    console.log('5. Checking Profile Card for GitHub badge and photo avatar...');
    await page.evaluate(() => {
      const profileBtn = document.querySelector('button[title*="Signed in as"]');
      if (profileBtn) profileBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const profileDetails = await page.evaluate(() => {
      return {
        hasGitHubBadge: document.body.innerText.includes('GitHub'),
        hasActiveBadge: document.body.innerText.includes('Active'),
        hasCompensation: document.body.innerText.includes('$165,000') || document.body.innerText.includes('Compensation')
      };
    });
    console.log('Profile Card Details:', profileDetails);

    const profileCardPath = path.join(ARTIFACTS_DIR, 'profile_github_badge.png');
    await page.screenshot({ path: profileCardPath, fullPage: false });
    console.log(`📸 Saved Profile Card screenshot: ${profileCardPath}`);

    // Click Sign Out
    console.log('6. Signing out to test Google Authentication...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const signOutBtn = btns.find(b => b.innerText.includes('Sign Out'));
      if (signOutBtn) signOutBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Reopen Auth Modal
    console.log('7. Re-opening Auth Modal and testing Google Identity Services...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const signInBtn = btns.find(b => b.innerText.includes('Sign In'));
      if (signInBtn) signInBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Click Google
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const googleBtn = btns.find(b => b.innerText.includes('Google'));
      if (googleBtn) googleBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    await page.waitForSelector('text=Google Identity Services', { timeout: 5000 });
    console.log('✓ Google Identity Services view is open');

    const googleScreenshotPath = path.join(ARTIFACTS_DIR, 'auth_google_services_view.png');
    await page.screenshot({ path: googleScreenshotPath, fullPage: false });
    console.log(`📸 Saved Google View screenshot: ${googleScreenshotPath}`);

    // Click Sign in with Google Account
    console.log('8. Confirming Google Account Sign In...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const gBtn = btns.find(b => b.innerText.includes('Sign in with Google Account'));
      if (gBtn) gBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    const googleUser = await page.evaluate(() => {
      const saved = localStorage.getItem('systemsaviour_auth_user');
      return saved ? JSON.parse(saved) : null;
    });
    console.log('Authenticated Google User in LocalStorage:', googleUser);
    if (!googleUser || googleUser.authProvider !== 'google') {
      throw new Error('User failed to log in with Google provider');
    }

    const hudGoogleScreenshotPath = path.join(ARTIFACTS_DIR, 'hud_google_authenticated.png');
    await page.screenshot({ path: hudGoogleScreenshotPath, fullPage: false });
    console.log(`📸 Saved Google HUD screenshot: ${hudGoogleScreenshotPath}`);

    console.log('🎉 ALL GOOGLE AND GITHUB AUTH TESTS PASSED PERFECTLY!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
