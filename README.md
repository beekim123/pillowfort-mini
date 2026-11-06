# 枕头堡 P1 · 纯色块玩法候选工程

本交付使用 **Cocos Creator 3.8.8 + TypeScript**，以新版 P1 文档和 `levels.json` 的月牙窝坐标为准。画面仅使用纯色几何块与系统文字。**这是待本地引擎验收的源码工程，不是已通过微信真机验收的正式包。**

## 快速开始

需要 Node.js 18+（开发者推荐 Node 22 或 24）和 Cocos Creator 3.8.8。首次安装开发依赖：

```sh
npm ci
npm test
npm run typecheck
npm run check:spec
```

`npm run typecheck` 校验引擎无关的 core 和共享 UI 代码；**不包含 Cocos 适配器**。只有编辑器导入后运行 `npm run typecheck:cocos` 才会使用真实 Cocos 类型检查整个工程。没有引擎生成的类型时会明确失败，不提供会掩盖问题的 `cc` 假类型。

## 一次性手工步骤（Cocos 编辑器）

1. Dashboard → 添加已有项目，选本工程目录，版本选 **3.8.8**。若 Dashboard 不接受尚未生成本地设置的工程，先建 Empty (2D) 工程，然后把本工程的 `assets/`、`docs/`、`tools/`、配置文件拷入，不覆盖编辑器生成的 `temp/`、`library/`。
2. 新建 `assets/scenes/Main.scene`，创建 UI → Canvas。保留编辑器自动创建的 2D Camera。
3. Canvas 的 UITransform 设为 750 × 1334，锚点 0.5 / 0.5。将 `assets/scripts/Boot.ts` 拖到 Canvas，**只挂 Boot，不再挂 PillowFort**。保存场景。
4. 项目设置：设计分辨率 750 × 1334，适配宽度，不适配高度。关闭不使用的 3D、物理、3D 粒子、地形、视频、WebView、Spine、DragonBones、TiledMap；保留 UI、2D、Graphics、Tween、Audio。将 Main 设为初始场景。
5. 点击编辑器预览。应出现纯色块月牙枕头窝。运行 `npm run typecheck:cocos`。按 `docs/QA.md` 验证 750×1334 与 750×1624。

未手写伪造 `.scene`：场景序列化和脚本 UUID 由真实编辑器生成，避免提供未经导入验证的内容。后续全部 UI 由代码创建，无 prefab 手工拼装。

## 不依赖 Cocos 的玩法预览

```sh
npm run build:preview
npm run preview
```

浏览器打开 `http://127.0.0.1:7456`。Mac 可双击 `预览色块.command`。它使用与 Cocos 相同的逻辑 / 视图命令，通过 Canvas 2D 展示，方便先验玩法；**它不等于 Cocos、TapTap H5 或微信构建通过**。如需精确验收 750×1624，可用浏览器设备模式切换尺寸。

## 构建与发布候选

见 `docs/BUILD.md`。主要命令：

```sh
npm run build:h5
npm run build:wechat
npm run build:all
npm run preview:h5
```

构建脚本要求 `COCOS_CREATOR`，微信构建另需 `WECHAT_APPID`，还会检查 Main.scene 与其 `.meta`。这些本机配置未填时直接停止，不生成假运行包。`package:*` 仅整理已经存在的 Cocos 编译产物，不声称按当前源码重编译。

## 目录

- `assets/scripts/core/`：无引擎依赖的规则、战斗、养成、存档。
- `assets/scripts/ui/`：共享控制器、绘制命令、Canvas 与 Cocos 两种薄适配器。
- `assets/scripts/Boot.ts`：Cocos 入口。
- `assets/resources/data/`：原始只读数值和资源清单。
- `docs/spec/`：用户提供的规格快照，原文未改；`check:spec` 校验 SHA256。
- `tests/`：纯逻辑测试；`docs/QA.md`：独立本地验收步骤。
- `docs/verification/`：实际命令结果和离线逻辑仿真记录；不是设备性能证据。

## 重要边界

- 本轮只做纯色块。未引入美术图、ArtGen、外部字体、音效、联网、分享、广告或排行榜。
- 没有操作用户电脑，没有发布或上传游戏平台。Git源码交接状态见 `docs/HANDOFF.md`。
- 云端缺少 Cocos 3.8.8、微信开发者工具和手机，相关阶段标记为“未执行”，不能用 Node 单测替代。
- 完整的原始数值格式参考和公共 build-kit 不在输入包内。已提供独立候选工具和可运行范围内的验证，差异见 `NOTES.md`。

## 验证记录

本轮云端已运行的检查见 `docs/VALIDATION.md`；逐项需求状态见 `docs/ACCEPTANCE.md`，待确认规则见 `docs/CORE-ASSUMPTIONS.md`。`npm run simulate:20m` 输出20分钟**逻辑时间**CSV；`npm run smoke:progression` 通过合法升级/纸箱和模拟离线推进验证三梦可达；两者都不是设备实测或玩家通关时长。`npm run test:packaging` 使用临时合成文件测试工具，不会生成可发布的游戏包。
