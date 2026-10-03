'use strict';
/* Local software scene adapter. Executes the index's original local script files,
 * without a browser, network, source changes, or substitutions for image assets. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const {pathToFileURL,fileURLToPath}=require('url');
const dependency=require('./依赖加载.cjs');
const native=dependency('@napi-rs/canvas');
const sharp=dependency('sharp');
const NS='http://www.w3.org/2000/svg';
const escapeXML=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const unescapeXML=s=>String(s).replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const cssKey=k=>String(k).replace(/[A-Z]/g,m=>'-'+m.toLowerCase());
function styleDeclaration(){
  const values=Object.create(null);
  const methods={
    setProperty(k,v){values[cssKey(k)]=String(v);},
    getPropertyValue(k){return values[cssKey(k)]||'';},
    removeProperty(k){const old=values[cssKey(k)]||'';delete values[cssKey(k)];return old;},
    get cssText(){return Object.entries(values).filter(([,v])=>v!=='').map(([k,v])=>`${k}:${v}`).join(';');},
    set cssText(v){for(const k of Object.keys(values))delete values[k];for(const part of String(v).split(';')){const at=part.indexOf(':');if(at>0)values[part.slice(0,at).trim()]=part.slice(at+1).trim();}},
  };
  return new Proxy(methods,{get(t,k){if(k in t)return Reflect.get(t,k);return typeof k==='string'?values[cssKey(k)]||'':undefined;},set(t,k,v){if(k==='cssText')t.cssText=v;else values[cssKey(k)]=String(v);return true;},ownKeys(){return Reflect.ownKeys(values);},getOwnPropertyDescriptor(t,k){return {enumerable:true,configurable:true,value:values[k]};}});
}
function splitSelectors(s){const out=[];let cur='',depth=0,q='';for(const c of s){if(q){cur+=c;if(c===q)q='';continue;}if(c==='"'||c==="'"){q=c;cur+=c;continue;}if(c==='['||c==='(')depth++;if(c===']'||c===')')depth--;if(c===','&&depth===0){out.push(cur.trim());cur='';}else cur+=c;}if(cur.trim())out.push(cur.trim());return out;}
function matchSimple(el,selector){
  selector=selector.trim();if(!selector||el.nodeType!==1)return false;
  const attrs=[];selector=selector.replace(/\[([^\]]+)\]/g,(_,a)=>{attrs.push(a);return '';});
  const tag=selector.match(/^[\w*:-]+/);if(tag&&tag[0]!=='*'&&el.tagName.toLowerCase()!==tag[0].toLowerCase())return false;
  for(const m of selector.matchAll(/#([\w-]+)/g))if(el.id!==m[1])return false;
  for(const m of selector.matchAll(/\.([\w-]+)/g))if(!el.classList.contains(m[1]))return false;
  for(const a of attrs){const m=a.match(/^\s*([^\s~|^$*=]+)\s*(?:(\^=|\$=|\*=|~=|\|=|=)\s*["']?(.*?)["']?)?\s*$/);if(!m)return false;const val=el.getAttribute(m[1]);if(val==null)return false;if(m[2]){const expected=m[3];if(m[2]==='='&&val!==expected)return false;if(m[2]==='^='&&!val.startsWith(expected))return false;if(m[2]==='$='&&!val.endsWith(expected))return false;if(m[2]==='*='&&!val.includes(expected))return false;if(m[2]==='~='&&!val.split(/\s+/).includes(expected))return false;if(m[2]==='|='&&val!==expected&&!val.startsWith(expected+'-'))return false;}}
  return true;
}
function matches(el,selector){
  return splitSelectors(selector).some(sel=>{const tokens=sel.match(/(?:\[[^\]]*\]|[^\s>])+/g)||[];if(!tokens.length)return false;let cur=el;if(!matchSimple(cur,tokens.pop()))return false;while(tokens.length){const token=tokens.pop();cur=cur.parentNode;while(cur&&!matchSimple(cur,token))cur=cur.parentNode;if(!cur)return false;}return true;});
}
function multiply(a,b){return [a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];}
function transformMatrix(s){let out=[1,0,0,1,0,0];for(const m of String(s||'').matchAll(/(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g)){const a=m[2].trim().split(/[\s,]+/).map(Number),r=(a[0]||0)*Math.PI/180;let b;if(m[1]==='matrix')b=a;else if(m[1]==='translate')b=[1,0,0,1,a[0]||0,a[1]||0];else if(m[1]==='scale')b=[a[0],0,0,a.length>1?a[1]:a[0],0,0];else if(m[1]==='rotate'){b=[Math.cos(r),Math.sin(r),-Math.sin(r),Math.cos(r),0,0];if(a.length>1)b=multiply(multiply([1,0,0,1,a[1],a[2]],b),[1,0,0,1,-a[1],-a[2]]);}else if(m[1]==='skewX')b=[1,0,Math.tan(r),1,0,0];else b=[1,Math.tan(r),0,1,0,0];out=multiply(out,b);}return out;}
function transformBox(b,m){const p=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].map(([x,y])=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]]);return boxOfPoints(p);}
function boxOfPoints(p){if(!p.length)return {x:0,y:0,width:0,height:0};const xs=p.map(p=>p[0]),ys=p.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys);return{x,y,width:Math.max(...xs)-x,height:Math.max(...ys)-y};}
function pathMetric(d){
  const canonical=new native.Path2D(d||'').toSVGString();
  const tok=canonical.match(/[MLCQZ]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g)||[];
  const pts=[],cum=[];let i=0,p=[0,0],start=p,total=0,cmd='';
  const push=(q,move=false)=>{if(pts.length&&!move)total+=Math.hypot(q[0]-p[0],q[1]-p[1]);pts.push(q);cum.push(total);p=q;};
  const lerp=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
  const flatten=(ps,depth=0)=>{const chord=Math.hypot(ps.at(-1)[0]-ps[0][0],ps.at(-1)[1]-ps[0][1]);let polygon=0;for(let j=1;j<ps.length;j++)polygon+=Math.hypot(ps[j][0]-ps[j-1][0],ps[j][1]-ps[j-1][1]);if(depth>=18||polygon-chord<.001){push(ps.at(-1));return;}const left=[ps[0]],right=[ps.at(-1)];let layer=ps;while(layer.length>1){layer=layer.slice(1).map((q,j)=>lerp(layer[j],q));left.push(layer[0]);right.unshift(layer.at(-1));}flatten(left,depth+1);flatten(right,depth+1);};
  const pair=()=>[+tok[i++],+tok[i++]];
  while(i<tok.length){if(/[MLCQZ]/.test(tok[i]))cmd=tok[i++];if(cmd==='M'){start=pair();push(start,true);cmd='L';}else if(cmd==='L')push(pair());else if(cmd==='C')flatten([p,pair(),pair(),pair()]);else if(cmd==='Q')flatten([p,pair(),pair()]);else if(cmd==='Z'){push(start);cmd='';}else throw new Error('Unsupported canonical SVG path command '+cmd);}
  return {length:total,at(length){if(!pts.length)return{x:0,y:0};const v=Math.max(0,Math.min(total,length));let lo=0,hi=cum.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(cum[mid]<v)lo=mid;else hi=mid;}const k=(v-cum[lo])/(cum[hi]-cum[lo]||1),a=pts[lo],b=pts[hi];return{x:a[0]+(b[0]-a[0])*k,y:a[1]+(b[1]-a[1])*k};}};
}
class Element {
  constructor(tag,doc,ns=null){this.nodeType=1;this.tagName=tag;this.localName=tag;this.namespaceURI=ns;this.ownerDocument=doc;this.parentNode=null;this.childNodes=[];this._attrs=Object.create(null);this.style=styleDeclaration();this._text='';this._events=Object.create(null);const self=this;this.classList={contains(c){return (self.getAttribute('class')||'').split(/\s+/).includes(c);},add(...cs){self.setAttribute('class',[...new Set((self.getAttribute('class')||'').split(/\s+/).filter(Boolean).concat(cs))].join(' '));},remove(...cs){self.setAttribute('class',(self.getAttribute('class')||'').split(/\s+/).filter(c=>!cs.includes(c)).join(' '));},toggle(c,force){const on=force===undefined?!this.contains(c):force;on?this.add(c):this.remove(c);return on;}};}
  get children(){return this.childNodes.filter(n=>n.nodeType===1);}
  get parentElement(){return this.parentNode?.nodeType===1?this.parentNode:null;}
  get firstChild(){return this.childNodes[0]||null;}
  get lastChild(){return this.childNodes[this.childNodes.length-1]||null;}
  get firstElementChild(){return this.children[0]||null;}
  get nextSibling(){if(!this.parentNode)return null;const a=this.parentNode.childNodes;return a[a.indexOf(this)+1]||null;}
  get previousSibling(){if(!this.parentNode)return null;const a=this.parentNode.childNodes;return a[a.indexOf(this)-1]||null;}
  get id(){return this.getAttribute('id')||'';}set id(v){this.setAttribute('id',v);}
  get attributes(){return Object.entries(this._attrs).map(([name,value])=>({name,value,nodeName:name,nodeValue:value}));}
  get isConnected(){let n=this;while(n){if(n===this.ownerDocument)return true;n=n.parentNode;}return false;}
  setAttribute(k,v){if(k==='style')this.style.cssText=String(v);else this._attrs[k]=String(v);if(k==='width'||k==='height'){if(this._canvas)this._canvas[k]=Math.max(1,Number(v)||1);}}
  setAttributeNS(ns,k,v){this.setAttribute(k,v);}
  getAttribute(k){return k==='style'?(this.style.cssText||null):(Object.hasOwn(this._attrs,k)?this._attrs[k]:null);}
  getAttributeNS(ns,k){return this.getAttribute(k)||this.getAttribute('xlink:'+k);}
  hasAttribute(k){return this.getAttribute(k)!==null;}
  removeAttribute(k){if(k==='style')this.style.cssText='';else delete this._attrs[k];}
  appendChild(n){return this.insertBefore(n,null);}
  append(...nodes){for(const n of nodes)this.appendChild(typeof n==='string'?this.ownerDocument.createTextNode(n):n);}
  prepend(...nodes){for(const n of nodes.reverse())this.insertBefore(typeof n==='string'?this.ownerDocument.createTextNode(n):n,this.firstChild);}
  insertBefore(n,ref){if(n===ref)return n;if(ref!==null&&ref!==undefined&&!this.childNodes.includes(ref))throw new Error('NotFoundError: insertion reference is not a child');if(n===this||n.contains?.(this))throw new Error('HierarchyRequestError');if(n.parentNode)n.parentNode.removeChild(n);const i=ref==null?this.childNodes.length:this.childNodes.indexOf(ref);this.childNodes.splice(i,0,n);n.parentNode=this;return n;}
  removeChild(n){const i=this.childNodes.indexOf(n);if(i<0)throw new Error('NotFoundError: not a child');this.childNodes.splice(i,1);n.parentNode=null;return n;}
  replaceChild(n,old){if(n===old)return old;this.insertBefore(n,old);this.removeChild(old);return old;}
  remove(){if(this.parentNode)this.parentNode.removeChild(this);}
  contains(n){for(let cur=n;cur;cur=cur.parentNode)if(cur===this)return true;return false;}
  cloneNode(deep=false){const n=this.ownerDocument.createElementNS(this.namespaceURI,this.tagName);for(const [k,v]of Object.entries(this._attrs))n.setAttribute(k,v);n.style.cssText=this.style.cssText;n._text=this._text;if(deep)for(const child of this.childNodes)n.appendChild(child.cloneNode(true));return n;}
  matches(s){return matches(this,s);}
  querySelectorAll(s){const out=[];const visit=n=>{for(const c of n.childNodes){if(c.nodeType===1){if(matches(c,s))out.push(c);visit(c);}}};visit(this);return out;}
  querySelector(s){return this.querySelectorAll(s)[0]||null;}
  getElementsByTagName(tag){return this.querySelectorAll(tag);}
  get textContent(){return this._text+this.childNodes.map(n=>n.textContent).join('');}
  set textContent(s){for(const n of this.childNodes)n.parentNode=null;this.childNodes=[];this._text=String(s);}
  get innerHTML(){return escapeXML(this._text)+this.childNodes.map(n=>this.ownerDocument._serialize(n)).join('');}
  set innerHTML(html){this.textContent='';parseMarkup(String(html),this,this.ownerDocument);}
  get outerHTML(){return this.ownerDocument._serialize(this);}
  addEventListener(name,fn){(this._events[name]||=[]).push(fn);}
  removeEventListener(name,fn){this._events[name]=(this._events[name]||[]).filter(f=>f!==fn);}
  dispatchEvent(evt){evt.target=this;for(const f of this._events[evt.type]||[])f(evt);return true;}
  click(){this.dispatchEvent({type:'click'});}
  requestFullscreen(){this.ownerDocument.fullscreenElement=this;return Promise.resolve();}
  _pathMetric(){const d=this.getAttribute('d')||'';if(this._metricD!==d){this._metricD=d;this._metric=pathMetric(d);}return this._metric;}
  getTotalLength(){return this._pathMetric().length;}
  getPointAtLength(length){return this._pathMetric().at(length);}
  getBBox(){
    const n=k=>Number(this.getAttribute(k)||0);let p=[];
    switch(this.tagName.toLowerCase()){
      case 'rect':case 'image':case 'svg':case 'foreignobject':return {x:n('x'),y:n('y'),width:n('width'),height:n('height')};
      case 'circle':return {x:n('cx')-n('r'),y:n('cy')-n('r'),width:n('r')*2,height:n('r')*2};
      case 'ellipse':return {x:n('cx')-n('rx'),y:n('cy')-n('ry'),width:n('rx')*2,height:n('ry')*2};
      case 'line':p=[[n('x1'),n('y1')],[n('x2'),n('y2')]];break;
      case 'path':{const vals=new native.Path2D(this.getAttribute('d')||'').computeTightBounds();return {x:vals[0],y:vals[1],width:vals[2]-vals[0],height:vals[3]-vals[1]};}
      case 'polyline':case 'polygon':{const vals=(this.getAttribute('points')||'').trim().split(/[\s,]+/).map(Number);for(let i=0;i+1<vals.length;i+=2)p.push([vals[i],vals[i+1]]);break;}
      case 'use':{const ref=this.ownerDocument.getElementById((this.getAttribute('href')||this.getAttribute('xlink:href')||'').slice(1));const b=ref?ref.getBBox():{x:0,y:0,width:0,height:0};return {...b,x:b.x+n('x'),y:b.y+n('y')};}
      case 'text':{const size=n('font-size')||16;return{x:n('x'),y:n('y')-size,width:this.textContent.length*size*.6,height:size};}
      default:for(const child of this.children){if(['defs','clippath','mask','filter'].includes(child.tagName.toLowerCase()))continue;const b=transformBox(child.getBBox(),transformMatrix(child.getAttribute('transform')));p.push([b.x,b.y],[b.x+b.width,b.y+b.height]);}
    }return boxOfPoints(p);
  }
}
class TextNode {constructor(text,doc){this.nodeType=3;this.textContent=text;this.ownerDocument=doc;this.parentNode=null;}cloneNode(){return new TextNode(this.textContent,this.ownerDocument);}}
class CanvasElement extends Element {
  constructor(doc){super('canvas',doc);this._canvas=native.createCanvas(300,150);this._contexts=new Map();}
  get width(){return this._canvas.width;}set width(v){this._canvas.width=v;this._attrs.width=String(v);}
  get height(){return this._canvas.height;}set height(v){this._canvas.height=v;this._attrs.height=String(v);}
  getContext(type,options){if(this._contexts.has(type))return this._contexts.get(type);const ctx=this._canvas.getContext(type,options);if(!ctx)return null;const owner=this;const wrapper=new Proxy(ctx,{get(t,k){if(k==='canvas')return owner;const v=t[k];if(typeof v!=='function')return v;if(k==='drawImage'||k==='createPattern')return (image,...args)=>v.call(t,image?._canvas||image,...args);return v.bind(t);},set(t,k,v){t[k]=v;return true;}});this._contexts.set(type,wrapper);return wrapper;}
  toDataURL(...a){return this._canvas.toDataURL(...a);}
  toBuffer(...a){return this._canvas.toBuffer(...a);}
  toBlob(callback,type='image/png'){const bytes=this._canvas.toBuffer(type);queueMicrotask(()=>callback({bytes,type,size:bytes.length,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)}));}
}
function parseMarkup(html,parent,doc){const stack=[parent];const tokens=html.match(/<!--[\s\S]*?-->|<![^>]*>|<[^>]+>|[^<]+/g)||[];for(const token of tokens){if(token.startsWith('<!'))continue;if(token.startsWith('</')){if(stack.length>1)stack.pop();continue;}if(token.startsWith('<')){const m=token.match(/^<\s*([^\s/>]+)/);if(!m)continue;const tag=m[1];const el=doc.createElementNS(stack.at(-1).namespaceURI||(tag==='svg'?NS:null),tag);for(const a of token.slice(m[0].length).matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)){if(a[1]!=='/')el.setAttribute(a[1],unescapeXML(a[2]??a[3]??a[4]??''));}stack.at(-1).appendChild(el);if(!token.endsWith('/>')&&!['meta','link','input','br','hr','img'].includes(tag.toLowerCase()))stack.push(el);}else if(token.trim())stack.at(-1).appendChild(doc.createTextNode(unescapeXML(token)));}}
async function makeScene(sourceDir,options={}){
  sourceDir=path.resolve(sourceDir);const indexPath=path.join(sourceDir,'index.html'),html=fs.readFileSync(indexPath,'utf8');
  const manifest={index:{path:indexPath,sha256:hash(html)},scripts:[],assets:[],mode:'Original index script files in local software DOM, native Canvas 2D; no browser execution'};
  const assets=new Map(),pending=new Set(),blobs=new Map();let blobId=0;
  function allowedLocal(h){if(/^data:|^blob:/.test(h))return h;if(/^[a-z][\w+.-]*:/i.test(h)&&!h.startsWith('file:'))throw new Error('External asset forbidden: '+h);const full=h.startsWith('file:')?fileURLToPath(h):path.resolve(sourceDir,decodeURIComponent(h.split(/[?#]/)[0]));const rel=path.relative(sourceDir,full);if(rel.startsWith('..')||path.isAbsolute(rel))throw new Error('Asset outside scene source: '+h);return full;}
  async function loadAsset(h){if(assets.has(h))return assets.get(h);let recPromise=(async()=>{const local=allowedLocal(h);let bytes;if(h.startsWith('data:')){const m=h.match(/^data:([^,]*?),(.*)$/s);bytes=Buffer.from(m[2],/;base64/i.test(m[1])?'base64':'utf8');}else if(h.startsWith('blob:')){if(!blobs.has(h))throw new Error('Unknown generated object URL: '+h);bytes=blobs.get(h);}else bytes=await fs.promises.readFile(local);const metadata=await sharp(bytes).metadata();const png=await sharp(bytes).png().toBuffer();const rec={href:h,path:/^data:|^blob:/.test(h)?null:local,width:metadata.width,height:metadata.height,format:metadata.format,sourceSha256:hash(bytes),pngSha256:hash(png),bytes:png,dataURI:'data:image/png;base64,'+png.toString('base64')};manifest.assets.push({href:h.startsWith('data:')?'data:'+hash(bytes):h,path:rec.path,width:rec.width,height:rec.height,format:rec.format,sourceSha256:rec.sourceSha256,pngSha256:rec.pngSha256});assets.set(h,rec);return rec;})();assets.set(h,recPromise);pending.add(recPromise);try{return await recPromise;}finally{pending.delete(recPromise);}}
  const doc=new Element('#document',null);doc.nodeType=9;doc.ownerDocument=doc;doc.createElementNS=(ns,tag)=>tag.toLowerCase()==='canvas'?new CanvasElement(doc):new Element(tag,doc,ns);doc.createElement=tag=>doc.createElementNS(null,tag);doc.createTextNode=text=>new TextNode(String(text),doc);doc.getElementById=id=>doc.querySelectorAll('*').find(n=>n.id===String(id))||null;doc.exitFullscreen=()=>{doc.fullscreenElement=null;return Promise.resolve();};
  const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map(m=>({src:m[1].match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1],inline:m[2]}));
  parseMarkup(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,''),doc,doc);
  doc.documentElement=doc.querySelector('html');doc.body=doc.querySelector('body');doc.head=doc.querySelector('head');
  const sharedTextureDefs = new Map();
  function serialize(node=doc.getElementById('world'),opts={}){
    if(opts.shareTextureImages&&!opts._sharedTextureMap&&node?.tagName==='svg'){
      const refs=new Map();
      const xml=serialize(node,{...opts,_sharedTextureMap:refs});
      if(!refs.size)return xml;
      return xml.replace(/^<svg\b[^>]*>/,opening=>opening+'<defs>'+[...refs.values()].join('')+'</defs>');
    }
    if(opts.skipDefinitions&&node?.tagName?.toLowerCase()==='defs')return '';
    if(node?.nodeType===3)return escapeXML(node.textContent);
    if(!node)return '';
    if(opts.pruneHidden&&node.style?.display==='none')return '';
    const attrs={...node._attrs};if(node.style?.cssText)attrs.style=node.style.cssText;
    if(node.tagName==='svg'&&!attrs.xmlns)attrs.xmlns=NS;
    if(opts._sharedTextureMap&&node.tagName==='image'&&attrs.preserveAspectRatio==='none'&&
      !Object.keys(attrs).some(k=>!['href','x','y','width','height','preserveAspectRatio'].includes(k))&&
      [attrs.x||'0',attrs.y||'0',attrs.width,attrs.height].every(v=>Number.isFinite(Number(v)))&&Number(attrs.width)>0&&Number(attrs.height)>0){
      const rec=assets.get(attrs.href);
      if(rec&&!rec.then&&rec.path===null){
        const key=rec.pngSha256+'|'+attrs.width+'|'+attrs.height;
        let shared=sharedTextureDefs.get(key);
        if(!shared){
          const id='render-shared-'+hash(key);
          shared={id,xml:'<image id="'+id+'" href="'+rec.dataURI+'" width="'+escapeXML(attrs.width)+'" height="'+escapeXML(attrs.height)+'" preserveAspectRatio="none"></image>'};
          sharedTextureDefs.set(key,shared);
        }
        opts._sharedTextureMap.set(shared.id,shared.xml);
        return '<use href="#'+shared.id+'" x="'+escapeXML(attrs.x||'0')+'" y="'+escapeXML(attrs.y||'0')+'"></use>';
      }
    }

    for(const k of ['href','xlink:href'])if(attrs[k]&&!attrs[k].startsWith('#')&&['image','use'].includes(node.tagName.toLowerCase())){const rec=assets.get(attrs[k]);if(!rec||rec.then)throw new Error('Asset was not decoded before serialization: '+attrs[k].slice(0,160));attrs[k]=rec.dataURI;}
    if(opts.omitRootTransform&&node===doc.getElementById('world')&&attrs.style)attrs.style=attrs.style.replace(/(?:^|;)transform:[^;]*(?:;|$)/,';').replace(/^;|;$/g,'');
    const at=Object.entries(attrs).filter(([,v])=>v!==null&&v!==undefined&&v!=='').map(([k,v])=>' '+k+'="'+escapeXML(v)+'"').join('');
    return '<'+node.tagName+at+'>'+escapeXML(node._text||'')+node.childNodes.map(c=>serialize(c,opts)).join('')+'</'+node.tagName+'>';
  }
  doc._serialize=serialize;
  class LocalImage extends native.Image {
    set src(h){this._localSrc=h;this._sourceReady=loadAsset(String(h)).then(rec=>{super.src=rec.bytes;});this._sourceReady.catch(error=>{if(this.onerror)this.onerror(error);});}
    get src(){return this._localSrc||'';}
    async decode(){await this._sourceReady;return super.decode();}
  }
  class LocalURL extends URL {};
  LocalURL.createObjectURL=blob=>{if(!blob.bytes)throw new Error('Only local canvas object URLs are supported');const id='blob:local-scene/'+(++blobId);blobs.set(id,blob.bytes);return id;};LocalURL.revokeObjectURL=id=>blobs.delete(id);
  const ctx={console,document:doc,Image:LocalImage,HTMLImageElement:LocalImage,URL:LocalURL,URLSearchParams,location:{href:pathToFileURL(indexPath).href+'?render=1',search:options.search||'?render=1',protocol:'file:'},innerWidth:1920,innerHeight:1080,devicePixelRatio:1,performance:{now:()=>0},requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{},setTimeout,clearTimeout,queueMicrotask,addEventListener:()=>{},removeEventListener:()=>{},navigator:{userAgent:'LocalSoftwareArtifactRenderer'},Blob,TextEncoder,TextDecoder,ImageData:native.ImageData,Path2D:native.Path2D,DOMMatrix:native.DOMMatrix,getComputedStyle:el=>el.style};
  // Native Canvas snapshots retain GPU-like surfaces; static Image assets avoid per-frame native memory growth.
  const staticImageDecodes=[];
  ctx.__makeStaticImage=c=>{const im=new native.Image();im.src=(c._canvas||c).toBuffer('image/png');staticImageDecodes.push(im.decode());return im;};
  ctx.__waitStaticImages=()=>Promise.all(staticImageDecodes.splice(0));
  ctx.window=ctx;ctx.self=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
  for(const script of scripts){if(!script.src){if(script.inline.trim())throw new Error('Inline executable script found; only explicit original source files allowed');continue;}const full=allowedLocal(script.src);const code=fs.readFileSync(full,'utf8');manifest.scripts.push({src:script.src,path:full,sha256:hash(code)});vm.runInContext(code,ctx,{filename:full,timeout:120000});}
  if(!ctx.__anim?.ready||typeof ctx.__anim.renderAt!=='function')throw new Error('Original scene did not expose __anim.ready/renderAt');
  await ctx.__anim.ready;
  for(const n of doc.querySelectorAll('image,use')){const h=n.getAttribute('href')||n.getAttribute('xlink:href');if(h&&!h.startsWith('#'))await loadAsset(h);}
  await Promise.all([...pending]);
  const ids=new Proxy(Object.create(null),{get(t,k){return typeof k==='string'?doc.getElementById(k):undefined;},ownKeys(){return [...new Set(doc.querySelectorAll('[id]').map(n=>n.id))];},getOwnPropertyDescriptor(t,k){const value=doc.getElementById(k);return value?{enumerable:true,configurable:true,value}:undefined;}});
  const canvas=Object.fromEntries(doc.querySelectorAll('canvas[id]').map(c=>[c.id,c._canvas]));const canvases=new Map(Object.entries(canvas));
  async function syncAssets(){
    // Dynamic image hrefs are set during seek. Decode the current frame before
    // serializing SVG; no stale terrain frame is allowed into a screenshot.
    for(const n of doc.querySelectorAll('image,use')){
      const h=n.getAttribute('href')||n.getAttribute('xlink:href');
      if(h&&!h.startsWith('#')) await loadAsset(h);
    }
    await Promise.all([...pending]);
  }
  async function renderAtAsync(t){
    if(ctx.__anim.renderAtAsync) await ctx.__anim.renderAtAsync(t);
    else ctx.__anim.renderAt(t);
    await syncAssets();
  }
  return {ctx,ids,svg:ids.world,document:doc,canvas,canvases,assets,manifest,sourceManifest:manifest,serialize,syncAssets,renderAt:t=>ctx.__anim.renderAt(t),renderAtAsync,dispose(){ctx.__anim.pause();}};
}
module.exports={makeScene,Element,CanvasElement,serialize:(node,options)=>node.ownerDocument._serialize(node,options)};
if(require.main===module){(async()=>{const dir=process.argv[2]||path.resolve(__dirname,'..'),out=process.argv[3];const scene=await makeScene(dir);scene.renderAt(25.5);const svg=scene.serialize(scene.svg,{pruneHidden:true,omitRootTransform:true});if(out)fs.writeFileSync(out,svg);console.log(JSON.stringify({duration:scene.ctx.__anim.duration,scripts:scene.manifest.scripts.length,assets:scene.manifest.assets.length,svgBytes:Buffer.byteLength(svg),sceneTime:25.5,canvas:Object.fromEntries(Object.entries(scene.canvas).map(([id,c])=>[id,[c.width,c.height]])),grade:scene.ids.grade.style.cssText,world:scene.svg.style.cssText}));})().catch(e=>{console.error(e);process.exit(1);});}
