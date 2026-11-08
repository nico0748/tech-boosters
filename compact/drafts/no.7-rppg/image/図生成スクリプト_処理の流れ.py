import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from lxml import etree

NAVY=RGBColor(0x2E,0x5E,0x8E); TEAL=RGBColor(0x1E,0x8A,0x82)
TXT=RGBColor(0x1F,0x3A,0x5C); GRAY=RGBColor(0x6B,0x72,0x80); SLATE=RGBColor(0x2B,0x3A,0x4A)
WHITE=RGBColor(0xFF,0xFF,0xFF); LNAVY=RGBColor(0xEE,0xF3,0xF9); LTEAL=RGBColor(0xE8,0xF5,0xF3)
MGRAY=RGBColor(0x9A,0xA5,0xB4)
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

def box(x,y,w,h,fill=WHITE,line=NAVY,lw=1.4,adj=0.16):
    sh=s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE,Inches(x),Inches(y),Inches(w),Inches(h))
    sh.adjustments[0]=adj
    if fill is None: sh.fill.background()
    else: sh.fill.solid(); sh.fill.fore_color.rgb=fill
    if line is None: sh.line.fill.background()
    else: sh.line.color.rgb=line; sh.line.width=Pt(lw)
    sh.shadow.inherit=False
    return sh

def label(x,y,w,h,lines,size=16,color=GRAY,bold=False,align=PP_ALIGN.CENTER):
    tb=s.shapes.add_textbox(Inches(x),Inches(y),Inches(w),Inches(h)); text(tb,lines,size,color,bold,align); return tb

def line(x1,y1,x2,y2,color=MGRAY,w=1.8,arrow=True):
    c=s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT,Inches(x1),Inches(y1),Inches(x2),Inches(y2))
    c.line.color.rgb=color; c.line.width=Pt(w)
    if arrow:
        ln=c.line._get_or_add_ln()
        t=etree.SubElement(ln,qn('a:tailEnd')); t.set('type','triangle'); t.set('w','lg'); t.set('len','lg')

def zone(x,y,w,h,tab,accent,fill,size=18,right=False):
    box(x,y,w,h,fill=fill,line=accent,lw=1.8,adj=0.05)
    tw=size/72*1.05*len(tab)+0.6
    tx=x+w-tw-0.25 if right else x+0.25
    t=box(tx,y-0.27,tw,0.54,fill=accent,line=None,adj=0.5); text(t,tab,size,WHITE,True)

def node(x,y,w,h,title,sub,accent):
    b=box(x,y,w,h,fill=WHITE,line=accent,lw=2.0)
    text(b,[(title,22,TXT,True)]+[(t,16,GRAY,False) for t in sub])

def pill(cx,cy,t,size=18,w=None):
    w=w or size/72*1.05*len(t)+0.6
    p=box(cx-w/2,cy-0.3,w,0.6,fill=SLATE,line=None,adj=0.5); text(p,t,size,WHITE,True)
    return cx-w/2, cx+w/2

NW,NH=3.0,1.9
# 上段：画像から信号を作る
zone(0.3,0.55,12.73,2.9,"動画から色の信号を作る",NAVY,LNAVY)
TY=1.05; TC=TY+NH/2
_,r=pill(1.35,TC,"顔の動画")
X1=[2.75,6.25,9.75]
node(X1[0],TY,NW,NH,"① 顔を検出",["フレームごとに","顔の位置を探す"],NAVY)
node(X1[1],TY,NW,NH,"② ROI を決める",["頬・おでこなど","肌の部分だけ使う"],NAVY)
node(X1[2],TY,NW,NH,"③ 平均 RGB",["ROI の色を平均して","時系列にする"],NAVY)
line(r,TC,X1[0],TC,color=NAVY)
for a,b in zip(X1,X1[1:]): line(a+NW,TC,b,TC,color=NAVY)

# 下段：信号から心拍数を出す
zone(0.3,4.2,12.73,2.9,"信号から心拍数を出す",TEAL,LTEAL,right=True)
BY=4.7; BC=BY+NH/2
X2=[0.75,4.05,7.35]; NW2=2.85
node(X2[0],BY,NW2,NH,"④ 脈波を抽出",["動き・照明の影響を","減らす（POS など）"],TEAL)
node(X2[1],BY,NW2,NH,"⑤ バンドパス",["0.7〜4 Hz だけ通す","（42〜240 bpm）"],TEAL)
node(X2[2],BY,NW2,NH,"⑥ FFT",["いちばん強い","周波数を探す"],TEAL)
for a,b in zip(X2,X2[1:]): line(a+NW2,BC,b,BC,color=TEAL)
l,_=pill(11.6,BC,"心拍数（bpm）",w=2.4)
line(X2[2]+NW2,BC,l,BC,color=TEAL)

# 上段→下段のつなぎ
cx3=X1[2]+NW/2; cx4=X2[0]+NW2/2; my=3.82
line(cx3,TY+NH,cx3,my,color=NAVY,arrow=False)
line(cx3,my,cx4,my,color=NAVY,arrow=False)
line(cx4,my,cx4,BY,color=NAVY)
label(4.2,my-0.42,5.2,0.38,"R・G・B の3本の時系列信号",16,NAVY,True)

prs.save(sys.argv[1])
