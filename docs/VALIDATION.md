# 本轮验证记录

日期：2026-11-06。环境：云端 Linux、Node v24.22.1、TypeScript 5.8.3、Vitest 3.2.4。

## 已实际执行

| 检查 | 结果 | 证据 |
|---|---|---|
| `npm test` | 107/107 通过，5个测试文件 | `verification/tests.log` |
| `npm run check` | 测试、严格共享代码类型检查、规格散列、源码边界检查全部通过 | `verification/check-all.log` |
| 原件完整性 | 10份规格、两份运行JSON逐字节一致 | `verification/spec-check.log` |
| `npm run build:preview` | 引擎外Canvas代码编译通过 | `verification/preview-build.log` |
| `npm run simulate:20m` | 1200秒逻辑仿真，88个完整波，80胜8负，最高0区34波，当前35波 | `verification/logic-simulation-20m.csv`、同名JSON |
| `npm run smoke:progression` | 合法养成操作+模拟离线，可通过三个大噩梦并停在P1末区 | `verification/progression-smoke.log` |
| `npm run test:packaging` | 临时合成夹具打包、排私有文件、逐文件SHA、篡改拒绝均通过；夹具已清理 | `verification/packaging-tools.log` |

107个测试由68个核心用例、22个UI开发用例、10个独立核心回归、6个独立共享界面回归、1个平台空能力测试构成。测试总数不代表原始大数字5.5完整表已补齐，该表不在输入包中。

20分钟是逻辑时间，不是人持续试玩20分钟。三梦可达测试累计232个波次、模拟离线200小时；固定策略没有最优站位/每日小事，不能据此给出真实玩家时长或平衡结论。

## 未实际执行

- Cocos 3.8.8 导入与真实 `cc` 类型检查。`typecheck:cocos` 确认前置检查以exit=2停止，原因：引擎生成的类型不存在。日志 `verification/cocos-typecheck-unavailable.log`。
- Cocos H5 / 微信编译。两个 `build:*` 确认以exit=2停止，原因：没有Cocos可执行文件。日志 `verification/cocos-h5-unavailable.log`、`verification/cocos-wechat-unavailable.log`。**未生成正式运行ZIP，未测真实包大小。**
- 微信开发者工具、iPhone、Android、FPS、内存、平台审核。
- ArtGen / 正式美术：本轮按仅纯色块的范围不做。

Vitest日志可能提示 `temp/tsconfig.cocos.json` 不存在，这是缺少编辑器导入的已知提示。测试变换使用独立严格配置；没有添加假的 `cc` 声明去消掉引擎验证缺口。

后续编辑代码后要重新运行相关测试；引擎与真机步骤按 `QA.md` 继续。其他独立视觉回归证据若由集成阶段追加，应明确写出是DrawCommand离屏渲染、Canvas浏览器，还是Cocos运行，不能混用。

## 独立复核后修复

- 嘎嘎对窝边被挡怪推回60px，移除零向量假推回。
- 冲锋追踪移动目标，目标死亡重定向并实际接触后命中。
- 分身只在24px实体碰撞范围接新怪，不远程阻挡。
- 10010/10050/100100000及临界值截断回归，不使用epsilon进位。
- 立即挑战/撤退默认经过时间0，不能反复免费充能；真实波间显式传1秒。
- 长按展示最近真实直接命中的倍率快照，含临时增益、技能/暴击、目标易伤与壳；长内容分页。
- 辅助首次选中保持场地无遮挡并展示相邻连线；前后台清理touchId。

独立审查复验上述问题通过。另30项共享控制器/绘制检查和32帧离屏图无文本宽度/屏外异常，证据见 `verification/ui-qa/`。不是Cocos或真实浏览器输入证据。
