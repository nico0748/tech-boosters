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
# ---- レコードごとの仕組み図（図2〜8、図10）----
import os
def new(h=6.0):
    global prs,s
    prs=Presentation(); prs.slide_width=Inches(13.333); prs.slide_height=Inches(h)
    s=prs.slides.add_slide(prs.slide_layouts[6])
    bg=s.background.fill; bg.solid(); bg.fore_color.rgb=WHITE

def nd(x,y,w,h,title,sub,accent,fill=WHITE,lw=2.0,tsize=18,ssize=14,dash=False,tcolor=TXT,mono=False):
    b=box(x,y,w,h,fill=fill,line=accent,lw=lw)
    if dash:
        d=etree.SubElement(b.line._get_or_add_ln(),qn('a:prstDash')); d.set('val','dash')
    text(b,[(t,tsize,tcolor,True) for t in title]+[(t,ssize,GRAY,False) for t in sub])
    return b

def rec(x,y,w,h,lines,accent=NAVY,size=14):
    # レコードを並べた箱（左寄せ）
    b=box(x,y,w,h,fill=WHITE,line=accent,lw=1.6,adj=0.08)
    text(b,[(t,size,TXT,False) for t in lines],align=PP_ALIGN.LEFT)
    b.text_frame.margin_left=Inches(0.15)
    return b

def ar(x1,y,x2,lab,color=NAVY,dash=False,size=14,lcolor=None,bold=True):
    line(x1,y,x2,y,color=color,w=2.0,dash=dash)
    lx=min(x1,x2); label(lx,y-0.44,abs(x2-x1),0.4,lab,size,lcolor or color,bold)

def save(name):
    prs.save(os.path.join(OUT,name+".pptx"))

OUT=sys.argv[1] if len(sys.argv)>1 else "."

# 図2：A レコード（DNS ラウンドロビン）
new(6.0)
b=box(3.95,2.25,3.1,1.5,fill=LNAVY,line=NAVY,lw=1.8,adj=0.1)
text(b,[("example.com のゾーン",16,TXT,True),("www  A  192.0.2.1",14,GRAY,False),("www  A  192.0.2.2",14,GRAY,False)])
for (y,nm,ans,srv) in [(0.35,"端末1","答え：.1 → .2 の順","Webサーバ1"),(4.45,"端末2","答え：.2 → .1 の順","Webサーバ2")]:
    nd(0.4,y,2.2,1.2,[nm],["ブラウザ"],SLATE)
    ar(2.6,y+0.6,3.95,"① A は？",SLATE)
    nd(3.95,y,3.1,1.2,[ans],["キャッシュDNSサーバから"],TEAL,ssize=13)
    ar(7.05,y+0.6,10.3,"② 先頭の IP に接続",TEAL)
    nd(10.3,y,2.6,1.2,[srv],["192.0.2.1" if srv.endswith("1") else "192.0.2.2"],NAVY)
line(5.5,2.25,5.5,1.55,color=MGRAY,w=1.6,dash=True); line(5.5,3.75,5.5,4.45,color=MGRAY,w=1.6,dash=True)
label(7.3,2.8,4.5,0.4,"← 毎回、順番を入れ替えて返す",14,GRAY,True,PP_ALIGN.LEFT)
save("02_Aレコード")

# 図3：AAAA レコード（Happy Eyeballs）
new(6.0)
nd(0.4,0.4,2.4,5.0,["端末"],["IPv4 と IPv6","の両方が使える"],SLATE)
nd(6.0,0.4,3.2,1.5,["キャッシュ","DNSサーバ"],[],TEAL)
ar(2.8,0.85,6.0,"① AAAA と A を両方聞く",SLATE)
ar(6.0,1.5,2.8,"IPv6 と IPv4 のアドレス",GRAY,dash=True)
nd(10.2,2.4,2.75,3.0,["Webサーバ"],["IPv6：2001:db8::1","IPv4：192.0.2.1"],NAVY)
ar(2.8,3.2,10.2,"② まず IPv6 で接続を試す（優先）",TEAL)
ar(2.8,4.6,10.2,"③ すぐにつながらなければ IPv4 で接続",MGRAY,dash=True,lcolor=GRAY)
save("03_AAAAレコード")

# 図4：CNAME
new(6.6)
d=0.38
zone(0.3,0.9,2.45,5.4,"端末",SLATE,LGRAY,size=15)
nd(0.45,2.75,2.15,1.6,["スタブ","リゾルバ"],[],SLATE)
CY=3.55
nd(3.75,0.9,2.1,5.4,["キャッシュ","DNSサーバ"],[],TEAL,lw=2.4)
ar(2.6,CY-d,3.75,"① 質問",SLATE); ar(3.75,CY+d,2.6,"④ 答え",SLATE)
zone(9.2,0.9,3.85,5.4,"権威DNSサーバ",NAVY,LNAVY,size=15)
rows=[(2.1,"example.com の担当","blog  CNAME  example.github.io.","② blog.example.com は？","CNAME：example.github.io"),
      (4.9,"github.io の担当","example  A  185.199.108.153","③ example.github.io は？","A：185.199.108.153")]
for cy,t,r,q,a in rows:
    b=box(9.4,cy-0.75,3.5,1.5,fill=WHITE,line=NAVY,lw=2.0)
    text(b,[(t,16,TXT,True),(r,13,GRAY,False)])
    ar(5.85,cy-d,9.4,q,NAVY); ar(9.4,cy+d,5.85,a,GRAY)
label(3.6,6.3,3.0,0.35,"",12)
save("04_CNAME")

# 図5：PTR（逆引き）
new(6.2)
nd(0.4,2.1,2.5,1.6,["送信側","メールサーバ"],["IP：192.0.2.25"],SLATE)
nd(4.6,1.0,2.4,3.8,["受信側","メールサーバ"],[],TEAL,lw=2.4)
ar(2.9,2.9,4.6,"① メールを送る",SLATE)
zone(9.0,0.45,4.05,2.2,"逆引きゾーン（割り当て元）",NAVY,LNAVY,size=13)
rec(9.2,0.95,3.65,1.4,["25.2.0.192.in-addr.arpa.","  PTR  mail.example.com."])
zone(9.0,3.35,4.05,2.2,"正引きゾーン（ドメイン側）",NAVY,LNAVY,size=13)
rec(9.2,3.85,3.65,1.4,["mail.example.com.","  A  192.0.2.25"])
ar(7.0,1.35,9.2,"② PTR は？",NAVY); ar(9.2,1.95,7.0,"mail.example.com",GRAY)
ar(7.0,4.25,9.2,"③ A は？",NAVY); ar(9.2,4.85,7.0,"192.0.2.25",GRAY)
pill(5.8,5.45,"✔ 一致すれば受け取る",TEAL,size=15)
save("05_PTR")

# 図6：NS（委任とグルー）
new(6.4)
nd(0.4,0.6,2.6,5.2,["キャッシュ","DNSサーバ"],[],TEAL,lw=2.4)
zone(6.3,0.55,6.75,2.2,".com のゾーン（親）",SLATE,LGRAY,size=14)
rec(6.5,1.0,6.35,1.5,["example.com.      NS  ns1.example.com.","ns1.example.com.  A   192.0.2.53   ← グルー"],accent=SLATE)
zone(6.3,3.6,6.75,2.2,"example.com のゾーン（子）",NAVY,LNAVY,size=14)
rec(6.5,4.05,6.35,1.5,["example.com.      NS  ns1.example.com.","www.example.com.  A   192.0.2.1"])
ar(3.0,1.45,6.5,"① www.example.com は？",SLATE); ar(6.5,2.1,3.0,"② 担当は ns1（192.0.2.53）",GRAY)
ar(3.0,4.5,6.5,"③ 192.0.2.53 に聞く",NAVY); ar(6.5,5.15,3.0,"④ 答え：192.0.2.1",NAVY)
save("06_NS")

# 図7：SOA とゾーン転送
new(5.6)
nd(0.4,1.6,2.0,1.8,["管理者"],[],SLATE)
nd(3.5,0.8,2.7,3.4,["プライマリ"],["（原本）","シリアル","2026110102"],NAVY,lw=2.4)
ar(2.4,2.5,3.5,"① 更新",SLATE)
nd(10.4,0.8,2.6,3.4,["セカンダリ"],["（コピー）","シリアル","2026110101→02"],TEAL,lw=2.4)
ar(6.2,1.5,10.4,"② NOTIFY（更新したよ）",NAVY)
ar(10.4,2.5,6.2,"③ SOA を引いてシリアルを比べる",TEAL)
ar(6.2,3.5,10.4,"④ IXFR / AXFR で転送（TSIG で認証）",NAVY)
pill(8.3,4.85,"リフレッシュ間隔ごとにも自分から確認",TEAL,size=14)
save("07_SOAとゾーン転送")

# 図8：MX（優先度とフェイルオーバ）
new(6.2)
nd(0.4,0.4,2.6,5.4,["送信側","メールサーバ"],[],SLATE)
nd(6.4,0.4,3.0,1.5,["キャッシュ","DNSサーバ"],[],TEAL)
ar(3.0,0.85,6.4,"① example.com の MX は？",SLATE)
ar(6.4,1.5,3.0,"10 mail1 / 20 mail2",GRAY,dash=True)
nd(10.0,2.45,2.95,1.3,["mail1"],["優先度 10"],RED,fill=LRED)
nd(10.0,4.5,2.95,1.3,["mail2"],["優先度 20"],TEAL,lw=2.4)
ar(3.0,3.1,10.0,"② まず優先度 10 に SMTP で接続",RED,dash=True)
label(8.9,2.85,0.6,0.5,"✘",24,RED,True)
ar(3.0,5.15,10.0,"③ つながらなければ優先度 20 に送る",TEAL)
save("08_MX")

# 図10：TXT（送信ドメイン認証）
new(6.4)
nd(0.4,2.2,2.5,2.0,["送信側"],["example.com","のメールサーバ"],SLATE)
nd(4.4,0.5,2.0,5.0,["受信側","メールサーバ"],[],TEAL,lw=2.4)
ar(2.9,3.2,4.4,"① メール",SLATE)
zone(9.0,0.45,4.05,5.6,"example.com のゾーン",NAVY,LNAVY,size=14)
rows=[(1.45,"SPF","example.com  TXT","\"v=spf1 ip4:... -all\"","② 送信元 IP は許可？"),
      (3.25,"DKIM","s1._domainkey  TXT","\"v=DKIM1; p=公開鍵\"","③ 公開鍵で署名を検証"),
      (5.05,"DMARC","_dmarc  TXT","\"v=DMARC1; p=reject\"","④ 失敗時の扱いは？")]
for cy,t,r1,r2,q in rows:
    b=box(9.4,cy-0.7,3.45,1.4,fill=WHITE,line=NAVY,lw=2.0,adj=0.1)
    text(b,[(t,16,TXT,True),(r1,13,GRAY,False),(r2,13,GRAY,False)])
    ar(6.4,cy,9.4,q,NAVY)
pill(5.4,6.0,"受け取る／隔離／拒否",TEAL,size=14)
save("10_TXT")
