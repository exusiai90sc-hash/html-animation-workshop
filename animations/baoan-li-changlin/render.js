#!/usr/bin/env node
/* =============================================================
 * 逐帧导出视频（帧精确，与电脑性能无关）
 *
 * 依赖：Node.js 24+、Playwright、ffmpeg
 *   npm i playwright            # 若尚未安装
 *   npx playwright install chromium
 *   ffmpeg 需在 PATH 中，或用 --ffmpeg 指定路径
 *
 * 用法：
 *   node render.js                          # 1280×720，24fps，输出 保安-李长林.mp4
 *   node render.js --fps 25 --out a.mp4     # 25fps
 *   node render.js --scale 2                # 3840×2160
 *   node render.js --frames frames          # 只导出 PNG 序列（不需要 ffmpeg）
 *   node render.js --li images/li.jpg       # 临时指定素材（也可改 materials.js）
 *   node render.js --workers 4              # 并行渲染进程数（默认按 CPU 核数，最多 6）
 * ============================================================= */
const path = require('path');
const fs = require('fs');
const os = require('os');
const {pathToFileURL}=require('url');
const { spawn } = require('child_process');

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) { const k = a.slice(2), v = process.argv[i + 1]; if (!v || v.startsWith('--')) args[k] = true; else { args[k] = v; i++; } }
}
const fps = +(args.fps || 24);
const scale = +(args.scale || (2/3));
const out = args.out || '保安-李长林.mp4';
const ffmpegBin = args.ffmpeg || 'ffmpeg';
const q = new URLSearchParams({ render: '1' });
['li', 'snow', 'deed'].forEach(k => { if (args[k]) q.set(k, args[k]); });
const indexURL = pathToFileURL(path.resolve(__dirname, 'index.html'));
indexURL.search = q.toString();
const url = indexURL.href;

let chromium;
try { ({ chromium } = require('playwright')); } catch (e) {
  console.error('找不到 playwright，请先运行：npm i playwright && npx playwright install chromium');
  process.exit(1);
}

const workersN = Math.max(1, +(args.workers || Math.min(6, Math.max(1, os.cpus().length - 1))));

async function openPage() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale });
  page.on('pageerror', e => console.error('页面错误：', e.message));
  await page.goto(url);
  const duration = await page.evaluate(async () => { await window.__anim.ready; return window.__anim.duration; });
  return { browser, page, duration };
}

(async () => {
  const pages = await Promise.all(Array.from({ length: workersN }, openPage));
  const duration = pages[0].duration;
  const from = +(args.from || 0), to = Math.min(+(args.to || duration), duration);
  const n = Math.round((to - from) * fps);
  console.log(`时长 ${duration}s，导出 ${from}–${to}s，共 ${n} 帧 @ ${fps}fps，${1920 * scale}×${1080 * scale}，并行 ${workersN} 路`);

  let ff = null;
  if (args.frames) fs.mkdirSync(args.frames, { recursive: true });
  else {
    ff = spawn(ffmpegBin, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    ff.on('error', () => { console.error('无法启动 ffmpeg。请安装 ffmpeg，或改用 --frames 目录 导出 PNG 序列。'); process.exit(1); });
  }
  const t0 = Date.now();
  let next = 0, written = 0, chain = Promise.resolve();
  const done = new Map();
  // 按帧序写出：所有写入串在一条 Promise 链上，保证顺序且最后一次 await 会等全部写完
  const flush = () => (chain = chain.then(async () => {
    while (done.has(written)) {
      const buf = done.get(written);
      done.delete(written);
      if (ff) { if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
      else fs.writeFileSync(path.join(args.frames, `f${String(written).padStart(5, '0')}.png`), buf);
      written++;
      if (written % fps === 0) process.stdout.write(`\r${(from + written / fps).toFixed(1)}s / ${to}s  已用 ${((Date.now() - t0) / 1000).toFixed(0)}s   `);
    }
  }));
  await Promise.all(pages.map(async ({ page }) => {
    for (;;) {
      const i = next++;
      if (i >= n) return;
      await page.evaluate(t => (window.__anim.renderAtAsync || window.__anim.renderAt)(t), from + i / fps);
      done.set(i, await page.screenshot({ type: 'png' }));
      await flush();
    }
  }));
  await flush();
  if (ff) {
    ff.stdin.end();
    const code = await new Promise(r => ff.on('close', r));
    if(code !== 0) throw new Error('ffmpeg 编码失败，退出码 '+code);

  }
  await Promise.all(pages.map(p => p.browser.close()));
  console.log(`\n完成：${args.frames ? args.frames + '/' : out}`);
})();
