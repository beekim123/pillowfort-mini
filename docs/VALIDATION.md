# 走位版最终验证记录

日期2026-11-06。环境：云端Linux、Node24.22.1、TypeScript5.8.3、Vitest3.2.4。源码基线为 `46240ae919360c36052476aad98a4dfd6048ca42`；本轮为未提交候选，没有推送或平台发布。

## 最终检查

| 命令/检查 | 结果 | 当前证据 |
|---|---|---|
| `npm run check` | 156/156，8文件；共享严格类型、28份规格散列、19份源码边界通过 | `verification/p1-walk/check-all.log` |
| `node tools/check-walk-review.mjs` | 独立41/41，数据9/战斗14/极端4/UI10/搬位4 | `verification/p1-walk/review-summary.json`及各组JSON |
| `npm run build:preview` | 共享Canvas代码编译通过 | `verification/p1-walk/preview-build.log` |
| `npm run simulate:20m` | 1200秒逻辑时间，71完整波，65胜6负；最高z0w36，当前w37 | `verification/p1-walk/logic-simulation-20m.json`与CSV |
| `npm run smoke:progression` | 287波，三首领均胜，最终z2w49；累计模拟离线256小时 | `verification/p1-walk/progression-smoke.log` |
| `npm run test:packaging` | 合成夹具打包/过滤/散列/篡改拒绝通过，夹具清理 | `verification/p1-walk/packaging-tools.log` |
| GameView离屏渲染 | 4组PNG/SVG/绘制命令已生成并视觉核对 | `screenshots/p1-walk/` |
| 完整候选差异检查 | 源码/交接文档通过；原始 `.diff` 快照的空白上下文行按原件保留 | `verification/p1-walk/diff-check.log` |
| 资源/凭据范围审查 | assets无正式美术/二进制；无新增运行依赖；常见密钥模式未命中 | `verification/p1-walk/scope-check.json` |

156项分布：core47、movement-core32、economy-v2 25、independent-regression10、ui-interaction21、ui-walk14、interface-regression6、platform1。UI三套合计41项，与独立41组不是同一计数。

本轮修复了复查发现的0伤手电污染指标、关门Boss冲锋优先、避让朝向、下场后在途弹道伤害、step改写原Save、拖动取消/立即关闭持久化、多指过滤、发射点随转身跳动、搬家被旧目标打断、绵绵遮挡点击。相关自动回归保留在源码与独立脚本中。

## 统计解释

20分钟仿真只升级默认上场玩偶，不作弊、不挑战Boss；真实波间gap显式计入carry。三梦烟测使用合法资金/箱子/升级/设施和v2默认守点，按固定策略触发模拟8小时离线；没有直接发货币、改等级或解锁。两者不是设备实测、自然玩家时长或长期数值平衡结论。

首次受击墙距秒数仅在实际伤害>0时采样，使用基础速度分母，见 `CORE-ASSUMPTIONS.md`。独立复核脚本已改为仓库内相对路径，运行器先编译同一共享代码，可独立复现。

## 明确未执行

- `typecheck:cocos`：缺真实 `temp/tsconfig.cocos.json`，前置exit2，**类型检查未执行**。
- `build:h5` / `build:wechat`：缺Cocos可执行文件，前置exit2，**引擎构建未执行**。对应日志在 `verification/p1-walk/*-unavailable.log`。
- 实际浏览器截图、微信工具/手机、FPS/内存、触屏/安全区及平台验收未执行；云端浏览器启动受系统socket限制。
- 正式美术/ArtGen/Rig与公共发布链未验收；外部大数字完整表/calc未提供。

`verification/p1-walk/source-sha256.json` 固定本轮执行所依据的源码、测试、工具和规格文件。旧根目录的107项/88波/232波等记录属于固定站位版历史，不用于本次结论。后续改动任何行为代码都要重新执行受影响检查。
