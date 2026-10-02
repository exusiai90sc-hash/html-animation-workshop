'use strict';
/* =============================================================
 * main.js —— 组装、时间轴驱动、后期（调色/颗粒/暗角/闪光）、
 *            播放控制、素材位参考框、逐帧导出接口
 * ============================================================= */
(function () {
  const params = new URLSearchParams(location.search);
  // 允许用网址参数临时指定素材：?li=images/li.jpg&snow=images/snow.jpg&deed=images/deed.jpg
  ['li', 'snow', 'deed'].forEach(k => { if (params.get(k)) MATERIALS[k] = params.get(k); });

  const svg = document.getElementById('world');
  DEFS = document.getElementById('defs');
  makeTextures();
  makeCommonDefs();

  // 图层顺序（自下而上）
  const root = G(svg, { id: 'root' });
  const L = {};
  ['s1', 's2', 's1o', 's3', 's3b', 'cloth', 's4', 's4ink', 's56', 's7', 's8', 'flame', 's11b', 's12a', 's12b'].forEach(n => { L[n] = G(root, { id: 'L-' + n }); });

  const builders = ['buildS1', 'buildS2', 'buildS3', 'buildCloth', 'buildS3b', 'buildS4', 'buildS56', 'buildS7', 'buildS8', 'buildS11b', 'buildS12']
    .map(n => window[n]).filter(f => typeof f === 'function');
  builders.forEach(b => b(L));
  SCENES.forEach(s => { s._on = null; });
  // 纹理加速（异步生成平铺图，完成前先用原图案）
  const texReady = params.has('patterns') ? Promise.resolve() : prepTexImages().then(() => {
    const hidden = Array.from(root.querySelectorAll('*')).filter(e => e.style && e.style.display === 'none');
    hidden.forEach(e => { e.style.display = ''; });
    convertTextures(root);
    hidden.forEach(e => { e.style.display = 'none'; });
  });

  const fx = document.getElementById('fx'), fctx = fx.getContext('2d');
  const grainC = document.getElementById('grain'), gctx = grainC.getContext('2d');
  const gradeEl = document.getElementById('grade'), flashEl = document.getElementById('flash'), vigEl = document.getElementById('vig');
  const stageEl = document.getElementById('stage');

  /* ---------- 全局调色（柔光叠加），按叙事情绪变化 ---------- */
  const GRADE = [
    [0, '#ff9440', 0.3], [6.8, '#ff9f55', 0.26], [7.6, '#d2a36a', 0.2], [10.2, '#d09a5c', 0.18],
    [13.4, '#ff8f4a', 0.22], [15.2, '#ffa050', 0.26], [23.6, '#ff9848', 0.24],
    [24.6, '#4a6690', 0.34], [28.9, '#46628c', 0.32], [29.8, '#5a7cab', 0.3], [34.8, '#6f8fbf', 0.26],
    [36.5, '#7f8fb0', 0.18], [38.4, '#ff8c50', 0.2], [39.4, '#ffae5a', 0.24], [44.5, '#ffb45e', 0.22],
    [46.5, '#6a78b8', 0.2], [50.2, '#6a7cb0', 0.22], [50.8, '#3e557e', 0.34], [52.6, '#40597e', 0.28],
    [53.4, '#ff8a6a', 0.2], [54.8, '#ff9a50', 0.26], [56.6, '#ff9d4a', 0.24], [57.6, '#ffb86a', 0.28], [60.6, '#ffb866', 0.3],
  ];
  function gradeAt(t) {
    let i = 1;
    while (i < GRADE.length - 1 && t > GRADE[i][0]) i++;
    const a = GRADE[i - 1], b = GRADE[i];
    const k = E.sine(prog(t, a[0], b[0]));
    return [mixHex(a[1], b[1], k), lerp(a[2], b[2], k)];
  }

  /* ---------- 时间映射：实际配音落点 → 设计落点（分段线性） ---------- */
  const DESIGN = [0, T.PAST, T.NOW, T.KNOW, T.WHOM, T.BELIEF, T.FORGE, T.END];
  const TM = (typeof TIMING === 'object' && TIMING) || {};
  let ACTUAL = [0, TM.past, TM.now, TM.know, TM.whom, TM.belief, TM.forge, TM.end].map((v, i) => (typeof v === 'number' && isFinite(v) ? v : DESIGN[i]));
  if (!ACTUAL.every((v, i) => i === 0 || v > ACTUAL[i - 1])) { console.warn('TIMING 落点需递增，已改用默认值'); ACTUAL = DESIGN.slice(); }
  const DURATION = ACTUAL[ACTUAL.length - 1];
  function warp(t) {
    for (let i = 1; i < ACTUAL.length; i++) if (t <= ACTUAL[i]) return DESIGN[i - 1] + (t - ACTUAL[i - 1]) / (ACTUAL[i] - ACTUAL[i - 1]) * (DESIGN[i] - DESIGN[i - 1]);
    return T.END;
  }

  /* ---------- 渲染一帧 ---------- */
  let lastT = -1;
  function renderAt(tReal) {
    tReal = clamp(tReal, 0, DURATION);
    lastT = tReal;
    const t = warp(tReal);
    POST.flash = 0; POST.flashColor = '#fff'; POST.shake = [0, 0]; POST.vig = 1;
    for (const s of SCENES) {
      const on = t >= s.t0 && t <= s.t1;
      if (on !== s._on) { s.roots.forEach(r => { r.style.display = on ? '' : 'none'; }); s._on = on; }
      if (on) s.update(t);
    }
    // 粒子层
    fctx.setTransform(1, 0, 0, 1, 0, 0);
    fctx.clearRect(0, 0, W, H);
    for (const s of SCENES) if (s._on && s.fx) { fctx.save(); s.fx(fctx, t); fctx.restore(); }
    fctx.setTransform(1, 0, 0, 1, 0, 0);
    // 后期
    const [gc, ga] = gradeAt(t);
    gradeEl.style.background = gc;
    gradeEl.style.opacity = ga.toFixed(3);
    flashEl.style.background = POST.flashColor;
    flashEl.style.opacity = clamp(POST.flash).toFixed(3);
    vigEl.style.opacity = clamp(POST.vig * (1 + 0.06 * noise1(t * 11)), 0, 1.5).toFixed(3);
    const wob = [0, 0];
    svg.style.transform = `translate(${(POST.shake[0] + wob[0]).toFixed(2)}px,${(POST.shake[1] + wob[1]).toFixed(2)}px)`;
    // 胶片颗粒（每秒 24 次换帧）
    const gi = Math.floor(t * 24);
    const tex = TEX.grain[gi % TEX.grain.length];
    const pat = gctx.createPattern(tex, 'repeat');
    const ox = Math.floor(hash1(gi * 7 + 1) * 256), oy = Math.floor(hash1(gi * 13 + 5) * 256);
    gctx.setTransform(1, 0, 0, 1, -ox, -oy);
    gctx.fillStyle = pat;
    gctx.fillRect(ox, oy, grainC.width, grainC.height);
    gctx.setTransform(1, 0, 0, 1, 0, 0);
    updateGuides(t);
    updateUI(tReal);
  }

  /* ---------- 素材位参考框（按 G 显示） ---------- */
  const guidesEl = document.getElementById('guides');
  let showGuides = params.has('guides');
  const guideEls = {};
  function updateGuides(t) {
    guidesEl.style.display = showGuides ? '' : 'none';
    if (!showGuides) return;
    const seen = new Set();
    for (const s of SCENES) {
      if (!s._on || !s.slots) continue;
      for (const sl of s.slots) {
        if (!sl.active(t)) continue;
        seen.add(sl.key + s.name);
        let g = guideEls[sl.key + s.name];
        if (!g) {
          g = document.createElementNS(NS, 'svg');
          g.setAttribute('viewBox', '0 0 1920 1080');
          g.style.cssText = 'position:absolute;inset:0;width:1920px;height:1080px;overflow:visible';
          g.innerHTML = '<polygon fill="rgba(80,200,255,.08)" stroke="#5fd0ff" stroke-width="3" stroke-dasharray="14 8"/><text font-size="28" fill="#5fd0ff" font-family="sans-serif" paint-order="stroke" stroke="#000" stroke-width="5"></text>';
          g.querySelector('text').textContent = sl.label;
          guidesEl.appendChild(g);
          guideEls[sl.key + s.name] = g;
        }
        const q = sl.quad(t);
        g.querySelector('polygon').setAttribute('points', q.map(p => p.map(v => v.toFixed(1)).join(',')).join(' '));
        const tx = g.querySelector('text');
        tx.setAttribute('x', Math.max(10, Math.min(...q.map(p => p[0]))).toFixed(1));
        tx.setAttribute('y', Math.max(34, Math.min(...q.map(p => p[1])) - 12).toFixed(1));
      }
    }
    for (const k in guideEls) guideEls[k].style.display = seen.has(k) ? '' : 'none';
  }

  /* ---------- 舞台缩放 ---------- */
  function fit() {
    const s = Math.min(innerWidth / W, innerHeight / H);
    stageEl.style.transform = `scale(${s})`;
  }
  addEventListener('resize', fit);
  fit();

  /* ---------- 播放控制 ---------- */
  const ui = document.getElementById('ui');
  const btn = document.getElementById('play');
  const bar = document.getElementById('bar');
  const time = document.getElementById('time');
  const clean = params.has('clean') || params.has('render');
  if (clean) ui.style.display = 'none';
  let playing = false, t0wall = 0, tStart = 0;
  function play() {
    if (lastT >= DURATION - 1e-3) tStart = 0; else tStart = Math.max(0, lastT);
    t0wall = performance.now();
    playing = true;
    btn.textContent = '❚❚';
    requestAnimationFrame(loop);
  }
  function pause() { playing = false; btn.textContent = '▶'; }
  function loop(now) {
    if (!playing) return;
    const t = tStart + (now - t0wall) / 1000;
    if (t >= DURATION) { renderAt(DURATION); pause(); return; }
    renderAt(t);
    requestAnimationFrame(loop);
  }
  function seek(t) { const wasPlaying = playing; pause(); renderAt(t); if (wasPlaying) play(); }
  function updateUI(t) {
    if (clean) return;
    bar.value = (t / DURATION * 1000).toFixed(0);
    time.textContent = t.toFixed(2).padStart(5, '0') + ' / ' + DURATION.toFixed(3);
  }
  btn.addEventListener('click', () => (playing ? pause() : play()));
  bar.addEventListener('input', () => seek(bar.value / 1000 * DURATION));
  document.getElementById('restart').addEventListener('click', () => { seek(0); play(); });
  document.getElementById('guidesBtn').addEventListener('click', () => { showGuides = !showGuides; updateGuides(lastT); });
  document.getElementById('fs').addEventListener('click', () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); });
  addEventListener('keydown', e => {
    if (e.code === 'Space') { e.preventDefault(); playing ? pause() : play(); }
    else if (e.code === 'ArrowRight') seek(lastT + (e.shiftKey ? 1 / 30 : 1));
    else if (e.code === 'ArrowLeft') seek(lastT - (e.shiftKey ? 1 / 30 : 1));
    else if (e.code === 'Home') seek(0);
    else if (e.code === 'KeyG') { showGuides = !showGuides; updateGuides(lastT); }
    else if (e.code === 'KeyF') document.getElementById('fs').click();
    else if (e.code === 'KeyH') ui.classList.toggle('hidden');
  });
  let idle;
  addEventListener('mousemove', () => {
    ui.classList.remove('idle');
    document.body.style.cursor = '';
    clearTimeout(idle);
    idle = setTimeout(() => { if (playing) { ui.classList.add('idle'); document.body.style.cursor = 'none'; } }, 1800);
  });

  /* ---------- 对外接口（逐帧导出用） ---------- */
  const ready = texReady.then(() => {
    const imgs = Array.from(document.querySelectorAll('image')).map(i => i.getAttribute('href') || '').filter(h => h);
    return Promise.all([...new Set(imgs)].map(h => new Promise((res,rej) => { const im = new Image(); im.onload = () => res(); im.onerror = () => rej(new Error('Image failed to load')); im.src = h; })));
  }).then(() => (window.BURN_READY || Promise.resolve())).then(() => { renderAt(lastT < 0 ? 0 : lastT); });
  window.__anim = { duration: DURATION, renderAt, play, pause, seek, ready, anchors: { design: DESIGN, actual: ACTUAL } };

  const t0 = parseFloat(params.get('t') || '0') || 0;
  renderAt(t0);
  if (params.has('autoplay')) ready.then(play);
})();
