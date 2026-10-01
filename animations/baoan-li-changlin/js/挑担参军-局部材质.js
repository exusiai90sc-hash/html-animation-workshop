'use strict';
/* V2 surface detail only. Load after core.js, before main.js.
 * Build once after poleG/body/rifleG/pastW exist; call returned update({t, ps,
 * beamD: bd}) after assigning the live torso and beam paths in s.update.
 * No silhouette, pose, timeline, base fill, or existing node is changed.
 */
function buildV2SurfaceDetails({ poleG, body, rifleG, pastW }) {
  const id = uid('v2-surface'), R = rng(560321);
  const num = v => Math.round(v * 100) / 100;
  const mix = (a,b,u) => a + (b-a)*u;
  const live = { 'data-live': 1, 'pointer-events': 'none' };
  const path = (p, a) => el('path', Object.assign({}, live, a), p);
  const group = (p, a) => G(p, Object.assign({}, live, a));
  const clip = (suffix, d) => {
    const cp = el('clipPath', { id: id + suffix, clipPathUnits: 'userSpaceOnUse' }, DEFS);
    return { cp, shape: path(cp, { d: d || '' }), url: `url(#${id + suffix})` };
  };
  const next = node => {
    if (!node || !node.parentNode) return null;
    const siblings = Array.from(node.parentNode.children);
    return siblings[siblings.indexOf(node) + 1] || null;
  };
  const before = (node, reference) => {
    const parent = node.parentNode;
    if (reference && reference !== node && reference.parentNode === parent) {
      node.remove(); parent.insertBefore(node, reference);
    }
  };

  // Wood grain lives in beam coordinates, between the actual upper/lower edges.
  // The details remain below rim light, peg and rope rather than painting over them.
  const poleChildren = Array.from(poleG.children);
  const beamClip = clip('-beam');
  const beam = group(poleG, { 'clip-path': beamClip.url, 'data-material': 'bending-wood' });
  before(beam, poleChildren.find(n => n.tagName.toLowerCase() === 'path' && n.getAttribute('fill') === 'none') || poleChildren[2]);
  const grainDark = path(beam, { fill: 'none', stroke: '#27160b', 'stroke-width': 1.25, opacity: .30, 'stroke-linecap': 'round' });
  const grainLight = path(beam, { fill: 'none', stroke: '#d6b980', 'stroke-width': .9, opacity: .17, 'stroke-linecap': 'round' });
  const grainWear = path(beam, { fill: 'none', stroke: '#e4c99a', 'stroke-width': 2.15, opacity: .32, 'stroke-linecap': 'round' });
  const grainCrease = path(beam, { fill: 'none', stroke: '#1e1109', 'stroke-width': 2.0, opacity: .27, 'stroke-linecap': 'round' });
  const fibers = Array.from({length: 15}, (_,i) => {
    const start=i<3?.025+R()*.05:.04+R()*.56;
    return {start,end:i<3?.93+R()*.055:Math.min(.98,start+.18+R()*.30),
      level:.075+R()*.85,wave:1.5+R()*2.4,phase:R()*6.283,category:i%4===0?1:0};
  });
  const knots=path(beam,{fill:'none',stroke:'#34200e','stroke-width':1.2,opacity:.35});
  const scars = Array.from({length: 18}, (_,i) => ({
    start: .025 + R()*.89, length: .018 + R()*.065,
    level: i%3 ? .07 + R()*.14 : .69 + R()*.24, phase:R()*6.283
  }));
  function edges(d, ps) {
    // beamPath currently emits paired top/bottom polylines; preserve its contour.
    if (d && !/[CQAHVSTcqahvst]/.test(d)) {
      const values = (d.match(/[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi) || []).map(Number);
      const points = [];
      for (let i=0; i+1<values.length; i+=2) points.push([values[i], values[i+1]]);
      if (points.length >= 8 && points.length%2 === 0) {
        const half = points.length/2, top = points.slice(0,half), bottom = points.slice(half).reverse();
        return (u,v) => {
          const q = Math.max(0,Math.min(.999999,u))*(half-1), j = Math.floor(q), a = q-j;
          const x = mix(top[j][0],top[j+1][0],a);
          return [x,mix(mix(top[j][1],top[j+1][1],a),mix(bottom[j][1],bottom[j+1][1],a),v)];
        };
      }
    }
    // Safe fallback for a future curved beam outline: still clipped to supplied d.
    const L = mix(1480,1330,ps.k || 0), droop = ps.droop || 0;
    return (u,v) => [L*u,droop*u*u+(v*2-1)*mix(21,14,u)];
  }
  function fiberD(at, start, end, level, phase, wave, count) {
    let d='';
    for(let j=0;j<=count;j++) {
      const u=mix(start,end,j/count), v=level+.024*Math.sin(u*wave*6.283+phase)+.008*Math.sin(u*33+phase)+.092*Math.exp(-(((u-.35)/.045)**2))*(level<.5?-1:1);
      const p=at(u,v); d+=(j?'L':'M')+num(p[0])+','+num(p[1]);
    }
    return d;
  }

  // Torso-only detail is behind the existing neck, profile, sleeve and shoulder pad.
  const torso = Array.from(body.children).find(n => n.tagName.toLowerCase() === 'path' && n.getAttribute('fill') !== 'none');
  const torsoClip = clip('-coat');
  const clothRoot = group(body, { 'clip-path': torsoClip.url, 'data-material': 'coarse-cloth' });
  if (torso) {
    const afterTex = next(torso);
    before(clothRoot, afterTex && afterTex.getAttribute('fill') === 'url(#pat-weave)' ? next(afterTex) : afterTex);
  }
  // V5 supplies its own solid garment folds; do not stack the old coat shading.
  clothRoot.setAttribute('opacity','0');
  const cloth = group(clothRoot);
  const weave = el('pattern', { id:id+'-weave', patternUnits:'userSpaceOnUse', width:9, height:8 }, DEFS);
  path(weave,{d:'M0,1H5M5,5H9',fill:'none',stroke:'#b2a48b','stroke-width':1.15,opacity:.13});
  path(weave,{d:'M2,3V8M7,0V4',fill:'none',stroke:'#090e11','stroke-width':1.65,opacity:.24});
  el('rect',Object.assign({},live,{x:-270,y:-35,width:540,height:850,fill:`url(#${id}-weave)`,opacity:.28}),cloth);
  // Three tapered, unequal folds, rather than parallel full-length pinstripes.
  [
    ['M-132,32C-197,174 -152,330 -155,610L-148,610C-119,344 -174,177 -117,38Z','#05090d',.23],
    ['M-70,95C-113,227 -35,326 -71,654L-62,649C-8,329 -81,227 -56,105Z','#060c10',.25],
    ['M12,51C-10,159 49,293 10,505L20,508C86,300 18,158 29,72Z','#070d12',.25],
    ['M-140,51C-177,167 -143,318 -145,520L-139,506C-132,302 -163,170 -131,55Z','#a3a194',.09],
    ['M-78,110C-96,222 -30,318 -54,562L-45,548C-21,304 -83,219 -69,114Z','#88939a',.10],
    ['M29,90C8,187 70,299 32,466L41,463C80,304 23,174 37,95Z','#94a5b1',.09],
    ['M-184,249Q-167,202 -134,248L-116,366Q-141,389 -172,357Z','#afa58e',.035],
    ['M-33,309Q4,273 33,338L40,444Q5,462 -30,405Z','#929c9b',.04]
  ].forEach(([d,c,a])=>path(cloth,{d,fill:c,opacity:a}));
  const contact = path(clothRoot,{fill:'none',stroke:'#04080b','stroke-width':17,opacity:.48,'stroke-linecap':'round'});

  // Rifle stock: identify the wood-filled stock, never the sling (first path).
  const rifleInner = Array.from(rifleG.children)[0];
  if (rifleInner) {
    const stock = Array.from(rifleInner.children).find(n => /^url\(#rifle-[\w-]+-w\)$/.test(n.getAttribute('fill') || ''));
    if (stock) {
      const stockClip=clip('-stock',stock.getAttribute('d'));
      const wood=group(rifleInner,{'clip-path':stockClip.url,'data-material':'rifle-stock'});
      const tex=next(stock);
      before(wood,tex && tex.getAttribute('fill')==='url(#pat-wood)' ? next(tex) : tex);
      path(wood,{d:'M10,0C81,13 173,-3 321,7L1035,7',fill:'none',stroke:'#bb8655','stroke-width':24,opacity:.10});
      let dark='',light='';
      for(let i=0;i<11;i++) {
        const y=-48+i*9.4+(R()-.5)*4, yy=y*.27+3, bend=7+R()*11;
        const d=`M4,${num(y)}C83,${num(y+bend)} 173,${num(yy-9)} 306,${num(yy)}S554,${num(yy+3)} ${num(i%3?440+R()*590:1034)},${num(yy+2)}`;
        if(i%3) dark+=d; else light+=d;
      }
      path(wood,{d:dark,fill:'none',stroke:'#1a100b','stroke-width':1.15,opacity:.35});
      path(wood,{d:light,fill:'none',stroke:'#d5a779','stroke-width':.85,opacity:.22});
      path(wood,{d:'M24,49L121,35M31,-43L114,-33M74,49L146,39M732,12L783,12',fill:'none',stroke:'#dfbc90','stroke-width':1.7,opacity:.51,'stroke-linecap':'round'});
    }
    const metalNodes=Array.from(rifleInner.children).filter(n=>/^url\(#rifle-[\w-]+-m\)$/.test(n.getAttribute('fill')||''));
    const metalClip=el('clipPath',{id:id+'-metal',clipPathUnits:'userSpaceOnUse'},DEFS);
    metalNodes.forEach(n=>{
      const shape=n.cloneNode(false);
      ['id','fill','stroke','opacity','filter','style'].forEach(a=>shape.removeAttribute(a));
      shape.setAttribute('data-live','1'); metalClip.appendChild(shape);
    });
    const metal=group(rifleInner,{'clip-path':`url(#${id}-metal)`,'data-material':'blued-steel'});
    before(metal,Array.from(rifleInner.children).find(n=>n.tagName.toLowerCase()==='g'&&n.getAttribute('opacity')==='0'));
    path(metal,{d:'M331,-29H471M489,-25H654M688,-25H821M855,-25H1329M634,-26V17M986,-26V17',fill:'none',stroke:'#dae9f1','stroke-width':1.35,opacity:.79});
    path(metal,{d:'M484,-18H1316M336,-14H478',fill:'none',stroke:'#08121b','stroke-width':5,opacity:.52});
    path(metal,{d:'M516,-22H554M762,-23H794M1188,-24H1277M390,-26H419',fill:'none',stroke:'#b8cddd','stroke-width':2.2,opacity:.60});
    path(metal,{d:'M631,-25V11M982,-25V11M386,24V45',fill:'none',stroke:'#ad8564','stroke-width':1.1,opacity:.40});
  }

  // A few damp regions on masonry, placed below architecture and its haze.
  const brick=Array.from(pastW.children).find(n=>n.getAttribute('fill')==='url(#pat-brick)');
  if (brick) {
    const wall=group(pastW,{'data-material':'damp-masonry'});
    const grit=next(brick);
    before(wall,grit&&grit.getAttribute('fill')==='url(#pat-grit-l)'?next(grit):grit);
    const damp=el('radialGradient',{id:id+'-damp',cx:.5,cy:.5,r:.48},DEFS);
    [[0,'#090d0d',.80],[.50,'#171c1c',.65],[1,'#2b2e2d',0]].forEach(([o,c,a])=>el('stop',{offset:o,'stop-color':c,'stop-opacity':a},damp));
    const wallClip=el('clipPath',{id:id+'-wall',clipPathUnits:'userSpaceOnUse'},DEFS);
    el('rect',{x:-600,y:97,width:3200,height:863},wallClip); wall.setAttribute('clip-path',`url(#${id}-wall)`);
    [[-240,600,285,255],[140,846,190,190],[1440,735,210,260],[1950,520,295,230],[2440,875,250,180]].forEach(([cx,cy,rx,ry])=>{
      for(let k=0;k<3;k++) {
        let d='';
        for(let j=0;j<20;j++) {
          const a=j/20*Math.PI*2,s=.79+R()*.21,x=cx+Math.cos(a)*rx*s*(1-k*.17),y=cy+Math.sin(a)*ry*s*(1-k*.12);
          d+=(j?'L':'M')+num(x)+','+num(y);
        }
        path(wall,{d:d+'Z',fill:`url(#${id}-damp)`,opacity:k===0?.68:.32});
      }
      let streak='';
      for(let j=0;j<7;j++) {
        const x=cx+(R()-.5)*rx*1.2,y=cy-ry*.42+R()*ry*.50;
        streak+=`M${num(x)},${num(y)}q${num(R()*5-2)},${num(24+R()*37)} ${num(R()*9-4)},${num(63+R()*102)}`;
      }
      path(wall,{d:streak,fill:'none',stroke:'#0d1213','stroke-width':2.7,opacity:.19});
    });
  }

  return {
    update({ t, ps, beamD }) {
      // No clocks, new random values, accumulated state, or frame-order dependence.
      if (!ps) return;
      const d=beamD || '';
      beamClip.shape.setAttribute('d',d);
      const at=edges(d,ps), ds=['',''];
      fibers.forEach(f=>ds[f.category]+=fiberD(at,f.start,f.end,f.level,f.phase,f.wave,32));
      grainDark.setAttribute('d',ds[0]); grainLight.setAttribute('d',ds[1]);
      let kd='';
      [[.35,.5,.024,.15],[.73,.62,.015,.12]].forEach(([u,v,rx,ry])=>{for(let ring=0;ring<2;ring++){for(let j=0;j<=20;j++){const a=j/20*6.283185,p=at(u+Math.cos(a)*rx*(1-ring*.42),v+Math.sin(a)*ry*(1-ring*.42));kd+=(j?'L':'M')+num(p[0])+','+num(p[1]);}}});
      knots.setAttribute('d',kd);
      let wear='',splits='';
      scars.forEach((s,i)=>{const q=fiberD(at,s.start,Math.min(.997,s.start+s.length),s.level,s.phase,2,7);if(i%4===0)splits+=q;else wear+=q;});
      grainWear.setAttribute('d',wear);grainCrease.setAttribute('d',splits);
      if(torso)torsoClip.shape.setAttribute('d',torso.getAttribute('d')||'');
      const x=ps.cx,y=ps.cy,hx=ps.hx,hy=ps.hy;
      cloth.setAttribute('transform',`matrix(1 0 ${num((hx-x)/600)} ${num((hy-y)/600)} ${num(x)} ${num(y)})`);
      contact.setAttribute('d',`M${num(x-46)},${num(y+17)}Q${num(x-4)},${num(y+27)} ${num(x+35)},${num(y+19)}`);
      contact.setAttribute('opacity',num(.39+Math.min(1,Math.max(0,ps.h||0))*.14));
    }
  };
}
