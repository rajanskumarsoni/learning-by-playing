import puppeteer from 'puppeteer-core';

async function run() {
  console.log('Launching browser to test Hover Inspect Element popup button...');
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

  // Ensure right panel is collapsed first
  const initialPanelCollapsed = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    return aside && aside.classList.contains('w-0');
  });
  console.log('Initial right panel is collapsed:', initialPanelCollapsed);

  // Hover over web-1 node card
  const webNode = await page.$('div[data-node-id="web-1"]');
  if (!webNode) {
    throw new Error('Node web-1 not found on canvas');
  }

  await webNode.hover();
  await new Promise(r => setTimeout(r, 500));

  // Check if popup inspect button is present and visible
  const inspectBtnInfo = await page.evaluate(() => {
    const btn = document.querySelector('button[data-inspect-btn="web-1"]');
    if (!btn) return null;
    const rect = btn.getBoundingClientRect();
    const style = window.getComputedStyle(btn);
    return {
      text: btn.innerText.trim(),
      width: rect.width,
      height: rect.height,
      opacity: style.opacity,
      display: style.display
    };
  });
  console.log('Inspect button info on hover:', inspectBtnInfo);

  // Screenshot showing the hover popup button
  await page.screenshot({ path: '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c/hover_inspect_popup_button.png' });
  console.log('Captured hover_inspect_popup_button.png');

  // Click the Inspect Element popup button
  const inspectBtn = await page.$('button[data-inspect-btn="web-1"]');
  if (!inspectBtn) {
    throw new Error('button[data-inspect-btn="web-1"] not found');
  }

  await inspectBtn.click();
  await new Promise(r => setTimeout(r, 800));

  // Check right panel state
  const panelStateAfterClick = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    const isCollapsed = aside && aside.classList.contains('w-0');
    const inspectorTitle = document.querySelector('div[class*="border-indigo-400"]')?.innerText || '';
    const activeTabText = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Inspector'))?.className || '';
    const selectedHeader = document.querySelector('aside h3')?.innerText || document.querySelector('aside .font-display')?.innerText || '';
    return {
      isCollapsed,
      asideWidth: aside ? aside.getBoundingClientRect().width : 0,
      inspectorActive: isCollapsed === false,
      selectedHeader
    };
  });
  console.log('Panel state after clicking Inspect Element:', panelStateAfterClick);

  // Screenshot showing the opened right panel with Inspector active
  await page.screenshot({ path: '/Users/rajankumarsoni/.gemini/antigravity/brain/34677a0a-5777-408f-90a7-2cb72f656b5c/right_panel_opened_from_inspect_btn.png' });
  console.log('Captured right_panel_opened_from_inspect_btn.png');

  await browser.close();
  console.log('Test completed successfully!');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
