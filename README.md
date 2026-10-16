# DEEP BLUE · 一步棋背后的机器

当前阶段：**P0 资料与分镜**。本项目使用 `three-product-studio` 工作流，继承 JavaScript / Three.js / esbuild 的后续技术方向。P0 审阅站使用原生 HTML、CSS、JavaScript 和原创 SVG，无需安装依赖。

## 查看

```powershell
cd C:\Codex\city\deep-blue-studio
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
