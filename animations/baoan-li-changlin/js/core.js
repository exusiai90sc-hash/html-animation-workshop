'use strict';
/* =============================================================
 * core.js —— 基础工具
 * 数学、缓动、确定性噪声、颜色、SVG 构建、仿射矩阵、程序纹理。
 * 整部动画是时间 t（秒）的纯函数：任意跳转、倒放、逐帧导出结果一致。
 * ============================================================= */

const W = 1920, H = 1080;
const NS = 'http://www.w3.org/2000/svg';
const DEG = Math.PI / 180;

/* ---------- 数学与缓动 ---------- */
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const smoothstep = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };

const E = {
  lin: k => k,
  in2: k => k * k,
  out2: k => 1 - (1 - k) * (1 - k),
  io2: k => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2),
  in3: k => k * k * k,
  out3: k => 1 - (1 - k) ** 3,
  io3: k => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2),
  in4: k => k ** 4,
  out4: k => 1 - (1 - k) ** 4,
  io4: k => (k < 0.5 ? 8 * k ** 4 : 1 - (-2 * k + 2) ** 4 / 2),
  sine: k => (1 - Math.cos(Math.PI * k)) / 2,
  inSine: k => 1 - Math.cos((k * Math.PI) / 2),
  outSine: k => Math.sin((k * Math.PI) / 2),
  outBack: k => 1 + 2.70158 * (k - 1) ** 3 + 1.70158 * (k - 1) ** 2,
  outExpo: k => (k >= 1 ? 1 : 1 - 2 ** (-10 * k)),
  inExpo: k => (k <= 0 ? 0 : 2 ** (10 * k - 10)),
};

/** 区间 [a,b] 内从 v0 缓动到 v1 */
const tw = (t, a, b, v0, v1, e = E.sine) => lerp(v0, v1, e(prog(t, a, b)));
/** 淡入 [a,b]、淡出 [c,d] 的包络，0..1 */
const env = (t, a, b, c, d, e = E.sine) => Math.min(e(prog(t, a, b)), 1 - e(prog(t, c, d)));
/** 多关键帧插值：keys = [[t, 值或数组, 可选缓动], ...] */
function kf(t, keys, e = E.sine) {
  const n = keys.length;
  if (t <= keys[0][0]) return keys[0][1];
  if (t >= keys[n - 1][0]) return keys[n - 1][1];
  for (let i = 1; i < n; i++) {
    if (t <= keys[i][0]) {
      const a = keys[i - 1], b = keys[i];
      const k = (b[2] || e)((t - a[0]) / (b[0] - a[0]));
      if (Array.isArray(a[1])) return a[1].map((v, j) => lerp(v, b[1][j], k));
      return lerp(a[1], b[1], k);
    }
  }
  return keys[n - 1][1];
}

/* ---------- 确定性随机与噪声 ---------- */
function hash1(n) {
  n = n | 0;
  n = Math.imul(n ^ (n >>> 16), 0x7feb352d);
  n = Math.imul(n ^ (n >>> 15), 0x846ca68b);
  n ^= n >>> 16;
  return (n >>> 0) / 4294967295;
}
const hs = i => hash1(i) * 2 - 1;
function noise1(x) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(hs(i), hs(i + 1), u);
}
function fbm1(x, oct = 3) {
  let s = 0, a = 1, f = 1, n = 0;
  for (let i = 0; i < oct; i++) { s += a * noise1(x * f + i * 31.7); n += a; a *= 0.5; f *= 2.03; }
  return s / n;
}
function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** 火焰/灯光类闪烁，约在 1 附近 */
const flick = (t, seed = 0, amt = 1) => 1 + amt * (0.06 * noise1(t * 7.3 + seed) + 0.035 * noise1(t * 19.1 + seed * 3.7));

/* ---------- 颜色 ---------- */
function hexRgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mixHex(a, b, k) {
  const x = hexRgb(a), y = hexRgb(b);
  k = clamp(k);
  return 'rgb(' + x.map((v, i) => Math.round(lerp(v, y[i], k))).join(',') + ')';
}
function rampHex(stops, k) {
  k = clamp(k);
  for (let i = 1; i < stops.length; i++) {
    if (k <= stops[i][0]) {
      const a = stops[i - 1], b = stops[i];
      return mixHex(a[1], b[1], (k - a[0]) / (b[0] - a[0] || 1));
    }
  }
  return stops[stops.length - 1][1];
}
function rgba(hex, a) { const c = hexRgb(hex); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }

/* ---------- SVG 构建 ---------- */
let DEFS = null;
let _uid = 0;
const uid = p => `${p}-${++_uid}`;
function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  if (attrs) for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
const G = (parent, attrs) => el('g', attrs, parent);
function set(e, attrs) { for (const k in attrs) e.setAttribute(k, attrs[k]); }
function stops(g, list) {
  list.forEach(s => el('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] == null ? 1 : s[2] }, g));
  return g;
}
function lgrad(id, list, o = {}) { return stops(el('linearGradient', Object.assign({ id, x1: 0, y1: 0, x2: 0, y2: 1 }, o), DEFS), list); }
function rgrad(id, list, o = {}) { return stops(el('radialGradient', Object.assign({ id, cx: 0.5, cy: 0.5, r: 0.5 }, o), DEFS), list); }
function blurF(id, sd, region) {
  const f = el('filter', Object.assign({ id, 'color-interpolation-filters': 'sRGB', x: '-50%', y: '-50%', width: '200%', height: '200%' }, region || {}), DEFS);
  el('feGaussianBlur', { stdDeviation: sd }, f);
  return f;
}
/* 无滤镜的柔边：径向渐变椭圆 / 叠层描边（镜头放大时也很轻） */
const _softG = {};
function softFill(color) {
  if (!_softG[color]) { const id = uid('soft'); rgrad(id, [[0, color, 1], [0.42, color, 0.62], [0.72, color, 0.24], [1, color, 0]]); _softG[color] = `url(#${id})`; }
  return _softG[color];
}
function softEllipse(parent, cx, cy, rx, ry, opacity = 0.5, color = '#000', extra) {
  return el('ellipse', Object.assign({ cx, cy, rx, ry, fill: softFill(color), opacity }, extra || {}), parent);
}
function softStroke(parent, d, color, width, opacity = 1, extra) {
  const g0 = G(parent, Object.assign({ fill: 'none', stroke: color, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, extra || {}));
  const ps = [[2.6, 0.16], [1.6, 0.32], [0.8, 0.7]].map(([k, a]) => el('path', { d, 'stroke-width': width * k, opacity: opacity * a }, g0));
  g0.paths = ps;
  return g0;
}
/** 柔边矩形阴影（径向渐变拉伸） */
function softRect(parent, x, y, w, h, opacity = 0.5, color = '#000', extra) {
  return softEllipse(parent, x + w / 2, y + h / 2, w * 0.62, h * 0.62, opacity, color, extra);
}
/** 限定区域的模糊（大面积图层用，避免按包围盒 200% 开巨大缓冲） */
function blurU(id, sd, x = -200, y = -200, w = 2320, h = 1480) {
  const f = el('filter', { id, 'color-interpolation-filters': 'sRGB', filterUnits: 'userSpaceOnUse', x, y, width: w, height: h }, DEFS);
  el('feGaussianBlur', { stdDeviation: sd }, f);
  return f;
}
/** 设置不透明度，并在完全透明时隐藏（省渲染） */
function vis(e, a) {
  a = clamp(a);
  if (a <= 0.001) { if (e._v !== 0) { e.style.display = 'none'; e._v = 0; } return; }
  if (e._v === 0 || e._v === undefined) e.style.display = '';
  if (e._v !== a) { e.setAttribute('opacity', a.toFixed(4)); e._v = a; }
}

/* ---------- 路径 ---------- */
const r1 = v => Math.round(v * 10) / 10;
function poly(pts, close) {
  let d = '';
  for (let i = 0; i < pts.length; i++) d += (i ? 'L' : 'M') + r1(pts[i][0]) + ',' + r1(pts[i][1]);
  return d + (close ? 'Z' : '');
}
/** Catmull-Rom 平滑曲线 */
function smooth(pts, close = false, k = 1) {
  const n = pts.length;
  if (n < 2) return '';
  const get = i => (close ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
  let d = 'M' + r1(pts[0][0]) + ',' + r1(pts[0][1]);
  const segs = close ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    d += 'C' + r1(p1[0] + ((p2[0] - p0[0]) / 6) * k) + ',' + r1(p1[1] + ((p2[1] - p0[1]) / 6) * k) +
      ' ' + r1(p2[0] - ((p3[0] - p1[0]) / 6) * k) + ',' + r1(p2[1] - ((p3[1] - p1[1]) / 6) * k) +
      ' ' + r1(p2[0]) + ',' + r1(p2[1]);
  }
  return d + (close ? 'Z' : '');
}
/** 五角星顶点，外半径 R，内半径 r */
function starPts(cx, cy, R, r, rot = 0) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + rot + (i * Math.PI) / 5;
    const rr = i % 2 ? r : R;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return pts;
}
function circlePath(cx, cy, r) { return `M${cx - r},${cy}a${r},${r} 0 1 0 ${2 * r},0a${r},${r} 0 1 0 ${-2 * r},0Z`; }

/* ---------- 仿射矩阵 [a,b,c,d,e,f]（与 SVG/Canvas 一致） ---------- */
const M = {
  id: () => [1, 0, 0, 1, 0, 0],
  mul(m, n) {
    return [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
      m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
  },
  chain(...ms) { return ms.reduce((a, b) => M.mul(a, b)); },
  t: (x, y) => [1, 0, 0, 1, x, y],
  s: (sx, sy = sx) => [sx, 0, 0, sy, 0, 0],
  r: a => [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0],
  inv(m) {
    const det = m[0] * m[3] - m[1] * m[2];
    return [m[3] / det, -m[1] / det, -m[2] / det, m[0] / det, (m[2] * m[5] - m[3] * m[4]) / det, (m[1] * m[4] - m[0] * m[5]) / det];
  },
  ap: (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]],
  sc: m => Math.hypot(m[0], m[1]),
  str: m => 'matrix(' + m.map(v => (Math.abs(v) < 1e-9 ? 0 : +v.toFixed(5))).join(' ') + ')',
};
/** 相机：把世界点 (x,y) 放到画面中心，缩放 s，旋转 r（弧度） */
function cam(x, y, s = 1, r = 0) {
  return M.mul(M.t(W / 2, H / 2), M.mul(M.r(r), M.mul(M.s(s), M.t(-x, -y))));
}
/** 手持感：极轻微的呼吸漂移 */
function drift(t, amt = 1, seed = 0) {
  return [amt * 3.2 * fbm1(t * 0.35 + seed, 2), amt * 2.4 * fbm1(t * 0.31 + seed + 40, 2), amt * 0.0012 * fbm1(t * 0.27 + seed + 80, 2)];
}

/* ---------- 程序纹理（启动时生成一次） ---------- */
function tileNoise(size, cells, seed) {
  const r = rng(seed), grid = new Float32Array(cells * cells);
  for (let i = 0; i < grid.length; i++) grid[i] = r();
  const out = new Float32Array(size * size), sc = cells / size;
  for (let y = 0; y < size; y++) {
    const fy = y * sc, y0 = Math.floor(fy), ty = fy - y0, sy = ty * ty * (3 - 2 * ty);
    const r0 = (y0 % cells) * cells, r1_ = ((y0 + 1) % cells) * cells;
    for (let x = 0; x < size; x++) {
      const fx = x * sc, x0 = Math.floor(fx), tx = fx - x0, sx = tx * tx * (3 - 2 * tx);
      const c0 = x0 % cells, c1 = (x0 + 1) % cells;
      const a = grid[r0 + c0], b = grid[r0 + c1], c = grid[r1_ + c0], d = grid[r1_ + c1];
      const top = a + (b - a) * sx, bot = c + (d - c) * sx;
      out[y * size + x] = top + (bot - top) * sy;
    }
  }
  return out;
}
function tileFbm(size, seed, octs) {
  const out = new Float32Array(size * size);
  let tot = 0;
  octs.forEach(([cells, amp], i) => {
    const n = tileNoise(size, cells, seed + i * 101);
    for (let j = 0; j < out.length; j++) out[j] += n[j] * amp;
    tot += amp;
  });
  for (let j = 0; j < out.length; j++) out[j] /= tot;
  return out;
}
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function pixelCanvas(w, h, fill) {
  const c = makeCanvas(w, h), x = c.getContext('2d'), img = x.createImageData(w, h);
  fill(img.data, w, h);
  x.putImageData(img, 0, 0);
  return c;
}
function patternFrom(id, canvas, w, h, extra) {
  const p = el('pattern', Object.assign({ id, patternUnits: 'userSpaceOnUse', width: w, height: h }, extra || {}), DEFS);
  el('image', { href: canvas.toDataURL('image/png'), width: w, height: h, preserveAspectRatio: 'none' }, p);
  return p;
}

const TEX = {};
function makeTextures() {
  // 颗粒：明暗斑点（带透明度，叠加到任何底色上）
  {
    const n = tileFbm(512, 11, [[8, 0.45], [32, 0.3], [128, 0.35]]);
    const R = rng(5);
    const c = pixelCanvas(512, 512, (d, w) => {
      for (let i = 0; i < w * w; i++) {
        const v = n[i] + (R() - 0.5) * 0.5;
        const g = v > 0.5 ? 255 : 0;
        const a = Math.min(1, Math.abs(v - 0.5) * 1.7);
        d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = g;
        d[i * 4 + 3] = a * a * 255;
      }
    });
    patternFrom('pat-grit', c, 512, 512);
    patternFrom('pat-grit-l', c, 1024, 1024);
    TEX.grit = c;
  }
  // 纸纹：纤维 + 斑驳
  {
    const c = makeCanvas(512, 512), x = c.getContext('2d'), R = rng(9);
    const n = tileFbm(512, 17, [[4, 0.6], [16, 0.4]]);
    const img = x.createImageData(512, 512);
    for (let i = 0; i < 512 * 512; i++) {
      const v = n[i];
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v > 0.5 ? 255 : 60;
      img.data[i * 4 + 3] = Math.abs(v - 0.5) * 110;
    }
    x.putImageData(img, 0, 0);
    for (let i = 0; i < 900; i++) {
      const px = R() * 512, py = R() * 512, L = 4 + R() * 16, a = R() * Math.PI;
      x.strokeStyle = R() < 0.5 ? `rgba(255,250,235,${0.08 + R() * 0.12})` : `rgba(90,70,40,${0.05 + R() * 0.1})`;
      x.lineWidth = 0.4 + R() * 0.8;
      x.beginPath();
      x.moveTo(px, py);
      x.quadraticCurveTo(px + Math.cos(a) * L * 0.5 + (R() - 0.5) * 4, py + Math.sin(a) * L * 0.5 + (R() - 0.5) * 4, px + Math.cos(a) * L, py + Math.sin(a) * L);
      x.stroke();
    }
    patternFrom('pat-paper', c, 512, 512);
    TEX.paper = c;
  }
  // 木纹（中性棕，横向纹理）
  {
    const S = 512;
    const warp = tileFbm(S, 21, [[2, 0.7], [4, 0.3]]);
    const fine = tileNoise(S, 128, 23);
    const rr = rng(24), row = new Float32Array(S), rowS = new Float32Array(S);
    for (let y = 0; y < S; y++) row[y] = rr();
    for (let y = 0; y < S; y++) { let a = 0; for (let k = -2; k <= 2; k++) a += row[(y + k + S) % S]; rowS[y] = a / 5; }
    const c = pixelCanvas(S, S, (d) => {
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const i = y * S + x;
        const v = Math.sin((y / S * 26 + warp[i] * 1.6) * Math.PI * 2);
        const ring = Math.pow(0.5 + 0.5 * v, 2.5);
        const k = 0.6 + ring * 0.26 + (rowS[y] - 0.5) * 0.3 + (fine[i] - 0.5) * 0.08;
        d[i * 4] = 118 * k + 20;
        d[i * 4 + 1] = 80 * k + 12;
        d[i * 4 + 2] = 48 * k + 6;
        d[i * 4 + 3] = 255;
      }
    });
    patternFrom('pat-wood', c, 512, 512, { patternTransform: 'scale(2.4,1)' });
    patternFrom('pat-wood-v', c, 512, 512, { patternTransform: 'rotate(90) scale(2.4,1)' });
    TEX.wood = c;
  }
  // 布纹（交织）
  {
    const p = el('pattern', { id: 'pat-weave', patternUnits: 'userSpaceOnUse', width: 6, height: 6 }, DEFS);
    el('path', { d: 'M0,1.5H3M3,4.5H6', stroke: '#fff', 'stroke-opacity': 0.13, 'stroke-width': 1.3 }, p);
    el('path', { d: 'M1.5,3V6M4.5,0V3', stroke: '#000', 'stroke-opacity': 0.22, 'stroke-width': 1.3 }, p);
  }
  // 竹编（筐）
  {
    const p = el('pattern', { id: 'pat-bamboo', patternUnits: 'userSpaceOnUse', width: 26, height: 26, patternTransform: 'rotate(45)' }, DEFS);
    el('rect', { width: 26, height: 26, fill: '#000', 'fill-opacity': 0 }, p);
    el('path', { d: 'M0,6H13M13,19H26', stroke: '#000', 'stroke-opacity': 0.35, 'stroke-width': 3 }, p);
    el('path', { d: 'M6,13V26M19,0V13', stroke: '#000', 'stroke-opacity': 0.35, 'stroke-width': 3 }, p);
    el('path', { d: 'M0,5H13M13,18H26M5,13V26M18,0V13', stroke: '#fff', 'stroke-opacity': 0.12, 'stroke-width': 1 }, p);
  }
  // 胶片颗粒帧
  TEX.grain = [];
  for (let k = 0; k < 6; k++) {
    const R = rng(100 + k);
    TEX.grain.push(pixelCanvas(256, 256, (d, w) => {
      for (let i = 0; i < w * w; i++) {
        const v = (R() + R() + R()) / 3;
        const g = 128 + (v - 0.5) * 230;
        d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = g;
        d[i * 4 + 3] = 255;
      }
    }));
  }
}

/* ---------- 画布粒子公用 ---------- */
/** 生成固定数量的粒子种子（确定性） */
function seeds(n, seed, fn) { const R = rng(seed), out = []; for (let i = 0; i < n; i++) out.push(fn(R, i)); return out; }
/** 取模到 [0,m) */
const wrap = (v, m) => ((v % m) + m) % m;

/** 沿 Catmull-Rom 曲线按弧长取点：track.at(u) → [x, y, 切线角] */
function makeTrack(pts, samples = 24) {
  const n = pts.length, dense = [];
  const get = i => pts[clamp(i, 0, n - 1)];
  for (let i = 0; i < n - 1; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    for (let k = 0; k < samples; k++) {
      const t = k / samples, t2 = t * t, t3 = t2 * t;
      const f = j => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3);
      dense.push([f(0), f(1)]);
    }
  }
  dense.push(pts[n - 1].slice());
  const cum = [0];
  for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  const L = cum[cum.length - 1];
  return {
    dense, L, d: smooth(pts),
    at(u) {
      const d = clamp(u) * L;
      let lo = 0, hi = cum.length - 1;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] < d) lo = mid; else hi = mid; }
      const seg = cum[hi] - cum[lo] || 1, k = (d - cum[lo]) / seg;
      const a = dense[lo], b = dense[hi];
      return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), Math.atan2(b[1] - a[1], b[0] - a[0])];
    },
  };
}
/** 闭合的“墨团/光斑”轮廓：周期正弦叠加，保证首尾相接 */
function blobPath(cx, cy, R, seed = 0, t = 0, n = 120, rough = 1) {
  const harm = [[3, 0.07], [5, 0.055], [7, 0.04], [11, 0.03], [17, 0.02], [29, 0.012]];
  const ph = harm.map((h, i) => hash1(seed * 31 + i) * 6.283);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    let k = 1;
    harm.forEach((h, j) => { k += rough * h[1] * Math.sin(h[0] * a + ph[j] + t * (0.3 + j * 0.13)); });
    pts.push([cx + Math.cos(a) * R * k, cy + Math.sin(a) * R * k]);
  }
  return smooth(pts, true);
}

/* ---------- 纹理加速：把图片型 <pattern> 填充换成按同一网格平铺的 <image> ----------
 * Chrome 在镜头缩放时会逐帧重绘图案瓦片，代价很高；<image> 只按屏幕面积取样。
 * 外观与原图案一致（同一网格对齐），在启动时自动转换。 */
const TEXIMG = {};
function prepTexImages() {
  const big = (tile, n) => { const c = makeCanvas(tile.width * n, tile.height * n), x = c.getContext('2d'); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) x.drawImage(tile, i * tile.width, j * tile.height); return c; };
  const defsOf = {
    'pat-grit': [TEX.grit, 512, 512, 4, null],
    'pat-grit-l': [TEX.grit, 1024, 1024, 4, null],
    'pat-paper': [TEX.paper, 512, 512, 4, null],
    'pat-wood': [TEX.wood, 512 * 2.4, 512, 4, null],
    'pat-wood-v': [TEX.wood, 512 * 2.4, 512, 4, 90],
  };
  const cache = new Map();
  const jobs = [];
  for (const k in defsOf) {
    const [tile, tw, th, n, rot] = defsOf[k];
    if (!cache.has(tile)) {
      const c = big(tile, n);
      cache.set(tile, new Promise(res => c.toBlob(b => res(URL.createObjectURL(b)), 'image/png')));
    }
    jobs.push(cache.get(tile).then(url => { TEXIMG[k] = { url, w: tw * n, h: th * n, rot }; }));
  }
  return Promise.all(jobs);
}
function convertTextures(root) {
  const els = Array.from(root.querySelectorAll('[fill^="url(#pat-grit"],[fill^="url(#pat-paper"],[fill^="url(#pat-wood"]'));
  for (const e of els) {
    if (e.hasAttribute('data-live')) continue;
    const key = e.getAttribute('fill').slice(5, -1);
    const T = TEXIMG[key];
    if (!T) continue;
    let bb;
    try { bb = e.getBBox(); } catch (err) { continue; }
    if (!bb.width || !bb.height) continue;
    const g0 = document.createElementNS(NS, 'g');
    ['transform', 'opacity', 'style'].forEach(a => { if (e.hasAttribute(a)) g0.setAttribute(a, e.getAttribute(a)); });
    const cid = uid('tx');
    const cp = el('clipPath', { id: cid }, DEFS);
    const shape = e.cloneNode(false);
    ['fill', 'opacity', 'transform', 'style', 'filter', 'id'].forEach(a => shape.removeAttribute(a));
    if (e.getAttribute('fill-rule') === 'evenodd') shape.setAttribute('clip-rule', 'evenodd');
    cp.appendChild(shape);
    g0.setAttribute('clip-path', `url(#${cid})`);
    // 旋转 90° 的木纹：在旋转坐标系里铺
    const inner = T.rot ? G(g0, { transform: `rotate(${T.rot})` }) : g0;
    let x0 = bb.x, y0 = bb.y, x1 = bb.x + bb.width, y1 = bb.y + bb.height;
    if (T.rot) { const nx0 = y0, nx1 = y1, ny0 = -x1, ny1 = -x0; x0 = nx0; x1 = nx1; y0 = ny0; y1 = ny1; }
    for (let ix = Math.floor(x0 / T.w) * T.w; ix < x1; ix += T.w)
      for (let iy = Math.floor(y0 / T.h) * T.h; iy < y1; iy += T.h)
        el('image', { href: T.url, x: r1(ix), y: r1(iy), width: r1(T.w) + 0.5, height: r1(T.h) + 0.5, preserveAspectRatio: 'none' }, inner);
    e.parentNode.replaceChild(g0, e);
  }
}
