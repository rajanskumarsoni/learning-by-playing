import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = '/Users/rajankumarsoni/.gemini/antigravity-ide/brain/91939c9d-f94d-470f-8c59-f47d0a2e917a';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    headless: true,
    args: ['--window-size=1440,900', '--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (err) => console.error('PAGE ERROR:', err.message));
    await page.setViewport({ width: 1440, height: 900 });

    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    // 1. Capture Welcome Modal with 30s Tutorial Quest Hero Card
    console.log('Capturing Welcome Modal with 30s quest banner...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'onboarding_welcome_banner.png') });

    // 2. Click "Start 30s Quest →" in Welcome modal
    console.log('Clicking Start 30s Quest...');
    const clickedStart = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const startBtn = btns.find((b) => b.textContent.includes('Start 30s Quest'));
      if (startBtn) {
        startBtn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked Start 30s Quest:', clickedStart);
    await new Promise((r) => setTimeout(r, 1200));

    // Capture Step 1: Canvas HUD & Highlighted Left Palette
    console.log('Capturing Step 1 (Deploy Cache)...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'onboarding_step1_deploy_hud.png') });

    // 3. Click "1-Click Deploy" on the Floating HUD
    console.log('Clicking 1-Click Deploy on Floating HUD...');
    const clickedDeploy = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const deployBtn = btns.find((b) => b.textContent.includes('1-Click Deploy') || b.textContent.includes('Deploy Cache!'));
      if (deployBtn) {
        deployBtn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked Deploy:', clickedDeploy);
    await new Promise((r) => setTimeout(r, 1200));

    // Capture Step 2: Wire Cache into pipeline
    console.log('Capturing Step 2 (Wire Cache)...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'onboarding_step2_wire_hud.png') });

    // 4. Click "1-Click Auto-Wire"
    console.log('Clicking 1-Click Auto-Wire...');
    const clickedWire = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const wireBtn = btns.find((b) => b.textContent.includes('1-Click Auto-Wire'));
      if (wireBtn) {
        wireBtn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked Auto-Wire:', clickedWire);
    await new Promise((r) => setTimeout(r, 1200));

    // Capture Step 3: Launch Sim button pulsing
    console.log('Capturing Step 3 (Launch Sim HUD)...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'onboarding_step3_sim_ready.png') });

    // Speed up simulation to 5x for test
    await page.evaluate(() => {
      const speedBtn = Array.from(document.querySelectorAll('button')).find((b) => b.title === 'Simulation Speed');
      if (speedBtn) {
        speedBtn.click(); // 2x
        speedBtn.click(); // 5x
      }
    });

    // 5. Click "Launch Sim!" on HUD
    console.log('Clicking Launch Sim!...');
    const clickedSim = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const simBtn = btns.find((b) => b.textContent.includes('Launch Sim!'));
      if (simBtn) {
        simBtn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked Launch Sim:', clickedSim);

    // Wait for the simulation wave to finish (approx 3-5 seconds at 5x speed)
    console.log('Waiting for simulation wave and victory celebration modal...');
    let victoryFound = false;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const hasVictoryModal = await page.evaluate(() => {
        return document.body.textContent.includes('First Victory Achieved!') || document.body.textContent.includes('Speedrun Completion Time');
      });
      if (hasVictoryModal) {
        console.log(`Victory celebration modal appeared after ${i + 1}s!`);
        victoryFound = true;
        break;
      }
    }

    await new Promise((r) => setTimeout(r, 800));
    console.log('Capturing 30-Second Victory Modal...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'onboarding_victory_celebration.png') });

    console.log('SUCCESS! All 30s onboarding loop steps tested & captured.');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
}

main();
