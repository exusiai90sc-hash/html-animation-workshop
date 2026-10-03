'use strict';
/* Actual geographic route → camera yaw around its live red endpoint → independent painted planes.
 * Resource commits are atomic for arbitrary asynchronous seeks; no canvas pixel readback is required. */
function buildAbstractFinal(L) {
 const s=addScene({name:'FinalSequence',t0:0,t1:T.END+1,roots:[L.terrain]});
 const terrain=el('image',{id:'terrain-frame',x:0,y:0,width:W,height:H,preserveAspectRatio:'none'},L.terrain);
 const paper=document.getElementById('paper-visual'),px=paper.getContext('2d');
 const plane=makeCanvas(1280,720),pctx=plane.getContext('2d'),planeMask=makeCanvas(1280,720),mctx=planeMask.getContext('2d'),projected=makeCanvas(1280,720),projectedCtx=projected.getContext('2d');
 let exposureMap=null;const exposureImage=mctx.createImageData(1280,720);
 const FPS=24,LAST=336,REVEAL_START=52.10,REVEAL_END=54.00;
 const indexAt=t=>Math.max(0,Math.min(LAST,Math.round((t-40)*FPS)));
 const fileAt=t=>'images/terrain/f'+String(indexAt(t)).padStart(4,'0')+'.webp';
 const images=new Map();let visual=null,paintedAssets=null,prepareTicket=0,currentTerrain='',lastDiagnostic=null;
 const loadImage=h=>{
  if(images.has(h))return images.get(h);
  const promise=new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('素材未能解码：'+h.slice(0,100)));im.src=h;});
  images.set(h,promise);if(images.size>14)images.delete(images.keys().next().value);return promise;
 };
 const ready=Promise.all(Object.entries(FINAL_LAYER_ASSETS).map(async([key,uri])=>[key,await loadImage(uri)])).then(async entries=>{paintedAssets=Object.fromEntries(entries);visual=LayeredFinale.createLayeredScene({assets:paintedAssets,createCanvas:makeCanvas,makeStaticImage:window.__makeStaticImage});if(visual.ready)await visual.ready;if(window.__waitStaticImages)await window.__waitStaticImages();});
 async function prepareAt(t){
  const ticket=++prepareTicket;await ready;if(ticket!==prepareTicket)return false;
  if(t<38.55||t>REVEAL_END)return true;
  const h=fileAt(t);await loadImage(h);if(ticket!==prepareTicket)return false;
  if(terrain.getAttribute('href')!==h)terrain.setAttribute('href',h);currentTerrain=h;return true;
 }
 const ease=(a,b,t)=>{const p=Math.max(0,Math.min(1,(t-a)/(b-a)));return p*p*(3-2*p);};
 const metaAt=t=>{const all=typeof ROUTE_CAMERA!=='undefined'?(ROUTE_CAMERA.frames||ROUTE_CAMERA):[];if(!all.length)return null;const exact=all[indexAt(t)];return exact&&Math.abs(exact.time-t)<1/FPS?exact:all.reduce((a,b)=>Math.abs(b.time-t)<Math.abs(a.time-t)?b:a);};
 function continuousHead(t,meta,anchor,tangent){
  if(t<40.72||t>53.30)return;
  const alpha=1-ease(53.05,53.30,t);if(alpha<=0)return;
  const x=anchor[0]*1280,y=anchor[1]*720,angle=Math.atan2(tangent[1],tangent[0]);
  const size=43;
  px.save();px.globalAlpha=alpha;px.translate(x,y);px.rotate(angle);
  px.fillStyle='#ca3823';
  px.beginPath();px.moveTo(size*.42,0);px.lineTo(-size*.62,21);px.lineTo(-size*.62,-21);px.closePath();px.fill();px.restore();
 }
 // The terrain contains its own head and short tail. Reveal only the matching
 // painted patch as the overlay head retires, so no baked red shape is left behind.
 // This changes the exposure alpha, never the painted fine red path itself.
 function coverBakedArrow(bits,t,meta){
  const fade=ease(53.05,53.30,t);if(fade<=0||!meta)return;
  const tail=(meta.redTailScreen||[]).map(p=>[p[0]*1280,p[1]*720]);
  const anchor=[meta.anchor[0]*1280,meta.anchor[1]*720],dir=meta.screenTangent;
  if(tail.length>1){const a=tail[0],b=tail[tail.length-1];tail.unshift([a[0]-.70*(b[0]-a[0]),a[1]-.70*(b[1]-a[1])]);}
  const segments=[];
  for(let i=1;i<tail.length;i++)segments.push([tail[i-1],tail[i],17]);
  segments.push([[anchor[0]-dir[0]*24,anchor[1]-dir[1]*24],[anchor[0]+dir[0]*19,anchor[1]+dir[1]*19],24]);
  const feather=12,points=segments.flatMap(s=>[s[0],s[1]]);
  const x0=Math.max(0,Math.floor(Math.min(...points.map(p=>p[0]))-36)),x1=Math.min(1279,Math.ceil(Math.max(...points.map(p=>p[0]))+36));
  const y0=Math.max(0,Math.floor(Math.min(...points.map(p=>p[1]))-36)),y1=Math.min(719,Math.ceil(Math.max(...points.map(p=>p[1]))+36));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
   let weight=0;
   for(const [a,b,r] of segments){const dx=b[0]-a[0],dy=b[1]-a[1],u=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));const d=Math.hypot(x-a[0]-u*dx,y-a[1]-u*dy);weight=Math.max(weight,1-ease(r,r+feather,d));}
   if(weight>0){const j=(y*1280+x)*4+3;bits[j]=Math.round(bits[j]+(255-bits[j])*fade*weight);}
  }
 }
 const battleSchedule={qinggangpo:{time:40.95,duration:1.8},loushanguan_zunyi:{time:45.25,duration:1.70},lubanchang:{time:47.35,duration:1.55}};
 const smokeCells=[{x:0,y:0,w:887,h:500,base:458},{x:887,y:0,w:887,h:500,base:458},{x:0,y:500,w:887,h:387,base:297},{x:887,y:500,w:887,h:387,base:297}];
 function terrainBattles(t){
  if(!paintedAssets||t<40.7||t>50.1)return;
  const meta=metaAt(t);if(!meta?.battles)return;
  for(const [id,spec] of Object.entries(battleSchedule)){
   const battle=meta.battles[id],age=t-spec.time;
   if(!battle?.visible||battle.occluded||age<0||age>spec.duration+1.1)continue;
   const u=Math.max(0,Math.min(.999999,age/spec.duration)),k=u<.13?0:u<.40?1:u<.73?2:3;
   const bounds=[0,.13,.40,.73,1],local=(u-bounds[k])/(bounds[k+1]-bounds[k]),blend=ease(.45,1,local),size=145*(1+.07*u);
   const alpha=ease(0,.12,age)*(1-ease(spec.duration-.1,spec.duration+1.1,age))*.88;
   const x=battle.anchor[0]*1280-size*.5-12*u,y=battle.anchor[1]*720-8*u;
   for(const [frame,weight] of [[k,1-blend],[Math.min(3,k+1),blend]]){if(weight<.001)continue;const cell=smokeCells[frame];px.save();px.globalAlpha=alpha*weight;px.drawImage(visual.smokeAtlas||paintedAssets.smoke,cell.x,cell.y,cell.w,cell.h,x,y-cell.base/cell.w*size,size,cell.h/cell.w*size);px.restore();}
   if(visual.warmAtlas){const flash=Math.max(...[.16,.66,1.17,1.64].map(p=>Math.exp(-Math.pow((age-p)/.08,2)))),cell=smokeCells[Math.min(k,2)];if(flash>.005){px.save();px.globalCompositeOperation='screen';px.globalAlpha=flash*.98;px.drawImage(visual.warmAtlas,cell.x,cell.y,cell.w,cell.h,x,y-cell.base/cell.w*size,size,cell.h/cell.w*size);px.restore();}}
  }
 }
 s.update=t=>{
  px.setTransform(1,0,0,1,0,0);px.globalCompositeOperation='source-over';px.globalAlpha=1;px.clearRect(0,0,paper.width,paper.height);
  L.terrain.style.display=t>=38.55&&t<=REVEAL_END?'':'none';L.terrain.setAttribute('opacity',E.sine(prog(t,38.62,39.05)).toFixed(4));
  if(t>=38.55){L.s8.style.display='none';L.flame.style.display='none';if(t<=REVEAL_END){const h=fileAt(t);if(terrain.getAttribute('href')!==h)terrain.setAttribute('href',h)}else terrain.removeAttribute('href');if(t>=40){POST.flash=0;POST.shake=[0,0];}}
  terrainBattles(t);if(t<REVEAL_START||!visual){const camera=metaAt(t);if(camera)continuousHead(t,camera,camera.anchor,camera.screenTangent);return;}
  const qt=Math.floor(t*24+1e-7)/24,meta=metaAt(t),last=metaAt(54);
  const settle=ease(51.6,54,t),anchor=meta?.anchor||[.37,.50],tangent=meta?.screenTangent||[.991,.134];
  // Yaw comes from the actual 3D camera; the same turn projects every paper depth.
  let yaw=meta&&last&&Number.isFinite(meta.cameraYaw)&&Number.isFinite(last.cameraYaw)?(meta.cameraYaw-last.cameraYaw)*Math.PI/180:-.34*(1-settle);
  if(Math.abs(yaw)>Math.PI*2)yaw*=Math.PI/180;while(yaw>Math.PI)yaw-=Math.PI*2;while(yaw<-Math.PI)yaw+=Math.PI*2;yaw=Math.max(-.50,Math.min(.50,yaw));
  if(t>=REVEAL_END){visual.renderAt(qt,paper,{noCamera:true});}
  else{
   projectedCtx.setTransform(1,0,0,1,0,0);projectedCtx.clearRect(0,0,1280,720);
   // A continuous background is projected without exposed cut-strip edges.
   // Figures, authored gait cells, and evolving smoke are still recomposed
   // independently at this time sample inside LayeredFinale.
   visual.renderAt(qt,plane,{noCamera:true});
   RoutePaperProjection.project(plane,projectedCtx,{anchor,sourceAnchor:[.37,.50],yaw,depth:0,alpha:1});
   if(!exposureMap){
    exposureMap=new Float32Array(1280*720*2);const paths=visual.paths,ridge=visual.ridgeY,iw=visual.sourceSize[0],ih=visual.sourceSize[1];
    for(let x=0;x<1280;x++){const sx=x/1280*iw,far=ridge(paths.far,sx)/ih*720,march=ridge(paths.march,sx)/ih*720,ground=ridge(paths.ground,sx)/ih*720,near=ridge(paths.near,sx)/ih*720;
     for(let y=0;y<720;y++){const i=(y*1280+x)*2;let onset=52.1+.15*ease(Math.min(far,march)-22,Math.min(far,march)+22,y)+.22*ease(march-24,march+24,y)+.24*ease(ground-28,ground+28,y)+.20*ease(near-24,near+24,y);
      const warm=Math.exp(-(((x/1280-.77)/.31)**2+((y/720-.59)/.20)**2));onset-=.35*warm;
      exposureMap[i]=onset;exposureMap[i+1]=Math.min(.92,54-onset);
     }
    }
   }
   const bits=exposureImage.data;for(let i=0,j=0;i<1280*720;i++,j+=4){bits[j]=bits[j+1]=bits[j+2]=255;bits[j+3]=Math.round(255*ease(exposureMap[i*2],exposureMap[i*2]+exposureMap[i*2+1],t));}
   coverBakedArrow(bits,t,meta);
   mctx.setTransform(1,0,0,1,0,0);mctx.putImageData(exposureImage,0,0);projectedCtx.save();projectedCtx.globalCompositeOperation='destination-in';projectedCtx.drawImage(planeMask,0,0);projectedCtx.restore();px.drawImage(projected,0,0);
  }
  continuousHead(t,meta,anchor,tangent);POST.vig=1-.30*E.sine(prog(t,52.85,54.0));
  lastDiagnostic={t,terrainIndex:indexAt(t),terrainHref:currentTerrain,anchor,tangent,yaw,settle,layered:t>=REVEAL_END,exposureMethod:'spatial depth field with continuous background',projectionMethod:'inverse homography'};
 };
 window.FINAL_SEQUENCE={ready,prepareAt,terrainFileAt:fileAt,reveal:[REVEAL_START,REVEAL_END],fps:FPS,metadataAt:metaAt,diagnostic:()=>lastDiagnostic};return s;
}
