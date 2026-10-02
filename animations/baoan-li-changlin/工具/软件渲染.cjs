'use strict';
const fs=require('fs'),path=require('path');
const dependency=require('./依赖加载.cjs');
const sharp=dependency('sharp'),{createCanvas,loadImage}=dependency('@napi-rs/canvas');
const loader=require('./场景适配.cjs');
const lookup=(collection,id)=>collection instanceof Map?collection.get(id):collection?.[id];
const element=(scene,id)=>lookup(scene.ids,id)||scene.ctx.document.getElementById(id);
const canvas=(scene,id)=>{const c=lookup(scene.canvases,id),e=element(scene,id);return c||e?._canvas||e?.canvas||e;};
async function render(scene,t,file,width=1280,saveSVG=false,options={}){
 scene.ctx.__anim.renderAt(t);
 const world=scene.svg||element(scene,'world'),transform=world.style.transform||'',shift=/translate\(\s*([-\d.]+)px\s*,\s*([-\d.]+)px\s*\)/.exec(transform);
 world.style.transform='';
 let svg;try{svg=scene.serialize?scene.serialize(world,{pruneHidden:true,shareTextureImages:options.shareTextureImages!==false}):loader.serialize?loader.serialize(world,{pruneHidden:true,shareTextureImages:options.shareTextureImages!==false}):world.outerHTML;}finally{world.style.transform=transform;}
 if(!svg?.startsWith('<svg'))throw Error('Loader did not serialize an SVG root');
 const height=Math.round(width*1080/1920),scale=width/1920,out=createCanvas(width,height),ctx=out.getContext('2d');
 ctx.fillStyle='#0a0705';ctx.fillRect(0,0,width,height);
 const raster=await sharp(Buffer.from(svg),{density:72}).resize(width,height).png().toBuffer();
 ctx.drawImage(await loadImage(raster),shift?+shift[1]*scale:0,shift?+shift[2]*scale:0,width,height);
 ctx.drawImage(canvas(scene,'fx'),0,0,width,height);
 const grade=element(scene,'grade');ctx.save();ctx.globalCompositeOperation='soft-light';ctx.globalAlpha=Math.max(0,Math.min(1,+grade.style.opacity||0));ctx.fillStyle=grade.style.background||'#000';ctx.fillRect(0,0,width,height);ctx.restore();
 ctx.save();ctx.globalCompositeOperation='overlay';ctx.globalAlpha=.3;ctx.drawImage(canvas(scene,'grain'),0,0,width,height);ctx.restore();
 const flash=element(scene,'flash');ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,+flash.style.opacity||0));ctx.fillStyle=flash.style.background||'#fff';ctx.fillRect(0,0,width,height);ctx.restore();
 const vig=element(scene,'vig');ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,+vig.style.opacity||0));ctx.translate(width*.5,height*.48);ctx.scale(width*.72,height*.68);const gradient=ctx.createRadialGradient(0,0,0,0,0,1);gradient.addColorStop(.52,'rgba(0,0,0,0)');gradient.addColorStop(.82,'rgba(0,0,0,.34)');gradient.addColorStop(1,'rgba(0,0,0,.62)');ctx.fillStyle=gradient;ctx.fillRect(-2,-2,4,4);ctx.restore();
 fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,out.toBuffer('image/png'));if(saveSVG)fs.writeFileSync(file.replace(/\.png$/,'.svg'),svg);
 return {file,t,width,height};
}
module.exports={makeScene:loader.makeScene,render};
if(require.main===module)(async()=>{const[source,out,list,width='1280']=process.argv.slice(2),scene=await loader.makeScene(source);for(const t of list.split(',').map(Number)){const p=path.join(out,`frame-${t}.png`);await render(scene,t,p,+width);console.log(p);}})().catch(e=>{console.error(e);process.exit(1)});
