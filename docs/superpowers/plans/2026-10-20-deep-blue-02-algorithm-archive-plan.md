# Deep Blue 02 Algorithm Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a cassette-source-inspired 3D algorithm archive that explains how Deep Blue turns a chess position into a parallel hardware decision.

**Architecture:** Add a self-contained `/strategy/` source page with a procedural Three.js scene, a data-driven six-record archive, and a single progress state shared by camera, model, signal overlays and DOM readouts. Reuse the existing Deep Blue model primitives and teaching search logic where their boundaries fit, while keeping 00/01 behavior intact and adding 02 to the shared project navigation.

**Tech Stack:** Plain HTML/CSS/JavaScript, Three.js 0.180.0, esbuild, Node test runner, existing Deep Blue procedural geometry and search helpers.

**Spec:** `docs/superpowers/specs/2026-10-20-deep-blue-02-design.md`

## Global Constraints

- Use the existing plain JavaScript + Three.js + esbuild stack; do not add React, Vite, a physics engine, remote models or network requests.
- The scene must meet an exhibit-grade modeling bar: real bevels and joins on hero hard-surface parts, distinct physical material response, authored lighting/reflection, readable close-up layers, and causal motion with checked pivots and clearance.
- The 3D scene is a teaching reconstruction; do not present it as a complete historical game replay or a verified Deep Blue die layout.
- Use 30 nodes, 1 P2SC per node, 2 cards per node and 8 chips per card for the sourced configuration; keep conditional labels on approximate speed claims.
- A single 0–1 record progress source drives camera, scene state, signal pulses and readouts; seeking must update all of them together.
- Native controls, reduced-motion behavior, keyboard focus and no nested scroll region are required for the archive index and timeline.

## Review Focus

- Reading a new record while a previous camera transition is active must retarget the same transition without leaving stale labels or pulses.
- Reversing the timeline, resetting from an intermediate state and replaying quickly must derive transforms from base poses with no drift or NaN.
- Minimax and Alpha-Beta must return the same root value while Alpha-Beta visits fewer teaching nodes and exposes truthful prune reasons.
- A narrow viewport must keep the archive index, timeline and 3D canvas reachable without a second independent scroll container.
- Reduced motion and keyboard-only operation must reach the same final scene states and preserve focus.

---

### Task 1: Algorithm and archive data contracts

**Files:**
- Create: `src/strategy/archive-data.js`
- Create: `src/strategy/algorithm.js`
- Create: `tests/strategy-algorithm.test.mjs`
- Create: `tests/strategy-archive.test.mjs`

**Interfaces:**
- `archive-data.js` exports `STRATEGY_RECORDS`, `CAMERA_PRESETS`, `ALGORITHM_CLAIMS`.
- `algorithm.js` exports `buildTeachingTree()`, `runTeachingSearch(tree, options)`, `stepSearch(playback)` and `describeSearchEvent(event)`.

- [ ] **Step 1: Write failing tests** for six ordered records, stable IDs, source/boundary fields, deterministic tree results, Alpha-Beta equal root value, fewer visits, truthful prune events and safe clamping of playback.
- [ ] **Step 2: Run `node --test tests/strategy-algorithm.test.mjs tests/strategy-archive.test.mjs`** and confirm the new exports are missing.
- [ ] **Step 3: Implement the records and pure algorithm functions** with fixed teaching values, explicit `isTeachingData` markers, and no DOM or Three.js dependency.
- [ ] **Step 4: Run the focused tests** and confirm PASS.

### Task 2: Procedural algorithm scene

**Files:**
- Create: `src/strategy/algorithm-model.js`
- Create: `src/strategy/algorithm-scene.js`
- Modify: `src/prototype/chip-model.js` or expose a shared import only if reuse is needed without changing 01 behavior.
- Create: `tests/strategy-scene.test.mjs`

**Interfaces:**
- `createAlgorithmModel({ records })` returns `{ root, parts, applyProgress(progress), setRecord(id), reset(), dispose() }`.
- `createAlgorithmScene(canvas, model, { onBoardChoice, onSignalSelect })` returns `{ render(state), setCameraPreset(id), reset(), dispose() }`.

- [ ] **Step 1: Write failing scene-contract tests** for board squares/pieces, search-tree nodes, cabinet/node/card/chip groups, signal segments, deterministic base poses, finite camera poses and no-op reset drift.
- [ ] **Step 2: Run the focused scene tests** and confirm the contract fails.
- [ ] **Step 3: Build one representative overview first**: chessboard plus two cabinets and a readable signal route; then add the tree, parallel workers, and chip cutaway as named groups.
- [ ] **Step 4: Refine hero geometry and material ownership**: add bevels and service seams to cabinets, real vent openings and rails to the selected node, connector/trace detail to the PCB, stepped package/pins/bond wires to the chip, and distinct metal/paint/plastic/paper/silicon material response; instance repeated parts and retain explicit disposal ownership.
- [ ] **Step 5: Add authored studio lighting and camera-distance targets** for overview, structure and close-up views; verify contact shadows, highlights and reflections reveal the model instead of masking errors.
- [ ] **Step 6: Implement progress-driven visibility/material fades and camera presets** using stored base transforms, cloned transition materials, and explicit reduced-motion final states; test door, rail, connector, board, chip and signal dependencies for clearance.
- [ ] **Step 7: Run scene tests** and inspect overview, tree, parallel and chip close-up in the browser at all three target distances.

### Task 3: Cassette-style archive terminal UI

**Files:**
- Create: `strategy/index.html`
- Create: `strategy/style.css`
- Create: `src/strategy/strategy-ui.js`
- Create: `src/strategy/main.js`
- Create: `tests/strategy-ui.test.mjs`

**Interfaces:**
- `createStrategyUI({ records, onRead, onProgress, onCommand })` owns cursor, active record, play/pause, step, scrub lock, keyboard commands and DOM readouts.
- `main.js` owns application state and connects UI commands to scene commands; the UI never mutates Three.js objects directly.

- [ ] **Step 1: Write failing UI tests** for cursor-vs-read separation, keyboard commands, play/step/scrub synchronization, focus restoration, reduced motion and archive index labels.
- [ ] **Step 2: Run the focused UI tests** and confirm failure.
- [ ] **Step 3: Create the semantic page shell** with shared Deep Blue project topbar, archive index, record sheet, native range timeline, playback controls and a Three.js canvas.
- [ ] **Step 4: Implement cassette-derived transitions**: only “读取” activates the scene, the active record remains solid while inactive layers ghost, and all readouts update from the single progress state.
- [ ] **Step 5: Add responsive CSS** with the record index as a drawer on narrow screens and no nested scroll areas; verify keyboard focus and reduced motion.
- [ ] **Step 6: Run UI tests** and use the browser to check the first chessboard-decision frame, each record read, timeline drag and reset.

### Task 4: Build and shared navigation integration

**Files:**
- Create: `scripts/build-strategy.mjs`
- Modify: `package.json`
- Modify: `review/index.html`
- Modify: `review/history.css`
- Modify: `prototype/index.html`
- Modify: `prototype/style.css`
- Create: `review/strategy/` generated build output

**Interfaces:**
- `npm run build` produces `review/strategy/index.html`, `style.css` and bundled `app.js`.
- 00, 01 and 02 each expose the same `project-nav` links with the current page marked by `aria-current="page"`.

- [ ] **Step 1: Add the strategy build step** and run it to confirm the generated route exists.
- [ ] **Step 2: Add the 02 navigation link** to all three source pages without changing existing page interactions.
- [ ] **Step 3: Build and validate** the source paths and encoded traversal rules.
- [ ] **Step 4: Run the full test suite and `git diff --check`.**

### Task 5: Browser acceptance and evidence

**Files:**
- Create: `tests/strategy-browser-checklist.md`
- Modify: `README.md` only if the project index needs the new 02 route documented.

- [ ] **Step 1: Start or reuse the local server on port 4175.**
- [ ] **Step 2: Verify 00 → 01 → 02 → 00 navigation and current-page highlighting.**
- [ ] **Step 3: Verify the 02 first view starts at the chessboard decision, then read records 2–6 and confirm synchronized camera/model/text states.**
- [ ] **Step 4: Verify reset, reverse stepping, timeline scrubbing, keyboard-only controls, reduced motion and narrow layout.**
- [ ] **Step 5: Capture a settled overview and a chip close-up, then report observed behavior separately from numerical tests and known teaching boundaries.**

