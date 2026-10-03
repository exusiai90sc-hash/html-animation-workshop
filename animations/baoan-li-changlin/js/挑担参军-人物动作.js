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
  // Bounded soldier-only weight transfer. Ground contact follows the existing
  // foreground snow in world coordinates; a support foot never tracks the screen.
  // The wide original stance is retained. Existing cutouts stretch only along each
  // leg segment by a few percent, keeping the actual knee/ankle joins coincident.
  const marchSoles=[[[286.5,950],[287.5,951],[288.5,952],[289.5,952],[290.5,953],[291.5,953],[292.5,953],[293.5,954],[294.5,954],[295.5,954],[296.5,955],[297.5,955],[298.5,955],[299.5,955],[300.5,956],[301.5,956],[302.5,956],[303.5,956],[304.5,956],[305.5,957],[306.5,957],[307.5,957],[308.5,957],[309.5,957],[310.5,957],[311.5,958],[312.5,958],[313.5,958],[314.5,958],[315.5,958],[316.5,958],[317.5,958],[318.5,958],[319.5,958],[320.5,958],[321.5,958],[322.5,959],[323.5,959],[324.5,959],[325.5,958],[326.5,958],[327.5,958],[328.5,958],[329.5,958],[330.5,958],[331.5,958],[332.5,958],[333.5,958],[334.5,958],[335.5,958],[336.5,958],[337.5,958],[338.5,958],[339.5,958],[340.5,958],[341.5,958],[342.5,958],[343.5,959],[344.5,959],[345.5,959],[346.5,959],[347.5,959],[348.5,960],[349.5,960],[350.5,960],[351.5,961],[352.5,961],[353.5,961],[354.5,961],[355.5,962],[356.5,962],[357.5,962],[358.5,962],[359.5,963],[360.5,963],[361.5,963],[362.5,963],[363.5,964],[364.5,964],[365.5,964],[366.5,964],[367.5,965],[368.5,965],[369.5,965],[370.5,965],[371.5,965],[372.5,965],[373.5,965],[374.5,966],[375.5,966],[376.5,966],[377.5,966],[378.5,966],[379.5,966],[380.5,966],[381.5,966],[382.5,966],[383.5,966],[384.5,966],[385.5,966],[386.5,966],[387.5,966],[388.5,966],[389.5,966],[390.5,966],[391.5,966],[392.5,966],[393.5,966],[394.5,966],[395.5,966],[396.5,966],[397.5,966],[398.5,966],[399.5,966],[400.5,966],[401.5,965],[402.5,965],[403.5,965],[404.5,965],[405.5,965],[406.5,965],[407.5,965],[408.5,965],[409.5,965],[410.5,965],[411.5,965],[412.5,965],[413.5,964],[414.5,964],[415.5,964],[416.5,964],[417.5,964],[418.5,964],[419.5,963],[420.5,963],[421.5,963],[422.5,963],[423.5,963],[424.5,962],[425.5,962],[426.5,962],[427.5,961],[428.5,960],[429.5,960]],[[601.5,956],[602.5,956],[603.5,957],[604.5,958],[605.5,958],[606.5,959],[607.5,960],[608.5,960],[609.5,960],[610.5,960],[611.5,960],[612.5,960],[613.5,960],[614.5,960],[615.5,960],[616.5,960],[617.5,960],[618.5,960],[619.5,960],[620.5,960],[621.5,960],[622.5,960],[623.5,960],[624.5,960],[625.5,960],[626.5,960],[627.5,960],[628.5,960],[629.5,960],[630.5,960],[631.5,960],[632.5,960],[633.5,960],[634.5,960],[635.5,960],[636.5,960],[637.5,959],[638.5,959],[639.5,959],[640.5,959],[641.5,959],[642.5,959],[643.5,959],[644.5,958],[645.5,958],[646.5,958],[647.5,957],[648.5,956],[649.5,955],[650.5,955],[651.5,954],[652.5,954],[653.5,954],[654.5,954],[655.5,954],[656.5,954],[657.5,954],[658.5,954],[659.5,954],[660.5,954],[661.5,954],[662.5,954],[663.5,954],[664.5,954],[665.5,954],[666.5,954],[667.5,954],[668.5,954],[669.5,954],[670.5,954],[671.5,954],[672.5,954],[673.5,954],[674.5,954],[675.5,954],[676.5,954],[677.5,954],[678.5,954],[679.5,954],[680.5,954],[681.5,954],[682.5,954],[683.5,954],[684.5,954],[685.5,954],[686.5,954],[687.5,954],[688.5,954],[689.5,954],[690.5,954],[691.5,954],[692.5,954],[693.5,954],[694.5,954],[695.5,954],[696.5,953],[697.5,953],[698.5,953],[699.5,953],[700.5,953],[701.5,953],[702.5,952],[703.5,952],[704.5,952],[705.5,952],[706.5,951],[707.5,951],[708.5,951],[709.5,951],[710.5,950],[711.5,950],[712.5,950],[713.5,950],[714.5,949],[715.5,949],[716.5,949],[717.5,949],[718.5,948],[719.5,948],[720.5,948],[721.5,948],[722.5,947],[723.5,947],[724.5,947],[725.5,946],[726.5,946],[727.5,946],[728.5,945],[729.5,945],[730.5,944],[731.5,944],[732.5,943],[733.5,943],[734.5,943],[735.5,942],[736.5,942],[737.5,941],[738.5,941],[739.5,940],[740.5,939],[741.5,939],[742.5,938],[743.5,938],[744.5,937],[745.5,936],[746.5,935],[747.5,934],[748.5,933]]];
  const snowSegments=[[-600,984,-200,980,160,970,400,965],[400,965,520,963,670,960,800,957],[800,957,990,947,1140,930,1300,915],[1300,915,1500,900,1700,860,1900,850],[1900,850,2100,840,2400,860,2700,880]];
  const cubic=(a,b,c,d,u)=>a*(1-u)**3+3*b*u*(1-u)**2+3*c*u*u*(1-u)+d*u**3;
  function snowY(x){const seg=snowSegments.find(s=>x<=s[6])||snowSegments.at(-1);let lo=0,hi=1;for(let j=0;j<30;j++){const u=(lo+hi)/2;if(cubic(seg[0],seg[2],seg[4],seg[6],u)<x)lo=u;else hi=u;}return cubic(seg[1],seg[3],seg[5],seg[7],(lo+hi)/2);}
  function marchAt(t){
    const amount=E.io3(prog(t,29.80,30.00)),cycle=(t-29.06)/1.8,phase=2*Math.PI*cycle;
    const body=[amount*1.8*Math.sin(phase),amount*1.15*Math.cos(2*phase)];
    const feet=[0,.5].map((offset,i)=>{
      const p=((cycle+offset)%1+1)%1,d=.58,period=1.8,speed=38,A=speed*period*d/2;
      const support=p<=d,v=support?0:(p-d)/(1-d),ease=v*v*(3-2*v);
      const dx=support?A-speed*period*p:-A+2*A*ease-speed*period*(1-d)*(v-3*v*v+2*v*v*v);
      const lift=support?0:12*Math.sin(Math.PI*v)**2,roll=support?0:1.8*Math.sin(Math.PI*v)**2*Math.sin(2*Math.PI*v);
      const pivot=i?[623,960]:[385,966];
      const foot=M.chain(M.t(dx/SCALE,0),rot(roll,pivot));
      // All visible alpha-column bottoms are checked, including the sloped toes.
      // During support, x+38*(t-T.NOW) is constant, as is the ground height.
      let dy=Infinity;
      for(const pt of marchSoles[i]){const q=map(base,map(foot,pt));dy=Math.min(dy,snowY(q[0]+38*(t-29.05))-q[1]-.5);}
      const full=M.chain(M.t(0,(dy-lift)/SCALE),foot);
      const matrix=full.map((value,j)=>lerp([1,0,0,1,0,0][j],value,amount));
      return {phase:p,support:amount===1&&support,lift:amount*lift,roll:amount*roll,groundCorrection:dy,matrix};
    });
    // Follow the mean grounded shoe height up the unchanged snow slope. The
    // swing-foot lift stays local, so the pelvis does not hop with either foot.
    const terrainRise=amount*(feet[0].groundCorrection+feet[1].groundCorrection)/(2*SCALE);
    body[1]+=terrainRise;
    return {amount,cycle,body,terrainRise,sway:amount*.18*Math.sin(phase+.2),feet};
  }
  const stretchBone=(a,b,A,B)=>M.chain(M.t(...A),M.r(angle(A,B)),M.s(Math.hypot(B[0]-A[0],B[1]-A[1])/Math.hypot(b[0]-a[0],b[1]-a[1]),1),M.r(-angle(a,b)),M.t(-a[0],-a[1]));
  function marchingLeg(pose,march,i){
    const ids=i?['front_trouser','front_calf','front_shoe']:['rear_trouser','rear_calf','rear_shoe'];
    const H=i?[541,547]:[461,548],K=i?[594,770]:[375,763],A=i?[635,915]:[331,909];
    const hip=[H[0]+march.body[0],H[1]+march.body[1]],ankle=map(march.feet[i].matrix,A);
    const old=[A[0]-H[0],A[1]-H[1]],length=Math.hypot(...old),u=((K[0]-H[0])*old[0]+(K[1]-H[1])*old[1])/(length*length);
    const bend=((K[0]-H[0])*(-old[1])+(K[1]-H[1])*old[0])/length;
    const axis=[ankle[0]-hip[0],ankle[1]-hip[1]],len=Math.hypot(...axis),extra=march.feet[i].lift*.075;
    const knee=[hip[0]+axis[0]*u-axis[1]/len*(bend+extra),hip[1]+axis[1]*u+axis[0]/len*(bend+extra)];
    pose[ids[0]]=stretchBone(H,K,hip,knee);pose[ids[1]]=stretchBone(K,A,knee,ankle);pose[ids[2]]=march.feet[i].matrix;
    march.feet[i].hip=hip;march.feet[i].knee=knee;march.feet[i].ankle=ankle;
  }
  function frame(t){
    const march=marchAt(t);
    const phase=(t-24.7)*Math.PI*2/3.3;
    const brace=[25.50,27.30].reduce((sum,h)=>{const d=t-h;return sum+(d>=0&&d<.38?Math.sin(Math.PI*d/.38)**2:0);},0);
    const k=E.io3(prog(t,28.85,29.77));
    const torsoAngle=.28*Math.sin(phase)+.18*brace-4.0*k+march.sway;
    const shoulderBob=lerp(3.0,2.0,k)*(Math.sin(phase)+.12*Math.sin(2*phase));
    const torso=M.chain(M.t(march.body[0],shoulderBob+march.body[1]),rot(torsoAngle,waist)),cn=map(torso,contact),sn=map(torso,shoulder);
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
    if(march.amount>0){marchingLeg(pose,march,0);marchingLeg(pose,march,1);}
    // Reposition both original load cutouts equally along the beam; their midpoint
    // sits beneath the approved shoulder anchor without altering the farmer art.
    const sourceLoads=[[125,242],[822,263]],balancedLoads=[[145.5,242.62],[842.5,263.62]],loadAnchors=[];
    ['left_load','right_load'].forEach((id,i)=>{const to=map(yoke,balancedLoads[i]),a=sourceLoads[i],swing=.62*Math.sin(phase-.85+i*.035);const drop=Math.max(0,t-29.01),fall=800*drop*drop;pose[id]=M.chain(M.t(to[0]+(i?1:-1)*16*drop,to[1]+fall),M.r((swing+(i?1:-1)*5*drop)*DEG),M.t(-a[0],-a[1]));loadAnchors.push(map(base,to));});
    const world=m=>M.chain(base,m),target=map(world(pose.far_sleeve),[414,301]);
    const backStart=map(world(pose.far_sleeve),[421,291]),backEnd=map(world(pose.far_sleeve),[407,311]),bl=Math.hypot(backEnd[0]-backStart[0],backEnd[1]-backStart[1]);
    const backTangent=[(backEnd[0]-backStart[0])/bl,(backEnd[1]-backStart[1])/bl];
    return {k,pose,world,march,shoulderBob,torsoAngle,yokeAngle,brace,shoulder:map(base,sn),elbow:map(base,en),grip:map(base,gn),contact:map(base,cn),target,backTangent,loadAnchors,headAngle:torsoAngle+.8+.40*Math.sin(phase-.7)+.40*brace-10.0*k};
  }
  function update(t){
    const active=t>=22.7&&t<=35.2;vis(rig,active?1:0);
    if(!active){vis(legacy.body,1);vis(legacy.carry,1);vis(legacy.grip,1);return;}
    [legacy.body,legacy.carry,legacy.grip,legacy.basket,legacy.rearBasket].forEach(e=>vis(e,0));
    document.querySelectorAll('#v5-continuous-whip').forEach(e=>vis(e,0));document.querySelectorAll('#v5-whip-arm').forEach(e=>vis(e,0));
    const activeHit=[25.50,27.30].filter(h=>h<=t).at(-1);
    const response=V11BodyResponse.responseAt(activeHit===undefined?-1:t-activeHit,1);
    const q=t<28.85?V11BodyResponse.body(t,response):frame(t);
    [[358,966],[676,959]].forEach((pt,i)=>{const amount=q.march?.amount||0,moving=amount>0,anchor=i?[623,960]:[385,966],xy=map(q.world(q.pose[i?'front_shoe':'rear_shoe']),pt.map((value,j)=>lerp(value,anchor[j],amount))),lift=q.march?.feet[i].lift||0;set(footShadows[i],{cx:xy[0],cy:moving?lerp(xy[1],snowY(xy[0]+38*(t-29.05))+.7,q.march.amount):xy[1],rx:(i?66:68)*(1-lift*.012)});vis(footShadows[i],.23*q.k*(1-lift/18));});
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
    window.__v6Last={t,march:q.march||null,bodyResponse:q.response||null,k:q.k,shoulderBob:q.shoulderBob,footSoles:[[358,966],[676,959]].map((pt,i)=>map(q.world(q.pose[i?'front_shoe':'rear_shoe']),pt)),torsoAngle:q.torsoAngle,headAngle:q.headAngle,yokeAngle:q.yokeAngle,brace:q.brace,shoulder:q.shoulder,elbow:q.elbow,grip:q.grip,contact:q.contact,target:q.target,loadAnchors:q.loadAnchors,layerTransforms:Object.fromEntries(assets.map(l=>[l.id,q.world(q.pose[l.id])])),independentLayers:assets.length,soldierLayers:soldierAssets.length,soldierLayerTransforms:Object.fromEntries(soldierAssets.map(l=>[l.id,q.world(soldierPose[l.id])])),rifleSupport:map(q.world(q.pose.yoke),rifle.support),rifleGrip:map(q.world(q.pose.yoke),rifle.grip),rifleMuzzle:map(q.world(q.pose.yoke),rifle.muzzle),rifleButt:map(q.world(q.pose.yoke),rifle.butt),backTangent:q.backTangent,contactError:whip.surfaceContactError};
  }
  window.__v6Rig={frame,update,marchAt,snowY,marchSoles};window.__v7Rig=window.__v6Rig;window.__v8Rig=window.__v6Rig;return {update};
}
