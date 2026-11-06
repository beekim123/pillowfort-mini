# 枕头堡 P1 纯 TypeScript 核心

本目录不依赖 Cocos、DOM、Node API 或美术资源。数据来自 2026-11-06 第二版开发包。主入口 `index.ts`。所有时间单位均为秒，现实时间请传 `Date.now()/1000`。

## 接口

- `DATA` 是已过滤 P1、已建倍率表的默认 GameData；`loadData(json, rulesOverrides?)` 可加载原表并局部覆盖显式规则参数。
- `newSave(data, now)` 初始三玩偶、O3/M2/M3、D1 小夜灯。
- `parseSave(data, text, now)` 校验 JSON、限制数值、消除重复/未开放站位和未解锁设施；无法读取的存档退回新档。
- `serializeSave(save)` 生成 JSON。调用层负责本地存储与异常提示；原存档应在替换前保留备份。
- 经济函数返回复制的 Save 或 null，原 Save 不变。字段名称与开发文档 §6、§9 对齐。
- `startWave(data, save, { attempt, boss?, carry?, elapsedBetweenWaves? })` 创建可变战斗。所有设计坐标固定 750×1334。attempt 从 1 计，按区/波分别保存。
- `step(battle, realDeltaSeconds, { flash?: { aim: radians } })` 采用累计器只跑固定 1/30 秒 tick，返回该次所有事件。不要为了追帧丢弃逻辑 dt。
- `collectBattleRewards(data, save, battle)` 每次 step 后调用，将即时击杀羊/统计记入 Save，重复调用无重复收益。
- `syncBattle(battle, save)` 用新 Save 更新升级/换阵/开关。保留仍上场玩偶的计时器，不重开波。换走的阻挡会释放。
- `result(battle)` 未结束为 null，结束为 WaveResult。`onWaveEnd(data, save, result)` 只补计尚未收取的即时奖励并负责首通、退回/推进、解锁、农场。
- 一秒间歇后，下一波传 `{carry: previousBattle, elapsedBetweenWaves: 1}`。立即挑战首领/撤退传0（缺省也是0），不会凭切换领取冷却。保留攻击/技能/冲锋、绵绵和手电计时。间歇期间也算冷却，活动中的短时光束和辅助效果按剩余时长转移。
- `advanceClocks(data, save, now)` 在线更新免费箱与六小时小事，返回新 Save；调用层维护 lastSeen。
- `settleOffline(data, save, now)` 一次结算至 now 并更新 lastSeen，返回领取展示用 MorningCard。奖励此时已计入，不要在点收下时再加。
- 阵容操作：`assignToy`、`swapSlots`、`assignDevice`；检查函数：`openSlots`、`slotsOf`、`availableDevices`、`systemOpen`。
- 真实命中分解：`lastDamageBreakdown(battle,id)` 返回最近命中的不可变倍率快照，或未命中过时的当前目标预估；`mode` 明确区分二者，`parts`乘积等于命中伤害（含壳、主动辅助、技能、暴击及目标易伤）。`battleDamageBreakdown`返回当前预估，并由真正的攻击共享使用。
- 数值：`toyAtk`、`teamMul`、`damageBreakdown`、`lvCost`、`fortCost`、`dailyCost`、`fmt`、`unitIndex`。
- `battleCsv(results)` 包含原始伤害、时长、avgDps、漏怪、阻挡秒数、挤倒次数、冲锋次数等。

## 表现数据

`Battle.enemies` 中 `dead` / `leaked` 的实体保留到波末供表现使用；活体使用 `aliveEnemies(b)`。每个实体的 `x,y,hp,maxHp,lane,boss,elite,shell,stink,burnUntil,slowUntil,freezeUntil,stunUntil,flashUntil,blockedBy,closed` 可直接绘制色块/文字。`Battle.units` 提供站位、耐力、挤倒、吓到、冲锋位置。`Battle.clones` 是分身。

事件 `type` 包括 spawn、attack、hit、dot、skill、chain、burn、slow、freeze、stink、shell、split、kill、leak、block、knockdown、recover、startle、dashStart、dashHit、dashEnd、clone、cloneEnd、support、captain、push、flashStart、flashEnd、bossTrick、waveEnd。详情字段在触发处与 types.ts 中可读；事件均含 battle time。

伤害在逻辑 tick 出手时扣血。表现层可以延后显示倒下，但不能重复结算。`hit.damage` 为显示伤害，`hit.actual` 是扣除过量伤害后的实扣量；DPS / 手电最近5秒依据实扣伤害。破单位里程碑由表现层比较 `unitIndex(hit.damage)` 与 Save.units，展示后保存。

## 测试

`tests/core.test.ts` 使用 Vitest。运行 `vitest run core/tests/core.test.ts`（整合到项目时路径可移动）。不依赖图形和物理引擎。仅 core 的严格 TS 检查示例：`tsc --strict --noEmit --target ES2022 --module ESNext --moduleResolution bundler --allowImportingTsExtensions core/index.ts`。

## 完整流程烟测

`npm run smoke:progression` 采用固定策略自动升级、使用合法羊/糖/箱子、按当前开放格位布阵与8小时离线结算，不直接改等级/发货币/解锁玩偶。一次跑完三个首领，完成时232个波次、累计模拟离线200小时。第0/1区首领在该策略下首次成功，第2区有多次失败后成功。该测试只证明养成闭环与最终P1边界可达；策略没有最优化站位/每日研究，离线触发时机人为固定，不能当成真实玩家通关时长或平衡验收。原始结果在 docs/verification/progression-smoke.log。
