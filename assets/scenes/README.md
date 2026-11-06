请使用 Cocos Creator 3.8.8 创建 Main.scene。不要把本目录的说明当成场景。

1. 场景编辑器：新建空场景，保存到 assets/scenes/Main.scene。
2. 创建 UI → Canvas（编辑器会生成合适的 2D Camera）。
3. Canvas 的 UITransform 设为 750 × 1334，锚点保持 0.5 / 0.5。
4. 将 assets/scripts/Boot.ts 挂到 Canvas。不要同时挂 PillowFort。
5. 将 Main.scene 设为启动场景并保存。预览应出现纯色块月牙窝。

未提供手写序列化场景，避免把未经 Cocos 导入检验的 JSON 当成可用场景。之后构建脚本会检查本场景及其 .meta。
