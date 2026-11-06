import {
  _decorator, Component, Node, Graphics, Label, Color, UITransform, view, ResolutionPolicy,
  resources, JsonAsset, sys, game, Game, input, Input, EventTouch, EventMouse,
  Layers, HorizontalTextAlignment, VerticalTextAlignment, Sprite, SpriteFrame, Texture2D, ImageAsset, Rect, Size, Vec2, screen,
} from 'cc';
import { DEV } from 'cc/env';
import { GameController } from './GameController';
import { GameView } from './GameView';
import type { DrawCommand } from './Draw';
import { THEME } from './Theme';
import { ARTCODE } from '../art/artcode.gen';
import { ArtBook, artScale, generate, runSliced } from '../art/ArtGen';
import { ArtView } from '../art/ArtView';
import type { CanvasLike } from '../art/ArtTypes';

const { ccclass } = _decorator;
/** 一层里按绘制顺序排的节点：连着的线 / 多边形共用一个 Graphics；色块和美术图都是 Sprite（同一张图集，能合批）；文字在最上面 */
interface DrawItem { node: Node; g: Graphics | null; s: Sprite | null }
interface RenderLayer { root: Node; items: Node; text: Node; list: DrawItem[]; k: number; open: boolean; labels: Label[]; used: number }
interface MiniGameFileSystem { writeFileSync(path: string, data: string, encoding: string): void }
interface MiniGameAPI {
  env?: { USER_DATA_PATH?: string };
  getFileSystemManager?: () => MiniGameFileSystem;
  getMenuButtonBoundingClientRect?: () => { top: number; height: number; bottom: number };
}

/** Cocos Creator 3.8.8 entry. Attach to the Canvas (or extend from Boot). */
@ccclass('PillowFort')
export class PillowFort extends Component {
  private app: GameController | null = null;
  private gameView: GameView | null = null;
  private renderLayers: RenderLayer[] = [];
  private colors = new Map<string, Color>();
  private designHeight = 1334;
  private safeTop = 0;
  private safeBottom = 0;
  private touchId: number | null = null;
  private book: ArtBook | null = null;
  private frames = new Map<string, SpriteFrame>();
  private textures: Texture2D[] = [];
  private white: SpriteFrame | null = null;

  onLoad(): void {
    view.setDesignResolutionSize(750, 1334, ResolutionPolicy.FIXED_WIDTH);
    this.node.layer = Layers.Enum.UI_2D;
    if (!this.node.getComponent(UITransform)) this.node.addComponent(UITransform);
    for (let index = 0; index < 5; index++) {
      const root = new Node(`DrawLayer${index}`); root.layer = Layers.Enum.UI_2D; root.parent = this.node;
      root.addComponent(UITransform);
      const items = new Node('Items'); items.layer = Layers.Enum.UI_2D; items.parent = root; items.addComponent(UITransform);
      const text = new Node('Text'); text.layer = Layers.Enum.UI_2D; text.parent = root; text.addComponent(UITransform);
      this.renderLayers.push({ root, items, text, list: [], k: 0, open: false, labels: [], used: 0 });
    }
    this.white = this.whiteFrame();
    this.resize();
    this.paintLoading('枕头堡\n正在铺好小被子……');
    resources.load('data/levels', JsonAsset, (error, asset) => {
      if (!this.isValid) return;
      if (error || !asset) { this.paintLoading('关卡数据没有读到\n请确认 resources/data/levels.json'); console.error(error); return; }
      try {
        this.app = new GameController(asset.json, sys.localStorage, DEV);
        this.gameView = new GameView(this.app);
        this.app.onExport = csv => this.exportCsv(csv);
        this.startArt(this.app, this.gameView);
      } catch (failure) { this.paintLoading('启动失败，请查看开发控制台'); console.error(failure); }
    });
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    input.on(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
    input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    game.on(Game.EVENT_HIDE, this.onHide, this);
    game.on(Game.EVENT_SHOW, this.onShow, this);
  }

  update(dt: number): void {
    this.resize();
    if (!this.app || !this.gameView) return;
    this.app.tick(dt);
    this.paint(this.gameView.render(this.designHeight - this.safeTop - this.safeBottom).commands);
  }
  private resize(): void {
    const visible = view.getVisibleSize();
    this.designHeight = Math.max(1334, visible.height);
    this.node.getComponent(UITransform)!.setContentSize(750, this.designHeight);
    const safe = sys.getSafeAreaRect();
    // Safe-area rect uses bottom-left screen pixels; convert through physical display width.
    const screen = view.getFrameSize();
    const scale = screen.width > 0 ? 750 / screen.width : 1;
    this.safeTop = Math.max(0, screen.height - safe.y - safe.height) * scale;
    this.safeBottom = Math.max(0, safe.y) * scale;
    // Avoid shifting a short screen below the 1334px logical minimum.
    if (this.designHeight - this.safeTop - this.safeBottom < 1334) { this.safeTop = 0; this.safeBottom = 0; }
  }
  private uiPoint(x: number, y: number): [number, number] { return [x, this.designHeight - y - this.safeTop]; }
  private onTouchStart(event: EventTouch): void {
    if (this.touchId !== null) return; this.touchId = event.getID();
    const p = event.getUILocation(); const [x, y] = this.uiPoint(p.x, p.y); this.app?.pointerDown(x, y);
  }
  private onTouchMove(event: EventTouch): void { if (event.getID() !== this.touchId) return; const p = event.getUILocation(); const [x, y] = this.uiPoint(p.x, p.y); this.app?.pointerMove(x, y); }
  private onTouchEnd(event: EventTouch): void { if (event.getID() !== this.touchId) return; const p = event.getUILocation(); const [x, y] = this.uiPoint(p.x, p.y); this.app?.pointerUp(x, y); this.touchId = null; }
  private onTouchCancel(): void { this.touchId = null; this.app?.pointerCancel(); }
  private onMouseDown(event: EventMouse): void { if (this.touchId !== null) return; const p = event.getUILocation(); const [x, y] = this.uiPoint(p.x, p.y); this.app?.pointerDown(x, y); }
  private onMouseMove(event: EventMouse): void { if (this.touchId !== null) return; const p = event.getUILocation(); const [x, y] = this.uiPoint(p.x, p.y); this.app?.pointerMove(x, y); }
  private onMouseUp(event: EventMouse): void { if (this.touchId !== null) return; const p = event.getUILocation(); const [x, y] = this.uiPoint(p.x, p.y); this.app?.pointerUp(x, y); }
  private onHide(): void { this.onTouchCancel(); this.app?.suspend(); }
  private onShow(): void { this.onTouchCancel(); this.app?.resume(); }
  private color(hex: string): Color {
    const cached = this.colors.get(hex); if (cached) return cached;
    const raw = hex.slice(1); const color = new Color(parseInt(raw.slice(0, 2), 16), parseInt(raw.slice(2, 4), 16), parseInt(raw.slice(4, 6), 16), raw.length === 8 ? parseInt(raw.slice(6, 8), 16) : 255);
    this.colors.set(hex, color); return color;
  }
  private paint(commands: DrawCommand[]): void {
    for (const layer of this.renderLayers) { layer.k = 0; layer.open = false; layer.used = 0; }
    const y = (v: number) => this.designHeight / 2 - v - this.safeTop;
    for (const command of commands) {
      const layer = this.renderLayers[command.layer];
      if (command.kind === 'line' || command.kind === 'poly') {
        const g = this.graphicsAt(layer);
        if (command.kind === 'line') { g.strokeColor = this.color(command.color); g.lineWidth = command.width; g.moveTo(command.x - 375, y(command.y)); g.lineTo(command.x2 - 375, y(command.y2)); g.stroke(); }
        else { g.fillColor = this.color(command.color); command.points.forEach(([x, v], index) => index ? g.lineTo(x - 375, y(v)) : g.moveTo(x - 375, y(v))); g.close(); g.fill(); }
      } else if (command.kind === 'rect') {
        const frame = this.frameOf('white') ?? this.white; if (!frame) continue;
        const sp = this.spriteAt(layer), node = sp.node;
        if (sp.spriteFrame !== frame) sp.spriteFrame = frame;
        sp.color = this.color(command.color);
        node.getComponent(UITransform)!.setContentSize(command.w, command.h);
        node.setPosition(command.x - 375, y(command.y), 0); node.setRotationFromEuler(0, 0, 0); node.setScale(1, 1, 1);
      } else if (command.kind === 'sprite') {
        const frame = this.frameOf(command.img); if (!frame) continue;
        const sp = this.spriteAt(layer), node = sp.node, [a, b, c, d, e, f] = command.m;
        if (sp.spriteFrame !== frame) sp.spriteFrame = frame;
        sp.color = this.alphaColor(command.alpha);
        // 设计坐标（y 朝下、左上原点）的矩阵 → Cocos 节点（y 朝上、锚点左上）：位置 + 旋转 + 缩放（部件链里极少的斜切忽略）
        const sx = Math.hypot(a, b) || 1e-6, sy = (a * d - b * c) / sx;
        node.getComponent(UITransform)!.setContentSize(command.w, command.h);
        node.setPosition(e - 375, y(f), 0); node.setRotationFromEuler(0, 0, Math.atan2(-b, a) * 180 / Math.PI); node.setScale(sx, sy, 1);
      } else {
        let label = layer.labels[layer.used];
        if (!label) {
          const node = new Node(`Text${layer.used}`); node.layer = Layers.Enum.UI_2D; node.parent = layer.text; node.addComponent(UITransform);
          label = node.addComponent(Label); label.useSystemFont = true; label.fontFamily = 'sans-serif'; label.overflow = Label.Overflow.CLAMP;
          label.verticalAlign = VerticalTextAlignment.CENTER; label.enableWrapText = false; layer.labels.push(label);
        }
        layer.used++; label.node.active = true;
        if (label.string !== command.text) label.string = command.text;
        label.fontSize = command.size; label.lineHeight = command.size * 1.3; label.color = this.color(command.color);
        label.horizontalAlign = command.align === 'left' ? HorizontalTextAlignment.LEFT : command.align === 'right' ? HorizontalTextAlignment.RIGHT : HorizontalTextAlignment.CENTER;
        label.node.getComponent(UITransform)!.setContentSize(command.width, command.size * 1.3 + 4);
        label.node.setPosition(command.x + command.width / 2 - 375, y(command.y + command.size * 0.65), 0);
      }
    }
    for (const layer of this.renderLayers) {
      for (let i = layer.k; i < layer.list.length; i++) { const it = layer.list[i]; if (it.g) it.g.clear(); it.node.active = false; }
      for (let i = layer.used; i < layer.labels.length; i++) layer.labels[i].node.active = false;
    }
  }
  /** 第 k 个位置要一个 Graphics：接着上一个线 / 多边形就共用，否则在这个位置放一个 */
  private graphicsAt(layer: RenderLayer): Graphics {
    if (layer.open) return layer.list[layer.k - 1].g!;
    let it = layer.list[layer.k];
    if (!it || !it.g) {
      const node = new Node('Shapes'); node.layer = Layers.Enum.UI_2D; node.addComponent(UITransform);
      it = { node, g: node.addComponent(Graphics), s: null };
      node.parent = layer.items; node.setSiblingIndex(layer.k); layer.list.splice(layer.k, 0, it);
    }
    it.g!.clear(); it.node.active = true; layer.k++; layer.open = true;
    return it.g!;
  }
  private spriteAt(layer: RenderLayer): Sprite {
    layer.open = false;
    let it = layer.list[layer.k];
    if (!it || !it.s) {
      const node = new Node('Sprite'); node.layer = Layers.Enum.UI_2D;
      node.addComponent(UITransform).setAnchorPoint(0, 1);
      const s = node.addComponent(Sprite); s.sizeMode = Sprite.SizeMode.CUSTOM; s.trim = false; s.type = Sprite.Type.SIMPLE;
      it = { node, g: null, s };
      node.parent = layer.items; node.setSiblingIndex(layer.k); layer.list.splice(layer.k, 0, it);
    }
    it.node.active = true; layer.k++;
    return it.s!;
  }
  private alphaColor(alpha: number): Color { return this.color(`#ffffff${Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, '0')}`); }

  // ---------- 美术（ArtGen）：手机上调出图代码画进图集，图集画布直接做贴图 ----------
  private makeCanvas(w: number, h: number): CanvasLike {
    const wx = (globalThis as unknown as { wx?: { createCanvas?: () => CanvasLike } }).wx;
    const c: CanvasLike = typeof document !== 'undefined' && document.createElement ? document.createElement('canvas') : wx!.createCanvas!();
    c.width = w; c.height = h; return c;
  }
  private textureOf(canvas: CanvasLike): Texture2D {
    const tex = new Texture2D(); tex.image = new ImageAsset(canvas as unknown as HTMLCanvasElement); return tex;
  }
  private whiteFrame(): SpriteFrame | null {
    try {
      const c = this.makeCanvas(4, 4), g = c.getContext('2d'); if (!g) return null;
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, 4, 4);
      const sf = new SpriteFrame(); sf.reset({ texture: this.textureOf(c), rect: new Rect(1, 1, 2, 2), originalSize: new Size(2, 2), offset: new Vec2(0, 0), isRotate: false });
      return sf;
    } catch (e) { console.error('白块贴图建不出来，色块画不了', e); return null; }
  }
  private frameOf(name: string): SpriteFrame | null {
    const hit = this.frames.get(name); if (hit) return hit;
    const book = this.book, r = book?.get(name); if (!book || !r) return null;
    const tex = this.textures[r.page] ?? (this.textures[r.page] = this.textureOf(book.pages[r.page]));
    // 白块取中间，避免采样到边上的透明像素
    const rect = name === 'white' ? new Rect(r.x + 1, r.y + 1, Math.max(1, r.w - 2), Math.max(1, r.h - 2)) : new Rect(r.x, r.y, r.w, r.h);
    const sf = new SpriteFrame(); sf.reset({ texture: tex, rect, originalSize: new Size(rect.width, rect.height), offset: new Vec2(0, 0), isRotate: false });
    this.frames.set(name, sf); return sf;
  }
  private startArt(app: GameController, gameView: GameView): void {
    const scale = artScale(screen.windowSize.width);
    runSliced(generate(ARTCODE, { scale, makeCanvas: (w, h) => this.makeCanvas(w, h), grain: THEME.artGrain }), THEME.artSliceMs)
      .then(book => {
        if (!this.isValid) return;
        this.book = book;
        const art = gameView.art = new ArtView(book, app.data);
        app.muzzleOf = unit => art.muzzle(unit, app.battle.time);
        console.log(`ArtGen：${book.regions.size} 张，${book.pages.length} 页图集，出图 ${book.ms} 毫秒，倍数 ${book.scale}，美术代码 ${book.version}`);
      })
      .catch(error => console.error('ArtGen 出图失败，继续用色块', error));
  }
  private paintLoading(message: string): void {
    this.paint([{ kind: 'rect', x: 0, y: 0, w: 750, h: this.designHeight, color: '#172333', layer: 0 }, ...message.split('\n').map((text, i): DrawCommand => ({ kind: 'text', text, x: 60, y: this.designHeight / 2 - 50 + i * 54, width: 630, size: 30, color: '#fff9ee', align: 'center', layer: 1 }))]);
  }
  private exportCsv(csv: string): void {
    if (typeof document !== 'undefined' && typeof URL !== 'undefined') {
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); const link = document.createElement('a');
      link.href = url; link.download = 'zhentou-waves.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); return;
    }
    const wx = (globalThis as unknown as { wx?: MiniGameAPI }).wx;
    const fs = wx?.getFileSystemManager?.(), root = wx?.env?.USER_DATA_PATH;
    if (fs && root) {
      try { fs.writeFileSync(`${root}/zhentou-waves.csv`, csv, 'utf8'); this.app?.notify('CSV已写入小游戏用户目录，可在开发工具提取', 4); }
      catch { this.app?.notify('CSV写入失败，请查看开发控制台', 4); console.log(csv); }
    } else { console.log(csv); this.app?.notify('CSV已输出至开发控制台', 4); }
  }
  onDestroy(): void {
    this.app?.suspend();
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this); input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this); input.off(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this); input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this); input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    game.off(Game.EVENT_HIDE, this.onHide, this); game.off(Game.EVENT_SHOW, this.onShow, this);
  }
}
