# 本地构建

## 前提

完成 README 的一次性场景步骤。先运行 `npm run check`，再运行 `npm run typecheck:cocos`。正式包应使用非调试构建，逐项确认调试入口、帧率计数和日志已关闭。

Mac 设置示例（路径按自己的安装位置调整）：

```sh
export COCOS_CREATOR="/Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/MacOS/CocosCreator"
export WECHAT_APPID="自己的 AppID 或可用测试号"
```

不在源码中保存账号、令牌、密码。工程不会自动登录微信开发者工具，也不会替你上传平台。

## 正常构建

- `npm run build:h5`：调用 Creator web-mobile 编译，成功且存在 `build/web-mobile/index.html` 后打包。
- `npm run build:wechat`：调用 Creator wechatgame 编译，成功且存在 `build/wechatgame/game.js` 后打包。
- `npm run build:all`：顺序运行，出错即停。

此处 CLI 配置为 Cocos 3.8.8 候选配置，**尚未在真实引擎执行**。如编辑器升级后不识别 configPath 或目标输出目录，先在构建发布面板保存对应平台的配置，再以编辑器导出的 JSON 为准调整 `tools/build.mjs`。不要把缺产物当成成功。

微信构建后用开发者工具打开 `build/wechatgame`，检查竖屏、AppID、Canvas 安全区、启动场景、前后台存档与离线结算。然后用自己的 iPhone 和中低端 Android 扫码，完成 `QA.md`。

## 整理已有产物

- `npm run package:h5`：`build/taptap-h5/枕头堡-P1-H5-TapTap.zip`。
- `npm run package:wechat`：`build/wechat/枕头堡-P1-微信小游戏.zip`。
- 各目录附 `manifest.json` 与 `SHA256SUMS.txt`；微信记录主包和声明分包字节，不因大小删除或压缩内容。
- 已存在的同名 ZIP 移入 `build/history/<时间>/` 保留。
- 排除 `.meta`、source map、系统隐藏文件、微信 IDE 私有配置；H5 ZIP 顶层只有 `zhentou/`。
- `npm run check:h5` / `npm run check:packages` 检查散列、目录和逐文件完整性，不替代运行验收。

工具使用系统 `zip` / `unzip`，Mac 自带。Windows 请先使用相应系统工具或在编辑器输出后手工按同一结构打包。

`npm run preview:h5` / `预览H5.command` 先校验真实 ZIP，再解压临时目录并仅监听 `127.0.0.1:7457`，Ctrl+C 后清理。端口冲突会报错，不自动换端口。它不会把引擎外预览伪装成上传包。

## 未完成的公共发布链路

输入包没有 `design/tools/build-kit/` 或其他现有游戏工程，因此没有复用或修改它们，没有替公共 `sync-build.mjs` 添加配置。全关卡解锁独立发行 ZIP、交付目录自带试玩工具、平台公开包专用门禁还需与用户现有 build-kit 对接；当前工具只提供基础正常版候选链路，不宣称符合全部统一发布规范。
