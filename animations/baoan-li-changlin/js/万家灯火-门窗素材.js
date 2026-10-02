'use strict';
/* Stylized loess-cave door/window structures. General forms are informed by
 * Shaanxi's Wuqi wooden-window craft; no reference-photo pixels are copied. */
function buildVillageWindowMaterials(){
  const specs=[
    {w:55,h:66,door:'left',lattice:'square',stone:true,tint:'#efc683'},
    {w:63,h:59,door:'right',lattice:'diamond',stone:false,tint:'#e4b977'},
    {w:48,h:70,door:'center',lattice:'upright',stone:true,tint:'#f0d09a'},
    {w:45,h:65,door:'right',lattice:'square',stone:true,tint:'#d6ad72'},
    {w:59,h:64,door:'left',lattice:'mixed',stone:false,tint:'#f2cc8b'},
  ];
  const definitions=[];
  const arch=(w,h,bottom=0)=>{const r=w/2,cy=bottom-h+r;return `M${-r},${bottom}V${cy}A${r},${r} 0 0 1 ${r},${cy}V${bottom}Z`;};
  const line=(g,d,color,width=1,opacity=1)=>el('path',{d,fill:'none',stroke:color,'stroke-width':width,'stroke-linecap':'round',opacity},g);
  specs.forEach((s,kind)=>{
    const id=uid('village-window'),base=el('g',{id:id+'-base'},DEFS),lit=el('g',{id:id+'-lit'},DEFS);
    const r=s.w/2,ir=r-5,cy=-s.h+r,beam=-29,wood='#353037',shadow='#080d19';
    const outline=arch(s.w,s.h),inside=`M${-ir},0V${cy}A${ir},${ir} 0 0 1 ${ir},${cy}V0Z`;
    const surround=`M${-r-5},2L${-r-4},${cy+2}Q${-r-6},${-s.h+5} -2,${-s.h-5}Q${r+5},${-s.h-2} ${r+5},${cy}L${r+4},3Z`;
    el('path',{d:surround,fill:kind%2?'#353844':'#3b3e4b'},base);
    el('path',{d:surround,fill:'url(#pat-grit)',opacity:.13},base);
    el('path',{d:outline,fill:kind%2?'#48474a':'#50515a'},base);
    if(s.stone){
      for(let n=0;n<9;n++){
        const a=Math.PI+n*Math.PI/9,b=a+Math.PI/9-.024;
        const p=(rad,angle)=>[r1(Math.cos(angle)*rad),r1(cy+Math.sin(angle)*rad)];
        const A=p(r,a),B=p(r,b),C=p(ir+.2,b),D=p(ir+.2,a);
        el('path',{d:`M${A}A${r},${r} 0 0 1 ${B}L${C}A${ir+.2},${ir+.2} 0 0 0 ${D}Z`,fill:['#535360','#494b58','#62606a'][n%3],stroke:'#282d3e','stroke-width':.4,opacity:.82},base);
      }
      for(const side of [-1,1])for(let n=0;n<3;n++)line(base,`M${side*(r-4)},${cy+8+n*9}h${side*4}`,'#282c39',.65,.7);
    }else{
      line(base,`M${-r-2},${cy+3}Q${-r-5},${-s.h+11} -4,${-s.h-2}Q${r+4},${-s.h+1} ${r+3},${cy-2}`,'#6d6263',1,.52);
      line(base,`M${-r-4},-13l3,-7 -2,-5M${r+3},-10l-3,-5 2,-4`,'#1d2536',.7,.7);
    }
    el('path',{d:inside,fill:shadow},base);
    const upper=`M${-ir},${beam}V${cy}A${ir},${ir} 0 0 1 ${ir},${cy}V${beam}Z`;
    const paperId=id+'-paper';
    lgrad(paperId,[[0,mixHex(s.tint,'#fff2cd',.3)],[.56,s.tint],[1,mixHex(s.tint,'#965327',.33)]],{x1:0,y1:0,x2:.35,y2:1});
    function pane(g,d,bright){
      el('path',{d,fill:bright?`url(#${paperId})`:'#1b202b'},g);
      if(bright)el('path',{d,fill:'url(#pat-paper)',opacity:.08},g);
    }
    function lattice(g,d,bounds,style,bright){
      pane(g,d,bright);
      const clipId=uid('village-lattice');el('path',{d},el('clipPath',{id:clipId},DEFS));
      const bars=G(g,{'clip-path':`url(#${clipId})`});
      const color=bright?'#60452f':'#353540',x0=bounds[0],x1=bounds[1],y0=bounds[2],y1=bounds[3];
      if(style==='diamond'){
        for(let x=x0-35;x<x1+35;x+=9){line(bars,`M${x},${y0}l${y1-y0},${y1-y0}`,color,.95);line(bars,`M${x},${y0}l${-(y1-y0)},${y1-y0}`,color,.95);}
      }else{
        const spacing=style==='upright'?8:7;
        for(let x=x0+spacing;x<x1;x+=spacing)line(bars,`M${x},${y0}V${y1}`,color,.95);
        for(let y=y0+spacing;y<y1;y+=style==='upright'?16:spacing)line(bars,`M${x0},${y}H${x1}`,color,.9);
      }
      line(g,d,bright?'#73513a':'#48424a',1.25);
    }
    function facade(g,bright){
      const upperStyle=s.lattice==='mixed'?'diamond':s.lattice;
      lattice(g,upper,[-ir,ir,-s.h+4,beam],upperStyle,bright);
      if(kind===1||kind===3||kind===4){
        const center=`M-7,${beam}V${-s.h+11}H7V${beam}Z`;
        lattice(g,center,[-7,7,-s.h+11,beam],kind===4?'upright':'square',bright);
      }
      const beamColor=bright?'#69523d':wood;
      el('rect',{x:-ir-1,y:beam-1,width:ir*2+2,height:3,fill:beamColor},g);
      const doorW=s.door==='center'?19:18,doorX=s.door==='left'?-ir:s.door==='right'?ir-doorW:-doorW/2;
      el('rect',{x:doorX,y:beam+2,width:doorW,height:-beam-2,fill:bright?'#514333':'#292a33'},g);
      line(g,`M${doorX+doorW/2},${beam+3}V0M${doorX+2},-12H${doorX+doorW-2}`,bright?'#806443':'#49414a',.8,.8);
      line(g,`M${doorX+3},${beam+5}q1,5 .3,9M${doorX+doorW-4},-11q-1,4 -.2,8`,bright?'#9f8054':'#5d5050',.45,.35);
      const windows=s.door==='center'?[[-ir,doorX-2],[doorX+doorW+2,ir]]:s.door==='left'?[[doorX+doorW+3,ir]]:[[-ir,doorX-3]];
      windows.forEach(([a,b],i)=>{
        const bottom=kind===3?-9:-6,d=`M${a},${beam+4}H${b}V${bottom}H${a}Z`;
        lattice(g,d,[a,b,beam+4,bottom],kind===2?'upright':'square',bright);
        if(kind===4){el('path',{d:`M${a},${beam+4}H${b}L${b-3},-13Q${a+4},-9 ${a},-15Z`,fill:bright?'#987650':'#39343b',opacity:.8},g);line(g,`M${a+3},${beam+6}l1,9M${b-3},${beam+6}l-1,8`,bright?'#b49362':'#5c4548',.7,.65);}
      });
      line(g,`M${-ir-1},1H${ir+2}`,bright?'#74644e':'#494553',2,.85);
    }
    facade(base,false);facade(lit,true);
    line(base,`M${-r-3},3Q0,6 ${r+4},3`,'#0b1020',3,.6);
    definitions.push({base:id+'-base',lit:id+'-lit',width:s.w,height:s.h,tint:s.tint,kind:s.door+'-'+s.lattice});
  });
  return function(parent,index){
    const variant=(index*3+Math.floor(index/4))%definitions.length,d=definitions[variant];
    el('use',{href:'#'+d.base},parent);
    const lit=G(parent,{opacity:0});
    el('ellipse',{cx:0,cy:-28,rx:42,ry:34,fill:'url(#g-win-glow)',opacity:.5},lit);
    el('use',{href:'#'+d.lit},lit);
    return {lit,variant:d.kind,brightness:index%11===3?.10:index%7===2?.44:.77+.23*hash1(index*31+55)};
  };
}

function buildVillageFacade(parent,homes,scale,kind){
  if(!homes.length)return;
  const a=homes[0],b=homes.at(-1),pad=(kind===2?41:34)*scale;
  const x0=a.x-pad,x1=b.x+pad;
  const tops=homes.map((p,i)=>[p.x,p.y-(kind===1?74:81)*scale+(i%2?2:-2)*scale]);
  const base=homes.map(p=>[p.x,p.y+5*scale]);
  const leftTop=tops[0][1],rightTop=tops.at(-1)[1];
  let d=`M${r1(x0)},${r1(a.y+6*scale)}L${r1(x0-3*scale)},${r1(leftTop+15*scale)}L${r1(x0+7*scale)},${r1(leftTop+4*scale)}`;
  for(const [x,y]of tops)d+=`L${r1(x-15*scale)},${r1(y+2*scale)}L${r1(x+11*scale)},${r1(y)}`;
  d+=`L${r1(x1-6*scale)},${r1(rightTop+5*scale)}L${r1(x1+3*scale)},${r1(b.y+6*scale)}`;
  for(const [x,y]of base.slice().reverse())d+=`L${r1(x)},${r1(y)}`;
  d+='Z';
  const wall=G(parent);
  el('path',{d,fill:['#30374c','#33384a','#2b334a'][kind]},wall);
  el('path',{d,fill:'url(#pat-grit-l)',opacity:.16},wall);
  let topLine=`M${r1(x0+7*scale)},${r1(leftTop+4*scale)}`;
  for(const [x,y]of tops)topLine+=`L${r1(x-15*scale)},${r1(y+2*scale)}L${r1(x+11*scale)},${r1(y)}`;
  topLine+=`L${r1(x1-6*scale)},${r1(rightTop+5*scale)}`;
  el('path',{d:topLine,fill:'none',stroke:'#77717a','stroke-width':1.25*scale,opacity:.22},wall);
  const side=`M${r1(x1-6*scale)},${r1(rightTop+5*scale)}L${r1(x1+9*scale)},${r1(rightTop+13*scale)}L${r1(x1+13*scale)},${r1(b.y+11*scale)}L${r1(x1+3*scale)},${r1(b.y+6*scale)}Z`;
  el('path',{d:side,fill:'#151e33',opacity:.8},wall);
  // A shared ledge and bank connect the openings to the slope.
  let ledge=`M${r1(x0-6*scale)},${r1(a.y+7*scale)}`;
  for(const p of homes)ledge+=`L${r1(p.x)},${r1(p.y+7*scale)}`;
  ledge+=`L${r1(x1+9*scale)},${r1(b.y+9*scale)}L${r1(x1+4*scale)},${r1(b.y+17*scale)}`;
  for(const p of homes.slice().reverse())ledge+=`L${r1(p.x)},${r1(p.y+14*scale)}`;
  ledge+=`L${r1(x0-7*scale)},${r1(a.y+14*scale)}Z`;
  el('path',{d:ledge,fill:'#1b253b'},wall);
  el('path',{d:ledge,fill:'url(#pat-grit)',opacity:.12},wall);
  const apronId=uid('village-soil-apron');
  lgrad(apronId,[[0,'#303950',.48],[.4,'#252e45',.23],[1,'#1a2239',0]],{x1:0,y1:0,x2:0,y2:1});
  let apron=`M${r1(x0-7*scale)},${r1(a.y+13*scale)}`;
  for(const p of homes)apron+=`L${r1(p.x)},${r1(p.y+13*scale)}`;
  apron+=`L${r1(x1+10*scale)},${r1(b.y+14*scale)}L${r1(x1+28*scale)},${r1(b.y+35*scale)}`;
  for(const [i,p]of homes.slice().reverse().entries())apron+=`L${r1(p.x+((i%2)*8-4)*scale)},${r1(p.y+(34+i%2*7)*scale)}`;
  apron+=`L${r1(x0-24*scale)},${r1(a.y+32*scale)}Z`;
  el('path',{d:apron,fill:`url(#${apronId})`},wall);

  homes.forEach((p,i)=>{
    const x=p.x,y=p.y,r=(kind===1?32:31)*scale,h=(kind===1?71:76)*scale,cy=y-h+r;
    el('path',{d:`M${r1(x-r)},${r1(y+2*scale)}V${r1(cy)}A${r1(r)},${r1(r)} 0 0 1 ${r1(x+r)},${r1(cy)}V${r1(y+2*scale)}Z`,fill:'#283146',opacity:.12},wall);
    el('path',{d:`M${r1(x-r-3*scale)},${r1(y-7*scale)}l${r1(-3*scale)},${r1(-12*scale)} ${r1(2*scale)},${r1(-8*scale)}`,fill:'none',stroke:'#171e31','stroke-width':.9*scale,opacity:.5},wall);
    if(i<homes.length-1&&kind!==2){
      const n=homes[i+1],mx=(p.x+n.x)/2,yy=(p.y+n.y)/2;
      if(n.x-p.x>56*scale)el('path',{d:`M${r1(mx-3*scale)},${r1(yy+6*scale)}L${r1(mx-5*scale)},${r1(yy-43*scale)}L${r1(mx+2*scale)},${r1(yy-52*scale)}L${r1(mx+6*scale)},${r1(yy+7*scale)}Z`,fill:'#3d4050',opacity:.65},wall);
    }
  });
  if(kind===2){
    const y=a.y+9*scale;
    el('path',{d:`M${r1(x0-7*scale)},${r1(y)}V${r1(y-13*scale)}L${r1(a.x-12*scale)},${r1(y-11*scale)}V${r1(y+5*scale)}Z`,fill:'#384053'},wall);
    el('path',{d:`M${r1(x0-7*scale)},${r1(y-13*scale)}L${r1(a.x-12*scale)},${r1(y-11*scale)}`,stroke:'#827a78','stroke-width':1.4*scale,opacity:.3},wall);
  }
}
