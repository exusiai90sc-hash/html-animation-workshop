'use strict';
const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');
const {randomUUID} = require('crypto');
const args = Object.fromEntries(process.argv.slice(2).map(value => {
  const split = value.indexOf('=');
  return [value.slice(0, split), value.slice(split + 1)];
}));
const number = (key, fallback) => args[key] === undefined ? fallback : Number(args[key]);
async function main() {
  const source = path.resolve(args.source), out = path.resolve(args.out);
  const start = number('start', 0), end = number('end', 60.505);
  const fps = number('fps', 24), width = number('width', 1280);
  const part = number('part', 0), parts = number('parts', 1);
  if (![start,end,fps,width,part,parts].every(Number.isFinite) || end < start || fps <= 0 || width <= 0 || !Number.isInteger(parts) || !Number.isInteger(part) || part < 0 || part >= parts) throw new Error('渲染范围、尺寸或分片参数无效');
  fs.mkdirSync(out, {recursive:true});
  if(fs.existsSync(path.join(out,'.pause'))){console.log('帧目录有.pause，当前批次安全停止');process.exitCode=75;return;}
  const fileAt = i => path.join(out, `f${String(i).padStart(5,'0')}.png`);
  if (args._indices) {
    // 每批退出进程，释放 SVG/Canvas 的原生内存，适合长段逐帧输出。
    const dependency = require('./依赖加载.cjs');
    const sharp = dependency('sharp'); sharp.cache(false); sharp.concurrency(1);
    const {makeScene,render} = require('./软件渲染.cjs');
    const scene = await makeScene(source);
    for (const i of args._indices.split(',').map(Number)) {
      const file = fileAt(i);
      if (args.resume === '1' && fs.existsSync(file)) continue;
      const temp = path.join(out, `.frame-${i}-${randomUUID()}.png`);
      await render(scene, start + i / fps, temp, width);
      fs.renameSync(temp, file);
      if (global.gc) global.gc();
    }
    scene.dispose?.();
    return;
  }
  const indices = [];
  for (let i = part; i < Math.round((end-start)*fps); i += parts) {
    const time = start + i/fps;
    if(time >= end) continue;
    if (args.onlyFrom !== undefined && time < Number(args.onlyFrom)) continue;
    if (args.onlyTo !== undefined && time > Number(args.onlyTo)) continue;
    if (args.resume === '1' && fs.existsSync(fileAt(i))) continue;
    indices.push(i);
  }
  const batchFrames = Math.max(1, Math.floor(number('batchFrames', 12)));
  if (!Number.isFinite(batchFrames)) throw new Error('batchFrames 必须为正整数');
  const common = Object.entries({...args,source,out}).filter(([key]) => key !== '_indices').map(([key,value]) => `${key}=${value}`);
  for (let offset = 0; offset < indices.length; offset += batchFrames) {
    const batch = indices.slice(offset, offset+batchFrames);
    const child = spawnSync(process.execPath, ['--expose-gc', __filename, ...common, `_indices=${batch.join(',')}`], {stdio:'inherit'});
    if (child.error) throw child.error;
    if (child.status !== 0) throw new Error(`第 ${offset+1}–${offset+batch.length} 帧批次未完成；可用 resume=1 续渲`);
    console.log(`已完成 ${Math.min(offset+batchFrames,indices.length)}/${indices.length} 帧`);
  }
}
main().catch(error => {console.error(error);process.exit(1);});
