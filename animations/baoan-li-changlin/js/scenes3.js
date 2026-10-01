'use strict';
/* =============================================================
 * scenes3.js —— 24.7 ~ 39 秒
 * S5  地主家大门·冷雨夜：扁担压弯、鞭影、撒落的粮食（扛活挨打受骂）
 * 形变  同一副肩头：扁担抬起、光掠过，化作步枪；雨化成雪（现在跟着红军）
 * S6  雪山夜行：火把长队蜿蜒、远处炮火、风雪加紧（行军打仗依旧艰苦）
 * S7  风雪骤停：八角帽上结霜的红星，霜自中心化开，心跳般发光（可我知道）
 * ============================================================= */

const S56 = {
  hit1: 26.95, hit2: 28.02,
  morph: [T.NOW - 0.2, T.NOW + 0.72],   // 扁担 → 步枪
  sweep: [T.NOW - 0.05, T.NOW + 0.55],
  pivot0: [-90, 330], pivot1: [-70, 990],
  ang0: 3.2 * DEG, ang1: -28 * DEG,
  poleLen: 1480, ropeX: 1392,
};

/* 步枪（汉阳造式样，侧面，枪托在原点，沿 +x） */
function buildRifle(parent) {
  const g0 = G(parent);
  const id = uid('rifle');
  lgrad(id + '-w', [[0, '#6b4a2c'], [0.35, '#4a311b'], [1, '#22150b']]);
  lgrad(id + '-m', [[0, '#7d8792'], [0.3, '#3a4048'], [1, '#15181c']]);
  const stock = [[0, -52], [14, -56], [250, -24], [318, -16], [470, -16], [560, -14], [1010, -12], [1024, -6], [1024, 12], [1000, 16], [470, 17], [430, 20], [415, 30], [345, 30], [318, 26], [250, 34], [40, 62], [0, 64]];
  el('path', { d: 'M120,58Q560,236 990,20', fill: 'none', stroke: '#2c2418', 'stroke-width': 9, 'stroke-linecap': 'round' }, g0);
  el('path', { d: 'M120,54Q560,230 990,16', fill: 'none', stroke: '#6a5a44', 'stroke-width': 2, opacity: 0.5 }, g0);
  el('path', { d: poly(stock, true), fill: `url(#${id}-w)` }, g0);
  el('path', { d: poly(stock, true), fill: 'url(#pat-wood)', opacity: 0.35 }, g0);
  el('rect', { x: -2, y: -54, width: 9, height: 118, rx: 2, fill: '#1c1f23' }, g0);
  el('path', { d: 'M480,-27L1330,-27L1330,-12L480,-12Z', fill: `url(#${id}-m)` }, g0);
  el('path', { d: 'M1316,-27L1321,-38L1326,-27Z', fill: '#2a2f35' }, g0);
  el('path', { d: 'M330,-31L470,-31Q486,-31 486,-20L486,-10L330,-10Z', fill: `url(#${id}-m)` }, g0);
  el('path', { d: 'M440,-24L466,-44', stroke: '#2a2f35', 'stroke-width': 6, 'stroke-linecap': 'round' }, g0);
  el('circle', { cx: 468, cy: -46, r: 8, fill: `url(#${id}-m)` }, g0);
  el('path', { d: 'M382,20L440,20L436,54L386,54Z', fill: `url(#${id}-m)` }, g0);
  el('path', { d: 'M348,28C350,54 392,56 398,30', fill: 'none', stroke: '#2a2f35', 'stroke-width': 4.5 }, g0);
  el('path', { d: 'M370,30C368,40 372,46 376,48', fill: 'none', stroke: '#2a2f35', 'stroke-width': 3 }, g0);
  [[632, 16], [982, 18]].forEach(([x, w]) => el('rect', { x, y: -29, width: w, height: 48, rx: 3, fill: `url(#${id}-m)` }, g0));
  // 顶部轮廓光（冷月光）
  const rim = el('path', { d: 'M14,-56L250,-24L318,-16M480,-27L1330,-27M330,-31L470,-31', fill: 'none', stroke: '#b9cde6', 'stroke-width': 2.6, opacity: 0.55, 'stroke-linecap': 'round' }, g0);
  // 霜
  const frost = G(g0, { opacity: 0 });
  softStroke(frost, 'M14,-56L250,-24L318,-16L470,-16M480,-27L1330,-27M632,-29H650M982,-29H1000', '#f2f7ff', 7, 0.8);
  const FR = rng(7);
  let fd = '';
  for (let i = 0; i < 140; i++) { const x = FR() * 1320, y = x < 480 ? lerp(-54, -16, x / 480) : -27; fd += circlePath(r1(x), r1(y + FR() * 6), r1(0.8 + FR() * 2)); }
  el('path', { d: fd, fill: '#ffffff', opacity: 0.8 }, frost);
  return { g: g0, frost, rim, outline: poly(stock, true) + 'M480,-27L1330,-27L1330,-12L480,-12Z' };
}

/* 扁担路径（局部坐标：支点在原点，沿 +x，末端下垂 b） */
function polePath(Lp, b) {
  const top = [], bot = [];
  for (let i = 0; i <= 24; i++) {
    const u = i / 24, x = Lp * u, yc = b * u * u, w = lerp(21, 14, u);
    top.push([x, yc - w]);
    bot.push([x, yc + w]);
  }
  return poly(top) + 'L' + bot.reverse().map(p => r1(p[0]) + ',' + r1(p[1])).join('L') + 'Z';
}

function buildS56(L) {
  const s = addScene({ name: 'S56', t0: 22.7, t1: 35.62, roots: [L.s56] });
  const root = G(L.s56);
  /* ---------------- 地主家大门（背景，冷雨夜） ---------------- */
  const past = G(root);
  const pastW = G(past);
  lgrad('g-s5-sky', [[0, '#070a10'], [1, '#161d29']]);
  el('rect', { x: -600, y: -600, width: 3200, height: 2400, fill: 'url(#g-s5-sky)' }, pastW);
  // 砖墙
  const brick = el('pattern', { id: 'pat-brick', patternUnits: 'userSpaceOnUse', width: 64, height: 30 }, DEFS);
  el('rect', { width: 64, height: 30, fill: '#262c36' }, brick);
  el('path', { d: 'M0,0.5H64M0,15.5H64M0.5,0V15M32.5,15V30', stroke: '#12161c', 'stroke-width': 2.4 }, brick);
  el('rect', { x: -600, y: 80, width: 3200, height: 880, fill: 'url(#pat-brick)' }, pastW);
  el('rect', { x: -600, y: 80, width: 3200, height: 880, fill: 'url(#pat-grit-l)', opacity: 0.4 }, pastW);
  lgrad('g-s5-walltop', [[0, '#05070a', 0.9], [0.3, '#05070a', 0.2], [1, '#05070a', 0.55]]);
  el('rect', { x: -600, y: 80, width: 3200, height: 880, fill: 'url(#g-s5-walltop)' }, pastW);
  el('path', { d: 'M-600,70H2600V96H-600Z', fill: '#101318' }, pastW);
  // 门楼
  const gx = 820;
  el('path', { d: `M${gx - 470},120L${gx - 430},-20L${gx + 430},-20L${gx + 470},120Z`, fill: '#0e1116' }, pastW);
  let tiles = '';
  for (let x = gx - 440; x <= gx + 440; x += 26) tiles += `M${x},-14L${x + (x - gx) * 0.05},116`;
  el('path', { d: tiles, stroke: '#1f242c', 'stroke-width': 9 }, pastW);
  let ends = '';
  for (let x = gx - 456; x <= gx + 456; x += 26) ends += circlePath(x, 124, 11);
  el('path', { d: ends, fill: '#1a1e25', stroke: '#2e343d', 'stroke-width': 2 }, pastW);
  el('rect', { x: gx - 420, y: 132, width: 840, height: 44, fill: '#15181e' }, pastW);
  el('path', { d: `M${gx - 400},150H${gx + 400}`, stroke: '#3a2a1c', 'stroke-width': 6, opacity: 0.6 }, pastW);
  // 门框、门扇
  el('rect', { x: gx - 330, y: 176, width: 660, height: 690, fill: '#3a3e46' }, pastW);
  el('rect', { x: gx - 330, y: 176, width: 660, height: 690, fill: 'url(#pat-grit)', opacity: 0.4 }, pastW);
  lgrad('g-s5-door', [[0, '#52211a'], [0.5, '#3c1612'], [1, '#230c09']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  const door = (x0) => {
    el('rect', { x: x0, y: 206, width: 272, height: 660, fill: 'url(#g-s5-door)' }, pastW);
    let pl = '';
    for (let k = 1; k < 5; k++) pl += `M${x0 + k * 54.4},206V866`;
    el('path', { d: pl, stroke: '#1a0806', 'stroke-width': 2, opacity: 0.6 }, pastW);
    let st = '';
    for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) st += circlePath(x0 + 34 + c * 51, 262 + r * 82, 10.5);
    el('path', { d: st, fill: 'url(#g-stud)' }, pastW);
  };
  rgrad('g-stud', [[0, '#b3985f'], [0.5, '#6d5733'], [1, '#2c2213']], { cx: 0.35, cy: 0.3, r: 0.7 });
  door(gx - 290); door(gx + 18);
  el('rect', { x: gx - 18, y: 206, width: 36, height: 660, fill: '#140605' }, pastW);
  [gx - 60, gx + 60].forEach(x => {
    el('circle', { cx: x, cy: 540, r: 36, fill: 'url(#g-stud)' }, pastW);
    el('circle', { cx: x, cy: 540, r: 24, fill: 'none', stroke: '#2a2012', 'stroke-width': 4 }, pastW);
    el('circle', { cx: x, cy: 592, r: 27, fill: 'none', stroke: '#8a7447', 'stroke-width': 6.5 }, pastW);
  });
  el('rect', { x: gx - 330, y: 862, width: 660, height: 24, fill: '#1b0f0a' }, pastW);
  // 抱鼓石、台阶
  [gx - 360, gx + 360].forEach(x => {
    el('rect', { x: x - 44, y: 790, width: 88, height: 96, fill: '#474c55' }, pastW);
    el('circle', { cx: x, cy: 742, r: 58, fill: '#4e535d' }, pastW);
    el('circle', { cx: x, cy: 742, r: 40, fill: 'none', stroke: '#2e3239', 'stroke-width': 4 }, pastW);
  });
  el('path', { d: `M${gx - 480},886H${gx + 480}V924H${gx - 480}Z`, fill: '#3f444d' }, pastW);
  el('path', { d: `M${gx - 560},924H${gx + 560}V966H${gx - 560}Z`, fill: '#353a42' }, pastW);
  el('path', { d: `M${gx - 480},887H${gx + 480}M${gx - 560},925H${gx + 560}`, stroke: '#7c8591', 'stroke-width': 2, opacity: 0.45 }, pastW);
  // 湿地面
  lgrad('g-s5-ground', [[0, '#1c212a'], [1, '#0b0e13']]);
  el('rect', { x: -600, y: 966, width: 3200, height: 800, fill: 'url(#g-s5-ground)' }, pastW);
  // 灯笼
  const lanterns = [[gx - 430, 150], [gx + 430, 150]].map(([x, y], i) => {
    const lg = G(pastW);
    el('path', { d: `M${x},${y}V${y + 60}`, stroke: '#0b0c0e', 'stroke-width': 3 }, lg);
    const body = G(lg);
    el('circle', { cx: x, cy: y + 130, r: 230, fill: 'url(#g-lantern-glow)' }, body);
    el('rect', { x: x - 26, y: y + 58, width: 52, height: 14, rx: 3, fill: '#140b08' }, body);
    el('ellipse', { cx: x, cy: y + 130, rx: 54, ry: 64, fill: 'url(#g-lantern)' }, body);
    el('path', { d: `M${x - 30},${y + 72}Q${x - 44},${y + 130} ${x - 30},${y + 188}M${x},${y + 66}V${y + 194}M${x + 30},${y + 72}Q${x + 44},${y + 130} ${x + 30},${y + 188}`, fill: 'none', stroke: '#6e1a0e', 'stroke-width': 3, opacity: 0.7 }, body);
    el('rect', { x: x - 24, y: y + 188, width: 48, height: 12, rx: 3, fill: '#140b08' }, body);
    el('path', { d: `M${x - 10},${y + 200}v44M${x},${y + 200}v50M${x + 10},${y + 200}v44`, stroke: '#a3281a', 'stroke-width': 3 }, body);
    // 地面倒影
    const refl = softEllipse(pastW, x, 1030, 70, 120, 0.3, '#d25a2e');
    return { g: lg, body, x, y, refl, i };
  });
  rgrad('g-lantern', [[0, '#ffcf7a'], [0.35, '#f0782e'], [0.8, '#b22a18'], [1, '#6e140c']], { cx: 0.45, cy: 0.45, r: 0.6 });
  rgrad('g-lantern-glow', [[0, '#ff8a42', 0.42], [0.35, '#e0582e', 0.16], [1, '#c0401e', 0]]);
  lgrad('g-s5-haze', [[0, '#1a2230', 0], [0.6, '#1a2230', 0.25], [1, '#0d1118', 0.55]]);
  el('rect', { x: -600, y: -600, width: 3200, height: 2400, fill: 'url(#g-s5-haze)' }, pastW);
  // 背景只用雾色压低对比，不做整层模糊（实时播放更流畅）

  /* ---------------- 雪山夜行（背景） ---------------- */
  const march = G(root);
  lgrad('g-s6-sky', [[0, '#050a14'], [0.55, '#111d31'], [1, '#22324b']]);
  el('rect', { x: -800, y: -800, width: 3600, height: 2600, fill: 'url(#g-s6-sky)' }, march);
  rgrad('g-s6-moon', [[0, '#e8f0ff', 0.55], [0.18, '#a9bedb', 0.22], [1, '#6f86a8', 0]]);
  el('circle', { cx: 1560, cy: 150, r: 520, fill: 'url(#g-s6-moon)' }, march);
  const clouds = G(march, { opacity: 0.8 });
  [[300, 180, 480, 110], [1100, 110, 600, 100], [1800, 230, 540, 120], [700, 300, 440, 80]].forEach(([x, y, rx, ry]) => softEllipse(clouds, x, y, rx, ry, 1, '#0a1220'));
  const flashes = G(march);
  const fl = [[380, 420, 31.55], [640, 450, 32.25], [240, 470, 32.85]].map(([x, y, at]) => ({ at, e: el('circle', { cx: x, cy: y, r: 260, fill: 'url(#g-flash)', opacity: 0 }, flashes) }));
  rgrad('g-flash', [[0, '#ffe2a8', 0.9], [0.25, '#ff9a48', 0.45], [1, '#ff7a30', 0]]);
  const farL = G(march);
  {
    const R = rng(88);
    const key = [[-700, 660], [-300, 430], [-40, 540], [300, 330], [560, 505], [820, 395], [1060, 480], [1320, 300], [1530, 450], [1760, 355], [2010, 470], [2260, 330], [2700, 540]];
    let pts = key.slice(), amp = 90;
    for (let l = 0; l < 6; l++) {
      const np = [];
      for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; np.push(a, [(a[0] + b[0]) / 2 + (R() - 0.5) * amp * 0.3, (a[1] + b[1]) / 2 + (R() - 0.5) * amp]); }
      np.push(pts[pts.length - 1]);
      pts = np; amp *= 0.55;
    }
    lgrad('g-s6-far', [[0, '#c6d3e4'], [0.35, '#8c9db6'], [0.75, '#4d5d78'], [1, '#2d3a52']], { gradientUnits: 'userSpaceOnUse', x1: 0, y1: 300, x2: 0, y2: 760 });
    const d = poly(pts) + 'L2700,1400L-700,1400Z';
    el('path', { d, fill: 'url(#g-s6-far)' }, farL);
    // 背光面（月光自右上来）
    let sh = '';
    for (let k = 1; k < key.length - 1; k++) {
      const S = key[k];
      if (!(S[1] < key[k - 1][1] && S[1] < key[k + 1][1])) continue;
      const V = key[k - 1];
      const seg = pts.filter(p => p[0] >= V[0] && p[0] <= S[0]);
      let x = S[0], y = S[1], down = `L${r1(x)},${r1(y)}`;
      while (y < 760) { x += (R() - 0.35) * 22; y += 24 + R() * 20; down += `L${r1(x)},${r1(y)}`; }
      sh += poly(seg) + down + `L${r1(V[0])},800Z`;
    }
    el('path', { d: sh, fill: '#16203a', opacity: 0.55 }, farL);
    // 冰沟雪痕
    let st = '';
    for (let k = 0; k < 90; k++) { const p = pts[Math.floor(R() * pts.length)]; let x = p[0], y = p[1] + 6; st += `M${r1(x)},${r1(y)}`; for (let q = 0; q < 4; q++) { x += (R() - 0.5) * 16; y += 14 + R() * 18; st += `L${r1(x)},${r1(y)}`; } }
    el('path', { d: st, fill: 'none', stroke: '#e8eef8', 'stroke-width': 1.6, opacity: 0.35 }, farL);
    el('path', { d, fill: 'url(#pat-grit-l)', opacity: 0.25 }, farL);
    lgrad('g-s6-mist', [[0, '#8fa3c0', 0], [0.5, '#8fa3c0', 0.3], [1, '#8fa3c0', 0.3]]);
    el('rect', { x: -700, y: 540, width: 3400, height: 900, fill: 'url(#g-s6-mist)' }, farL);

  }
  const midL = G(march);
  lgrad('g-s6-mid', [[0, '#26354e'], [1, '#101826']]);
  let midPts;
  {
    const R = rng(91);
    let pts = [[520, 900], [640, 860], [900, 760], [1180, 630], [1420, 430], [1620, 360], [1900, 470], [2240, 580], [2700, 650]], amp = 50;
    for (let l = 0; l < 5; l++) {
      const np = [];
      for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; np.push(a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + (R() - 0.5) * amp]); }
      np.push(pts[pts.length - 1]);
      pts = np; amp *= 0.55;
    }
    midPts = pts;
  }
  const midD = poly(midPts) + 'L2700,1400L500,1400Z';
  el('path', { d: midD, fill: 'url(#g-s6-mid)' }, midL);
  softStroke(midL, poly(midPts), '#c9d6e6', 8, 0.4);
  el('path', { d: midD, fill: 'url(#pat-grit-l)', opacity: 0.2 }, midL);
  const trailPts = [[900, 900], [1300, 820], [1100, 760], [1450, 690], [1270, 632], [1520, 560], [1400, 502], [1600, 440], [1640, 382]];
  const trail = makeTrack(trailPts, 30);
  el('path', { d: poly(trailPts), fill: 'none', stroke: '#9fb0c6', 'stroke-width': 3, opacity: 0.22 }, midL);
  const torchG = G(midL);
  const torches = [];
  for (let i = 0; i < 40; i++) {
    const tg = G(torchG);
    el('circle', { r: 26, fill: 'url(#g-torch)' }, tg);
    el('circle', { r: 3.2, fill: '#fff1c8' }, tg);
    torches.push({ g: tg, u0: i * 0.026, seed: i * 7.1 });
  }
  rgrad('g-torch', [[0, '#ffc070', 0.9], [0.3, '#ff9a48', 0.45], [1, '#ff8030', 0]]);
  const foreL = G(march);
  lgrad('g-s6-snow', [[0, '#9cadc4'], [0.4, '#6f809a'], [1, '#2a3446']]);
  el('path', { d: 'M700,1400L760,1010C900,960 1100,930 1300,915C1500,900 1700,860 1900,850C2100,840 2400,860 2700,880L2700,1400Z', fill: 'url(#g-s6-snow)' }, foreL);
  el('path', { d: 'M1200,960l40,-34l52,10l30,40ZM1620,905l30,-40l60,6l20,44ZM2050,900l30,-28l40,12l10,30Z', fill: '#1b2230' }, foreL);
  el('path', { d: 'M1200,960l40,-34l52,10M1620,905l30,-40l60,6M2050,900l30,-28l40,12', fill: 'none', stroke: '#dfe8f4', 'stroke-width': 4, opacity: 0.6 }, foreL);
  const fog = el('rect', { x: -800, y: -800, width: 3600, height: 2600, fill: '#dfe7f1', opacity: 0 }, root);

  /* ---------------- 前景：同一副肩头 ---------------- */
  const carry = G(root);
  // 筐（挂在扁担梢头）
  const basket = G(root);
  const bk = G(basket);
  el('path', { d: 'M0,0L-150,250M0,0L0,262M0,0L150,250', stroke: '#6b5434', 'stroke-width': 4.5, fill: 'none' }, bk);
  el('path', { d: 'M0,0L-150,250M0,0L0,262M0,0L150,250', stroke: '#b3a07a', 'stroke-width': 1.2, fill: 'none', 'stroke-dasharray': '3 4', opacity: 0.5 }, bk);
  lgrad('g-sack', [[0, '#5a4a34'], [0.5, '#3e3222'], [1, '#1c160e']], { x1: 0, y1: 0, x2: 1, y2: 1 });
  el('path', { d: 'M-150,262C-160,190 -110,150 -40,160C-10,120 60,118 100,160C150,150 176,210 158,262Z', fill: 'url(#g-sack)' }, bk);
  el('path', { d: 'M-150,262C-160,190 -110,150 -40,160C-10,120 60,118 100,160C150,150 176,210 158,262Z', fill: 'url(#pat-weave)', opacity: 0.8 }, bk);
  el('path', { d: 'M-40,160C-30,190 -34,230 -30,262M100,160C90,190 96,230 92,262', fill: 'none', stroke: '#241c11', 'stroke-width': 3, opacity: 0.6 }, bk);
  lgrad('g-basket', [[0, '#141009'], [0.3, '#3a3022'], [0.55, '#524430'], [0.8, '#2c2418'], [1, '#0e0b07']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  const bodyD = 'M-172,256L172,256L150,560Q0,590 -150,560Z';
  el('path', { d: bodyD, fill: 'url(#g-basket)' }, bk);
  el('path', { d: bodyD, fill: 'url(#pat-bamboo)' }, bk);
  el('path', { d: 'M-150,560Q0,590 150,560', fill: 'none', stroke: '#1d170f', 'stroke-width': 8 }, bk);
  el('ellipse', { cx: 0, cy: 256, rx: 176, ry: 22, fill: 'none', stroke: '#5c4b31', 'stroke-width': 12 }, bk);
  el('path', { d: 'M-176,256A176,22 0 0 0 176,256', fill: 'none', stroke: '#a88f63', 'stroke-width': 3, opacity: 0.6 }, bk);
  el('path', { d: 'M100,330l24,-6l8,22l-22,8Z', fill: '#1a130b' }, bk);
  softStroke(bk, 'M172,256L150,560', '#e0643a', 6, 0.4);
  el('path', { d: 'M-150,262C-160,190 -110,150 -40,160C-10,120 60,118 100,160C150,150 176,210 158,262', fill: 'none', stroke: '#c8704a', 'stroke-width': 3, opacity: 0.3 }, bk);
  // 扁担
  const poleG = G(carry);
  lgrad('g-pole', [[0, '#9a7a52'], [0.35, '#6a4c30'], [0.7, '#3f2a17'], [1, '#1e140a']]);
  const pole = el('path', { fill: 'url(#g-pole)' }, poleG);
  const poleTex = el('path', { fill: 'url(#pat-wood)', opacity: 0.3, 'data-live': 1 }, poleG);
  const poleRim = el('path', { fill: 'none', stroke: '#e07a48', 'stroke-width': 3, opacity: 0.35 }, poleG);
  const peg = el('rect', { width: 10, height: 64, rx: 3, fill: '#2a1c10' }, poleG);
  const loop = el('ellipse', { rx: 9, ry: 24, fill: 'none', stroke: '#8a6d44', 'stroke-width': 5 }, poleG);
  // 步枪
  const rifleG = G(carry);
  const rifle = buildRifle(rifleG);
  // 形变遮罩
  const mkMask = inv => {
    const id = uid('m');
    const g = lgrad(id + '-g', inv ? [[0, '#000'], [1, '#fff']] : [[0, '#fff'], [1, '#000']], { gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 100, y2: 0 });
    el('rect', { x: -400, y: -400, width: 2400, height: 800, fill: `url(#${id}-g)` }, el('mask', { id, maskUnits: 'userSpaceOnUse', x: -400, y: -400, width: 2400, height: 800 }, DEFS));
    return { id, g };
  };
  const mRifle = mkMask(false), mPole = mkMask(true);
  rifleG.setAttribute('mask', `url(#${mRifle.id})`);
  poleG.setAttribute('mask', `url(#${mPole.id})`);
  const cpR = uid('cp');
  el('path', { d: rifle.outline + polePath(S56.poleLen, 0) }, el('clipPath', { id: cpR }, DEFS));
  const glintG = G(carry, { 'clip-path': `url(#${cpR})` });
  lgrad('g-sweep', [[0, '#fff', 0], [0.5, '#ffe7b0', 0.95], [1, '#fff', 0]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  const glint = el('rect', { x: 0, y: -80, width: 130, height: 180, fill: 'url(#g-sweep)' }, glintG);
  // 鞭影
  const whips = [S56.hit1, S56.hit2].map((at, i) => {
    const d = i === 0 ? 'M2150,-120C1700,120 1320,300 980,520C760,660 560,760 360,840' : 'M2100,80C1760,260 1500,420 1240,560C1080,650 940,720 820,780';
    const wg = G(root);
    const ghost = el('path', { d, fill: 'none', stroke: '#ff8a70', 'stroke-width': 14, opacity: 0, 'stroke-linecap': 'round', transform: 'translate(-40,-26)' }, wg);
    const glow = el('path', { d, fill: 'none', stroke: '#ffcfb8', 'stroke-width': 26, opacity: 0, 'stroke-linecap': 'round' }, wg);
    const core = el('path', { d, fill: 'none', stroke: '#fff4ec', 'stroke-width': 4, opacity: 0, 'stroke-linecap': 'round' }, wg);
    const len = core.getTotalLength();
    [glow, core, ghost].forEach(p => p.setAttribute('stroke-dasharray', `${len} ${len}`));
    return { at, glow, core, ghost, len, amp: i ? 0.65 : 1 };
  });

  /* ---------------- 每帧 ---------------- */
  const [m0, m1] = S56.morph;
  const poleState = t => {
    const k = E.io3(prog(t, m0, m1));
    let bob = 9 * Math.sin((t * 2 * Math.PI) / 1.05);
    let jolt = 0;
    [S56.hit1, S56.hit2].forEach((h, i) => { const dt = t - h; if (dt > 0) jolt += (i ? 16 : 30) * Math.exp(-dt * 4.2) * Math.sin(Math.min(dt * 11, Math.PI * 0.5 + dt * 6)); });
    const sink = 18 * E.sine(prog(t, 27.0, 28.6));
    const march = 7 * Math.sin((t * 2 * Math.PI) / 0.95);
    const px = lerp(S56.pivot0[0], S56.pivot1[0], k);
    const py = lerp(S56.pivot0[1] + bob + jolt + sink, S56.pivot1[1] + march, k);
    const ang = lerp(S56.ang0 + 0.004 * Math.sin((t * 2 * Math.PI) / 1.05 + 1) + jolt * 0.0009, S56.ang1 + 0.006 * Math.sin((t * 2 * Math.PI) / 0.95 + 0.6), k);
    const droop = lerp(52 + 8 * Math.sin((t * 2 * Math.PI) / 1.05 + 0.6) + jolt * 0.8 + sink * 0.8, 0, E.io2(prog(t, m0, m0 + 0.5)));
    return { px, py, ang, droop, k };
  };
  S56.poleState = poleState;

  const camK = [[22.7, [960, 540, 1.0, 0]], [24.7, [960, 540, 1.0, 0], 'stop'], [28.85, [905, 520, 1.075, 0]], [29.95, [960, 540, 1.0, 0], 'stop'], [35.6, [1010, 530, 1.05, 0]]];
  S56.camAt = t => { const c = camSpl(t, camK); return cam(c[0], c[1], c[2], c[3]); };
  s.update = t => {
    root.setAttribute('transform', M.str(S56.camAt(t)));
    // 墨色显影阶段（S4 的墨团作遮罩）
    L.s56.setAttribute('mask', t < 24.5 ? `url(#${S4.inkMaskId})` : 'none');
    const ps = poleState(t);
    const mt = M.chain(M.t(ps.px, ps.py), M.r(ps.ang));
    carry.setAttribute('transform', M.str(mt));
    pole.setAttribute('d', polePath(S56.poleLen, ps.droop));
    poleTex.setAttribute('d', polePath(S56.poleLen, ps.droop));
    poleRim.setAttribute('d', polePath(S56.poleLen, ps.droop));
    const ry = ps.droop * (S56.ropeX / S56.poleLen) ** 2;
    set(peg, { x: S56.poleLen - 24, y: ps.droop - 32 });
    set(loop, { cx: S56.ropeX, cy: r1(ry) });
    // 形变：光从肩头掠向梢头
    const sw = E.io2(prog(t, S56.sweep[0], S56.sweep[1]));
    const sx = lerp(-160, 1520, sw);
    set(mRifle.g, { x1: r1(sx - 60), x2: r1(sx + 60) });
    set(mPole.g, { x1: r1(sx - 60), x2: r1(sx + 60) });
    vis(rifleG, t > S56.sweep[0] - 0.02 ? 1 : 0);
    vis(poleG, t < S56.sweep[1] + 0.02 ? 1 : 0);
    glint.setAttribute('x', r1(sx - 65));
    vis(glintG, Math.sin(Math.PI * clamp(sw)) * 0.9);
    // 筐：随扁担晃，形变时滑落
    const A = M.ap(mt, S56.ropeX, ry);
    const dropT = Math.max(0, t - (m0 + 0.02));
    const swing = 2.6 * Math.sin((t * 2 * Math.PI) / 1.05 - 0.9) + [S56.hit1, S56.hit2].reduce((a, h) => a + (t > h ? 7 * Math.exp(-(t - h) * 2.2) * Math.sin((t - h) * 7) : 0), 0);
    basket.setAttribute('transform', `translate(${r1(A[0] + dropT * 60)},${r1(A[1] + 1600 * dropT * dropT)}) rotate(${r1(swing + dropT * 40)})`);
    vis(basket, t < m0 + 0.75 ? 1 : 0);
    // 背景切换
    const bx = E.io3(prog(t, m0 + 0.05, m1 + 0.2));
    pastW.setAttribute('transform', `translate(${r1(-40 + (t - 24.7) * 16)},${r1(bx * 420)})`);
    vis(past, 1 - E.sine(prog(t, m0 + 0.1, m1)));
    vis(march, E.sine(prog(t, m0 + 0.15, m1 + 0.25)));
    const pan = t - T.NOW;
    march.setAttribute('transform', `translate(0,${r1((1 - bx) * -380)})`);
    farL.setAttribute('transform', `translate(${r1(-pan * 4)},0)`);
    midL.setAttribute('transform', `translate(${r1(-pan * 12)},0)`);
    foreL.setAttribute('transform', `translate(${r1(-pan * 38)},0)`);
    lanterns.forEach(l => {
      const a = 4 * noise1(t * 0.9 + l.i * 9) + 2 * Math.sin(t * 1.7 + l.i);
      l.body.setAttribute('transform', `rotate(${r1(a)} ${l.x} ${l.y + 60})`);
      l.body.setAttribute('opacity', (0.86 + 0.14 * flick(t, l.i * 5 + 2)).toFixed(3));
      l.refl.setAttribute('opacity', (0.18 + 0.06 * noise1(t * 3 + l.i)).toFixed(3));
    });
    // 火把长队
    const mv = (t - 29) * 0.0105;
    torches.forEach(tc => {
      const u = tc.u0 + mv;
      if (u < 0 || u > 1) { vis(tc.g, 0); return; }
      const p = trail.at(u);
      tc.g.setAttribute('transform', `translate(${r1(p[0])},${r1(p[1] - 6)}) scale(${(0.85 + 0.15 * flick(t, tc.seed, 2)).toFixed(3)})`);
      vis(tc.g, (0.75 + 0.25 * flick(t, tc.seed)) * clamp(u * 12) * clamp((1 - u) * 20));
    });
    fl.forEach(f => { const k = (t - f.at) / 0.55; f.e.setAttribute('opacity', (k > 0 && k < 1 ? Math.sin(Math.PI * k) ** 0.6 * (0.9 - 0.4 * k) : 0).toFixed(3)); });
    // 鞭影
    POST.shake = [0, 0];
    whips.forEach(w => {
      const dt = t - w.at;
      const draw = clamp(dt / 0.09), fade = dt < 0 ? 0 : Math.exp(-Math.max(0, dt - 0.09) * 7);
      [w.glow, w.core, w.ghost].forEach(p => p.setAttribute('stroke-dashoffset', (w.len * (1 - draw)).toFixed(1)));
      w.ghost.setAttribute('opacity', (dt > 0 ? 0.28 * Math.exp(-Math.max(0, dt - 0.05) * 9) * w.amp : 0).toFixed(3));
      w.core.setAttribute('opacity', (dt > 0 ? fade * w.amp : 0).toFixed(3));
      w.glow.setAttribute('opacity', (dt > 0 ? 0.3 * fade * w.amp : 0).toFixed(3));
      if (dt > 0 && dt < 0.5) {
        const a = 16 * w.amp * Math.exp(-dt * 9);
        POST.shake[0] += a * Math.sin(dt * 95);
        POST.shake[1] += a * Math.cos(dt * 83);
        POST.flash = Math.max(POST.flash, 0.22 * w.amp * Math.exp(-dt * 14));
        POST.flashColor = '#ffe6dc';
      }
    });
    // 风雪白茫茫 → S7
    rifle.frost.setAttribute('opacity', (0.85 * E.sine(prog(t, 32.6, 35.0))).toFixed(3));
    const wo = env(t, 34.55, 35.15, 35.2, 35.6);
    fog.setAttribute('opacity', (0.93 * wo).toFixed(3));
    vis(root, 1);
  };
  const rain = seeds(420, 101, R => ({ x: R() * 2400 - 240, y: R() * 1300, v: 1500 + R() * 900, l: 26 + R() * 46, a: 0.12 + R() * 0.3, w: 0.8 + R() * 1.4 }));
  const snow = seeds(520, 103, R => ({ x: R() * 2400 - 240, y: R() * 1300, v: 90 + R() * 160, r: 0.8 + R() * 3.2, ph: R() * 6.28, a: 0.35 + R() * 0.6, z: R() }));
  const grains = seeds(240, 105, (R, i) => ({ at: 27.0 + i * 0.0068, vx: 30 + R() * 110, vy: -40 + R() * 70, r: 2.2 + R() * 1.8 }));
  s.fx = (ctx, t) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const shk = POST.shake;
    // 撒落的粮食
    if (t > 26.95 && t < S56.morph[0] + 0.6) {
      const ps = poleState(t);
      const mt = M.chain(M.t(ps.px, ps.py), M.r(ps.ang));
      const A = M.ap(mt, S56.ropeX, ps.droop * (S56.ropeX / S56.poleLen) ** 2);
      const hole = [A[0] + 118, A[1] + 336];
      const cm = S56.camAt(t);
      ctx.setTransform(cm[0], cm[1], cm[2], cm[3], cm[4], cm[5]);
      ctx.fillStyle = 'rgba(236,196,110,0.95)';
      for (const g of grains) {
        const dt = t - g.at;
        if (dt < 0 || dt > 1.1) continue;
        const x = hole[0] + g.vx * dt, y = hole[1] + g.vy * dt + 1400 * dt * dt;
        if (y > 1060) continue;
        ctx.globalAlpha = clamp(1.2 - dt);
        ctx.beginPath(); ctx.ellipse(x, y, g.r, g.r * 0.75, dt * 5, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    // 雨 → 雪
    const rainA = env(t, 23.2, 24.6, S56.morph[0] + 0.1, S56.morph[0] + 0.55);
    if (rainA > 0) {
      ctx.lineCap = 'round';
      for (let b = 0; b < 4; b++) {
        ctx.strokeStyle = `rgba(190,205,225,${((0.12 + b * 0.1) * rainA).toFixed(3)})`;
        ctx.lineWidth = 0.9 + b * 0.35;
        ctx.beginPath();
        for (let i = b; i < rain.length; i += 4) {
          const d = rain[i];
          const y = wrap(d.y + t * d.v, 1300) - 120, x = wrap(d.x - t * d.v * 0.2, 2400) - 240;
          ctx.moveTo(x + shk[0], y + shk[1]); ctx.lineTo(x - d.l * 0.2 + shk[0], y + d.l + shk[1]);
        }
        ctx.stroke();
      }
      ctx.strokeStyle = `rgba(200,212,230,${(0.35 * rainA).toFixed(3)})`;
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 40; i++) {
        const ph = ((t * 2.2 + hash1(i * 3)) % 1), x = hash1(i * 7 + 1) * 1920, y = 980 + hash1(i * 11 + 2) * 90;
        ctx.globalAlpha = 1 - ph;
        ctx.beginPath(); ctx.ellipse(x, y, 4 + ph * 16, 1.5 + ph * 4, 0, Math.PI, 2 * Math.PI); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    const snowA = env(t, S56.morph[0] + 0.2, S56.morph[1] + 0.3, 35.35, 35.62);
    if (snowA > 0) {
      const wind = 1 + 2.6 * E.in2(prog(t, 32.8, 35.2));
      const T0 = t - 28;
      for (let b = 0; b < 4; b++) {
        ctx.fillStyle = `rgba(236,242,250,${((0.35 + b * 0.17) * snowA).toFixed(3)})`;
        ctx.beginPath();
        for (let i = b; i < snow.length; i += 4) {
          const f = snow[i];
          const sp = f.v * (0.6 + f.z) * (1 + (wind - 1) * 0.8);
          const y = wrap(f.y + T0 * sp, 1300) - 110;
          const x = wrap(f.x - T0 * sp * 0.35 * wind + 18 * Math.sin(T0 * 1.3 + f.ph), 2400) - 240;
          const r = f.r * (0.6 + f.z * 0.8);
          ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 6.283);
        }
        ctx.fill();
      }
      const gust = E.in2(prog(t, 33.4, 35.2)) * snowA;
      if (gust > 0) {
        ctx.strokeStyle = `rgba(230,238,248,${(0.22 * gust).toFixed(3)})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let i = 0; i < 70; i++) {
          const y = hash1(i * 5) * 1080, x = wrap(hash1(i * 9) * 2400 - t * 2600, 2400) - 240;
          ctx.moveTo(x, y); ctx.lineTo(x + 180 + 120 * hash1(i), y + 40);
        }
        ctx.stroke();
      }
    }
  };
  return s;
}

/* ============================ S7 结霜的红星 ============================ */
function buildS7(L) {
  const s = addScene({ name: 'S7', t0: 34.9, t1: 39.05, roots: [L.s7] });
  const world = G(L.s7);
  lgrad('g-s7-sky', [[0, '#04070d'], [1, '#101a2a']]);
  el('rect', { x: -1600, y: -1600, width: 5120, height: 2200, fill: 'url(#g-s7-sky)' }, world);
  const bokeh = G(world);
  [[300, 250, 60], [520, 300, 40], [760, 220, 52], [1180, 280, 46], [1420, 240, 64], [1680, 300, 42], [980, 330, 30]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: 'url(#g-bokeh)' }, bokeh));
  el('rect', { x: -1600, y: 500, width: 5120, height: 3000, fill: '#141a22' }, world);
  const cap = buildCapFront(world, {});
  // 冷光
  el('rect', { x: -1600, y: 100, width: 5120, height: 3000, fill: '#1c2c48', style: 'mix-blend-mode:multiply', opacity: 0.55 }, world);
  softStroke(world, 'M160,360L380,222L680,158L960,146L1240,158L1540,222L1760,360', '#a9c3e6', 4, 0.5);
  // 积雪
  const snowcap = G(world);
  el('path', { d: 'M230,832Q960,1030 1690,832L1680,850Q960,1046 240,850Z', fill: '#e4ecf6', opacity: 0.6 }, snowcap);
  el('path', { d: 'M160,360L380,222L680,158L960,146L1240,158L1540,222L1760,360L1756,376L1538,238L1238,172L960,160L682,172L382,238L164,376Z', fill: '#e8eff8', opacity: 0.7 }, snowcap);
  el('path', { d: 'M280,740Q960,786 1640,740L1642,752Q960,798 278,752Z', fill: '#e4ecf6', opacity: 0.45 }, snowcap);
  const SC = CAPSTAR;
  // 红星内部的暖光
  const glow = el('circle', { cx: SC.x, cy: SC.y, r: 360, fill: 'url(#g-glow-red)', opacity: 0, style: 'mix-blend-mode:screen' }, world);
  const cp = uid('cp');
  el('path', { d: cap.starPath }, el('clipPath', { id: cp }, DEFS));
  const starWarm = el('rect', { x: SC.x - 260, y: SC.y - 220, width: 520, height: 460, fill: '#ff6a3a', opacity: 0, 'clip-path': `url(#${cp})`, style: 'mix-blend-mode:screen' }, world);
  // 霜（自中心化开）
  const mk = uid('m');
  const mask = el('mask', { id: mk, maskUnits: 'userSpaceOnUse', x: -1600, y: -1600, width: 5120, height: 4200 }, DEFS);
  el('rect', { x: -1600, y: -1600, width: 5120, height: 4200, fill: '#fff' }, mask);
  rgrad('g-s7-melt', [[0, '#000'], [0.72, '#000'], [1, '#000', 0]]);
  const melt = el('circle', { cx: SC.x, cy: SC.y, r: 0, fill: 'url(#g-s7-melt)' }, mask);
  const frost = G(world, { mask: `url(#${mk})` });
  el('path', { d: cap.starPath, fill: '#e9f1fb', opacity: 0.5 }, frost);
  el('path', { d: cap.starPath, fill: 'url(#pat-grit)', opacity: 0.6 }, frost);
  const FR = rng(17);
  let dots = '', cry = '';
  for (let i = 0; i < 900; i++) {
    const onStar = i < 520;
    const a = FR() * 6.283, rr = onStar ? Math.sqrt(FR()) * 165 : 130 + FR() * 900;
    const x = SC.x + Math.cos(a) * rr * (onStar ? 1 : 1.3), y = SC.y + Math.sin(a) * rr * (onStar ? 1 : 0.55);
    dots += circlePath(r1(x), r1(y), r1(0.6 + FR() * (onStar ? 2.2 : 1.6)));
  }
  for (let i = 0; i < 90; i++) {
    const a = FR() * 6.283, rr = Math.sqrt(FR()) * 230, x = SC.x + Math.cos(a) * rr, y = SC.y + Math.sin(a) * rr * 0.9, sz = 4 + FR() * 9, r0 = FR();
    for (let k = 0; k < 3; k++) { const b = r0 + (k * Math.PI) / 3; cry += `M${r1(x - Math.cos(b) * sz)},${r1(y - Math.sin(b) * sz)}L${r1(x + Math.cos(b) * sz)},${r1(y + Math.sin(b) * sz)}`; }
  }
  el('path', { d: dots, fill: '#f4f8ff', opacity: 0.85 }, frost);
  el('path', { d: cry, stroke: '#f4f8ff', 'stroke-width': 1.3, opacity: 0.75 }, frost);
  const flare = el('circle', { cx: SC.x, cy: SC.y, r: 200, fill: 'url(#g-glow-gold)', opacity: 0, style: 'mix-blend-mode:screen' }, world);
  const beats = [36.3, 37.15, 37.85, 38.35];
  const camK = [[34.9, [960, 540, 0.95, 0]], [38.5, [960, 490, 1.14, 0.004]], [39.05, [960, 462, 1.45, 0.006]]];
  S7.camAt = t => { const c = camSpl(t, camK); return cam(c[0], c[1], c[2], c[3]); };
  s.update = t => {
    world.setAttribute('transform', M.str(S7.camAt(t)));
    const mk2 = E.sine(prog(t, 35.9, 38.4));
    melt.setAttribute('r', r1(mk2 * 330));
    let beat = 0;
    beats.forEach((b, i) => { const dt = t - b; if (dt > -0.05) beat += (0.5 + i * 0.25) * Math.exp(-Math.max(0, dt) * 5) * clamp((dt + 0.05) / 0.05); });
    const warm = E.in2(prog(t, 36.0, 38.6));
    glow.setAttribute('opacity', clamp(warm * 0.55 + beat * 0.35).toFixed(3));
    glow.setAttribute('r', r1(300 + 60 * beat + 120 * warm));
    starWarm.setAttribute('opacity', clamp(warm * 0.35 + beat * 0.2).toFixed(3));
    const fk = prog(t, T.WHOM - 0.12, T.WHOM + 0.35);
    flare.setAttribute('opacity', clamp(E.in2(prog(t, 38.3, T.WHOM)) * 0.6 + Math.sin(Math.PI * fk)).toFixed(3));
    flare.setAttribute('r', r1(200 + 1600 * E.out2(fk)));
    if (t > T.WHOM - 0.1) { POST.flash = Math.max(POST.flash, 0.95 * Math.sin(Math.PI * clamp((t - T.WHOM + 0.1) / 0.9)) ** 1.5); POST.flashColor = '#fff1d6'; }
  };
  s.fx = (ctx, t) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const a = env(t, 35.0, 35.6, 38.7, 39.05);
    if (a <= 0) return;
    const slow = 1 - 0.85 * E.out2(prog(t, 35.1, 36.2));
    const T0 = 35.1 + (t - 35.1) * slow;
    for (let i = 0; i < 160; i++) {
      const z = hash1(i * 3 + 1), r = 1 + z * 3.5;
      const y = wrap(hash1(i * 7) * 1200 + T0 * (40 + z * 60) * (1 + 3 * (1 - slow)), 1200) - 60;
      const x = wrap(hash1(i * 11) * 2100 - T0 * 30 * (1 + 4 * (1 - slow)) + 20 * Math.sin(T0 + i), 2100) - 90;
      ctx.fillStyle = `rgba(236,242,250,${(a * (0.3 + 0.5 * z)).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
    }
    for (let i = 0; i < 7; i++) {
      const x = wrap(hash1(i * 5 + 9) * 2000 - t * 12, 2000) - 40, y = 120 + hash1(i * 13) * 850 + 14 * Math.sin(t * 0.6 + i), r = 18 + hash1(i) * 26;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(240,245,252,${(0.22 * a).toFixed(3)})`);
      g.addColorStop(1, 'rgba(240,245,252,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  };
  return s;
}
const S7 = {};
