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
FONT="Noto Serif CJK JP"

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



INK=RGBColor(0x1F,0x29,0x37); RED=RGBColor(0xB0,0x2A,0x2A); FILL=RGBColor(0xF3,0xF5,0xF8); SIL=RGBColor(0xE2,0xE8,0xF0)
LW=1.25

def rect(x,y,w,h,fill=WHITE,lc=INK,lw=LW,kind=MSO_SHAPE.RECTANGLE,adj=None,dash=False):
    sh=s.shapes.add_shape(kind,Inches(x),Inches(y),Inches(w),Inches(h))
    if adj is not None: sh.adjustments[0]=adj
    if fill is None: sh.fill.background()
    else: sh.fill.solid(); sh.fill.fore_color.rgb=fill
    if lc is None: sh.line.fill.background()
    else:
        sh.line.color.rgb=lc; sh.line.width=Pt(lw)
        if dash:
            d=etree.SubElement(sh.line._get_or_add_ln(),qn('a:prstDash')); d.set('val','dash')
    sh.shadow.inherit=False
    return sh

def ln(x1,y1,x2,y2,color=INK,w=LW,arrow=True,dash=False):
    c=s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT,Inches(x1),Inches(y1),Inches(x2),Inches(y2))
    c.line.color.rgb=color; c.line.width=Pt(w)
    l=c.line._get_or_add_ln()
    if dash:
        d=etree.SubElement(l,qn('a:prstDash')); d.set('val','dash')
    if arrow:
        t=etree.SubElement(l,qn('a:tailEnd')); t.set('type','triangle'); t.set('w','med'); t.set('len','med')

def panel(x,y,w,h,tag,ja):
    rect(x,y,w,h,fill=FILL,lc=INK)
    tb=s.shapes.add_textbox(Inches(x),Inches(y-0.5),Inches(w),Inches(0.45))
    text(tb,[(tag,18,INK,True)],align=PP_ALIGN.LEFT)
    p=tb.text_frame.paragraphs[0]; r=p.add_run(); r.text="　"+ja; r.font.size=Pt(16); r.font.color.rgb=GRAY; r.font.name=FONT
    rPr=r._r.get_or_add_rPr(); ea=etree.SubElement(rPr,qn('a:ea')); ea.set('typeface',FONT)

def blk(x,y,w,h,title,sub):
    b=rect(x,y,w,h)
    text(b,[(title,20,INK,True)]+[(t,15,GRAY,False) for t in sub])

ZT,ZH=1.7,5.4
panel(0.3,ZT,7.15,ZH,"Subject","被験者")
panel(8.65,ZT,4.38,3.75,"Measurement System","測定系")

# silhouette (line art)
HC=5.0
import math
def bust(cx,hcy,rx,ry,bottom):
    nw=0.31                      # half neck width
    sh_y=5.25; sh_x=1.65         # shoulder line / half body width
    pts=[]
    # left side bottom -> shoulder
    pts+= [(cx-sh_x,bottom),(cx-sh_x,sh_y)]
    # left shoulder: quarter ellipse up to top of shoulder
    scx,srx,sry=cx-sh_x+0.95,0.95,0.8
    for i in range(1,21):
        t=math.pi+ (math.pi/2)*i/20
        pts.append((scx+srx*math.cos(t), sh_y+sry*math.sin(t)))
    # trapezius: quadratic bezier to neck base
    p0=pts[-1]; p2=(cx-nw,sh_y-1.08); p1=(cx-nw-0.05,p0[1]-0.02)
    for i in range(1,16):
        u=i/15; pts.append(((1-u)**2*p0[0]+2*(1-u)*u*p1[0]+u*u*p2[0],(1-u)**2*p0[1]+2*(1-u)*u*p1[1]+u*u*p2[1]))
    # neck up to head
    # head: from the lower-left junction, over the top, to the lower-right junction
    ar=math.acos(nw/rx); n=60
    s0=math.pi-ar; s1=2*math.pi+ar
    for i in range(n+1):
        t=s0+(s1-s0)*i/n
        pts.append((cx+rx*math.cos(t), hcy+ry*math.sin(t)))
    # right neck down and mirror of left lower body
    left_body=pts[:2+20+15]
    right=[(2*cx-x,y) for (x,y) in reversed(left_body)]
    pts+= right
    E=914400
    ff=s.shapes.build_freeform(int(pts[0][0]*E),int(pts[0][1]*E),scale=1.0)
    ff.add_line_segments([(int(x*E),int(y*E)) for x,y in pts[1:]],close=True)
    sh=ff.convert_to_shape()
    sh.fill.solid(); sh.fill.fore_color.rgb=SIL
    sh.line.color.rgb=INK; sh.line.width=Pt(LW); sh.shadow.inherit=False
    return sh
bust(HC,3.0,0.72,0.86,ZT+ZH-0.02)
FY=2.75
rect(4.5,2.5,1.0,0.5,fill=None,lc=RED,lw=1.75,dash=True)   # ROI box
label(4.5,2.98,1.0,0.3,"ROI",12,RED,True)
# vessel + heart
ln(5.55,4.8,5.1,4.2,color=RED,w=1.75,arrow=False)
ln(5.1,4.2,5.1,3.3,color=RED,w=1.75)
rect(5.35,4.68,0.45,0.42,fill=WHITE,lc=RED,lw=1.75,kind=MSO_SHAPE.HEART)

# leader callouts (left)
CX,CW,CH=0.55,2.75,0.95
def callout(cy,title,sub,tx):
    blk(CX,cy-CH/2,CW,CH,title,[sub])
    ln(CX+CW,cy,tx,cy,color=GRAY,w=1.0,arrow=False)
    d=rect(tx-0.05,cy-0.05,0.1,0.1,fill=INK,lc=None,kind=MSO_SHAPE.OVAL)
callout(FY,"③ Forehead","皮膚の拡散反射光が変化",4.5)
callout(3.95,"② 皮下の毛細血管","血液量（容積）が変化",5.1)
callout(5.0,"① 心臓","拍動（心周期）",5.35)
label(CX,5.9,CW,0.9,[("ヘモグロビンの光吸収による",14,GRAY,False),("微小な輝度変化を捉える",14,GRAY,False)],15,GRAY,False)

# ambient light
lt=rect(HC-1.6,0.55,3.2,0.6)
text(lt,[("環境光（Ambient light）",16,INK,True)])
ln(HC,1.15,HC,2.5)

# measurement system
NY,NH=1.95,1.6; NC=NY+NH/2
blk(8.85,NY,1.75,NH,"RGB カメラ",["顔動画を撮像","RGB 時系列"])
blk(11.0,NY,1.75,NH,"信号処理",["脈波抽出","周波数解析"])
ln(10.6,NC,11.0,NC)
o=rect(10.85,4.35,2.05,0.6,fill=INK,lc=None)
text(o,[("心拍数 HR [bpm]",16,WHITE,True)])
ln(11.875,NY+NH,11.875,4.35)

# reflected light
ln(5.5,FY,8.85,FY,color=NAVY,w=1.75)
label(5.9,FY-0.5,1.5,0.42,"拡散反射光",16,NAVY,True)
nc=rect(7.55,3.25,1.0,0.5,fill=WHITE,lc=NAVY,lw=1.5)
text(nc,[("非接触",16,NAVY,True)])
label(7.45,3.78,1.2,0.4,"Non-contact",13,GRAY,False)

prs.save(sys.argv[1])
