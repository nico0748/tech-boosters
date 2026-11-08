import sys,os,subprocess,zipfile,re,shutil,glob
from PIL import Image
os.environ['FONTCONFIG_FILE']=os.path.abspath('fonts.conf')
d=sys.argv[1]; w=os.path.abspath('work'); os.makedirs(w,exist_ok=True)
for f in sorted(glob.glob(d+'/*.pptx')):
    b=os.path.splitext(os.path.basename(f))[0]
    subprocess.run(['soffice','--headless','--convert-to','odp','--outdir',w,f],capture_output=True)
    odp=f'{w}/{b}.odp'; z=zipfile.ZipFile(odp); tmp=odp+'.new'; o=zipfile.ZipFile(tmp,'w')
    for it in z.infolist():
        data=z.read(it.filename)
        if it.filename in('content.xml','styles.xml'):
            x=data.decode(); x=re.sub(r'style:text-autospace="[^"]*"','style:text-autospace="none"',x)
            x=re.sub(r'<style:paragraph-properties(?![^>]*text-autospace)',r'<style:paragraph-properties style:text-autospace="none"',x)
            data=x.encode()
        o.writestr(it, data, compress_type=zipfile.ZIP_STORED if it.filename=='mimetype' else zipfile.ZIP_DEFLATED)
    o.close(); shutil.move(tmp,odp)
    subprocess.run(['soffice','--headless','--convert-to','pdf','--outdir',w,odp],capture_output=True)
    subprocess.run(['pdftoppm','-png','-r','300','-singlefile',f'{w}/{b}.pdf',f'{w}/{b}'])
    im=Image.open(f'{w}/{b}.png').convert('RGB')
    im=im.resize((2000,round(im.height*2000/im.width)),Image.LANCZOS)
    im.save(f'{d}/{b}.png'); print(b, im.size)
