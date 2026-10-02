'use strict';
/* V11: a repeated authored strike with a spring-driven tail flick.
 * Main sweep/contact are deliberately controlled for animated force.
 * The tip uses secondary spring motion, not a continuum rope simulation.
 * V9 base: convex whip-side contact at an interior parameter of one cubic.
 * Root tangent follows the handle; the curve grazes the transformed source sleeve.
 * The unconstrained free endpoint passes below/outside the back before rebound.
 * Authored geometry and timing, not a force/rope simulation or a fixed-length solve. */
// One rounded width definition serves both drawing and flank contact.
const V6_WHIP_STROKE={
  cuts:[0,.12,.24,.36,.48,.60,.70,.80,.90,1],
  width:i=>Math.round((20.4-i*1.15)*10)/10,
  rim:i=>Math.round((10.0-i*.55)*10)/10,
  radiusAt(u){let r=0;for(let i=0;i<9;i++)if(u>=this.cuts[i]-1e-9&&u<=this.cuts[i+1]+1e-9)r=Math.max(r,this.width(i)/2);return r;}
};
const V6Whip=(()=>{
  const clamp=x=>Math.max(0,Math.min(1,x)),mix=(a,b,u)=>a+(b-a)*u;
  const io=x=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;};
  const progress=(x,a,b)=>clamp((x-a)/(b-a));
  const stage=(d,a,b,A,B,e=io)=>mix(A,B,e(progress(d,a,b)));
  const len=pts=>pts.slice(1).reduce((s,p,i)=>s+Math.hypot(p[0]-pts[i][0],p[1]-pts[i][1]),0);
  function relative(d,target,cfg={}){
    const origin=cfg.origin||[65,210],scale=cfg.scale||1,N=cfg.nodes||72;
    let wx,wy,angle;
    if(d<-.48){wx=stage(d,-1.00,-.56,0,20);wy=stage(d,-1.00,-.56,8,-55);angle=stage(d,-1.00,-.56,-30,-68);}
    else if(d<-.08){const q=progress(d,-.48,-.08),v=q*q;wx=mix(20,85,v);wy=mix(-55,55,v);angle=mix(-68,32,v);}
    else if(d<.08){wx=stage(d,-.08,.08,85,70);wy=stage(d,-.08,.08,55,46);angle=stage(d,-.08,.08,32,20);}
    else {wx=stage(d,.08,.52,70,0);wy=stage(d,.08,.52,46,-30);angle=stage(d,.08,.52,20,-48);}
    const hand=[origin[0]+wx*scale,origin[1]+wy*scale],rad=angle*Math.PI/180,handleLength=(cfg.handleLength||90)*scale;
    const root=[hand[0]+Math.cos(rad)*handleLength,hand[1]+Math.sin(rad)*handleLength];
    const supplied=cfg.backTangent||[-.5734623444,.8192319205],tl=Math.hypot(...supplied),T=supplied.map(x=>x/tl),outward=[-T[1],T[0]];
    const uc=cfg.contactParam||.80,radius=V6_WHIP_STROKE.radiusAt(uc);
    const smooth=x=>{x=clamp(x);return x*x*x*(10+x*(-15+6*x));};
    let slide,gap,derivativeSpeed;
    if(d<0){const z=progress(d,-.40,0),a=-1.2*z*z*z+2.2*z*z;
      slide=-75*(1-a);gap=85*(1-smooth(z));derivativeSpeed=mix(400,450,smooth(z));
    }else if(d<=.08){slide=150*d;gap=0;derivativeSpeed=450+30*smooth(d/.08);}
    else {const z=progress(d,.08,.52),h00=2*z*z*z-3*z*z+1,h10=z*z*z-2*z*z+z,h01=-2*z*z*z+3*z*z;
      slide=12*h00+(150*.44)*h10-75*h01;gap=85*smooth(z);derivativeSpeed=mix(480,400,smooth(z));}
    const surfaceTarget=[target[0]+T[0]*slide,target[1]+T[1]*slide];
    const contactCenter=surfaceTarget.map((x,i)=>x+outward[i]*(radius+gap));
    // One global cubic. Its first derivative follows the rigid handle at the root;
    // its interior point and tangent follow the garment. The free endpoint is
    // solved from those conditions, never aimed at or pinned into the body.
    const rootLead=mix(105,130,1-gap/85),p1=[root[0]+Math.cos(rad)*rootLead,root[1]+Math.sin(rad)*rootLead];
    const a=3*(1-uc)*(1-uc)*uc,b=3*(1-uc)*uc*uc,c=uc*uc*uc;
    const d1=3*(1-uc)*(1-3*uc),e=3*uc*(2-3*uc),f=3*uc*uc,det=b*f-c*e;
    const rhs0=contactCenter.map((x,i)=>x-(1-uc)**3*root[i]-a*p1[i]);
    const rhs1=T.map((x,i)=>x*derivativeSpeed+3*(1-uc)**2*root[i]-d1*p1[i]);
    const p2=rhs0.map((x,i)=>(x*f-c*rhs1[i])/det),tip=rhs0.map((x,i)=>(b*rhs1[i]-e*x)/det);
    const controls=[root,p1,p2,tip];
    const curve=u=>[0,1].map(i=>(1-u)**3*root[i]+3*(1-u)**2*u*p1[i]+3*(1-u)*u*u*p2[i]+u*u*u*tip[i]);
    const deriv=u=>[0,1].map(i=>3*(1-u)**2*(p1[i]-root[i])+6*(1-u)*u*(p2[i]-p1[i])+3*u*u*(tip[i]-p2[i]));
    const second=u=>[0,1].map(i=>6*(1-u)*(p2[i]-2*p1[i]+root[i])+6*u*(tip[i]-2*p2[i]+p1[i]));
    const pts=Array.from({length:N+1},(_,i)=>curve(i/N)),actual=curve(uc),dv=deriv(uc),dd=second(uc);
    const surfaceContact=actual.map((x,i)=>x-outward[i]*radius),contact=d>=0&&d<=.08;
    return {relativeTime:d,hand,handleTip:root,handleAngle:angle,tip,freeTip:tip,nodes:pts,controlPoints:controls,
      contact,contactParam:uc,contactIndex:uc*N,contactCenter:actual,surfaceContact,surfaceTarget,contactRadius:radius,
      backTangent:T,outwardNormal:outward,curveDerivative:dv,curveSecondDerivative:dd,convexOutwardDot:dd[0]*outward[0]+dd[1]*outward[1],
      approachGap:gap,tangentialTravel:slide,surfaceContactError:Math.hypot(surfaceContact[0]-surfaceTarget[0],surfaceContact[1]-surfaceTarget[1]),
      arcLength:len(pts),requestedArcLength:null,arcLengthError:null,target:target.slice()};
  }
  const h=1/240,tailCache=[];let x=0,v=0;
  for(let i=0;i<=Math.round(1.1/h);i++){const d=-.8+i*h;if(i===Math.round(.78/h))v+=1400;if(i===Math.round(.86/h))v-=300;v+=(-19*19*x-2*.23*19*v)*h;x+=v*h;tailCache.push({x,v});}
  function timing(d){
    if(d<-.30)return mix(-1,-.4,io(progress(d,-.8,-.30)));
    if(d<0){const z=progress(d,-.30,0);return -.4*(1-z*z);}
    if(d<=.04)return d*2;
    const z=progress(d,.04,.24);return .08+.44*(1-(1-z)*(1-z));
  }
  function at(t,target,cfg={}){const beats=cfg.beats||[25.50,27.30];let beat=beats.find(b=>t-b>=-.800001&&t-b<=.260001),opacity=1;
    if(beat===undefined){beat=beats.reduce((a,b)=>Math.abs(t-b)<Math.abs(t-a)?b:a);opacity=0;}
    const d=t-beat;if(opacity){opacity=1-io(progress(d,.14,.24));if(beat!==beats[0])opacity*=io(progress(d,-.8,-.73));}
    const q=relative(timing(d),target,cfg),p=q.controlPoints,u=.80;
    const point=z=>[0,1].map(j=>(1-z)**3*p[0][j]+3*(1-z)**2*z*p[1][j]+3*(1-z)*z*z*p[2][j]+z*z*z*p[3][j]);
    const deriv=z=>[0,1].map(j=>3*(1-z)**2*(p[1][j]-p[0][j])+6*(1-z)*z*(p[2][j]-p[1][j])+3*z*z*(p[3][j]-p[2][j]));
    const A=point(u),B=point(1),DA=deriv(u),DB=deriv(1),span=(1-u)/3;
    const state=tailCache[Math.max(0,Math.min(tailCache.length-1,Math.round((d+.8)/h)))],flick=Math.max(0,state.x),O=q.outwardNormal,T=q.backTangent;
    const tail=[A,A.map((x,j)=>x+DA[j]*span),B.map((x,j)=>x-DB[j]*span+(O[j]*.72+T[j]*.15)*flick),B.map((x,j)=>x+(O[j]+T[j]*.4)*flick)];
    const end=tail[3],nodes=Array.from({length:97},(_,i)=>{const z=i/96;if(z<=u)return point(z);const a=(z-u)/(1-u);return[0,1].map(j=>(1-a)**3*tail[0][j]+3*(1-a)**2*a*tail[1][j]+3*(1-a)*a*a*tail[2][j]+a*a*a*tail[3][j]);});return {...q,nodes,t,beat,relativeTime:d,artTime:timing(d),opacity,tailControls:tail,tailOffset:flick,tailVelocity:state.v,tip:end,freeTip:end,contact:d>=0&&d<=.04,model:'authored sweep with damped spring tip follow-through',hiddenReset:true};
  }
  return {relative,at,length:len};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=V6Whip;
function buildV6Whip(root,beforeNode,config={}){
  const g=G(root,{id:'v6-traveling-whip'});if(beforeNode){g.remove();root.insertBefore(g,beforeNode);}
  const bands=Array.from({length:9},(_,i)=>el('path',{fill:'none',stroke:'#0b1115','stroke-width':V6_WHIP_STROKE.width(i),'stroke-linecap':'round','stroke-linejoin':'round'},g));
  const rims=Array.from({length:9},(_,i)=>el('path',{fill:'none',stroke:'#c4bbaa','stroke-width':V6_WHIP_STROKE.rim(i),'stroke-linecap':'round','stroke-linejoin':'round',opacity:.95},g));
  const hand=G(root,{id:'v6-driving-hand'});
  if(config.driverImage){const z=config.driverImage;el('image',{href:z.href,x:z.origin[0],y:z.origin[1],width:z.size[0],height:z.size[1]},hand);}
  return {update(t,target,backTangent){const q=V6Whip.at(t,target,{...config,backTangent}),N=q.nodes.length-1;
    const evalCurve=u=>{const tail=u>.8,p=tail?q.tailControls:q.controlPoints,z=tail?(u-.8)/.2:u;return [0,1].map(j=>(1-z)**3*p[0][j]+3*(1-z)**2*z*p[1][j]+3*(1-z)*z*z*p[2][j]+z*z*z*p[3][j]);};
    const evalDerivative=u=>{const tail=u>.8,p=tail?q.tailControls:q.controlPoints,z=tail?(u-.8)/.2:u;return [0,1].map(j=>(3*(1-z)**2*(p[1][j]-p[0][j])+6*(1-z)*z*(p[2][j]-p[1][j])+3*z*z*(p[3][j]-p[2][j]))*(tail?5:1));};
    bands.forEach((p,i)=>{const cuts=V6_WHIP_STROKE.cuts,a=cuts[i],b=cuts[i+1],A=evalCurve(a),B=evalCurve(b),DA=evalDerivative(a),DB=evalDerivative(b),h=(b-a)/3;
      const C=A.map((x,j)=>x+DA[j]*h),D=B.map((x,j)=>x-DB[j]*h),xy=v=>v.map(r1).join(',');
      const d=`M${xy(A)}C${xy(C)} ${xy(D)} ${xy(B)}`;p.setAttribute('d',d);rims[i].setAttribute('d',d);});
    const z=config.driverImage;if(z){const dx=z.tip[0]-z.grip[0],dy=z.tip[1]-z.grip[1],s=(config.handleLength||90)*(config.scale||1)/Math.hypot(dx,dy),a=q.handleAngle-Math.atan2(dy,dx)/DEG;hand.setAttribute('transform',`translate(${r1(q.hand[0])},${r1(q.hand[1])}) rotate(${r1(a)}) scale(${s}) translate(${-z.grip[0]},${-z.grip[1]})`);}vis(g,q.opacity);vis(hand,q.opacity);window.__v6WhipLast=q;return q;
  }};
}
