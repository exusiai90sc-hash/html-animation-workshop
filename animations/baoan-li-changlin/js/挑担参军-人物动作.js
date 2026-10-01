'use strict';
/* V8 restrained shoulder load motion, based on the V7 source-art rig. Farmer and source-derived uniform use separate
 * independently registered layers. Opaque local material wipes preserve figure
 * solidity; shared shoulder/hand anchors support both the yoke and shoulder rifle.
 * All poses and released load trajectories are direct functions of source time. */
function buildV7SourceCharacter(root,legacy){
  const rig=G(root,{id:'v7-source-character'}),nodes={},SCALE=.92;
  const footShadows=[el('ellipse',{cx:0,cy:0,rx:68,ry:5,fill:'#102039',opacity:.26},rig),el('ellipse',{cx:0,cy:0,rx:66,ry:5,fill:'#102039',opacity:.26},rig)];
  const base=M.chain(M.t(110,76),M.s(SCALE));
  const rot=(a,p)=>M.chain(M.t(...p),M.r(a*DEG),M.t(-p[0],-p[1]));
  const map=(m,p)=>M.ap(m,...p),angle=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0]);
  const bone=(a,b,A,B)=>M.chain(M.t(...A),M.r(angle(A,B)-angle(a,b)),M.t(-a[0],-a[1]));
  const assets=V6_ASSETS.layers.slice().sort((a,b)=>a.z-b.z);
  const clip=(tag)=>{const id=uid(tag),cp=el('clipPath',{id,clipPathUnits:'userSpaceOnUse'},DEFS),rect=el('rect',{x:-1000,y:-1000,width:4000,height:2500},cp);return {id,rect};};
  const peasantClip=clip('v7-peasant-cloth'),uniformClip=clip('v7-uniform-cloth'),beamClip=clip('v7-beam'),gunClip=clip('v7-gun');
  assets.forEach(l=>{const g=G(rig,{'data-layer':l.id});el('image',{href:l.file,x:l.origin[0],y:l.origin[1],width:l.size[0],height:l.size[1]},g);nodes[l.id]=g;if(!['left_load','right_load','yoke'].includes(l.id))g.setAttribute('clip-path',`url(#${peasantClip.id})`);});
  const soldier=G(rig,{id:'v7-source-soldier'}),soldierNodes={};
  const soldierAssets=V7_SOLDIER_ASSETS.layers.slice().sort((a,b)=>a.z-b.z);
  soldierAssets.forEach(l=>{const g=G(soldier,{'data-layer':l.id});el('image',{href:l.file,x:l.origin[0],y:l.origin[1],width:l.size[0],height:l.size[1]},g);soldierNodes[l.id]=g;g.setAttribute('clip-path',`url(#${uniformClip.id})`);});
  const rifle=buildV7Rifle(soldier);rifle.g.remove();soldier.insertBefore(rifle.g,soldierNodes.near_hand);rifle.g.setAttribute('clip-path',`url(#${gunClip.id})`);nodes.yoke.setAttribute('clip-path',`url(#${beamClip.id})`);
  const whipping=buildV6Whip(rig,nodes.yoke,{origin:[20,200],contactParam:.80,nodes:96,
    driverImage:{href:'images/挑担受辱与参加红军/农民-施鞭手.png',origin:[526,185],size:[125,104],grip:[590,252],tip:[648,262]}});
  const anchors=V6_ASSETS.anchors||V6_ASSETS.rig_anchors;
  const shoulder=[490,263],elbow=[580,366],grip=[659,241],contact=[494,232],waist=[499,432];
  const upperLength=Math.hypot(elbow[0]-shoulder[0],elbow[1]-shoulder[1]),foreLength=Math.hypot(grip[0]-elbow[0],grip[1]-elbow[1]);
  function frame(t){
    const phase=(t-24.7)*Math.PI*2/3.3;
    const brace=[25.50,27.30].reduce((sum,h)=>{const d=t-h;return sum+(d>=0&&d<.38?Math.sin(Math.PI*d/.38)**2:0);},0);
    const k=E.io3(prog(t,28.85,29.77));
    const torsoAngle=.28*Math.sin(phase)+.18*brace-4.0*k;
    const shoulderBob=lerp(3.0,2.0,k)*(Math.sin(phase)+.12*Math.sin(2*phase));
    const torso=M.chain(M.t(0,shoulderBob),rot(torsoAngle,waist)),cn=map(torso,contact),sn=map(torso,shoulder);
    const yokeAngle=lerp(.80,.52,k)*Math.sin(phase-.25)-2.0*k,yoke=M.chain(M.t(...cn),M.r(yokeAngle*DEG),M.t(-contact[0],-contact[1]));
    const gn=map(yoke,grip),dx=gn[0]-sn[0],dy=gn[1]-sn[1],distance=Math.hypot(dx,dy),ex=dx/distance,ey=dy/distance;
    const a=(upperLength**2-foreLength**2+distance**2)/(2*distance),h=Math.sqrt(Math.max(0,upperLength**2-a*a));
    const en=[sn[0]+ex*a-ey*h,sn[1]+ey*a+ex*h];
    const pose={torso,waist_skirt:torso,near_upper_sleeve:bone(shoulder,elbow,sn,en),near_forearm_hand:bone(elbow,grip,en,gn),yoke};
    pose.head_neck=M.chain(torso,rot(.8+.40*Math.sin(phase-.7)+.40*brace-10.0*k,[539,218]));
    pose.far_sleeve=M.chain(torso,rot(.22*Math.sin(phase+.6),[455,273]));
    pose.far_forearm=M.chain(pose.far_sleeve,rot(.60*Math.sin(phase+.9),[386,411]));
    // Legs and shoes are planted; upper-body breathing is absorbed at the waist.
    const rearAngle=0,frontAngle=0;
    pose.rear_trouser=rot(rearAngle,[461,548]);pose.rear_calf=M.chain(pose.rear_trouser,rot(-rearAngle*.72,[375,763]));pose.rear_shoe=M.chain(pose.rear_calf,rot(-rearAngle*.28,[331,909]));
    pose.front_trouser=rot(frontAngle,[541,547]);pose.front_calf=M.chain(pose.front_trouser,rot(-frontAngle*.70,[594,770]));pose.front_shoe=M.chain(pose.front_calf,rot(-frontAngle*.30,[635,915]));
    // Reposition both original load cutouts equally along the beam; their midpoint
    // sits beneath the approved shoulder anchor without altering the farmer art.
    const sourceLoads=[[125,242],[822,263]],balancedLoads=[[145.5,242.62],[842.5,263.62]],loadAnchors=[];
    ['left_load','right_load'].forEach((id,i)=>{const to=map(yoke,balancedLoads[i]),a=sourceLoads[i],swing=.62*Math.sin(phase-.85+i*.035);const drop=Math.max(0,t-29.01),fall=800*drop*drop;pose[id]=M.chain(M.t(to[0]+(i?1:-1)*16*drop,to[1]+fall),M.r((swing+(i?1:-1)*5*drop)*DEG),M.t(-a[0],-a[1]));loadAnchors.push(map(base,to));});
    const world=m=>M.chain(base,m),target=map(world(pose.far_sleeve),[414,301]);
    const backStart=map(world(pose.far_sleeve),[421,291]),backEnd=map(world(pose.far_sleeve),[407,311]),bl=Math.hypot(backEnd[0]-backStart[0],backEnd[1]-backStart[1]);
    const backTangent=[(backEnd[0]-backStart[0])/bl,(backEnd[1]-backStart[1])/bl];
    return {k,pose,world,shoulderBob,torsoAngle,yokeAngle,brace,shoulder:map(base,sn),elbow:map(base,en),grip:map(base,gn),contact:map(base,cn),target,backTangent,loadAnchors,headAngle:torsoAngle+.8+.40*Math.sin(phase-.7)+.40*brace-10.0*k};
  }
  function update(t){
    const active=t>=24.7&&t<=35.2;vis(rig,active?1:0);
    if(!active){vis(legacy.body,1);vis(legacy.carry,1);vis(legacy.grip,1);return;}
    [legacy.body,legacy.carry,legacy.grip,legacy.basket,legacy.rearBasket].forEach(e=>vis(e,0));
    document.querySelectorAll('#v5-continuous-whip').forEach(e=>vis(e,0));document.querySelectorAll('#v5-whip-arm').forEach(e=>vis(e,0));
    const activeHit=[25.50,27.30].filter(h=>h<=t).at(-1);
    const response=V11BodyResponse.responseAt(activeHit===undefined?-1:t-activeHit,1);
    const q=t<28.85?V11BodyResponse.body(t,response):frame(t);
    [[358,966],[676,959]].forEach((pt,i)=>{const xy=map(q.world(q.pose[i?'front_shoe':'rear_shoe']),pt);set(footShadows[i],{cx:xy[0],cy:xy[1]});vis(footShadows[i],.23*q.k);});
    const clothCut=lerp(45,1070,E.io3(prog(t,28.89,29.69)));
    set(peasantClip.rect,{x:-1000,y:clothCut,width:4000,height:2300-clothCut});
    set(uniformClip.rect,{x:-1000,y:-1000,width:4000,height:1000+clothCut});
    const propCut=lerp(0,950,E.io3(prog(t,29.01,29.60)));
    const beamEnd=lerp(900,750,E.io3(prog(t,29.10,29.36)));
    set(beamClip.rect,{x:propCut,y:-1000,width:Math.max(0,beamEnd-propCut),height:2500});
    set(gunClip.rect,{x:-1000,y:-1000,width:1000+propCut,height:2500});
    assets.forEach(l=>{nodes[l.id].setAttribute('transform',M.str(q.world(q.pose[l.id])));vis(nodes[l.id],['left_load','right_load'].includes(l.id)?1-E.io3(prog(t,29.20,29.64)):1);});
    const soldierPose={...q.pose,far_forearm_uniform:q.pose.far_forearm,far_hand:q.pose.far_forearm,shoulder_bridge:q.pose.torso,collar_back:q.pose.torso,collar_front:q.pose.torso,waist_jacket:q.pose.torso,cross_strap:q.pose.torso,belt:q.pose.torso,soft_cap:q.pose.head_neck,near_forearm_uniform:q.pose.near_forearm_hand,near_hand:q.pose.near_forearm_hand};
    soldierAssets.forEach(l=>soldierNodes[l.id].setAttribute('transform',M.str(q.world(soldierPose[l.id]))));
    rifle.g.setAttribute('transform',M.str(q.world(q.pose.yoke)));vis(soldier,1);
    const whip=whipping.update(t,q.target,q.backTangent);
    window.__v6Last={t,bodyResponse:q.response||null,k:q.k,shoulderBob:q.shoulderBob,footSoles:[[358,966],[676,959]].map((pt,i)=>map(q.world(q.pose[i?'front_shoe':'rear_shoe']),pt)),torsoAngle:q.torsoAngle,headAngle:q.headAngle,yokeAngle:q.yokeAngle,brace:q.brace,shoulder:q.shoulder,elbow:q.elbow,grip:q.grip,contact:q.contact,target:q.target,loadAnchors:q.loadAnchors,layerTransforms:Object.fromEntries(assets.map(l=>[l.id,q.world(q.pose[l.id])])),independentLayers:assets.length,soldierLayers:soldierAssets.length,soldierLayerTransforms:Object.fromEntries(soldierAssets.map(l=>[l.id,q.world(soldierPose[l.id])])),rifleSupport:map(q.world(q.pose.yoke),rifle.support),rifleGrip:map(q.world(q.pose.yoke),rifle.grip),rifleMuzzle:map(q.world(q.pose.yoke),rifle.muzzle),rifleButt:map(q.world(q.pose.yoke),rifle.butt),backTangent:q.backTangent,contactError:whip.surfaceContactError};
  }
  window.__v6Rig={frame,update};window.__v7Rig=window.__v6Rig;window.__v8Rig=window.__v6Rig;return {update};
}
