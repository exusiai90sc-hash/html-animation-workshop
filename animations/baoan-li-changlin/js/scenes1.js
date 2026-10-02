'use strict';
/* =============================================================
 * scenes1.js —— 0 ~ 24.7 秒
 * S1 保安窑洞·油灯与旧照片  →  S2 照片里的贫苦农家·裂碗
 * →  S3 裂缝成路·草鞋脚印·汇入队伍·红布掠过  →  S3b 八角帽红星
 * →  S4 斯诺的相机镜头·笔记本·墨滴
 * ============================================================= */

/** 语义落点（秒）。配音有细微出入时，改这里即可整体对齐。 */
const T = {
  END: 60.505,
  PAST: 24.7,     // “以前给地主扛活挨打受骂”
  NOW: 29.05,     // “现在跟着红军……”（28.8–29.3）
  KNOW: 35.2,     // “可我知道”（34.9–35.5）
  WHOM: 38.6,     // “是为谁而战”
  BELIEF: 45.65,  // “为穷苦百姓谋出路的信念”（45.5–45.8）
  FORGE: 54.8,    // “也铸就了……”（54.5–55.1）
};

const SCENES = [];
const addScene = s => (SCENES.push(s), s);
/** 每帧由场景写入的全局后期参数 */
const POST = { flash: 0, flashColor: '#fff', shake: [0, 0] };

/** 平滑相机样条：keys = [[t,[x,y,s,r]],...]，缩放在对数空间插值，C1 连续，首尾速度为 0 */
function camSpl(t, keys) {
  const n = keys.length;
  const val = i => { const v = keys[i][1]; return [v[0], v[1], Math.log(v[2]), v[3] || 0]; };
  if (t <= keys[0][0]) { const v = keys[0][1]; return [v[0], v[1], v[2], v[3] || 0]; }
  if (t >= keys[n - 1][0]) { const v = keys[n - 1][1]; return [v[0], v[1], v[2], v[3] || 0]; }
  let i = 1;
  while (t > keys[i][0]) i++;
  const t0 = keys[i - 1][0], t1 = keys[i][0], dt = t1 - t0, u = (t - t0) / dt;
  const a = val(i - 1), b = val(i);
  const tan = j => {
    if (j <= 0 || j >= n - 1 || keys[j][2] === 'stop') return [0, 0, 0, 0];
    const p = val(j - 1), q = val(j + 1), d = keys[j + 1][0] - keys[j - 1][0];
    return p.map((v, k) => (q[k] - v) / d);
  };
  const ma = tan(i - 1), mb = tan(i);
  const h00 = 2 * u ** 3 - 3 * u * u + 1, h10 = u ** 3 - 2 * u * u + u, h01 = -2 * u ** 3 + 3 * u * u, h11 = u ** 3 - u * u;
  const r = a.map((v, k) => h00 * v + h10 * dt * ma[k] + h01 * b[k] + h11 * dt * mb[k]);
  r[2] = Math.exp(r[2]);
  return r;
}

/* ============================ S1 ============================ */
const S1 = {
  photo: { x: 830, y: 650, rot: -2.5 * DEG, win: { x: -118, y: -160, w: 236, h: 290 } },
  k: 290 / 1080, // 照片画框 ↔ S2 画面的比例
};
S1.photoM = M.mul(M.t(S1.photo.x, S1.photo.y), M.r(S1.photo.rot));
// 推进照片的终点：S2 恰好铺满全屏
{
  const c = M.ap(S1.photoM, 0, -15);
  S1.endCam = [c[0], c[1], 1 / S1.k, -S1.photo.rot];
}
S1.camKeys = [
  [0, [960, 548, 1.0, 0]],
  [3.1, [918, 592, 1.1, 0.004]],
  [6.15, [842, 630, 1.66, 0.024]],
  [7.3, S1.endCam],
];
S1.camAt = t => {
  const c = camSpl(t, S1.camKeys);
  const d = drift(t, 1 - prog(t, 6.0, 7.1), 1);
  return cam(c[0] + d[0] / c[2], c[1] + d[1] / c[2], c[2], c[3] + d[2]);
};

function buildS1(L) {
  const s = addScene({ name: 'S1', t0: 0, t1: 7.42, roots: [L.s1, L.s1o] });
  const world = G(L.s1);
  const over = G(L.s1o);
  // 墙
  lgrad('g-s1-wall', [[0, '#3a2a1e'], [0.4, '#6e5139'], [0.75, '#62472f'], [1, '#4c3625']]);
  el('rect', { x: -400, y: -400, width: 2720, height: 1900, fill: 'url(#g-s1-wall)' }, world);
  el('rect', { x: -400, y: -400, width: 2720, height: 1900, fill: 'url(#pat-grit-l)', opacity: 0.6 }, world);
  el('rect', { x: -400, y: -400, width: 2720, height: 1900, fill: 'url(#pat-grit)', opacity: 0.35 }, world);
  // 窗洞进深
  const wcx = 1310, wsy = 400, wR = 350, wsill = 770;
  el('path', { d: `M${wcx - wR - 34},${wsill + 10}L${wcx - wR - 34},${wsy}A${wR + 34},${wR + 34} 0 0 1 ${wcx + wR + 34},${wsy}L${wcx + wR + 34},${wsill + 10}Z`, fill: '#241810' }, world);
  el('path', { d: `M${wcx - wR - 34},${wsill + 10}L${wcx - wR - 34},${wsy}A${wR + 34},${wR + 34} 0 0 1 ${wcx + wR + 34},${wsy}`, fill: 'none', stroke: '#8a6a4a', 'stroke-width': 3, opacity: 0.5 }, world);
  // 窗台
  el('rect', { x: wcx - wR - 50, y: wsill, width: 2 * wR + 100, height: 26, fill: '#3b2819' }, world);
  el('rect', { x: wcx - wR - 50, y: wsill, width: 2 * wR + 100, height: 4, fill: '#9a7552', opacity: 0.6 }, world);
  // 炕桌
  lgrad('g-s1-tabv', [[0, '#000', 0.55], [0.12, '#000', 0.1], [1, '#000', 0.5]]);
  el('rect', { x: -400, y: 800, width: 2720, height: 700, fill: 'url(#pat-wood)' }, world);
  el('rect', { x: -400, y: 800, width: 2720, height: 700, fill: 'url(#g-s1-tabv)' }, world);
  el('rect', { x: -400, y: 796, width: 2720, height: 8, fill: '#0e0805', opacity: 0.8 }, world);
  el('rect', { x: -400, y: 804, width: 2720, height: 3, fill: '#c38d5a', opacity: 0.35 }, world);
  lgrad('g-s1-wallfoot', [[0, '#000', 0], [1, '#000', 0.55]]);
  el('rect', { x: -400, y: 700, width: 2720, height: 98, fill: 'url(#g-s1-wallfoot)' }, world);

  // 右侧桌上：斯诺的笔记本与相机（暗处，S4 再现）
  const nb = G(world, { transform: 'translate(1470,930) rotate(-7) scale(0.52)' });
  softRect(nb, -360, -226, 760, 500, 0.55);
  el('rect', { x: -392, y: -262, width: 784, height: 524, rx: 14, fill: '#3b2616' }, nb);
  el('rect', { x: -376, y: -250, width: 752, height: 500, fill: '#d9ccb0' }, nb);
  el('rect', { x: -376, y: -250, width: 752, height: 500, fill: 'url(#pat-paper)', opacity: 0.6 }, nb);
  lgrad('g-s1-spine', [[0, '#000', 0], [0.5, '#000', 0.3], [1, '#000', 0]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  el('rect', { x: -14, y: -250, width: 28, height: 500, fill: 'url(#g-s1-spine)' }, nb);
  const cm = G(world, { transform: 'translate(1780,845) rotate(3) scale(0.42)' });
  el('rect', { x: -300, y: -170, width: 600, height: 295, rx: 26, fill: '#121212' }, cm);
  el('rect', { x: -300, y: -170, width: 600, height: 50, rx: 22, fill: '#6d6d68' }, cm);
  el('circle', { cx: 0, cy: 10, r: 112, fill: '#0c0c0c' }, cm);
  el('circle', { cx: 0, cy: 10, r: 96, fill: '#7d7d78' }, cm);
  el('circle', { cx: 0, cy: 10, r: 60, fill: '#10131f' }, cm);

  // 油灯
  const lamp = buildLamp(world, 520, 884, 1.12);

  // 照片（底层：阴影）
  const pg = G(world, { transform: M.str(S1.photoM) });
  softRect(pg, -150 + 26, -195 + 18, 300, 390, 0.65);
  el('rect', { x: -150, y: -195, width: 300, height: 390, fill: '#1a100a' }, pg);

  // 灯光明暗（油灯为唯一光源）
  const fx0 = lamp.tip[0], fy0 = lamp.tip[1] + 12;
  const darkG = rgrad('g-s1-dark', [[0, '#050302', 0], [0.16, '#050302', 0.04], [0.42, '#050302', 0.42], [0.72, '#050302', 0.82], [1, '#050302', 0.94]],
    { gradientUnits: 'userSpaceOnUse', cx: fx0, cy: fy0, r: 900 });
  const dark = el('rect', { x: -400, y: -400, width: 2720, height: 1900, fill: 'url(#g-s1-dark)' }, world);
  const pre = el('rect', { x: -400, y: -400, width: 2720, height: 1900, fill: '#050302' }, world);

  // 窗（自发光：黄昏的冷蓝）
  lgrad('g-s1-paper', [[0, '#95abc6'], [0.45, '#7890b0'], [1, '#4f6384']]);
  const win = buildArchWindow(world, { cx: wcx, sy: wsy, R: wR, sill: wsill, paper: 'url(#g-s1-paper)', paperTex: 0.5, bar: '#140d08', barW: 6.5 });
  el('path', { d: papercutPath(wcx, 590, 92), fill: '#861a10', 'fill-rule': 'evenodd' }, win.under);
  el('path', { d: papercutPath(wcx, 590, 92), fill: 'none', stroke: '#ff9a7a', 'stroke-width': 1, opacity: 0.25 }, win.under);
  rgrad('g-s1-winglow', [[0, '#9fb6d6', 0.38], [0.5, '#7d97bd', 0.12], [1, '#7d97bd', 0]], { gradientUnits: 'userSpaceOnUse', cx: wcx, cy: 460, r: 760 });
  el('rect', { x: 500, y: -300, width: 1800, height: 1300, fill: 'url(#g-s1-winglow)' }, world);
  const winSheen = el('path', { d: win.outline, fill: '#fff', opacity: 0.05 }, world);

  // 灯焰
  const flame = buildFlame(world, { halo: 300 });

  /* ---------- 上层：照片卡纸、画框、玻璃反光、人像素材位 ---------- */
  const po = G(over, { transform: M.str(S1.photoM) });
  const wn = S1.photo.win;
  const cpId = uid('cp');
  el('rect', { x: wn.x, y: wn.y, width: wn.w, height: wn.h }, el('clipPath', { id: cpId }, DEFS));
  const picFx = G(po, { 'clip-path': `url(#${cpId})` });
  // 人像素材位（为空时显示照片里的黄土风景，即 S2）
  const portrait = G(picFx, { style: 'isolation:isolate' });
  let portraitImg = null;
  if (MATERIALS.li) {
    portraitImg = el('image', { href: MATERIALS.li, x: wn.x, y: wn.y, width: wn.w, height: wn.h, preserveAspectRatio: 'xMidYMid slice', style: 'filter:grayscale(1) contrast(1.06) brightness(1.02)' }, portrait);
    el('rect', { x: wn.x, y: wn.y, width: wn.w, height: wn.h, fill: '#cac8c3', style: 'mix-blend-mode:color', opacity: 0.12 }, portrait);
  }
  rgrad('g-s1-picvig', [[0, '#1a0f06', 0], [0.6, '#1a0f06', 0.12], [1, '#1a0f06', 0.7]], { r: 0.72 });
  const picAge = G(picFx);
  el('rect', { x: wn.x, y: wn.y, width: wn.w, height: wn.h, fill: 'url(#g-s1-picvig)' }, picAge);
  el('rect', { x: wn.x, y: wn.y, width: wn.w, height: wn.h, fill: 'url(#pat-grit)', opacity: 0.4 }, picAge);
  el('path', { d: `M${wn.x + 30},${wn.y}L${wn.x + 60},${wn.y + wn.h}M${wn.x + 170},${wn.y}l-14,${wn.h}`, stroke: '#f6ead0', 'stroke-width': 0.8, opacity: 0.25 }, picAge);
  const picWarm = el('rect', { x: wn.x, y: wn.y, width: wn.w, height: wn.h, fill: '#2a1407', opacity: 0.3 }, picFx);
  // 卡纸与画框
  const mat = G(po);
  lgrad('g-s1-frame', [[0, '#8a5c34'], [0.3, '#4a2e18'], [1, '#26170c']], { x1: 0, y1: 0, x2: 1, y2: 1 });
  el('path', { d: `M-150,-195h300v390h-300ZM-134,-179v358h268v-358Z`, fill: 'url(#g-s1-frame)', 'fill-rule': 'evenodd' }, mat);
  el('path', { d: `M-150,-195h300v390h-300ZM-134,-179v358h268v-358Z`, fill: 'url(#pat-wood)', 'fill-rule': 'evenodd', opacity: 0.35 }, mat);
  el('path', { d: `M-134,-179h268v358h-268Z M${wn.x},${wn.y}v${wn.h}h${wn.w}v${-wn.h}Z`, fill: '#e6d7b8', 'fill-rule': 'evenodd' }, mat);
  el('path', { d: `M-134,-179h268v358h-268Z M${wn.x},${wn.y}v${wn.h}h${wn.w}v${-wn.h}Z`, fill: 'url(#pat-paper)', 'fill-rule': 'evenodd', opacity: 0.8 }, mat);
  el('rect', { x: wn.x - 2, y: wn.y - 2, width: wn.w + 4, height: wn.h + 4, fill: 'none', stroke: '#a08058', 'stroke-width': 1.2, opacity: 0.8 }, mat);
  softStroke(mat, `M${wn.x},${wn.y}h${wn.w}v${wn.h}h${-wn.w}Z`, '#000', 3, 0.3);
  lgrad('g-s1-matlight', [[0, '#ffcf8a', 0.1], [0.6, '#000', 0.12], [1, '#000', 0.42]], { x1: 0, y1: 0, x2: 1, y2: 0.3 });
  el('rect', { x: -150, y: -195, width: 300, height: 390, fill: 'url(#g-s1-matlight)' }, mat);
  lgrad('g-glare', [[0, '#fff', 0], [0.45, '#fff', 0], [0.5, '#fff', 0.13], [0.56, '#fff', 0], [1, '#fff', 0]], { x1: 0, y1: 0, x2: 1, y2: 1 });
  const glare = el('rect', { x: -134, y: -179, width: 268, height: 358, fill: 'url(#g-glare)' }, mat);
  // 点灯之前，相框也在暗处
  const photoDark = el('rect', { x: -160, y: -205, width: 320, height: 410, fill: '#050302', opacity: 0.9 }, po);

  s.slots = [{
    key: 'li', label: '人像位 · 李长林', active: t => t > 1.2 && t < 6.95,
    quad: t => { const m = M.mul(S1.camAt(t), S1.photoM); return [[wn.x, wn.y], [wn.x + wn.w, wn.y], [wn.x + wn.w, wn.y + wn.h], [wn.x, wn.y + wn.h]].map(p => M.ap(m, p[0], p[1])); },
  }];

  // 灯光里的浮尘
  const motes = seeds(90, 17, R => ({ x: 200 + R() * 1100, y: 250 + R() * 650, r: 0.6 + R() * 1.8, sp: 0.2 + R() * 0.6, ph: R() * 100, a: 0.3 + R() * 0.6 }));

  s.update = t => {
    const m = S1.camAt(t);
    world.setAttribute('transform', M.str(m));
    over.setAttribute('transform', M.str(m));
    // 点灯：0.25s 火星，1.8s 光满屋
    const ign = E.out3(prog(t, 0.25, 1.1));
    const light = E.out2(prog(t, 0.3, 2.0));
    const fl = flick(t, 3);
    darkG.setAttribute('r', r1(lerp(60, 1150, light) * (0.97 + 0.03 * fl)));
    vis(pre, 1 - E.out2(prog(t, 0.25, 0.9)) * 1);
    flame.update(t, lamp.tip[0], lamp.tip[1] + 4, lerp(0.2, 1.12, E.outBack(prog(t, 0.25, 0.9))), ign * (0.9 + 0.1 * fl), 0, 3);
    winSheen.setAttribute('opacity', (0.03 + 0.03 * light).toFixed(3));
    // 照片：推进时老照片质感逐渐退去，画中风景“活”过来
    const push = prog(t, 6.2, 7.2);
    picAge.setAttribute('opacity', (1 - E.io2(prog(t, 6.0, 6.8))).toFixed(3));
    picWarm.setAttribute('opacity', (0.32 * (1 - E.io2(prog(t, 5.8, 6.8))) * (0.6 + 0.4 * light)).toFixed(3));
    vis(mat, 1 - E.io2(prog(t, 6.7, 7.05)));
    vis(photoDark, 0.92 * (1 - E.out2(prog(t, 0.3, 1.6))));
    glare.setAttribute('opacity', (1 - prog(t, 6.3, 6.8)).toFixed(3));
    if (portraitImg) vis(portrait, 1 - E.sine(prog(t, 6.0, 6.85)));
    glare.setAttribute('x', r1(-134 + (t - 3) * 14));
  };
  s.fx = (ctx, t) => {
    const m = S1.camAt(t);
    const light = E.out2(prog(t, 0.3, 2.0)) * (1 - prog(t, 6.6, 7.2));
    if (light <= 0) return;
    ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
    for (const p of motes) {
      const x = p.x + Math.sin(t * p.sp + p.ph) * 30 + t * 6 * p.sp;
      const y = p.y + Math.cos(t * p.sp * 0.7 + p.ph) * 22 - t * 4 * p.sp;
      const d = Math.hypot(x - 566, y - 690);
      const a = p.a * light * clamp(1 - d / 820) * (0.6 + 0.4 * Math.sin(t * 2 + p.ph));
      if (a <= 0.01) continue;
      ctx.fillStyle = `rgba(255,214,160,${a.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(x, y, p.r, 0, 6.283); ctx.fill();
    }
  };
  return s;
}

/* ============================ S2 ============================ */
const S2 = { bowl: { x: 1000, y: 830 } };
{
  // 碗上裂缝的世界坐标、中点、方向（用于“钻进裂缝”的转场）
  const c = [[70, 53], [76, 68], [72, 80], [81, 95], [78, 108], [88, 122], [85, 134], [95, 148]].map(p => [p[0] + S2.bowl.x, p[1] + S2.bowl.y]);
  const a = c[0], b = c[c.length - 1];
  S2.crackMid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  S2.crackRot = Math.PI / 2 - Math.atan2(b[1] - a[1], b[0] - a[0]);
  S2.crackLen = Math.hypot(b[0] - a[0], b[1] - a[1]);
}
S2.endS = 850 / S2.crackLen;
S2.camKeys = [
  [7.3, [960, 540, 1.0, 0]],
  [9.25, [1018, 815, 1.95, 0.01]],
  [10.3, [S2.crackMid[0], S2.crackMid[1], S2.endS, S2.crackRot]],
];
S2.camAt = t => {
  if (t < 7.3) {
    // 照片阶段：跟随 S1 相机与相框
    return M.chain(S1.camAt(t), S1.photoM, M.t(0, -15), M.s(S1.k), M.t(-W / 2, -H / 2));
  }
  const c = camSpl(t, S2.camKeys);
  const d = drift(t, prog(t, 7.3, 8.3) * (1 - prog(t, 9.2, 10.0)), 7);
  return cam(c[0] + d[0] / c[2], c[1] + d[1] / c[2], c[2], c[3] + d[2]);
};

function buildS2(L) {
  const s = addScene({ name: 'S2', t0: 0, t1: 10.42, roots: [L.s2] });
  // 照片窗口遮罩（S2 自身坐标）
  const mid = uid('m');
  const mask = el('mask', { id: mid, maskUnits: 'userSpaceOnUse', x: -3000, y: -3000, width: 8000, height: 8000 }, DEFS);
  const mg = lgrad('g-s2m', [[0, '#000'], [0, '#fff'], [1, '#fff'], [1, '#000']], { gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 1920, y2: 0 });
  const mstops = mg.querySelectorAll('stop');
  const mrect = el('rect', { x: 515, y: 0, width: 890, height: 1080, fill: 'url(#g-s2m)' }, mask);
  const world = G(L.s2, { mask: `url(#${mid})` });
  // 天
  lgrad('g-s2-sky', [[0, '#e3d2ad'], [0.5, '#cfb68c'], [1, '#b89b73']]);
  el('rect', { x: -500, y: -500, width: 2920, height: 1200, fill: 'url(#g-s2-sky)' }, world);
  rgrad('g-s2-sun', [[0, '#fff4da', 0.8], [0.3, '#f6e0b4', 0.35], [1, '#f0d8a8', 0]]);
  el('circle', { cx: 1480, cy: 170, r: 380, fill: 'url(#g-s2-sun)' }, world);
  // 远山
  const ridge = (y0, amp, seed, step = 60) => {
    const pts = [];
    for (let x = -600; x <= 2600; x += step) pts.push([x, y0 - amp * (0.55 * Math.sin(x * 0.0021 + seed) + 0.3 * Math.sin(x * 0.0057 + seed * 2) + 0.15 * noise1(x * 0.01 + seed))]);
    return smooth(pts) + 'L2600,1500L-600,1500Z';
  };
  el('path', { d: ridge(470, 40, 1), fill: '#bca47e' }, world);
  lgrad('g-s2-haze', [[0, '#e0cca6', 0.55], [1, '#e0cca6', 0]]);
  el('rect', { x: -600, y: 380, width: 3200, height: 160, fill: 'url(#g-s2-haze)' }, world);
  el('path', { d: ridge(545, 55, 4), fill: '#a98e67' }, world);
  const tl = G(world, { opacity: 0.12, stroke: '#4b3824', 'stroke-width': 1.5, fill: 'none' });
  for (let k = 0; k < 7; k++) {
    const pts = [];
    for (let x = -600; x <= 2600; x += 80) pts.push([x, 548 + k * 18 - 55 * (0.55 * Math.sin(x * 0.0021 + 4) + 0.3 * Math.sin(x * 0.0057 + 8)) + k * k]);
    el('path', { d: smooth(pts) }, tl);
  }
  // 枯树
  const tree = G(world, { opacity: 0.7 });
  const TR = rng(41);
  const branch = (x, y, a, len, w, depth) => {
    const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
    el('path', { d: `M${r1(x)},${r1(y)}Q${r1((x + x2) / 2 + (TR() - 0.5) * len * 0.3)},${r1((y + y2) / 2)} ${r1(x2)},${r1(y2)}`, stroke: '#4d3d2c', 'stroke-width': r1(w), 'stroke-linecap': 'round', fill: 'none' }, tree);
    if (depth > 0) {
      const n = depth > 3 ? 2 : 2 + (TR() < 0.4 ? 1 : 0);
      for (let i = 0; i < n; i++) branch(x2, y2, a + (TR() - 0.5) * 1.1 + (i - (n - 1) / 2) * 0.5, len * (0.62 + TR() * 0.15), w * 0.62, depth - 1);
    }
  };
  branch(420, 560, -Math.PI / 2 - 0.08, 95, 11, 5);
  // 近处山体与窑洞
  lgrad('g-s2-cliff', [[0, '#b1906a'], [1, '#8d6c4a']]);
  el('path', { d: 'M880,700C980,640 1080,520 1180,470C1300,420 1500,380 1700,372C1900,366 2100,380 2400,400L2400,900L880,900Z', fill: 'url(#g-s2-cliff)' }, world);
  el('path', { d: 'M1180,520L1760,500L1770,740L1170,745Z', fill: '#9b7a55' }, world);
  el('path', { d: 'M1180,520L1760,500L1770,740L1170,745Z', fill: 'url(#pat-grit)', opacity: 0.45 }, world);
  const streaks = G(world, { stroke: '#6f5236', 'stroke-width': 2, opacity: 0.25 });
  for (let i = 0; i < 16; i++) { const x = 1195 + i * 36 + (i % 3) * 7; el('path', { d: `M${x},${505 + (i % 4) * 4}l${(i % 2) * 3 - 1},${60 + (i * 37) % 90}` }, streaks); }
  const arch = (cx, bot, w, h) => `M${cx - w / 2},${bot}L${cx - w / 2},${bot - h + w / 2}A${w / 2},${w / 2} 0 0 1 ${cx + w / 2},${bot - h + w / 2}L${cx + w / 2},${bot}Z`;
  el('path', { d: arch(1340, 742, 170, 200), fill: '#7e603f' }, world);
  el('path', { d: arch(1340, 742, 150, 186), fill: '#2b1d12' }, world);
  el('path', { d: 'M1276,742V640H1330V742Z', fill: '#4a3522' }, world);
  el('path', { d: 'M1284,742V646M1296,742V644M1308,742V643M1320,742V642', stroke: '#2a1c11', 'stroke-width': 2 }, world);
  el('path', { d: 'M1345,600h50v40h-50Z', fill: '#8a7658' }, world);
  el('path', { d: 'M1345,600h50v40h-50ZM1353,600v40M1362,600v40M1370,600v40M1378,600v40M1387,600v40M1345,610h50M1345,620h50M1345,630h50', stroke: '#2b1d12', 'stroke-width': 2, fill: 'none' }, world);
  el('path', { d: 'M1365,612l12,6l-6,10l-10,-4Z', fill: '#2b1d12' }, world);
  el('path', { d: arch(1580, 742, 120, 150), fill: '#7a5c3c' }, world);
  el('path', { d: arch(1580, 742, 104, 138), fill: '#241810' }, world);
  // 土墙
  el('path', { d: 'M960,780L962,712L1060,708L1066,700L1130,705L1150,730L1175,728L1180,702L1520,708L1528,716L1800,712L1802,780Z', fill: '#a4855d' }, world);
  el('path', { d: 'M960,780L962,712L1060,708L1066,700L1130,705L1150,730L1175,728L1180,702L1520,708L1528,716L1800,712L1802,780Z', fill: 'url(#pat-grit)', opacity: 0.5 }, world);
  el('path', { d: 'M962,712L1060,708L1066,700L1130,705L1150,730L1175,728L1180,702L1520,708L1528,716L1800,712', fill: 'none', stroke: '#cdb088', 'stroke-width': 2, opacity: 0.6 }, world);
  // 地面
  lgrad('g-s2-ground', [[0, '#b0936a'], [0.4, '#9c7e57'], [1, '#6f5438']]);
  el('path', { d: 'M-500,720C200,690 700,700 1000,760C1300,800 1800,760 2500,740L2500,1600L-500,1600Z', fill: 'url(#g-s2-ground)' }, world);
  el('path', { d: 'M-500,720C200,690 700,700 1000,760C1300,800 1800,760 2500,740L2500,1600L-500,1600Z', fill: 'url(#pat-grit-l)', opacity: 0.5 }, world);
  el('path', { d: 'M-500,720C200,690 700,700 1000,760C1300,800 1800,760 2500,740L2500,1600L-500,1600Z', fill: 'url(#pat-grit)', opacity: 0.35 }, world);
  const grass = G(world, { stroke: '#6b5334', 'stroke-width': 1.6, fill: 'none', opacity: 0.7 });
  const GR = rng(12);
  for (let i = 0; i < 26; i++) {
    const gx = -200 + GR() * 2300, gy = 760 + GR() * 300;
    if (Math.abs(gx - 1000) < 380 && gy > 780) continue;
    let d = '';
    for (let j = 0; j < 5; j++) d += `M${r1(gx + j * 3)},${r1(gy)}q${r1((GR() - 0.5) * 10)},-${r1(10 + GR() * 16)} ${r1((GR() - 0.3) * 14)},-${r1(18 + GR() * 18)}`;
    el('path', { d }, grass);
  }
  // 石板
  softEllipse(world, 1030, 950, 440, 110, 0.45);
  lgrad('g-s2-stone', [[0, '#8c7f6c'], [1, '#5d5244']]);
  el('path', { d: 'M640,905C700,860 1260,850 1380,880C1430,905 1420,960 1360,985C1200,1020 780,1015 690,990C630,970 610,930 640,905Z', fill: 'url(#g-s2-stone)' }, world);
  el('path', { d: 'M640,905C700,860 1260,850 1380,880C1430,905 1420,960 1360,985C1200,1020 780,1015 690,990C630,970 610,930 640,905Z', fill: 'url(#pat-grit)', opacity: 0.55 }, world);
  el('path', { d: 'M650,902C720,866 1250,856 1372,884', fill: 'none', stroke: '#c8baa0', 'stroke-width': 2, opacity: 0.5 }, world);
  // 借据（被碗压着）
  const deedM = M.chain(M.t(1225, 905), M.r(174 * DEG), [1, 0, Math.tan(-6 * DEG), 1, 0, 0], M.s(0.20, 0.35714));
  const deedG = G(world, { transform: M.str(deedM) });
  softRect(deedG, -520, -380, 1000, 700, 0.4);
  el('image', { href: MATERIALS.deed || DEED_URL(), x: -500, y: -350, width: 1000, height: 700, preserveAspectRatio: 'none' }, deedG);
  el('rect', { x: -500, y: -350, width: 1000, height: 700, fill: '#2c1c0c', opacity: 0.22 }, deedG);
  // 碗
  buildBowl(world, { x: S2.bowl.x, y: S2.bowl.y, s: 1, cracked: true, grains: 9 });
  // 旧照片的偏色与雾
  const haze = el('rect', { x: -500, y: -500, width: 2920, height: 2100, fill: '#d8c2a0', opacity: 0.12 }, world);

  const dust = seeds(160, 23, R => ({ x: R() * 2600 - 300, y: 380 + R() * 800, r: 0.6 + R() * 2.2, v: 60 + R() * 160, ph: R() * 50, a: 0.15 + R() * 0.35 }));
  const puffs = seeds(10, 29, R => ({ x: R() * 2400, y: 700 + R() * 360, r: 60 + R() * 120, v: 90 + R() * 80, a: 0.06 + R() * 0.06 }));

  s.slots = [{
    key: 'deed', label: '史料位 · 契约/借据', active: t => t > 7.35 && t < 9.9,
    quad: t => { const m = M.mul(S2.camAt(t), deedM); return [[-500, -350], [500, -350], [500, 350], [-500, 350]].map(p => M.ap(m, p[0], p[1])); },
  }];
  s.update = t => {
    const m = S2.camAt(t);
    world.setAttribute('transform', M.str(m));
    // 照片窗口 → 全屏（边缘羽化）
    const k = E.io2(prog(t, 6.8, 7.3));
    const x0 = lerp(515, -80, k), x1 = lerp(1405, 2000, k), fth = 260 * Math.sin(Math.PI * Math.min(k, 0.5)) * (k < 1 ? 1 : 0);
    set(mrect, { x: r1(x0 - fth), width: r1(x1 - x0 + 2 * fth), y: r1(lerp(0, -80, k)), height: r1(lerp(1080, 1240, k)) });
    set(mg, { x1: r1(x0 - fth), x2: r1(x1 + fth) });
    const span = x1 - x0 + 2 * fth, f = span > 0 ? fth / span : 0;
    mstops[1].setAttribute('offset', f.toFixed(4));
    mstops[2].setAttribute('offset', (1 - f).toFixed(4));
    haze.setAttribute('opacity', (0.12 - 0.07 * prog(t, 7.3, 8.5)).toFixed(3));
  };
  s.fx = (ctx, t) => {
    if (t < 7.2) return;
    const live = prog(t, 7.2, 8.2) * (1 - prog(t, 9.9, 10.3));
    if (live <= 0) return;
    const m = S2.camAt(t);
    ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
    const tt = t - 7.2;
    for (const p of puffs) {
      const x = wrap(p.x - tt * p.v, 2800) - 400, y = p.y + Math.sin(tt + p.x) * 12;
      const g = ctx.createRadialGradient(x, y, 0, x, y, p.r);
      g.addColorStop(0, `rgba(214,190,150,${(p.a * live).toFixed(3)})`);
      g.addColorStop(1, 'rgba(214,190,150,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - p.r, y - p.r, p.r * 2, p.r * 2);
    }
    for (const p of dust) {
      const x = wrap(p.x - tt * p.v, 2800) - 400;
      const y = p.y + Math.sin(tt * 1.3 + p.ph) * 14 - tt * 6;
      ctx.fillStyle = `rgba(226,205,170,${(p.a * live).toFixed(3)})`;
      ctx.fillRect(x, y, p.r * 2.4, p.r * 0.9);
    }
  };
  return s;
}

/* 契约画布（程序生成，供 S2 与 S8 共用） */
let _deedCanvas = null, _deedURL = null;
function DEED_CANVAS() { if (!_deedCanvas) _deedCanvas = drawContract(1000, 700, 31); return _deedCanvas; }
function DEED_URL() { if (!_deedURL) _deedURL = DEED_CANVAS().toDataURL('image/png'); return _deedURL; }
