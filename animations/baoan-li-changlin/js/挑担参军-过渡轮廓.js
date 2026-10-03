'use strict';
/* V5: authored dark silhouettes based on the approved cloth-headwrap structure
 * drawings. No face features or skin rendering. Source coordinates are local
 * to the shoulder; the prop controls the grip, never the other way around. */
function buildV5Character({body,grip}){
  const path=(p,a={})=>el('path',Object.assign({'data-live':1},a),p),n=r1,P=(x,y)=>`${n(x)},${n(y)}`;
  const dark='#14232d',edge='#7b888c';
  const torso=path(body,{id:'v5-torso',fill:'#37434b'});
  const legs=[path(body,{fill:'#28343d'}),path(body,{fill:'#34414a'})];
  const legFolds=path(body,{fill:'none',stroke:'#718087','stroke-width':2.3,opacity:.43});
  const wraps=[path(body,{fill:'#656f71'}),path(body,{fill:'#707c7e'})];
  const bindings=path(body,{fill:'none',stroke:'#333f47','stroke-width':5,opacity:.78});
  const shoes=[path(body,{fill:'#111e26',stroke:'#63717a','stroke-width':2}),path(body,{fill:'#12212b',stroke:'#74818a','stroke-width':2})];
  const farSleeve=path(body,{fill:'#3d4850'}),farForearm=path(body,{fill:dark}),farCuff=path(body,{fill:'#7a8385'}),farHand=path(body,{fill:dark,stroke:'#60727c','stroke-width':1.6});
  const torsoTex=path(body,{fill:'url(#pat-weave)',opacity:.065});
  const jacketShade=path(body,{fill:'#13212b',opacity:.28}),jacketLight=path(body,{fill:'#758085',opacity:.19});
  const jacketFold=path(body,{fill:'none',stroke:'#879095','stroke-width':2,opacity:.26,'stroke-linejoin':'round'});
  const skirt=path(body,{fill:'#3d494f',stroke:'#68767d','stroke-width':2});
  const waist=path(body,{fill:'#717976',stroke:'#929996','stroke-width':2});
  const waistEnds=path(body,{fill:'#69716e',stroke:'#929994','stroke-width':1.4});
  const army=G(body),placket=path(army,{fill:'#233947',stroke:'#6a7a83','stroke-width':1.7});
  const pockets=[path(army,{fill:'#304957',stroke:'#69808b','stroke-width':1.8}),path(army,{fill:'#2b4352',stroke:'#617884','stroke-width':1.8})];
  const straps=path(army,{fill:'none',stroke:'#74766a','stroke-width':18,'stroke-linejoin':'round'});
  const belt=path(army,{fill:'#454c44',stroke:'#92998a','stroke-width':2});
  const buckle=path(army,{fill:'#263d47',stroke:'#a3ac9e','stroke-width':2.6});
  const neck=path(body,{fill:dark});
  const collar=path(body,{fill:'#7a8485'}),collarShade=path(body,{fill:'#414d55'});
  const head=G(body);
  // One quiet silhouette: no eye, eyebrow, ear, mouth, nostril, cheek plane or skin hue.
  path(head,{d:'M-49,-57C-30,-78 1,-82 25,-65Q47,-48 47,-23L45,-7Q46,4 54,12Q57,19 47,21L43,23Q43,40 32,47Q19,55 6,53L4,76L-40,72L-37,36Q-54,16 -59,-10Q-64,-37 -49,-57Z',fill:dark});
  const rag=G(head);
  path(rag,{d:'M-62,-43L-60,-65L-43,-80L-21,-82L-5,-91L18,-85L34,-75L44,-61L52,-42L46,-29Q8,-47 -21,-31L-55,-20Z',fill:'#6b7474',stroke:'#939c9a','stroke-width':1.6});
  path(rag,{d:'M-60,-49Q-12,-56 31,-78L43,-62Q2,-43 -51,-26L-58,-28Z',fill:'#909794',opacity:.72});
  path(rag,{d:'M-55,-32Q-81,-35 -88,-23L-69,-13L-87,9L-69,19L-49,-16L-40,-9L-36,-27Z',fill:'#6c7472',stroke:'#939b99','stroke-width':1.4});
  path(rag,{d:'M-62,-31L-48,-22M-76,-20L-58,-16M-82,10L-60,-16M-51,-49Q-9,-60 26,-68',fill:'none',stroke:'#414d53','stroke-width':2,opacity:.65});
  const cap=G(head,{id:'v5-side-cap'});
  path(cap,{d:'M-64,-34Q-74,-48 -65,-69L-57,-82Q-44,-88 -30,-88L-11,-94Q10,-94 27,-82Q43,-69 43,-48L44,-38Q10,-41 -14,-34L-57,-23Z',fill:'#3a505f',stroke:'#839399','stroke-width':1.8});
  path(cap,{d:'M-64,-42Q-22,-54 15,-49L44,-45L47,-32Q2,-35 -20,-28L-59,-17Z',fill:'#253e4e',stroke:'#788c95','stroke-width':1.2});
  path(cap,{d:'M25,-42Q49,-46 66,-36L78,-32Q84,-27 72,-25Q53,-24 38,-29L25,-30Z',fill:'#3e5360',stroke:'#81939b','stroke-width':1.5});
  path(cap,{d:'M-47,-81Q-35,-63 -39,-47M-5,-89Q6,-70 4,-49M-52,-37Q-17,-47 25,-40',fill:'none',stroke:'#96a2a4','stroke-width':1.1,opacity:.42});
  const upper=path(body,{fill:'#46535b'}),sleeveShadow=path(body,{fill:'#23323d'}),sleeveLight=path(body,{fill:'#78848a',opacity:.33});
  const foreSleeve=path(body,{fill:'#354e5e'}),forearm=path(body,{fill:dark}),cuff=path(body,{fill:'#7e898a',stroke:'#9aa4a1','stroke-width':1.7});
  const sleeveFolds=path(body,{fill:'none',stroke:'#9ba6a8','stroke-width':2.1,opacity:.51,'stroke-linecap':'round'});
  const shoulderPad=path(body,{fill:'#5d6b70',stroke:'#929e9e','stroke-width':1.6});
  const backHold=G(body,{id:'v5-far-fingers'});
  const hand=G(grip,{id:'v5-gripping-hand'});
  const palm=path(hand,{d:'M-22,-6C-31,2 -30,21 -17,35L-14,56L8,61L18,39Q34,25 34,7L24,-10Q9,-18 -4,-8Z',fill:dark,stroke:'#566e7d','stroke-width':1.2});
  const fingers=Array.from({length:4},(_,i)=>path(backHold,{fill:dark,stroke:'#8c9aa0','stroke-width':1.6,'stroke-linejoin':'round'}));
  const frontFingers=Array.from({length:4},()=>path(hand,{fill:dark,stroke:'#6c808c','stroke-width':1.25,'stroke-linejoin':'round'}));
  const thumb=path(hand,{d:'M-22,25Q-28,15 -25,2L-16,-12Q-10,-18 -6,-12Q-4,-8 -9,0L-14,9Q-10,17 -6,18L-12,30Z',fill:'#1b2d38',stroke:'#6b808d','stroke-width':1.2});
  const strip=(a,b,wa,wb)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),v=[-dy/l,dx/l];return `M${P(a[0]+v[0]*wa,a[1]+v[1]*wa)}Q${P((a[0]+b[0])/2+v[0]*(wa+wb)*.62,(a[1]+b[1])/2+v[1]*(wa+wb)*.62)} ${P(b[0]+v[0]*wb,b[1]+v[1]*wb)}L${P(b[0]-v[0]*wb,b[1]-v[1]*wb)}Q${P((a[0]+b[0])/2-v[0]*(wa+wb)*.5,(a[1]+b[1])/2-v[1]*(wa+wb)*.5)} ${P(a[0]-v[0]*wa,a[1]-v[1]*wa)}Z`;};
  return {update(ps,mt,t){
    const {cx:x,cy:y,hx,hy}=ps,k=ps.k,u=E.io2(prog(t,29.00,29.72)),C=(a,b)=>P(x+a,y+b),H=(a,b)=>P(hx+a,hy+b);
    const cloth=mixHex('#3d474e','#2e4758',u);
    const td=`M${C(-34,-7)}Q${C(-74,4)} ${C(-100,65)}L${C(-179,213)}Q${C(-130,253)} ${H(-78,0)}L${H(84,10)}Q${C(109,170)} ${C(103,87)}Q${C(87,26)} ${C(53,2)}Q${C(13,-17)} ${C(-34,-7)}Z`;
    torso.setAttribute('d',td);torso.setAttribute('fill',cloth);torsoTex.setAttribute('d',td);
    const w=ps.walk*5,backK=[hx-91-w,hy+137],frontK=[hx+99+w,hy+147],backA=[hx-150-w,hy+269],frontA=[hx+156+w,hy+285];
    legs[0].setAttribute('d',`M${H(-70,-6)}Q${H(-111,54)} ${P(backK[0]-68,backK[1]-16)}Q${P(backK[0]-86,backK[1]+18)} ${P(backK[0]-46,backK[1]+64)}L${P(backA[0]-35,backA[1]-25)}Q${P(backA[0]+1,backA[1]-10)} ${P(backA[0]+37,backA[1]-23)}L${P(backK[0]+40,backK[1]+62)}Q${P(backK[0]+65,backK[1]+13)} ${P(backK[0]+45,backK[1]-24)}L${H(34,7)}Z`);
    legs[1].setAttribute('d',`M${H(-4,8)}L${H(79,0)}Q${H(123,66)} ${P(frontK[0]+54,frontK[1]-18)}Q${P(frontK[0]+78,frontK[1]+24)} ${P(frontK[0]+44,frontK[1]+64)}L${P(frontA[0]+37,frontA[1]-24)}Q${P(frontA[0]+4,frontA[1]-10)} ${P(frontA[0]-33,frontA[1]-20)}L${P(frontK[0]-52,frontK[1]+65)}Q${P(frontK[0]-72,frontK[1]+34)} ${P(frontK[0]-55,frontK[1]-7)}Q${H(35,83)} ${H(-4,8)}Z`);
    legs[0].setAttribute('fill',mixHex('#28353e','#233a4a',u));legs[1].setAttribute('fill',mixHex('#34414b','#2c4557',u));
    legFolds.setAttribute('d',`M${H(-14,16)}Q${H(-54,90)} ${P(backK[0]-26,backK[1]-15)}M${H(40,23)}Q${H(35,107)} ${P(frontK[0]+23,frontK[1]-17)}M${P(frontK[0]-29,frontK[1]+6)}L${P(frontA[0]-13,frontA[1]-9)}`);
    [backA,frontA].forEach((a,i)=>{wraps[i].setAttribute('d',`M${P(a[0]-29,a[1]-38)}L${P(a[0]+25,a[1]-36)}L${P(a[0]+24,a[1]+31)}L${P(a[0]-23,a[1]+28)}Z`);shoes[i].setAttribute('d',`M${P(a[0]-25,a[1]+23)}Q${P(a[0]+5,a[1]+35)} ${P(a[0]+28,a[1]+25)}L${P(a[0]+56,a[1]+39)}Q${P(a[0]+89,a[1]+42)} ${P(a[0]+89,a[1]+56)}Q${P(a[0]+27,a[1]+73)} ${P(a[0]-39,a[1]+57)}L${P(a[0]-34,a[1]+35)}Z`);});
    bindings.setAttribute('d',[backA,frontA].map(a=>[-24,-5,14].map(z=>`M${P(a[0]-26,a[1]+z)}L${P(a[0]+24,a[1]+z+7)}`).join('')).join(''));
    const fa=[x-96,y+86],fe=[x-167,y+237],fw=[hx-128,hy+93];
    farSleeve.setAttribute('d',strip(fa,fe,44,38));farSleeve.setAttribute('fill',cloth);farForearm.setAttribute('d',strip(fe,fw,19,12));farCuff.setAttribute('d',strip([fe[0]+5,fe[1]-14],[fe[0]-4,fe[1]+14],43,41));
    farHand.setAttribute('d',`M${P(fw[0]-12,fw[1]-4)}Q${P(fw[0]-26,fw[1]+20)} ${P(fw[0]-21,fw[1]+41)}L${P(fw[0]-14,fw[1]+51)}Q${P(fw[0]-9,fw[1]+51)} ${P(fw[0]-13,fw[1]+32)}L${P(fw[0]-6,fw[1]+58)}Q${P(fw[0]+1,fw[1]+61)} ${P(fw[0]-1,fw[1]+36)}L${P(fw[0]+5,fw[1]+59)}Q${P(fw[0]+12,fw[1]+62)} ${P(fw[0]+10,fw[1]+35)}L${P(fw[0]+16,fw[1]+48)}Q${P(fw[0]+24,fw[1]+46)} ${P(fw[0]+18,fw[1]+25)}L${P(fw[0]+12,fw[1]+3)}Z`);
    jacketShade.setAttribute('d',`M${C(-33,29)}Q${C(-46,90)} ${C(18,185)}L${H(33,-4)}L${H(-8,-15)}Q${C(-88,94)} ${C(-33,29)}ZM${C(-105,98)}L${C(-156,211)}L${H(-33,-3)}Q${C(-102,197)} ${C(-105,98)}Z`);
    jacketLight.setAttribute('d',`M${C(-37,3)}Q${C(-71,35)} ${C(-85,110)}L${C(-105,180)}L${C(-79,199)}Q${C(-51,88)} ${C(-18,30)}ZM${C(-55,113)}Q${C(-10,188)} ${H(23,-25)}L${H(1,-28)}Q${C(-58,175)} ${C(-55,113)}Z`);
    jacketFold.setAttribute('d',`M${C(-34,19)}Q${C(-64,86)} ${C(-47,130)}L${H(24,-28)}M${C(-88,142)}Q${C(-61,204)} ${H(-25,-33)}M${C(55,90)}Q${C(38,161)} ${H(42,-19)}`);
    skirt.setAttribute('d',`M${H(-80,-15)}L${H(72,-13)}L${H(91,54)}L${H(18,65)}L${H(5,23)}L${H(-2,65)}L${H(-105,56)}Z`);skirt.setAttribute('fill',cloth);
    waist.setAttribute('d',`M${H(-82,-21)}Q${H(-4,-5)} ${H(73,-20)}L${H(76,7)}Q${H(-3,24)} ${H(-88,5)}Z`);vis(waist,1-u);
    waistEnds.setAttribute('d',`M${H(-9,-6)}Q${H(14,-13)} ${H(19,4)}L${H(33,111)}L${H(8,98)}L${H(-1,18)}L${H(-35,74)}L${H(-50,57)}Z`);vis(waistEnds,1-u);
    placket.setAttribute('d',`M${C(27,32)}L${H(17,18)}L${H(34,17)}L${C(43,30)}Z`);
    pockets.forEach((p,i)=>{const a=i?26:-80;p.setAttribute('d',`M${C(a,121)}L${C(a+73,124)}L${C(a+68,199)}Q${C(a+33,214)} ${C(a-4,193)}ZM${C(a-2,120)}L${C(a+75,123)}L${C(a+68,147)}L${C(a+31,156)}L${C(a-3,141)}Z`);});
    straps.setAttribute('d',`M${C(-34,8)}Q${C(22,112)} ${H(67,-3)}M${C(59,26)}Q${C(-2,138)} ${H(-64,0)}`);
    belt.setAttribute('d',`M${H(-83,-16)}Q${H(-5,-3)} ${H(74,-17)}L${H(76,11)}Q${H(1,23)} ${H(-87,9)}Z`);buckle.setAttribute('d',`M${H(-13,0)}L${H(17,0)}L${H(17,21)}L${H(-13,21)}Z`);vis(army,u);
    const hm=M.chain(M.t(ps.headX,ps.headY),M.r(ps.headAngle*DEG)),nl=M.ap(hm,-36,60),nr=M.ap(hm,4,64);
    neck.setAttribute('d',`M${P(...nl)}L${P(...nr)}L${C(63,5)}L${C(-2,2)}Z`);
    collar.setAttribute('d',`M${C(-27,-12)}Q${C(3,-9)} ${C(26,3)}L${C(55,28)}L${C(41,46)}Q${C(7,17)} ${C(-37,10)}Z`);
    collarShade.setAttribute('d',`M${C(-21,3)}Q${C(11,8)} ${C(40,31)}L${C(44,43)}Q${C(8,20)} ${C(-32,13)}Z`);
    head.setAttribute('transform',`translate(${n(ps.headX)},${n(ps.headY)}) rotate(${n(ps.headAngle)})`);vis(rag,1-u);vis(cap,u);
    const hlocal=[lerp(245,190,k),lerp(ps.droop*(245/740)**2,8,k)],hp=M.ap(mt,...hlocal),ha=ps.ang,handMatrix=M.chain(M.t(...hp),M.r(ha));
    const handTransform=`translate(${P(...hp)}) rotate(${n(ha/DEG)})`;
    hand.setAttribute('transform',handTransform);backHold.setAttribute('transform',handTransform);
    const half=lerp(16,22,k);
    // Far fingers cross the upper edge, then disappear behind the actual wood.
    // Only palm heel and the opposed near thumb sit in front of its lower edge.
    fingers.forEach((finger,i)=>{const xx=-21+i*13,yy=-(half-16)+[5,0,1,6][i];finger.setAttribute('d','M-5,25L-8,-10Q-8,-23 0,-27Q8,-31 13,-24Q17,-17 11,-9L7,-2L7,25Z');finger.setAttribute('transform',`translate(${xx},${yy}) rotate(${4+i*2})`);});
    frontFingers.forEach((finger,i)=>{const xx=-21+i*13,yy=[4,0,0,4][i];finger.setAttribute('d',`M-6,${half-5}L-9,${-half+3}Q-10,${-half-9} -2,${-half-12}Q7,${-half-14} 10,${-half-4}L6,${half-6}Q5,${half+3} -2,${half+4}Z`);finger.setAttribute('transform',`translate(${xx},${yy}) rotate(${4+i*2})`);});
    palm.setAttribute('d',`M-23,${half-7}Q-30,${half+6} -17,${half+23}L-14,${half+41}L8,${half+46}L17,${half+23}Q32,${half+6} 29,${half-6}Q4,${half+1} -23,${half-7}Z`);
    thumb.setAttribute('d',`M-20,${half+21}C-30,${half+9} -30,${half-4} -22,${half-12}Q-15,${half-19} -10,${half-12}Q-6,${half-7} -12,${half}L-14,${half+8}Q-5,${half+13} 4,${half+12}L4,${half+23}Q-9,${half+29} -20,${half+21}Z`);
    const wrist=M.ap(handMatrix,-1,half+39),S=[x+2,y+43],ep=[ps.elbowX,ps.elbowY],v=[wrist[0]-ep[0],wrist[1]-ep[1]],len=Math.hypot(...v),f=[v[0]/len,v[1]/len],c=[lerp(ep[0]+f[0]*9,wrist[0]-f[0]*25,u),lerp(ep[1]+f[1]*9,wrist[1]-f[1]*25,u)];
    upper.setAttribute('d',strip(S,ep,53,39));upper.setAttribute('fill',mixHex('#48575e','#3d5868',u));
    sleeveShadow.setAttribute('d',`M${P(S[0]-29,S[1]+5)}Q${P(ep[0]-35,ep[1]-13)} ${P(ep[0]-19,ep[1]+23)}L${P(ep[0]+6,ep[1]+18)}Q${P(S[0]-15,S[1]+47)} ${P(S[0]-29,S[1]+5)}Z`);
    sleeveLight.setAttribute('d',`M${P(S[0]+22,S[1]-24)}Q${P(ep[0]+31,ep[1]-62)} ${P(ep[0]+38,ep[1]-5)}L${P(ep[0]+22,ep[1]+5)}Q${P(ep[0]+13,ep[1]-65)} ${P(S[0]+10,S[1]-18)}Z`);
    forearm.setAttribute('d',strip(c,wrist,22,13));foreSleeve.setAttribute('d',strip(ep,c,28,23));vis(foreSleeve,u);
    cuff.setAttribute('d',strip([c[0]-f[0]*13,c[1]-f[1]*13],[c[0]+f[0]*13,c[1]+f[1]*13],41,38));
    sleeveFolds.setAttribute('d',`M${P(S[0]-15,S[1]-20)}Q${P(S[0]+15,S[1]+15)} ${P(ep[0]+18,ep[1]-40)}M${P(ep[0]-20,ep[1]-21)}Q${P(ep[0]+1,ep[1]-10)} ${P(ep[0]+26,ep[1]-14)}M${P(ep[0]-14,ep[1]+12)}L${P(ep[0]+22,ep[1]+5)}`);
    shoulderPad.setAttribute('d',`M${C(-34,-9)}Q${C(-5,-22)} ${C(33,-7)}L${C(35,12)}Q${C(0,4)} ${C(-34,13)}Z`);vis(shoulderPad,1-u);
    window.__v5Last={t,uniform:u,shoulder:[x,y],armShoulder:S,elbow:ep,wrist,hand:hp,handPropLocal:hlocal,head:[ps.headX,ps.headY],headAngle:ps.headAngle,faceFeatures:0};
  }};
}

function buildV5Whip(root,carry){
  const g=G(root,{id:'v5-continuous-whip'});g.remove();root.insertBefore(g,carry);
  const shadow=el('path',{fill:'none',stroke:'#101820','stroke-width':12,'stroke-linecap':'round'},g);
  const lash=el('path',{fill:'none',stroke:'#748087','stroke-width':5.2,'stroke-linecap':'round'},g);
  const arm=G(root,{id:'v5-whip-arm'});
  el('path',{d:'M-690,-68L-91,-50L-31,-31L-27,37L-91,57L-690,90Z',fill:'#2e3c45',stroke:'#7a868a','stroke-width':2},arm);
  el('path',{d:'M-136,-42L-99,53M-121,-38L-81,48',fill:'none',stroke:'#58666c','stroke-width':7},arm);
  el('path',{d:'M-54,-28Q-29,-39 -9,-25L15,-19L24,13L4,37Q-18,48 -39,29L-63,20Z',fill:'#14242e',stroke:'#829098','stroke-width':1.8},arm);
  el('path',{d:'M-2,-10L93,-8L104,0L91,9L-2,10Z',fill:'#796348',stroke:'#a28c6c','stroke-width':1.6},arm);
  el('path',{d:'M-28,-21Q-10,-27 -5,-9L-9,12Q-18,18 -22,11ZM-10,-19Q6,-25 11,-9L8,13Q0,20 -5,10Z',fill:'#172b36',stroke:'#7e8f96','stroke-width':1.8},arm);
  return {update(t,ps){
    let opacity=0,dd=0;
    [26.95,28.02].forEach(h=>{const a=env(t,h-.52,h-.39,h+.22,h+.46);if(a>opacity){opacity=a;dd=t-h;}});
    const d=dd,wrist=[kf(d,[[-.52,8],[-.27,98],[0,149,E.io2],[.12,149],[.40,76,E.io2]]),kf(d,[[-.52,228],[-.28,192],[0,258,E.io2],[.12,258],[.40,204,E.io2]])];
    const angle=kf(d,[[-.52,-39],[-.26,-34],[0,4,E.in2],[.12,4],[.40,-19,E.io2]]),a=angle*DEG,tip=[wrist[0]+Math.cos(a)*103,wrist[1]+Math.sin(a)*103];
    const target=[ps.cx-111,ps.cy+103],turn=E.io3(prog(d,-.22,.015)),recover=E.io2(prog(d,.14,.43));
    const end=[lerp(lerp(ps.cx+90,target[0],turn),ps.cx-84,recover),lerp(lerp(ps.cy-110,target[1],turn),ps.cy-132,recover)];
    const c1=[lerp(383,392,turn),lerp(15,203,turn)],c2=[lerp(ps.cx+265,ps.cx-128,turn),lerp(ps.cy-311,ps.cy-78,turn)];
    c1[1]=lerp(c1[1],280,recover);c2[1]=lerp(c2[1],148,recover);
    const pd=`M${r1(tip[0])},${r1(tip[1])}C${r1(c1[0])},${r1(c1[1])} ${r1(c2[0])},${r1(c2[1])} ${r1(end[0])},${r1(end[1])}`;
    shadow.setAttribute('d',pd);lash.setAttribute('d',pd);vis(g,opacity);arm.setAttribute('transform',`translate(${r1(wrist[0])},${r1(wrist[1])}) rotate(${r1(angle)})`);vis(arm,opacity);
    window.__v5WhipLast={t,opacity,hand:wrist,handleTip:tip,tip:end,backTarget:target,impactBlend:turn*(1-recover)};
  }};
}
