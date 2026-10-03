/* Seamless inverse perspective sampling of a continuous painted scene.
 * Each source frame is freshly composed from real independent RGBA layers.
 * Camera yaw rotates the view about the registered live red-route endpoint. */
(function(root){'use strict';
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));let cache=null;
 function project(im,ctx,options){
  const o=options||{},w=ctx.canvas.width,h=ctx.canvas.height,iw=im.width,ih=im.height,anchor=o.anchor||[.37,.50],origin=o.sourceAnchor||[.37,.50],yaw=clamp(o.yaw||0,-.60,.60),depth=o.depth||0,alpha=o.alpha===undefined?1:o.alpha;
  if(Math.abs(yaw)<1e-6&&Math.abs(depth)<1e-6&&Math.abs(anchor[0]-origin[0])<1e-6&&Math.abs(anchor[1]-origin[1])<1e-6){ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(im,0,0,w,h);ctx.restore();return;}
  if(!cache||cache.w!==w||cache.h!==h){const c=root.document.createElement('canvas');c.width=w;c.height=h;cache={w,h,canvas:c,ctx:c.getContext('2d')};cache.pixels=cache.ctx.createImageData(w,h);}
  const src=im.getContext('2d').getImageData(0,0,iw,ih).data,out=cache.pixels.data;
  const sn=Math.sin(yaw),cs=Math.cos(yaw),aspect=w/h,f=1.9,zoom=1+.55*Math.abs(yaw);
  for(let x=0;x<w;x++){
   const q=((x+.5)/w-anchor[0])*aspect;
   const u=(q*(f+depth*cs)+f*depth*sn)/(f*cs-q*sn);
   const k=f/(f+u*sn+depth*cs),sx=clamp((u/(aspect*zoom)+origin[0])*iw-.5,0,iw-1.001),ix=Math.floor(sx),fx=sx-ix;
   for(let y=0;y<h;y++){
    const v=((y+.5)/h-anchor[1])/k,sy=clamp((v/zoom+origin[1])*ih-.5,0,ih-1.001),iy=Math.floor(sy),fy=sy-iy;
    const a=(iy*iw+ix)*4,b=a+4,c=a+iw*4,d=c+4,j=(y*w+x)*4;
    const aa=(1-fx)*(1-fy),bb=fx*(1-fy),cc=(1-fx)*fy,dd=fx*fy;
    out[j]=src[a]*aa+src[b]*bb+src[c]*cc+src[d]*dd;
    out[j+1]=src[a+1]*aa+src[b+1]*bb+src[c+1]*cc+src[d+1]*dd;
    out[j+2]=src[a+2]*aa+src[b+2]*bb+src[c+2]*cc+src[d+2]*dd;
    out[j+3]=(src[a+3]*aa+src[b+3]*bb+src[c+3]*cc+src[d+3]*dd)*alpha;
   }
  }
  cache.ctx.putImageData(cache.pixels,0,0);ctx.drawImage(cache.canvas,0,0);return{anchor,sourceAnchor:origin,yaw,depth,method:'inverse plane homography; no triangle seams'};
 }
 root.RoutePaperProjection={project};
})(typeof globalThis!=='undefined'?globalThis:this);
