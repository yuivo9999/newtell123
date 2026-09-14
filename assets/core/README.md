# 核心模块

这里存放与 UI / AI 供应商解耦、可以独立测试的故事工程规则。当前采用原生 ES Modules，旧 UI 仍通过窄 runtime bridge 渐进迁移。

## 模块

- `ai-client.js`：AI provider transport，统一 fetch / abort / OpenAI-compatible 请求。
- `ai-json.js`：AI JSON/text 提取与容错解析。
- `ai-contract.js`：AI Contract / Validator 边界与结构化调用约束。
- `time-utils.js`：纯时间计算工具。
- `chapter-time.js`：章节计划时间、时间覆盖合同、时间表达审计。
- `story-contract.js`：章节合同、计划/正文状态的结构化规则。
- `teacher-card.js`：老师章节卡解析与校验。
- `story-structure.js`：全书结构、叙事团队与章节规模模型。
- `school-planner.js`：学校分组与老师负责章节规划。
- `story-state.js`：章节计划状态、教师章节卡、观察状态与权威边界。
- `chapter-audit.js`：正文状态结算、AI 审计、最小修复与章节最终结算。
- `runtime-audit.js`：运行时只读审计层。

## 当前边界

1. `planned` 与 `observed` 必须分离，正文观测不能反写计划真相。
2. 多日章节必须真正抵达计划终点，不能把多日剧情压缩成一两天的连续场景。
3. UI、持久化和旧全局状态暂时仍在 `app-legacy.js`；核心模块通过窄 bridge 访问它们，避免一次性迁移造成回归。
4. AI transport、结构化 Contract、章节审计与故事状态分层，后续可逐步替换 legacy orchestration。

- `chapter-glossary.js` — chapter-scoped glossary selection, roll-call, fog-world injection, and glossary formatting helpers.
- `glossary-pipeline.js`：词典 AI 提取、字段校验、清洗、合并与正文覆盖率扫描；保留 legacy UI 作为调用方。
- `glossary-pipeline.js`：词典 AI 提取、字段校验、清洗、合并与正文覆盖率扫描；保留 legacy UI 作为调用方。

- `glossary-pipeline.js`：词典 AI 提取、字段校验、清洗、合并与正文覆盖率扫描；保留 legacy UI 作为调用方。

- `dict-master.js` — 词典达人提示词构建与 AI 输出结构校验；UI/AI orchestration 保留在 legacy。

### `subplot-pipeline.js`
副线 AI 数据管线：`SUBPROGRESS_UPDATE_SYS`、`validateSubplotOutput`、`extractSubplotUpdates`、`mergeSubplotUpdates`。正文批量扫描与 toast/background-task UI orchestration 继续留在 `app-legacy.js`。

- `chapter-output.js` — 正文输出清洗、节拍标记剥离、本章出场人物尾注分离。

- `chapter-compare.js` — chapter A/B style comparison generation orchestration; UI rendering and selection remain in `app-legacy.js`.

- `chapter-batch-runner.js` — batch chapter generation lifecycle/state orchestration; legacy retains only UI callbacks and compatibility wiring.

## v39 Core Domain Cohesion

`core/` now treats the ten `*-domain.js` files as the canonical runtime boundaries:

- `ai-domain` — AI client/contracts/infrastructure, idea polish, recipes, narrative AI
- `story-domain` — story contracts/state/structure, outline/subplot/planner audit
- `chapter-domain` — chapter planning, memory/context/prompt, generation, review, reader and navigation
- `dictionary-domain` — glossary + master dictionary + enrichment workspaces
- `school-domain` — school planner/pipeline
- `project-domain` — project state/history/FYP
- `workspace-domain` — assets, colors/theme, writing style, export workspace
- `narrative-domain` — narrative shell/controls/history
- `settings-domain` — settings, task models, groups, settings editors/tests
- `runtime-domain` — boot/runtime foundation and entrypoint

The former leaf files remain compatibility seams for historical tests and downstream callers. They are no longer independent runtime regions: each is registered and installed through its owning domain, and the domain publishes one cohesive API through `window.TellMeLegacyDomains`.


## v40 Domain Ownership Closure

v40 completes the next migration stage without introducing a new domain or another layer of leaf files:

- `app-legacy.js` is now a compatibility/UI shell; major prompt/config tables and mutable domain state are no longer defined there.
- The ten existing domains expose `legacyContext` for the remaining lexical compatibility surface. `app.js` assembles `window.TellMeLegacyShared` before loading the legacy UI.
- Legacy wrappers now call `window.TellMeLegacyDomains[...]` (canonical domain APIs) instead of addressing `TellMeLegacyRegions` directly. The older region registry remains only as a compatibility seam for leaf modules/tests.
- Chapter, dictionary, AI, workspace, school, story, narrative, settings and project constants/state were moved into their existing domains; no new domain was created.
- `chapter-generation-controls.js` also fixes the migrated mutable batch-size setter path to call `setGenBatchN(...)` rather than assigning to a getter expression.
- `tests/v40-domain-state.cjs` verifies domain ownership and canonical-domain routing.

The remaining `app-legacy.js` code is intentionally retained where it is genuinely UI/event orchestration, boot-time compatibility glue, or still depends on lexical legacy callbacks. Further reduction should be driven by dependency ownership, not by creating smaller files.

## v43 Semantic contract hardening

v43 completes the remaining semantic-boundary pass rather than further reducing file count:
- `story-contract.js` is now the canonical pure time-contract implementation; chapter-time and teacher-card reuse it instead of duplicating date parsing/span logic.
- Multi-day chapter plans must explicitly reach the planned endpoint in the beat skeleton; date markers cannot rewind.
- Chapter contract audits now compare the current chapter against the previous chapter planned endpoint, catching cross-chapter time rewind.
- Global timeline vs teacher-plan time conflicts are surfaced explicitly; when both exist, the global timeline is the authoritative source instead of silently mixing the two.
- `runtime-audit` schema is v4 and persists the strengthened contract result.
- `tests/v43-semantic-contract.cjs` covers multi-day endpoint coverage, cross-chapter rewind, canonical parser reuse, and semantic contract behavior.
- Static ESM cycle audit must remain acyclic.

## v41 Same-category consolidation

v41 performs the final same-category consolidation pass inside the canonical domains. The goal is not to minimize file count blindly, but to remove migration-era micro-modules whose responsibilities already form one cohesive runtime area.

Consolidated areas:
- `ai-core.js`: AI transport, JSON parsing, and AI contract helpers.
- `chapter-generation.js`: chapter generation, single/batch orchestration, continuation, comparison, generation controls, legacy single/batch bridges, and output normalization.
- `project-state.js`: project state, history, and FYP import/export.
- `settings-core.js`: settings core, group editor/save-test, and group list rendering.
- `dict-master.js`: dictionary master core, generation, and workspace.
- `dict-enrich.js`: dictionary enrichment composition and workspace.
- `narrative-workspace.js`: narrative shell, controls, and history panel.
- `workspace-assets.js`: asset generation and asset history.

The canonical domain files remain the runtime boundaries. The old leaf paths above are retired rather than retained as empty compatibility files, so the core folder no longer contains migration-era duplicate entrypoints.

v41 result: `assets/core` is reduced from 82 JavaScript files to 61 JavaScript files (README excluded), while preserving the ten canonical domains. `tests/v41-consolidation.cjs` verifies retired paths are absent, canonical domain loading remains in `app.js`, consolidated namespaces expose their expected APIs, and the merged modules pass syntax validation.


## v42 boundary hardening

- Audited all canonical Domain entrypoints for cross-domain coupling.
- Cross-domain runtime calls now resolve through `window.TellMeLegacyDomains[domain]`; Domain code no longer reaches into `TellMeLegacyRegions` by leaf name.
- `TellMeLegacyRegions` remains only as an internal leaf-installation registry for compatibility modules.
- Audited `final-ui-bridge.js` repository references; no runtime or test consumer remained, so the dead bridge was removed.
- Added architecture checks for domain dependency direction and forbidden cross-domain leaf-registry access.


## v44 Architecture hardening

- `domain-capabilities.js` makes cross-domain runtime calls explicit through one capability boundary while retaining the browser registry as a compatibility bridge.
- `authority-contract.js` centralizes creator/authority/provenance metadata for canon, chapter plans, prose execution and observed state.
- `state-contract.js` makes observed chapter state versioned and validates that state AI is the sole observed-state writer.
- `story-contract.js` is now contract version 3 and remains the canonical pure story/time contract.
- `runtime-audit.js` schema is v5 and validates observed-state contract metadata as part of chapter audits.
- The next migration target is reducing direct use of `TellMeLegacyDomains`; the registry is now explicitly treated as a compatibility bridge, not a business API.


## v45 Governance hardening

- `canon-contract.js` formalizes provenance and authority for characters, places, proper nouns, relationships, contacts, and world rules.
- `state-contract.js` is version 2 and includes observed-state migration plus cross-chapter state-time rewind checks.
- `story-contract.js` is version 4 and remains the canonical chapter/time contract.
- `runtime-audit.js` is schema v6 and audits canon facts, observed state, and state transitions.
- `story-state.js` normalizes/protects canonical fact graphs and exposes a canon validation gate.
- `dict-master.js` now refuses to commit malformed canonical facts.
- Build/lint remain real executable gates; regression suite now includes v45 governance checks.

## v46 Governance hardening

- Added explicit capability allow-list enforcement; `TellMeLegacyDomains` remains compatibility-only.
- Added canonical fact lifecycle (`DRAFT → PROPOSED → APPROVED → LOCKED → SUPERSEDED`).
- Added conflict engine for canon mutation and canon-vs-observed conflicts.
- Added chapter timeline contract with explicit missing-day detection.
- Added observed-state evidence records for chapter/scene provenance.
- Canon and mutable runtime state remain separate; state validation now uses contract v3.
- Added architecture-layer tests and Node's built-in test runner; `npm test` is independent from build.
- Runtime audit schema is now v7.
