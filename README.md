# DEEP BLUE · 超级计算机历史档案

这是一个以档案阅读器和三维展品组成的交互展馆，主题是超级计算机如何从机械计算走到百亿亿次计算。页面采用深海蓝、档案纸和黄铜色的视觉语言，阅读结构参考 Bombe 项目的 00 初始页。

## 启动

需要 Node.js 22 或更新版本：

```powershell
cd D:\Codex\city\deep-blue-studio
npm.cmd ci
npm.cmd run build
npm.cmd run dev
```

打开以下入口：

- 历史档案首页：`http://127.0.0.1:4175/`
- Deep Blue 三维展品：`http://127.0.0.1:4175/prototype/`

## 历史首页

首页包含 16 章、4 段叙事和本地图片：

1. 机械与电子：Z3、ENIAC、实时系统和晶体管。
2. 速度成为工程：CDC 6600、Cray-1、向量机和并行网络。
3. 把许多机器连成一台：TOP500、Deep Blue、Blue Gene/L、GPU 与天河。
4. 百亿亿次之后：神威·太湖之光、Summit、Fugaku 与 Frontier。

章节使用固定目录、滚动高亮、响应式图文和减少动态效果回退。页面不设独立的资料索引或出处页，图片以展签式说明呈现。

## 三维展品

`/prototype/` 保留原有交互：整机、节点、板卡、芯片四层导航，开门、节点抽出、板卡转向、芯片功能示意，以及五步 Minimax / Alpha-Beta 教学。它是教学重建，不是历史维修图纸。

## 检查

```powershell
npm.cmd test
npm.cmd run validate
```

当前构建会生成 `review/prototype/` 和教学 SVG 资产；本地历史图片位于 `review/assets/history/`。`review/` 是开发服务器的静态根目录。

## 技术栈

原生 HTML、CSS、JavaScript、Three.js 0.180.0 和 esbuild 0.28.2。页面不依赖外部 CDN，图片和交互脚本均从本地服务读取。
