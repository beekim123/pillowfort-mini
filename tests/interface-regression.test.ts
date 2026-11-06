import { describe, expect, it } from 'vitest';
import raw from '../assets/resources/data/levels.json';
import { GameController } from '../assets/scripts/ui/GameController';
import type { StorageLike } from '../assets/scripts/ui/GameController';
import { GameView } from '../assets/scripts/ui/GameView';

function setup(development=false) {
  let clock=1000;const memory=new Map<string,string>();
  const storage:StorageLike={getItem:k=>memory.get(k)??null,setItem:(k,v)=>{memory.set(k,v);},removeItem:k=>{memory.delete(k);}};
  const app=new GameController(raw,storage,development,()=>clock);
  const view=new GameView(app);
  const tick=(dt:number)=>{clock+=dt;app.tick(dt);};
  return {app,view,tick,storage,clock:()=>clock,advance:(dt:number)=>{clock+=dt;}};
}

describe('Independent shared controller/view regression',()=>{
  it('modal blocks all underlying targets and dismiss restores a fresh set',()=>{
    const {app,view}=setup();
    const first=view.render();expect(first.hitRegions.map(x=>x.action)).toEqual(['dismiss']);
    app.action('dismiss');const normal=view.render();expect(normal.hitRegions.some(x=>x.action==='slot')).toBe(true);
    app.action('breakdown','fangfang');expect(view.render().hitRegions.map(x=>x.action)).toEqual(['dismiss']);
    app.action('dismiss');expect(view.render().hitRegions.length).toBe(normal.hitRegions.length);
  });
  it('repeated tab opens/closes do not stop combat or multiply targets',()=>{
    const {app,view,tick}=setup();app.action('dismiss');
    const initial=view.render().hitRegions.length;
    for(let i=0;i<3;i++){app.action('tab','toys');view.render();tick(.5);app.action('close');expect(view.render().hitRegions.length).toBe(initial);}
    expect(app.battle.time).toBeGreaterThan(1);
  });
  it('fixed nest layout shifts by extra height but never changes logic',()=>{
    const {app,view}=setup();app.action('dismiss');const before=JSON.stringify(app.save);
    const short=view.render(1334).hitRegions.find(x=>x.id==='slot-2')!;
    const tall=view.render(1624).hitRegions.find(x=>x.id==='slot-2')!;
    expect(tall.x).toBe(short.x);expect(tall.y-short.y).toBe(290);expect(JSON.stringify(app.save)).toBe(before);
    expect(app.battle.units.find(x=>x.id==='fangfang')?.y).toBe(840);
  });
  it('pointer cancel ends repeated upgrade without further purchases',()=>{
    const {app,view,tick}=setup();app.action('dismiss');app.save.sheep=100000;
    app.action('tab','toys');const button=view.render().hitRegions.find(x=>x.action==='level'&&x.value==='fangfang')!;
    expect(button).toBeDefined();app.pointerDown(button.x+5,button.y+5);tick(.5);
    const level=app.save.toys.fangfang.lv;expect(level).toBeGreaterThan(1);
    app.pointerCancel();tick(.3);expect(app.save.toys.fangfang.lv).toBe(level);
  });
  it('suspend/resume is idempotent and offline money cannot be claimed twice',()=>{
    const f=setup();f.app.action('dismiss');f.app.save.farm={z:0,w:1,rates:[2],durations:[10]};f.app.suspend();f.advance(3600);f.app.resume();
    expect(f.app.save.sheep).toBe(7200);expect(f.app.modal?.kind).toBe('morning');
    f.app.resume();f.app.action('dismiss');f.app.action('dismiss');expect(f.app.save.sheep).toBe(7200);
    const restored=new GameController(raw,f.storage,false,f.clock);expect(restored.save.sheep).toBe(7200);
  });
  it('release controller ignores debug grants and reset does not happen before confirmation',()=>{
    const {app}=setup(false);app.action('dismiss');const sheep=app.save.sheep;app.action('money',1000);app.action('debug');expect(app.save.sheep).toBe(sheep);expect(app.panel).toBeNull();
    const dev=setup(true);dev.app.action('dismiss');dev.app.save.sheep=123;dev.app.action('reset');expect(dev.app.save.sheep).toBe(123);expect(dev.app.modal?.kind).toBe('reset');dev.app.action('dismiss');expect(dev.app.save.sheep).toBe(123);
  });
});
