import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {GameController} from '../../../preview/scripts/ui/GameController.js';
import {GameView} from '../../../preview/scripts/ui/GameView.js';
import * as Core from '../../../preview/scripts/core/index.js';
const root=fileURLToPath(new URL('.',import.meta.url));
const raw=JSON.parse(fs.readFileSync(new URL('../../../preview/levels.json',import.meta.url),'utf8'));
const store=new Map(); let now=Date.now()/1000;
const storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const app=new GameController(raw,storage,true,()=>now),view=new GameView(app);
const checks=[]; let height=1334;
const check=(name,fn)=>{try{fn();checks.push({name,pass:true});}catch(e){checks.push({name,pass:false,error:String(e)});}};
const render=()=>view.render(height);
const click=id=>{const r=render().hitRegions.find(r=>r.id===id&&r.enabled!==false);assert(r,`missing enabled ${id}`); app.uiTime+=.21;app.pointerDown(r.x+r.w/2,r.y+r.h/2);app.pointerUp(r.x+r.w/2,r.y+r.h/2);render();};
const snap=name=>{fs.writeFileSync(`${root}/${name}.json`,JSON.stringify({width:750,height,frame:render()},null,2));};
const tick=seconds=>{for(let i=0;i<seconds*30;i++){now+=1/30;app.tick(1/30);}};
snap('01-intro-1334');
check('Intro blocks field taps and pauses battle',()=>{const f=render();assert.equal(f.hitRegions.length,1);const t=app.battle.time;tick(1);assert.equal(app.battle.time,t);});
check('Dismiss intro via hit region',()=>{click('modal-dismiss');assert.equal(app.modal,null);});
tick(2);snap('02-wave-1334');
check('Stay toggle responds and rejects immediate duplicate tap',()=>{click('stay');assert(app.save.stay);const r=render().hitRegions.find(r=>r.id==='stay');app.pointerDown(r.x+5,r.y+5);app.pointerUp(r.x+5,r.y+5);assert(app.save.stay);});
for(const p of ['toys','fort','daily','boxes','settings'])check(`Open and close ${p} panel`,()=>{click(`tab-${p}`);assert.equal(app.panel,p);snap(`03-panel-${p}-1334`);click('panel-close');assert.equal(app.panel,null);});
check('Hold upgrade repeats and deducts currency',()=>{app.save.sheep=100000;click('tab-toys');const before=app.save.toys.fangfang.lv;const r=render().hitRegions.find(r=>r.id==='level-fangfang');assert(r);app.pointerDown(r.x+5,r.y+5);tick(1);app.pointerUp(r.x+5,r.y+5);assert(app.save.toys.fangfang.lv>=before+3);assert(app.save.sheep<100000);click('panel-close');});
check('Long press occupied slot shows breakdown and release does not place',()=>{const i=app.save.lineup.indexOf('fangfang');const r=render().hitRegions.find(r=>r.id===`slot-${i}`);app.pointerDown(r.x+20,r.y+20);tick(.6);app.pointerUp(r.x+20,r.y+20);assert.equal(app.modal?.kind,'breakdown');assert.equal(app.panel,null);snap('04-breakdown-1334');click('modal-dismiss');});
check('Slot placement swaps occupied toys',()=>{const i=app.save.lineup.indexOf('fangfang'),j=app.save.lineup.indexOf('huhu');click(`slot-${i}`);assert.equal(app.panel,'placement');click('place-huhu');assert.equal(app.save.lineup[i],'huhu');assert.equal(app.save.lineup[j],'fangfang');assert.equal(app.panel,null);});
check('Two-position swap route works',()=>{const i=app.save.lineup.indexOf('fangfang'),j=app.save.lineup.indexOf('huhu');click(`slot-${i}`);click('swap');assert.equal(app.panel,null);click(`slot-${j}`);assert.equal(app.save.lineup[j],'fangfang');});
check('Blank panel region does not trigger field beneath',()=>{click('tab-fort');const before=[...app.save.lineup];app.pointerDown(22,600);app.pointerUp(22,600);assert.equal(app.panel,'fort');assert.deepEqual(app.save.lineup,before);click('panel-close');});
check('Flashlight drag changes mode and fires on charge',()=>{app.battle.flash.charge=app.data.flash.charge;const r=render().hitRegions.find(r=>r.id==='flash');app.pointerDown(r.x+20,r.y+20);app.pointerMove(350,400);tick(.1);app.pointerUp(350,400);assert.equal(app.save.autoFlash,false);assert(app.battle.flash.until>app.battle.time);snap('05-flash-1334');});
check('Pointer cancel releases held controls',()=>{click('tab-toys');const r=render().hitRegions.find(r=>r.id==='level-fangfang');app.pointerDown(r.x+5,r.y+5);app.pointerCancel();const lv=app.save.toys.fangfang.lv;tick(.8);assert.equal(app.save.toys.fangfang.lv,lv);click('panel-close');});
check('Debug entry has three pages',()=>{click('tab-settings');click('debug-open');assert.equal(app.panel,'debug');for(let i=0;i<3;i++){assert.equal(app.page,i);snap(`06-debug-${i+1}-1334`);if(i<2)click('next');}});
check('Reset cancellation preserves game',()=>{const old=app.save.toys.fangfang.lv;click('reset');assert.equal(app.modal.kind,'reset');snap('07-reset-confirmation-1334');click('cancel-reset');assert.equal(app.modal,null);assert.equal(app.save.toys.fangfang.lv,old);click('panel-close');});
check('Debug progression unlocks only P1 actors',()=>{app.debugZ=2;app.debugW=49;app.action('progress');assert.equal(app.save.z,2);assert.equal(app.save.w,49);assert(Object.values(app.save.toys).filter(t=>t.got).length<=9);app.save.candy=1000;app.save.boxes.free=2;app.save.fort=72;Core.syncBattle(app.battle,app.save);});
for(const p of ['toys','fort','daily','boxes']){click(`tab-${p}`);snap(`08-unlocked-${p}-1334`);click('panel-close');}
check('Free box modal and wishes use controller actions',()=>{click('tab-boxes');const n=app.save.boxes.free;click('open-free');assert.equal(app.save.boxes.free,n-1);assert.equal(app.modal?.kind,'notice');click('modal-dismiss');const before=app.save.captain.shards;click('wish');assert.equal(app.save.captain.shards,before+app.data.econ.wishShards);click('panel-close');});
check('Boss entry and retreat keep wave 49 available',()=>{click('boss');assert(app.battle.boss);tick(1);snap('09-boss-2-1334');click('boss');assert(!app.battle.boss);assert.equal(app.save.w,49);});
check('20-hour offline action caps at 8 hours and collection is one-time',()=>{app.save.farm={z:0,w:1,rates:[10],durations:[10]};app.action('offline',20);assert.equal(app.modal?.kind,'morning');assert.equal(app.modal.card.seconds,28800);snap('10-morning-1334');const s=app.save.sheep;click('modal-dismiss');app.action('dismiss');assert.equal(app.save.sheep,s);});
check('Suspend/resume avoids counting active time twice',()=>{app.suspend();const before=app.save.sheep;now+=120;app.resume();assert.equal(app.modal?.kind,'morning');assert(app.save.sheep>before);const settled=app.save.sheep;app.resume();assert.equal(app.save.sheep,settled);click('modal-dismiss');});
height=1624; app.longestText=true;snap('11-field-longest-1624');
for(const p of ['toys','fort','daily','boxes','settings']){click(`tab-${p}`);snap(`12-panel-${p}-1624`);click('panel-close');}
check('Tall layout moves nests and tabs by exactly 290',()=>{const f=render(),r=f.hitRegions.find(r=>r.id==='slot-2');assert.equal(r.y,app.data.nest.slots[2].pos[1]-app.data.nest.slotRadius+290);const t=f.hitRegions.find(r=>r.id==='tab-toys');assert.equal(t.y,1514);});
check('Production preview omits developer entry',()=>{const p=new GameController(raw,storage,false,()=>now);p.modal=null;p.action('tab','settings');const f=new GameView(p).render();assert(!f.hitRegions.some(r=>r.id==='debug-open'));});
check('Stored progress survives a new controller instance',()=>{app.persist();const p=new GameController(raw,storage,true,()=>now);assert.equal(p.save.z,app.save.z);assert.equal(p.save.w,app.save.w);assert.deepEqual(p.save.lineup,app.save.lineup);});
check('CSV is structured and has required header',()=>{assert(app.csv().includes('全队平均DPS'));assert(app.csv().includes('挡住秒数'));});
fs.writeFileSync(`${root}/checks.json`,JSON.stringify({environment:'Node controller hit-region simulation, NOT real browser input',checks},null,2));
console.log(JSON.stringify(checks,null,2));
// Explicit deterministic view fixtures; these do not prove natural progression or combat rules.
app.modal=null;app.panel=null;app.effects=[];app.toastUntil=0;app.longestText=false;height=1334;
for(const z of [0,1]){app.debugZ=z;app.debugW=49;app.action('jump');app.action('boss');tick(2);app.toastUntil=0;snap(`13-boss-${z}-1334`);app.action('retreat');}
app.save.fort=72;for(const t of Object.values(app.save.toys))t.got=true;
app.save.lineup=Array(app.data.nest.slots.length).fill(null);
const supportIndex=app.data.nest.slots.findIndex(s=>s.id==='M2');app.save.lineup[supportIndex]='dingdang';
app.save.lineup[2]='fangfang';app.save.lineup[7]='huhu';app.save.lineup[8]='gaga';
app.battle=Core.startWave(app.data,app.save,{attempt:5});app.effects=[];app.panel=null;app.modal=null;
click(`slot-${supportIndex}`);app.toastUntil=0;snap('14-support-adjacent-1334');
check('Support first click keeps field visible and draws only adjacent lines',()=>{assert.equal(app.panel,null);assert.equal(app.selectedSlot,supportIndex);const ls=render().commands.filter(c=>c.kind==='line'&&c.color==='#f4ce73'&&c.width===5);assert.equal(ls.length,app.data.nest.slots[supportIndex].adjacent.length);});
app.selectedSlot=null;app.panel=null;app.milestone=2;app.milestoneUntil=app.uiTime+1.5;snap('15-break-unit-1334');


app.milestoneUntil=0;app.selectedSlot=null;app.panel=null;app.modal=null;tick(2);app.action('breakdown','fangfang');
check('Breakdown displays last real hit rather than only base estimate',()=>{assert(app.modal.lines[0].startsWith('最近真实命中'));snap('16-last-hit-breakdown-1334');});
check('Long breakdown pagination preserves readable controls',()=>{const original=[...app.modal.lines];app.modal.lines=[...original,...original];app.modal.page=0;let f=render();assert(f.hitRegions.some(r=>r.id==='modal-next'&&r.enabled));snap('17-long-breakdown-page1-1334');click('modal-next');assert.equal(app.modal.page,1);snap('18-long-breakdown-page2-1334');click('modal-prev');assert.equal(app.modal.page,0);click('modal-dismiss');assert.equal(app.modal,null);});
check('Captain star label stays outside O3 toy bounds',()=>{const s=render().commands.find(c=>c.kind==='text'&&c.text===`★${app.save.captain.star}`);assert(s.x>app.data.nest.slots[2].pos[0]+app.data.nest.slotRadius);});
fs.writeFileSync(`${root}/checks.json`,JSON.stringify({environment:'Node controller hit-region simulation, NOT real browser input',checks},null,2));
console.log('SUPPLEMENTAL',JSON.stringify(checks.slice(26),null,2));
