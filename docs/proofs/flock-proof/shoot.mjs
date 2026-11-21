// Opens the proof page in Chromium with WebGPU on, moves the mouse over the
// flock, takes two screenshots a second apart, and fails if they are the
// same, if WebGPU was not used, or if anything was logged as an error.
//
// Usage, with `pnpm dev` already running on port 5199:
//   node shoot.mjs                 headless
//   node shoot.mjs headed          with a window, when headless gives no adapter
//
// Flags: on Windows the full Chromium (channel "chromium", not the headless
// shell) gets a WebGPU adapter with the D3D11 backend; that is the default
// below. On Linux try FLAGS="--enable-unsafe-webgpu --enable-features=Vulkan
// --use-angle=vulkan". CHANNEL overrides the channel.
import { chromium } from 'playwright';

const mode = process.argv[2] === 'headed' ? 'headed' : 'headless';
const url = process.env.URL ?? 'http://localhost:5199/';
const args = (process.env.FLAGS ?? '--enable-unsafe-webgpu --use-angle=d3d11 --ignore-gpu-blocklist')
  .split(' ')
  .filter(Boolean);
const channel = process.env.CHANNEL ?? 'chromium';

const browser = await chromium.launch({ headless: mode === 'headless', args, channel });
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });

const errors = [];
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  if (/favicon\.ico$/.test(m.location().url)) return;
  errors.push(`console.error: ${m.text()}`);
});
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(2500);

const probe = await page.evaluate(async () => {
  const canvas = document.querySelector('canvas');
  let adapter = false;
  if ('gpu' in navigator) {
    try {
      adapter = !!(await navigator.gpu.requestAdapter());
    } catch {
      adapter = false;
    }
  }
  return { adapter, webgpuCanvas: !!canvas && !!canvas.getContext('webgpu') };
});

// Over the flock, then across it, so the repeller is engaged and the birds
// have both flown and been pushed between the two shots.
await page.mouse.move(400, 300);
const first = await page.screenshot({ path: 'shot-1.png' });
await page.mouse.move(300, 250, { steps: 10 });
await page.waitForTimeout(1000);
const second = await page.screenshot({ path: 'shot-2.png' });
await browser.close();

const differ = !first.equals(second);
console.log(JSON.stringify({ mode, channel, args, probe, differ, errors }, null, 2));
if (!probe.adapter || !probe.webgpuCanvas || !differ || errors.length) process.exit(1);
