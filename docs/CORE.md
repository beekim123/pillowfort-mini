# 枕头堡 P1 走位核心接口

核心不依赖 Cocos、DOM、Node API 或美术。时间单位为秒，玩法坐标固定750×1334。数据使用走位包v2，旧固定格子/五通道接口已移除。

## 数据与存档

- `DATA` 是过滤P1并建立倍率表的默认数据；`loadData(json, rulesOverrides?)` 不修改原始JSON。
- `newSave(data, now)` 返回version2：阵容和设施为 `{id, home:[x,y]}[]`。初始方方、呼呼、嘎嘎依次使用前三个 `nest.homes`，小夜灯使用第一个 `deviceHomes`。
- `parseSave(data,text,now)` 校验输入；v1非空ID按旧数组顺序去重、过滤未知/未拥有ID，前六只按默认守点迁移，超额仍保留在 `toys` 中。v2合法守点保留，坏坐标修复/夹入地面。
- `serializeSave` 只生成JSON；调用者负责存储异常和备份。UI沿用 `zhentou.save.v1` 键，写入内容是v2。
- `place(data,save,id,home|null)` 和 `placeDevice(...)` 添加、移动或移除；返回新Save或null，拒绝操作不改原档。移动已上场玩偶不受当前满员限制。
- `slotsOf(data,fort)` 返回 `{toy,device,room}`。toy最多6，`room=max(1,原名额/6)` 进入全队伤害倍率；默认守点数组更长不代表可上8只。
- `clampHome` / `isOnGround` / `distance` 提供纯坐标几何；设备使用同一守点约束。

## 战斗调用顺序

1. `startWave(data,save,{attempt,boss?,carry?,elapsedBetweenWaves?})` 创建Battle。种子由区/波/attempt确定。
2. `step(battle,dt,{flash?:{aim},homes?:Record<string,Point>})` 以1/30秒固定步推进；不足一tick的homes保留到下一tick。返回该调用的事件。
3. homes只更新 `battle.save`，不修改调用者原Save。调用层须把已应用守点复制回主Save，再收奖励与同步；`GameController` 已这样处理。
4. `collectBattleRewards(data,save,battle)` 收取未入账击杀羊和统计，再 `syncBattle(battle,newSave)`。仍上场玩偶保留位置和冷却，不因每帧同步而回到home。
5. `result` 未结束为null，结束返回结果；`onWaveEnd` 补差、首通、推进/回退、解锁与农场。
6. 实际波间休息传 `elapsedBetweenWaves:data.wave.gapAfter`；立即挑战/撤退传0。默认0，不能通过切换免费充能。

`syncBattle` 处理上/下场、升级、设施和开关；移除挡者释放认领，不直接制造漏怪。未放出的出手会随发射者下场取消，已放出弹道保留攻击快照直至命中或散去。

## 走位与表现接口

- `wallPoint(data,x,y,inset?)` 求圆心射线与墙交点；敌人无lane，朝圆心移动。
- 每只玩偶分别有home、当前pos、速度、目标、状态、朝向。搬动守点后，能走的玩偶按速度到新家；不动辅助即时改变位置。搬位途中可暂时位于新home的leash外，不瞬移补偿。
- `actors(battle)` 返回 `toys/nightmares/shots` 视图；优先由此读位置、目标、朝向与真实弹道。绘制不得自行再扣血。
- 攻击流程为 `attack/skill` → windup → `shot` → `hit/dot/impact`。straight/lob到达后结算；beam/chain/melee释放同tick结算。伤害数字依据hit/dot，不在attack时制造伤害。
- 事件还包括claim、block、knockdown、recover、squeeze、leak、startle、dashStart、dashHit、dashReturn、dashEnd、clone、support、flash、bossTrick、waveEnd等，均带战斗时间。
- `hit.damage` 是显示伤害；`hit.actual` 是去除过量伤害的实扣量。`lastDamageBreakdown` 为最近命中快照，未命中过时标为当前预估。
- `battleCsv` 含原字段和 `firstHitWallSeconds`：本波每个敌人首次实际伤害>0时，剩余径向墙距÷基础移动速度，再求均值；不计0伤害，零速度记0，不因冻结得到Infinity。

## 确定性边界

相同初始档、seed、逐tick homes/flash及同序经济/上下场操作可复现。`battle.inputLog` 和UI `homeInputs` 记录守点输入，但不是全部会话命令的持久录像。切后台存档不保存整场Battle，重新启动会重开当前波；不承诺跨进程接回每一颗弹道。

## 验证

`npm run check` 覆盖当前全部测试、共享类型与源码/规格门禁；`node tools/check-walk-review.mjs` 重跑41组定向独立复核。`npm run smoke:progression` 用合法升级/纸箱/设施、默认守点和模拟离线验证三梦可达，最新结果见 `VALIDATION.md`。不得以这些结果推导真机性能或玩家通关时长。
