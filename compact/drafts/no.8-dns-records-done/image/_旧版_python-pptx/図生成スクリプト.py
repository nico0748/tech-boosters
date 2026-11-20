import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from lxml import etree

NAVY=RGBColor(0x2E,0x5E,0x8E); TEAL=RGBColor(0x1E,0x8A,0x82); RED=RGBColor(0xC0,0x39,0x2B)
TXT=RGBColor(0x1F,0x3A,0x5C); GRAY=RGBColor(0x6B,0x72,0x80); SLATE=RGBColor(0x2B,0x3A,0x4A)
WHITE=RGBColor(0xFF,0xFF,0xFF); LNAVY=RGBColor(0xEE,0xF3,0xF9); LTEAL=RGBColor(0xE8,0xF5,0xF3)
LRED=RGBColor(0xFB,0xEE,0xEC); LGRAY=RGBColor(0xF3,0xF4,0xF6); MGRAY=RGBColor(0x9A,0xA5,0xB4)
FONT="Noto Sans CJK JP"

prs=Presentation(); prs.slide_width=Inches(13.333); prs.slide_height=Inches(7.5)
s=prs.slides.add_slide(prs.slide_layouts[6])
bg=s.background.fill; bg.solid(); bg.fore_color.rgb=WHITE

def text(shape, lines, size=14, color=TXT, bold=False, align=PP_ALIGN.CENTER):
    tf=shape.text_frame; tf.clear(); tf.word_wrap=True
    tf.margin_left=tf.margin_right=Inches(0.05); tf.margin_top=tf.margin_bottom=Inches(0.02)
    tf.vertical_anchor=MSO_ANCHOR.MIDDLE
    if isinstance(lines,str): lines=[(lines,size,color,bold)]
    for i,(t,sz,c,b) in enumerate(lines):
        p=tf.paragraphs[0] if i==0 else tf.add_paragraph(); p.alignment=align
        r=p.add_run(); r.text=t; f=r.font; f.size=Pt(sz); f.color.rgb=c; f.bold=b; f.name=FONT
        rPr=r._r.get_or_add_rPr(); ea=rPr.find(qn('a:ea'))
        if ea is None: ea=etree.SubElement(rPr,qn('a:ea'))
        ea.set('typeface',FONT)

def box(x,y,w,h,fill=WHITE,line=NAVY,lw=1.4,shape=MSO_SHAPE.ROUNDED_RECTANGLE,adj=0.16):
    sh=s.shapes.add_shape(shape,Inches(x),Inches(y),Inches(w),Inches(h))
    if shape==MSO_SHAPE.ROUNDED_RECTANGLE: sh.adjustments[0]=adj
    if fill is None: sh.fill.background()
    else: sh.fill.solid(); sh.fill.fore_color.rgb=fill
    if line is None: sh.line.fill.background()
    else: sh.line.color.rgb=line; sh.line.width=Pt(lw)
    sh.shadow.inherit=False
    return sh

def label(x,y,w,h,lines,size=12,color=GRAY,bold=False,align=PP_ALIGN.CENTER):
    tb=s.shapes.add_textbox(Inches(x),Inches(y),Inches(w),Inches(h)); text(tb,lines,size,color,bold,align); return tb

def line(x1,y1,x2,y2,color=MGRAY,w=1.5,arrow=True,dash=False):
    c=s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT,Inches(x1),Inches(y1),Inches(x2),Inches(y2))
    c.line.color.rgb=color; c.line.width=Pt(w)
    ln=c.line._get_or_add_ln()
    if dash:
        d=etree.SubElement(ln,qn('a:prstDash')); d.set('val','dash')
    if arrow:
        t=etree.SubElement(ln,qn('a:tailEnd')); t.set('type','triangle'); t.set('w','lg'); t.set('len','lg')
    return c

def zone(x,y,w,h,tab,accent,fill,size=18):
    box(x,y,w,h,fill=fill,line=accent,lw=1.8,adj=0.05)
    tw=size/72*1.05*len(tab)+0.6
    t=box(x+0.25,y-0.27,tw,0.54,fill=accent,line=None,adj=0.5); text(t,tab,size,WHITE,True)

def node(x,y,w,h,title,sub,accent,fill=WHITE,lw=2.0):
    b=box(x,y,w,h,fill=fill,line=accent,lw=lw)
    text(b,[(title,22,TXT,True)]+[(t,16,GRAY,False) for t in sub])
    return b

def pill(cx,cy,t,fill,size=16,color=WHITE,w=None):
    w=w or size/72*1.05*len(t)+0.5
    p=box(cx-w/2,cy-0.25,w,0.5,fill=fill,line=None,adj=0.5); text(p,t,size,color,True); return p

# ---- 図1：名前解決の流れ ----
def node2(x,y,w,h,title,sub,accent,fill=WHITE,lw=2.0,tsize=20,ssize=15):
    b=box(x,y,w,h,fill=fill,line=accent,lw=lw)
    text(b,[(t,tsize,TXT,True) for t in title]+[(t,ssize,GRAY,False) for t in sub])
    return b

ZT,ZB=1.0,6.95
zone(0.3,ZT,2.45,ZB-ZT,"端末",SLATE,LGRAY)
zone(9.2,ZT,3.85,ZB-ZT,"権威DNSサーバたち",NAVY,LNAVY)

CY=4.0
node2(0.45,CY-0.9,2.15,1.8,["スタブ","リゾルバ"],["OS・ブラウザ"],SLATE)
CX0,CX1=3.95,6.25
node2(CX0,1.45,CX1-CX0,5.2,["キャッシュ","DNSサーバ"],["（フルサービス","リゾルバ）"],TEAL,lw=2.4)
pill((CX0+CX1)/2,7.05,"答えを TTL の間覚えておく",TEAL,size=15)

# 端末 <-> キャッシュ
d=0.38
line(2.6,CY-d,CX0,CY-d,color=SLATE,w=2.0); label(2.6,CY-d-0.44,CX0-2.6,0.4,"① 質問",15,SLATE,True)
line(CX0,CY+d,2.6,CY+d,color=SLATE,w=2.0); label(2.6,CY+d-0.44,CX0-2.6,0.4,"⑤ 答え",15,SLATE,True)

NX,NW,NH=9.55,3.3,1.35
rows=[(2.15,["ルートサーバ"],["「.」の担当"],"② www.example.com は？","TLDサーバを紹介"),
      (4.05,["TLDサーバ"],["「.com」の担当"],"③ www.example.com は？","権威DNSサーバを紹介"),
      (5.95,["権威DNSサーバ"],["「example.com」の担当"],"④ www.example.com は？","答え：192.0.2.1")]
for cy,t,sub,q,a in rows:
    node2(NX,cy-NH/2,NW,NH,t,sub,NAVY)
    line(CX1,cy-d,NX,cy-d,color=NAVY,w=2.0); label(CX1,cy-d-0.44,9.2-CX1,0.4,q,14,NAVY,True)
    line(NX,cy+d,CX1,cy+d,color=MGRAY,w=2.0,dash=(cy<5)); label(CX1,cy+d-0.44,9.2-CX1,0.4,a,14,GRAY if cy<5 else NAVY,True)

prs.save(sys.argv[1])
