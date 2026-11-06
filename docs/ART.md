# 美术接入（ArtGen）

> 2026-11-06 设计接入（`art` 分支），接在 GPT 的走位版（`fb9baa7`）上。规格见 `docs/spec/美术技术方案.md`、`docs/spec/美术文档.md` 2.1、开发文档 7.2 / 7.4。

## 一条路

```
art-code/（美术交的出图代码，原样，不改）
  └─ npm run bundle:art → assets/scripts/art/artcode.gen.ts（一个脚本，key → 模块；文件头有美术代码版本号）
       └─ ArtGen.generate（游戏加载时，在手机上调出图代码画进 2048 的图集，分帧，每帧 ≤ 8 ms）→ ArtBook
            └─ ArtView（GameView 画每样东西前问一句：有图出 sprite 命令，没图照旧色块）
                 ├─ CanvasPreview：drawImage
                 └─ PillowFort（Cocos）：图集画布 → Texture2D → SpriteFrame，Sprite 节点池；色块也走图集里的白块（能合批）
```

| 文件 | 干什么 | 依赖引擎 |
|---|---|---|
| `art-code/` | 美术交的原件（不进 Cocos 的 assets，免得被当脚本导入；`preview.html`、截图不放） | — |
| `tools/bundle-art.mjs` | ES module → 一个 `artcode.gen.ts`（做法同画风库） | — |
| `assets/scripts/art/ArtTypes.ts` | 美术模块接口（L1 朝向 / muzzle / release、L2、L3 弹道、bg） | 否 |
| `assets/scripts/art/ArtGen.ts` | 出图、拼图集、分帧；图名 `<key>/<朝向>/<部件>#<沸腾>`、`<key>/<变体>/<动作>/<帧>`、`<key>/<笔刷>/<帧>`、`<key>`、`white` | 否 |
| `assets/scripts/art/RigMath.ts` | 照 `art-code/rig-player.js` 改写：动作 → 每个部件的矩阵；朝向退回、发射点换算 | 否 |
| `assets/scripts/art/ArtFx.ts` | 精灵粒子（配方 `count / rate / life / speed / angle / scale / alpha / blend / gravity / spin`） | 否 |
| `assets/scripts/art/ArtView.ts` | 游戏状态 → 贴图：玩偶播哪个动作、噩梦哪一帧、弹道、拍散变羊、光环、打中 | 否 |

## 规则（表现层，core 不动）

- 玩偶：`toy_<id>`，高 `nest.dollSize`；朝向、翻转用 core 的 `face` / `flip`。这个朝向没画的动作（会走的玩偶正面没有 `attack`）转到侧面 / 背面去播；模块没画的朝向退回正面。
- 动作：`attack` / `strike` 从进这个状态起播（core 的 `windup` = 美术的 `release`，测试里对过）；挤倒 `knocked` → `down`，起来播一次 `getup`；`dash` 冲出去；走路 `walk`；其余 `idle`。部件沸腾每秒 7 次，相邻部件错开。
- 发射点：出手那一刻用美术的 `muzzle`（`GameController.muzzleOf`），没有图的玩偶照旧按朝向估。
- 弹道：`shot_<id>`；直线 `fly` 按方向转 + `trail`，抛物线边飞边转，柱子 `beam` 按两点平铺、两头 `cap`；弹道没了（打中）在终点放 `hit`。
- 噩梦 `nm_eyes`：走 / 被打 / 被挡和挤墙 `push`；精英 ×1.4；脚下放在色块底边，血条移到图的头顶。大噩梦（L0）第 4 批，现在是色块。
- 拍散：`burst` → 羊 `cotton` / `pop` / `run` → `jump` 过栅栏。
- 背景 `bg_dream_0` 底对齐；窝（`obj_fort`）第 3 批，现在用半透明的地和墙（`THEME.artGround` / `artWall`）。
- 颗粒强度 `THEME.artGrain`（画笔库 `setGrain`），现在 1（美术的默认）。

## 换新一批美术

1. 用户在画风库认可以后，把那一批的 `art-code/` 拷到仓库根目录 `art-code/`（去掉 `preview.html` 和截图）。
2. `npm run bundle:art`，`npm run check`（`tests/art.test.ts` 会对 `release` = `windup`、弹道种类、会走的玩偶三套朝向、图集不重叠）。
3. 浏览器预览 `npm run build:preview && npm run preview`（`?art=0` 只看色块对比），再出 H5 / 微信包。
4. 新的件要在 `ArtView` 里接的：新 key 的命名照 `toy_<id>` / `shot_<id>` 就自动接上；窝、糯糯、设施、大噩梦、界面件出来时在 `ArtView` 加对应的方法、在 `GameView` 加钩子。

## 还没做

- 出图缓存（H5 IndexedDB / 微信 `USER_DATA_PATH`）：现在每次启动现画，Mac 上 449 张 80–90 毫秒；手机实测以后再定要不要缓存。
- 粒子的 `tint`（随机乘色）和 Cocos 里的叠加发光（`blend: add`）：现在按普通混合画。
- 部件链里非等比缩放带来的斜切：Cocos 节点不带斜切，忽略（看不出来）。
- 真机：首次出图耗时、帧率、内存（开发文档 7.4 的表），要用户手机扫码测。
