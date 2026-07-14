const { chromium } = require('C:\\Users\\vdvorschi\\AppData\\Roaming\\npm\\node_modules\\playwright\\index.js');
const path = require('path');

const SCREENSHOT_DIR = 'C:\\Users\\vdvorschi\\OneDrive - BRQ\\Claude\\Projeto_Claude_vscode\\dashdelivery\\test-screenshots-v6';

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Users\\vdvorschi\\AppData\\Local\\ms-playwright\\chromium_headless_shell-1228\\chrome-headless-shell-win64\\chrome-headless-shell.exe',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--use-gl=swiftshader',
      '--enable-accelerated-2d-canvas',
      '--disable-web-security'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  // Capture console errors
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  console.log('Navigating to https://dashdelivery.vercel.app ...');
  await page.goto('https://dashdelivery.vercel.app', {
    waitUntil: 'load',
    timeout: 60000
  });

  console.log('Page loaded. Waiting 8 seconds for WebGL scene...');
  await page.waitForTimeout(8000);

  // Full page screenshot
  const fullPath = path.join(SCREENSHOT_DIR, 'live-full.png');
  await page.screenshot({
    path: fullPath,
    fullPage: false
  });
  console.log('Full screenshot saved:', fullPath);

  // Try to find the 3D canvas element for a close-up
  const canvasBounds = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };
  });

  console.log('Canvas bounds:', JSON.stringify(canvasBounds));

  const canvasPath = path.join(SCREENSHOT_DIR, 'live-canvas.png');
  if (canvasBounds && canvasBounds.width > 0 && canvasBounds.height > 0) {
    await page.screenshot({
      path: canvasPath,
      clip: {
        x: canvasBounds.x,
        y: canvasBounds.y,
        width: Math.min(canvasBounds.width, 1440 - canvasBounds.x),
        height: Math.min(canvasBounds.height, 900 - canvasBounds.y)
      }
    });
    console.log('Canvas close-up saved:', canvasPath);
  } else {
    // Fallback: crop center area
    await page.screenshot({
      path: canvasPath,
      clip: { x: 0, y: 60, width: 1440, height: 840 }
    });
    console.log('Canvas fallback screenshot saved:', canvasPath);
  }

  // Log DOM summary
  const domSummary = await page.evaluate(() => {
    const canvases = document.querySelectorAll('canvas');
    const body = document.body ? document.body.innerText.substring(0, 500) : '';
    return {
      title: document.title,
      canvasCount: canvases.length,
      canvasSizes: Array.from(canvases).map(c => `${c.width}x${c.height}`),
      bodyPreview: body
    };
  });
  console.log('DOM summary:', JSON.stringify(domSummary, null, 2));

  // Print last 20 console messages
  console.log('\nConsole messages (last 20):');
  consoleMessages.slice(-20).forEach(m => console.log(m));

  await browser.close();
  console.log('\nDone.');
})().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
