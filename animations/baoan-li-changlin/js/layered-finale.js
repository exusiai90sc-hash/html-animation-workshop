/* Independent painted-paper finale. Every visible figure/smoke pixel comes from a supplied RGBA asset.
   No whole-image mesh deformation, procedural fireball, ring, or generated figure geometry is used. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.LayeredFinale=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const W=1672,H=941,START=51.6,END=60.505;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const PATHS={
 far:[[0,205],[205,248],[321,248],[391,235],[459,207],[512,217],[580,230],[664,246],[748,265],[874,281],[930,263],[978,249],[1045,234],[1097,243],[1150,274],[1205,301],[1289,282],[1378,300],[1450,304],[1518,294],[1593,268],[1672,244]],
 march:[[0,145],[44,161],[82,180],[131,198],[180,211],[228,225],[274,236],[321,248],[367,259],[399,263],[431,259],[478,284],[521,301],[579,317],[643,312],[727,310],[800,335],[879,356],[926,369],[975,364],[1019,357],[1080,368],[1158,393],[1239,417],[1316,441],[1367,434],[1419,415],[1472,400],[1515,387],[1571,374],[1618,367],[1672,350]],
 ground:[[0,457],[38,460],[86,482],[133,520],[184,500],[236,475],[290,458],[342,445],[396,432],[453,439],[508,454],[565,463],[627,478],[650,493],[676,527],[692,568],[715,593],[749,618],[795,641],[845,660],[899,679],[947,699],[992,718],[1040,746],[1088,766],[1144,775],[1212,773],[1283,766],[1347,756],[1407,745],[1464,726],[1519,701],[1576,691],[1625,681],[1672,685]],
 near:[[0,589],[45,600],[91,635],[149,673],[203,690],[258,690],[305,666],[349,650],[400,653],[453,677],[506,712],[550,750],[591,767],[642,787],[699,794],[747,797],[799,837],[851,856],[898,889],[957,915],[1013,887],[1072,861],[1132,835],[1190,805],[1248,787],[1318,786],[1383,795],[1450,807],[1518,830],[1596,847],[1672,855]]
};
function ridgeY(path,x){for(let i=1;i<path.length;i++){if(x<=path[i][0])return lerp(path[i-1][1],path[i][1],(x-path[i-1][0])/(path[i][0]-path[i-1][0]));}return path[path.length-1][1]}
function polygon(ctx,path){ctx.beginPath();ctx.moveTo(path[0][0],path[0][1]);for(let i=1;i<path.length;i++)ctx.lineTo(path[i][0],path[i][1]);ctx.lineTo(W+50,H+50);ctx.lineTo(-50,H+50);ctx.closePath()}
function makeDefaultCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function createLayeredScene(opts){
 opts=opts||{};const assets=opts.assets||opts,makeCanvas=opts.createCanvas||makeDefaultCanvas,readiness=[];const stable=c=>{const result=opts.makeStaticImage?opts.makeStaticImage(c):c;if(result&&typeof result.decode==='function')readiness.push(result.decode());return result;};
 for(const k of ['background','villagers','smoke','march'])if(!assets[k])throw Error('Missing real painted asset: '+k);
 const tonedSmoke=makeCanvas(assets.smoke.width,assets.smoke.height),tone=tonedSmoke.getContext('2d');tone.drawImage(assets.smoke,0,0);
 const warmSmoke=makeCanvas(tonedSmoke.width,tonedSmoke.height),wc=warmSmoke.getContext('2d'),warmPixels=wc.createImageData(warmSmoke.width,warmSmoke.height);
 const tonedPixels=tone.getImageData(0,0,tonedSmoke.width,tonedSmoke.height);for(let i=0;i<tonedPixels.data.length;i+=4){const p=tonedPixels.data,r=p[i],g=p[i+1],b=p[i+2],warm=clamp((r-b-8)/65,0,1)*clamp((r-g)/30,0,1);const q=warmPixels.data;q[i]=255;q[i+1]=137;q[i+2]=72;q[i+3]=Math.round(p[i+3]*warm*clamp((r-60)/100,0,1));p[i]=Math.round(r*lerp(.64,.98,warm));p[i+1]=Math.round(g*lerp(.56,.93,warm));p[i+2]=Math.round(b*lerp(.72,.84,warm));}tone.putImageData(tonedPixels,0,0);wc.putImageData(warmPixels,0,0);
 const tonedMarch=makeCanvas(assets.march.width,assets.march.height),mc=tonedMarch.getContext('2d');mc.drawImage(assets.march,0,0);mc.globalCompositeOperation='source-atop';mc.fillStyle='rgba(18,18,30,.46)';mc.fillRect(0,0,tonedMarch.width,tonedMarch.height);mc.globalCompositeOperation='source-over';
 const backing=makeCanvas(W,H);backing.getContext('2d').drawImage(assets.background,0,0,W,H);
 const terrain={};
 for(const name of ['far','march','ground','near']){const c=makeCanvas(W,H),cx=c.getContext('2d');cx.save();polygon(cx,PATHS[name]);cx.clip();cx.drawImage(assets.background,0,0,W,H);cx.restore();terrain[name]=stable(c);}
 const registeredVillagers=makeCanvas(W,H),vc=registeredVillagers.getContext('2d');vc.drawImage(assets.villagers,595.35,287.0,assets.villagers.width*.6263,assets.villagers.height*.6263);
 const crowds=[];for(const [x0,x1] of [[0,1000],[1000,1338],[1338,W]]){const c=makeCanvas(W,H),cx=c.getContext('2d');cx.drawImage(registeredVillagers,x0,0,x1-x0,H,x0,0,x1-x0,H);crowds.push(stable(c))}
 const staticBacking=stable(backing),staticSmoke=stable(tonedSmoke),staticMarch=stable(tonedMarch),staticWarm=stable(warmSmoke);
 const smokeCols=opts.smokeColumns||2,smokeRows=opts.smokeRows||2,smokeW=assets.smoke.width/smokeCols,smokeH=assets.smoke.height/smokeRows;
 const marchW=assets.march.width/4,marchH=assets.march.height;
 const footPoints=opts.footPoints||[{x:272/543,y:668/724},{x:272/543,y:668/724},{x:272/543,y:668/724},{x:272/543,y:668/724}];
 const smokeCells=opts.smokeRects||[{x:0,y:0,w:887,h:500,baseline:458},{x:887,y:0,w:887,h:500,baseline:458},{x:0,y:500,w:887,h:387,baseline:297},{x:887,y:500,w:887,h:387,baseline:297}];
 const smokeSites=[
  {id:'distant-battery',x:644,y:247,width:440,height:470,startsAt:52.3,duration:4.0,opacity:.78,depth:'far'},
  {id:'ridge-battery',x:260,y:239,width:600,height:540,startsAt:53.4,duration:4.3,opacity:.98,depth:'march'},
  {id:'lower-battery',x:535,y:305,width:500,height:500,startsAt:55.6,duration:4.1,opacity:.91,depth:'march'},
  {id:'near-battery',x:90,y:493,width:380,height:440,startsAt:57.8,duration:3.9,opacity:.88,depth:'ground'}
 ];
 const unitXs=[-10,45,100,155,210,265,320],unitHeights=[37,40,38,42,40,44,43];
 const inventory=[{id:'paper-underpaint',source:opts.backgroundName||'clean-background-v2.png',alpha:'opaque backing for disocclusion'},...Object.keys(terrain).map(k=>({id:k+'-mountain',source:opts.backgroundName||'clean-background-v2.png',alpha:'explicit ridge polygon; source pixels retained'})),...crowds.map((_,i)=>({id:'villager-group-'+i,source:'villagers-transparent-v2.png',alpha:'original imagegen alpha, cut at empty group gaps'})),...smokeSites.map(site=>({id:site.id,source:opts.smokeName||'battle-smoke-atlas-v3.png',alpha:'original imagegen alpha retained; four authored phases; charcoal RGB grade',depth:site.depth,startsAt:site.startsAt,duration:site.duration})),{id:'marchers',source:opts.marchName||'march-walk-atlas-v2.png',alpha:'original imagegen alpha, four discrete authored gait poses'},{id:'valley-light',source:opts.backgroundName||'clean-background-v2.png',alpha:'source image light clipped to warm valley region'}];
 function layerTransform(name,s){const q=ease(s/(END-START));if(name==='far')return {x:-1-5*q,y:-1.5-1.5*q};if(name==='march')return{x:1-6*q,y:-2-1.5*q};if(name==='ground')return{x:4-12*q,y:-2-3*q};if(name==='near')return{x:8-21*q,y:-3-3*q};return{x:0,y:0}}
 function renderAt(absoluteTime,canvas,state){
  state=state||{};const t=clamp(absoluteTime,START,END),s=t-START,ctx=canvas.getContext('2d');const visible=id=>!state.onlyLayer||state.onlyLayer===id||(Array.isArray(state.onlyLayer)&&state.onlyLayer.includes(id))||(state.onlyLayer==='smoke'&&id.includes('battery'))||(state.onlyLayer==='villagers'&&id.startsWith('villager-group-')); 
  const show=id=>!state.hideLayers||!state.hideLayers.includes(id);
  const diag={time:t,sourceSize:[W,H],layers:[],smoke:[],soldiers:[],crowds:[],routeConnection:{x:.37,y:.50,direction:'right-down'},mountainOffsets:{}};
  ctx.save();ctx.setTransform(1,0,0,1,0,0);if(!state.preserveCanvas)ctx.clearRect(0,0,canvas.width,canvas.height);ctx.scale(canvas.width/W,canvas.height/H);
  // One camera transform; all content below is independently composited, never deformed as a flat image.
  const zoom=state.noCamera?1:1.028-.018*ease(s/5.6),camX=state.noCamera?0:(1-ease(s/5.6))*8,camY=state.noCamera?0:(1-ease(s/5.6))*3;
  ctx.translate(W*.5+camX,H*.52+camY);ctx.scale(zoom,zoom);ctx.translate(-W*.5,-H*.52);diag.camera={zoom,x:camX,y:camY};
  function drawPlane(name){const id=name+'-mountain',tr=layerTransform(name,s);diag.mountainOffsets[name]=tr;if(visible(id)&&show(id)){ctx.drawImage(terrain[name],tr.x,tr.y);diag.layers.push(id)}}
  function drawSmoke(site){const id=site.id;if(!visible(id)||!show(id))return;const tr=layerTransform(site.depth,s),age=t-site.startsAt;if(age<0||age>site.duration+1.2)return;const cycle=clamp(age/site.duration,0,.999999);
   // Unequal dwell: short initial burst, developed column, lean, then expanding smoke.
   const key=[0,.12,.41,.76,1];let phase=0;while(phase<3&&cycle>=key[phase+1])phase++;const local=(cycle-key[phase])/(key[phase+1]-key[phase]);const blend=ease(clamp((local-.46)/.54,0,1));const next=Math.min(phase+1,3);
   const rise=4*cycle,drift=site.depth==='far'?-24*cycle:-39*cycle;const grow=1+.34*cycle;
   const w=site.width*grow,h=site.height*grow,x=site.x+tr.x+drift-w*.5,y=site.y+tr.y-rise-h;
   const flash=Math.max(...[.16,.87,1.79,2.73].map((at,j)=>Math.exp(-Math.pow((age-at-(site.depth==='far'?.05:0))/(j%2?.095:.067),2))));
   const alpha=site.opacity*ease(age/.10)*(1-ease((age-site.duration+.35)/1.15))*(phase===3?lerp(.95,.61,local):1);
   for(const [fr,a] of [[phase,1-blend],[next,blend]])if(a>0){const cell=smokeCells[fr];ctx.globalAlpha=alpha*a;ctx.drawImage(staticSmoke,cell.x,cell.y,cell.w,cell.h,x,site.y+tr.y-rise-cell.baseline/cell.w*h,w,cell.h/cell.w*h)}ctx.globalAlpha=1;
   // Lighting is the source-painted flame, selectively screened through that same smoke silhouette.
   if(flash>.002&&!state.noFlashes){const cell=smokeCells[Math.min(phase,2)],fw=site.width,fh=site.height,fx=site.x+tr.x-fw*.5,fy=site.y+tr.y-cell.baseline/cell.w*fh;ctx.globalAlpha=flash*.98;ctx.globalCompositeOperation='screen';ctx.drawImage(staticWarm,cell.x,cell.y,cell.w,cell.h,fx,fy,fw,cell.h/cell.w*fh);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;}
   diag.layers.push(id);diag.smoke.push({id,phase,next,blend,cycle,age,flash,startsAt:site.startsAt,foot:[site.x+tr.x+drift,site.y+tr.y-rise],rise,drift,opacity:alpha,depth:site.depth});
  }
  if(visible('paper-underpaint')&&show('paper-underpaint')){ctx.drawImage(staticBacking,0,0);diag.layers.push('paper-underpaint')}
  drawSmoke(smokeSites[0]);drawPlane('far');drawSmoke(smokeSites[1]);drawSmoke(smokeSites[2]);drawPlane('march');
  // Gait is authored artwork: one clear pose at a time (no melted double legs), phase-offset per figure.
  if(visible('marchers')&&show('marchers')){const tr=layerTransform('march',s);for(let i=0;i<unitXs.length;i++){
   const speed=11.20+(i%3)*.10,x=unitXs[i]+speed*s;const freq=.65,phase=((s*freq+i/7)%1);const frame=Math.floor(phase*4),fp=footPoints[frame];const h=unitHeights[i],scale=h/(marchH*.79),w=marchW*scale,dh=marchH*scale;
   const footX=x+tr.x,footY=ridgeY(PATHS.march,x)+tr.y+.65;
   const dx=footX-fp.x*w,dy=footY-fp.y*dh;
   const slope=Math.atan2(ridgeY(PATHS.march,x+2)-ridgeY(PATHS.march,x-2),4);ctx.save();ctx.translate(footX,footY);ctx.rotate(slope);ctx.drawImage(staticMarch,frame*marchW,0,marchW,marchH,-fp.x*w,-fp.y*dh,w,dh);ctx.restore();
   diag.soldiers.push({id:i,frame,phase,footX,footY,ridgeY:ridgeY(PATHS.march,x)+tr.y,footRidgeError:.65,height:h,x,slope});
  }diag.layers.push('marchers')}
  // A narrow actual-ground strip hides the bottom of the shoes, establishing a terrain contact.
  if(visible('marchers')&&show('marchers')){const tr=layerTransform('march',s);ctx.save();ctx.translate(tr.x,tr.y);ctx.beginPath();ctx.moveTo(0,ridgeY(PATHS.march,0)+1.3);for(const p of PATHS.march.filter(p=>p[0]<=431))ctx.lineTo(p[0],p[1]+1.3);ctx.lineTo(445,310);ctx.lineTo(0,260);ctx.closePath();ctx.clip();ctx.drawImage(staticBacking,0,0);ctx.restore()}
  drawSmoke(smokeSites[3]);
  // The warm valley is painted source light, gently changing only within its own screen-space cutout.
  if(visible('valley-light')&&show('valley-light')){const warm=.055+.035*Math.sin(s*.63-.8)+.025*ease(s/6);ctx.save();ctx.beginPath();ctx.moveTo(619,450);ctx.lineTo(991,456);ctx.lineTo(1455,296);ctx.lineTo(W,256);ctx.lineTo(W,785);ctx.lineTo(1100,810);ctx.lineTo(710,610);ctx.closePath();ctx.clip();ctx.globalAlpha=warm;ctx.globalCompositeOperation='screen';ctx.drawImage(staticBacking,2*Math.sin(s*.19),-4*Math.sin(s*.27));ctx.restore();diag.layers.push('valley-light');diag.valleyLight=warm}
  const groundTr=layerTransform('ground',s);
  if(show('villagers'))for(let i=0;i<crowds.length;i++){const id='villager-group-'+i;if(!visible(id))continue;const breathing=Math.sin(s*(.90+i*.08)+i*1.8);const dx=groundTr.x+Math.sin(s*.35+i)*1.6,dy=groundTr.y+breathing*1.3,sy=1+breathing*.006,lean=Math.sin(s*.43+i*.7)*.0015;
   ctx.save();ctx.translate(190+dx,90+dy);ctx.scale(.85,.85);const anchorX=[822,1180,1490][i],anchorY=[782,822,802][i];ctx.translate(anchorX,anchorY);ctx.transform(1,0,lean,sy,0,0);ctx.translate(-anchorX,-anchorY);ctx.drawImage(crowds[i],0,0);ctx.restore();diag.crowds.push({id,dx,dy,scaleY:sy,lean});diag.layers.push(id)}
  drawPlane('ground');drawPlane('near');ctx.restore();
  return state.diagnostics?diag:undefined;
 }
 let drawCanvas=null;function draw(ctx,t,meta){if(!drawCanvas||drawCanvas.width!==ctx.canvas.width||drawCanvas.height!==ctx.canvas.height)drawCanvas=makeCanvas(ctx.canvas.width,ctx.canvas.height);renderAt(t,drawCanvas,Object.assign({noCamera:true},meta||{}));ctx.drawImage(drawCanvas,0,0);}
 return {ready:Promise.all(readiness),renderAt,draw,inventory,paths:PATHS,start:START,end:END,sourceSize:[W,H],terrain,crowds,smokeSites,ridgeY,smokeAtlas:staticSmoke,warmAtlas:staticWarm,smokeRects:smokeCells};
}
return {createLayeredScene,START,END,W,H,PATHS,ridgeY};
});
