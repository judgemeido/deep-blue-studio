# DEEP BLUE · 一步棋背后的机器

GitHub 私有仓库：[judgemeido/deep-blue-studio](https://github.com/judgemeido/deep-blue-studio)。当前代码已包含 **P1–P4 与 P5 增量成果**：三维硬件拆解、五步算法教学、Minimax / Alpha-Beta 对比和芯片分工探索。P0 资料站作为历史审阅内容保留；版本号 `0.0.0-p4` 不代表后续增量缺失，也不表示 P5 全量验收完成。

## 启动当前交互展馆

需要 Node.js 22 或更新版本：

```powershell
cd D:\Codex\city\deep-blue-studio
npm.cmd ci
npm.cmd run build
npm.cmd run dev
```

交互展馆：`http://127.0.0.1:4175/prototype/`。历史 P0 资料站：`http://127.0.0.1:4175/`。先构建，再运行测试：`npm.cmd test`、`npm.cmd run validate`。

上传前重新验证：35/35 测试通过，build 与 validate 通过。源码、锁定依赖、史料说明和各阶段验收证据均保留；本地依赖、构建产物和临时工作目录不入库。GitHub 存放源代码，网站未部署。

## P0 历史资料与分镜

以下保留 P0 及后续各阶段的历史说明。本项目使用 `three-product-studio` 工作流，技术栈为 JavaScript / Three.js / esbuild。P0 审阅站使用原生 HTML、CSS、JavaScript 和原创 SVG，可独立查阅。

## 查看

```powershell
cd D:\Codex\city\deep-blue-studio
npm.cmd run build
npm.cmd run dev
```

浏览器打开 `http://127.0.0.1:4175/`。服务器仅监听本机，审阅入口与现有 Bombe 项目使用不同端口。

站点包含四页：

1. **首屏线框**：五步教学、三层切换、上一步、复位、解释与事实依据弹层。
2. **三层分镜**：六镜头构图；每镜头记录动作、镜头、问题及 P1 检查条件。
3. **史料参考**：两张在线馆藏照片、原创比例图、逐项史实与来源索引，可按可信度筛选。
4. **范围与审阅**：P0/P1/后续边界、五个审阅决定、本机保存意见、导出 JSON。

## 交付物

| 文件 | 用途 |
| --- | --- |
| `docs/PROJECT_PLAN.md` | 开始 P0 时保存的方案基线 |
| `docs/P0_REVIEW_GUIDE.md` | 审阅路线、设计决定、未决项与范围 |
| `docs/FACTS_AND_REFERENCES.md` | 史料、来源与建模口径，由数据生成 |
| `docs/STORYBOARD.md` | 六镜头分镜，由数据生成 |
| `docs/MODEL_CONTRACT.json` | 配置数量、展示单位、轴向与拆解依赖 |
| `docs/P0_ACCEPTANCE.md` | 本阶段验收清单、实际结果与边界 |
| `review/data.json` | 来源、展签、五步引导、分镜与审阅项的唯一数据源 |
| `review/assets/*.svg` | 8 张原创构图示意 |
| `scripts/build-review.mjs` | 重建示意与同步文档 |
| `scripts/validate.mjs` | 配置、引用、依赖顺序、资产与链接的静态检查 |

审阅页面的照片直接引用 CHM 在线来源，保留出处和原页入口；断网时显示来源替代提示。照片未复制到仓库。原创线框可离线浏览，运行本机服务器以读取 JSON 数据。

方案基线保存在仓库内，构建不会覆盖，也不依赖上级目录中的文件。

P0 的图形是静态线框，按钮用于验证讲解顺序。三维拆解属于 P1，真正的小树算法对比属于 P3；本阶段不输出性能测速或历史搜索日志。

## 检查与版本

```powershell
npm.cmd run validate
```

每阶段单独提交；下一阶段以用户审阅为检查点。P0 的初始意见全部为“待审阅”，浏览器意见保存在本机，不代表自动通过阶段。

本轮检查通过五步导航、参考筛选、数字依据弹层、意见刷新恢复和桌面/手机布局。JSON 导出测试受到浏览器下载审批拒绝，实际下载文件尚未验收；详见 `docs/P0_ACCEPTANCE.md`。

## P1 · 可操作三维结构原型（2026-10-17）

新增入口：**http://127.0.0.1:4175/prototype/**。P0 根入口和四页资料保留，页头可进入 P1。

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd test
npm.cmd run validate
npm.cmd run dev
```

Three.js 0.180.0 / esbuild 0.28.2 已锁定；构建产物位于 `review/prototype/`（不入库），无需外部 CDN。首次运行必须先 build；测试包含 HTTP 构建产物检查，也需先 build。

P1 支持整机、节点、板卡、芯片四层导航，开门、节点抽出、盖板让位、板卡抽出后转向，以及独立芯片功能示意；支持前后切换、中途反向、整机复位、四种视角与拖动缩放。姿态从绝对进度求值，减少动态效果直接到达同一终态。

注意：这是低精度教学重建，不是历史实测或维修演示。每柜 15 节点、器件布局和机械结构均为示意；选中节点垂直比例压缩以留出教学槽位间距。未实现搜索算法、精细材质和真实芯片版图。完整待验收项见 `docs/P1_ACCEPTANCE.md`；不将自动碰撞采样等同于全路径视觉认证。

## P2 · 工业档案馆视觉审阅版

同一入口 `http://127.0.0.1:4175/prototype/` 已精化为 P2：真实开孔网格门、倒角喷涂金属、环境反射和落地阴影，新增原创棋桌、开局棋盘与无品牌 CRT。进入拆解后隐藏道具，保留 P1 四层导航。新增纯代码纹理，无外部图片/CDN。运行方式不变，先 build 再 test/dev。

本轮 14 项自动测试；详细范围、历史重建边界及未验收项见 `docs/P2_ACCEPTANCE.md`。尚未进入 P3。

## P3 · 可执行五步教学

在同一原型入口点击“开始五步教学”：可逐步运行小型博弈树，比较 Minimax 与 Alpha-Beta，切换着法顺序，观察 1/4/8 虚拟工作者的任务分配，最后进入现有三维硬件层。支持单步、播放/暂停、重来和返回自由观察。统计来自实际算法日志，教学数据与历史配置分开显示；不声称完整象棋引擎或真实测速。

本轮总计 28 项 Node 测试；运行方式不变，先 build 再 test。范围、证据与待办见 `docs/P3_ACCEPTANCE.md`。未进入 P4。

## P4 · 微观分工

自由观察进入芯片层后，可点选四个模型色块或对应按钮，查看输入、处理、输出、抽象示例和 S1/S2 出处。选区模型高亮；手机点模型后切到说明。两卡各 8 芯片不变，新增少量教学性板卡器件和走线。页面继续单屏。总计 30 项测试；完整范围和待办见 `docs/P4_ACCEPTANCE.md`。未进入 P5。

### P5 增量验收
回放高级说明展开态修复、31 项回归及浏览器验收范围见 [P5_ACCEPTANCE](docs/P5_ACCEPTANCE.md)。当前仍有明确待验收项，未标为全量最终通过。
