import json, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageColor
root=Path(__file__).resolve().parent
fontpath='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
fonts={}
issues=[]
for p in sorted(root.glob('[0-9]*.json')):
 s=json.loads(p.read_text()); im=Image.new('RGBA',(s['width'],s['height']),'#172333')
 for c in sorted(s['frame']['commands'],key=lambda c:c['layer']):
  overlay=Image.new('RGBA',im.size); d=ImageDraw.Draw(overlay)
  col=ImageColor.getcolor(c['color'],'RGBA')
  if c['kind']=='rect':d.rectangle((c['x'],c['y'],c['x']+c['w'],c['y']+c['h']),fill=col)
  elif c['kind']=='line':d.line((c['x'],c['y'],c['x2'],c['y2']),fill=col,width=c['width'])
  elif c['kind']=='poly':d.polygon([tuple(x) for x in c['points']],fill=col)
  elif c['kind']=='text':
   f=fonts.setdefault(c['size'],ImageFont.truetype(fontpath,c['size'],index=2))
   tw=d.textlength(c['text'],font=f); x=c['x']+(c['width']-tw)/2 if c['align']=='center' else c['x']+c['width']-tw if c['align']=='right' else c['x']
   d.text((x,c['y']),c['text'],font=f,fill=col,anchor='lt')
   if tw>c['width']+2:issues.append({'file':p.name,'type':'text exceeds declared width','text':c['text'],'actual':round(tw,1),'width':c['width']})
   if x<0 or x+tw>s['width']+1 or c['y']<0 or c['y']+c['size']>s['height']:issues.append({'file':p.name,'type':'text outside screen','text':c['text'],'x':x,'y':c['y']})
  im=Image.alpha_composite(im,overlay)
 im.convert('RGB').save(p.with_suffix('.png'))
print('RENDERED',len(list(root.glob('[0-9]*.png'))),'frames; width/bounds issues',len(issues))
(root/'render-bounds.json').write_text(json.dumps(issues,ensure_ascii=False,indent=2))
files=list(sorted(root.glob('[0-9]*.png')))
for batch in range(math.ceil(len(files)/8)):
 subset=files[batch*8:(batch+1)*8];sheet=Image.new('RGB',(1000,1000),'#fff')
 for i,p in enumerate(subset):
  im=Image.open(p);im.thumbnail((235,455));x=i%4*250+(250-im.width)//2;y=i//4*500+35
  sheet.paste(im,(x,y));d=ImageDraw.Draw(sheet);d.text((i%4*250+5,i//4*500+5),p.stem[:29],font=ImageFont.truetype(fontpath,12),fill='black')
 sheet.save(root/f'contact-sheet-{batch+1}.png')
print(json.dumps(issues[:20],ensure_ascii=False,indent=2))
