# Deep Blue 抽拉目录与视觉重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将历史档案页改成更有品味的“深海档案仪器”界面，并把左侧目录改为只展示当前章节附近内容的抽拉式导航，避免目录跃出屏幕。

**Architecture:** 保留现有静态 HTML、ES Modules 和 CSS 架构。目录由 `render-history.js` 输出抽拉容器与幕级分组，`history.js` 根据当前章节同步展开幕、定位当前节并控制抽屉状态；视觉改造集中在 `palette.css` 和 `history.css`，不引入框架或新依赖。正文数据继续放在 `chapters.js`，第 16—32 节保持电影化叙事方向。

**Tech Stack:** 原生 HTML、CSS、ES Modules、Node test runner、现有本地图片与 SVG 资产。

**Spec:** `docs/superpowers/specs/2026-10-19-deep-blue-32-chapters-design.md`

## Global Constraints

- 保留 `ch01` 至 `ch32`、4 幕、8 个重要节点和现有 `/prototype/` 入口。
- 不添加前端框架、图标包或新的运行时依赖。
- 目录跳转继续使用普通锚点，并保留键盘焦点、`aria-current="location"` 和 `prefers-reduced-motion` 支持。
- 目录默认只展开当前章节所在的一幕；当前章节始终可见并滚动到抽屉可视范围内。
- 桌面端目录不形成独立长滚动面；移动端改为底部抽屉或全宽展开面，避免横向溢出。
- 视觉上借鉴 Apple 的留白、层级、系统字体、半透明表面和克制动效，不复制 Apple 标志、专属组件或页面结构。
- 正文保持具体人物、动作、地点、声音和技术转折，避免模板化总结句。

## Review Focus

- 当前章节切换到第 01、08、16、24、32 节时，抽屉是否只展示对应幕并把当前项保持在可视区。
- 目录折叠、抽拉和锚点跳转是否不会改变正文滚动位置或造成焦点丢失。
- 视口高度较小时，目录是否仍能完整显示当前幕的 8 个条目而不出现第二个滚动条。
- 颜色变化是否有明确语义，正文文字、链接、当前项和强调色都满足可读性。
- 关闭抽屉后，键盘用户是否仍能通过按钮重新打开并在目录中移动。

### 品味评审结论

当前页面的问题集中在三处：卡片和阴影的层级太多，导致每一节都像相同的组件；深海蓝、浅灰和黄铜之间缺少清晰的语义分工，颜色看起来像装饰；目录长期显示 32 节，信息量超过侧栏承担的范围。章节重点模块本身有价值，但现在和标题、图片、正文争夺同一层级。

新的视觉方向定为“深海档案仪器”：页面底色保持接近白色的冷灰，正文表面使用单层白色浮面，深海蓝只用于首屏和导航，四幕各使用一个低饱和信号色。大圆角只用于容器，正文内部减少边框和阴影；真正的视觉记忆点放在左侧抽拉目录的“当前节定位线”和章节图片的展签感上。

设计令牌建议如下：

- `--paper: #F5F7FA`，页面底色；`--surface: #FFFFFF`，正文表面；`--ink: #17202B`，主文字；`--muted: #667384`，辅助文字。
- `--blue: #0A84FF`，当前章节和主操作；`--teal: #30B0C7`，第二幕；`--violet: #8E8CD8`，第三幕；`--amber: #FFB340`，第四幕节点。
- 正文使用系统无衬线字体，英雄标题和章节标题使用现有中文衬线字体；元信息不再大面积使用等宽字体。
- 动效只保留抽屉打开、当前项切换和图片轻微位移，统一使用 180—260ms，尊重减少动效设置。

### 布局草图

```text
┌─────────────────────────────────────────────────────────────┐
│ 顶部半透明导航                         历史档案   三维展品 │
├──┬──────────────────────────────────────────────────────────┤
│▸ │ 章节正文                                    │  图片展签 │
│  │  章节标题                                    │          │
│  │  本节重点                                    │          │
│  │  两段电影化叙事                              │          │
│  │  现场细节 / 节点入口                         │          │
└──┴──────────────────────────────────────────────────────────┘
```

抽屉关闭时只保留左侧窄标签和当前章节号；打开时从左侧覆盖出当前幕的 8 个章节，顶部显示“第几幕 / 当前节”，底部保留“回到当前节”动作。目录内容按当前章节自动切换，不把全部 32 节压在同一块区域里。

### Task 1: 抽拉式目录的数据结构和渲染

**Files:**
- Modify: `review/history/render-history.js`
- Modify: `review/history.js`
- Test: `tests/history-render.test.mjs`
- Test: `tests/history-interaction.test.mjs`

**Interfaces:**
- `renderDirectory(chapters)` 输出 `data-directory-drawer`、`data-directory-toggle`、`data-directory-act` 和 `data-scene-link`。
- `history.js` 维护 `setDirectoryAct(act)`, `setDirectoryOpen(open)` 和 `scrollActiveLinkIntoView()` 三个局部函数。

- [ ] **Step 1: 写失败测试**
  - 断言目录仍输出 32 个章节链接，但默认只把当前幕标为 `data-directory-act="1"`。
  - 断言目录有可访问的打开/关闭按钮，按钮状态通过 `aria-expanded` 表示。
  - 断言切换到 `ch17` 时，第 3 幕成为当前展开幕，其他幕被折叠。

- [ ] **Step 2: 运行测试确认失败**
  - Run: `npm test -- tests/history-render.test.mjs tests/history-interaction.test.mjs`
  - Expected: 新增断言失败，现有目录仍是平铺结构。

- [ ] **Step 3: 实现目录渲染和状态同步**
  - 把目录按 `chapter.act` 分成四个 `<ol>`，只显示当前幕的列表。
  - 为抽屉按钮提供文本标签：“打开目录”“关闭目录”。
  - `IntersectionObserver` 或滚动回退逻辑更新当前章节时，同时更新当前幕并让当前链接进入抽屉可视区。
  - 点击链接后关闭抽屉，但不阻止原生锚点跳转；焦点回到章节标题或目录按钮，取决于操作来源。

- [ ] **Step 4: 运行测试确认通过**
  - Run: `npm test -- tests/history-render.test.mjs tests/history-interaction.test.mjs`
  - Expected: 目录结构、展开幕、键盘状态全部通过。

### Task 2: 抽屉视觉和响应式布局

**Files:**
- Modify: `review/history.css`
- Modify: `review/palette.css`
- Test: `tests/history-render.test.mjs`

**Interfaces:**
- 使用 Task 1 生成的 `data-directory-drawer`、`data-directory-toggle`、`data-directory-act`。

- [ ] **Step 1: 写布局断言**
  - 断言渲染结果包含抽屉状态类和当前幕标记。
  - 保留现有目录无独立长滚动条的约束。

- [ ] **Step 2: 实现桌面端抽屉**
  - 关闭状态只显示窄标签；打开状态使用 `position: sticky`、`max-height: calc(100dvh - 112px)` 和 `overflow: hidden`。
  - 当前幕列表最多 8 项，条目使用紧凑的 44px 行高，当前节显示蓝色定位线和浅蓝底。
  - 目录从左侧滑出，正文区域不随抽屉宽度抖动。

- [ ] **Step 3: 实现移动端抽屉**
  - 抽屉改为贴底的全宽面板，打开后覆盖正文底部区域。
  - 当前幕列表使用两列或单列自适应，不出现横向滚动。
  - 加入安全区内边距和 44px 最小触控目标。

- [ ] **Step 4: 完成整体视觉重构**
  - 删除重复卡片阴影，统一正文表面、章节图片、重点模块的层级。
  - 使用冷白背景、深海蓝首屏、四幕信号色和系统字体，减少装饰性边框。
  - 保留一处明确的动态焦点：抽屉当前节定位和章节图片的轻微进入动效。

- [ ] **Step 5: 运行视觉与回归验证**
  - Run: `npm test && npm run validate`
  - 用 Playwright 检查桌面、窄屏和低高度视口；确认目录不跃出屏幕，当前节始终可见。

### Task 3: 第 16—32 节电影化文案复核

**Files:**
- Modify: `review/history/chapters.js`
- Test: `tests/history-data.test.mjs`

**Interfaces:**
- 保持每节的 `story` 为 2—3 段数组，`incident` 为一个现场细节，`caption` 为展签句。

- [ ] **Step 1: 为 ch16—ch32 写文案质量断言**
  - 每节至少包含地点或具体设备、人物动作、可见/可听的现场细节和技术转折。
  - 禁止连续使用“把……变成……”“这说明……”和抽象结论开头。

- [ ] **Step 2: 按镜头节拍改写**
  - 每节第一段从一个可见动作或声音开始。
  - 第二段让故障、等待或决策推动技术转折。
  - 结尾留下一句具体问题或代价，不用宣传式总结。

- [ ] **Step 3: 运行数据测试和全文扫描**
  - Run: `npm test -- tests/history-data.test.mjs`
  - Run: `rg -n "把.*变成|这说明|意味着|不只是.*而是" review/history/chapters.js`
  - Expected: 章节字段完整，模板化句式显著减少。

### Task 4: 端到端验收

**Files:**
- Test: `tests/history-interaction.test.mjs`
- Test: `tests/history-render.test.mjs`

- [ ] **Step 1: 启动本地服务**
  - Run: `npm run dev`

- [ ] **Step 2: 用 Playwright 检查交互**
  - 访问 `http://127.0.0.1:4175/#ch01`。
  - 打开目录，跳转到 `ch16`、`ch24`、`ch32`，确认抽屉只展开当前幕且当前链接不出视口。
  - 在移动视口重复操作，确认抽屉可以打开、关闭和用键盘操作。

- [ ] **Step 3: 运行完整验证**
  - Run: `npm test && npm run validate`
  - Expected: 45 项现有测试和新增目录测试全部通过。

## Self-review

- 目录功能、视觉重构、文案复核和响应式验收分别有独立任务，任务之间通过明确的 `data-*` 接口衔接。
- 用户提出的“抽拉式、跟随当前节、避免跃出屏幕”由 Task 1、Task 2 和 Task 4 覆盖。
- 用户提出的“先品味再操作”由品味评审、令牌、布局草图和 Review Focus 记录。
- 现阶段只写计划，尚未修改实现代码。
