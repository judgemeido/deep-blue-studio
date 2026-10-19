# Deep Blue 32 章历史档案实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Deep Blue 历史首页从 16 节静态叙事扩展为 32 节电影感档案，并为每 4 节加入可点击的故事节点详情。

**Architecture:** 将章节正文从硬编码 HTML 提取为数据模块，页面只保留档案壳和渲染挂载点。渲染层生成封面、四幕、32 节、目录和 8 个节点详情；交互层负责滚动高亮、节点 `<dialog>`、焦点回收和减少动态效果。图片从 `assets/history/` 经过构建复制到 `review/assets/history/`，保持当前静态服务器和 `/prototype/` 路由。

**Tech Stack:** 原生 HTML、CSS、ES modules、Node.js、现有 esbuild 构建脚本、Three.js 展品保持不变。

**Spec:** `docs/superpowers/specs/2026-10-19-deep-blue-32-chapters-design.md`

## Global Constraints

- 章节总数固定为 32，ID 为 `ch01` 至 `ch32`。
- 重要节点固定为 8 个，分别挂在第 04、08、12、16、20、24、28、32 节。
- 第 03、07 节必须有不同于封面的本地图片。
- 页面不增加独立出处、史料索引或论文脚注区。
- 档案视觉继续使用深海蓝、档案纸、黄铜编号和现有响应式图片尺寸。
- Deep Blue 三维展品入口和 `/prototype/` 交互继续可用。

## Review Focus

- 章节数据缺失或重复：测试固定 ID、数量和四幕分组。
- 节点详情无法关闭或焦点丢失：测试 Escape、关闭按钮和关闭后的焦点回收。
- 03/07 图片错误映射或 MIME 不正确：测试本地路径、图片响应类型和页面加载失败回退。
- 移动端节点详情遮挡正文：测试窄视口下对话框滚动和关闭入口可见。
- 文案重新变成摘要列表：内容审阅检查每节是否包含人物、动作、现场细节和转折。

### Task 1: 章节数据与图片清单

**Files:**
- Create: `src/history/chapters.js`
- Create: `assets/history/` 图片资产清单及 03/07 专用图片
- Modify: `docs/CHAPTERS_DRAFT.md`
- Test: `tests/history-data.test.mjs`

**Interfaces:**
- Produces `CHAPTERS`: 32 个章节对象，字段见设计说明。
- Produces `MILESTONES`: 8 个节点对象，节点 `chapterId` 对应章节 ID。

- [ ] **Step 1: Write failing data tests**

  测试 `CHAPTERS.length === 32`、ID 连续、四幕各 8 节、`CHAPTERS[2].image !== CHAPTERS[6].image`，并检查 03/07 均为本地图片路径。

- [ ] **Step 2: Add chapter and milestone data**

  将设计说明中的 32 节改写成电影感短叙事；每节填入 `people`、`incident`、`imageAlt` 和 `caption`，节点详情填入完整故事、地点、人物和图片。

- [ ] **Step 3: Add the local image manifest**

  将历史图片放入 `assets/history/`，为每个章节登记文件名和尺寸；03 使用 ENIAC/操作员图，07 使用 SAGE/Whirlwind/雷达图。

- [ ] **Step 4: Run data tests**

  Run: `node --test tests/history-data.test.mjs`

  Expected: 32 chapters, 8 milestones, continuous IDs and unique 03/07 image assertions pass.

### Task 2: 数据驱动的历史页渲染

**Files:**
- Create: `src/history/render-history.js`
- Modify: `review/index.html`
- Modify: `review/history.js`
- Modify: `scripts/build-review.mjs`

**Interfaces:**
- `renderHistory(root, { chapters, milestones }) -> { destroy() }`
- `renderHistory` 生成 `#history-directory`, `#history-pages` 和 `#milestone-dialog`，并保留 `/prototype/` 链接。

- [ ] **Step 1: Write rendering contract tests**

  用 JSDOM 级别的轻量 DOM 测试或 HTML 快照断言：页面包含 32 个 `[data-chapter]`、8 个 `[data-milestone-trigger]`、目录中 32 个锚点，且没有“史料”“出处”“参考”可见文案。

- [ ] **Step 2: Replace hardcoded chapter markup with mount points**

  `review/index.html` 只保留 masthead、封面、`#history-app` 和 footer；移除当前 16 节硬编码正文。

- [ ] **Step 3: Implement `renderHistory`**

  依次生成四幕分隔、章节索引、标题、正文、人物标签、图片展签和节点入口；节点详情使用同一 `<dialog>`，不为每个节点复制一套弹窗结构。

- [ ] **Step 4: Copy source assets during build**

  在 `build-review.mjs` 中创建 `review/assets/history/` 并复制 `assets/history/` 下登记的图片，保留现有 SVG 和文档生成逻辑。

- [ ] **Step 5: Run build and render tests**

  Run: `npm.cmd run build && node --test tests/history-data.test.mjs`

  Expected: build completes, generated page renders 32 chapter sections and all local assets resolve.

### Task 3: 重要节点交互与无障碍

**Files:**
- Modify: `src/history/render-history.js`
- Modify: `review/history.js`
- Modify: `review/history.css`
- Test: `tests/history-interaction.test.mjs`

**Interfaces:**
- `createMilestoneController(root) -> { open(id), close(), destroy() }`
- `data-milestone-trigger` carries the milestone ID; dialog exposes `aria-labelledby` and `aria-describedby`.

- [ ] **Step 1: Write failing interaction tests**

  覆盖打开第 20 节节点、关闭按钮、Escape、重复打开不同节点、焦点回收和 `prefers-reduced-motion` 下无动画依赖。

- [ ] **Step 2: Implement controller**

  打开时填充标题、故事、人物、地点和图片；保存触发按钮，关闭后恢复焦点；对话框内部长文可滚动。

- [ ] **Step 3: Add responsive node styling**

  桌面节点详情限制宽度并保留档案纸背景；移动端使用接近全屏的底部/居中面板，标题和关闭按钮始终可见，图片不超过视口高度。

- [ ] **Step 4: Run interaction tests**

  Run: `node --test tests/history-interaction.test.mjs`

  Expected: all open/close/focus assertions pass.

### Task 4: 浏览器视觉与资源回归

**Files:**
- Modify: `tests/server.test.mjs`
- Modify: `tests/presentation.test.mjs`
- Modify: `scripts/serve.mjs` only if new image formats require MIME entries

- [ ] **Step 1: Add server assertions**

  检查 `/` 返回 200、页面包含 32 个章节 ID、`/assets/history/<03-image>` 与 `<07-image>` 返回 200 和正确图片 MIME，`/prototype/` 仍返回 200。

- [ ] **Step 2: Add browser checks**

  使用现有浏览器检查桌面首屏、目录跳转、第 20 节节点打开/关闭、手机目录和第 32 节收尾；截图保存到 `docs/evidence/history-32/`。

- [ ] **Step 3: Run the full verification suite**

  Run: `npm.cmd run build && npm.cmd test && npm.cmd run validate`

  Expected: build succeeds, all existing and new tests pass, validation reports local assets and generated resources resolved.

