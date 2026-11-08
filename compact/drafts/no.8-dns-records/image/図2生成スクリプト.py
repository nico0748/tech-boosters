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

# ---- 図2：MX の切り替えと届く箱 ----
def node2(x,y,w,h,title,sub,accent,fill=WHITE,lw=2.0,tsize=18,ssize=14,dash=False,tcolor=TXT):
    b=box(x,y,w,h,fill=fill,line=accent,lw=lw)
    if dash:
        d=etree.SubElement(b.line._get_or_add_ln(),qn('a:prstDash')); d.set('val','dash')
    text(b,[(t,tsize,tcolor,True) for t in title]+[(t,ssize,GRAY,False) for t in sub])
    return b

def panel(ox,after):
    W=6.1
    h=box(ox,0.3,W,0.55,fill=SLATE,line=None,adj=0.2); text(h,"切り替え後" if after else "切り替え前",18,WHITE,True)
    # senders
    node2(ox+0.15,1.1,2.75,0.95,["社外の送信者"],["MX を引いて送る"],SLATE)
    node2(ox+3.2,1.1,2.75,0.95,["同じサービスの利用者"],["サービス内で直接配送"],SLATE)
    # zones
    zone(ox+0.05,2.65,2.95,2.85,"レンタルサーバ",NAVY,LNAVY,size=14)
    zone(ox+3.1,2.65,2.95,2.85,"クラウドメール",TEAL,LTEAL,size=14)
    mx="MX → mx.cloud.example" if after else "MX → mail.example.com"
    node2(ox+0.2,3.05,2.65,1.1,["DNS のゾーン"],[mx] if after else [mx,"mail A 192.0.2.25"],NAVY)
    if after:
        node2(ox+0.2,4.35,2.65,0.95,["旧メールボックス"],["しばらく併用して解約"],MGRAY,fill=LGRAY,dash=True,tcolor=GRAY)
        node2(ox+3.25,4.35,2.65,0.95,["クラウドの箱"],["社外も社内もここに届く"],TEAL,lw=2.4)
    else:
        node2(ox+0.2,4.35,2.65,0.95,["旧メールボックス"],["社外からのメールが届く"],NAVY)
        node2(ox+3.25,4.35,2.65,0.95,["クラウドの箱"],["社内からのメールだけ届く"],RED,lw=2.4)
    # arrows
    line(ox+2.55,2.05,ox+2.55,3.05,color=SLATE,w=1.8)
    line(ox+5.6,2.05,ox+5.6,4.35,color=SLATE,w=1.8)
    if after:
        line(ox+2.85,3.6,ox+4.0,3.6,color=TEAL,w=1.8,arrow=False)
        line(ox+4.0,3.6,ox+4.0,4.35,color=TEAL,w=1.8)
        node2(ox+3.25,5.85,2.65,0.85,["メールアプリ・Web"],["1つのアカウントで読む"],TEAL)
        line(ox+4.575,5.3,ox+4.575,5.85,color=TEAL,w=1.8)
        pill(ox+W/2,7.05,"✔ どこから送っても1つの箱に届く",TEAL,size=15)
    else:
        line(ox+1.525,4.15,ox+1.525,4.35,color=NAVY,w=1.8)
        node2(ox+0.2,5.85,2.65,0.85,["メールソフト"],["POP / IMAP で受信"],NAVY)
        line(ox+1.525,5.3,ox+1.525,5.85,color=NAVY,w=1.8)
        pill(ox+W/2,7.05,"✘ 届く箱が2つに分かれる",RED,size=15)

panel(0.25,False)
arr=s.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW,Inches(6.47),Inches(3.6),Inches(0.42),Inches(0.6))
arr.fill.solid(); arr.fill.fore_color.rgb=SLATE; arr.line.fill.background(); arr.shadow.inherit=False
panel(6.98,True)
prs.save(sys.argv[1])
