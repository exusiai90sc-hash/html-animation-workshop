/* V11 source-layer joint compliance. Animation approximation, not soft-body FEM.
 * Browser: V11BodyResponse. CommonJS: require('./挑担参军-肩背回弹.js').
 * All 16 matrix entries map original source coordinates to stage coordinates.
 * Give the SAME transforms() result to rendered layers and source-alpha colliders.
 */
(function(root){
  'use strict';
  const DEG=Math.PI/180, SCALE=.92, DT=1/240;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const M={t:(x,y)=>[1,0,0,1,x,y],s:(x,y=x)=>[x,0,0,y,0,0],r:a=>[Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),0,0],ap:(m,x,y)=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]],mul:(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]]};
  M.chain=(...a)=>a.reduce((p,q)=>M.mul(p,q));
  const map=(m,p)=>M.ap(m,...p), base=M.chain(M.t(110,76),M.s(SCALE));
  const rot=(a,p)=>M.chain(M.t(...p),M.r(a*DEG),M.t(-p[0],-p[1]));
  const aroundScale=(x,y,p)=>M.chain(M.t(...p),M.s(x,y),M.t(-p[0],-p[1]));
  const angle=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0]);
  const bone=(a,b,A,B)=>M.chain(M.t(...A),M.r(angle(A,B)-angle(a,b)),M.t(-a[0],-a[1]));
  const shoulder=[490,263],elbow=[580,366],grip=[659,241],contact=[494,232],waist=[499,432],neck=[539,218];
  const farShoulder=[455,273],farElbow=[386,411];
  const upperLength=Math.hypot(elbow[0]-shoulder[0],elbow[1]-shoulder[1]),foreLength=Math.hypot(grip[0]-elbow[0],grip[1]-elbow[1]);
  const lerp=(a,b,u)=>a+(b-a)*u, prog=(t,a,b)=>clamp((t-a)/(b-a),0,1), io3=x=>x<.5?4*x*x*x:1-((-2*x+2)**3)/2;
  const ZERO=Object.freeze({compression:0,shoulder:0,torso:0,head:0});

  function values(input){
    input=input&&typeof input.snapshot==='function'?input.snapshot():input||ZERO;
    return {compression:clamp(Number(input.compression)||0,-.45,6),shoulder:clamp(Number(input.shoulder)||0,-.55,4),torso:clamp(Number(input.torso)||0,-.22,1.6),head:clamp(Number(input.head)||0,-.28,1.3)};
  }

  function create(options={}){
    let time=0; const q={compression:[0,0],shoulder:[0,0],torso:[0,0],head:[0,0]};
    const gain=clamp(options.gain===undefined?1:Number(options.gain)||0,0,2);
    function snapshot(){return {...values(Object.fromEntries(Object.entries(q).map(([k,v])=>[k,v[0]]))),time,velocity:Object.fromEntries(Object.entries(q).map(([k,v])=>[k,v[1]]))};}
    function reset(){time=0;for(const v of Object.values(q))v[0]=v[1]=0;return snapshot();}
    function restore(s){reset();time=Number(s.time)||0;const p=values(s);for(const k of Object.keys(q)){q[k][0]=p[k];q[k][1]=Number(s.velocity&&s.velocity[k])||0;}return snapshot();}
    function spring(k,target,w,z,h,low,high){
      const p=q[k];p[1]+=(w*w*(target-p[0])-2*z*w*p[1])*h;p[0]+=p[1]*h;
      if(p[0]<low){p[0]=low;p[1]=Math.max(0,p[1]);}if(p[0]>high){p[0]=high;p[1]=Math.min(0,p[1]);}
    }
    function step(dt,contactImpulse=0){
      if(!Number.isFinite(dt)||dt<0||dt>10)throw new Error('Body response dt must be between 0 and 10 seconds');
      // A scalar is a one-shot normalized pulse. An envelope is a held contact
      // strength for this dt. Pulse once; do not repeat it every rendered frame.
      const input=typeof contactImpulse==='number'?{pulse:contactImpulse}:contactImpulse||{};
      const pulse=clamp(Number(input.pulse??input.normalImpulse??0)||0,0,2)*gain;
      const envelope=clamp(Number(input.envelope)||0,0,1)*gain;
      q.compression[1]+=510*pulse;
      const count=Math.max(1,Math.ceil(dt/DT)),h=dt/count;
      for(let i=0;i<count;i++){
        spring('compression',5.2*envelope,36,.68,h,-.45,6);
        spring('shoulder',q.compression[0]*1.4,19,.73,h,-.55,4);
        spring('torso',q.compression[0]*.84,14,.75,h,-.22,1.6);
        spring('head',q.torso[0]*.8+q.shoulder[0]*.10,16,.68,h,-.28,1.3);
      }
      time+=dt;return snapshot();
    }
    return {step,snapshot,restore,reset};
  }

  let unitCache;
  function responseAt(elapsed,strength=1){
    if(elapsed<0||!Number.isFinite(elapsed))return {...ZERO};
    if(!unitCache){const sim=create();unitCache=[sim.snapshot()];for(let i=1;i<=720;i++)unitCache.push(sim.step(DT,i===1?1:0));}
    if(elapsed>=3)return {...ZERO};
    const f=elapsed/DT,i=Math.floor(f),u=f-i,a=unitCache[i],b=unitCache[i+1];
    return values(Object.fromEntries(Object.keys(ZERO).map(k=>[k,lerp(a[k],b[k],u)*clamp(strength,0,2)])));
  }

  function frame(t,response=ZERO){
    const r=values(response),phase=(t-24.7)*Math.PI*2/3.3,k=io3(prog(t,28.85,29.77));
    // Baseline V10 breathing/transition remains; the authored timed brace is
    // removed so a response occurs only when a contact pulse/envelope is supplied.
    const torsoAngle=.28*Math.sin(phase)-4*k+2.5*r.torso;
    const shoulderBob=lerp(3,2,k)*(Math.sin(phase)+.12*Math.sin(2*phase));
    // Upper-body shortening is absorbed at the waist. Feet retain exact V10
    // matrices. The same response timing maps to a clearer, bounded shoulder sink.
    const torso=M.chain(M.t(0,shoulderBob),rot(torsoAngle,waist),aroundScale(1,1-2.8*r.shoulder/(SCALE*200),waist));
    const cn=map(torso,contact),sn=map(torso,shoulder);
    const yokeAngle=lerp(.80,.52,k)*Math.sin(phase-.25)-2*k+r.torso*.14;
    const yoke=M.chain(M.t(...cn),M.r(yokeAngle*DEG),M.t(-contact[0],-contact[1]));
    const gn=map(yoke,grip),dx=gn[0]-sn[0],dy=gn[1]-sn[1],distance=Math.hypot(dx,dy),ex=dx/distance,ey=dy/distance;
    const a=(upperLength**2-foreLength**2+distance**2)/(2*distance),h=Math.sqrt(Math.max(0,upperLength**2-a*a));
    const en=[sn[0]+ex*a-ey*h,sn[1]+ey*a+ex*h];
    const pose={torso,waist_skirt:M.chain(M.t(0,shoulderBob),rot(torsoAngle,waist)),near_upper_sleeve:bone(shoulder,elbow,sn,en),near_forearm_hand:bone(elbow,grip,en,gn),yoke};
    const headLocal=.8+.40*Math.sin(phase-.7)-10*k+3*r.head;
    pose.head_neck=M.chain(torso,rot(headLocal,neck));
    // Only the contacted back/sleeve layer compresses locally. Small affine
    // cloth strain plus inward offset is bounded; it is not a full-PNG twitch.
    const c=1.25*r.compression/SCALE;
    const localCloth=M.chain(M.t(.76*c,.43*c),aroundScale(1-.003*c,1-.002*c,farShoulder));
    const farBase=M.chain(torso,rot(.22*Math.sin(phase+.6),farShoulder));
    pose.far_sleeve=M.chain(farBase,localCloth);
    // Keep the far elbow sewn to its changed sleeve. The forearm stays rigid
    // locally and has its own delayed angular recovery, instead of inheriting
    // the cloth's non-uniform scale.
    const fe=map(pose.far_sleeve,farElbow),fs=map(pose.far_sleeve,farShoulder);
    // Add restrained lower-arm lag around the preserved elbow anchor.
    pose.far_forearm=M.chain(M.t(...fe),M.r(angle(fs,fe)-angle(farShoulder,farElbow)+(.60*Math.sin(phase+.9)+r.head*.35)*DEG),M.t(-farElbow[0],-farElbow[1]));
    for(const id of ['rear_trouser','rear_calf','rear_shoe','front_trouser','front_calf','front_shoe'])pose[id]=[1,0,0,1,0,0];
    const sourceLoads=[[125,242],[822,263]],balancedLoads=[[145.5,242.62],[842.5,263.62]],loadAnchors=[];
    ['left_load','right_load'].forEach((id,i)=>{const to=map(yoke,balancedLoads[i]),a=sourceLoads[i],swing=.62*Math.sin(phase-.85+i*.035),drop=Math.max(0,t-29.01),fall=800*drop*drop;pose[id]=M.chain(M.t(to[0]+(i?1:-1)*16*drop,to[1]+fall),M.r((swing+(i?1:-1)*5*drop)*DEG),M.t(-a[0],-a[1]));loadAnchors.push(map(base,to));});
    const world=m=>M.chain(base,m),layerTransforms=Object.fromEntries(Object.entries(pose).map(([id,m])=>[id,world(m)]));
    const target=map(layerTransforms.far_sleeve,[414,301]),bs=map(layerTransforms.far_sleeve,[421,291]),be=map(layerTransforms.far_sleeve,[407,311]),bl=Math.hypot(be[0]-bs[0],be[1]-bs[1]);
    return {k,pose,world,layerTransforms,response:r,shoulderBob,torsoAngle,yokeAngle,brace:0,shoulder:map(base,sn),elbow:map(base,en),grip:map(base,gn),contact:map(base,cn),target,backTangent:[(be[0]-bs[0])/bl,(be[1]-bs[1])/bl],loadAnchors,headAngle:torsoAngle+headLocal,footSoles:[map(layerTransforms.rear_shoe,[358,966]),map(layerTransforms.front_shoe,[676,959])]};
  }
  const api={create,frame,body:frame,transforms:(t,r)=>frame(t,r).layerTransforms,responseAt,zero:ZERO};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;root.V11BodyResponse=api;
})(typeof window!=='undefined'?window:globalThis);
