#!/usr/bin/env python3
"""由可维护字稿和随工程交付的手写字形子集重建采访中文 SVG 路径。

依赖：Python 3 + fontTools（已验证 4.61.1）。不需要网络或系统字体。
修改 images/斯诺采访/采访中文字稿.json 后运行本脚本。
若新增子集未覆盖字符，可用 --font 指定官方完整 Long Cang TTF。
英文、钢笔轨迹、显示时序和场景构图均不在本脚本修改范围。
"""
from pathlib import Path
import argparse,json,re
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.svgLib.path import parse_path

ROOT=Path(__file__).resolve().parent.parent
ASSETS=ROOT/'images/斯诺采访'
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--font',type=Path,default=ASSETS/'中文手写字体/BaoanNotebookHandwritingSubset-Regular.ttf')
args=parser.parse_args()
font=TTFont(args.font)
glyph_set=font.getGlyphSet();cmap=font.getBestCmap();metrics=font['hmtx'].metrics
dot=json.loads((ASSETS/'中文手写字体/Caveat-中点轮廓.json').read_text())
text=json.loads((ASSETS/'采访中文字稿.json').read_text())

def number(v):
    s=f'{v:.3f}'.rstrip('0').rstrip('.')
    return s if s not in ('','-0') else '0'

def lettering(text,size):
    pen=SVGPathPen(glyph_set,ntos=number);x=0
    for char in text:
        if char=='·':
            scale=size/dot['font_size']
            parse_path(dot['path'],TransformPen(pen,(scale,0,0,scale,x,0)))
            x+=dot['advance']*scale
            continue
        name=cmap.get(ord(char))
        if not name:
            raise ValueError(f'字体子集缺少 {char!r} (U+{ord(char):04X})；请扩展子集或用 --font 指定官方完整字体。')
        scale=size/font['head'].unitsPerEm
        glyph_set[name].draw(TransformPen(pen,(scale,0,0,-scale,x,0)))
        x+=metrics[name][0]*scale
    return {'text':text,'path':pen.getCommands(),'width':round(x,3),'size':size}

target=ROOT/'js/斯诺采访-笔记素材.js';js=target.read_text()
m=re.search(r'const INTERVIEW_LETTERING=(.*);',js)
assert m,'未找到采访文字数据'
data=json.loads(m.group(1))
for key in ['title','questionCN']:data[key]=lettering(**text[key])
data['leftNotes']=[lettering(**row) for row in text['leftNotes']]
data['chineseFont']='Long Cang Regular (SIL OFL 1.1); middle dot uses Caveat 450'
data.pop('disclaimer',None)
out=js[:m.start(1)]+json.dumps(data,ensure_ascii=False,separators=(',',':'))+js[m.end(1):]
target.write_text(out)
print('采访中文 SVG 轮廓已重建；英文和书写动画未修改。')
