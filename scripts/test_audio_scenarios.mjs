import puppeteer from 'puppeteer-core';

async function testAllAudioScenarios() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  // Dismiss auth modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const guestBtn = btns.find(b => b.textContent && b.textContent.includes('Continue as Guest Architect'));
    if (guestBtn) guestBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const results = [];

  // Helper to get HUD audio state
  const getAudioState = () => page.evaluate(() => {
    const themeBtn = document.querySelector('[data-testid="hud-music-theme-btn"]');
    const soundBtn = document.querySelector('[data-testid="hud-sound-toggle-btn"]');
    return {
      themeActive: themeBtn ? themeBtn.className.includes('bg-amber-500') : false,
      themeText: themeBtn ? themeBtn.innerText.replace(/\n/g, ' ') : '',
      themeTitle: themeBtn ? themeBtn.title : '',
      soundMuted: soundBtn ? soundBtn.title.includes('Muted') : false,
      soundText: soundBtn ? soundBtn.innerText.replace(/\n/g, ' ') : ''
    };
  });

  // Scenario 1: Initial state (Sound ON, Theme ON)
  const s1 = await getAudioState();
  results.push({
    scenario: '1. Initial State (Sound ON, Theme ON)',
    pass: s1 && s1.themeActive && !s1.soundMuted && s1.themeText.includes('Theme'),
    state: s1
  });

  // Scenario 2: Click Theme button to turn OFF music
  await page.evaluate(() => {
    const themeBtn = document.querySelector('[data-testid="hud-music-theme-btn"]');
    if (themeBtn) themeBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  const s2 = await getAudioState();
  results.push({
    scenario: '2. Theme Toggled OFF',
    pass: s2 && !s2.themeActive && s2.themeText.includes('Off') && s2.themeTitle.includes('Off'),
    state: s2
  });

  // Scenario 3: Click multiple places on canvas/body - Music MUST STAY OFF!
  await page.evaluate(() => {
    document.body.click();
    window.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
  });
  await new Promise(r => setTimeout(r, 500));
  const s3 = await getAudioState();
  results.push({
    scenario: '3. Canvas & Key Clicks (Zombie Music Check)',
    pass: s3 && !s3.themeActive && s3.themeText.includes('Off'),
    state: s3
  });

  // Scenario 4: Click Theme button to turn back ON
  await page.evaluate(() => {
    const themeBtn = document.querySelector('[data-testid="hud-music-theme-btn"]');
    if (themeBtn) themeBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  const s4 = await getAudioState();
  results.push({
    scenario: '4. Theme Toggled back ON',
    pass: s4 && s4.themeActive && s4.themeText === 'Theme' && s4.themeTitle.includes('Active'),
    state: s4
  });

  // Scenario 5: Toggle Master Sound (Mute) -> Theme becomes muted as well
  await page.evaluate(() => {
    const soundBtn = document.querySelector('[data-testid="hud-sound-toggle-btn"]');
    if (soundBtn) soundBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  const s5 = await getAudioState();
  results.push({
    scenario: '5. Sound Muted (Theme reflects Muted)',
    pass: s5 && s5.soundMuted && s5.themeText.includes('Muted'),
    state: s5
  });

  // Scenario 6: Toggle Master Sound back to Unmute (Music should resume active)
  await page.evaluate(() => {
    const soundBtn = document.querySelector('[data-testid="hud-sound-toggle-btn"]');
    if (soundBtn) soundBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  const s6 = await getAudioState();
  results.push({
    scenario: '6. Sound Unmuted (Music Resumed)',
    pass: s6 && !s6.soundMuted && s6.themeActive && s6.themeText === 'Theme',
    state: s6
  });

  // Scenario 7: Turn Theme OFF, then Mute, then Unmute -> Music must STAY OFF!
  await page.evaluate(() => {
    const themeBtn = document.querySelector('[data-testid="hud-music-theme-btn"]');
    if (themeBtn) themeBtn.click(); // turn theme off
  });
  await new Promise(r => setTimeout(r, 300));

  await page.evaluate(() => {
    const soundBtn = document.querySelector('[data-testid="hud-sound-toggle-btn"]');
    if (soundBtn) soundBtn.click(); // mute
  });
  await new Promise(r => setTimeout(r, 300));

  await page.evaluate(() => {
    const soundBtn = document.querySelector('[data-testid="hud-sound-toggle-btn"]');
    if (soundBtn) soundBtn.click(); // unmute
  });
  await new Promise(r => setTimeout(r, 300));
  const s7 = await getAudioState();
  results.push({
    scenario: '7. Theme OFF -> Mute -> Unmute -> Theme Stays OFF',
    pass: s7 && !s7.soundMuted && !s7.themeActive && s7.themeText.includes('Off'),
    state: s7
  });

  // Scenario 8: Simulation Play/Pause and Ambient Drone
  await page.evaluate(() => {
    const simBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Simulate Peak Wave'));
    if (simBtn) simBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const s8Active = await page.evaluate(() => {
    const simBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Simulating'));
    return { isSimulating: Boolean(simBtn) };
  });
  results.push({ scenario: '8. Simulation Started (Ambient Drone Active)', pass: s8Active.isSimulating, state: s8Active });

  // Reset simulation
  await page.evaluate(() => {
    const resetBtn = document.querySelector('button[title="Reset Wave"]');
    if (resetBtn) resetBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  const s9 = await page.evaluate(() => {
    const simBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Simulate Peak Wave'));
    return { isReset: Boolean(simBtn) };
  });
  results.push({ scenario: '9. Simulation Reset (Ambient Drone Stopped)', pass: s9.isReset, state: s9 });

  console.log('--- AUDIO LOGIC VERIFICATION SUITE ---');
  results.forEach(r => {
    console.log(`${r.pass ? '✅ PASS' : '❌ FAIL'}: ${r.scenario}`);
    console.log('   State:', JSON.stringify(r.state));
  });

  const allPassed = results.every(r => r.pass);
  console.log(`\nOVERALL STATUS: ${allPassed ? 'ALL SCENARIOS PASSED 100%' : 'SOME TESTS FAILED'}`);

  await page.screenshot({ path: '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c/audio_controls_verified.png' });
  console.log('📸 Saved verification screenshot to audio_controls_verified.png');

  await browser.close();
  if (!allPassed) process.exit(1);
}

testAllAudioScenarios().catch(err => {
  console.error(err);
  process.exit(1);
});
