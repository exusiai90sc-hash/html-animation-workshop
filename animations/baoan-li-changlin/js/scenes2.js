'use strict';
/* =============================================================
 * scenes2.js —— 约 10 ~ 24.7 秒
 * S3  碗的裂缝 → 龟裂土地 → 一行草鞋脚印（磨难）→ 汇入大队脚印（参军）
 * 红布掠过镜头 → S3b 八角帽红星 → 红星缩进斯诺相机镜头的倒影
 * S4  相机、笔记本、钢笔写下提问 → 墨滴落下晕开，墨色里浮出旧日
 * ============================================================= */

/* ============================ S3 ============================ */
const S3 = {};
S3.crackC = [600, 2470];
S3.crackLen = 180;
S3.pathPts = [[600, 2380], [760, 2170], [900, 1960], [1080, 1770], [1320, 1600], [1590, 1460], [1870, 1310], [2130, 1140], [2380, 970], [2630, 830], [2890, 710], [3170, 620], [3480, 550]];
S3.track = makeTrack(S3.pathPts);
S3.stepT = [10.75, 12.55];
S3.loneU = [0.035, 0.5];
{
  const P = u => S3.track.at(u).slice(0, 2);
  const zs = 850 / S3.crackLen;
  S3.camKeys = [
    [9.95, [S3.crackC[0], S3.crackC[1], zs, 0]],
    [10.35, [S3.crackC[0], S3.crackC[1], zs, 0], 'stop'],
    [11.15, [P(0.11)[0] + 40, P(0.11)[1] - 50, 1.12, 0]],
    [12.4, [P(0.44)[0] + 30, P(0.44)[1] - 30, 1.06, -0.02]],
    [13.5, [P(0.6)[0], P(0.6)[1], 0.74, -0.035]],
  ];
}
// 交叠期沿用碗的镜头；此映射把土地裂缝原坐标还原到碗的世界坐标。
// 只接续镜头，不改八个裂缝节点或10.3秒之后的土地镜头。
S3.crackToBowl = M.chain(M.t(S2.crackMid[0], S2.crackMid[1]), M.r(-S2.crackRot),
  M.s(S2.crackLen / S3.crackLen), M.t(-S3.crackC[0], -S3.crackC[1]));
S3.camAt = t => {
  if (t < 10.3) return M.mul(S2.camAt(t), S3.crackToBowl);
  const c = camSpl(t, S3.camKeys);
  const d = drift(t, prog(t, 10.4, 11.2), 13);
  return cam(c[0] + d[0] / c[2], c[1] + d[1] / c[2], c[2], c[3] + d[2]);
};

function splitConvex(poly, px, py, ang) {
  const dx = Math.cos(ang), dy = Math.sin(ang);
  const side = p => (p[0] - px) * dy - (p[1] - py) * dx;
  const A = [], B = [], cut = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    const sp = side(p), sq = side(q);
    (sp >= 0 ? A : B).push(p);
    if ((sp >= 0) !== (sq >= 0)) {
      const k = sp / (sp - sq), x = [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
      A.push(x); B.push(x); cut.push(x);
    }
  }
  return [A, B, cut];
}
function crackle(poly, depth, R, out, level = 0, plates = null) {
  if (depth <= 0) { if(plates)plates.push(poly); return; }
  const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]);
  const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
  if (w * h < 9000) { if(plates)plates.push(poly); return; }
  const cx = xs.reduce((a, b) => a + b) / xs.length, cy = ys.reduce((a, b) => a + b) / ys.length;
  const ang = (w > h ? Math.PI / 2 : 0) + (R() - 0.5) * 0.9;
  const [A, B, cut] = splitConvex(poly, cx + (R() - 0.5) * w * 0.3, cy + (R() - 0.5) * h * 0.3, ang);
  if (cut.length === 2) out.push([cut[0], cut[1], level]);
  crackle(A, depth - 1, R, out, level + 1, plates);
  crackle(B, depth - 1, R, out, level + 1, plates);
}
function jag(p, q, R, amt = 0.05, step = 16) {
  const len = Math.hypot(q[0] - p[0], q[1] - p[1]), n = Math.max(2, Math.round(len / step));
  const nx = -(q[1] - p[1]) / len, ny = (q[0] - p[0]) / len, pts = [p];
  const sd = R() * 100, A = Math.min(len * amt, 9);
  for (let i = 1; i < n; i++) {
    const k = i / n, j = (noise1(sd + i * 0.55) * A + (R() - 0.5) * 2.5) * Math.sin(Math.PI * k);
    pts.push([lerp(p[0], q[0], k) + nx * j, lerp(p[1], q[1], k) + ny * j]);
  }
  pts.push(q);
  return pts;
}

function buildS3(L) {
  const s = addScene({ name: 'S3', t0: 9.95, t1: 13.62, roots: [L.s3] });
  const world = G(L.s3);
  const tr = S3.track;
  const a0 = tr.at(0), a1 = tr.at(1);
  lgrad('g-s3-ground', [[0, '#b18c5b'], [0.22, '#a8834f'], [0.3, '#7d5d3c'], [0.46, '#5e4a38'], [0.58, '#6e675e'], [0.78, '#80817f'], [1, '#90959c']],
    { gradientUnits: 'userSpaceOnUse', x1: a0[0], y1: a0[1], x2: a1[0], y2: a1[1] });
  el('rect', { x: -1400, y: -600, width: 6000, height: 4200, fill: 'url(#g-s3-ground)' }, world);
  el('rect', { x: -1400, y: -600, width: 6000, height: 4200, fill: 'url(#pat-grit-l)', opacity: 0.32 }, world);
  el('rect', { x: -1400, y: -600, width: 6000, height: 4200, fill: 'url(#pat-grit)', opacity: 0.18 }, world);
  // 龟裂（按距离分组淡出，免用遮罩）
  {
    const R = rng(55), segs = [], plates = [];
    crackle([[-500, 1450], [1600, 1450], [1600, 3000], [-500, 3000]], 11, R, segs, 0, plates);
    // 已有裂缝分出的土块各自形成干燥卷边，不另生成满屏随机纹理。
    const crust = G(world,{'data-material':'dried-earth-plates'});
    plates.forEach((points,i)=>{
      const cx=points.reduce((v,p)=>v+p[0],0)/points.length,cy=points.reduce((v,p)=>v+p[1],0)/points.length;
      const dist=Math.hypot(cx-650,cy-2350),fall=clamp((1220-dist)/630);
      if(!fall)return;
      const inset=points.map(p=>[lerp(cx,p[0],.95),lerp(cy,p[1],.95)]);
      el('path',{d:poly(inset,true),fill:['#d5b785','#8f683c','#c1a06c','#b19260'][i%4],opacity:fall*(.1+(i%3)*.035)},crust);
      let lip='';for(let k=0;k<inset.length;k++){const a=inset[k],b=inset[(k+1)%inset.length];if((b[0]-a[0])-(b[1]-a[1])>0)lip+=poly([a,b]);}
      el('path',{d:lip,fill:'none',stroke:'#e2c99e','stroke-width':1.6,opacity:fall*.23,'stroke-linecap':'round'},crust);
      if(i%3===0){const a=inset[0],b=inset[1],u=.32;el('path',{d:poly([[lerp(cx,a[0],.68),lerp(cy,a[1],.68)],[lerp(cx,a[0],.81),lerp(cy,a[1],.81)],[lerp(a[0],b[0],u),lerp(a[1],b[1],u)]]),stroke:'#6d4c2a','stroke-width':.9,fill:'none',opacity:fall*.23},crust);}
    });
    const bins = [[700, 0.85], [950, 0.55], [1200, 0.28]];
    const d = bins.map(() => ['', '', '']), hi = bins.map(() => ['', '', '']);
    for (const [p, q, lv] of segs) {
      const dist = Math.hypot((p[0] + q[0]) / 2 - 650, (p[1] + q[1]) / 2 - 2350);
      const b = bins.findIndex(x => dist < x[0]);
      if (b < 0) continue;
      const c = lv < 3 ? 0 : lv < 6 ? 1 : 2;
      const pts = jag(p, q, R);
      d[b][c] += poly(pts);
      hi[b][c] += poly(pts.map(v => [v[0] + 2, v[1] + 2]));
    }
    bins.forEach(([, op], b) => {
      const cg = G(world, { opacity: op });
      [6, 4, 2.4].forEach((w, i) => {
        if (!d[b][i]) return;
        el('path', { d: hi[b][i], fill: 'none', stroke: '#e2c596', 'stroke-width': w * 0.6, opacity: 0.3, 'stroke-linejoin': 'round' }, cg);
        el('path', { d: d[b][i], fill: 'none', stroke: '#765432', 'stroke-width': w*1.75, opacity: 0.22, 'stroke-linejoin': 'round' }, cg);
        el('path', { d: d[b][i], fill: 'none', stroke: '#3a2514', 'stroke-width': w*.7, opacity: 0.66, 'stroke-linejoin': 'round' }, cg);
      });
    });
  }
  // 主裂缝（与碗上裂缝同形）
  {
    const bc = [[70, 53], [76, 68], [72, 80], [81, 95], [78, 108], [88, 122], [85, 134], [95, 148]];
    const a = bc[0], b = bc[bc.length - 1], mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const sc = S3.crackLen / Math.hypot(b[0] - a[0], b[1] - a[1]), rot = S2.crackRot;
    const pts = bc.map(p => { const x = p[0] - mid[0], y = p[1] - mid[1]; return [S3.crackC[0] + (x * Math.cos(rot) - y * Math.sin(rot)) * sc, S3.crackC[1] + (x * Math.sin(rot) + y * Math.cos(rot)) * sc]; });
    const ext = pts.concat([[pts[7][0] + 8, pts[7][1] + 40], [pts[7][0] - 4, pts[7][1] + 90]]);
    const pre = [[pts[0][0] + 6, pts[0][1] - 30], [pts[0][0] + 20, pts[0][1] - 60]];
    const all = pre.reverse().concat(ext);
    el('path', { d: poly(all.map(v => [v[0] + 1.6, v[1] + 1.2])), fill: 'none', stroke: '#e6c99a', 'stroke-width': 2.2, opacity: 0.45 }, world);
    el('path', { d: poly(all), fill: 'none', stroke: '#1d1108', 'stroke-width': 5.2, 'stroke-linejoin': 'bevel' }, world);
  }
  // 路
  softStroke(world, tr.d, '#d2b187', 150, 0.34);
  softStroke(world, tr.d, '#e3c9a0', 60, 0.16);
  // 泥泞与水洼
  // 保留各泥斑原有种子、半径和落点；只收掉轮廓上的短促齿尖。
  // 周期加权邻点留住低频凹凸，所有点都在原轮廓点的凸包内；不消耗随机序列。
  const wetContour = (cx, cy, radius, seed, rough) => {
    const harm = [[3,.07],[5,.055],[7,.04],[11,.03],[17,.02],[29,.012]];
    const ph = harm.map((h,j)=>hash1(seed*31+j)*6.283), pts=[];
    for(let j=0;j<40;j++){
      const a=j/40*Math.PI*2;
      const k=1+rough*harm.reduce((v,h,q)=>v+h[1]*Math.sin(h[0]*a+ph[q]),0);
      pts.push([Math.cos(a)*radius*k,Math.sin(a)*radius*k]);
    }
    const weights=[1,4,6,4,1];
    return smooth(pts.map((p,j)=>{
      const q=[0,0];weights.forEach((w,k)=>{const v=pts[(j+k+38)%40];q[0]+=v[0]*w/16;q[1]+=v[1]*w/16;});
      return [cx+q[0],cy+q[1]];
    }),true);
  };
  // 暗色向同一泥斑内部收敛，削弱硬的双层色带；渐变仍受原有路径裁切。
  rgrad('g-s3-wet-soil', [[0,'#2e2218',1],[.42,'#2e2218',1],[.78,'#2e2218',.52],[1,'#2e2218',0]], {cx:.5,cy:.5,r:.62});
  const R = rng(61);
  const puddles = [];
  for (let i = 0; i < 16; i++) {
    const u = 0.25 + R() * 0.25, p = tr.at(u), side = (R() - 0.5) * 260;
    const x = p[0] - Math.sin(p[2]) * side, y = p[1] + Math.cos(p[2]) * side;
    const rr = 50 + R() * 70;
    el('path', { d: wetContour(x, y, rr * 1.12, i + 3, 2.5), fill: 'url(#g-s3-wet-soil)', opacity: 0.22 }, world);
    el('path', { d: wetContour(x, y, rr * 0.9, i + 3, 2.5), fill: 'url(#g-s3-wet-soil)', opacity: 0.4 }, world);
  }
  rgrad('g-s3-puddle', [[0, '#68747d'], [0.5, '#626d75'], [0.85, '#545d62'], [1, '#494b4b']], { cx: 0.4, cy: 0.38, r: 0.66 });
  for (let i = 0; i < 6; i++) {
    const u = 0.27 + i * 0.038, p = tr.at(u), side = (i % 2 ? 1 : -1) * (70 + R() * 70);
    const x = p[0] - Math.sin(p[2]) * side, y = p[1] + Math.cos(p[2]) * side, rx = 40 + R() * 40, ry = 26 + R() * 18, rot = R() * 180;
    const g0 = G(world, { transform: `translate(${r1(x)},${r1(y)}) rotate(${r1(rot)}) scale(1,${(ry / rx).toFixed(3)})` });
    el('path', { d: wetContour(0, 0, rx + 16, i + 40, 1.6), fill: '#241910', opacity: 0.14 }, g0);
    el('path', { d: wetContour(0, 0, rx + 8, i + 40, 1.6), fill: '#241910', opacity: 0.26 }, g0);
    el('path', { d: wetContour(0, 0, rx, i + 40, 1.6), fill: 'url(#g-s3-puddle)', opacity: 0.85 }, g0);
    softStroke(g0, `M${-rx * 0.5},${-rx * 0.3}Q0,${-rx * 0.6} ${rx * 0.45},${-rx * 0.34}`, '#c9d2da', 2.5, 0.35);
    puddles.push({ x, y, rx, ry, rot: rot * DEG });
  }
  // 荆棘
  const thorn = G(world, { stroke: '#2a1c12', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round', opacity: 0.85 });
  for (let i = 0; i < 7; i++) {
    const u = 0.34 + R() * 0.14, p = tr.at(u), side = (R() < 0.5 ? -1 : 1) * (120 + R() * 60);
    const x = p[0] - Math.sin(p[2]) * side, y = p[1] + Math.cos(p[2]) * side;
    let d = '';
    for (let k = 0; k < 9; k++) {
      const a = R() * 6.28, l = 30 + R() * 50, ex = x + Math.cos(a) * l, ey = y + Math.sin(a) * l;
      d += `M${r1(x)},${r1(y)}L${r1(ex)},${r1(ey)}`;
      for (let j = 1; j < 4; j++) { const bx = lerp(x, ex, j / 4), by = lerp(y, ey, j / 4), ba = a + (j % 2 ? 0.8 : -0.8); d += `M${r1(bx)},${r1(by)}l${r1(Math.cos(ba) * 9)},${r1(Math.sin(ba) * 9)}`; }
    }
    el('path', { d }, thorn);
  }
  // 碎石
  for (let i = 0; i < 110; i++) {
    const u = 0.5 + R() * 0.5, p = tr.at(u), side = (R() < 0.5 ? -1 : 1) * (70 + R() * 380);
    const x = p[0] - Math.sin(p[2]) * side, y = p[1] + Math.cos(p[2]) * side, r = 5 + R() * 20;
    const pts = [];
    for (let k = 0; k < 7; k++) { const a = (k / 7) * 6.283 + R() * 0.5; pts.push([x + Math.cos(a) * r * (0.7 + R() * 0.4), y + Math.sin(a) * r * (0.6 + R() * 0.4)]); }
    el('path', { d: poly(pts, true), fill: '#000', opacity: 0.28, transform: 'translate(3,4)' }, world);
    el('path', { d: poly(pts, true), fill: mixHex('#6d6a66', '#a9a7a2', R()) }, world);
    el('path', { d: poly(pts.slice(0, 4)), fill: 'none', stroke: '#d8d6d0', 'stroke-width': 1.5, opacity: 0.4 }, world);
  }
  // 草鞋印
  // 前掌略宽、后跟较窄，腰部轻收；仍为连续编结草鞋底。
  el('path', { id: 'fp-shape', d: 'M-40,-1C-40,-8 -34,-10.2 -25,-10C-17,-9.8 -14,-9 -9,-10.2C0,-11.5 8,-16 22,-16C35,-16.5 44,-9 44,0C44,9 35,16.5 22,16C8,16 0,11.5 -9,10.2C-14,9 -17,9.8 -25,10C-34,10.2 -40,8 -40,1Z' }, DEFS);
  const fpClip=el('clipPath',{id:'fp-outline-clip',clipPathUnits:'userSpaceOnUse'},DEFS);
  el('use',{href:'#fp-shape'},fpClip);
  let wv = '';
  for (let x = -35,i=0; x <= 40; x += 4.6,i++) { const h = 12.5 * Math.sqrt(clamp(1 - ((x - 2) / 43) ** 2)),bend=[.5,-.7,1.1,-.3][i%4]; wv += `M${r1(x)},${r1(-h)}Q${r1(x+bend)},${r1(-h*.3)} ${r1(x+1.5)},1M${r1(x+1.5)},2Q${r1(x+.8)},${r1(h*.6)} ${r1(x+1)},${r1(h)}`; }
  el('path', { id: 'fp-weave', d: wv }, DEFS);
  el('path', { id: 'fp-warp', d: 'M-35,-6Q-14,-4 2,-6T39,-7M-37,0Q-18,2 -3,0T42,0M-35,6Q-13,8 4,6T39,7' }, DEFS);
  lgrad('g-fp', [[0, '#000', 0.34], [0.3, '#000', 0.10], [0.65, '#000', 0.16], [1, '#000', 0.32]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  // 脚印是地表的受压痕迹：四类断续接触遮罩共用草鞋底外形与原落脚位置。
  const wearPaths=[
    ['M-44,-18L-12,-18L-20,-9L-37,-6Z','M-4,8Q7,4 23,8L39,20H-7Z','M-23,-2Q-11,-5 -8,0L-18,3Z'],
    ['M14,-20L47,-20L47,-2L30,-8Z','M-47,4L-18,9L-11,20H-48Z','M0,-3L11,-6L18,-3L8,1Z'],
    ['M-48,-18L-29,-20L-20,-4L-33,0Z','M8,11L29,5L49,10V23H10Z','M-8,0L2,-4L9,0L-1,4Z'],
    ['M-44,-17L-5,-17L-16,-10L-34,-8Z','M29,-6L48,-8V20L15,20L22,11Z','M-29,4L-15,1L-4,5L-21,7Z']
  ];
  wearPaths.forEach((paths,i)=>{const mk=el('mask',{id:'fp-contact-'+i,maskUnits:'userSpaceOnUse',x:-50,y:-25,width:100,height:50},DEFS);el('rect',{x:-50,y:-25,width:100,height:50,fill:'#fff'},mk);paths.forEach((d,k)=>el('path',{d,fill:k===2?'#aaa':'#666'},mk));});
  // 仅编织压纹断续显现：每类保留两处宽缓受压区，不再完整盖出网格。
  const pressurePaths=[
    'M-40,-9Q-28,-15 -13,-6L-18,7L-38,12ZM7,-15L38,-13L43,1L25,8L8,3Z',
    'M-39,-7L-20,-11L-11,0L-21,10L-38,7ZM6,-7L23,-16L41,-7L40,12L17,13Z',
    'M-40,-5L-25,-10L-13,-3L-20,9L-39,6ZM11,-13L37,-12L44,4L28,12L8,6Z',
    'M-38,-10L-20,-7L-14,3L-29,10L-40,4ZM4,-10L26,-16L42,-5L38,12L19,8Z'
  ];
  pressurePaths.forEach((d,i)=>{const mk=el('mask',{id:'fp-pressure-'+i,maskUnits:'userSpaceOnUse',x:-50,y:-25,width:100,height:50},DEFS);el('path',{d,fill:'#fff'},mk);});
  const printG = G(world);let printIndex=0;
  const mkPrint = (x, y, ang, style, sc = 1.35) => {
    const g0 = G(printG, { transform: `translate(${r1(x)},${r1(y)}) rotate(${r1(ang / DEG)}) scale(${sc})` });
    const index=printIndex++,clear=index%7===2||index%11===5;
    const pressure=clear?.96:[.76,.86,.72,.82][index%4];
    const contact=G(g0,{mask:`url(#fp-contact-${index%4})`});
    el('use', { href: '#fp-shape', fill: '#dec397', opacity: style.rim*.32, transform: 'translate(-.6,-1.3) scale(1.035)' }, contact);
    el('use', { href: '#fp-shape', fill: style.fill, opacity:pressure }, contact);
    el('use', { href: '#fp-shape', fill: 'url(#g-fp)', opacity: (style.depth || 0.8)*pressure*.8 }, contact);
    const wg = G(contact,{'clip-path':'url(#fp-outline-clip)',...(clear?{}:{mask:`url(#fp-pressure-${index%4})`})});
    el('use', { href: '#fp-weave', fill: 'none', stroke: style.weave, 'stroke-width': 1.15, opacity:clear?.48:.25 }, wg);
    el('use', { href: '#fp-weave', fill: 'none', stroke: '#e8cfa0', 'stroke-width': 0.9, opacity: style.rim*(clear?.48:.18), transform: 'translate(1.4,0)' }, wg);
    el('use', { href: '#fp-warp', fill: 'none', stroke: style.weave, 'stroke-width': 1.35, opacity:clear?.4:.16 }, wg);
    if (style.wet) el('path', { d: 'M-26,-7C-8,-11 14,-11 30,-7', fill: 'none', stroke: '#c9d2da', 'stroke-width': 1.1, opacity: 0.28 }, contact);
    const scuffs=printIndex%2?'M-35,7l-4,2M-28,-9l-3,-2M31,12l4,2':'M-37,-6l-3,-2M-8,10l1,2M37,-9l4,-1';
    el('path',{d:scuffs,stroke:style.weave,'stroke-width':.9,fill:'none',opacity:.3},g0);
    return g0;
  };
  const stride = 88 / tr.L;
  const lone = [];
  for (let u = S3.loneU[0], i = 0; u <= S3.loneU[1]; u += stride * (0.92 + hash1(i + 5) * 0.16), i++) {
    const p = tr.at(u), side = i % 2 ? 1 : -1, off = side * (20 + hash1(i * 3) * 6);
    const x = p[0] - Math.sin(p[2]) * off, y = p[1] + Math.cos(p[2]) * off;
    const wet = u > 0.26 && u < 0.49;
    const g0 = mkPrint(x, y, p[2] + (hash1(i * 7) - 0.5) * 0.18, wet ? { fill: 'rgba(43,30,20,0.64)', weave: 'rgba(12,8,4,0.5)', rim: 0.18, wet: true } : { fill: 'rgba(75,51,28,0.44)', weave: 'rgba(40,24,10,0.45)', rim: 0.35 });
    const at = lerp(S3.stepT[0], S3.stepT[1], (u - S3.loneU[0]) / (S3.loneU[1] - S3.loneU[0]));
    lone.push({ g: g0, at, x, y });
  }
  // 大队的脚印（早已踏过，汇成一条人流）
  const lanes = [-196, -132, -66, 0, 66, 132, 196];
  lanes.forEach((off0, li) => {
    const R2 = rng(90 + li);
    for (let u = 0.52 - (li === 3 ? 0 : 0.06) + R2() * stride, i = 0; u < 1; u += stride * (0.9 + R2() * 0.2), i++) {
      const p = tr.at(u), off = off0 + (i % 2 ? 1 : -1) * 20 + (R2() - 0.5) * 16;
      const x = p[0] - Math.sin(p[2]) * off, y = p[1] + Math.cos(p[2]) * off;
      mkPrint(x, y, p[2] + (R2() - 0.5) * 0.2, { fill: `rgba(58,46,34,${0.28 + R2() * 0.2})`, weave: 'rgba(28,20,12,0.4)', rim: 0.22, depth: 0.5 }, 1.2);
    }
  });
  // 磨穿的草鞋
  {
    const p = tr.at(0.31), off = 96, x = p[0] - Math.sin(p[2]) * off, y = p[1] + Math.cos(p[2]) * off;
    const g0 = G(world, { transform: `translate(${r1(x)},${r1(y)}) rotate(${r1(p[2] / DEG + 150)}) scale(1.45)` });
    el('use', { href: '#fp-shape', fill: '#000', opacity: 0.3, transform: 'translate(4,6) scale(1.04)' }, g0);
    el('use', { href: '#fp-shape', fill: '#8f7447' }, g0);
    const wg = G(g0,{'clip-path':'url(#fp-outline-clip)'});
    el('use', { href: '#fp-weave', fill: 'none', stroke: '#5e4523', 'stroke-width': 1.6, opacity: 0.8 }, wg);
    el('use', { href: '#fp-warp', fill: 'none', stroke: '#54401f', 'stroke-width': 2.4 }, wg);
    el('use', { href: '#fp-weave', fill: 'none', stroke: '#cdb080', 'stroke-width': 0.7, opacity: 0.35, transform: 'translate(1.3,0)' }, wg);
    el('use', { href: '#fp-shape', fill: 'none', stroke: '#8f6f3a', 'stroke-width': 3.2 }, g0);
    el('path', { d: 'M10,-2C14,-8 24,-7 25,0C26,6 16,9 11,5Z', fill: '#4a3420' }, g0);
    [[-16, -10.8], [12, -15.5], [-16, 10.8], [12, 15.5]].forEach(([ex, ey]) => el('ellipse', { cx: ex, cy: ey, rx: 6, ry: 3.6, fill: 'none', stroke: '#8a6d3c', 'stroke-width': 2.6 }, g0));
    el('ellipse', { cx: 42, cy: 0, rx: 5, ry: 3.6, fill: 'none', stroke: '#8a6d3c', 'stroke-width': 2.6 }, g0);
    // 交叉的草绳鞋襻
    el('path', { d: 'M42,0C24,-4 6,-14 -16,-10.8M42,0C24,4 6,14 -16,10.8M12,-15.5C4,-6 4,6 12,15.5', fill: 'none', stroke: '#000', 'stroke-width': 5, opacity: 0.22, transform: 'translate(2,3)' }, g0);
    el('path', { d: 'M42,0C24,-4 6,-14 -16,-10.8M42,0C24,4 6,14 -16,10.8M12,-15.5C4,-6 4,6 12,15.5', fill: 'none', stroke: '#9c7d45', 'stroke-width': 3.4, 'stroke-linecap': 'round' }, g0);
    el('path', { d: 'M-16,10.8C-12,26 -2,30 8,26', fill: 'none', stroke: '#8a6d3c', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g0);
    // 草股的扭绞、磨断的边股和洞口露出的纤维，仅附着于这只旧草鞋。
    el('path',{d:'M-38,-5q4,3 0,8M-31,-9q4,7 1,17M-23,-11q4,9 1,21M-13,-12q4,10 1,23M-3,-13q4,11 1,25M7,-13q3,10 1,25M28,-11q3,8 0,21M36,-6q2,6 0,13',stroke:'#c9ad76','stroke-width':.65,fill:'none',opacity:.7},wg);
    el('path',{d:'M42,0C24,-4 6,-14 -16,-10.8M42,0C24,4 6,14 -16,10.8M12,-15.5C4,-6 4,6 12,15.5',stroke:'#dcc28b','stroke-width':.8,'stroke-dasharray':'1.4 2.2',fill:'none',opacity:.64},g0);
    el('path',{d:'M-35,-9l-6,-6m4,4l-5,0M-24,10l-4,7m2,-4l-5,2M2,-12.5l-3,-6M29,10l3,6M11,-3l4,-4M13,5l4,-5M22,6l-2,-3M24,-3l-4,2',stroke:'#bda06b','stroke-width':.7,fill:'none',opacity:.9},g0);

  }
  // 路边枯草
  const tuft = G(world, { stroke: '#6e5332', 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round', opacity: 0.42 });
  for (let i = 0; i < 34; i++) {
    const u = R() * 0.45, p = tr.at(u), side = (R() < 0.5 ? -1 : 1) * (110 + R() * 260);
    const x = p[0] - Math.sin(p[2]) * side, y = p[1] + Math.cos(p[2]) * side;
    let d = '';
    for (let k = 0; k < 11; k++) { const a = R() * 6.283, l = 8 + R() * 20; d += `M${r1(x)},${r1(y)}q${r1(Math.cos(a + 0.4) * l * 0.5)},${r1(Math.sin(a + 0.4) * l * 0.5)} ${r1(Math.cos(a) * l)},${r1(Math.sin(a) * l)}`; }
    if (i % 3 !== 1) el('path', { d }, tuft);
  }
  const s3shade = el('rect', { x: -1400, y: -600, width: 6000, height: 4200, fill: '#1a1208', opacity: 0 }, world);

  const rip = seeds(46, 71, (Rr, i) => ({ p: i % puddles.length, dx: (Rr() - 0.5) * 1.3, dy: (Rr() - 0.5) * 1.2, per: 0.7 + Rr() * 0.5, ph: Rr() }));
  const rain = seeds(90, 73, Rr => ({ x: Rr() * 2200 - 140, y: Rr() * 1300 - 110, v: 900 + Rr() * 500, l: 18 + Rr() * 24 }));

  s.update = t => {
    const m = S3.camAt(t);
    world.setAttribute('transform', M.str(m));
    vis(L.s3, E.sine(prog(t, 9.95, 10.35)));
    for (const f of lone) {
      const k = prog(t, f.at, f.at + 0.14);
      vis(f.g, k);
    }
    s3shade.setAttribute('opacity', (0.12 * prog(t, 12.4, 13.3)).toFixed(3));
  };
  s.fx = (ctx, t) => {
    const m = S3.camAt(t);
    ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
    // 落脚扬尘
    for (const f of lone) {
      const k = (t - f.at) / 0.7;
      if (k < 0 || k > 1) continue;
      for (let j = 0; j < 7; j++) {
        const a = j * 0.9 + f.x * 0.01, r = 20 + k * 46;
        ctx.fillStyle = `rgba(215,188,140,${(0.28 * (1 - k)).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r * 0.8, 3 + k * 7, 0, 6.283); ctx.fill();
      }
    }
    // 雨点涟漪
    const wetA = env(t, 10.8, 11.3, 12.5, 13.0);
    if (wetA > 0) {
      ctx.lineWidth = 1.6;
      for (const r of rip) {
        const pd = puddles[r.p], ph = ((t / r.per + r.ph) % 1 + 1) % 1;
        const x = pd.x + r.dx * pd.rx * Math.cos(pd.rot) - r.dy * pd.ry * Math.sin(pd.rot);
        const y = pd.y + r.dx * pd.rx * Math.sin(pd.rot) + r.dy * pd.ry * Math.cos(pd.rot);
        ctx.strokeStyle = `rgba(230,236,242,${(0.55 * (1 - ph) * wetA).toFixed(3)})`;
        ctx.beginPath(); ctx.ellipse(x, y, 2 + ph * 16, 1.4 + ph * 11, 0, 0, 6.283); ctx.stroke();
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.strokeStyle = `rgba(210,220,230,${(0.22 * wetA).toFixed(3)})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (const d of rain) {
        const y = wrap(d.y + t * d.v, 1300) - 110, x = d.x + (y - d.y) * 0.18;
        ctx.moveTo(x, y); ctx.lineTo(x + d.l * 0.18, y + d.l);
      }
      ctx.stroke();
    }
  };
  return s;
}

/* ============================ 红布掠过 ============================ */
function buildCloth(L) {
  const s = addScene({ name: 'cloth', t0: 13.02, t1: 14.12, roots: [L.cloth] });
  const g0 = G(L.cloth);
  // 投影沿真实布边弯曲，避免矩形投影在地面留下直立硬边。
  const shadow = el('path', {fill:'none',stroke:'#1a0503','stroke-width':85,opacity:.23,filter:'url(#f-b18)'},g0);
  const folds = [[0, '#61140e'], [0.10, '#a02a1e'], [0.25, '#b73224'], [0.39, '#832015'], [0.52, '#bc3928'], [0.7, '#982719'], [0.86, '#b43324'], [1, '#67170f']];
  const grad = lgrad('g-cloth', folds, { gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 2800, y2: 300 });
  const cloth = el('path', { fill: 'url(#g-cloth)' }, g0);
  const clothThread=el('pattern',{id:'pat-moving-cloth',patternUnits:'userSpaceOnUse',width:12,height:12},DEFS);
  el('path',{d:'M0,2Q3,1 6,2M6,8Q9,7 12,8',stroke:'#e09b79','stroke-width':.65,opacity:.21,fill:'none'},clothThread);
  el('path',{d:'M2,6Q1,9 2,12M8,0Q7,3 8,6',stroke:'#340b07','stroke-width':.8,opacity:.26,fill:'none'},clothThread);
  el('path',{d:'M.5,4.5H12M4.5,0V12',stroke:'#5b150e','stroke-width':.35,opacity:.17},clothThread);
  const tex = el('path', { fill: 'url(#pat-moving-cloth)', opacity: 0.85 }, g0);
  const clothClip=uid('cloth-fold');const clothClipPath=el('path',{},el('clipPath',{id:clothClip},DEFS));
  const foldG=G(g0,{'clip-path':`url(#${clothClip})`});
  const materialFolds=[320,950,1650,2380,3040].map((x,i)=>({x,i,dark:el('path',{fill:'none',stroke:'#320805','stroke-width':54+i%2*20,opacity:.11,'stroke-linecap':'round'},foldG),light:el('path',{fill:'none',stroke:'#ef9270','stroke-width':13,opacity:.09,'stroke-linecap':'round'},foldG)}));
  const hem=el('path',{fill:'none',stroke:'#e28b68','stroke-width':1.2,'stroke-dasharray':'5 7',opacity:.36},foldG);
  const lg = lgrad('g-cloth-l', [[0, '#fff', 0], [0.5, '#ed9c7a', 0.10], [1, '#fff', 0]], { gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 600, y2: 0 });
  const sheen = el('path', { fill: 'url(#g-cloth-l)' }, g0);
  const edge = el('path', { fill: 'none', stroke: '#c26d50', 'stroke-width': 2.2, opacity: 0.4, 'stroke-linecap': 'round' }, g0);
  const Wd = 3600;
  s.update = t => {
    const lead = 2060 - 5900 * (t - 13.05);
    const wave = (y, ph) => 70 * Math.sin(y * 0.0048 + t * 7 + ph) + 34 * Math.sin(y * 0.013 - t * 11 + ph * 2) + (y - 540) * 0.24;
    const A = [], B = [];
    for (let y = -240; y <= 1320; y += 40) { A.push([lead + wave(y, 0), y]); B.push([lead + Wd + wave(y, 1.7), y]); }
    const d = smooth(A) + 'L' + B.reverse().map(q => r1(q[0]) + ',' + r1(q[1])).join('L') + 'Z';
    cloth.setAttribute('d', d);
    tex.setAttribute('d', d);
    clothClipPath.setAttribute('d',d);
    clothThread.setAttribute('patternTransform',`translate(${r1(lead)},0) skewX(${r1(2*Math.sin(t*6))})`);
    for(const fold of materialFolds){
      const pts=[];for(let y=-260;y<=1340;y+=90)pts.push([lead+fold.x+wave(y,.45+fold.i*.32)*(.55+fold.i*.06),y]);
      fold.dark.setAttribute('d',smooth(pts));fold.light.setAttribute('d',smooth(pts.map(p=>[p[0]+31,p[1]])));
    }
    hem.setAttribute('d',smooth(A.map(p=>[p[0]+13,p[1]])));
    sheen.setAttribute('d', d);
    edge.setAttribute('d', smooth(A));
    shadow.setAttribute('d',smooth(A.map(p=>[p[0]-24,p[1]])));
    set(grad, { x1: r1(lead + 40 * Math.sin(t * 9)), x2: r1(lead + Wd + 40 * Math.sin(t * 9)) });
    set(lg, { x1: r1(lead + 700 + 260 * Math.sin(t * 6)), x2: r1(lead + 1300 + 260 * Math.sin(t * 6)) });
  };
  return s;
}

/* ============================ S3b 红星（暖光） ============================ */
const S4 = { camObj: { x: 650, y: 640, s: 0.78 } };
S4.lens = [S4.camObj.x, S4.camObj.y + 8 * S4.camObj.s];
S4.refl = [S4.camObj.x - 20 * S4.camObj.s, S4.camObj.y - 8 * S4.camObj.s];
S4.reflR = 15 * S4.camObj.s;
S4.closeS = 5.2;
const S3b = {};
{
  // 红星缩小后，恰好落在 S4 镜头里红星倒影的位置与大小
  const Q = [W / 2 + (S4.refl[0] - S4.lens[0]) * S4.closeS, H / 2 + (S4.refl[1] - S4.lens[1]) * S4.closeS];
  const s = (S4.reflR * S4.closeS) / CAPSTAR.R, r = 8 * DEG;
  const v = [(Q[0] - W / 2) / s, (Q[1] - H / 2) / s];
  const vx = v[0] * Math.cos(-r) - v[1] * Math.sin(-r), vy = v[0] * Math.sin(-r) + v[1] * Math.cos(-r);
  S3b.endCam = [CAPSTAR.x - vx, CAPSTAR.y - vy, s, r];
}
S3b.camKeys = [
  [13.3, [960, 560, 0.94, -0.01]],
  [14.55, [960, 520, 1.02, 0.004]],
  [15.08, S3b.endCam],
];
S3b.camAt = t => { const c = camSpl(t, S3b.camKeys); return cam(c[0], c[1], c[2], c[3]); };

function buildS3b(L) {
  const s = addScene({ name: 'S3b', t0: 13.46, t1: 15.12, roots: [L.s3b] });
  const world = G(L.s3b);
  lgrad('g-s3b-sky', [[0, '#f6cf94'], [0.55, '#dc8a4c'], [1, '#9a4a28']]);
  el('rect', { x: -3000, y: -2400, width: 8000, height: 2900, fill: 'url(#g-s3b-sky)' }, world);
  rgrad('g-s3b-sun', [[0, '#fff6dc', 0.95], [0.25, '#ffd896', 0.5], [1, '#ffb060', 0]]);
  el('circle', { cx: 1580, cy: 40, r: 560, fill: 'url(#g-s3b-sun)' }, world);
  el('path', { d: 'M-3000,560C-1000,500 0,470 400,500C800,530 1200,480 1600,500C2200,530 3600,480 5000,520L5000,900L-3000,900Z', fill: '#7a3e28', opacity: 0.8 }, world);
  el('path', { d: 'M-3000,640C-800,600 200,590 700,610C1200,630 1700,600 2300,620C3000,640 4000,600 5000,630L5000,1000L-3000,1000Z', fill: '#4a2618', opacity: 0.9 }, world);
  // 接续原两层山坡叠合在暗底上的土色，再缓缓落到原近地暗色，避免900处横切。
  lgrad('g-s3b-ground', [[0, '#4d2719'], [1, '#1c1210']],
    { gradientUnits: 'userSpaceOnUse', x1: 0, y1: 900, x2: 0, y2: 1400 });
  el('rect', { x: -3000, y: 900, width: 8000, height: 3000, fill: 'url(#g-s3b-ground)' }, world);
  const cap = buildCapFront(world, {});
  cap.underBrimBackdrop.setAttribute('display', 'none');
  cap.starG.setAttribute('id', 'star-s3b');
  const cpc = uid('cp');
  el('path', { d: cap.crownD + 'M266,740Q960,786 1654,740L1690,832Q960,1030 230,832Z' }, el('clipPath', { id: cpc }, DEFS));
  lgrad('g-s3b-light', [[0, '#000', 0.4], [0.45, '#000', 0.05], [0.78, '#ffb060', 0.12], [1, '#ffcf8a', 0.3]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  el('rect', { x: 0, y: 100, width: 1920, height: 1000, fill: 'url(#g-s3b-light)', 'clip-path': `url(#${cpc})` }, world);
  softStroke(world, 'M1240,158L1540,222L1760,360C1750,480 1700,620 1640,740', '#ffd49a', 6, 0.55);
  const dim = el('rect', { x: -3000, y: -2400, width: 8000, height: 6000, fill: '#070504', opacity: 0 }, world);
  el('use', { href: '#star-s3b' }, world);
  const cp = uid('cp');
  el('path', { d: cap.starPath }, el('clipPath', { id: cp }, DEFS));
  const gl = G(world, { 'clip-path': `url(#${cp})` });
  lgrad('g-s3b-glint', [[0, '#fff', 0], [0.4, '#fff', 0], [0.5, '#fff6e0', 0.8], [0.6, '#fff', 0], [1, '#fff', 0]], { x1: 0, y1: 0, x2: 1, y2: 0.3 });
  const glint = el('rect', { x: 600, y: 280, width: 320, height: 380, fill: 'url(#g-s3b-glint)' }, gl);
  const glow = el('circle', { cx: CAPSTAR.x, cy: CAPSTAR.y, r: 300, fill: 'url(#g-glow-red)', opacity: 0 }, world);
  s.update = t => {
    world.setAttribute('transform', M.str(S3b.camAt(t)));
    const gk = prog(t, 13.95, 14.5);
    glint.setAttribute('x', r1(lerp(560, 1120, E.io2(gk))));
    vis(glint, Math.sin(Math.PI * gk));
    glow.setAttribute('opacity', (0.25 * Math.sin(Math.PI * gk)).toFixed(3));
    dim.setAttribute('opacity', (0.9 * E.sine(prog(t, 14.5, 15.0))).toFixed(3));
  };
  return s;
}

/* ============================ S4 斯诺的相机与笔记 ============================ */
S4.nb = { x: 1330, y: 770, rot: -4, sx: 1, sy: 0.72, seed: 5 };
function buildS4(L) {
  const s = addScene({ name: 'S4', t0: 14.6, t1: 24.55, roots: [L.s4, L.s4ink] });
  const world = G(L.s4);
  // 墙与桌
  lgrad('g-s4-wall', [[0, '#1e150e'], [1, '#3b2a1c']]);
  el('rect', { x: -800, y: -800, width: 3520, height: 1230, fill: 'url(#g-s4-wall)' }, world);
  el('rect', { x: -800, y: -800, width: 3520, height: 1230, fill: 'url(#pat-grit-l)', opacity: 0.5 }, world);
  lgrad('g-s4-table', [[0, '#000', 0.55], [0.35, '#000', 0.12], [1, '#000', 0.35]]);
  buildWornTabletop(world, -800, 430, 3520, 1400, 'cp-s4-tablegrain');
  el('rect', { x: -800, y: 430, width: 3520, height: 1400, fill: 'url(#g-s4-table)' }, world);
  el('rect', { x: -800, y: 426, width: 3520, height: 6, fill: '#0c0704', opacity: 0.8 }, world);
  el('rect', { x: -800, y: 432, width: 3520, height: 2, fill: '#c89660', opacity: 0.35 }, world);
  // 油灯（景深虚化）
  const lampG = G(world, { opacity: 0.8 });
  const lamp = buildLamp(lampG, 250, 488, 0.95);
  const flame = buildFlame(world, { halo: 380 });
  rgrad('g-s4-pool', [[0, '#ffc47a', 0.3], [0.4, '#ff9f50', 0.12], [1, '#ff9040', 0]], { gradientUnits: 'userSpaceOnUse', cx: 290, cy: 330, r: 1500 });
  el('rect', { x: -800, y: -800, width: 3520, height: 2600, fill: 'url(#g-s4-pool)' }, world);
  // 相机
  const cm = buildCamera(world, S4.camObj);
  // 笔记本
  const nb = buildNotebook(world, S4.nb);
  // 可读的采访提纲与照片。
  const interview = buildInterviewPaper(nb, world);
  const lines = interview.lines;
  const total = interview.total;
  const ph = INTERVIEW_PHOTO_CARD;
  const phM = M.chain(M.t(ph.x, ph.y), M.r(ph.rot * DEG));
  const pen = buildPen(world);
  const drop = el('circle', { r: 0, fill: '#0b0e16' }, world);
  const dropHi = el('circle', { r: 0, fill: '#8ea4c8', opacity: 0.6 }, world);
  const splash = el('ellipse', { rx: 0, ry: 0, fill: 'none', stroke: '#0b0e16', 'stroke-width': 3, opacity: 0 }, world);
  const stain = el('path', { fill: '#0b0e16', opacity: 0.92 }, world);
  // 墨晕（屏幕坐标）；同形状作为 S5 的显影遮罩
  const ink = el('path', { fill: '#06080c' }, L.s4ink);
  const inkRim = el('path', { fill: 'none', stroke: '#1d2a44', 'stroke-width': 30, opacity: 0.3, 'stroke-linejoin': 'round' }, L.s4ink);
  const maskId = 'm-ink';
  const inkMask = el('path', { fill: '#fff' }, el('mask', { id: maskId, maskUnits: 'userSpaceOnUse', x: -500, y: -500, width: 2920, height: 2080 }, DEFS));
  S4.inkMaskId = maskId;

  S4.camKeys = [
    [14.6, [S4.lens[0], S4.lens[1], S4.closeS, 0]],
    [15.25, [S4.lens[0], S4.lens[1], S4.closeS, 0], 'stop'],
    [17.3, [930, 668, 1.12, 0]],
    [20.6, [1235, 712, 1.34, 0.004]],
    [22.35, [1300, 735, 1.55, 0.008]],
    [24.6, [1330, 760, 2.4, 0.01]],
  ];
  S4.camAt = t => {
    const c = camSpl(t, S4.camKeys);
    const d = drift(t, prog(t, 15.3, 16.5), 21);
    return cam(c[0] + d[0] / c[2], c[1] + d[1] / c[2], c[2], c[3] + d[2]);
  };
  const W1 = [17.35, 20.85];
  const penAt = t => {
    const p = E.sine(prog(t, W1[0], W1[1])) * total;
    const q = interview.pointAt(p);
    // 写完后退到空白页缘，正文留下完整的阅读停顿。
    const park = E.sine(prog(t, W1[1], 21.35));
    return M.ap(nb.m, q[0] + 95 * park, q[1] + 75 * park);
  };
  const nibRest = penAt(21.35);
  S4.dropPt = [nibRest[0] + 6, nibRest[1] + 40];

  s.slots = [{
    key: 'snow', label: '采访照片', active: t => t > 15.6 && t < 22.4,
    quad: t => { const m = M.mul(S4.camAt(t), phM); return [[-ph.w / 2, -ph.h / 2], [ph.w / 2, -ph.h / 2], [ph.w / 2, ph.h / 2], [-ph.w / 2, ph.h / 2]].map(p => M.ap(m, p[0], p[1])); },
  }];

  s.update = t => {
    const m = S4.camAt(t);
    world.setAttribute('transform', M.str(m));
    vis(L.s4, E.sine(prog(t, 14.62, 15.02)));
    flame.update(t, lamp.tip[0], lamp.tip[1] + 3, 0.95, 1, 0, 11);
    // 书写
    const p = E.sine(prog(t, W1[0], W1[1])) * total;
    interview.revealAt(p);
    const tip = penAt(t);
    const lift = 16 * E.sine(prog(t, 20.9, 21.5)) + 20 * (1 - E.sine(prog(t, 16.2, 17.35))) + interview.penLiftAt(p);
    const wob = t > W1[0] && t < W1[1] ? 3 * Math.sin(t * 38) : 0;
    pen.g.setAttribute('transform', `translate(${r1(tip[0])},${r1(tip[1] - lift + wob)})`);
    pen.shadow.setAttribute('transform', `translate(${r1(18 + lift * 1.4)},${r1(22 + lift * 1.6)})`);
    vis(pen.g, 1);
    // 墨滴
    const grow = E.out2(prog(t, 21.35, 22.3));
    const fall = E.in2(prog(t, 22.3, 22.52));
    const nib = [tip[0] + 2, tip[1] - lift + 5];
    const dx = lerp(nib[0], S4.dropPt[0], fall), dy = lerp(nib[1] + 7 * grow, S4.dropPt[1], fall);
    const r = 7.5 * grow * (1 + 0.25 * fall);
    const landed = t >= 22.52;
    set(drop, { cx: r1(dx), cy: r1(dy), r: landed ? 0 : r1(r) });
    set(dropHi, { cx: r1(dx - r * 0.35), cy: r1(dy - r * 0.4), r: landed ? 0 : r1(r * 0.28) });
    const sp = prog(t, 22.52, 22.9);
    set(splash, { cx: S4.dropPt[0], cy: S4.dropPt[1], rx: r1(8 + sp * 30), ry: r1(5 + sp * 18), opacity: (landed ? 0.6 * (1 - sp) : 0).toFixed(3) });
    const st = E.out3(prog(t, 22.52, 23.2));
    stain.setAttribute('d', landed ? blobPath(S4.dropPt[0], S4.dropPt[1], 6 + st * 26, 4, t, 48, 2.2) : 'M0,0');
    // 墨晕扩散（屏幕坐标）
    const bk = prog(t, 22.75, 24.45);
    if (bk > 0) {
      const c = M.ap(m, S4.dropPt[0], S4.dropPt[1]);
      // 落点随抬笔进入空白处；以视口最远角确定末端覆盖半径。
      const farCorner = Math.hypot(Math.max(c[0], 1920-c[0]), Math.max(c[1], 1080-c[1]));
      const Rr = 20 + Math.max(1850, (farCorner + 130) / .9) * E.in2(bk);
      const d = blobPath(c[0], c[1], Rr, 9, t * 0.6, 140, 1.6);
      ink.setAttribute('d', d);
      inkRim.setAttribute('d', d);
      inkMask.setAttribute('d', blobPath(c[0], c[1], Math.max(0, Rr * 0.9 - 30), 9, t * 0.6, 140, 1.6));
      vis(ink, 1); vis(inkRim, 1);
    } else { vis(ink, 0); vis(inkRim, 0); inkMask.setAttribute('d', 'M0,0'); }
  };
  s.fx = (ctx, t) => {
    const m = S4.camAt(t);
    ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
    const a = env(t, 15.2, 16.2, 22.6, 23.4);
    if (a <= 0) return;
    for (let i = 0; i < 50; i++) {
      const x = 150 + hash1(i * 5) * 900 + Math.sin(t * 0.3 + i) * 30, y = 150 + hash1(i * 9 + 1) * 500 + Math.cos(t * 0.25 + i * 2) * 24 - t * 3;
      ctx.fillStyle = `rgba(255,214,160,${(a * 0.35 * hash1(i + 77)).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(x, y, 0.8 + hash1(i * 3) * 1.6, 0, 6.283); ctx.fill();
    }
  };
  return s;
}
