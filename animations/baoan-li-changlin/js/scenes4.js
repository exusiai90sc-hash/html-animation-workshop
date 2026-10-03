'use strict';
/* 38.55–53.7秒：原正式地契燃烧与余烬。
 * 纸张39.9–41.3秒缓缓向左漂移，露出首战；原遮罩、焦边、热区和粒子保留。
 * 旧村落、火苗、风雨、闪电已移除；真实地形由最终地形与纸山.js接入。
 */
function buildS8(L) {
  const s=addScene({name:'S8',t0:38.55,t1:53.7,roots:[L.s8]});
  /* ---------- 借据燃烧（画布） ---------- */
  const BW = 250, BH = 175;
  const burn = new Float32Array(BW * BH);
  const burnHeat = new Float32Array(BW * BH);
  {
    const nz = tileFbm(256, 77, [[4, 0.5], [8, 0.3], [24, 0.2]]);
    const ig = [BW * 0.46, BH * 1.02];
    let mx = 0;
    for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) {
      const d = Math.hypot((x - ig[0]) * 0.85, y - ig[1]);
      const v = d / 220 * 0.78 + nz[(y % 256) * 256 + (x % 256)] * 0.42;
      burn[y * BW + x] = v;
      // Reuse the existing paper's burn field for local hot/cooled regions;
      // no new random stream or change to the disappearance mask.
      burnHeat[y * BW + x] = .25+.75*smoothstep(.38,.70,nz[(y % 256) * 256 + (x % 256)]);
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
  const paperM = t => M.chain(M.t(960-300*smoothstep(39.9,41.3,t), 565), M.r(-3 * DEG), M.s(lerp(1.2, 1.12, E.sine(prog(t, 38.6, 43)))), M.s(0.56, 1), M.t(-500, -350));
  const embers = seeds(360, 141, R => {
    const x = R() * 1000, y = R() * 700, v = burn[Math.floor(y / 4) * BW + Math.floor(x / 4)];
    const p = Math.sqrt(clamp((v + 0.03) / 1.12));
    return { x, y, at: lerp(BT[0], BT[1], p), vx: (R() - 0.5) * 70, vy: 60 + R() * 110, life: 1.4 + R() * 1.8, ph: R() * 6.28, r: 1 + R() * 2.2 };
  });
  s.slots = [{
    key: 'deed', label: '史料位 · 契约/借据（燃烧）', active: t => t > 38.9 && t < 41.8,
    quad: t => { const m = paperM(t); return [[0, 0], [1000, 0], [1000, 700], [0, 700]].map(p => M.ap(m, p[0], p[1])); },
  }];
  s.update=t=>{
    if(t>39.05&&t<T.WHOM+.8){POST.flash=Math.max(POST.flash,.95*Math.sin(Math.PI*clamp((t-T.WHOM+.1)/.9))**1.5);POST.flashColor='#fff1d6';}
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
        const c = (1 - smoothstep(tt + .011, tt + .046, v)) * a;
        const ash=(1-smoothstep(tt+.018,tt+.034,v))*smoothstep(tt+.009,tt+.016,v);
        charI.data[j] = 15+ash*30; charI.data[j + 1] = 13+ash*27; charI.data[j + 2] = 12+ash*23; charI.data[j + 3] = c * 250;
        const gl = Math.exp(-(((v - tt - .003) / .0065) ** 2));
        glowI.data[j] = 255; glowI.data[j + 1] = 126 + 58 * gl; glowI.data[j + 2] = 38 + 40 * gl; glowI.data[j + 3] = gl * 255 * burnHeat[i];
      }
      maskX.putImageData(maskI, 0, 0); charX.putImageData(charI, 0, 0); glowX.putImageData(glowI, 0, 0);
      paperX.globalCompositeOperation = 'source-over';
      paperX.clearRect(0, 0, 1000, 700);
      if (deedSrc instanceof HTMLImageElement) {
        // Virtual burn surface is 1000x700; paperM restores the supplied portrait aspect ratio.
        paperX.drawImage(deedSrc, 0, 0, 1000, 700);
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
      ctx.globalAlpha = on * 0.09;
      ctx.drawImage(glowC, -10, -8, 1020, 716);
      ctx.globalAlpha = on * 0.025;
      ctx.drawImage(glowC, -25, -18, 1050, 736);
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
    ctx.globalCompositeOperation = 'source-over';
  };
  return s;
}
