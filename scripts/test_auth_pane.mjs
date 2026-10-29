import puppeteer from 'puppeteer-core';
import path from 'path';

const artifactsDir = '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c';

async function run() {
  console.log('🚀 Starting Sign In / Sign Up Pane Verification...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  
  // Clear any existing session to test fresh state
  await page.evaluateOnNewDocument(() => {
    localStorage.removeItem('systemsaviour_auth_user');
  });

  // 1. Navigate with #signin hash to directly open the Auth Modal
  console.log('🔍 Navigating to http://localhost:5175/#signin...');
  await page.goto('http://localhost:5175/#signin', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));

  // Verify background characters and glass pane exist
  const authPaneElements = await page.evaluate(() => {
    const hero = document.querySelector('img[alt="System Saviour Hero"]');
    const devil = document.querySelector('img[alt="Chaos Outage Devil"]');
    const heroBadge = document.body.innerText.includes('Architect Hero') && document.body.innerText.includes('High Availability Guardian');
    const devilBadge = document.body.innerText.includes('Chaos Devil') && document.body.innerText.includes('Outages & Chaos Demon');
    const title = document.body.innerText.includes('System Saviour Identity') || document.body.innerText.includes('Terminal Authentication');
    const hasSignInTab = document.body.innerText.includes('Sign In');
    const hasSignUpTab = document.body.innerText.includes('Create Account');
    const hasGuestBtn = document.body.innerText.includes('Instant Guest Architect Access');
    return {
      hasHero: Boolean(hero),
      hasDevil: Boolean(devil),
      heroBadge,
      devilBadge,
      title,
      hasSignInTab,
      hasSignUpTab,
      hasGuestBtn
    };
  });
  console.log('Auth Pane & First Page Background Inspection:', authPaneElements);

  // Take screenshot of Sign In view
  const signInScreenshotPath = path.join(artifactsDir, 'auth_signin_pane.png');
  await page.screenshot({ path: signInScreenshotPath });
  console.log(`📸 Saved Sign In pane screenshot: ${signInScreenshotPath}`);

  // 2. Switch to Sign Up tab
  console.log('🔍 Switching to Create Account (Sign Up) tab...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const signUpTab = btns.find(b => b.innerText.includes('Create Account'));
    if (signUpTab) signUpTab.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Type in password to test password strength meter
  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    const handleInput = inputs.find(i => i.placeholder?.includes('CyberArchitect'));
    const emailInput = inputs.find(i => i.placeholder?.includes('architect@domain.com'));
    const pwdInputs = inputs.filter(i => i.type === 'password' || i.placeholder?.includes('••••'));
    
    if (handleInput) {
      handleInput.value = 'QuantumArchitect';
      handleInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (emailInput) {
      emailInput.value = 'quantum@systemsaviour.dev';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (pwdInputs.length >= 2) {
      pwdInputs[0].value = 'SuperSecureP@ss123!';
      pwdInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      pwdInputs[1].value = 'SuperSecureP@ss123!';
      pwdInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise((r) => setTimeout(r, 600));

  const signUpState = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasStrengthMeter: text.includes('Security Strength') || text.includes('Production Ready') || text.includes('Strong'),
      hasPasswordMatch: text.includes('✓ Match'),
      hasSpecialization: text.includes('High Availability & SRE') && text.includes('Throughput & Scaling')
    };
  });
  console.log('Sign Up Form State & Password Strength:', signUpState);

  // Take screenshot of Sign Up view
  const signUpScreenshotPath = path.join(artifactsDir, 'auth_signup_pane.png');
  await page.screenshot({ path: signUpScreenshotPath });
  console.log(`📸 Saved Sign Up pane screenshot: ${signUpScreenshotPath}`);

  // 3. Switch back to Sign In and trigger Instant Guest Architect Access
  console.log('🔍 Clicking Instant Guest Architect Access to authenticate...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const signInTab = btns.find(b => b.innerText.includes('Sign In') && !b.innerText.includes('Authenticate'));
    if (signInTab) signInTab.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const guestBtn = btns.find(b => b.innerText.includes('Instant Guest Architect Access'));
    if (guestBtn) guestBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));

  // Verify User is logged in and header shows user pill
  const loggedInState = await page.evaluate(() => {
    const text = document.body.innerText;
    const hasGuestUser = text.includes('GuestArchitect') || text.includes('Active');
    return {
      hasGuestUser,
      headerHasUser: Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('GuestArchitect'))
    };
  });
  console.log('Logged In Terminal State:', loggedInState);

  // Re-open auth modal to capture logged-in profile card
  await page.evaluate(() => {
    const userBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('GuestArchitect'));
    if (userBtn) userBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  const profileScreenshotPath = path.join(artifactsDir, 'auth_profile_card.png');
  await page.screenshot({ path: profileScreenshotPath });
  console.log(`📸 Saved logged-in profile screenshot: ${profileScreenshotPath}`);

  await browser.close();
  console.log('🎉 Sign In & Sign Up Pane Verification COMPLETE!');
}

run().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
