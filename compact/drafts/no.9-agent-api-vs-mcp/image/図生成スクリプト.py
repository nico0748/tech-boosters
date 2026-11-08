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
LGRAY=RGBColor(0xF3,0xF4,0xF6); MGRAY=RGBColor(0x9A,0xA5,0xB4)
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

def line(x1,y1,x2,y2,color=MGRAY,w=1.5,arrow=True,both=False,dash=False):
    c=s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT,Inches(x1),Inches(y1),Inches(x2),Inches(y2))
    c.line.color.rgb=color; c.line.width=Pt(w)
    ln=c.line._get_or_add_ln()
    if dash:
        d=etree.SubElement(ln,qn('a:prstDash')); d.set('val','dash')
    if both:
        h=etree.SubElement(ln,qn('a:headEnd')); h.set('type','triangle'); h.set('w','lg'); h.set('len','lg')
    if arrow:
        t=etree.SubElement(ln,qn('a:tailEnd')); t.set('type','triangle'); t.set('w','lg'); t.set('len','lg')
    return c

def zone(x,y,w,h,tab,accent,fill,size=18):
    box(x,y,w,h,fill=fill,line=accent,lw=1.8,adj=0.05)
    tw=size/72*1.05*len(tab)+0.6
    t=box(x+0.25,y-0.27,tw,0.54,fill=accent,line=None,adj=0.5); text(t,tab,size,WHITE,True)

def node(x,y,w,h,title,sub,accent,fill=WHITE,lw=2.0,tsize=22):
    b=box(x,y,w,h,fill=fill,line=accent,lw=lw)
    text(b,[(title,tsize,TXT,True)]+[(t,16,GRAY,False) for t in sub])
    return b

def pill(cx,cy,t,fill,size=16,color=WHITE,w=None):
    w=w or size/72*1.05*len(t)+0.5
    p=box(cx-w/2,cy-0.25,w,0.5,fill=fill,line=None,adj=0.5); text(p,t,size,color,True); return p

# 上：従量課金の API で動かす
zone(0.3,0.45,12.73,2.75,"従量課金のAPIで動かす",NAVY,LNAVY)
cy=1.9
node(0.6,cy-0.7,1.9,1.4,"ユーザー",["ブラウザ"],SLATE)
line(2.5,cy,3.3,cy,color=NAVY,w=1.8)
node(3.3,cy-0.8,2.7,1.6,"自作Webアプリ",["開発者のサーバ"],NAVY,lw=2.4,tsize=20)
node(10.6,cy-0.8,2.1,1.6,"Claude",[],SLATE,lw=2.4)
line(6.0,cy,10.6,cy,color=NAVY,w=2.0,both=True)
label(6.0,cy-0.5,4.6,0.42,"Claude API（開発者の API キー）",16,NAVY,True)
pill(8.3,cy-1.0,"請求は開発者へ（使うほど増える）",NAVY,size=15,w=4.2)

# 下：MCP ＋ Claude のプランで動かす
zone(0.3,3.75,12.73,3.5,"MCP＋プランで動かす",TEAL,LTEAL)
cy=5.6; ya=5.0; yb=6.35
node(0.6,cy-0.7,1.9,1.4,"ユーザー",["自分の PC"],SLATE)
line(2.5,cy,3.3,cy,color=TEAL,w=1.8)
node(3.3,4.4,2.7,2.45,"Claude アプリ",["Desktop・Code","ユーザーのプランで","ログイン"],TEAL,lw=2.4,tsize=20)
node(10.6,ya-0.65,2.1,1.3,"Claude",[],SLATE,lw=2.4)
line(6.0,ya,10.6,ya,color=TEAL,w=2.0,both=True)
label(6.0,ya-0.5,4.6,0.42,"ユーザーのプラン",16,TEAL,True)
pill(8.3,ya-0.88,"請求は各ユーザーのプラン（定額）",TEAL,size=15,w=4.2)
node(7.2,yb-0.6,3.4,1.2,"自作アプリ",["MCP サーバ","ユーザーの PC で動く"],TEAL,lw=2.0,tsize=18)
line(6.0,yb,7.2,yb,color=TEAL,w=1.8,both=True)
label(6.0,yb-0.5,1.2,0.42,"MCP",16,TEAL,True)

prs.save(sys.argv[1])
