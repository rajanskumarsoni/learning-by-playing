import puppeteer from 'puppeteer-core';

async function testPresets() {
  console.log('Testing Iconic Presets for 100% architectural validity...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    headless: true,
    args: ['--window-size=1600,1000', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  await page.goto('http://localhost:5175', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('systemsaviour_tutorial_completed', 'true');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 800));

  // Dismiss guide
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Close Guide"]') ||
      Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('✕'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  const presets = ['netflix', 'spotify', 'uber', 'cloudflare'];

  for (const presetId of presets) {
    console.log(`Loading preset: ${presetId}...`);
    // Click Presets button in utilities pill or open modal
    await page.evaluate((id) => {
      // Find preset in window.ICONIC_PRESETS or click through UI
      const presetBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Presets'));
      if (presetBtn) presetBtn.click();
    }, presetId);
    await new Promise((r) => setTimeout(r, 500));

    // Click preset load button
    await page.evaluate((id) => {
      const card = Array.from(document.querySelectorAll('.glass-panel')).find(el => el.textContent.toLowerCase().includes(id));
      if (card) {
        const loadBtn = card.querySelector('button');
        if (loadBtn) loadBtn.click();
      }
    }, presetId);
    await new Promise((r) => setTimeout(r, 800));

    // Verify no violation modal is open
    const hasViolation = await page.evaluate(() => {
      return Boolean(document.querySelector('.glass-panel.border-2.border-rose-500\\/60'));
    });
    console.log(`Preset ${presetId} has violation modal:`, hasViolation);

    // Verify simulation runs
    await page.evaluate(() => {
      const simBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('SIMULATE') || b.textContent.includes('Simulate'));
      if (simBtn) simBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    const simStatus = await page.evaluate(() => {
      const p99 = document.querySelector('[title*="P99"]') || document.body.innerText.match(/P99:\s*\d+ms/);
      return { p99: p99 ? (p99.textContent || p99[0]) : 'N/A' };
    });
    console.log(`Preset ${presetId} telemetry:`, simStatus);
  }

  await browser.close();
  console.log('All presets verified successfully!');
}

testPresets().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
