# 枕头堡 P1 走位优化候选工程

本工程使用 **Cocos Creator 3.8.8 + TypeScript**，已把固定站位改为自由守点、最多六只玩偶、距离光环和真实弹道命中。画面继续使用纯色几何块与系统文字，**未接入正式美术，未完成 Cocos / 微信 / 手机验收**。

本次只准备源码交接，不推送、不发布。变更摘要与风险见 [交接说明](docs/HANDOFF.md)，当前验证见 [VALIDATION](docs/VALIDATION.md)。

## 快速检查与玩法预览

锁文件中的Vite 7要求 Node `^20.19.0 || >=22.12.0`，建议 Node 24；本轮使用24.22.1。首次运行：

```sh
npm ci
npm run check
npm run build:preview
npm run preview
```

打开 `http://127.0.0.1:7456`；Mac 可双击 `预览色块.command`。面板卡片拖进窝上场，战场上的玩偶可拖动守点，拖出窝下场；设施同样操作。点选可见守点、活动范围、射程与光环，长按查看真实命中分解。该 Canvas 预览不等于 Cocos 或微信构建。

`npm run typecheck` 只检查共享逻辑、控制器、绘制与 Canvas 代码。编辑器生成真实类型后再执行 `npm run typecheck:cocos`，没有伪造的 `cc` 类型。

## 用户本地导入

**已有工程先备份源码、场景/.meta 和旧存档，不要整体覆盖现有工程。** 本轮保留存储键 `zhentou.save.v1`，内容会自动迁移为 version 2；加载后即保存新格式，没有自动生成旧档备份。回退旧版本需恢复备份。

首次导入 Cocos 3.8.8：

1. Dashboard 添加本工程；若无法识别，先建 Empty (2D) 项目，再合入本工程源码与配置，保留编辑器生成的项目设置、`temp/`、`library/`。
2. 新建并保存 `assets/scenes/Main.scene`，创建 UI → Canvas，保留 2D Camera；已有正确场景则直接复用。
3. Canvas 的 UITransform 为 750×1334、锚点 0.5/0.5。只挂 `Boot.ts`，不要再同时挂 `PillowFort.ts`。
4. 设计分辨率 750×1334，适配宽度，不适配高度；Main 为初始场景。保留 UI、2D、Graphics、Tween、Audio，关闭不用的 3D/物理等模块。
5. 等待导入完成，运行 `npm run typecheck:cocos`，再按 [本地验证](docs/LOCAL-VALIDATION.md) 检查 750×1334 与 750×1624、拖放取消、旧档迁移和前后台。

没有手写未经引擎验证的 `.scene` 或 `.meta`。本地平台构建及候选 CLI 配置见 [BUILD](docs/BUILD.md)。

## 当前资料与历史资料

- `assets/scripts/core/`：无引擎依赖的规则、走位、弹道、养成和存档迁移。
- `assets/scripts/ui/`：共享控制器、绘制命令及 Canvas/Cocos 适配器。
- `assets/resources/data/`：新版原始 JSON；与 `docs/spec/` 逐字节一致。
- `docs/spec/`：走位改造包原始快照；`docs/spec-v1/`：固定站位版历史快照。`check:spec` 校验 28 份文件。
- `tests/`：当前 156 项自动测试；`tools/qa/walk/`：41 组独立复核脚本。
- `docs/verification/p1-walk/`：本轮最终日志、CSV 和独立复核结果。
- `docs/screenshots/p1-walk/`：真实 GameView 命令的离屏预览，**不是浏览器或设备截图**。

规格包中要求复制正式美术、接入 ArtGen/Rig 的段落保留原文，但不属于本轮“纯色块”实施范围。不要据此把旧美术复制进工程。

## 追加验证命令

```sh
node tools/check-walk-review.mjs
npm run simulate:20m
npm run smoke:progression
npm run test:packaging
```

20 分钟仿真是逻辑时间；三梦烟测采用合法养成与模拟离线；打包工具测试使用临时合成文件。三者都不证明真机性能、玩家通关时长或正式平台包通过。具体规则取舍见 [CORE-ASSUMPTIONS](docs/CORE-ASSUMPTIONS.md)。
