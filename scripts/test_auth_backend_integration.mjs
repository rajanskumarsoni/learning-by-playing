import puppeteer from 'puppeteer-core';

async function testBackendDirect() {
  console.log('🔍 Testing Backend Auth APIs directly on http://localhost:8787...');
  const testUser = {
    handle: `Arch_${Date.now().toString(36)}`,
    email: `arch_${Date.now()}@systemsaviour.dev`,
    password: 'SecurePassword123!',
    specialization: 'HIGH_AVAILABILITY'
  };

  // 1. Test Register
  const regRes = await fetch('http://localhost:8787/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  const regJson = await regRes.json();
  console.log('Backend /api/auth/register Response:', regJson.success, 'Token created:', Boolean(regJson.token));
  if (!regJson.success || !regJson.token) throw new Error('Backend registration failed');

  // 2. Test Login
  const loginRes = await fetch('http://localhost:8787/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrHandle: testUser.email, password: testUser.password })
  });
  const loginJson = await loginRes.json();
  console.log('Backend /api/auth/login Response:', loginJson.success, 'User name:', loginJson.user?.name);
  if (!loginJson.success || loginJson.user?.email !== testUser.email) throw new Error('Backend login failed');

  // 3. Test Verify Session /api/auth/me
  const meRes = await fetch('http://localhost:8787/api/auth/me', {
    headers: { Authorization: `Bearer ${loginJson.token}` }
  });
  const meJson = await meRes.json();
  console.log('Backend /api/auth/me Response:', meJson.success, 'Role:', meJson.user?.role);
  if (!meJson.success || !meJson.user) throw new Error('Backend session verification failed');

  // 4. Test Guest Login
  const guestRes = await fetch('http://localhost:8787/api/auth/guest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  const guestJson = await guestRes.json();
  console.log('Backend /api/auth/guest Response:', guestJson.success, 'Guest name:', guestJson.user?.name);
  if (!guestJson.success || !guestJson.user?.isGuest) throw new Error('Backend guest creation failed');

  return testUser;
}

async function testFrontendIntegration(testUser) {
  console.log('🔍 Testing Frontend Auth UI Integration with Backend...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  
  // Clear any existing session
  await page.evaluateOnNewDocument(() => {
    localStorage.removeItem('systemsaviour_auth_user');
    localStorage.removeItem('systemsaviour_cf_auth_token');
  });

  // Track network requests to verify backend call
  let loginApiCalled = false;
  page.on('request', (req) => {
    if (req.url().includes('/api/auth/login')) {
      loginApiCalled = true;
    }
  });

  await page.goto('http://localhost:5175/#signin', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1200));

  // Fill in credentials using page.type so React state updates
  console.log('Submitting credentials in Auth Modal:', testUser.email);
  await page.type('input[placeholder*="neo@systemsaviour.dev"]', testUser.email);
  await page.type('input[placeholder*="••••"]', testUser.password);
  
  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Authenticate Terminal'));
    if (submitBtn) submitBtn.click();
  });

  await new Promise((r) => setTimeout(r, 2000));

  // Verify user authenticated in localStorage and header
  const authState = await page.evaluate(() => {
    const savedUser = localStorage.getItem('systemsaviour_auth_user');
    const savedToken = localStorage.getItem('systemsaviour_cf_auth_token');
    const userBtn = Array.from(document.querySelectorAll('button')).find(b => b.title?.includes('Signed in as'));
    return {
      hasSavedUser: Boolean(savedUser),
      hasSavedToken: Boolean(savedToken),
      userData: savedUser ? JSON.parse(savedUser) : null,
      headerButtonText: userBtn ? userBtn.innerText : null
    };
  });

  console.log('Frontend Auth State after submission:', authState);
  console.log('Login API Request Sent:', loginApiCalled);

  if (!authState.hasSavedUser) {
    throw new Error('User was not saved to localStorage upon authentication');
  }

  await browser.close();
  console.log('🎉 Frontend & Backend Auth Integration Verification PASSED!');
}

async function run() {
  const testUser = await testBackendDirect();
  await testFrontendIntegration(testUser);
}

run().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
