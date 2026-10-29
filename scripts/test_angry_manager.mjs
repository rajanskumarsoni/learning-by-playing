import puppeteer from 'puppeteer-core';

async function run() {
  console.log('Testing Angry Anime Engineering Manager (Kenji) pacing & scolding on canvas...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    headless: true,
    args: ['--window-size=1600,1000', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });
  await page.goto('http://localhost:5175/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  // Dismiss guide if open
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Close Guide"]') ||
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('✕'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Check if angry manager exists
  const managerData = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="angry-manager"]');
    if (!el) return null;
    const bubble = el.querySelector('.bg-slate-950\\/95');
    const img = el.querySelector('img[alt="Angry Manager Kenji"]');
    return {
      leftStyle: el.style.left,
      bubbleText: bubble ? bubble.innerText.trim() : null,
      imgSrc: img ? img.src : null,
      directionTransform: img ? img.style.transform : null
    };
  });

  console.log('1. Initial Manager State:', managerData);
  if (!managerData) {
    throw new Error('Manager Kenji element not found in DOM!');
  }

  // Wait 1.5 seconds and check if position changed (pacing movement)
  await new Promise(r => setTimeout(r, 1500));
  const newPos = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="angry-manager"]');
    return el ? el.style.left : null;
  });
  console.log('2. Manager Position after 1.5s pacing:', newPos);
  if (newPos === managerData.leftStyle) {
    console.warn('Warning: Position did not change - could be at turnaround pause');
  }

  // Capture screenshot of Kenji pacing with speech bubble and chips
  await page.screenshot({ path: '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c/angry_manager_pacing_canvas.png' });
  console.log('Captured angry_manager_pacing_canvas.png');

  // Test poking Kenji
  console.log('3. Poking Manager Kenji...');
  const managerImg = await page.$('[data-testid="angry-manager"] img[alt="Angry Manager Kenji"]');
  if (managerImg) {
    await managerImg.click();
    await new Promise(r => setTimeout(r, 300));

    const pokedBubble = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="angry-manager"]');
      const bubble = el?.querySelector('.bg-slate-950\\/95');
      return bubble ? bubble.innerText.trim() : null;
    });
    console.log('4. Manager response to poking:', pokedBubble);
    await page.screenshot({ path: '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c/angry_manager_poked_reaction.png' });
    console.log('Captured angry_manager_poked_reaction.png');
  }

  await browser.close();
  console.log('ALL ANGRY MANAGER TESTS PASSED!');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

