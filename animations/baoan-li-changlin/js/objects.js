'use strict';
/* =============================================================
 * objects.js —— 叙事物件（全部为矢量/程序绘制，不含人物形象）
 * 油灯、窑洞窗棂、窗花、粗瓷碗、借据契约、八角帽红星 等。
 * ============================================================= */

function makeCommonDefs() {
  [1, 1.5, 2, 3, 4, 6, 8, 12, 18, 28, 40].forEach(s => blurF('f-b' + String(s).replace('.', '_'), s));
  rgrad('g-flame-o', [[0, '#fff3c8'], [0.35, '#ffd27a'], [0.72, '#ff9636', 0.95], [1, '#ff6a1a', 0]], { cx: 0.5, cy: 0.8, r: 0.75 });
  rgrad('g-flame-i', [[0, '#ffffff'], [0.55, '#fff6d6'], [1, '#ffe7a8', 0]], { cx: 0.5, cy: 0.82, r: 0.72 });
  rgrad('g-halo', [[0, '#ffd08e', 0.6], [0.16, '#ffb866', 0.34], [0.48, '#ff9844', 0.11], [1, '#ff8a30', 0]]);
  rgrad('g-halo2', [[0, '#fff6dc', 0.95], [0.35, '#ffe0a8', 0.5], [1, '#ffc27e', 0]]);
  rgrad('g-glow-red', [[0, '#ff7a45', 0.85], [0.35, '#e0321e', 0.35], [1, '#b0160c', 0]]);
  rgrad('g-glow-gold', [[0, '#fff2c8', 0.95], [0.3, '#ffc766', 0.45], [1, '#ff9a30', 0]]);
  rgrad('g-shadow', [[0, '#000', 0.65], [1, '#000', 0]]);
  rgrad('g-bokeh', [[0, '#ffb35c', 0.55], [0.7, '#ff9a40', 0.35], [1, '#ff8a30', 0]]);
}

/* ---------- 火焰 ---------- */
function flamePath(h, w, sway) {
  const tx = sway, ty = -h;
  return `M0,3C${r1(-w * 1.08)},2 ${r1(-w * 1.15)},${r1(-h * 0.36)} ${r1(-w * 0.55)},${r1(-h * 0.62)}` +
    `C${r1(-w * 0.2 + tx * 0.3)},${r1(-h * 0.8)} ${r1(tx * 0.75 - w * 0.05)},${r1(-h * 0.9)} ${r1(tx)},${r1(ty)}` +
    `C${r1(tx * 0.75 + w * 0.22)},${r1(-h * 0.86)} ${r1(w * 0.52 + tx * 0.2)},${r1(-h * 0.72)} ${r1(w * 0.62)},${r1(-h * 0.55)}` +
    `C${r1(w * 1.15)},${r1(-h * 0.32)} ${r1(w * 1.05)},2 0,3Z`;
}
function buildFlame(parent, o = {}) {
  const root = G(parent);
  const hr = o.halo || 260;
  const halo = el('circle', { cy: -18, r: hr, fill: 'url(#g-halo)' }, root);
  const halo2 = el('circle', { cy: -20, r: hr * 0.2, fill: 'url(#g-halo2)' }, root);
  const body = G(root, { filter: 'url(#f-b1_5)' });
  const outer = el('path', { fill: 'url(#g-flame-o)' }, body);
  const inner = el('path', { fill: 'url(#g-flame-i)' }, body);
  const blue = el('ellipse', { cx: 0, cy: -3, rx: 5, ry: 6.5, fill: '#7a9bff', opacity: 0.45 }, body);
  return {
    root, halo,
    update(t, x, y, sc = 1, inten = 1, lean = 0, seed = 0) {
      const fl = flick(t, seed);
      const h = 44 * fl * (0.55 + 0.45 * clamp(inten)), w = 10.5 * (0.96 + 0.06 * noise1(t * 5 + seed + 9));
      const sway = 3 * noise1(t * 2.6 + seed + 3) + 1.3 * noise1(t * 9.5 + seed) + lean;
      root.setAttribute('transform', `translate(${r1(x)},${r1(y)}) scale(${sc.toFixed(4)})`);
      outer.setAttribute('d', flamePath(h, w, sway));
      inner.setAttribute('d', flamePath(h * 0.58, w * 0.5, sway * 0.5));
      halo.setAttribute('opacity', clamp(inten * (0.85 + 0.15 * fl)).toFixed(3));
      halo.setAttribute('transform', `scale(${(0.9 + 0.1 * fl).toFixed(3)})`);
      halo2.setAttribute('opacity', clamp(inten).toFixed(3));
      body.setAttribute('opacity', clamp(inten * 1.5).toFixed(3));
      blue.setAttribute('opacity', (0.45 * clamp(inten)).toFixed(3));
    },
  };
}

/* ---------- 陕北油灯（灯盏 + 灯台） ---------- */
function buildLamp(parent, x, y, sc = 1) {
  const g0 = G(parent, { transform: `translate(${x},${y}) scale(${sc})` });
  const id = uid('lamp');
  lgrad(id + '-col', [[0, '#1d120a'], [0.28, '#5c3a20'], [0.42, '#8f5f36'], [0.55, '#6b4526'], [0.8, '#3a2413'], [1, '#170e07']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  lgrad(id + '-top', [[0, '#a4713f'], [1, '#4e3219']]);
  rgrad(id + '-oil', [[0, '#ffe9b0', 0.95], [0.12, '#a36c33'], [0.5, '#3d2410'], [1, '#170d06']], { cx: 0.74, cy: 0.35, r: 0.8 });
  softEllipse(g0, 70, 10, 170, 28, 0.5);
  el('path', { d: 'M-66,0C-66,11 -58,18 -44,19L44,19C58,18 66,11 66,0Z', fill: `url(#${id}-col)` }, g0);
  el('ellipse', { cx: 0, cy: 0, rx: 66, ry: 13, fill: `url(#${id}-top)` }, g0);
  el('ellipse', { cx: 0, cy: 0, rx: 66, ry: 13, fill: 'url(#pat-grit)', opacity: 0.35 }, g0);
  const prof = [[16, -3], [18, -11], [13, -21], [21, -38], [22, -52], [14, -70], [9, -88], [10, -100], [17, -112], [15, -124], [8, -134], [8, -146], [17, -153]];
  const pts = prof.concat(prof.slice().reverse().map(p => [-p[0], p[1]]));
  el('path', { d: smooth(pts, true, 0.7), fill: `url(#${id}-col)` }, g0);
  el('path', { d: 'M-54,-166C-48,-145 48,-145 54,-166Z', fill: `url(#${id}-col)` }, g0);
  el('ellipse', { cx: 0, cy: -166, rx: 54, ry: 11.5, fill: '#24160c' }, g0);
  el('ellipse', { cx: 2, cy: -165, rx: 45, ry: 7.8, fill: `url(#${id}-oil)` }, g0);
  el('path', { d: 'M-54,-166A54,11.5 0 0 0 54,-166', fill: 'none', stroke: '#d9a364', 'stroke-width': 2.4, opacity: 0.8 }, g0);
  el('path', { d: 'M24,-166C32,-169 37,-173 41,-181', fill: 'none', stroke: '#1b110a', 'stroke-width': 4.5, 'stroke-linecap': 'round' }, g0);
  el('circle', { cx: 41, cy: -182, r: 2.6, fill: '#ffab52' }, g0);
  return { g: g0, tip: [x + 41 * sc, y - 184 * sc] };
}

/* ---------- 窑洞拱窗：扇形窗棂 + 方格 ---------- */
function buildArchWindow(parent, o) {
  const { cx, sy, R, sill } = o;
  const L = cx - R, Rt = cx + R;
  const outline = `M${L},${sill}L${L},${sy}A${R},${R} 0 0 1 ${Rt},${sy}L${Rt},${sill}Z`;
  const gw = G(parent);
  const cp = uid('cp');
  el('path', { d: outline }, el('clipPath', { id: cp }, DEFS));
  const paper = el('path', { d: outline, fill: o.paper }, gw);
  if (o.paperTex) el('path', { d: outline, fill: 'url(#pat-paper)', opacity: o.paperTex }, gw);
  const inner = G(gw, { 'clip-path': `url(#${cp})` });
  const under = G(inner); // 窗纸与窗棂之间（窗花层）
  const bars = G(inner);
  const bw = o.barW || 6;
  const step = R / 5;
  let d = '';
  for (let x = cx + step / 2; x < Rt - 2; x += step) d += `M${r1(x)},${sy}V${sill}M${r1(2 * cx - x)},${sy}V${sill}`;
  for (let y = sy + step; y < sill - 2; y += step) d += `M${L},${r1(y)}H${Rt}`;
  for (let a = 0; a <= 180; a += 15) {
    const ar = Math.PI + a * DEG, r0 = R * 0.2;
    d += `M${r1(cx + Math.cos(ar) * r0)},${r1(sy + Math.sin(ar) * r0)}L${r1(cx + Math.cos(ar) * R * 1.1)},${r1(sy + Math.sin(ar) * R * 1.1)}`;
  }
  for (const rr of [R * 0.2, R * 0.56]) d += `M${r1(cx - rr)},${sy}A${r1(rr)},${r1(rr)} 0 0 1 ${r1(cx + rr)},${sy}`;
  el('path', { d, stroke: o.bar, 'stroke-width': bw, fill: 'none', opacity: o.barOpacity == null ? 1 : o.barOpacity }, bars);
  el('path', { d: `M${L},${sy}H${Rt}`, stroke: o.bar, 'stroke-width': bw * 2.6, opacity: o.barOpacity == null ? 1 : o.barOpacity }, bars);
  el('path', { d: `M${cx},${sy}V${sill}`, stroke: o.bar, 'stroke-width': bw * 2, opacity: o.barOpacity == null ? 1 : o.barOpacity }, bars);
  const frame = el('path', { d: outline, fill: 'none', stroke: o.frame || o.bar, 'stroke-width': bw * 5 }, gw);
  return { g: gw, outline, paper, under, bars, frame, clip: cp };
}

/* ---------- 窗花（团花剪纸），evenodd 镂空 ---------- */
function papercutPath(cx, cy, R) {
  const P = (a, r) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  const N = 18;
  let d = '';
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2, am = ((i + 0.5) / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2;
    const p0 = P(a0, R * 0.93), c = P(am, R * 1.1), p1 = P(a1, R * 0.93);
    if (i === 0) d += `M${r1(p0[0])},${r1(p0[1])}`;
    d += `Q${r1(c[0])},${r1(c[1])} ${r1(p1[0])},${r1(p1[1])}`;
  }
  d += 'Z';
  const hole = (x, y, r) => `M${r1(x - r)},${r1(y)}a${r1(r)},${r1(r)} 0 1 0 ${r1(2 * r)},0a${r1(r)},${r1(r)} 0 1 0 ${r1(-2 * r)},0Z`;
  for (let i = 0; i < N; i++) { const p = P(((i + 0.5) / N) * Math.PI * 2, R * 0.82); d += hole(p[0], p[1], R * 0.04); }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const b = P(a, R * 0.4), tip = P(a, R * 0.72), s1 = P(a - 0.3, R * 0.56), s2 = P(a + 0.3, R * 0.56);
    d += `M${r1(b[0])},${r1(b[1])}Q${r1(s1[0])},${r1(s1[1])} ${r1(tip[0])},${r1(tip[1])}Q${r1(s2[0])},${r1(s2[1])} ${r1(b[0])},${r1(b[1])}Z`;
    const m = P(a + Math.PI / 8, R * 0.62);
    d += hole(m[0], m[1], R * 0.05);
    const dd = P(a + Math.PI / 8, R * 0.3);
    d += `M${r1(dd[0])},${r1(dd[1] - R * 0.05)}l${r1(R * 0.035)},${r1(R * 0.05)}l${r1(-R * 0.035)},${r1(R * 0.05)}l${r1(-R * 0.035)},${r1(-R * 0.05)}Z`;
  }
  d += hole(cx, cy, R * 0.07);
  for (let i = 0; i < 6; i++) { const p = P((i / 6) * Math.PI * 2, R * 0.16); d += hole(p[0], p[1], R * 0.035); }
  return d;
}

/* ---------- 粗瓷碗 ---------- */
function buildBowl(parent, o) {
  const b = G(parent, { transform: `translate(${o.x},${o.y}) scale(${o.s || 1})` });
  const id = uid('bowl');
  const rx = 200, ry = 56, dp = 150;
  lgrad(id + '-out', o.clean ?
    [[0, '#3a2112'], [0.16, '#7a4c2a'], [0.28, '#b07a4a'], [0.36, '#83532e'], [0.7, '#4f2e18'], [1, '#26150a']] :
    [[0, '#2e1c10'], [0.16, '#62432a'], [0.28, '#86623f'], [0.38, '#644227'], [0.75, '#3e2716'], [1, '#1f130a']],
  { x1: 0, y1: 0, x2: 1, y2: 0 });
  lgrad(id + '-vd', [[0, '#000', 0], [0.55, '#000', 0.12], [1, '#000', 0.5]]);
  rgrad(id + '-in', o.clean ?
    [[0, '#c08a58'], [0.55, '#7c4c2a'], [1, '#3a2010']] :
    [[0, '#9c7651'], [0.55, '#634329'], [1, '#2f1d10']],
  { cx: 0.55, cy: 0.62, r: 0.62 });
  softEllipse(b, 18, dp + 12, 196, 38, 0.6);
  const outer = `M${-rx},0A${rx},${ry} 0 0 0 ${rx},0C${rx - 4},${dp * 0.55} ${rx * 0.62},${dp * 0.97} ${rx * 0.34},${dp}L${-rx * 0.34},${dp}C${-rx * 0.62},${dp * 0.97} ${-rx + 4},${dp * 0.55} ${-rx},0Z`;
  el('path', { d: `M${-rx * 0.33},${dp - 3}L${rx * 0.33},${dp - 3}L${rx * 0.31},${dp + 13}L${-rx * 0.31},${dp + 13}Z`, fill: o.clean ? '#9a7450' : '#7d6044' }, b);
  el('path', { d: outer, fill: `url(#${id}-out)` }, b);
  el('path', { d: outer, fill: `url(#${id}-vd)` }, b);
  el('path', { d: outer, fill: 'url(#pat-grit)', opacity: o.clean ? 0.18 : 0.38 }, b);
  // 高光
  softStroke(b, `M${-rx * 0.66},${ry * 0.7}C${-rx * 0.62},${dp * 0.55} ${-rx * 0.5},${dp * 0.78} ${-rx * 0.4},${dp * 0.86}`, '#fff', 7, o.clean ? 0.3 : 0.14);
  el('ellipse', { cx: 0, cy: 0, rx, ry, fill: `url(#${id}-in)` }, b);
  el('ellipse', { cx: 0, cy: 0, rx, ry, fill: 'url(#pat-grit)', opacity: 0.25 }, b);
  softStroke(b, `M${-rx + 8},4A${rx - 8},${ry - 6} 0 0 0 ${rx - 8},4`, '#000', 10, 0.35);
  el('ellipse', { cx: 0, cy: 0, rx, ry, fill: 'none', stroke: o.clean ? '#d8b089' : '#bf9b72', 'stroke-width': 5 }, b);
  el('path', { d: `M${-rx},0A${rx},${ry} 0 0 0 ${rx},0`, fill: 'none', stroke: '#f3dcc0', 'stroke-opacity': 0.35, 'stroke-width': 1.6 }, b);
  const crackPts = [[70, 53], [76, 68], [72, 80], [81, 95], [78, 108], [88, 122], [85, 134], [95, 148]];
  if (o.cracked) {
    // 豁口
    el('path', { d: 'M52,54.5Q60,47 70,53.5Q66,58 58,58Z', fill: '#2a190e' }, b);
    el('path', { d: poly(crackPts), fill: 'none', stroke: '#140b05', 'stroke-width': 2.6, 'stroke-linejoin': 'bevel' }, b);
    el('path', { d: poly(crackPts.map(p => [p[0] + 2, p[1]])), fill: 'none', stroke: '#e0c09a', 'stroke-width': 1, opacity: 0.4 }, b);
    el('path', { d: 'M70,52L66,40L69,30', fill: 'none', stroke: '#1d110a', 'stroke-width': 1.6, opacity: 0.75 }, b);
  }
  if (o.grains) {
    const R = rng(77);
    for (let i = 0; i < o.grains; i++) {
      const gx = (R() - 0.5) * 70 + 10, gy = 12 + (R() - 0.5) * 18;
      el('ellipse', { cx: r1(gx), cy: r1(gy), rx: 3.3, ry: 2.5, transform: `rotate(${Math.round(R() * 180)} ${r1(gx)} ${r1(gy)})`, fill: '#d6a445', stroke: '#8a6420', 'stroke-width': 0.6 }, b);
    }
  }
  return { g: b, crack: crackPts };
}

/* ---------- 借据/契约（画布绘制；可被史料图替换） ---------- */
function _brush(x, pts, w0, w1, bulge = 0.25) {
  const n = pts.length, Lp = [], Rp = [];
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[Math.min(n - 1, i + 1)], o = pts[Math.max(0, i - 1)];
    let dx = q[0] - o[0], dy = q[1] - o[1];
    const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
    const u = i / (n - 1), w = lerp(w0, w1, u) * (1 + bulge * Math.sin(u * Math.PI));
    Lp.push([p[0] - (dy * w) / 2, p[1] + (dx * w) / 2]);
    Rp.push([p[0] + (dy * w) / 2, p[1] - (dx * w) / 2]);
  }
  x.beginPath();
  x.moveTo(Lp[0][0], Lp[0][1]);
  for (let i = 1; i < n; i++) x.lineTo(Lp[i][0], Lp[i][1]);
  for (let i = n - 1; i >= 0; i--) x.lineTo(Rp[i][0], Rp[i][1]);
  x.closePath();
  x.fill();
}
function _quad(a, c, b, n = 8) {
  const out = [];
  for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]); }
  return out;
}
/** 伪汉字：按左右/上下/独体结构堆叠笔画，远看像手写小楷，但不构成任何可读的字 */
function _glyph(x, cx, cy, s, R) {
  const L = R(), parts = [];
  if (L < 0.45) { const k = 0.34 + R() * 0.14; parts.push([cx - s / 2, cy - s / 2, s * k, s], [cx - s / 2 + s * (k + 0.05), cy - s / 2, s * (0.95 - k), s]); }
  else if (L < 0.75) { const k = 0.36 + R() * 0.16; parts.push([cx - s / 2, cy - s / 2, s, s * k], [cx - s / 2, cy - s / 2 + s * (k + 0.05), s, s * (0.95 - k)]); }
  else parts.push([cx - s / 2, cy - s / 2, s, s]);
  for (const p of parts) _component(x, p[0], p[1], p[2], p[3], s, R);
}
function _component(x, px, py, pw, ph, s, R) {
  const ww = s * (0.055 + R() * 0.025);
  const gx = u => px + pw * (0.1 + 0.8 * u), gy = v => py + ph * (0.08 + 0.84 * v);
  const q = v => Math.round(v * 4) / 4;
  if (R() < 0.22) {
    const a = gx(0.12), b = gx(0.88), c = gy(0.15 + R() * 0.2), d = gy(0.75 + R() * 0.2);
    _brush(x, [[a, c], [a, d]], ww, ww * 0.8, 0.1);
    _brush(x, [[a, c], [b, c - ww * 0.3], [b + ww * 0.2, c + ww * 0.8], [b, d]], ww * 0.9, ww * 0.8, 0.1);
    _brush(x, [[a, d], [b, d]], ww * 0.8, ww * 0.7, 0.1);
    if (R() < 0.5) _brush(x, [[a, (c + d) / 2], [b, (c + d) / 2 - ww * 0.2]], ww * 0.8, ww * 0.6, 0.1);
  }
  const n = 2 + Math.floor(R() * 3) + (pw * ph > s * s * 0.6 ? 2 : 0);
  for (let i = 0; i < n; i++) {
    const k = R();
    if (k < 0.4) {
      const y = gy(q(R())), x0 = gx(R() * 0.25), x1 = gx(0.72 + R() * 0.28);
      _brush(x, _quad([x0, y + ww * 0.3], [(x0 + x1) / 2, y - ww * 0.5], [x1, y - ww * 0.4], 6), ww * 1.05, ww * 0.8, 0.2);
    } else if (k < 0.66) {
      const xx = gx(q(R())), y0 = gy(R() * 0.18), y1 = gy(0.72 + R() * 0.28);
      _brush(x, _quad([xx, y0], [xx + ww * 0.2, (y0 + y1) / 2], [xx - ww * 0.1, y1], 6), ww * 1.1, ww * 0.55, 0.15);
      if (R() < 0.3) _brush(x, [[xx - ww * 0.1, y1], [xx - ww * 1.4, y1 - ww * 1.2]], ww * 0.7, ww * 0.2, 0);
    } else if (k < 0.79) {
      const x0 = gx(0.55 + R() * 0.4), y0 = gy(R() * 0.3);
      _brush(x, _quad([x0, y0], [x0 - pw * 0.1, y0 + ph * 0.3], [gx(R() * 0.2), gy(0.75 + R() * 0.25)], 7), ww * 1.1, ww * 0.12, 0.2);
    } else if (k < 0.9) {
      const x0 = gx(0.2 + R() * 0.3), y0 = gy(R() * 0.4);
      _brush(x, _quad([x0, y0], [x0 + pw * 0.15, y0 + ph * 0.35], [gx(0.95), gy(0.9 + R() * 0.1)], 7), ww * 0.5, ww * 1.5, 0.3);
    } else {
      const xx = gx(q(R())), yy = gy(q(R()) * 0.9);
      _brush(x, [[xx, yy], [xx + ww * 0.9, yy + ww * 1.1]], ww * 1.2, ww * 0.5, 0);
    }
  }
}
function drawContract(w = 1000, h = 700, seed = 31) {
  const c = makeCanvas(w, h), x = c.getContext('2d'), R = rng(seed);
  x.fillStyle = '#e2cfa0';
  x.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) {
    const px = R() * w, py = R() * h, r = 20 + R() * 140, a = 0.025 + R() * 0.06;
    const g = x.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, `rgba(140,100,55,${a})`);
    g.addColorStop(1, 'rgba(140,100,55,0)');
    x.fillStyle = g;
    x.fillRect(px - r, py - r, r * 2, r * 2);
  }
  const eg = x.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.72);
  eg.addColorStop(0, 'rgba(120,80,40,0)');
  eg.addColorStop(1, 'rgba(105,65,28,0.4)');
  x.fillStyle = eg;
  x.fillRect(0, 0, w, h);
  x.globalAlpha = 0.5;
  x.drawImage(TEX.paper, 0, 0, w, w);
  x.globalAlpha = 1;
  // 红色印刷边框与界栏
  const bx = w * 0.05, by = h * 0.07, bw = w * 0.9, bh = h * 0.86;
  x.strokeStyle = 'rgba(165,42,30,0.6)';
  x.lineWidth = 4; x.strokeRect(bx, by, bw, bh);
  x.lineWidth = 1.3; x.strokeRect(bx + 10, by + 10, bw - 20, bh - 20);
  const cols = 14, cw = (bw - 20) / cols;
  x.lineWidth = 0.9;
  for (let i = 1; i < cols; i++) { const cx = bx + 10 + i * cw; x.beginPath(); x.moveTo(cx, by + 10); x.lineTo(cx, by + bh - 10); x.stroke(); }
  // 竖排墨书（伪字，不可读）
  const s = cw * 0.66, rows = Math.floor((bh - 40) / (s * 1.12));
  for (let col = 0; col < cols; col++) {
    const cx = bx + 10 + (cols - col - 0.5) * cw;
    let n = rows;
    if (col === 0) n = 4;
    else if (col === 10) n = 5;
    else if (col >= 11) continue;
    else if (R() < 0.2) n = Math.floor(rows * (0.4 + R() * 0.5));
    for (let r = 0; r < n; r++) {
      const cy = by + 28 + s * 0.6 + r * s * (col === 0 ? 1.45 : 1.12);
      x.fillStyle = `rgba(24,16,10,${0.72 + R() * 0.2})`;
      _glyph(x, cx + (R() - 0.5) * 3, cy, col === 0 ? s * 1.18 : s, R);
    }
  }
  // 画押（圆圈 + 十字）
  x.strokeStyle = 'rgba(24,16,10,0.8)';
  x.lineWidth = 3;
  const hx = bx + 10 + (cols - 11.5) * cw, hy = by + bh * 0.58;
  x.beginPath(); x.ellipse(hx, hy, s * 0.36, s * 0.32, 0.2, 0.3, Math.PI * 2.05); x.stroke();
  x.beginPath(); x.moveTo(hx - s * 0.3, hy + s * 0.75); x.lineTo(hx + s * 0.3, hy + s * 0.72); x.moveTo(hx + s * 0.02, hy + s * 0.45); x.lineTo(hx - s * 0.02, hy + s * 1.05); x.stroke();
  // 红手印
  const tx = hx + s * 0.05, ty = hy + s * 2.1;
  x.fillStyle = 'rgba(170,28,22,0.2)';
  x.beginPath(); x.ellipse(tx, ty, s * 0.42, s * 0.56, 0.15, 0, Math.PI * 2); x.fill();
  x.strokeStyle = 'rgba(165,26,20,0.72)';
  x.lineWidth = 1.5;
  for (let k = 1; k <= 12; k++) {
    const rr = k / 12;
    x.beginPath();
    x.ellipse(tx + (1 - rr) * 3, ty - (1 - rr) * 4, s * 0.42 * rr, s * 0.56 * rr, 0.15, 0.2 + k * 0.4, Math.PI * 2 - 0.3 + k * 0.4);
    x.stroke();
  }
  // 朱印
  x.save();
  x.translate(bx + 10 + (cols - 13) * cw, by + bh * 0.7);
  x.rotate(-0.08);
  const ss = cw * 1.35;
  x.fillStyle = 'rgba(180,34,26,0.84)';
  x.fillRect(-ss / 2, -ss / 2, ss, ss);
  x.fillStyle = '#e2cfa0';
  const R2 = rng(seed + 7);
  for (let gy = 0; gy < 2; gy++) for (let gx = 0; gx < 2; gx++) _glyph(x, -ss / 4 + gx * ss / 2, -ss / 4 + gy * ss / 2, ss * 0.42, R2);
  for (let i = 0; i < 40; i++) { x.beginPath(); x.arc((R2() - 0.5) * ss, (R2() < 0.5 ? -1 : 1) * ss / 2 + (R2() - 0.5) * 6, 1 + R2() * 3, 0, 7); x.fill(); }
  x.restore();
  // 折痕
  x.strokeStyle = 'rgba(90,60,30,0.18)';
  x.lineWidth = 2;
  x.beginPath(); x.moveTo(w / 2, 0); x.lineTo(w / 2 + 4, h); x.moveTo(0, h / 2 + 3); x.lineTo(w, h / 2 - 2); x.stroke();
  return c;
}

/* ---------- 八角帽（特写：八角帽顶、分片、帽墙、帽檐）+ 红布五角星 ---------- */
const CAPSTAR = { x: 960, y: 455, R: 150 };
function buildCapFront(parent, o = {}) {
  const g0 = G(parent);
  const id = uid('cap');
  const star = CAPSTAR;
  // 帽檐下的阴影
  el('rect', { x: -2600, y: 770, width: 7200, height: 3000, fill: '#040404' }, g0);
  const crownD = 'M160,360L380,222L680,158L960,146L1240,158L1540,222L1760,360C1750,480 1700,620 1640,740Q960,786 280,740C220,620 170,480 160,360Z';
  const cp = uid('cp');
  el('path', { d: crownD }, el('clipPath', { id: cp }, DEFS));
  const cr = G(g0, { 'clip-path': `url(#${cp})` });
  const panels = [
    ['M100,300L380,222L450,770L200,800Z', '#3c4543'],
    ['M380,222L680,158L700,790L450,770Z', '#56605d'],
    ['M680,158L960,146L1240,158L1220,790L700,790Z', '#6c7774'],
    ['M1240,158L1540,222L1470,770L1220,790Z', '#58625f'],
    ['M1540,222L1820,300L1720,800L1470,770Z', '#3e4745'],
  ];
  panels.forEach(([d, c]) => el('path', { d, fill: c }, cr));
  lgrad(id + '-v', [[0, '#000', 0.05], [0.55, '#000', 0], [0.85, '#000', 0.12], [1, '#000', 0.4]]);
  el('rect', { x: 0, y: 140, width: 1920, height: 660, fill: `url(#${id}-v)` }, cr);
  el('rect', { x: 0, y: 140, width: 1920, height: 660, fill: 'url(#pat-weave)' }, cr);
  el('rect', { x: 0, y: 140, width: 1920, height: 660, fill: 'url(#pat-grit-l)', opacity: 0.3 }, cr);
  // 布料褶皱
  [['M470,260C520,420 500,560 540,720', '#000', 0.18, 28], ['M800,190C780,300 830,380 800,520', '#fff', 0.06, 30], ['M1320,220C1300,360 1350,500 1330,700', '#000', 0.14, 26], ['M1600,300C1580,420 1600,560 1560,700', '#000', 0.2, 30], ['M1100,600C1050,640 950,660 850,650', '#000', 0.12, 22]]
    .forEach(([d, c, a, w]) => softStroke(cr, d, c, w, a));
  // 缝线
  [[380, 222, 450, 770], [680, 158, 700, 790], [1240, 158, 1220, 790], [1540, 222, 1470, 770]].forEach(([x1, y1, x2, y2], i) => {
    el('path', { d: `M${x1},${y1}L${x2},${y2}`, stroke: '#1d2322', 'stroke-width': 6, opacity: 0.6 }, cr);
    const dx = i < 2 ? 9 : -9;
    el('path', { d: `M${x1 + dx},${y1 + 8}L${x2 + dx},${y2}`, stroke: '#cdd6d2', 'stroke-width': 1.6, 'stroke-dasharray': '8 7', opacity: 0.22 }, cr);
  });
  // 帽顶棱边
  el('path', { d: 'M160,360L380,222L680,158L960,146L1240,158L1540,222L1760,360', fill: 'none', stroke: '#aab6b2', 'stroke-width': 4, opacity: 0.45, 'stroke-linejoin': 'round' }, g0);
  el('path', { d: 'M168,372L382,236L682,172L960,160L1238,172L1538,236L1752,372', fill: 'none', stroke: '#c9d2cf', 'stroke-width': 1.5, 'stroke-dasharray': '8 7', opacity: 0.25 }, g0);
  // 帽墙
  lgrad(id + '-band', [[0, '#3a4341'], [1, '#262d2c']]);
  el('path', { d: 'M280,740Q960,786 1640,740L1654,800Q960,850 266,800Z', fill: `url(#${id}-band)` }, g0);
  el('path', { d: 'M280,740Q960,786 1640,740L1654,800Q960,850 266,800Z', fill: 'url(#pat-weave)' }, g0);
  el('path', { d: 'M284,752Q960,798 1636,752M270,790Q960,840 1650,790', fill: 'none', stroke: '#b9c3bf', 'stroke-width': 1.4, 'stroke-dasharray': '7 6', opacity: 0.25 }, g0);
  softStroke(g0, 'M280,740Q960,786 1640,740', '#000', 10, 0.4);
  // 帽檐
  lgrad(id + '-brim', [[0, '#353d3b'], [0.35, '#232a29'], [1, '#0e1211']]);
  const brimD = 'M266,800Q960,850 1654,800L1690,832Q960,1030 230,832Z';
  el('path', { d: brimD, fill: `url(#${id}-brim)` }, g0);
  el('path', { d: brimD, fill: 'url(#pat-weave)', opacity: 0.6 }, g0);
  el('path', { d: 'M300,826Q960,960 1620,826M330,818Q960,930 1590,818', fill: 'none', stroke: '#aab4b0', 'stroke-width': 1.4, 'stroke-dasharray': '8 7', opacity: 0.22 }, g0);
  el('path', { d: 'M230,832Q960,1030 1690,832', fill: 'none', stroke: '#8c9894', 'stroke-width': 3, opacity: 0.45 }, g0);
  // 红星（布质）
  const sg = G(g0);
  const P = starPts(star.x, star.y, star.R, star.R * 0.4);
  el('path', { d: poly(P, true), fill: '#000', opacity: 0.18, transform: 'translate(9,13)' }, sg);
  el('path', { d: poly(P, true), fill: '#000', opacity: 0.25, transform: 'translate(5,7)' }, sg);
  for (let i = 0; i < 5; i++) {
    const O = P[i * 2], Ia = P[(i * 2 + 9) % 10], Ib = P[i * 2 + 1];
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const l1 = 0.5 + 0.5 * Math.cos(a - 0.5 - Math.PI * 1.25), l2 = 0.5 + 0.5 * Math.cos(a + 0.5 - Math.PI * 1.25);
    const ramp = [[0, '#8e1610'], [0.5, '#b8241b'], [1, '#d63a2b']];
    el('path', { d: poly([[star.x, star.y], Ia, O], true), fill: rampHex(ramp, l1) }, sg);
    el('path', { d: poly([[star.x, star.y], O, Ib], true), fill: rampHex(ramp, l2) }, sg);
  }
  el('path', { d: poly(P, true), fill: 'url(#pat-weave)', opacity: 0.9 }, sg);
  el('path', { d: poly(P, true), fill: 'url(#pat-grit)', opacity: 0.25 }, sg);
  const P2 = starPts(star.x, star.y, star.R * 0.9, star.R * 0.36);
  el('path', { d: poly(P2, true), fill: 'none', stroke: '#f6c7b4', 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: 0.5 }, sg);
  el('path', { d: poly(P, true), fill: 'none', stroke: '#5a0a07', 'stroke-width': 2.2, opacity: 0.55 }, sg);
  return { g: g0, star, starG: sg, starPath: poly(P, true), crownD };
}

/* ---------- 斯诺的相机（正面，镜头可特写） ---------- */
function buildCamera(parent, o) {
  const g0 = G(parent, { transform: `translate(${o.x},${o.y}) scale(${o.s})` });
  const id = uid('cam');
  lgrad(id + '-chrome', [[0, '#f4f2ea'], [0.22, '#c4c2b9'], [0.55, '#76746d'], [0.8, '#a5a39b'], [1, '#55534e']]);
  lgrad(id + '-body', [[0, '#34302b'], [0.18, '#1d1b18'], [0.6, '#121110'], [1, '#070706']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  rgrad(id + '-ring', [[0, '#f2f0e6'], [0.55, '#8e8c85'], [1, '#34332f']], { cx: 0.32, cy: 0.28, r: 0.85 });
  rgrad(id + '-glass', [[0, '#0d1222'], [0.45, '#1d2458'], [0.78, '#2c1f4c'], [1, '#06070c']], { cx: 0.4, cy: 0.38, r: 0.68 });
  softEllipse(g0, 60, 138, 420, 64, 0.62);
  const knurl = (x, y, w, h) => { let d = ''; for (let i = 4; i < w; i += 5) d += `M${x + i},${y + 3}v${h - 6}`; return d; };
  el('rect', { x: -238, y: -208, width: 64, height: 36, rx: 6, fill: `url(#${id}-chrome)` }, g0);
  el('path', { d: knurl(-238, -208, 64, 36), stroke: '#3c3a36', 'stroke-width': 1.4, opacity: 0.6 }, g0);
  el('rect', { x: 148, y: -216, width: 82, height: 44, rx: 7, fill: `url(#${id}-chrome)` }, g0);
  el('path', { d: knurl(148, -216, 82, 44), stroke: '#3c3a36', 'stroke-width': 1.4, opacity: 0.6 }, g0);
  el('rect', { x: -300, y: -178, width: 600, height: 64, rx: 28, fill: `url(#${id}-chrome)` }, g0);
  el('rect', { x: -300, y: -128, width: 600, height: 254, rx: 24, fill: `url(#${id}-body)` }, g0);
  el('rect', { x: -300, y: -128, width: 600, height: 254, rx: 24, fill: 'url(#pat-grit)', opacity: 0.22 }, g0);
  el('rect', { x: -300, y: -128, width: 600, height: 254, rx: 24, fill: 'url(#pat-weave)', opacity: 0.35 }, g0);
  el('path', { d: 'M-276,-116H276', stroke: '#fff', 'stroke-opacity': 0.12, 'stroke-width': 2 }, g0);
  [[-264, -166, 50, 32], [174, -166, 58, 32], [-152, -162, 36, 24]].forEach(([x, y, w, h]) => {
    el('rect', { x, y, width: w, height: h, rx: 4, fill: '#161b24', stroke: '#2b2f36', 'stroke-width': 2 }, g0);
    el('path', { d: `M${x + 5},${y + h - 6}L${x + w * 0.55},${y + 5}`, stroke: '#9fb6d6', 'stroke-width': 3, opacity: 0.35 }, g0);
  });
  el('rect', { x: -312, y: -60, width: 16, height: 26, rx: 5, fill: `url(#${id}-chrome)` }, g0);
  el('rect', { x: 296, y: -60, width: 16, height: 26, rx: 5, fill: `url(#${id}-chrome)` }, g0);
  const lens = G(g0, { transform: 'translate(0,8)' });
  softEllipse(lens, 0, 0, 140, 140, 0.7);
  el('circle', { r: 114, fill: '#151515', stroke: '#2e2e2e', 'stroke-width': 2 }, lens);
  let kd = '';
  for (let i = 0; i < 90; i++) { const a = (i / 90) * Math.PI * 2; kd += `M${r1(Math.cos(a) * 103)},${r1(Math.sin(a) * 103)}L${r1(Math.cos(a) * 113)},${r1(Math.sin(a) * 113)}`; }
  el('path', { d: kd, stroke: '#404040', 'stroke-width': 2 }, lens);
  el('circle', { r: 97, fill: `url(#${id}-ring)` }, lens);
  el('circle', { r: 85, fill: '#111' }, lens);
  let td = '';
  for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2 - Math.PI / 2, l = i % 4 === 0 ? 8 : 4; td += `M${r1(Math.cos(a) * 80)},${r1(Math.sin(a) * 80)}L${r1(Math.cos(a) * (80 - l))},${r1(Math.sin(a) * (80 - l))}`; }
  el('path', { d: td, stroke: '#e2e0d6', 'stroke-width': 1.6, opacity: 0.75 }, lens);
  el('circle', { cx: 0, cy: -80, r: 2.8, fill: '#c9302a' }, lens);
  el('circle', { r: 72, fill: '#1b1b1b', stroke: '#5a5a5a', 'stroke-width': 1.5 }, lens);
  el('circle', { r: 61, fill: `url(#${id}-glass)` }, lens);
  const hex = [];
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2 + 0.2; hex.push([Math.cos(a) * 30, Math.sin(a) * 30]); }
  el('path', { d: poly(hex, true), fill: '#07080c', stroke: '#2e3346', 'stroke-width': 1.4, opacity: 0.85 }, lens);
  el('path', { d: hex.map((p, i) => `M${r1(p[0])},${r1(p[1])}L${r1(p[0] * 1.8 + hex[(i + 1) % 7][0] * 0.2)},${r1(p[1] * 1.8 + hex[(i + 1) % 7][1] * 0.2)}`).join(''), stroke: '#2a2f40', 'stroke-width': 1.2, opacity: 0.6 }, lens);
  el('circle', { r: 45, fill: 'none', stroke: '#5ad296', 'stroke-width': 3, opacity: 0.2 }, lens);
  el('path', { d: 'M-30,24A38,38 0 0 0 30,24', fill: 'none', stroke: '#d45ad4', 'stroke-width': 2.5, opacity: 0.22 }, lens);
  el('path', { d: 'M-47,-18A51,51 0 0 1 -18,-47', fill: 'none', stroke: '#fff', 'stroke-width': 4.5, opacity: 0.55, 'stroke-linecap': 'round', filter: 'url(#f-b1)' }, lens);
  el('circle', { cx: -26, cy: -30, r: 3.5, fill: '#fff', opacity: 0.8 }, lens);
  el('circle', { cx: 22, cy: 30, r: 2, fill: '#fff', opacity: 0.35 }, lens);
  const refl = G(lens, { transform: 'translate(-20,-16) rotate(8) scale(1,0.9)' });
  el('circle', { r: 30, fill: 'url(#g-glow-red)', opacity: 0.55 }, refl);
  el('path', { d: poly(starPts(0, 0, 15, 6), true), fill: '#e2392a', opacity: 0.92 }, refl);
  el('path', { d: poly(starPts(0, 0, 15, 6), true), fill: 'none', stroke: '#ffb09a', 'stroke-width': 0.8, opacity: 0.5 }, refl);
  return { g: g0, reflLocal: [-20, -8], reflR: 15, lensLocal: [0, 8] };
}

/* ---------- 手写体（伪英文连笔，不可读） ---------- */
function cursivePath(x0, y0, width, R, h = 11) {
  let d = '', x = x0;
  const a = 1.5, b = 1.95;
  while (x < x0 + width - 30) {
    const cycles = 2 + Math.floor(R() * 5);
    const hsz = [];
    for (let c = 0; c <= cycles + 1; c++) hsz.push(h * (R() < 0.2 ? 2.2 : 0.8 + R() * 0.35));
    let first = true;
    const s0 = Math.PI, s1 = Math.PI + cycles * 2 * Math.PI;
    for (let s = s0; s <= s1 + 0.01; s += 0.32) {
      const ci = Math.floor((s - s0) / (2 * Math.PI) + 0.5);
      const yy = -hsz[ci] * (1 + Math.cos(s)) / 2;
      const xx = x + a * (s - s0) - b * Math.sin(s) - yy * 0.32;
      d += (first ? 'M' : 'L') + r1(xx) + ',' + r1(y0 + yy);
      first = false;
    }
    x += a * cycles * 2 * Math.PI + 12 + R() * 10;
  }
  return d;
}

/* ---------- 笔记本 ---------- */
function buildNotebook(parent, o) {
  const m = M.chain(M.t(o.x, o.y), M.r(o.rot * DEG), M.s(o.sx, o.sy));
  const g0 = G(parent, { transform: M.str(m) });
  const id = uid('nb');
  lgrad(id + '-pl', [[0, '#e9dcbc'], [0.85, '#e2d3b1'], [1, '#b8a680']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  lgrad(id + '-pr', [[0, '#b3a17b'], [0.1, '#dfd0ae'], [1, '#ebdfc1']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  softRect(g0, -400 + 40, -270 + 34, 800, 540, 0.6);
  el('rect', { x: -412, y: -282, width: 824, height: 564, rx: 16, fill: '#3a2414' }, g0);
  el('rect', { x: -412, y: -282, width: 824, height: 564, rx: 16, fill: 'url(#pat-grit)', opacity: 0.4 }, g0);
  el('path', { d: 'M-396,-266H-6V266H-396Z', fill: `url(#${id}-pl)` }, g0);
  el('path', { d: 'M6,-266H396V266H6Z', fill: `url(#${id}-pr)` }, g0);
  el('rect', { x: -396, y: -266, width: 792, height: 532, fill: 'url(#pat-paper)', opacity: 0.85 }, g0);
  el('path', { d: 'M-392,268H392', stroke: '#cbbd9c', 'stroke-width': 3 }, g0);
  let rl = '';
  for (let y = -200; y < 260; y += 34) rl += `M-380,${y}H-20M20,${y}H380`;
  el('path', { d: rl, stroke: '#7f93ad', 'stroke-width': 1.2, opacity: 0.35 }, g0);
  el('path', { d: 'M-350,-266V266M50,-266V266', stroke: '#b5584f', 'stroke-width': 1.2, opacity: 0.3 }, g0);
  lgrad(id + '-sp', [[0, '#000', 0], [0.5, '#000', 0.3], [1, '#000', 0]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  el('rect', { x: -22, y: -266, width: 44, height: 532, fill: `url(#${id}-sp)` }, g0);
  const R = rng(o.seed || 3);
  const old = G(g0, { fill: 'none', stroke: '#1e2638', 'stroke-width': 1.9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.8 });
  for (let i = 0; i < 12; i++) {
    const y = -203 + i * 34;
    el('path', { d: cursivePath(-338, y, i === 11 ? 170 : 300 + R() * 30, R, 10) }, old);
  }
  const pageR = G(g0, { fill: 'none', stroke: '#141b2c', 'stroke-width': 2.1, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  return { g: g0, m, pageR, R };
}

/* ---------- 钢笔（笔尖在原点） ---------- */
function buildPen(parent) {
  const g0 = G(parent);
  const id = uid('pen');
  lgrad(id + '-b', [[0, '#3a3530'], [0.35, '#141210'], [0.7, '#0a0908'], [1, '#26221e']]);
  lgrad(id + '-g', [[0, '#fff0b8'], [0.4, '#d4a640'], [1, '#6b4b12']]);
  const sh = G(g0, { opacity: 0.28 });
  const shB = G(sh, { transform: 'rotate(-36)' });
  el('path', { d: 'M0,0L46,-9L100,-13L372,-13Q394,-13 394,0Q394,13 372,13L100,13L46,9Z', fill: '#000' }, shB);
  const body = G(g0, { transform: 'rotate(-36)' });
  el('path', { d: 'M0,0L46,-9L51,0L46,9Z', fill: `url(#${id}-g)` }, body);
  el('path', { d: 'M3,0L40,0', stroke: '#4a3208', 'stroke-width': 1.1 }, body);
  el('circle', { cx: 30, cy: 0, r: 2, fill: '#4a3208' }, body);
  el('path', { d: 'M46,-10L98,-12L98,12L46,10Z', fill: `url(#${id}-b)` }, body);
  el('rect', { x: 98, y: -13.5, width: 9, height: 27, fill: `url(#${id}-g)` }, body);
  el('path', { d: 'M107,-14L372,-14Q396,-14 396,0Q396,14 372,14L107,14Z', fill: `url(#${id}-b)` }, body);
  el('rect', { x: 300, y: -15, width: 8, height: 30, fill: `url(#${id}-g)` }, body);
  el('path', { d: 'M306,-18L382,-18Q390,-18 388,-12L308,-12Z', fill: `url(#${id}-g)` }, body);
  el('path', { d: 'M112,-8L370,-8', stroke: '#fff', 'stroke-opacity': 0.28, 'stroke-width': 3, 'stroke-linecap': 'round' }, body);
  return { g: g0, shadow: sh };
}
