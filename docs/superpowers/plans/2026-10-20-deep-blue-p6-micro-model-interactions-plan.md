# Deep Blue P6 微观建模与交互展陈实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `/prototype/` 的芯片层从四块功能色块升级为可观察、可拆解、可追踪的芯片内部教学展陈，并把空旷的三维舞台补成有尺度、有设备关系的计算机房/展陈场地，同时增加一组可逆、可键盘操作、能与五步教学衔接的交互动作。

**Architecture:** 保留现有单一 Three.js 场景、单一 `requestAnimationFrame` 循环和 `progress 0..6` 的四层导航。把场地环境拆到独立的 `site-environment.js`，把芯片微观几何从 `model.js` 拆到独立的 `chip-model.js`，把芯片事实、场地边界、功能区和交互热点放到数据模块；机柜、展台和场地环境分别建模，物理封装层、教学剖面层和功能覆盖层分别标注。新增微观交互 reducer 管理开盖、剖面、热点、信号追踪和回放状态，DOM 面板与模型拾取都调用同一组动作。

**Tech Stack:** 原生 HTML、CSS、ES Modules、Three.js 0.180.0、esbuild、Node.js 内置测试运行器；不增加框架、外部运行时 CDN 或大型模型依赖。

**Spec:** `docs/PROJECT_PLAN.md`、`docs/FACTS_AND_REFERENCES.md`、`docs/MODEL_CONTRACT.json`、`docs/P4_ACCEPTANCE.md`

## Global Constraints

- 保留 2 柜、30 个教学节点、每节点 1 个 CPU、2 张卡、每卡 8 颗芯片、逻辑总数 480 的展示口径。
- 物理封装、引脚、裸片和内部版图只有在公开资料能支持时才标为历史事实；资料不足的部分必须标注“教学重建 / 功能示意 / 非实际版图”。
- 不把功能框图直接当成真实裸片分区，不把软件置换表放进芯片硬件内部，不模拟完整合法着法引擎或真实 1997 搜索日志。
- 保留 `progress 0..6`、四个观察站点、现有开门/节点/盖板/板卡/芯片转场、P3 五步教学和减少动态效果行为。
- 只精化一颗被选中的芯片；板卡上的其余 15 颗芯片继续使用轻量实例，避免把 480 颗逻辑数量误画成 480 个高模对象。
- 所有新动作必须可反向、可复位；动画中途切换动作时由目标状态重新采样，不叠加临时 transform。
- 新的热点、按钮和状态文本必须支持键盘焦点、`aria-pressed` / `aria-current` / `aria-live`，触控目标不小于 44px。
- 芯片微观视图继续使用深海蓝、冷白、黄铜和少量蓝/绿/琥珀/紫信号色；功能色只代表教学语义，不代表真实物理材料。
- 场地是“1997 计算机房的教学重建 + 展陈导视”，包括带接缝的地面、机柜底座、后墙/侧墙、上方线缆与通风路径、设备铭牌和安全通道；不凭空复制未核实的真实机房平面图。
- 场地细节必须服务于尺度、散热、供电、运维和观看路径；不添加会抢过双柜主体的粒子背景、随机机架森林或装饰性城市天际线。
- 时代锚点使用 1997 年可辨认的设备语言：黑色网孔柜、CRT 终端、米灰/炭黑外设、纸质维护记录、单色状态灯和有编号的线缆/柜体；禁止现代 LCD 墙、RGB 灯带、玻璃数据中心和无来源品牌标识。
- 所有时代道具写入 `eraTag`、`status`、`sourceIds`；照片能证明外观才标为 `confirmed`，仅用于氛围或空间关系的道具标为 `teaching-reconstruction`。

## Review Focus

- **事实边界：** 任何封装、引脚、裸片和连线细节都能追溯到事实表或明确显示教学标签；测试覆盖“无来源时仍可渲染但不冒充历史”的路径。
- **微观连续性：** 开盖、剖切、放大和返回过程中，盖板、基板、裸片、键合线和引脚不穿插，热点不漂离所属部件；测试覆盖起点、中间帧、终点和反向。
- **状态可逆性：** 从任意微观动作组合点击复位、返回板卡、返回整机，都能回到原始绝对姿态；测试覆盖动作被快速打断、反向和减少动态效果。
- **输入归属：** 点击热点不能误触发 OrbitControls 拖动，拖动模型不能误触发热点；键盘、触控和鼠标共享同一动作 reducer。
- **性能与响应式：** 只创建一个高细节芯片，其他芯片复用低模/实例；桌面、390px 手机、低高度视口和 WebGL 不可用时都能给出可用的说明和回退。
- **场地完整性：** 拉远镜头时仍能读出地面、墙面、机柜底座、线缆/通风关系和展陈边界；正面、侧面、顶部视角不能被墙体或导视牌遮挡主体。

## 目标交互路径

```text
进入芯片层
  → 选中芯片 / 显示芯片编号与“教学重建”边界
  → 开盖：封装盖板沿固定铰链移开，键合线和裸片显现
  → 剖面：切换到透明侧壁，显示基板、焊盘、键合线、裸片和引脚层
  → 点选热点：部件高亮，右侧显示输入 / 处理 / 输出 / 依据
  → 追踪信号：棋盘局面 → 着法生成 → 评估 → 搜索控制 → 回传
  → 单步 / 播放 / 暂停 / 反向 / 复位
  → 返回板卡或整机，所有临时状态清除
```

“开盖”和“剖面”是空间动作；“功能区”和“信号追踪”是教学覆盖层。两者可以同时显示，但界面始终把当前层级和当前边界写清楚。

### 场地镜头与空间叙事

```text
整机远景：地面网格 / 底座 / 后墙 / 顶部灯槽 / 机柜与棋桌的距离
  → 机柜近景：前方安全通道、侧后方电源与网络线槽、门的开启半径
  → 节点层：抽出的节点悬在底座和滑轨之间，后墙标注“教学重建”
  → 板卡层：板卡朝向观看者，另一张卡仍在节点内作为尺度参照
  → 芯片层：环境降噪，保留底座轮廓和一条信号/散热导视线作为空间锚点
```

场地不是第二个主角。远景用它回答“这台机器放在哪里、如何供电和散热、人与机器如何相处”，进入芯片后则降低墙面和铭牌对比度，把注意力交给封装和功能层。

### 时代背景建模原则

场地要让观众一眼回到 1997 年，而不是看见一个泛化的现代机房。建模分成三类：

- **有公开图像支持的外观：** 以 S7 的双塔柜体、网孔门和顶部编号为主；以 S8 的裸片质感、S2 的板卡/芯片关系作为微观参考。照片只用于轮廓、材质和相对关系，不反推没有显示出来的尺寸。
- **时代合理但未被照片确认的道具：** CRT 终端、纸质值班记录、单色状态灯、编号线缆、米灰键盘、机房地面接缝和通风格栅。这些只表达工作环境，统一标记为“教学重建”，不写成 Deep Blue 比赛现场原物。
- **不采用的视觉语言：** 现代玻璃幕墙、蓝色 LED 灯带、RGB 机架、服务器热力图墙、无限重复的机柜森林和科幻粒子云。它们会把时代线索和机器主体一起稀释。

远景中保留一张 CRT 终端、一个纸面维护夹和一条通向机柜后侧的线缆路径；节点层只保留柜门编号、滑轨和通风方向；芯片层把纸面、灯槽和墙面压暗，只留一条低对比度的“1997 / 专用计算”导视线。

### Task 1: 锁定芯片微观事实与表现边界

**Files:**
- Modify: `docs/MODEL_CONTRACT.json`
- Modify: `docs/FACTS_AND_REFERENCES.md`
- Modify: `docs/PROJECT_PLAN.md`
- Create: `docs/P6_MICRO_MODEL_SPEC.md`
- Test: `tests/chip-contract.test.mjs`

**Interfaces:**
- `MODEL_CONTRACT.microChip` 提供 `status`, `layers`, `package`, `die`, `pins`, `hotspots` 和 `sources` 字段。
- `P6_MICRO_MODEL_SPEC.md` 固定每一层可说什么、不能说什么，以及屏幕上的边界文案。

- [ ] **Step 1: 写失败测试**
  - 断言微观合同包含 `package`, `substrate`, `die`, `bondWires`, `pins` 五个层级。
  - 断言每个层级有 `status` 和 `sources`；无来源层级的 `status` 必须是 `schematic` 或 `pending`，不能是 `confirmed`。
  - 断言四个功能热点仍对应 `moves`, `evaluate`, `control`, `stack`，且每个热点都有 `label`, `input`, `output`, `boundary`。

- [ ] **Step 2: 运行测试确认失败**

  Run: `node --test tests/chip-contract.test.mjs`

  Expected: FAIL，因为当前合同没有微观层级和热点边界字段。

- [ ] **Step 3: 建立事实合同和微观规格**
  - 以 S1、S2、S7 和现有事实表为已确认基础；封装尺寸、丝印、裸片区域和精确针脚编号若没有公开依据，写成 `schematic`，不填写伪精确数字。
  - 在 `P6_MICRO_MODEL_SPEC.md` 写出五层的视觉责任：封装盖、封装/引脚、基板与焊盘、裸片、功能覆盖层。
  - 为每个可见层提供页面文案，例如“芯片内部：教学重建，非历史版图”，并明确软件置换表仍在搜索教学层。

- [ ] **Step 4: 运行测试确认通过**

  Run: `node --test tests/chip-contract.test.mjs`

  Expected: PASS，且所有 `confirmed` 字段都能在事实表中找到来源 ID。

### Task 2: 把芯片微观几何拆成独立资产

**Files:**
- Create: `src/prototype/chip-model.js`
- Modify: `src/prototype/model.js`
- Modify: `src/prototype/geometry-checks.js`
- Test: `tests/chip-model.test.mjs`
- Test: `tests/chip-clearance.test.mjs`

**Interfaces:**
- `createChipAssembly({ materials, contract }) -> { root, parts, hotspots, dispose }`。
- `parts` 至少包含 `{ packageBody, lid, substrate, die, bondWires, pins, traces, regions }`。
- `hotspots` 是带稳定 `id`、`object`、`label` 和 `functionId` 的数组；`object` 必须是可拾取的 Three.js 对象。
- `model.parts.micro` 继续指向微观根节点，现有 `regions`, `chips` 和 `applyPose()` 调用保持兼容。

- [ ] **Step 1: 写失败测试**
  - 创建模型后断言微观根节点包含封装、基板、裸片、键合线和引脚集合。
  - 断言详细芯片只创建一份，板卡上的其余芯片数量和逻辑计数不变。
  - 断言 `createChipAssembly()` 返回的热点 ID 唯一，并且每个热点的对象属于微观根节点。
  - 在 `chipProgress` 为 0、0.5、1 时检查各层的可见性和包围盒不包含相机位置。

- [ ] **Step 2: 运行测试确认失败**

  Run: `node --test tests/chip-model.test.mjs tests/chip-clearance.test.mjs`

  Expected: FAIL，因为当前微观层只有简单盒体，没有独立部件集合。

- [ ] **Step 3: 实现 `createChipAssembly()`**
  - 用可复用的 `RoundedBoxGeometry` / `CylinderGeometry` / `TubeGeometry` 组合程序化建立：封装主体、可移除盖板、基板、中央裸片、键合线、引脚排和少量电源/信号走线。
  - 键合线只做少量代表性连线，使用曲线管或细线，避免把示意线误读为完整版图。
  - 盖板、侧壁、裸片和功能覆盖层使用独立材质，支持透明度和 emissive 高亮；重复引脚使用实例化或共享几何。
  - 四个功能区域作为覆盖层附着在裸片上，保留当前 `regions` 引用和四个现有功能 ID。
  - 把微观资产的创建与销毁从 `model.js` 中移出；`model.js` 只负责把详细芯片挂到选中芯片和现有转场上。

- [ ] **Step 4: 实现几何检查**
  - 在 `geometry-checks.js` 增加 `checkChipAssemblyClearance(model, progress, microState)`，检查盖板、引脚、裸片、键合线和相机的边界关系。
  - 对“盖板打开后才显示裸片”“剖面模式不把侧壁留在裸片前方”“热点覆盖层不穿过裸片”建立明确断言。

- [ ] **Step 5: 运行测试确认通过**

  Run: `node --test tests/chip-model.test.mjs tests/chip-clearance.test.mjs tests/model.test.mjs tests/chip-transition.test.mjs`

  Expected: PASS，现有 30 节点 / 2 卡 / 16 芯片 / 480 芯片约束不变。

### Task 3: 建立有尺度关系的计算机房 / 展陈场地

**Files:**
- Create: `src/prototype/site-environment.js`
- Modify: `src/prototype/exhibit.js`
- Modify: `src/prototype/scene.js`
- Modify: `docs/MODEL_CONTRACT.json`
- Modify: `docs/FACTS_AND_REFERENCES.md`
- Test: `tests/site-environment.test.mjs`
- Test: `tests/framing.test.mjs`

**Interfaces:**
- `createSiteEnvironment({ contract }) -> { root, parts, setProgress(progress), setMode(mode), dispose }`。
- `parts` 至少包含 `{ floor, plinth, backWall, sideWall, lightSlots, cableTray, ventilation, labels, aisleMarkers }`。
- `setMode(mode)` 接受 `'overview'|'structure'|'quiet'`：分别显示完整场地、保留结构线索、降低场地对比度。
- `scene` 继续只持有一个环境根节点，并在已有 `render(state)` 中调用 `site.setProgress()` / `site.setMode()`，不新增渲染循环。

- [ ] **Step 1: 写失败测试**
  - 断言场地返回地面、底座、后墙、侧墙、灯槽、线槽、通风和导视部件，且每个部件有唯一对象引用。
  - 断言场地底座与两柜脚底接触，地面和墙面不会穿过机柜包围盒，安全通道不侵入门的旋转扫掠范围。
  - 断言整机远景的相机包围盒包含场地边界但不把主体缩成不可读尺寸；正/侧/顶视角的墙体不遮挡机柜主体。
  - 断言 `overview → structure → quiet` 只改变可见性/材质强度，不改变机柜、棋桌和节点的世界矩阵。

- [ ] **Step 2: 运行测试确认失败**

  Run: `node --test tests/site-environment.test.mjs tests/framing.test.mjs`

  Expected: FAIL，因为当前场景只有一块平面地面和棋桌，没有场地根节点。

- [ ] **Step 3: 实现场地几何**
  - 在 `site-environment.js` 程序化建立低成本、可复用的静态环境：带接缝和边缘的地面板、两个柜体底座、后墙/侧墙、顶部灯槽、侧后方线缆桥架、低矮通风格栅、展签/编号牌和安全通道标线。
  - 让电源/网络线槽从机柜后侧通向场地边界，使用少量曲线或盒体表达“连接关系”，不绘制不可考证的完整线路。
  - 把棋桌与 CRT 保留在 `exhibit.js`，增加其与底座、通道和机柜朝向的相对位置检查；场地组件共享材质和几何，避免复制高成本对象。
  - 补充时代道具：低亮度单色 CRT 状态画面、米灰键盘轮廓、纸质维护夹、编号线缆和通风格栅；道具只提供可读轮廓，不伪造屏幕内容、品牌或比赛现场原物。
  - 将场地标注数据写入合同，统一使用“教学重建”边界文案；不把展陈墙面上的说明文字当成历史机房原件。

- [ ] **Step 4: 接入场地状态和镜头**
  - 默认整机层使用 `overview`；节点/板卡层切到 `structure`；芯片层切到 `quiet`，保留底座、后墙轮廓和一条导视线作为尺度锚点。
  - 在 `scene.js` 中把场地根节点纳入同一套渲染和释放流程，保持现有阴影/地面渐隐逻辑；场地墙面不参与会遮挡微观芯片的投影。
  - 为 `cameraPose()` 增加场地安全边界的测试输入，确保 front/side/top 视角在场地存在后仍有明确主体。

- [ ] **Step 5: 加入时代背景的验收断言**
  - 断言场地至少有一个 `eraTag: '1997'` 的 CRT / 纸面 / 编号线缆组合，并且现代装饰词或 RGB 材质不会出现在场地数据中。
  - 断言所有非 `confirmed` 道具的可访问说明包含“教学重建”或等价边界文本。
  - 断言 `quiet` 模式会降低时代道具对比度，但不隐藏机柜的柜门、编号和底座关系。

- [ ] **Step 6: 运行测试确认通过**

  Run: `node --test tests/site-environment.test.mjs tests/framing.test.mjs tests/camera.test.mjs tests/model.test.mjs`

  Expected: PASS，场地有空间边界但不改变既有模型姿态、相机方向和返回行为。

### Task 4: 建立可逆的微观动作状态机

**Files:**
- Create: `src/prototype/micro-state.js`
- Modify: `src/prototype/motion.js`
- Modify: `src/prototype/state.js`
- Test: `tests/micro-state.test.mjs`
- Test: `tests/motion.test.mjs`

**Interfaces:**
- `createMicroState() -> { lid: 'closed'|'open', section: 'assembled'|'cutaway', hotspot: null|string, trace: 'idle'|'playing'|'paused'|'complete', traceStep: number, reducedMotion: boolean }`。
- `reduceMicroState(state, action) -> state`，支持 `OPEN_LID`, `CLOSE_LID`, `TOGGLE_SECTION`, `SELECT_HOTSPOT`, `CLEAR_HOTSPOT`, `START_TRACE`, `PAUSE_TRACE`, `STEP_TRACE`, `RESET_MICRO`。
- `sampleMicroPose(state, elapsed) -> { lidAngle, sideOpacity, dieOpacity, wireOpacity, pinOpacity, traceProgress }`。

- [ ] **Step 1: 写失败测试**
  - 断言初始状态是闭盖、组装、无热点、信号空闲。
  - 断言开盖、剖面、追踪和复位动作只产生合法状态，不会跳过必须的前置状态。
  - 断言 `STEP_TRACE` 在最后一步保持 `complete`，`RESET_MICRO` 清空全部临时状态。
  - 断言非法 action、非法热点 ID、非有限时间和超出范围的步数不会产生 NaN 或未知状态。
  - 断言 reduced motion 直接得到同一最终姿态，而不是另一套结构。

- [ ] **Step 2: 运行测试确认失败**

  Run: `node --test tests/micro-state.test.mjs`

  Expected: FAIL，因为项目当前没有微观动作 reducer。

- [ ] **Step 3: 实现纯状态 reducer 和姿态采样**
  - 状态只保存意图，不保存 Three.js 临时矩阵；姿态由 `sampleMicroPose()` 根据状态和时间计算。
  - 开盖使用固定铰链角度；剖面使用透明度和侧壁位移；信号追踪只改变覆盖层和路径粒子的教学状态，不移动物理封装。
  - 与现有 `samplePose(progress)` 分开，芯片层进入后由 `model.applyMicroPose()` 消费微观姿态。

- [ ] **Step 4: 接入统一动画循环**
  - `main.js` 的现有唯一循环每帧调用 `microState` 的 tick，不创建第二个 RAF。
  - 切换观察站点、教学退出、页面隐藏和 WebGL context lost 时暂停并清理微观回放。

- [ ] **Step 5: 运行测试确认通过**

  Run: `node --test tests/micro-state.test.mjs tests/motion.test.mjs tests/playback.test.mjs`

  Expected: PASS，旧的进度段与新微观动作互不漂移。

### Task 5: 增加热点拾取、剖面和信号路径

**Files:**
- Modify: `src/prototype/scene.js`
- Modify: `src/prototype/model.js`
- Create: `src/prototype/signal-trace.js`
- Test: `tests/chip-interaction.test.mjs`
- Test: `tests/signal-trace.test.mjs`

**Interfaces:**
- `scene.onChipHotspotSelect(handler)` 注册微观热点回调；保持现有 `onRegionSelect()` 不变。
- `model.applyMicroPose(pose)` 更新微观部件；`model.setHotspot(id)` 更新高亮；`model.clearHotspot()` 清除高亮。
- `createSignalTrace()` 返回 `{ steps, getStep(index), reset(), dispose() }`；每一步包含 `from`, `to`, `label`, `functionId` 和 `duration`。

- [ ] **Step 1: 写失败测试**
  - 点击命中热点时只触发一次热点回调；拖动超过 5px 不触发热点。
  - 未进入芯片终态时热点拾取被门禁拦截；返回板卡后热点选择被清除。
  - 信号路径包含“局面输入 → 着法生成 → 局面评估 → 搜索控制 → 回传”五步，步骤 ID 唯一且每步有功能边界。

- [ ] **Step 2: 运行测试确认失败**

  Run: `node --test tests/chip-interaction.test.mjs tests/signal-trace.test.mjs`

  Expected: FAIL，因为当前场景只拾取四个功能块，不支持稳定热点和信号路径。

- [ ] **Step 3: 扩展场景拾取**
  - 为热点建立独立的不可见/半透明拾取网格，避免细引脚因像素过小无法点击。
  - 统一鼠标、触控和键盘入口；OrbitControls 的拖动判断先于热点点击判断，保留当前 5px 拖动阈值。
  - 用 `scene.focus()` 的同一相机状态保持剖面目标居中，热点选择不重置用户视角。

- [ ] **Step 4: 实现信号路径回放**
  - 用少量曲线和发光点表现单条教学信号路径；路径颜色对应功能语义，旁边显示步骤号和输入/输出。
  - 回放状态只引用教学数据，不声称是实际芯片内部布线或历史日志。

- [ ] **Step 5: 运行测试确认通过**

  Run: `node --test tests/chip-interaction.test.mjs tests/signal-trace.test.mjs tests/camera.test.mjs tests/framing.test.mjs`

  Expected: PASS，热点选择、相机目标、拖动门禁和路径数据都稳定。

### Task 6: 重做芯片操作面板与多动作入口

**Files:**
- Modify: `prototype/index.html`
- Modify: `prototype/style.css`
- Modify: `src/prototype/chip-ui.js`
- Modify: `src/prototype/chip-functions.js`
- Test: `tests/chip-ui.test.mjs`

**Interfaces:**
- `createChipUI({ container, onSelect, onAction })` 的 `onAction` 接收微观动作对象，例如 `{ type: 'TOGGLE_LID' }`。
- 面板包含四组稳定入口：`data-chip-action="lid"`、`data-chip-action="section"`、`data-chip-action="trace"`、`data-chip-action="reset"`。
- `chip-functions.js` 的每个功能对象新增 `hotspotId`, `boundary`, `signalStep`，保持原有 `input`, `action`, `output`, `source`, `example`。

- [ ] **Step 1: 写失败测试**
  - 断言芯片层面板显示当前芯片层级、动作按钮、四功能热点和信号回放状态。
  - 断言按钮通过 `aria-pressed` 反映开盖/剖面/播放状态，动作触发一次且不会创建重复监听器。
  - 断言选择热点后输入、处理、输出、示例、依据和“教学重建”边界都更新；复位后选择和面板状态清空。
  - 断言按钮在芯片动画尚未到达终态时禁用，返回板卡/整机时面板隐藏。

- [ ] **Step 2: 运行测试确认失败**

  Run: `node --test tests/chip-ui.test.mjs`

  Expected: FAIL，因为当前面板只有四个功能按钮和静态说明。

- [ ] **Step 3: 实现面板动作和状态同步**
  - 在面板顶部显示“芯片 01 / 16 · 放大功能示意 · 非实际版图”，并保留来源入口。
  - 增加“开盖 / 关闭封装”“剖面 / 立体”“追踪信号 / 暂停”“单步”“复位微观视图”入口。
  - 把模型热点选择和 DOM 按钮选择绑定到同一 `onSelect`；用 `aria-live` 宣布当前部件和信号步骤。
  - 移动端使用分段控制和可折叠说明，确保不把三维画布和面板同时压缩成不可读的窄列。

- [ ] **Step 4: 完成样式与 reduced-motion 回退**
  - 延续 00 页/01 页现有深海蓝、冷白、蓝色主操作和黄铜边界；功能色只出现在热点和路径。
  - reduced motion 下保留最终剖面和热点高亮，禁用自动播放但保留单步按钮。

- [ ] **Step 5: 运行测试确认通过**

  Run: `node --test tests/chip-ui.test.mjs tests/chip-functions.test.mjs tests/teaching-ui.test.mjs`

  Expected: PASS，面板动作、芯片功能语义和 P3 教学衔接不回归。

### Task 7: 把微观动作接回五步教学和返回路径

**Files:**
- Modify: `src/teaching/teaching-ui.js`
- Modify: `src/prototype/main.js`
- Modify: `prototype/index.html`
- Test: `tests/teaching-ui.test.mjs`
- Test: `tests/micro-flow.test.mjs`

**Interfaces:**
- 五步教学第 5 步的“进入芯片”可打开芯片层，并提供“开盖查看”“追踪一次信号”“回到自由观察”三个动作。
- `main.js` 暴露给教学 UI 的桥接保持 `onStation(index)`，新增 `onMicroAction(action)`；教学 UI 不直接操作 Three.js 对象。

- [ ] **Step 1: 写失败测试**
  - 断言从教学第 5 步进入芯片后，可直接触发开盖和信号回放，不经过整机中间请求。
  - 断言教学结束、返回自由观察、站点切换和整机复位都会清空微观动作状态。
  - 断言五步教学的原有搜索树、剪枝和调度数据不被芯片回放替换。

- [ ] **Step 2: 运行测试确认失败**

  Run: `node --test tests/teaching-ui.test.mjs tests/micro-flow.test.mjs`

  Expected: FAIL，因为现有教学 UI 只提供“看节点 / 看板卡 / 看芯片”。

- [ ] **Step 3: 实现桥接**
  - 教学 UI 只派发带类型的动作；`main.js` 负责 reducer、模型姿态和面板状态的单一所有权。
  - 进入芯片时保持现有 `progress=6` 门禁和 `content-view` 行为；退出时调用 `RESET_MICRO`，不留下透明度、热点或路径粒子。
  - 教学回放与微观回放共用页面可见性、减少动态效果和 pagehide 清理逻辑。

- [ ] **Step 4: 运行测试确认通过**

  Run: `node --test tests/teaching-ui.test.mjs tests/micro-flow.test.mjs tests/chip-transition.test.mjs`

  Expected: PASS，教学动作、自由观察和返回路径闭环。

### Task 8: 浏览器验收、性能和无障碍回归

**Files:**
- Modify: `docs/P6_ACCEPTANCE.md`
- Create: `tests/p6-browser-checklist.md`
- Optional Modify: `scripts/validate.mjs`

- [ ] **Step 1: 构建并运行静态检查**

  Run: `npm run build`

  Run: `npm test`

  Run: `npm run validate`

  Run: `git diff --check`

  Expected: 构建成功，现有测试与新增测试全部通过，事实合同和本地资产检查通过。

- [ ] **Step 2: 桌面浏览器验收**
  - 打开 `http://127.0.0.1:4175/prototype/`，从整机依次进入节点、板卡、芯片。
  - 在芯片层检查：开盖、剖面、热点逐个点击、四功能区切换、信号单步/播放/暂停/复位、回到板卡和整机。
  - 从芯片中途反向返回，确认没有透明物体残留、相机没有被锁死、模型姿态无漂移。
  - 检查控制台无 error/warning，帧率不会因为 16 颗低模芯片和 1 颗高模芯片明显下降。

- [ ] **Step 3: 手机、键盘和减少动态效果验收**
  - 在 390×844 视口验证模型/说明切换、动作按钮 44px 触控目标、热点说明不横向溢出。
  - 用 Tab / Enter / Escape 完成开盖、剖面、热点、回放和关闭说明；焦点始终落在可见控件。
  - 开启 `prefers-reduced-motion`，确认不自动播放但可单步，最终视觉状态与正常模式一致。

- [ ] **Step 4: 写验收记录**
  - 在 `docs/P6_ACCEPTANCE.md` 记录模型层级、来源边界、浏览器视口、截图路径、测试数量和尚未核实的实物细节。
  - 明确区分“几何/状态测试通过”“浏览器交互观察通过”“历史真实性仍待资料支持”。

## Self-review

- 芯片内部精细建模由 Task 1 的事实合同、Task 2 的几何资产和 Task 8 的边界验收覆盖；没有把功能框图直接升级成未经来源支持的真实版图。
- 周围场地由 Task 3 的独立环境根节点、相机边界和空间完整性测试覆盖；场地与展品共享尺度关系但不改变现有机械动作。
- 多点交互由 Task 4 的 reducer、Task 5 的拾取/信号、Task 6 的面板和 Task 7 的教学桥接覆盖；所有动作都能反向或复位。
- 现有 P1/P2/P3/P4 接口仍作为兼容边界：`progress 0..6`、`onRegionSelect`、`onStation`、单一 RAF、30 节点/480 芯片和现有测试不被拆掉。
- 低模复用、热点拾取网格和只精化一颗芯片把性能风险限制在可测范围内；计划没有引入 GLB、Blender 或新运行时依赖，只有在公开资料提供合适实物模型且浏览器预算允许时才另行评估。
- 计划只描述实现，不修改产品代码；执行前需要先确认用户接受“物理层 + 教学剖面层”双层表现，以及在资料不足处保留明确的教学重建标签。
