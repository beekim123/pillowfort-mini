import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const base=fileURLToPath(new URL('../../../assets/scripts/ui/',import.meta.url));
const cocos=fs.readFileSync(base+'PillowFort.ts','utf8');
const preview=fs.readFileSync(base+'CanvasPreview.ts','utf8');
const controller=fs.readFileSync(base+'GameController.ts','utf8');
const view=fs.readFileSync(base+'GameView.ts','utf8');
const results=[
['Cocos onHide cancels active pointer',/private onHide\(\): void \{\s*this.onTouchCancel\(\);/.test(cocos)],
['Cocos onShow cancels active pointer',/private onShow\(\): void \{\s*this.onTouchCancel\(\);/.test(cocos)],
['Canvas keeps design750 width rather than caps600',!preview.includes('window.innerWidth, 600')],
['Captain star is drawn beside rather than above O3',view.includes('mx + 60, my - 12 + e')],
['Nondevelopment debug actions blocked',controller.includes('if (!this.development) return;')],
['Cocos controller development uses compile constant',cocos.includes('sys.localStorage, DEV')],
['Touch cancel clears identity and app hold',/private onTouchCancel\(\): void \{ this.touchId = null; this.app\?\.pointerCancel\(\); \}/.test(cocos)],
];
fs.writeFileSync(new URL('static-ui-checks.json',import.meta.url),JSON.stringify({description:'Source-pattern checks only, not Cocos engine execution',results},null,2));console.log(results);
