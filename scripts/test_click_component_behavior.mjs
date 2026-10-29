import puppeteer from 'puppeteer-core';

async function run() {
  console.log('Testing that clicking on component card DOES NOT open right panel...');
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
  await new Promise(r => setTimeout(r, 600));

  // Helper to check if right panel is collapsed
  const isRightPanelCollapsed = async () => {
    return await page.evaluate(() => {
      const asides = Array.from(document.querySelectorAll('aside'));
      const rightAside = asides[1];
      if (!rightAside) return true;
      return rightAside.classList.contains('w-0') || rightAside.classList.contains('opacity-0');
    });
  };

  const initialCollapsed = await isRightPanelCollapsed();
  console.log('1. Initial right panel collapsed:', initialCollapsed);

  // STEP 1: Click directly on web-1 card body (NOT the inspect button)
  console.log('2. Clicking directly on web-1 component card...');
  const webNode = await page.$('div[data-node-id="web-1"]');
  if (!webNode) throw new Error('web-1 node not found');
  await webNode.click({ offset: { x: 40, y: 40 } });
  await new Promise(r => setTimeout(r, 600));

  const collapsedAfterCardClick = await isRightPanelCollapsed();
  console.log('3. Right panel collapsed after clicking card body:', collapsedAfterCardClick);
  if (!collapsedAfterCardClick) {
    throw new Error('FAILURE: Right panel opened when clicking on component card body!');
  }

  await page.screenshot({ path: '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c/component_click_panel_stayed_closed.png' });
  console.log('Captured component_click_panel_stayed_closed.png (Right panel correctly stayed closed)');

  // STEP 2: Hover over web-1 card to reveal the popup button
  console.log('4. Hovering over web-1 card to reveal Inspect Element popup button...');
  await webNode.hover();
  await new Promise(r => setTimeout(r, 500));

  const inspectBtn = await page.$('button[data-inspect-btn="web-1"]');
  if (!inspectBtn) throw new Error('Inspect Element popup button not found on hover');

  // STEP 3: Click the Inspect Element popup button
  console.log('5. Clicking the Inspect Element popup button...');
  await inspectBtn.click();
  await new Promise(r => setTimeout(r, 800));

  const collapsedAfterInspectClick = await isRightPanelCollapsed();
  console.log('6. Right panel collapsed after clicking Inspect Element:', collapsedAfterInspectClick);
  if (collapsedAfterInspectClick) {
    throw new Error('FAILURE: Right panel failed to open after clicking Inspect Element!');
  }

  const inspectorInfo = await page.evaluate(() => {
    const asides = Array.from(document.querySelectorAll('aside'));
    const rightAside = asides[1];
    const inspectorTitle = rightAside?.querySelector('div[class*="border-indigo-400"]')?.innerText || '';
    const componentName = rightAside?.innerText.includes('API / Web Server');
    return {
      asideWidth: rightAside?.getBoundingClientRect().width,
      hasComponentName: componentName
    };
  });
  console.log('7. Right panel info:', inspectorInfo);

  await page.screenshot({ path: '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c/inspect_button_opened_right_panel.png' });
  console.log('Captured inspect_button_opened_right_panel.png');

  await browser.close();
  console.log('ALL ASSERTIONS PASSED! Component card click does NOT open panel; Inspect Element button DOES open panel.');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

