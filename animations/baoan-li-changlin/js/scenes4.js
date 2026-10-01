'use strict';
/* =============================================================
 * scenes4.js —— 38.6 ~ 53.6 秒：黄土高原夜景（同一空间，镜头连续运动）
 * S8  红星之光点燃借据；纸烧尽处，窑洞的窗一扇扇亮起（是为谁而战——为了让穷苦人不再受欺负）
 * S9  万家灯火升起的火星汇成一簇火苗（正是这份）
 * S10 火苗沿山路前行，身后亮起一条出路，天边泛白（为穷苦百姓谋出路的信念）
 * S11 暴风雨扑来，火苗压低却不灭；雨停，火苗落入山梁（支撑他直面苦难与牺牲）
 * ============================================================= */

const PL = { anchor: [1250, 700] };
PL.roadPts = [[1470, 895], [1760, 850], [2120, 878], [2480, 808], [2840, 830], [3200, 760], [3560, 772], [3900, 706], [4250, 676], [4560, 645], [4830, 630]];
PL.road = makeTrack(PL.roadPts, 30);
PL.flameT = [46.25, 50.3];
PL.uF = t => E.sine(prog(t, PL.flameT[0], PL.flameT[1]));
PL.track = u => { const p = PL.road.at(u); return [p[0] + 90, 0.45 * p[1] + 330, lerp(1.0, 0.95, u), 0]; };
{
  const a = PL.track(0), b = PL.track(1);
  PL.keysA = [[38.55, [1235, 720, 1.1, 0]], [43.9, [1290, 690, 1.0, 0]], [45.5, [1350, 520, 1.0, 0]], [PL.flameT[0], a]];
  PL.keysB = [[PL.flameT[1], b], [51.9, [b[0] + 90, b[1] + 10, 0.98, 0]], [53.5, [b[0] + 170, b[1] + 180, 1.14, 0.01]]];
}
PL.cam = t => {
  if (t <= PL.flameT[0]) return camSpl(t, PL.keysA);
  if (t >= PL.flameT[1]) return camSpl(t, PL.keysB);
  return PL.track(PL.uF(t));
};
/** 视差图层的矩阵：f=1 为中景（山路所在） */
PL.layerM = (t, f) => {
  const c = PL.cam(t), [ax, ay] = PL.anchor;
  return cam(ax + (c[0] - ax) * f, ay + (c[1] - ay) * f, 1 + (c[2] - 1) * f, c[3] * f);
};

function ridgeLine(x0, x1, base, bumps, seed, step = 40) {
  const R = rng(seed), hills = [];
  for (let x = x0; x <= x1; x += bumps.spacing * (0.6 + R() * 0.8)) hills.push([x, bumps.h * (0.45 + R() * 0.75), bumps.w * (0.6 + R() * 0.8)]);
  const pts = [];
  for (let x = x0; x <= x1; x += step) {
    let y = base;
    for (const [c, h, w] of hills) y -= h * Math.exp(-(((x - c) / w) ** 2));
    pts.push([x, y]);
  }
  return pts;
}
const ridgeY = (pts, x) => {
  const i = clamp(Math.floor((x - pts[0][0]) / (pts[1][0] - pts[0][0])), 0, pts.length - 2);
  const a = pts[i], b = pts[i + 1];
  return lerp(a[1], b[1], clamp((x - a[0]) / (b[0] - a[0])));
};

function buildS8(L) {
  const s = addScene({ name: 'S8', t0: 38.55, t1: 53.62, roots: [L.s8, L.flame] });
  const root = G(L.s8);
  const layers = {};
  const mk = (name, f) => { layers[name] = { g: G(root), f }; return layers[name].g; };
  /* 天空（几乎不动） */
  const sky = mk('sky', 0.06);
  lgrad('g-pl-sky', [[0, '#060a16'], [0.5, '#0f1630'], [1, '#232c4c']]);
  el('rect', { x: -1400, y: -1200, width: 5400, height: 2600, fill: 'url(#g-pl-sky)' }, sky);
  rgrad('g-pl-dawn', [[0, '#ffcf96', 0.9], [0.25, '#e8906a', 0.45], [0.6, '#8a5a7a', 0.18], [1, '#3a3a6a', 0]], { cx: 0.5, cy: 1, r: 0.9 });
  const dawn = el('ellipse', { cx: 1700, cy: 760, rx: 1500, ry: 620, fill: 'url(#g-pl-dawn)', opacity: 0 }, sky);
  lgrad('g-pl-wash', [[0, '#3c3458', 0], [0.55, '#9a5a64', 0.5], [1, '#e39668', 0.85]]);
  const dawnWash = el('rect', { x: -1400, y: -600, width: 5400, height: 1500, fill: 'url(#g-pl-wash)', opacity: 0 }, sky);
  const starsG = G(sky);
  const stars = seeds(190, 131, R => ({ x: -500 + R() * 3600, y: -300 + R() * 950, r: 0.5 + R() * 1.6, ph: R() * 10 }));
  stars.forEach(st => { st.e = el('circle', { cx: r1(st.x), cy: r1(st.y), r: st.r, fill: '#dfe6ff' }, starsG); });
  const guide = G(sky, { transform: 'translate(1180,330)' });
  el('circle', { r: 90, fill: 'url(#g-glow-red)', opacity: 0.55 }, guide);
  el('path', { d: 'M0,-34L3,-3L34,0L3,3L0,34L-3,3L-34,0L-3,-3Z', fill: '#ffe2c0', opacity: 0.9 }, guide);
  el('circle', { r: 4.5, fill: '#fff4e4' }, guide);
  /* 远山、次远山、中景、近景 */
  const layerDefs = [
    ['far', 0.32, -1400, 4800, 640, { spacing: 260, h: 120, w: 240 }, '#262f52', 5],
    ['mfar', 0.6, -1200, 6400, 720, { spacing: 300, h: 150, w: 260 }, '#1b223f', 7],
    ['mid', 1.0, -800, 7400, 800, { spacing: 340, h: 190, w: 300 }, '#141a31', 9],
    ['near', 1.38, -800, 9400, 1075, { spacing: 380, h: 120, w: 320 }, '#0c1020', 11],
  ];
  const ridges = {};
  layerDefs.forEach(([name, f, x0, x1, base, bumps, col, seed]) => {
    const g0 = mk(name, f);
    let pts = ridgeLine(x0, x1, base, bumps, seed);
    if (name === 'mid') pts = pts.map(([x, y]) => [x, x > 4300 ? lerp(y, 648, smoothstep(4300, 4700, x)) : y]);
    ridges[name] = pts;
    const d = smooth(pts) + `L${x1},2600L${x0},2600Z`;
    const gid = uid('g');
    lgrad(gid, [[0, mixHex(col, '#6f82b8', 0.22)], [0.35, col], [1, mixHex(col, '#000000', 0.45)]], { gradientUnits: 'userSpaceOnUse', x1: 0, y1: base - 260, x2: 0, y2: base + 520 });
    el('path', { d, fill: `url(#${gid})` }, g0);
    const tg = G(g0, { stroke: '#8aa0d0', 'stroke-width': name === 'far' ? 1.2 : 1.6, fill: 'none', opacity: name === 'far' ? 0.04 : 0.05 });
    for (let k = 1; k < 9; k++) {
      const off = k * (name === 'near' ? 38 : 26) + k * k * 3;
      el('path', { d: smooth(pts.filter((p, i) => i % 2 === 0).map(([x, y]) => [x, y + off + 12 * Math.sin(x * 0.004 + k)])) }, tg);
    }
    el('path', { d: smooth(pts), fill: 'none', stroke: '#9fb2e0', 'stroke-width': 2, opacity: name === 'far' ? 0.1 : 0.14 }, g0);
    if (name === 'mid') layers.mid.road = G(g0);
  });
  /* 窑洞（窗在夜里依次亮起） */
  rgrad('g-win-glow', [[0, '#ffd694', 0.75], [0.3, '#ffb05a', 0.28], [1, '#ff9a40', 0]]);
  const origin = [1250, 760];
  const caves = [];
  const addCaves = (name, xs, depthRows, sc, tBase) => {
    const g0 = layers[name].g, pts = ridges[name];
    for (const [xa, xb] of xs) {
      depthRows.forEach((dy, row) => {
        for (let x = xa + row * 18; x < xb; x += 62 * sc) {
          const y = Math.max(ridgeY(pts, x), ridgeY(pts, x + 44 * sc)) + dy * sc;
          if (hash1(Math.round(x) * 3 + row * 17) < 0.14) continue;
          const cg = G(g0, { transform: `translate(${r1(x)},${r1(y)}) scale(${sc})` });
          el('path', { d: 'M-27,0V-32A27,27 0 0 1 27,-32V0Z', fill: mixHex('#141a31', '#3a4468', 0.35) }, cg);
          el('path', { d: 'M-27,-32A27,27 0 0 1 27,-32', fill: 'none', stroke: '#4a557c', 'stroke-width': 2.5, opacity: 0.7 }, cg);
          el('rect', { x: -21, y: -24, width: 13, height: 24, fill: '#080a14' }, cg);
          const dark = el('path', { d: 'M-21,-32A21,21 0 0 1 21,-32ZM-4,-28H21V-8H-4Z', fill: '#0c1020' }, cg);
          const lit = G(cg, { opacity: 0 });
          el('circle', { cx: 4, cy: -30, r: 58, fill: 'url(#g-win-glow)' }, lit);
          el('path', { d: 'M-21,-32A21,21 0 0 1 21,-32ZM-4,-28H21V-8H-4Z', fill: '#ffc873' }, lit);
          el('path', { d: 'M0,-32L0,-53M0,-32L-14,-47M0,-32L14,-47M-12,-32A12,12 0 0 1 12,-32M4,-28V-8M12,-28V-8M-4,-18H21', fill: 'none', stroke: '#7a4420', 'stroke-width': 1.5, opacity: 0.85 }, lit);
          const dist = Math.hypot((x - origin[0]) * (name === 'mid' ? 1 : 1.6), y - origin[1]);
          caves.push({ lit, at: tBase + dist / 900 * 1.6 + hash1(caves.length * 13) * 0.5, seed: caves.length, x, y, layer: name });
        }
      });
    }
  };
  addCaves('mfar', [[700, 1150], [1500, 1900], [2600, 2900]], [70, 130], 0.62, 40.0);
  addCaves('mid', [[830, 1230], [1330, 1760], [2300, 2680], [3150, 3420], [3950, 4150]], [64, 132], 1, 39.85);
  addCaves('near', [[380, 700], [1850, 2150], [3300, 3500]], [70], 1.3, 40.6);
  /* 出路：火苗走过的山路 */
  const roadG = layers.mid.road;
  const roadGlow2 = el('path', { d: PL.road.d, fill: 'none', stroke: '#ffb35c', 'stroke-width': 46, opacity: 0.08, 'stroke-linecap': 'round' }, roadG);
  const roadGlow = el('path', { d: PL.road.d, fill: 'none', stroke: '#ffb35c', 'stroke-width': 22, opacity: 0.18, 'stroke-linecap': 'round' }, roadG);
  const roadMid = el('path', { d: PL.road.d, fill: 'none', stroke: '#ffd08a', 'stroke-width': 7, opacity: 0.75, 'stroke-linecap': 'round' }, roadG);
  const roadCore = el('path', { d: PL.road.d, fill: 'none', stroke: '#fff4da', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, roadG);
  const roadLen = roadCore.getTotalLength();
  [roadGlow2, roadGlow, roadMid, roadCore].forEach(p => { p.setAttribute('stroke-dasharray', `${roadLen} ${roadLen}`); p.setAttribute('stroke-dashoffset', roadLen); });
  const roadFaint = el('path', { d: PL.road.d, fill: 'none', stroke: '#6a7294', 'stroke-width': 3, opacity: 0.18, 'stroke-dasharray': '2 9' }, roadG);
  roadG.insertBefore(roadFaint, roadGlow2);
  /* 暴风雨（屏幕坐标） */
  const storm = G(root);
  const stormDark = el('rect', { x: -100, y: -100, width: 2120, height: 1280, fill: '#05070d', opacity: 0 }, storm);
  const cloudG = G(storm, { opacity: 0 });
  const cloudEls = [[200, 60, 760, 260], [900, 20, 880, 280], [1650, 80, 780, 270], [560, 240, 640, 180], [1350, 250, 700, 190]].map(([x, y, rx, ry]) => softEllipse(cloudG, x, y, rx, ry, 1, '#0a0d16'));
  const bolts = [[50.85, 1320, 1], [51.62, 620, 0.8]].map(([at, x0, amp], i) => {
    const R = rng(200 + i);
    let x = x0, y = -40, d = `M${x},${y}`, br = '';
    while (y < 560) { x += (R() - 0.5) * 90; y += 30 + R() * 50; d += `L${r1(x)},${r1(y)}`; if (R() < 0.25) { let bx = x, by = y; br += `M${r1(bx)},${r1(by)}`; for (let k = 0; k < 4; k++) { bx += (R() - 0.3) * 60; by += 20 + R() * 30; br += `L${r1(bx)},${r1(by)}`; } } }
    const g0 = G(storm, { opacity: 0 });
    softStroke(g0, d + br, '#c9d8ff', 12, 0.6);
    el('path', { d, fill: 'none', stroke: '#ffffff', 'stroke-width': 3.2 }, g0);
    el('path', { d: br, fill: 'none', stroke: '#eef3ff', 'stroke-width': 1.6 }, g0);
    return { at, g: g0, amp };
  });
  /* 火苗（信念），屏幕坐标 */
  const flame = buildFlame(L.flame, { halo: 190 });
  const flameGlowG = G(L.flame);
  const ember = el('circle', { r: 0, fill: 'url(#g-glow-gold)' }, flameGlowG);

  /* ---------- 借据燃烧（画布） ---------- */
  const BW = 250, BH = 175;
  const burn = new Float32Array(BW * BH);
  {
    const nz = tileFbm(256, 77, [[4, 0.5], [8, 0.3], [24, 0.2]]);
    const ig = [BW * 0.46, BH * 1.02];
    let mx = 0;
    for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) {
      const d = Math.hypot((x - ig[0]) * 0.85, y - ig[1]);
      const v = d / 220 * 0.78 + nz[(y % 256) * 256 + (x % 256)] * 0.42;
      burn[y * BW + x] = v;
      if (v > mx) mx = v;
    }
    let mn = Infinity;
    for (let i = 0; i < burn.length; i++) mn = Math.min(mn, burn[i]);
    for (let i = 0; i < burn.length; i++) burn[i] = (burn[i] - mn) / (mx - mn);
  }
  const maskC = makeCanvas(BW, BH), maskX = maskC.getContext('2d'), maskI = maskX.createImageData(BW, BH);
  const charC = makeCanvas(BW, BH), charX = charC.getContext('2d'), charI = charX.createImageData(BW, BH);
  const glowC = makeCanvas(BW, BH), glowX = glowC.getContext('2d'), glowI = glowX.createImageData(BW, BH);
  const paperC = makeCanvas(1000, 700), paperX = paperC.getContext('2d');
  let deedSrc = DEED_CANVAS();
  if (MATERIALS.deed) {
    const im = new Image();
    window.BURN_READY = new Promise(res => { im.onload = () => { deedSrc = im; res(); }; im.onerror = () => res(); });
    im.src = MATERIALS.deed;
  }
  const BT = [39.5, 42.95];
  const th = t => -0.03 + 1.12 * E.in2(prog(t, BT[0], BT[1]));
  const paperM = t => M.chain(M.t(960, 565), M.r(-3 * DEG), M.s(lerp(1.2, 1.12, E.sine(prog(t, 38.6, 43)))), M.t(-500, -350));
  const embers = seeds(360, 141, R => {
    const x = R() * 1000, y = R() * 700, v = burn[Math.floor(y / 4) * BW + Math.floor(x / 4)];
    const p = Math.sqrt(clamp((v + 0.03) / 1.12));
    return { x, y, at: lerp(BT[0], BT[1], p), vx: (R() - 0.5) * 70, vy: 60 + R() * 110, life: 1.4 + R() * 1.8, ph: R() * 6.28, r: 1 + R() * 2.2 };
  });
  const gather = seeds(150, 151, (R, i) => ({ cave: 0, at: 42.7 + R() * 1.6, vy: 30 + R() * 50, ph: R() * 6.28, r: 1.2 + R() * 2.2, conv: 44.25 + R() * 0.5, spin: (R() < 0.5 ? -1 : 1) * (2 + R() * 2), rad: 160 + R() * 260 }));
  const midCaves = () => caves.filter(c => c.layer !== 'near');
  const FLAME_C = [960, 395];

  s.slots = [{
    key: 'deed', label: '史料位 · 契约/借据（燃烧）', active: t => t > 38.9 && t < 41.8,
    quad: t => { const m = paperM(t); return [[0, 0], [1000, 0], [1000, 700], [0, 700]].map(p => M.ap(m, p[0], p[1])); },
  }];
  /* ---------- 每帧 ---------- */
  s.update = t => {
    for (const k in layers) layers[k].g.setAttribute('transform', M.str(PL.layerM(t, layers[k].f)));
    stars.forEach((st, i) => { if (i % 3 === 0) st.e.setAttribute('opacity', (0.45 + 0.4 * Math.sin(t * 1.3 + st.ph)).toFixed(2)); });
    guide.setAttribute('opacity', (0.55 + 0.45 * E.sine(prog(t, 39.2, 41))).toFixed(3));
    for (const c of caves) {
      const k = clamp((t - c.at) / 0.35);
      c.lit.setAttribute('opacity', k <= 0 ? '0' : (k * (0.88 + 0.12 * flick(t, c.seed))).toFixed(3));
    }
    // 出路
    const uF = PL.uF(t);
    [roadGlow2, roadGlow, roadMid, roadCore].forEach(p => p.setAttribute('stroke-dashoffset', (roadLen * (1 - uF)).toFixed(1)));
    dawn.setAttribute('opacity', clamp(0.15 * E.sine(prog(t, 45.8, 50.3)) + 0.45 * E.sine(prog(t, 48.5, 51)) * (1 - 0.6 * env(t, 50.2, 50.9, 52.3, 53.0)) + 0.7 * E.sine(prog(t, 52.3, 53.6))).toFixed(3));
    dawnWash.setAttribute('opacity', (0.55 * E.sine(prog(t, 52.4, 53.6))).toFixed(3));
    // 暴风雨
    const st = env(t, 50.2, 50.9, 52.3, 53.0);
    stormDark.setAttribute('opacity', (0.45 * st).toFixed(3));
    cloudG.setAttribute('opacity', (0.95 * st).toFixed(3));
    cloudEls.forEach((c, i) => c.setAttribute('transform', `translate(${r1((t - 50) * (i % 2 ? 40 : -30))},${r1(-160 * (1 - E.out2(prog(t, 50.1, 51.0))) - 200 * E.in2(prog(t, 52.2, 53.1)))})`));
    bolts.forEach(b => {
      const dt = t - b.at;
      const a = dt > 0 && dt < 0.22 ? (dt < 0.05 ? 1 : dt < 0.09 ? 0.3 : dt < 0.13 ? 0.9 : 1 - (dt - 0.13) / 0.09) : 0;
      b.g.setAttribute('opacity', clamp(a * b.amp).toFixed(3));
      if (a > 0) { POST.flash = Math.max(POST.flash, 0.28 * a * b.amp); POST.flashColor = '#cfdcff'; }
    });
    // 火苗
    let fx = FLAME_C[0], fy = FLAME_C[1], fs = 0, fi = 0, lean = 0;
    if (t < PL.flameT[0]) {
      const a = E.outBack(prog(t, 45.0, 45.75));
      fs = 2.1 * a; fi = clamp(a * 1.2);
      if (t > 45.75) { const mt = PL.layerM(t, 1), p = M.ap(mt, PL.roadPts[0][0], PL.roadPts[0][1] - 14), k = E.io2(prog(t, 45.75, PL.flameT[0])); fx = lerp(FLAME_C[0], p[0], k); fy = lerp(FLAME_C[1], p[1], k); fs = lerp(2.1, 1.7, k); }
    } else if (t < 52.7) {
      const mt = PL.layerM(t, 1), q = PL.road.at(uF), p = M.ap(mt, q[0], q[1] - 14);
      fx = p[0]; fy = p[1];
      fs = lerp(1.7, 1.35, uF) - 0.5 * E.sine(prog(t, 50.5, 51.2)) + 0.45 * E.sine(prog(t, 52.0, 52.6));
      fi = 1 - 0.25 * st;
      lean = st * (26 * noise1(t * 3.1) + 12 * Math.sin(t * 9));
    } else {
      const mt = PL.layerM(t, 1), q = PL.road.at(1), p = M.ap(mt, q[0], q[1] - 14), k = E.io2(prog(t, 52.7, 53.5));
      fx = lerp(p[0], 960, k); fy = lerp(p[1], 820, k); fs = lerp(1.35, 1.1, k); fi = 1 - E.in2(prog(t, 53.35, 53.62));
    }
    if (fs > 0.001 && fi > 0.001) { vis(flame.root, 1); flame.update(t, fx, fy, fs, fi, lean, 41); } else vis(flame.root, 0);
    set(ember, { cx: r1(fx), cy: r1(fy - 24 * fs), r: r1(34 * fs * fi) });
    S8.flamePos = [fx, fy];
  };
  s.fx = (ctx, t) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // 借据
    if (t < BT[1] + 0.1) {
      const tt = th(t), P = paperM(t);
      const on = E.sine(prog(t, 38.62, 39.05));
      for (let i = 0, n = BW * BH; i < n; i++) {
        const v = burn[i], j = i * 4;
        const a = smoothstep(tt, tt + 0.012, v);
        maskI.data[j + 3] = a * 255;
        const c = (1 - smoothstep(tt + 0.012, tt + 0.1, v)) * a;
        charI.data[j] = 40; charI.data[j + 1] = 18; charI.data[j + 2] = 6; charI.data[j + 3] = c * 235;
        const gl = Math.exp(-(((v - tt) / 0.013) ** 2));
        glowI.data[j] = 255; glowI.data[j + 1] = 150 + 90 * gl; glowI.data[j + 2] = 60 + 120 * gl * gl; glowI.data[j + 3] = gl * 255;
      }
      maskX.putImageData(maskI, 0, 0); charX.putImageData(charI, 0, 0); glowX.putImageData(glowI, 0, 0);
      paperX.globalCompositeOperation = 'source-over';
      paperX.clearRect(0, 0, 1000, 700);
      if (deedSrc instanceof HTMLImageElement) {
        const sc = Math.max(1000 / deedSrc.naturalWidth, 700 / deedSrc.naturalHeight), dw = deedSrc.naturalWidth * sc, dh = deedSrc.naturalHeight * sc;
        paperX.fillStyle = '#d9c49a'; paperX.fillRect(0, 0, 1000, 700);
        paperX.drawImage(deedSrc, (1000 - dw) / 2, (700 - dh) / 2, dw, dh);
        paperX.fillStyle = 'rgba(140,100,50,0.18)'; paperX.fillRect(0, 0, 1000, 700);
      } else paperX.drawImage(deedSrc, 0, 0);
      paperX.globalCompositeOperation = 'destination-in';
      paperX.drawImage(maskC, 0, 0, 1000, 700);
      paperX.globalCompositeOperation = 'source-atop';
      paperX.drawImage(charC, 0, 0, 1000, 700);
      const heat = paperX.createRadialGradient(460, 710, 0, 460, 710, 900);
      heat.addColorStop(0, `rgba(255,140,60,${(0.25 * E.sine(prog(t, 39.0, 39.8))).toFixed(3)})`);
      heat.addColorStop(1, 'rgba(255,140,60,0)');
      paperX.fillStyle = heat; paperX.fillRect(0, 0, 1000, 700);
      paperX.fillStyle = 'rgba(255,170,90,0.1)'; paperX.fillRect(0, 0, 1000, 700);
      paperX.globalCompositeOperation = 'source-over';
      ctx.setTransform(P[0], P[1], P[2], P[3], P[4], P[5]);
      ctx.globalAlpha = on;
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 20;
      ctx.drawImage(paperC, 0, 0);
      ctx.shadowColor = 'transparent';
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(glowC, 0, 0, 1000, 700);
      ctx.globalAlpha = on * 0.45;
      ctx.drawImage(glowC, -18, -14, 1036, 728);
      ctx.globalAlpha = on * 0.25;
      ctx.drawImage(glowC, -40, -30, 1080, 760);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
    // 余烬
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    const P = paperM(Math.min(t, 43));
    const eb = [[], [], []];
    for (const e of embers) {
      const dt = t - e.at;
      if (dt < 0 || dt > e.life) continue;
      const k = dt / e.life;
      const p = M.ap(P, e.x, e.y);
      const x = p[0] + e.vx * dt + 22 * Math.sin(dt * 2.2 + e.ph), y = p[1] - e.vy * dt - 14 * dt * dt;
      const a = Math.sin(Math.PI * k) ** 0.6 * (0.7 + 0.3 * Math.sin(t * 17 + e.ph));
      eb[Math.min(2, Math.floor(a * 3))].push(x, y, e.r * (1 - 0.5 * k));
    }
    eb.forEach((arr, b) => {
      if (!arr.length) return;
      ctx.fillStyle = `rgba(255,${190 + b * 20},${80 + b * 30},${(0.35 + b * 0.3).toFixed(2)})`;
      ctx.beginPath();
      for (let i = 0; i < arr.length; i += 3) { ctx.moveTo(arr[i] + arr[i + 2], arr[i + 1]); ctx.arc(arr[i], arr[i + 1], arr[i + 2], 0, 6.283); }
      ctx.fill();
    });
    // 万家灯火升起的火星 → 汇成火苗
    if (t > 42.6 && t < 45.9) {
      const cs = midCaves();
      gather.forEach((gp, i) => {
        const dt = t - gp.at;
        if (dt < 0) return;
        const c = cs[(i * 7) % cs.length];
        const m = PL.layerM(Math.min(t, gp.at + 0.01), c.layer === 'mid' ? 1 : 0.6);
        const base = M.ap(m, c.x + 9, c.y - 30);
        const fxp = base[0] + 18 * Math.sin(dt * 1.7 + gp.ph), fyp = base[1] - gp.vy * dt - 8 * dt * dt;
        const k = E.io2(prog(t, gp.conv, 45.45));
        const ang = gp.ph + gp.spin * (t - gp.conv), rad = gp.rad * (1 - k);
        const tx = FLAME_C[0] + Math.cos(ang) * rad, ty = FLAME_C[1] - 20 + Math.sin(ang) * rad * 0.6;
        const x = lerp(fxp, tx, k), y = lerp(fyp, ty, k);
        const a = clamp(dt * 3) * (1 - E.in2(prog(t, 45.2, 45.6))) * (0.75 + 0.25 * Math.sin(t * 13 + gp.ph));
        ctx.fillStyle = `rgba(255,205,120,${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, y, gp.r, 0, 6.283); ctx.fill();
      });
    }
    ctx.globalCompositeOperation = 'source-over';
    // 暴雨
    const st = env(t, 50.25, 50.8, 52.2, 52.9);
    if (st > 0) {
      ctx.strokeStyle = `rgba(180,195,225,${(0.4 * st).toFixed(3)})`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      for (let i = 0; i < 520; i++) {
        const v = 1700 + hash1(i * 3) * 800, l = 30 + hash1(i * 5) * 50;
        const y = wrap(hash1(i * 7) * 1300 + t * v, 1300) - 120, x = wrap(hash1(i * 11) * 2400 + t * v * 0.32, 2400) - 240;
        ctx.moveTo(x, y); ctx.lineTo(x - l * 0.32, y - l);
      }
      ctx.stroke();
    }
  };
  return s;
}
const S8 = {};
