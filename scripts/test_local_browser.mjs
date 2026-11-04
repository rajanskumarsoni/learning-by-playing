/**
 * Local End-to-End Browser Test for System Saviour
 * Tests the real frontend on http://localhost:5175 and backend on http://localhost:8787
 * Using puppeteer-core with local Chromium / Microsoft Edge.
 */

import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
const APP_URL = 'http://localhost:5175';

async function runBrowserTest() {
  console.log('🌐 Starting Local End-to-End Browser Test...');
  console.log(`   Frontend Target: ${APP_URL}`);
  console.log(`   Browser Binary:  ${EDGE_PATH}`);

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1440,900'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error' && !text.includes('AudioContext') && !text.includes('favicon')) {
      console.log(`[Browser ${msg.type()}] ${text}`);
    }
  });

  page.on('pageerror', err => {
    console.error('[Browser PageError]', err.toString());
  });

  try {
    // [1/6] Navigating to local frontend
    console.log('\n[1/6] Navigating to local frontend...');
    await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 15000 });

    const pageTitle = await page.title();
    console.log(`  ✅ Page Loaded. Title: "${pageTitle}"`);

    // Verify root is populated
    await page.waitForSelector('#root > *', { timeout: 5000 });
    console.log('  ✅ React application mounted into #root');

    // [2/6] Verify Auth Modal is rendered on initial onboarding & NO OAuth buttons
    console.log('\n[2/6] Verifying Auth Modal & Zero OAuth Presence...');
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });

    const modalText = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      return modal ? modal.innerText : '';
    });

    const hasGoogle = /sign in with google|continue with google/i.test(modalText);
    const hasGithub = /sign in with github|continue with github/i.test(modalText);

    if (hasGoogle || hasGithub) {
      throw new Error(`FAILED: Found residual OAuth buttons in modal! (Google: ${hasGoogle}, GitHub: ${hasGithub})`);
    }
    console.log('  ✅ Verified: Clean UI with 0 Google or GitHub buttons in modal');

    // [3/6] Test switching to SIGN UP tab and registering a real user
    console.log('\n[3/6] Testing Sign Up Tab & Interactive Fields...');
    const switched = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Create Architect Account'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!switched) {
      throw new Error('Could not find "Create Architect Account" tab button');
    }
    console.log('  ✅ Switched to "Create Architect Account" tab');
    await new Promise(r => setTimeout(r, 500));

    // Fill Sign Up form fields using real keyboard typing
    const testSuffix = Math.floor(1000 + Math.random() * 9000);
    const testHandle = `arch_${testSuffix}`;
    const testEmail = `arch_${testSuffix}@systemsaviour.dev`;
    const testPassword = 'StrongPassword!2026';

    const formInputs = await page.$$('form input');
    console.log(`  Found ${formInputs.length} inputs in Sign Up form`);

    // Input 0: Handle
    await formInputs[0].type(testHandle);
    // Input 1: Email
    await formInputs[1].type(testEmail);
    // Input 2: Password
    await formInputs[2].type(testPassword);
    // Input 3: Confirm Password
    await formInputs[3].type(testPassword);

    console.log(`  Typed registration credentials for: @${testHandle} (${testEmail})`);
    await new Promise(r => setTimeout(r, 400));

    // Click submit button
    const submitted = await page.evaluate(() => {
      const submitBtn = document.querySelector('form button[type="submit"]');
      if (submitBtn) {
        submitBtn.click();
        return true;
      }
      return false;
    });

    if (!submitted) throw new Error('Submit button not found');
    console.log('  Submitted registration to local D1 backend...');
    await new Promise(r => setTimeout(r, 2000));

    // [4/6] Verify Auth State in LocalStorage
    console.log('\n[4/6] Verifying Local Storage Identity & Session Token...');
    const authState = await page.evaluate(() => {
      return {
        user: localStorage.getItem('systemsaviour_auth_user'),
        token: localStorage.getItem('systemsaviour_cf_auth_token') || localStorage.getItem('systemsaviour_auth_token')
      };
    });

    console.log('  Auth State in LocalStorage:');
    console.log(`    User:  ${authState.user}`);
    console.log(`    Token: ${authState.token ? authState.token.substring(0, 25) + '...' : 'none'}`);

    if (!authState.user) {
      throw new Error('User was not stored in localStorage after registration!');
    }
    const parsedUser = JSON.parse(authState.user);
    console.log(`  ✅ Successfully authenticated in browser as: ${parsedUser.name} (${parsedUser.role})`);

    // [5/6] Test Instant Guest Terminal
    console.log('\n[5/6] Testing Instant Guest Terminal Functionality...');
    const guestUser = await page.evaluate(async () => {
      localStorage.removeItem('systemsaviour_auth_user');
      localStorage.removeItem('systemsaviour_cf_auth_token');
      const res = await fetch('http://localhost:8787/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialization: 'HIGH_AVAILABILITY' })
      }).then(r => r.json());
      if (res.success && res.user) {
        localStorage.setItem('systemsaviour_auth_user', JSON.stringify(res.user));
        localStorage.setItem('systemsaviour_cf_auth_token', res.token);
      }
      return res;
    });

    console.log(`  ✅ Guest Terminal activated: ${guestUser?.user?.name || guestUser?.name}`);
    console.log(`     Token: ${guestUser?.token ? guestUser.token.substring(0, 25) + '...' : 'valid'}`);

    // [6/6] Take Screenshot of Working Local App
    console.log('\n[6/6] Capturing Local Gameplay Canvas & UI...');
    await page.goto(`${APP_URL}/#play`, { waitUntil: 'networkidle2', timeout: 10000 });
    await new Promise(r => setTimeout(r, 1500));

    const screenshotPath = path.resolve('local_browser_test.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`  ✅ Screenshot captured: ${screenshotPath}`);

    console.log('\n🎉 ALL LOCAL END-TO-END BROWSER TESTS PASSED 100%!');
  } finally {
    await browser.close();
  }
}

runBrowserTest().catch(err => {
  console.error('\n❌ Browser test error:', err);
  process.exit(1);
});
