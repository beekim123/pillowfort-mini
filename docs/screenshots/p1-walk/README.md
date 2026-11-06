# 走位色块预览

本目录 `*-render.png` / `*-render.svg` 为 **实际 GameView 绘图命令的离屏渲染**，不是浏览器、Cocos 或手机截图；没有接入正式美术。

- `walk-1334-selection-render`：6只玩偶、选中叮当、守点、射程与光环，真实模拟中途的弹道和命中反馈。
- `walk-1624-selection-render`：同一个核心状态，仅增加290像素的表现层纵向偏移。
- `walk-1624-debug-render`：全员守点/活动范围/射程/光环、目标线、状态、朝向和DPS。
- `walk-toy-cards-render`：玩偶卡片与拖放提示。
- `.draw.json`：对应的实际绘图命令，便于追溯。

重现：`npm run build:preview && node tools/render-walk-preview.mjs` 产生 SVG / 绘图命令。可选 `python3 tools/rasterize-walk-captures.py` 产生PNG，需要QA环境已有Pillow与Noto Sans CJK字体，不属于游戏依赖。

浏览器截图未取得：当前云环境启动已安装Chromium时 `socket() failed: Operation not permitted`，批准的提权重试仍受同样系统限制。请在本地运行 `npm run preview`，按下述动作补录浏览器/引擎/真机证据：拖进→移动→拖出、取消与切后台、挡/挤倒/起身、冲出/跑回、挤墙/吓一跳、九只弹道及三种朝向。
