'use strict';
/* =============================================================
 * scenes5.js —— 53 ~ 60.505 秒
 * S11b 黎明山梁：火苗落地，山丹丹花破土开放（牺牲）
 * S12a 花心的红烧成铁水，注入圆模，冷却成一枚带五角星的铜元（也铸就了）
 * S12b 铜元静静立在窑洞窗台上，旁边是还回来的碗；水缸挑满、扁担靠墙、
 *      铺草捆好、院子扫净，朝阳照进窗花（他严守群众纪律的准则）
 * ============================================================= */

/* ---------- 山丹丹花（细叶百合） ---------- */
function buildLily(parent, o) {
  const g0 = G(parent);
  const id = uid('lily');
  lgrad(id + '-p', [[0, '#ff8f4e'], [0.4, '#f0422b'], [1, '#b2151a']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  lgrad(id + '-s', [[0, '#1c2a18'], [1, '#34502b']]);
  const stemD = `M${o.bx},${o.by}C${o.bx + o.bend},${lerp(o.by, o.hy, 0.4)} ${o.hx - o.bend * 0.6},${lerp(o.by, o.hy, 0.8)} ${o.hx},${o.hy + 22 * o.sc}`;
  const stem = el('path', { d: stemD, fill: 'none', stroke: `url(#${id}-s)`, 'stroke-width': 6 * o.sc, 'stroke-linecap': 'round' }, g0);
  const sLen = stem.getTotalLength();
  stem.setAttribute('stroke-dasharray', `${sLen} ${sLen}`);
  const leaves = [];
  for (let k = 1; k <= 9; k++) {
    const u = k / 11, p = stem.getPointAtLength(u * sLen), side = k % 2 ? 1 : -1;
    const lg = G(g0, { transform: `translate(${r1(p.x)},${r1(p.y)}) rotate(${-90 + side * (38 + (k % 3) * 6)}) scale(${o.sc * (1 - u * 0.4)})` });
    el('path', { d: 'M0,0C12,-3 40,-4 60,0C40,4 12,3 0,0Z', fill: '#2d4a26' }, lg);
    el('path', { d: 'M2,0L56,0', stroke: '#4d6e3c', 'stroke-width': 0.8, opacity: 0.7 }, lg);
    leaves.push({ g: lg, u });
  }
  const head = G(g0);
  const bud = el('path', { d: 'M0,-8C12,-6 16,28 0,56C-16,28 -12,-6 0,-8Z', fill: '#a8302a' }, head);
  // 花瓣：宽、反卷，前后两层；避免细长花瓣与长花丝（那样会像彼岸花）
  lgrad(id + '-pb', [[0, '#d24a2a'], [0.5, '#a8201a'], [1, '#6e0f10']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  const TEPAL = 'M0,0C16,-24 56,-34 88,-22C106,-15 116,0 108,12C103,19 92,18 86,12C80,20 60,27 36,23C17,20 5,11 0,0Z';
  const CURL = 'M88,-22C106,-15 116,0 108,12C103,19 92,18 86,12C92,4 93,-10 88,-22Z';
  const layout = [[-120, 0.92, 1], [0, 0.95, 1], [120, 0.9, 1], [-60, 1, 0], [60, 1.02, 0], [180, 0.97, 0]];
  const petals = layout.map(([a, sc, back], i) => {
    const pg = G(head);
    el('path', { d: TEPAL, fill: `url(#${id}${back ? '-pb' : '-p'})` }, pg);
    el('path', { d: CURL, fill: back ? '#4e0a0c' : '#8a1014', opacity: 0.85 }, pg);
    el('path', { d: 'M4,1C34,-4 66,-10 94,-14', fill: 'none', stroke: back ? '#e07a60' : '#ffc4a4', 'stroke-width': 1.4, opacity: back ? 0.3 : 0.5 }, pg);
    if (!back) {
      let sp = '';
      for (let k = 0; k < 6; k++) sp += circlePath(r1(18 + k * 5.5), r1(-4 + ((k * 7) % 5) - 2), 1.5);
      el('path', { d: sp, fill: '#5a0c0a', opacity: 0.55 }, pg);
      if (i % 2) el('circle', { cx: 64, cy: -12, r: 2.4, fill: '#fff', opacity: 0.8 }, pg);
    }
    return { g: pg, a: a * DEG, sc };
  });
  const stamens = G(head);
  [-150, -100, -40, 40, 100, 150].forEach((a, i) => {
    const r = 40 + (i % 3) * 5, ar = (a + 90) * DEG, ex = Math.cos(ar) * r * 0.8, ey = Math.sin(ar) * r;
    el('path', { d: `M0,0Q${r1(ex * 0.4)},${r1(ey * 0.6)} ${r1(ex)},${r1(ey)}`, fill: 'none', stroke: '#f0b080', 'stroke-width': 1.5 }, stamens);
    el('ellipse', { cx: r1(ex), cy: r1(ey), rx: 3.4, ry: 6, fill: '#7a3212' }, stamens);
  });
  el('path', { d: 'M0,0Q2,26 1,50', fill: 'none', stroke: '#d8c878', 'stroke-width': 2 }, stamens);
  el('circle', { cx: 1, cy: 52, r: 3.6, fill: '#8a6a30' }, stamens);
  el('circle', { r: 9, fill: '#ffb070' }, head);
  return {
    g: g0, head,
    update(grow, bloom) {
      stem.setAttribute('stroke-dashoffset', (sLen * (1 - grow)).toFixed(1));
      leaves.forEach(l => vis(l.g, clamp((grow - l.u) * 6)));
      const top = stem.getPointAtLength(sLen * clamp(grow));
      const hs = o.sc * lerp(0.35, 1, E.out2(clamp(grow * 1.4 - 0.4)));
      head.setAttribute('transform', `translate(${r1(top.x)},${r1(top.y - 22 * o.sc * clamp(grow))}) scale(${hs.toFixed(3)})`);
      vis(head, grow > 0.55 ? 1 : 0);
      vis(bud, 1 - clamp(bloom * 4));
      const b = E.out3(bloom);
      petals.forEach(p => {
        const a = lerp(Math.PI / 2, p.a - Math.PI / 2, b);
        p.g.setAttribute('transform', `rotate(${r1(a / DEG)}) scale(${(lerp(0.42, 1, b) * p.sc).toFixed(3)},${(lerp(0.3, 1, b) * p.sc).toFixed(3)})`);
        vis(p.g, clamp(bloom * 5));
      });
      stamens.setAttribute('transform', `scale(${clamp((bloom - 0.5) * 2).toFixed(3)})`);
      vis(stamens, clamp((bloom - 0.5) * 3));
    },
  };
}

function buildS11b(L) {
  const s = addScene({ name: 'S11b', t0: 53.05, t1: 55.35, roots: [L.s11b] });
  const world = G(L.s11b);
  lgrad('g-dawn-sky', [[0, '#141a33'], [0.4, '#3c3458'], [0.72, '#9a5a64'], [0.9, '#e39668'], [1, '#f6c48a']]);
  el('rect', { x: -1400, y: -1400, width: 4720, height: 2000, fill: 'url(#g-dawn-sky)' }, world);
  rgrad('g-dawn-sun', [[0, '#fff0c8', 0.95], [0.2, '#ffc88a', 0.55], [1, '#ff9a60', 0]]);
  const sun = el('circle', { cx: 1380, cy: 600, r: 520, fill: 'url(#g-dawn-sun)' }, world);
  [[560, '#4a3a5c', 18], [620, '#34294a', 12], [690, '#221b34', 9]].forEach(([y0, col, sd], i) => {
    const pts = ridgeLine(-1400, 3400, y0, { spacing: 260, h: 70 + i * 20, w: 260 }, 60 + i, 50);
    el('path', { d: smooth(pts) + 'L3400,2400L-1400,2400Z', fill: col }, world);
    el('path', { d: smooth(pts), fill: 'none', stroke: '#ffb88a', 'stroke-width': 2, opacity: 0.25 - i * 0.06 }, world);
  });
  lgrad('g-s11-mist', [[0, '#c89090', 0], [0.5, '#c89090', 0.22], [1, '#c89090', 0]]);
  el('rect', { x: -1400, y: 580, width: 4720, height: 220, fill: 'url(#g-s11-mist)' }, world);
  // 前景山梁
  lgrad('g-ridge', [[0, '#2a1d1a'], [0.3, '#1a1210'], [1, '#0c0807']]);
  const rp = [[-1400, 900], [-400, 860], [300, 820], [700, 792], [960, 780], [1250, 790], [1650, 825], [2300, 870], [3400, 930]];
  el('path', { d: smooth(rp) + 'L3400,2400L-1400,2400Z', fill: 'url(#g-ridge)' }, world);
  el('path', { d: smooth(rp), fill: 'none', stroke: '#ffae78', 'stroke-width': 3, opacity: 0.4 }, world);
  const grass = G(world, { stroke: '#120c0a', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' });
  const GR = rng(33);
  for (let i = 0; i < 90; i++) {
    const x = -400 + GR() * 2700, y = 790 + GR() * 40 + Math.abs(x - 960) * 0.05;
    let d = '';
    for (let k = 0; k < 4; k++) d += `M${r1(x + k * 3)},${r1(y)}q${r1((GR() - 0.5) * 14)},${r1(-10 - GR() * 14)} ${r1((GR() - 0.5) * 22)},${r1(-20 - GR() * 26)}`;
    el('path', { d }, grass);
  }
  const groundGlow = el('ellipse', { cx: 960, cy: 815, rx: 420, ry: 90, fill: 'url(#g-glow-gold)', opacity: 0 }, world);
  const flowers = [
    { bx: 960, by: 800, hx: 975, hy: 470, sc: 1.0, bend: -30, at: 53.55 },
    { bx: 820, by: 812, hx: 780, hy: 585, sc: 0.78, bend: 20, at: 53.72 },
    { bx: 1120, by: 812, hx: 1165, hy: 600, sc: 0.8, bend: -26, at: 53.8 },
    { bx: 680, by: 830, hx: 630, hy: 700, sc: 0.6, bend: 16, at: 53.95 },
    { bx: 1280, by: 822, hx: 1330, hy: 712, sc: 0.6, bend: -18, at: 54.02 },
  ].map(o => Object.assign(o, { lily: buildLily(world, o) }));
  const heat = el('circle', { cx: 975, cy: 470, r: 80, fill: 'url(#g-glow-gold)', opacity: 0 }, world);
  const camK = [[53.15, [960, 610, 1.0, 0]], [54.5, [966, 560, 1.12, 0.004]], [55.35, [975, 472, 5.6, 0.01]]];
  const camAt = t => { const c = camSpl(t, camK); return cam(c[0], c[1], c[2], c[3]); };
  s.update = t => {
    world.setAttribute('transform', M.str(camAt(t)));
    vis(L.s11b, E.sine(prog(t, 53.05, 53.7)));
    sun.setAttribute('opacity', (0.75 + 0.25 * E.sine(prog(t, 53.2, 55))).toFixed(3));
    const gp = prog(t, 53.4, 54.3);
    groundGlow.setAttribute('opacity', (Math.sin(Math.PI * gp) * 0.9).toFixed(3));
    flowers.forEach(f => {
      const grow = E.out2(prog(t, f.at, f.at + 0.55));
      const bloom = prog(t, f.at + 0.45, f.at + 1.05);
      f.lily.update(grow, bloom);
    });
    const hk = E.in2(prog(t, 54.75, 55.3));
    heat.setAttribute('opacity', clamp(hk * 1.2).toFixed(3));
    heat.setAttribute('r', r1(60 + 260 * hk));
  };
  s.fx = (ctx, t) => {
    const m = camAt(t);
    ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
    const a = env(t, 53.3, 53.9, 54.9, 55.3);
    for (let i = 0; i < 40; i++) {
      const x = 500 + hash1(i * 3) * 950 + Math.sin(t * 0.8 + i) * 20, y = 820 - ((t - 53) * (30 + hash1(i) * 50) + hash1(i * 7) * 400) % 420;
      ctx.fillStyle = `rgba(255,200,140,${(a * 0.5 * hash1(i * 11)).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(x, y, 1 + hash1(i * 5) * 1.6, 0, 6.283); ctx.fill();
    }
  };
  return s;
}

/* ---------- 五角星浮雕（铜元） ---------- */
function starRelief(parent, cx, cy, R, pal) {
  const g0 = G(parent);
  const P = starPts(cx, cy, R, R * 0.4);
  const faces = [];
  for (let i = 0; i < 5; i++) {
    const O = P[i * 2], Ia = P[(i * 2 + 9) % 10], Ib = P[i * 2 + 1];
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const l1 = 0.5 + 0.5 * Math.cos(a - 0.5 - Math.PI * 1.75), l2 = 0.5 + 0.5 * Math.cos(a + 0.5 - Math.PI * 1.75);
    faces.push(el('path', { d: poly([[cx, cy], Ia, O], true), fill: rampHex(pal, l1) }, g0));
    faces.push(el('path', { d: poly([[cx, cy], O, Ib], true), fill: rampHex(pal, l2) }, g0));
  }
  el('path', { d: poly(P, true), fill: 'none', stroke: pal[0][1], 'stroke-width': R * 0.02, opacity: 0.7 }, g0);
  return g0;
}

/* ============================ S12a 铸 ============================ */
function buildS12a(L) {
  const s = addScene({ name: 'S12a', t0: 54.9, t1: 57.25, roots: [L.s12a] });
  const g0 = G(L.s12a);
  el('rect', { x: -100, y: -100, width: 2120, height: 1280, fill: '#0b0706' }, g0);
  rgrad('g-forge-amb', [[0, '#ff7a30', 0.5], [0.4, '#b0401a', 0.2], [1, '#401008', 0]]);
  const amb = el('circle', { cx: 960, cy: 540, r: 1000, fill: 'url(#g-forge-amb)' }, g0);
  rgrad('g-mold', [[0.72, '#3b332d'], [0.86, '#231d19'], [1, '#100c0a']], { gradientUnits: 'userSpaceOnUse', cx: 960, cy: 540, r: 350 });
  const mold = G(g0);
  el('path', { d: circlePath(960, 540, 352) + circlePath(960, 540, 262), fill: 'url(#g-mold)', 'fill-rule': 'evenodd' }, mold);
  el('path', { d: circlePath(960, 540, 352) + circlePath(960, 540, 262), fill: 'url(#pat-grit)', 'fill-rule': 'evenodd', opacity: 0.6 }, mold);
  const lip = el('circle', { cx: 960, cy: 540, r: 265, fill: 'none', stroke: '#ffae60', 'stroke-width': 7, opacity: 0.8 }, mold);
  el('circle', { cx: 960, cy: 540, r: 352, fill: 'none', stroke: '#6a5a4c', 'stroke-width': 3, opacity: 0.6 }, mold);
  const mg = rgrad('g-molten', [[0, '#fff8d8'], [0.45, '#ffc050'], [0.85, '#e0601c'], [1, '#9a2a0c']], { cx: 0.42, cy: 0.4, r: 0.7 });
  const ms = mg.querySelectorAll('stop');
  const disc = el('circle', { cx: 960, cy: 540, r: 1100, fill: 'url(#g-molten)' }, g0);
  const cp = uid('cp');
  const clipC = el('circle', { cx: 960, cy: 540, r: 1100 }, el('clipPath', { id: cp }, DEFS));
  const flow = G(g0, { 'clip-path': `url(#${cp})` });
  const flowG = G(flow);
  const streaks = [[0, 0.62, 340, 90], [2.1, 0.4, 280, 70], [4.2, 0.78, 380, 80], [1.2, 0.25, 220, 60]].map(([ph, rr, rx, ry]) => ({ ph, rr, e: softEllipse(flowG, 0, 0, rx, ry, 0.6, '#fff6c8') }));
  const relief = G(g0, { opacity: 0 });
  starRelief(relief, 960, 540, 150, [[0, '#4a2412'], [0.5, '#a0582e'], [1, '#f0b07a']]);
  el('circle', { cx: 960, cy: 540, r: 236, fill: 'none', stroke: '#e8a070', 'stroke-width': 6, opacity: 0.55 }, relief);
  el('circle', { cx: 960, cy: 540, r: 226, fill: 'none', stroke: '#4a2412', 'stroke-width': 3, opacity: 0.6 }, relief);
  const surf = el('circle', { cx: 960, cy: 540, r: 260, fill: 'url(#pat-grit)', opacity: 0, 'data-live': 1 }, g0);
  const hot = [['#fff8d8', '#ffc050', '#e0601c', '#9a2a0c'], ['#e8a672', '#b8683a', '#8a4622', '#4e2410']];
  s.update = t => {
    vis(L.s12a, E.sine(prog(t, 54.95, 55.3)));
    const r = lerp(1100, 260, E.out3(prog(t, 55.18, 55.9)));
    disc.setAttribute('r', r1(r));
    clipC.setAttribute('r', r1(r));
    const k = E.sine(prog(t, 55.65, 56.75));
    ms.forEach((st, i) => st.setAttribute('stop-color', mixHex(hot[0][i], hot[1][i], k)));
    streaks.forEach((sk, i) => {
      const a = sk.ph + t * (0.7 + i * 0.2);
      sk.e.setAttribute('transform', `translate(${r1(960 + Math.cos(a) * r * sk.rr * 0.6)},${r1(540 + Math.sin(a) * r * sk.rr * 0.5)}) rotate(${r1(a / DEG + 90)}) scale(${(r / 700).toFixed(3)})`);
    });
    vis(flowG, (1 - k) * 0.9);
    relief.setAttribute('opacity', E.sine(prog(t, 56.0, 56.65)).toFixed(3));
    surf.setAttribute('opacity', (0.35 * k).toFixed(3));
    lip.setAttribute('opacity', (0.85 * (1 - k)).toFixed(3));
    amb.setAttribute('opacity', (1 - 0.7 * k).toFixed(3));
    vis(mold, E.sine(prog(t, 55.25, 55.7)));
  };
  const sparks = seeds(220, 171, (R, i) => ({ at: i < 60 ? 54.95 + R() * 0.3 : 55.3 + R() * 0.35, a: R() * 6.283, v: 280 + R() * 760, life: 0.5 + R() * 0.8, r: 1 + R() * 2.2 }));
  const steam = seeds(34, 173, R => ({ at: 56.0 + R() * 0.9, x: 960 + (R() - 0.5) * 380, r: 50 + R() * 90, v: 60 + R() * 90, dx: (R() - 0.5) * 60 }));
  s.fx = (ctx, t) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    for (const sp of sparks) {
      const dt = t - sp.at;
      if (dt < 0 || dt > sp.life) continue;
      const k = dt / sp.life, r0 = 250;
      const x = 960 + Math.cos(sp.a) * (r0 + sp.v * dt), y = 540 + Math.sin(sp.a) * (r0 * 0.9 + sp.v * dt) + 700 * dt * dt;
      ctx.strokeStyle = `rgba(255,${(200 - 80 * k) | 0},90,${(1 - k).toFixed(3)})`;
      ctx.lineWidth = sp.r;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(sp.a) * sp.v * 0.03, y - (Math.sin(sp.a) * sp.v + 1400 * dt) * 0.03); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    for (const st of steam) {
      const dt = t - st.at;
      if (dt < 0 || dt > 1.4) continue;
      const k = dt / 1.4, x = st.x + st.dx * dt, y = 520 - st.v * dt, r = st.r * (0.6 + k);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(235,225,215,${(0.16 * Math.sin(Math.PI * k)).toFixed(3)})`);
      g.addColorStop(1, 'rgba(235,225,215,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  };
  return s;
}

/* ============================ S12b 窗台上的铜元 ============================ */
const S12 = { coin: [1195, 744], coinR: 30 };
function buildS12b(L) {
  const s = addScene({ name: 'S12b', t0: 56.7, t1: T.END + 1, roots: [L.s12b] });
  const w = G(L.s12b);
  // 天与崖
  lgrad('g-t-sky', [[0, '#f8e2b8'], [1, '#eab47a']]);
  el('rect', { x: -800, y: -900, width: 3600, height: 1000, fill: 'url(#g-t-sky)' }, w);
  lgrad('g-t-cliff', [[0, '#5a4030'], [0.3, '#8e6a48'], [0.7, '#c49a68'], [1, '#e6c08c']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  const cliffD = 'M-800,-150C-300,-180 300,-142 800,-168C1300,-190 1700,-156 2800,-180L2800,1400L-800,1400Z';
  el('path', { d: cliffD, fill: 'url(#g-t-cliff)' }, w);
  el('path', { d: cliffD, fill: 'url(#pat-grit-l)', opacity: 0.55 }, w);
  el('path', { d: cliffD, fill: 'url(#pat-grit)', opacity: 0.35 }, w);
  const er = G(w, { stroke: '#6e5236', 'stroke-width': 2, opacity: 0.2 });
  const ER = rng(81);
  for (let i = 0; i < 70; i++) { const x = -600 + ER() * 3200; if (x > 520 && x < 1640) continue; el('path', { d: `M${r1(x)},${r1(-150 + ER() * 60)}l${r1((ER() - 0.5) * 8)},${r1(120 + ER() * 420)}` }, er); }
  const tufts = G(w, { stroke: '#6a5028', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' });
  for (let i = 0; i < 40; i++) { const x = -600 + ER() * 3200, y = -160 + Math.sin(x * 0.003) * 12; let d = ''; for (let k = 0; k < 5; k++) d += `M${r1(x + k * 4)},${r1(y)}q${r1((ER() - 0.5) * 12)},-${r1(10 + ER() * 12)} ${r1((ER() - 0.3) * 20)},-${r1(20 + ER() * 20)}`; el('path', { d }, tufts); }
  // 窑脸：砖券
  const cx = 1080, sy = 520, R = 520;
  el('path', { d: `M${cx - R - 50},1010L${cx - R - 50},${sy}A${R + 50},${R + 50} 0 0 1 ${cx + R + 50},${sy}L${cx + R + 50},1010Z`, fill: '#000', opacity: 0.12, transform: 'translate(-22,12)' }, w);
  lgrad('g-t-brick', [[0, '#7a5234'], [0.5, '#a8784c'], [1, '#c89660']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  el('path', { d: `M${cx - R - 48},1010L${cx - R - 48},${sy}A${R + 48},${R + 48} 0 0 1 ${cx + R + 48},${sy}L${cx + R + 48},1010Z`, fill: 'url(#g-t-brick)' }, w);
  let bj = '';
  for (let a = 180; a <= 360; a += 6) { const ar = a * DEG; bj += `M${r1(cx + Math.cos(ar) * R)},${r1(sy + Math.sin(ar) * R)}L${r1(cx + Math.cos(ar) * (R + 48))},${r1(sy + Math.sin(ar) * (R + 48))}`; }
  for (let y = sy + 40; y < 1010; y += 40) bj += `M${cx - R - 48},${y}h48M${cx + R},${y}h48`;
  el('path', { d: bj, stroke: '#7a5638', 'stroke-width': 2.2, opacity: 0.55 }, w);
  el('path', { d: `M${cx - R - 48},1010L${cx - R - 48},${sy}A${R + 48},${R + 48} 0 0 1 ${cx + R + 48},${sy}L${cx + R + 48},1010Z`, fill: 'url(#pat-grit)', opacity: 0.35 }, w);
  // 木作窗户（上部扇窗）
  lgrad('g-t-paper', [[0, '#e8d2a6'], [0.6, '#f6e6c2'], [1, '#fff3d8']], { x1: 0, y1: 0, x2: 1, y2: 0.2 });
  const win = buildArchWindow(w, { cx, sy, R: R - 6, sill: sy, paper: 'url(#g-t-paper)', paperTex: 0.6, bar: '#4a301c', barW: 7, frame: '#3e2816' });
  el('path', { d: `M${cx - R},${sy}A${R},${R} 0 0 1 ${cx + R},${sy}Z`, fill: 'url(#g-t-winlight)' }, w);
  lgrad('g-t-winlight', [[0, '#000', 0.12], [0.5, '#fff5d8', 0], [1, '#fff5d8', 0.18]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  // 下部：门、窗、窗台
  el('rect', { x: cx - R, y: sy, width: 2 * R, height: 490, fill: '#4e3420' }, w);
  el('rect', { x: cx - R, y: sy, width: 2 * R, height: 490, fill: 'url(#pat-wood-v)', opacity: 0.45 }, w);
  el('rect', { x: cx - R, y: sy - 8, width: 2 * R, height: 26, fill: '#4a311c' }, w);
  // 门
  const door = G(w);
  el('rect', { x: 600, y: 560, width: 262, height: 450, fill: '#3e2a1a' }, door);
  lgrad('g-t-door', [[0, '#6e4c30'], [0.5, '#8a6440'], [1, '#5a3d24']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  el('rect', { x: 614, y: 572, width: 116, height: 438, fill: 'url(#g-t-door)' }, door);
  el('rect', { x: 734, y: 572, width: 116, height: 438, fill: 'url(#g-t-door)' }, door);
  el('rect', { x: 614, y: 572, width: 236, height: 438, fill: 'url(#pat-wood-v)', opacity: 0.4 }, door);
  el('path', { d: 'M643,572V1010M672,572V1010M701,572V1010M763,572V1010M792,572V1010M821,572V1010', stroke: '#3a2616', 'stroke-width': 2, opacity: 0.6 }, door);
  el('path', { d: 'M614,640H850M614,930H850', stroke: '#3a2616', 'stroke-width': 7, opacity: 0.7 }, door);
  el('circle', { cx: 722, cy: 780, r: 7, fill: '#2a1c10' }, door);
  el('circle', { cx: 742, cy: 780, r: 7, fill: '#2a1c10' }, door);
  // 下窗 + 窗花
  const lw = { x: 890, y: 548, w: 670, h: 222 };
  el('rect', { x: lw.x, y: lw.y, width: lw.w, height: lw.h, fill: '#f2e5c8' }, w);
  el('rect', { x: lw.x, y: lw.y, width: lw.w, height: lw.h, fill: 'url(#pat-paper)', opacity: 0.6 }, w);
  el('path', { d: papercutPath(1225, 659, 80), fill: '#c0271c', 'fill-rule': 'evenodd' }, w);
  let grid = '';
  for (let x = lw.x + 42; x < lw.x + lw.w; x += 42) grid += `M${x},${lw.y}V${lw.y + lw.h}`;
  for (let y = lw.y + 44; y < lw.y + lw.h; y += 44) grid += `M${lw.x},${y}H${lw.x + lw.w}`;
  el('path', { d: grid, stroke: '#5c3d24', 'stroke-width': 6 }, w);
  el('rect', { x: lw.x, y: lw.y, width: lw.w, height: lw.h, fill: 'none', stroke: '#4a311c', 'stroke-width': 14 }, w);
  // 窗台
  el('rect', { x: 876, y: 770, width: 700, height: 28, fill: '#7a5638' }, w);
  el('rect', { x: 876, y: 770, width: 700, height: 28, fill: 'url(#pat-wood)', opacity: 0.5 }, w);
  el('rect', { x: 876, y: 768, width: 700, height: 5, fill: '#e9c08a' }, w);
  lgrad('g-t-sillsh', [[0, '#000', 0.45], [1, '#000', 0]]);
  el('rect', { x: 876, y: 798, width: 700, height: 22, fill: 'url(#g-t-sillsh)' }, w);
  el('rect', { x: 890, y: 812, width: 670, height: 198, fill: '#b99468' }, w);
  el('rect', { x: 890, y: 812, width: 670, height: 198, fill: 'url(#pat-grit)', opacity: 0.4 }, w);
  lgrad('g-t-archsh', [[0, '#1a0e06', 0.55], [0.5, '#1a0e06', 0.15], [1, '#1a0e06', 0]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  el('path', { d: `M${cx - R},1010L${cx - R},${sy}A${R},${R} 0 0 1 ${cx + R},${sy}L${cx + R - 60},${sy}A${R - 60},${R - 60} 0 0 0 ${cx - R + 60},${sy}L${cx - R + 60},1010Z`, fill: 'url(#g-t-archsh)' }, w);
  // 碗（洗净还回）与铜元
  buildBowl(w, { x: 1112, y: 725, s: 0.3, clean: true });
  const coin = G(w, { transform: `translate(${S12.coin[0]},${S12.coin[1]}) rotate(-6)` });
  softEllipse(coin, -12, 30, 32, 8, 0.45);
  rgrad('g-coin', [[0, '#e8a672'], [0.6, '#b8683a'], [0.9, '#8a4622'], [1, '#4e2410']], { cx: 0.62, cy: 0.35, r: 0.8 });
  el('circle', { r: S12.coinR, fill: 'url(#g-coin)' }, coin);
  starRelief(coin, 0, 0, 17.3, [[0, '#4a2412'], [0.5, '#a0582e'], [1, '#f6c08c']]);
  el('circle', { r: 27.2, fill: 'none', stroke: '#f0b07a', 'stroke-width': 0.9, opacity: 0.6 }, coin);
  el('circle', { r: 26.1, fill: 'none', stroke: '#4a2412', 'stroke-width': 0.5, opacity: 0.6 }, coin);
  el('circle', { r: S12.coinR, fill: 'url(#pat-grit)', opacity: 0.25, transform: 'scale(0.06)' }, coin);
  const coinGlint = el('circle', { r: S12.coinR, fill: 'url(#g-coin-glint)', opacity: 0 }, coin);
  rgrad('g-coin-glint', [[0, '#fff6dc', 0.9], [0.3, '#ffe0a8', 0.3], [1, '#ffe0a8', 0]], { cx: 0.7, cy: 0.3, r: 0.5 });
  // 水缸 + 扁担 + 水桶
  const vat = G(w);
  softEllipse(vat, 330, 1012, 220, 34, 0.4);
  lgrad('g-t-vat', [[0, '#1e130b'], [0.45, '#3e2717'], [0.78, '#7a5030'], [0.9, '#a57448'], [1, '#4a2e1a']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  el('path', { d: 'M296,1008C262,930 256,850 286,792C298,772 322,764 352,762L452,762C482,764 506,772 518,792C548,850 542,930 508,1008Z', fill: 'url(#g-t-vat)' }, vat);
  el('path', { d: 'M296,1008C262,930 256,850 286,792C298,772 322,764 352,762L452,762C482,764 506,772 518,792C548,850 542,930 508,1008Z', fill: 'url(#pat-grit)', opacity: 0.3 }, vat);
  el('ellipse', { cx: 402, cy: 762, rx: 58, ry: 12, fill: '#1c120a' }, vat);
  el('ellipse', { cx: 402, cy: 764, rx: 50, ry: 8.5, fill: '#6f8a92', opacity: 0.8 }, vat);
  softStroke(vat, 'M480,800C500,850 502,920 488,980', '#ffe0b0', 6, 0.4);
  softStroke(w, 'M150,1030L520,528', '#000', 22, 0.22, { transform: 'translate(-30,6)' });
  lgrad('g-t-pole', [[0, '#5a3d22'], [0.5, '#9a6e44'], [1, '#6a4a2c']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  el('path', { d: 'M138,1034L150,1030L528,528L516,524Z', fill: 'url(#g-t-pole)' }, w);
  el('path', { d: 'M137,1035L515,525', stroke: '#2a1c10', 'stroke-width': 2, opacity: 0.5 }, w);
  el('path', { d: 'M510,540C498,560 500,590 512,606M168,1000C156,980 160,960 172,948', fill: 'none', stroke: '#6b5434', 'stroke-width': 4 }, w);
  const bucket = G(w, { transform: 'translate(118,1008)' });
  lgrad('g-t-bkt', [[0, '#4a3220'], [0.6, '#8a6440'], [1, '#5a3d24']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  el('path', { d: 'M-62,0L-70,-130L70,-130L62,0Z', fill: 'url(#g-t-bkt)' }, bucket);
  el('path', { d: 'M-66,-40H66M-68,-100H68', stroke: '#2c2c2c', 'stroke-width': 6 }, bucket);
  el('ellipse', { cx: 0, cy: -130, rx: 70, ry: 12, fill: '#2a1c10' }, bucket);
  el('path', { d: 'M-68,-130Q0,-210 68,-130', fill: 'none', stroke: '#5a3d22', 'stroke-width': 5 }, bucket);
  // 捆好的铺草、扫帚
  const straw = G(w, { transform: 'translate(1760,1012) rotate(4)' });
  lgrad('g-t-straw', [[0, '#9a7a3c'], [0.5, '#e0bd72'], [1, '#b08c48']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  el('path', { d: 'M-50,0L-38,-230C-20,-252 20,-252 38,-230L50,0Z', fill: 'url(#g-t-straw)' }, straw);
  let sl = '';
  for (let i = 0; i < 18; i++) { const x = -44 + i * 5.2; sl += `M${r1(x)},0L${r1(x * 0.78)},-238`; }
  el('path', { d: sl, stroke: '#8a6a30', 'stroke-width': 1.2, opacity: 0.55 }, straw);
  el('path', { d: 'M-46,-60Q0,-50 46,-60M-40,-170Q0,-160 40,-170', fill: 'none', stroke: '#6a4a22', 'stroke-width': 6 }, straw);
  softEllipse(straw, -30, 4, 84, 16, 0.3);
  const broom = G(w, { transform: 'translate(1880,1012) rotate(-12)' });
  el('path', { d: 'M0,-120L6,-420', stroke: '#6a4a2a', 'stroke-width': 9, 'stroke-linecap': 'round' }, broom);
  let bd = '';
  for (let i = 0; i < 16; i++) bd += `M${r1(-4 + i * 0.5)},-120L${r1(-60 + i * 8)},0`;
  el('path', { d: bd, stroke: '#a88448', 'stroke-width': 3 }, broom);
  el('path', { d: 'M-12,-126H14', stroke: '#5a3a1a', 'stroke-width': 7 }, broom);
  // 院子（扫过的地面）
  lgrad('g-t-yard', [[0, '#b08a5c'], [1, '#8a6a44']]);
  el('rect', { x: -800, y: 1008, width: 3600, height: 600, fill: 'url(#g-t-yard)' }, w);
  el('rect', { x: -800, y: 1008, width: 3600, height: 600, fill: 'url(#pat-grit)', opacity: 0.35 }, w);
  const sw = G(w, { stroke: '#e0c496', 'stroke-width': 1.6, fill: 'none', opacity: 0.35 });
  for (let i = 0; i < 26; i++) { const x = -200 + i * 90, y = 1030 + (i % 3) * 14; el('path', { d: `M${x},${y}q40,-8 80,0` }, sw); }
  el('rect', { x: -800, y: 1006, width: 3600, height: 5, fill: '#5a3d24', opacity: 0.5 }, w);
  // 朝阳光束
  const rays = G(w, { style: 'mix-blend-mode:screen' });
  lgrad('g-ray', [[0, '#fff0c8', 0.0], [0.3, '#fff0c8', 0.32], [1, '#fff0c8', 0]], { x1: 1, y1: 0, x2: 0, y2: 1 });
  [[2200, -300, 1500, 1200, 260], [2300, -200, 900, 1300, 180], [2400, -100, 300, 1250, 140]].forEach(([x1, y1, x2, y2, wd]) => {
    el('path', { d: `M${x1},${y1}L${x1 + wd},${y1 + wd * 0.3}L${x2 + wd * 1.6},${y2}L${x2 - wd * 0.4},${y2}Z`, fill: 'url(#g-ray)', opacity: 0.75 }, rays);
  });
  lgrad('g-t-warm', [[0, '#1a0c04', 0.35], [0.4, '#000', 0], [1, '#ffcf8a', 0.22]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  el('rect', { x: -800, y: -900, width: 3600, height: 2500, fill: 'url(#g-t-warm)' }, w);
  rgrad('g-t-sun', [[0, '#fff2cc', 0.85], [0.25, '#ffd08a', 0.35], [1, '#ffb060', 0]]);
  el('circle', { cx: 2150, cy: -180, r: 900, fill: 'url(#g-t-sun)', style: 'mix-blend-mode:screen' }, w);

  const s0 = 260 / S12.coinR;
  const camK = [[56.7, [S12.coin[0], S12.coin[1], s0, 0]], [57.35, [S12.coin[0] - 6, S12.coin[1] - 2, s0 * 0.86, 0]], [60.4, [1010, 482, 0.945, 0]]];
  const camAt = t => { const c = camSpl(t, camK); const d = drift(t, prog(t, 57.4, 58.5), 61); return cam(c[0] + d[0] / c[2], c[1] + d[1] / c[2], c[2], c[3] + d[2]); };
  S12.camAt = camAt;
  s.update = t => {
    w.setAttribute('transform', M.str(camAt(t)));
    vis(L.s12b, E.sine(prog(t, 56.75, 57.2)));
    const gk = prog(t, 57.15, 57.75);
    coinGlint.setAttribute('opacity', (Math.sin(Math.PI * gk) * 0.9).toFixed(3));
    rays.setAttribute('opacity', (0.5 + 0.5 * E.sine(prog(t, 57.5, 59.5)) + 0.08 * Math.sin(t * 1.3)).toFixed(3));
  };
  s.fx = (ctx, t) => {
    const m = camAt(t);
    ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
    const a = prog(t, 57.3, 58.3);
    for (let i = 0; i < 110; i++) {
      const x = 300 + hash1(i * 3) * 1700 + Math.sin(t * 0.4 + i) * 26, y = 100 + hash1(i * 7) * 900 + Math.cos(t * 0.33 + i * 2) * 20 - (t - 57) * 6;
      const lit = clamp(1 - Math.abs((x - 1900) * 0.55 + (y - 200) * 0.9 - 400) / 900);
      ctx.fillStyle = `rgba(255,236,190,${(a * lit * 0.7 * hash1(i * 5 + 1)).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(x, y, 0.8 + hash1(i) * 1.8, 0, 6.283); ctx.fill();
    }
  };
  s.slots = [];
  return s;
}
function buildS12(L) { buildS12a(L); buildS12b(L); }
