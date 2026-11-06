# 本轮走位版最终证据

日期2026-11-06，Node24.22.1。仅共享代码、合成工具与离屏渲染证据，不是Cocos或手机验收。

- `check-all.log`：156项与共享类型/28份规格/19份源码门禁。
- `review-summary.json`、`review-*.json`、`independent-review.log`：仓库内 `node tools/check-walk-review.mjs` 可复验的41组。
- `preview-build.log`、`render-preview.log`：预览编译及真实绘图命令离屏生成。
- `logic-simulation-20m.csv/json`、`simulation.log`：1200秒逻辑仿真，含首次实伤距墙秒均值。
- `progression-smoke.log`：合法经济与模拟离线的三梦闭环。
- `packaging-tools.log`：临时合成夹具打包、过滤、SHA及篡改拒绝；不是游戏包。
- `*-unavailable.log`：真实Cocos类型/构建前置exit2，未执行实际阶段。
- `scope-check.json`、`diff-check.log`：交付范围与空白差异检查。
- `source-sha256.json`：代码/测试/工具/规格文件SHA256，便于确认日志对应内容。

旧根目录证据不覆盖本轮。关于统计和未测项，见 `../../VALIDATION.md`。
