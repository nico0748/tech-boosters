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


def new_slide():
    global prs, s
    prs=Presentation(); prs.slide_width=Inches(16); prs.slide_height=Inches(11.8)
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
    tw=size/72*1.05*sum(0.6 if ord(c)<128 else 1 for c in tab)+0.6
    t=box(x+0.25,y-0.27,tw,0.54,fill=accent,line=None,adj=0.5); text(t,tab,size,WHITE,True)

def node(x,y,w,h,title,sub,accent,fill=WHITE,lw=2.0,tsize=22):
    b=box(x,y,w,h,fill=fill,line=accent,lw=lw)
    text(b,[(title,tsize,TXT,True)]+[(t,16,GRAY,False) for t in sub])
    return b

def pill(cx,cy,t,fill,size=16,color=WHITE,w=None):
    w=w or size/72*1.05*len(t)+0.5
    p=box(cx-w/2,cy-0.25,w,0.5,fill=fill,line=None,adj=0.5); text(p,t,size,color,True); return p


def node2(x,y,w,h,num,title,sub,accent,fill=WHITE,lw=2.0,tsize=18,ssize=14):
    b=box(x,y,w,h,fill=fill,line=accent,lw=lw)
    t=(num+" " if num else "")+title
    text(b,[(t,tsize,TXT,True)]+[(x_,ssize,GRAY,False) for x_ in sub])
    return b


LGREEN=RGBColor(0xEC,0xF6,0xEC); GREEN=RGBColor(0x3C,0x8D,0x40)
def dzone(x,y,w,h,lab,color,fill=None,size=14,align=PP_ALIGN.CENTER,dash=True):
    b=box(x,y,w,h,fill=fill,line=color,lw=1.5,shape=MSO_SHAPE.RECTANGLE)
    if dash:
        ln=b.line._get_or_add_ln(); d=etree.SubElement(ln,qn('a:prstDash')); d.set('val','dash')
    label(x+0.1,y+0.05,w-0.2,0.38,lab,size,color,True,align)
def band(x,y,w,h,lab,fill,color):
    box(x,y,w,h,fill=fill,line=None,shape=MSO_SHAPE.RECTANGLE)
    label(x+0.08,y+0.03,w-0.16,0.32,lab,12,color,True,PP_ALIGN.LEFT)
C=lambda h: RGBColor(int(h[0:2],16),int(h[2:4],16),int(h[4:6],16))
CAT={
 "net":(C("7B4FB0"),C("F3EEFA"),"ネットワーク・配信"),
 "cmp":(C("D9731A"),C("FDF1E6"),"アプリを動かすサーバ"),
 "db":(C("2E5E8E"),C("EAF1F8"),"データベース"),
 "sto":(C("1E8A82"),C("E8F5F3"),"ファイルの保存"),
 "sec":(C("C0392B"),C("FBEEEC"),"認証・秘密情報"),
 "msg":(C("C2185B"),C("FCE8F0"),"ジョブの列"),
 "ext":(C("2B3A4A"),C("F3F4F6"),"外部サービス"),
 "usr":(C("2B3A4A"),WHITE,"ユーザー"),
 "host":(C("1E8A82"),C("E8F5F3"),"Claude Desktop（ホスト）"),
 "mcp":(C("D9731A"),C("FDF1E6"),"自作の翻訳アプリ（MCP サーバ）"),
 "cfg":(C("7B4FB0"),C("F3EEFA"),"設定・インストール"),
 "file":(C("2E5E8E"),C("EAF1F8"),"ローカルのファイル"),
 "ant":(C("2B3A4A"),C("F3F4F6"),"Anthropic"),
 "dev":(C("6B7280"),C("F3F4F6"),"開発者の公開先"),
}
MAP={"ユーザー":"usr","Route 53":"net","CloudFront":"net","ALB":"net","NAT ゲートウェイ":"net",
 "S3":"sto","Cognito":"sec","Secrets Manager":"sec","SQS":"msg","API サーバ":"cmp","翻訳ワーカー":"cmp",
 "RDS（プライマリ）":"db","RDS（スタンバイ）":"db","Claude API":"ext","決済サービス":"ext",
 "チャット画面":"host","会話の管理":"host","MCP クライアント":"host",
 "Node.js のプロセス":"mcp","read_document":"mcp","get_glossary":"mcp","save_translation":"mcp",
 "設定ファイル":"cfg","インストールしたパッケージ":"cfg",
 "papers/":"file","glossary.json":"file","translations/":"file",
 "サインイン":"ant","Claude":"ant","利用上限の管理":"ant",
 "GitHub リポジトリ":"dev","npm レジストリ":"dev"}
def n(x,y,w,h,title,sub,accent,tsize=14,ssize=12,lw=1.8,fill=WHITE):
    if title in MAP:
        accent,fill,_=CAT[MAP[title]]; lw=max(lw,2.0)
    return node2(x,y,w,h,"",title,sub,accent,fill=fill,lw=lw,tsize=tsize,ssize=ssize)
def legend(keys,y,x0=0.4):
    x=x0
    label(x,y,1.0,0.4,"色の意味",13,TXT,True,PP_ALIGN.LEFT); x+=1.05
    for k in keys:
        a,f,t=CAT[k]
        w=12/72*1.05*sum(0.6 if ord(c)<128 else 1 for c in t)+0.25
        if x+0.48+w>15.8: x=x0+1.05; y+=0.45
        box(x,y+0.07,0.42,0.28,fill=f,line=a,lw=2.0,adj=0.2)
        label(x+0.48,y,w,0.4,t,12,TXT,False,PP_ALIGN.LEFT); x+=0.48+w+0.2
def poly(pts,color=MGRAY,w=1.5,dash=False,both=False):
    for i in range(len(pts)-1):
        (x1,y1),(x2,y2)=pts[i],pts[i+1]
        last=(i==len(pts)-2)
        line(x1,y1,x2,y2,color=color,w=w,arrow=last,both=(both and i==0),dash=dash)
def elab(x,y,w,t,color=GRAY,size=12,align=PP_ALIGN.CENTER,bold=False):
    label(x,y,w,0.32,t,size,color,bold,align)

# ---------- 図2：従量課金の API で動かす翻訳アプリ（AWS） ----------
new_slide()
n(2.6,0.2,2.2,0.8,"ユーザー",["ブラウザ"],SLATE)
zone(0.3,1.45,12.4,9.35,"AWS",SLATE,None,size=16)
n(1.2,1.95,2.0,0.85,"Route 53",["DNS"],NAVY)
n(4.0,1.95,2.2,0.85,"CloudFront",["CDN"],NAVY)
poly([(3.2,1.0),(3.2,1.25),(2.2,1.25),(2.2,1.95)],color=SLATE)
poly([(4.2,1.0),(4.2,1.25),(5.1,1.25),(5.1,1.95)],color=SLATE)

dzone(0.55,3.15,11.9,7.45,"リージョン（東京）",NAVY,align=PP_ALIGN.LEFT)
n(0.8,3.6,2.4,0.95,"S3",["画面・原文・訳の保存"],NAVY)
n(5.6,3.6,2.2,0.95,"Cognito",["ログイン・会員管理"],NAVY)
poly([(4.4,2.8),(4.4,4.075),(3.2,4.075)],color=NAVY)
elab(3.22,3.72,1.15,"画面ファイル",NAVY)

zone(0.8,5.15,8.6,5.25,"VPC",GREEN,None,size=14)
dzone(1.05,5.55,3.95,4.7,"AZ a",NAVY)
dzone(5.2,5.55,3.95,4.7,"AZ b",NAVY)
for ax in (1.15,5.3):
    band(ax,5.95,3.75,1.2,"パブリックサブネット",LGREEN,GREEN)
    band(ax,7.3,3.75,1.45,"プライベートサブネット（アプリ）",LNAVY,NAVY)
    band(ax,8.9,3.75,1.25,"プライベートサブネット（DB）",LNAVY,NAVY)
pill(5.1,5.15,"インターネットゲートウェイ",CAT["net"][0],size=12,w=2.7)
line(5.1,2.8,5.1,4.9,color=NAVY,w=1.8)
line(5.1,5.4,5.1,6.3,color=NAVY,w=1.8)
n(4.3,6.3,1.6,0.75,"ALB",["負荷分散"],NAVY)
n(1.25,6.3,1.85,0.75,"NAT ゲートウェイ",[],SLATE,tsize=12)
n(7.15,6.3,1.85,0.75,"NAT ゲートウェイ",[],SLATE,tsize=12)
n(1.3,7.65,1.75,0.95,"翻訳ワーカー",["ECS"],NAVY)
n(3.15,7.65,1.75,0.95,"API サーバ",["ECS"],NAVY)
n(5.3,7.65,1.75,0.95,"API サーバ",["ECS"],NAVY)
n(7.25,7.65,1.75,0.95,"翻訳ワーカー",["ECS"],NAVY)
poly([(4.75,7.05),(4.75,7.3),(4.0,7.3),(4.0,7.65)],color=NAVY)
poly([(5.45,7.05),(5.45,7.3),(6.15,7.3),(6.15,7.65)],color=NAVY)
line(2.15,7.65,2.15,7.05,color=SLATE,w=1.4)
line(8.1,7.65,8.1,7.05,color=SLATE,w=1.4)
n(1.6,9.25,2.4,0.8,"RDS（プライマリ）",["会員・利用量・履歴"],NAVY)
n(5.75,9.25,2.4,0.8,"RDS（スタンバイ）",[],NAVY)
line(4.0,9.65,5.75,9.65,color=NAVY,w=1.4)
elab(4.0,9.3,1.75,"同期",NAVY)
line(4.0,8.6,4.0,9.25,color=NAVY,w=1.4)
# API b -> Cognito
line(6.15,7.65,6.15,4.55,color=NAVY,w=1.3,dash=True)
elab(6.2,4.75,1.6,"ログイン確認",NAVY,align=PP_ALIGN.LEFT)

n(9.75,7.4,2.5,1.1,"SQS",["API が入れた翻訳ジョブを","ワーカーが取り出す"],NAVY)
n(9.75,9.05,2.5,1.0,"Secrets Manager",["Claude API キー"],NAVY)
poly([(6.15,8.6),(6.15,8.78),(9.55,8.78),(9.55,7.7),(9.75,7.7)],color=NAVY,w=1.3,dash=True)
line(9.75,8.2,9.0,8.2,color=NAVY,w=1.3,dash=True)
poly([(8.4,8.6),(8.4,9.55),(9.75,9.55)],color=NAVY,w=1.3,dash=True)
elab(8.45,9.2,1.3,"キーを取得",NAVY,align=PP_ALIGN.LEFT)

zone(13.05,3.15,2.65,7.45,"外部サービス",SLATE,LGRAY,size=14)
n(13.3,5.95,2.15,1.2,"Claude API",["Anthropic","従量課金"],SLATE,lw=2.4)
n(13.3,8.3,2.15,1.0,"決済サービス",["月額プランの請求"],SLATE)
line(9.0,6.45,13.3,6.45,color=NAVY,w=1.8,both=True)
elab(9.5,6.1,3.2,"Claude を呼ぶ（NAT 経由）",NAVY,bold=True)
poly([(9.0,6.95),(12.85,6.95),(12.85,8.8),(13.3,8.8)],color=SLATE,w=1.4)
elab(9.5,6.6,3.2,"支払い処理",SLATE)
legend(["net","cmp","db","sto","sec","msg","ext"],10.95)
import sys as _s
prs.save(_s.argv[1])

# ---------- 図3：MCP ＋ Claude のプランで動かす翻訳アプリ ----------
new_slide()
zone(0.3,0.6,10.0,10.0,"ユーザーの PC（macOS / Windows）",TEAL,None,size=16)
dzone(0.6,1.15,4.2,5.05,"翻訳アプリ（MCP サーバ）",CAT["mcp"][0],None)
n(0.85,1.65,3.7,0.95,"Node.js のプロセス",["Claude Desktop が子プロセスとして起動"],TEAL)
n(0.85,2.95,3.7,0.75,"read_document",["原文を読んで段落ごとに分ける"],TEAL,tsize=13)
n(0.85,3.85,3.7,0.75,"get_glossary",["用語集を返す"],TEAL,tsize=13)
n(0.85,4.75,3.7,0.75,"save_translation",["訳をファイルに保存"],TEAL,tsize=13)

dzone(5.85,1.15,4.25,5.05,"Claude Desktop（アプリ）",CAT["host"][0],None)
n(6.1,1.65,3.7,0.95,"チャット画面",["「この論文を訳して」と頼む"],TEAL)
n(6.1,2.95,3.7,0.95,"会話の管理",["Claude とのやり取り・履歴"],TEAL)
n(6.1,4.25,3.7,1.2,"MCP クライアント",["ツールの一覧を Claude に渡し、","呼び出しを MCP サーバへ送る"],TEAL,lw=2.4)
line(7.975,2.6,7.775,2.95,color=TEAL,w=1.4,both=True)
line(7.975,3.9,7.775,4.25,color=TEAL,w=1.4,both=True)
line(6.1,4.85,4.55,4.85,color=TEAL,w=2.0,both=True)
elab(4.6,4.45,1.45,"stdio",TEAL,bold=True)
label(4.6,4.95,1.45,0.65,[("JSON-",12,GRAY,False),("RPC",12,GRAY,False)])

dzone(0.6,6.65,4.2,3.6,"ローカルのファイル",CAT["file"][0],None)
n(0.85,7.15,3.7,0.8,"papers/",["原文の PDF"],SLATE,tsize=13)
n(0.85,8.1,3.7,0.8,"glossary.json",["用語集"],SLATE,tsize=13)
n(0.85,9.05,3.7,0.8,"translations/",["訳したファイル"],SLATE,tsize=13)
line(2.7,6.2,2.7,6.65,color=SLATE,w=1.4,both=True)
elab(2.8,6.25,1.6,"読み書き",SLATE,align=PP_ALIGN.LEFT)

n(5.85,6.65,4.0,1.0,"設定ファイル",["claude_desktop_config.json","MCP サーバの起動コマンドを登録"],MGRAY,lw=1.4)
line(7.975,6.65,7.775,6.2,color=MGRAY,w=1.4,dash=True)
elab(8.075,6.25,1.8,"起動時に読む",GRAY,align=PP_ALIGN.LEFT)
n(5.85,8.9,4.0,1.0,"インストールしたパッケージ",["npx で取得した翻訳アプリ本体"],MGRAY,lw=1.4)

zone(10.8,0.6,4.9,5.6,"Anthropic のクラウド",SLATE,LGRAY,size=16)
n(11.1,1.2,4.3,0.95,"サインイン",["Anthropic のアカウント"],SLATE)
n(11.1,2.55,4.3,1.6,"Claude",["原文を訳す","どのツールを呼ぶかも決める"],SLATE,lw=2.4,tsize=16)
n(11.1,4.5,4.3,1.0,"利用上限の管理",["ユーザーのプランの枠"],SLATE)
line(9.85,3.35,11.1,3.35,color=TEAL,w=2.0,both=True)
label(9.85,2.6,1.25,0.7,[("HTTPS",12,TEAL,True),("会話・結果",12,TEAL,True)])
line(10.1,1.67,11.1,1.67,color=SLATE,w=1.4,dash=True)
line(13.25,4.15,13.25,4.5,color=SLATE,w=1.4,both=True)

zone(10.8,6.65,4.9,3.7,"開発者",SLATE,LGRAY,size=16)
n(11.1,7.15,4.3,1.0,"GitHub リポジトリ",["ソース・README"],SLATE)
n(11.1,8.9,4.3,1.0,"npm レジストリ",["公開したパッケージ"],SLATE)
line(13.25,8.15,13.25,8.9,color=SLATE,w=1.4)
elab(13.35,8.35,1.5,"公開",GRAY,align=PP_ALIGN.LEFT)
line(11.1,9.4,9.85,9.4,color=MGRAY,w=1.4)
elab(9.85,9.05,1.25,"インストール",GRAY)
legend(["host","mcp","cfg","file","ant","dev"],10.95)
prs.save(_s.argv[2])
