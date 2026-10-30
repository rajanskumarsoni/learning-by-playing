import puppeteer from 'puppeteer-core';

const ARTIFACTS_DIR = '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c';

async function runAuthFlowTest() {
  console.log('🚀 Starting Comprehensive Authentication Flow Debug Test...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  try {
    const page = await browser.newPage();
    page.on('console', msg => {
      const txt = msg.text();
      if (!txt.includes('AudioContext') && !txt.includes('React DevTools')) {
        console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, txt);
      }
    });

    // Clean state
    await page.goto('http://localhost:5175/', { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:5175/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));

    // 1. Inspect Default Landing View (Sign In)
    console.log('1. Inspecting Default Sign In Terminal UI...');
    const signInUI = await page.evaluate(() => {
      const googleBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Google'));
      const ghBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('GitHub'));
      const emailInput = document.querySelector('input[placeholder="neo@systemsaviour.dev"]');
      const passwordInput = document.querySelector('input[placeholder="••••••••••••"]');
      const guestBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Continue as Guest Architect'));
      const hero = document.querySelector('img[alt="System Saviour Hero"]');
      const devil = document.querySelector('img[alt="Chaos Outage Devil"]');

      return {
        hasGoogleBtn: Boolean(googleBtn),
        hasGhBtn: Boolean(ghBtn),
        hasEmailInput: Boolean(emailInput),
        hasPasswordInput: Boolean(passwordInput),
        hasGuestBtn: Boolean(guestBtn),
        hasHero: Boolean(hero),
        hasDevil: Boolean(devil)
      };
    });

    console.log('Sign In UI Elements:', signInUI);
    if (!signInUI.hasGoogleBtn || !signInUI.hasGhBtn || !signInUI.hasEmailInput || !signInUI.hasGuestBtn) {
      throw new Error('Sign In UI is missing critical elements!');
    }
    await page.screenshot({ path: `${ARTIFACTS_DIR}/auth_debug_1_signin_redesigned.png` });
    console.log('📸 Saved auth_debug_1_signin_redesigned.png');

    // 2. Test Google Auth Flow
    console.log('2. Clicking Google Auth button...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Google'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const googleChooser = await page.evaluate(() => {
      const chooserTitle = document.body.textContent.includes('Sign in with Google');
      const rajanOption = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('rajan.soni@gmail.com'));
      const fellowOption = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Google Cloud Fellow'));
      return {
        hasTitle: chooserTitle,
        hasRajanOption: Boolean(rajanOption),
        hasFellowOption: Boolean(fellowOption)
      };
    });
    console.log('Google Account Chooser State:', googleChooser);
    if (!googleChooser.hasTitle || !googleChooser.hasRajanOption) {
      throw new Error('Google Account Chooser did not render properly!');
    }
    await page.screenshot({ path: `${ARTIFACTS_DIR}/auth_debug_2_google_account_picker.png` });
    console.log('📸 Saved auth_debug_2_google_account_picker.png');

    // Click "Rajan Soni" to authenticate via Google
    console.log('2b. Selecting Rajan Soni Google Account to authenticate...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('rajan.soni@gmail.com'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    // Verify authenticated in HUD
    const googleAuthStatus = await page.evaluate(() => {
      const hud = document.querySelector('header');
      const name = hud ? hud.textContent.includes('Rajan Soni') : false;
      const role = hud ? (hud.textContent.includes('Google Cloud') || hud.textContent.includes('Architect')) : false;
      const saved = localStorage.getItem('systemsaviour_auth_user');
      const user = saved ? JSON.parse(saved) : null;
      return {
        nameInHud: name,
        roleInHud: role,
        userSaved: Boolean(user),
        provider: user?.authProvider
      };
    });
    console.log('Google Authentication Status in HUD:', googleAuthStatus);
    if (!googleAuthStatus.nameInHud || googleAuthStatus.provider !== 'google') {
      throw new Error('Failed to complete Google authentication into HUD!');
    }
    await page.screenshot({ path: `${ARTIFACTS_DIR}/auth_debug_3_google_authenticated_hud.png` });
    console.log('📸 Saved auth_debug_3_google_authenticated_hud.png');

    // 3. Inspect Emerging Profile Pane for Google User
    console.log('3. Opening Emerging Profile Pane...');
    await page.evaluate(() => {
      const profileBtn = document.querySelector('header button');
      if (profileBtn) profileBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const profilePane = await page.evaluate(() => {
      const pane = document.getElementById('emerging-profile-pane');
      if (!pane) return null;
      return {
        text: pane.innerText,
        hasSignOut: Boolean(Array.from(pane.querySelectorAll('button')).find(b => b.textContent.includes('Sign Out'))),
        hasManage: Boolean(Array.from(pane.querySelectorAll('button')).find(b => b.textContent.includes('Manage Account')))
      };
    });
    console.log('Emerging Profile Pane Open:', { hasPane: Boolean(profilePane), hasSignOut: profilePane?.hasSignOut });
    if (!profilePane || !profilePane.hasSignOut) {
      throw new Error('Emerging Profile Pane did not render active session!');
    }
    await page.screenshot({ path: `${ARTIFACTS_DIR}/auth_debug_4_google_profile_pane.png` });
    console.log('📸 Saved auth_debug_4_google_profile_pane.png');

    // Click Sign Out
    console.log('4. Clicking Sign Out...');
    await page.evaluate(() => {
      const pane = document.getElementById('emerging-profile-pane');
      const signOutBtn = Array.from(pane.querySelectorAll('button')).find(b => b.textContent.includes('Sign Out'));
      if (signOutBtn) signOutBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Open Auth modal again to test Sign Up
    console.log('5. Opening Auth Modal to test Create Account (Sign Up)...');
    await page.evaluate(() => {
      window.location.hash = '#signup';
    });
    await new Promise(r => setTimeout(r, 600));

    const signUpUI = await page.evaluate(() => {
      const handleInput = document.querySelector('input[placeholder="e.g. CyberArchitect"]');
      const emailInput = document.querySelector('input[placeholder="architect@domain.com"]');
      const specBtns = Array.from(document.querySelectorAll('button')).filter(b => 
        b.textContent.includes('High Availability') || 
        b.textContent.includes('Throughput') || 
        b.textContent.includes('Security') || 
        b.textContent.includes('FinOps')
      );
      const deployBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Deploy Architect Identity'));
      return {
        hasHandleInput: Boolean(handleInput),
        hasEmailInput: Boolean(emailInput),
        specCount: specBtns.length,
        hasDeployBtn: Boolean(deployBtn)
      };
    });
    console.log('Sign Up Form Elements:', signUpUI);
    if (!signUpUI.hasHandleInput || signUpUI.specCount !== 4 || !signUpUI.hasDeployBtn) {
      throw new Error('Sign Up form elements missing or incomplete!');
    }
    await page.screenshot({ path: `${ARTIFACTS_DIR}/auth_debug_5_signup_form.png` });
    console.log('📸 Saved auth_debug_5_signup_form.png');

    // Fill Sign Up form & Submit
    console.log('5b. Filling & Deploying new Architect Account...');
    await page.type('input[placeholder="e.g. CyberArchitect"]', 'ZeroTrustTitan');
    await page.type('input[placeholder="architect@domain.com"]', 'titan@zerotrust.dev');
    // Select Security Specialization
    await page.evaluate(() => {
      const secBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Security'));
      if (secBtn) secBtn.click();
    });
    // Password
    const pwInputs = await page.$$('input[type="password"]');
    if (pwInputs.length >= 2) {
      await pwInputs[0].type('StrongShield999!');
      await pwInputs[1].type('StrongShield999!');
    }
    await new Promise(r => setTimeout(r, 400));

    // Submit Sign Up
    await page.evaluate(() => {
      const deployBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Deploy Architect Identity'));
      if (deployBtn) deployBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    const newRegisteredStatus = await page.evaluate(() => {
      const hud = document.querySelector('header');
      const name = hud ? hud.textContent.includes('ZeroTrustTitan') : false;
      return {
        nameInHud: name
      };
    });
    console.log('New Registered Account Status in HUD:', newRegisteredStatus);
    if (!newRegisteredStatus.nameInHud) {
      throw new Error('Failed to register and deploy new Architect Account!');
    }
    await page.screenshot({ path: `${ARTIFACTS_DIR}/auth_debug_6_registered_account_hud.png` });
    console.log('📸 Saved auth_debug_6_registered_account_hud.png');

    console.log('🎉 ALL AUTHENTICATION FLOW TESTS PASSED 100%!');
  } finally {
    await browser.close();
  }
}

runAuthFlowTest().catch(err => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
