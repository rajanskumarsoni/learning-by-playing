import puppeteer from 'puppeteer-core';

async function testDefaultPageAuth() {
  console.log('🚀 Starting Automated Test: Default Page is Sign In / Sign Up Page...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Ensure completely clean localStorage (no user saved)
    await page.goto('http://localhost:5175/', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.clear();
    });

    // 1. Reload default root URL (http://localhost:5175/ without any hash)
    console.log('1. Loading default root URL with clean state...');
    await page.goto('http://localhost:5175/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Verify AuthModal is open by default
    const isAuthModalOpen = await page.evaluate(() => {
      const modal = document.querySelector('input[placeholder="neo@systemsaviour.dev"]');
      const heading = document.evaluate("//h2[contains(., 'System Saviour')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      const hero = document.querySelector('img[alt="System Saviour Hero"]');
      const devil = document.querySelector('img[alt="Chaos Outage Devil"]');
      return {
        hasEmailInput: Boolean(modal),
        hasHeading: Boolean(heading),
        hasHero: Boolean(hero),
        hasDevil: Boolean(devil)
      };
    });

    console.log('Default Page Sign In State:', isAuthModalOpen);
    if (!isAuthModalOpen.hasEmailInput || !isAuthModalOpen.hasHero || !isAuthModalOpen.hasDevil) {
      throw new Error('Default page did not display the Sign In / Sign Up pane with Hero and Devil!');
    }

    await page.screenshot({ path: '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c/default_page_signin_view.png' });
    console.log('📸 Saved screenshot: default_page_signin_view.png');

    // 2. Switch to Sign Up tab
    console.log('2. Switching to Create Architect Account (Sign Up) tab...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const signUpBtn = btns.find(b => b.textContent.includes('Create Architect Account'));
      if (signUpBtn) signUpBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const isSignUpOpen = await page.evaluate(() => {
      const handleInput = document.querySelector('input[placeholder="e.g. CyberArchitect"]');
      const emailInput = document.querySelector('input[placeholder="architect@domain.com"]');
      const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Deploy Architect Identity'));
      return {
        hasHandleInput: Boolean(handleInput),
        hasEmailInput: Boolean(emailInput),
        hasDeployBtn: Boolean(submitBtn)
      };
    });
    console.log('Sign Up Form State:', isSignUpOpen);
    if (!isSignUpOpen.hasHandleInput || !isSignUpOpen.hasDeployBtn) {
      throw new Error('Failed to switch to Sign Up view on default page!');
    }

    await page.screenshot({ path: '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c/default_page_signup_view.png' });
    console.log('📸 Saved screenshot: default_page_signup_view.png');

    // 3. Test "Explore Simulation Arena as Guest"
    console.log('3. Clicking "Explore Simulation Arena as Guest"...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const guestLink = btns.find(b => b.textContent.includes('Explore Simulation Arena as Guest'));
      if (guestLink) guestLink.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const isArenaVisible = await page.evaluate(() => {
      const hudBtn = document.querySelector('header button');
      const modal = document.querySelector('input[placeholder="neo@systemsaviour.dev"]');
      return {
        hasHud: Boolean(hudBtn),
        modalClosed: !modal
      };
    });
    console.log('Simulation Arena Visible after skipping:', isArenaVisible);
    if (!isArenaVisible.modalClosed) {
      throw new Error('Auth modal did not dismiss when entering arena!');
    }

    await page.screenshot({ path: '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c/arena_view_after_guest_skip.png' });
    console.log('📸 Saved screenshot: arena_view_after_guest_skip.png');

    // 4. Test with Authenticated User in LocalStorage
    console.log('4. Testing reload with Authenticated User in LocalStorage...');
    await page.evaluate(() => {
      localStorage.setItem('systemsaviour_auth_user', JSON.stringify({
        id: 'user_test_99',
        name: 'Rajan Soni',
        email: 'rajan.soni@gmail.com',
        role: 'Google Cloud Principal Architect',
        salary: '$240,000 / yr',
        authProvider: 'google',
        avatar: 'https://avatars.githubusercontent.com/u/10200877?v=4'
      }));
    });

    await page.goto('http://localhost:5175/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    const authenticatedState = await page.evaluate(() => {
      const enterArenaBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Enter Architecture Arena'));
      const switchBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Switch / Sign In Other'));
      return {
        hasEnterArenaBtn: Boolean(enterArenaBtn),
        hasSwitchBtn: Boolean(switchBtn)
      };
    });
    console.log('Authenticated Default Page State:', authenticatedState);
    if (!authenticatedState.hasEnterArenaBtn || !authenticatedState.hasSwitchBtn) {
      throw new Error('Authenticated user did not see enter arena or switch account options on default page!');
    }

    await page.screenshot({ path: '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c/default_page_authenticated_dossier.png' });
    console.log('📸 Saved screenshot: default_page_authenticated_dossier.png');

    // Test clicking Switch Account
    console.log('5. Testing Switch Account button...');
    await page.evaluate(() => {
      const switchBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Switch / Sign In Other'));
      if (switchBtn) switchBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const switchedBackToForms = await page.evaluate(() => {
      const emailInput = document.querySelector('input[placeholder="neo@systemsaviour.dev"]');
      const signedInNotice = document.body.textContent.includes('Signed in as Rajan Soni');
      return {
        hasEmailInput: Boolean(emailInput),
        hasNotice: signedInNotice
      };
    });
    console.log('Switched to forms state:', switchedBackToForms);
    if (!switchedBackToForms.hasEmailInput || !switchedBackToForms.hasNotice) {
      throw new Error('Failed to switch back to Sign In forms from active profile!');
    }

    console.log('🎉 ALL DEFAULT PAGE SIGNIN/SIGNUP TESTS PASSED 100%!');
  } finally {
    await browser.close();
  }
}

testDefaultPageAuth().catch(err => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
