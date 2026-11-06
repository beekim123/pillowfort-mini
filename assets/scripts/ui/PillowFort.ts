import {
  _decorator, Component, Node, Graphics, Label, Color, UITransform, view, ResolutionPolicy,
  resources, JsonAsset, sys, game, Game, input, Input, EventTouch, EventMouse,
  Layers, HorizontalTextAlignment, VerticalTextAlignment,
} from 'cc';
import { DEV } from 'cc/env';
import { GameController } from './GameController';
import { GameView } from './GameView';
import type { DrawCommand } from './Draw';

const { ccclass } = _decorator;
interface RenderLayer { root: Node; graphics: Graphics; labels: Label[]; used: number }
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

  onLoad(): void {
    view.setDesignResolutionSize(750, 1334, ResolutionPolicy.FIXED_WIDTH);
    this.node.layer = Layers.Enum.UI_2D;
    if (!this.node.getComponent(UITransform)) this.node.addComponent(UITransform);
    for (let index = 0; index < 5; index++) {
      const root = new Node(`DrawLayer${index}`); root.layer = Layers.Enum.UI_2D; root.parent = this.node;
      root.addComponent(UITransform);
      const graphicNode = new Node('Blocks'); graphicNode.layer = Layers.Enum.UI_2D; graphicNode.parent = root;
      graphicNode.addComponent(UITransform);
      const graphics = graphicNode.addComponent(Graphics);
      this.renderLayers.push({ root, graphics, labels: [], used: 0 });
    }
    this.resize();
    this.paintLoading('枕头堡\n正在铺好小被子……');
    resources.load('data/levels', JsonAsset, (error, asset) => {
      if (!this.isValid) return;
      if (error || !asset) { this.paintLoading('关卡数据没有读到\n请确认 resources/data/levels.json'); console.error(error); return; }
      try {
        this.app = new GameController(asset.json, sys.localStorage, DEV);
        this.gameView = new GameView(this.app);
        this.app.onExport = csv => this.exportCsv(csv);
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
    for (const layer of this.renderLayers) { layer.graphics.clear(); layer.used = 0; }
    const y = (v: number) => this.designHeight / 2 - v - this.safeTop;
    for (const command of commands) {
      const layer = this.renderLayers[command.layer], g = layer.graphics;
      if (command.kind === 'rect') { g.fillColor = this.color(command.color); g.rect(command.x - 375, y(command.y + command.h), command.w, command.h); g.fill(); }
      else if (command.kind === 'line') { g.strokeColor = this.color(command.color); g.lineWidth = command.width; g.moveTo(command.x - 375, y(command.y)); g.lineTo(command.x2 - 375, y(command.y2)); g.stroke(); }
      else if (command.kind === 'poly') { g.fillColor = this.color(command.color); command.points.forEach(([x, v], index) => index ? g.lineTo(x - 375, y(v)) : g.moveTo(x - 375, y(v))); g.close(); g.fill(); }
      else {
        let label = layer.labels[layer.used];
        if (!label) {
          const node = new Node(`Text${layer.used}`); node.layer = Layers.Enum.UI_2D; node.parent = layer.root; node.addComponent(UITransform);
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
    for (const layer of this.renderLayers) for (let i = layer.used; i < layer.labels.length; i++) layer.labels[i].node.active = false;
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
