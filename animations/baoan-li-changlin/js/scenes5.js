'use strict';
/* =============================================================
 * scenes5.js —— 53 ~ 60.505 秒
 * S11b 黎明山梁：火苗退去，曙色铺开
 * S12b 粮袋与还回来的碗静置窑洞窗台；水缸挑满、扁担靠墙、
 *      铺草捆好、院子扫净，朝阳照进窗花（他严守群众纪律的准则）
 * ============================================================= */

function buildS11b(L) {
  const s = addScene({ name: 'S11b', t0: 53.05, t1: 55.65, roots: [L.s11b] });
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
  const heat = el('circle', { cx: 975, cy: 470, r: 80, fill: 'url(#g-glow-gold)', opacity: 0 }, world);
  const camK = [[53.15, [960, 610, 1.0, 0]], [54.5, [966, 560, 1.12, 0.004]], [55.35, [966, 560, 1.12, 0.004]]];
  const camAt = t => { const c = camSpl(t, camK); return cam(c[0], c[1], c[2], c[3]); };
  s.update = t => {
    world.setAttribute('transform', M.str(camAt(t)));
    vis(L.s11b, E.sine(prog(t, 53.05, 53.7)));
    sun.setAttribute('opacity', (0.75 + 0.25 * E.sine(prog(t, 53.2, 55))).toFixed(3));
    const gp = prog(t, 53.4, 54.3);
    groundGlow.setAttribute('opacity', (Math.sin(Math.PI * gp) * 0.9).toFixed(3));
    heat.setAttribute('opacity','0');
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

/* ============================ S12b 窗台上的粮袋与还回的碗 ============================ */
function buildS12b(L) {
  const s = addScene({ name: 'S12b', t0: 54.8, t1: T.END + 1, roots: [L.s12b] });
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
  el('rect', { x: 876, y: 770, width: 700, height: 28, fill: 'url(#pat-wood)', opacity: 0.22 }, w);
  el('path',{d:'M885,777C1030,772 1210,781 1567,775M889,785C1040,780 1090,791 1245,784S1470,788 1564,782M887,793C1060,787 1270,795 1568,791',fill:'none',stroke:'#382311','stroke-width':1,opacity:0.35},w);
  el('path',{d:'M920,780C1045,778 1120,783 1180,781M1330,791L1530,790',fill:'none',stroke:'#d2a46b','stroke-width':0.75,opacity:0.4},w);
  el('rect', { x: 876, y: 768, width: 700, height: 5, fill: '#e9c08a' }, w);
  lgrad('g-t-sillsh', [[0, '#000', 0.45], [1, '#000', 0]]);
  el('rect', { x: 876, y: 798, width: 700, height: 22, fill: 'url(#g-t-sillsh)' }, w);
  el('rect', { x: 890, y: 812, width: 670, height: 198, fill: '#b99468' }, w);
  el('rect', { x: 890, y: 812, width: 670, height: 198, fill: 'url(#pat-grit)', opacity: 0.4 }, w);
  lgrad('g-t-archsh', [[0, '#1a0e06', 0.55], [0.5, '#1a0e06', 0.15], [1, '#1a0e06', 0]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  el('path', { d: `M${cx - R},1010L${cx - R},${sy}A${R},${R} 0 0 1 ${cx + R},${sy}L${cx + R - 60},${sy}A${R - 60},${R - 60} 0 0 0 ${cx - R + 60},${sy}L${cx - R + 60},1010Z`, fill: 'url(#g-t-archsh)' }, w);
  // 碗（洗净还回）与粮袋
  buildBowl(w, { x: 1112, y: 725, s: 0.3, clean: true });
  const ration=G(w,{transform:'translate(1355,768)'});
  softEllipse(ration,0,4,78,12,.4);
  el('path',{d:'M-64,0C-82,-28 -72,-80 -20,-115L20,-115C72,-80 82,-28 64,0Z',fill:'#8b806c',stroke:'#4d4335','stroke-width':3},ration);
  el('path',{d:'M-20,-115L-32,-132 -7,-125 3,-138 28,-128 20,-115',fill:'#a99c82',stroke:'#4d4335','stroke-width':2},ration);
  el('path',{d:'M-25,-112Q0,-105 25,-112M-13,-106Q-30,-78 -40,-42M12,-106Q30,-78 40,-42',fill:'none',stroke:'#5b4d39','stroke-width':3},ration);
  el('path',{d:'M-64,0C-82,-28 -72,-80 -20,-115L20,-115C72,-80 82,-28 64,0Z',fill:'url(#pat-grit)',opacity:.35},ration);
  // 水缸 + 扁担 + 水桶
  const vat = G(w);
  softEllipse(vat, 330, 1012, 220, 34, 0.4);
  lgrad('g-t-vat', [[0, '#1e130b'], [0.45, '#3e2717'], [0.78, '#7a5030'], [0.9, '#a57448'], [1, '#4a2e1a']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  el('path', { d: 'M296,1008C262,930 256,850 286,792C298,772 322,764 352,762L452,762C482,764 506,772 518,792C548,850 542,930 508,1008Z', fill: 'url(#g-t-vat)' }, vat);
  const vatClip=uid('vat-glaze');
  el('path',{d:'M296,1008C262,930 256,850 286,792C298,772 322,764 352,762L452,762C482,764 506,772 518,792C548,850 542,930 508,1008Z'},el('clipPath',{id:vatClip},DEFS));
  const glaze=G(vat,{'clip-path':`url(#${vatClip})`});
  el('path',{d:'M460,771C492,805 522,891 496,988L482,1008L461,1008C494,914 494,835 440,770Z',fill:'#e4b47b',opacity:0.1},glaze);
  el('path',{d:'M307,789C288,833 286,934 309,1008L326,1008C303,917 309,833 328,779Z',fill:'#110d08',opacity:0.24},glaze);
  [808,829,858,895,935,971].forEach((y,i)=>el('path',{d:`M270,${y}Q402,${y+20+(i%2)*3} 533,${y}`,fill:'none',stroke:i%2?'#be9160':'#2b1a0e','stroke-width':i%2?0.9:1.3,opacity:i%2?0.12:0.26},glaze));
  el('path',{d:'M486,814C499,859 499,920 489,958M493,833C500,863 501,885 498,905',fill:'none',stroke:'#f4cc92','stroke-width':2,'stroke-linecap':'round',opacity:0.34},glaze);
  el('ellipse', { cx: 402, cy: 762, rx: 58, ry: 12, fill: '#1c120a' }, vat);
  lgrad('g-t-water',[[0,'#293b3c'],[0.5,'#698186'],[0.72,'#9bafa6'],[1,'#425955']]);
  el('ellipse', { cx: 402, cy: 764, rx: 50, ry: 8.5, fill: 'url(#g-t-water)', opacity: 0.94 }, vat);
  el('path',{d:'M354,764C365,773 438,774 450,764',fill:'none',stroke:'#c7d1b5','stroke-width':0.9,opacity:0.66},vat);
  el('path',{d:'M369,762C385,758 416,758 432,761M393,766Q414,769 431,765',fill:'none',stroke:'#eadfc1','stroke-width':0.7,opacity:0.48},vat);
  el('path',{d:'M347,761C356,747 449,747 458,761',fill:'none',stroke:'#b2814f','stroke-width':1.5,opacity:0.6},vat);
  softStroke(vat, 'M480,800C500,850 502,920 488,980', '#ffe0b0', 6, 0.4);
  softStroke(w, 'M150,1030L520,528', '#000', 22, 0.22, { transform: 'translate(-30,6)' });
  lgrad('g-t-pole', [[0, '#5a3d22'], [0.5, '#9a6e44'], [1, '#6a4a2c']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  el('path', { d: 'M138,1034L150,1030L528,528L516,524Z', fill: 'url(#g-t-pole)' }, w);
  el('path', { d: 'M137,1035L515,525', stroke: '#2a1c10', 'stroke-width': 2, opacity: 0.5 }, w);
  el('path',{d:'M148,1027C232,910 287,838 334,773S449,620 518,531M153,1020L271,861M299,824L376,721M402,686L512,540',fill:'none',stroke:'#d6ae76','stroke-width':0.75,opacity:0.62},w);
  el('path',{d:'M257,880L319,797M365,735L432,645',fill:'none',stroke:'#49301b','stroke-width':1.1,opacity:0.55},w);
  el('path', { d: 'M510,540C498,560 500,590 512,606M168,1000C156,980 160,960 172,948', fill: 'none', stroke: '#6b5434', 'stroke-width': 4 }, w);
  const bucket = G(w, { transform: 'translate(118,1008)' });
  lgrad('g-t-bkt', [[0, '#4a3220'], [0.6, '#8a6440'], [1, '#5a3d24']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  el('path', { d: 'M-62,0L-70,-130L70,-130L62,0Z', fill: 'url(#g-t-bkt)' }, bucket);
  const bucketClip=uid('bucket-staves');
  el('path',{d:'M-62,0L-70,-130L70,-130L62,0Z'},el('clipPath',{id:bucketClip},DEFS));
  const staves=G(bucket,{'clip-path':`url(#${bucketClip})`});
  [-47,-22,3,28,51].forEach((x,i)=>{
    el('path',{d:`M${x},-130L${x*0.9},0`,stroke:'#352215','stroke-width':1.5,opacity:0.75},staves);
    el('path',{d:`M${x+5},-127C${x+1},-91 ${x+9},-47 ${x*0.9+5},-4M${x+12},-112Q${x+9},-67 ${x+13},-17`,fill:'none',stroke:i%2?'#b48b55':'#4c301b','stroke-width':0.8,opacity:0.58},staves);
  });
  el('path', { d: 'M-66,-40H66M-68,-100H68', stroke: '#2c2c2c', 'stroke-width': 6 }, bucket);
  el('path',{d:'M-61,-42H59M-64,-102H61',stroke:'#8d8b79','stroke-width':0.8,opacity:0.55},bucket);
  el('ellipse', { cx: 0, cy: -130, rx: 70, ry: 12, fill: '#2a1c10' }, bucket);
  el('path', { d: 'M-68,-130Q0,-210 68,-130', fill: 'none', stroke: '#5a3d22', 'stroke-width': 5 }, bucket);
  // 捆好的铺草、扫帚
  const straw = G(w, { transform: 'translate(1760,1012) rotate(4)' });
  lgrad('g-t-straw', [[0, '#9a7a3c'], [0.5, '#e0bd72'], [1, '#b08c48']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  el('path', { d: 'M-50,0L-38,-230C-20,-252 20,-252 38,-230L50,0Z', fill: 'url(#g-t-straw)' }, straw);
  let sl = '';
  for (let i = 0; i < 18; i++) { const x = -44 + i * 5.2; sl += `M${r1(x)},0L${r1(x * 0.78)},-238`; }
  el('path', { d: sl, stroke: '#8a6a30', 'stroke-width': 1.2, opacity: 0.55 }, straw);
  const strawClip=uid('straw-fibres');
  el('path',{d:'M-50,0L-38,-230C-20,-252 20,-252 38,-230L50,0Z'},el('clipPath',{id:strawClip},DEFS));
  const fibres=G(straw,{'clip-path':`url(#${strawClip})`});
  for(let i=0;i<22;i++){
    const x=-46+i*4.35,top=-229-(i%4)*4;
    el('path',{d:`M${r1(x+1.3)},-4Q${r1(x*0.94)},-125 ${r1(x*0.76)},${top}`,fill:'none',stroke:i%3?'#ecd29a':'#6d5529','stroke-width':i%3?0.6:0.8,opacity:i%3?0.6:0.38},fibres);
    const y=-24-(i%6)*32;el('path',{d:`M${r1(x*0.9)},${y}l2,0.7`,stroke:'#6e5328','stroke-width':0.8,opacity:0.45},fibres);
  }
  el('path', { d: 'M-46,-60Q0,-50 46,-60M-40,-170Q0,-160 40,-170', fill: 'none', stroke: '#6a4a22', 'stroke-width': 6 }, straw);
  softEllipse(straw, -30, 4, 84, 16, 0.3);
  const broom = G(w, { transform: 'translate(1880,1012) rotate(-12)' });
  el('path', { d: 'M0,-120L6,-420', stroke: '#6a4a2a', 'stroke-width': 9, 'stroke-linecap': 'round' }, broom);
  let bd = '';
  for (let i = 0; i < 16; i++) bd += `M${r1(-4 + i * 0.5)},-120L${r1(-60 + i * 8)},0`;
  el('path', { d: bd, stroke: '#a88448', 'stroke-width': 3 }, broom);
  let fineBroom='';
  for(let i=0;i<16;i++)fineBroom+=`M${r1(-3.7+i*0.5)},-117Q${r1(-22+i*2.9)},-54 ${r1(-59+i*8)},-2`;
  el('path',{d:fineBroom,fill:'none',stroke:'#e1c083','stroke-width':0.7,opacity:0.67},broom);
  el('path',{d:'M1,-151L5,-412',stroke:'#bc9560','stroke-width':0.8,opacity:0.6},broom);
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

  const camK = [[54.8,[1250,718,2.1,0]],[56.0,[1250,718,2.1,0]],[60.4,[1010,550,.945,0]]];
  const camAt=t=>{const c=camSpl(t,camK);return cam(c[0],c[1],c[2],c[3]);};
  s.update = t => {
    w.setAttribute('transform', M.str(camAt(t)));
    vis(L.s12b, E.sine(prog(t, 54.8, 55.65)));
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
function buildS12(L) { buildS12b(L); }
