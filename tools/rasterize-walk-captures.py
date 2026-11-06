"""Optional QA helper: rasterize GameView draw captures with Pillow, not a browser capture.
Run after npm run build:preview && node tools/render-walk-preview.mjs.
Pillow and a Noto Sans CJK font are external QA tools, not game/runtime dependencies.
"""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont
FONT = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
ROOT = Path('docs/screenshots/p1-walk')
for path in ROOT.glob('*.draw.json'):
    data = json.loads(path.read_text())
    scale = 2
    image = Image.new('RGBA', (data['width'] * scale, data['height'] * scale))
    fonts = {}
    def px(value): return round(value * scale)
    for command in sorted(data['commands'], key=lambda value: value['layer']):
        layer = Image.new('RGBA', image.size)
        draw = ImageDraw.Draw(layer)
        c, color = command, command['color']
        if c['kind'] == 'rect':
            draw.rectangle((px(c['x']), px(c['y']), px(c['x'] + c['w']), px(c['y'] + c['h'])), fill=color)
        elif c['kind'] == 'line':
            draw.line((px(c['x']), px(c['y']), px(c['x2']), px(c['y2'])), fill=color, width=max(1, px(c['width'])))
        elif c['kind'] == 'poly':
            draw.polygon([(px(x), px(y)) for x, y in c['points']], fill=color)
        else:
            size = px(c['size'])
            if size not in fonts: fonts[size] = ImageFont.truetype(FONT, size)
            x = c['x'] + (c['width'] / 2 if c['align'] == 'center' else c['width'] if c['align'] == 'right' else 0)
            draw.text((px(x), px(c['y'])), c['text'], font=fonts[size], fill=color, anchor={'left': 'lt', 'center': 'mt', 'right': 'rt'}[c['align']])
        image = Image.alpha_composite(image, layer)
    image.resize((data['width'], data['height']), Image.Resampling.LANCZOS).convert('RGB').save(str(path).replace('.draw.json', '.png'))
    print(path.name)
