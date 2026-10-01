'use strict';
/* Source-coordinate shoulder rifle. Graphic shape; timber detail comes from
 * the original yoke crop. The hand and shoulder retain their art-space anchors. */
function buildV7Rifle(parent){
  const g=G(parent,{'data-layer':'shoulder-rifle'}),id=uid('v7-rifle-stock');
  const stock='M156,218Q306,218 488,222L566,226L616,229L639,231L686,231Q712,221 740,214L752,217L750,265L735,266L690,257L643,252L616,246L555,243L156,236Z';
  const cp=el('clipPath',{id},DEFS);el('path',{d:stock},cp);
  el('path',{d:'M206,239C282,319 444,346 618,255',fill:'none',stroke:'#23272b','stroke-width':7,'stroke-linecap':'round'},g);
  el('path',{d:'M207,237C283,317 444,343 618,253',fill:'none',stroke:'#59615f','stroke-width':1.4,opacity:.7},g);
  el('path',{d:stock,fill:'#65533d'},g);
  const texture=G(g,{'clip-path':`url(#${id})`,opacity:.54});
  el('image',{href:'images/挑担受辱与参加红军/农民-扁担.png',x:73,y:210,width:793,height:67},texture);
  el('path',{d:stock,fill:'#211b16',opacity:.23},g);
  el('path',{d:'M47,208L552,219L552,229L46,218Z',fill:'#282e31'},g);
  el('path',{d:'M48,209L551,220',fill:'none',stroke:'#aab4b4','stroke-width':1.5,opacity:.67},g);
  el('path',{d:'M47,207L51,207L51,219L46,219ZM63,208L67,198L71,199L72,209Z',fill:'#3d4447'},g);
  el('path',{d:'M535,217L611,221L624,229L621,241L537,236Z',fill:'#373d3e'},g);
  el('path',{d:'M540,219L610,223L620,229',fill:'none',stroke:'#8c9696','stroke-width':1.5},g);
  el('path',{d:'M592,223L600,208L607,208',fill:'none',stroke:'#444b4b','stroke-width':4.4,'stroke-linecap':'round'},g);
  el('ellipse',{cx:608,cy:208,rx:5.5,ry:4.5,fill:'#67716f'},g);
  el('path',{d:'M586,246C585,265 611,273 628,251',fill:'none',stroke:'#282d2e','stroke-width':3.6},g);
  el('path',{d:'M610,245Q614,254 608,258',fill:'none',stroke:'#454d4c','stroke-width':2.8},g);
  [183,350,511].forEach(x=>{const y=218+(x-156)*.012;el('path',{d:`M${x},${y-4}L${x+7},${y-4}L${x+7},${y+20}L${x},${y+20}Z`,fill:'#333b3c'},g);el('path',{d:`M${x+2},${y-2}L${x+2},${y+18}`,stroke:'#89928d','stroke-width':1,opacity:.66},g);});
  el('path',{d:'M750,219L748,264',fill:'none',stroke:'#252c2e','stroke-width':6,'stroke-linecap':'round'},g);
  el('path',{d:'M695,239Q721,233 743,228M704,249L738,255',fill:'none',stroke:'#a08b69','stroke-width':1.5,opacity:.42},g);
  return {g,support:[494,232],grip:[659,241],muzzle:[47,211],butt:[749,242]};
}
