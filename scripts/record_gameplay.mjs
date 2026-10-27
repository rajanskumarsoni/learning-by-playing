import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function recordLevel1() {
  console.log('Starting Level 1 gameplay recording...');

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--window-size=1280,720',
      '--hide-scrollbars'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });

  // Expose helper to auto-dismiss welcome modal if open
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));

  // Output video path
  const outDir = path.resolve('public');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outMp4 = path.join(outDir, 'gameplay_demo.mp4');

  // Spawn ffmpeg process
  const ffmpeg = spawn('/opt/homebrew/bin/ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', '25',
    '-i', '-',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '22',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    outMp4
  ]);

  ffmpeg.stderr.on('data', (d) => {
    // console.log(d.toString());
  });

  const client = await page.target().createCDPSession();
  let frameCount = 0;

  client.on('Page.screencastFrame', async (event) => {
    try {
      const buffer = Buffer.from(event.data, 'base64');
      if (ffmpeg.stdin.writable) {
        ffmpeg.stdin.write(buffer);
        frameCount++;
      }
      await client.send('Page.screencastFrameAck', { sessionId: event.sessionId });
    } catch (e) {}
  });

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 88,
    maxWidth: 1280,
    maxHeight: 720,
    everyNthFrame: 1
  });

  console.log('Screencast active. Performing Level 1 gameplay...');

  // Step 1: Click "Select Level & View Targets" or close Welcome guide if open
  await page.evaluate(() => {
    // If Welcome modal is visible, close it to reveal Level 1 arena
    const closeBtn = document.querySelector('button[title="Close Guide"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));

  // Step 2: Show initial Level 1 arena (Source -> Web Server -> SQL)
  await new Promise((r) => setTimeout(r, 1500));

  // Step 3: Add Redis Cache from catalog palette
  await page.evaluate(() => {
    // Find CACHE button in palette
    const buttons = Array.from(document.querySelectorAll('button'));
    const cacheBtn = buttons.find((b) => b.textContent && b.textContent.includes('Redis Cache'));
    if (cacheBtn) {
      cacheBtn.click();
    }
  });
  await new Promise((r) => setTimeout(r, 1200));

  // Step 4: Position Redis Cache nicely and rewire
  await page.evaluate(() => {
    // Get state via window or trigger wiring:
    // Delete old direct wire e2 (web-1 -> sql-1) and add web-1 -> cache and cache -> sql-1
    const edgePaths = Array.from(document.querySelectorAll('svg g.pointer-events-auto path.cursor-pointer'));
    if (edgePaths.length >= 2) {
      // The second edge is e2 (web to sql)
      edgePaths[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });
  await new Promise((r) => setTimeout(r, 800));

  // Connect Web Server -> Redis Cache -> SQL Database
  await page.evaluate(() => {
    // Find output port of web-1 and input port of cache
    const ports = Array.from(document.querySelectorAll('.rounded-full.cursor-pointer'));
    // If ports exist, connect them
    if (ports.length >= 4) {
      // web-1 out port to cache in port
      ports[1]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      ports[2]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Step 5: Start Simulation Wave!
  console.log('Starting simulation wave...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const simBtn = buttons.find((b) => b.textContent && b.textContent.includes('Simulate Peak Wave'));
    if (simBtn) simBtn.click();
  });

  // Let simulation wave run smoothly to 100% and show victory
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log('Simulation complete. Stopping screencast...');
  await client.send('Page.stopScreencast');
  await new Promise((r) => setTimeout(r, 600));

  ffmpeg.stdin.end();

  await new Promise((resolve) => {
    ffmpeg.on('close', resolve);
  });

  await browser.close();
  console.log(`Video successfully recorded to ${outMp4}! Total frames: ${frameCount}`);
}

recordLevel1().catch((err) => {
  console.error('Record failed:', err);
  process.exit(1);
});
