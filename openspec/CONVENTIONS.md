# OpenSpec Spec-Coding 约定（手搓版）

> 本文件定义本项目的 spec-coding 工作流约定。所有 agent 和人贡献者都必须遵守。
> 本项目**未安装** `@fission-ai/openspec` CLI，纯手搓；约定参照 OpenSpec 标准制定，便于将来切换到原生 CLI。

## 1. 整体理念

- **specs 是当前真相，changes 是提议的变更**
- specs 跟代码一起进 git，跟着需求演进一起更新
- 先对齐规格再写码：动前必须起草 change proposal，经用户审后才实现
- baseline specs（M1 已实现的事实）直接进 `specs/`，不走 change 流程

## 2. 目录结构

```
openspec/
├── project.md              # 项目级约定（技术栈、护栏、命名、git 约定）
├── CONVENTIONS.md          # 本文件：spec-coding 工作流约定
├── specs/                  # 主规范：当前系统行为的权威基准（source of truth）
│   └── <capability>/
│       └── spec.md
├── changes/                # 提议中的变更（每个变更一个独立文件夹）
│   ├── TEMPLATE/           # 复制即用的模板
│   │   ├── proposal.md
│   │   ├── design.md
│   │   ├── tasks.md
│   │   └── specs/spec.md   # Delta 模板
│   └── archive/            # 已归档的变更（done 后挪进来）
└── (将来扩展：stores/ 等暂不引入)
```

## 3. 主 spec 文件形式

每个 capability 一个 `spec.md`，遵循：
- 用 **RFC 2119 关键字**：SHALL（必须）、SHOULD（应该）、MAY（可以）
- 用 **BDD scenario**：GIVEN / WHEN / THEN / AND 表达验收场景

骨架：

```markdown
# <Capability> Specification

## Purpose
<这个能力做什么>

## Requirements

### Requirement: <需求名>
The system SHALL <必须满足什么>.

#### Scenario: <场景名>
- GIVEN <前置>
- WHEN <动作>
- THEN <预期>
- AND <额外>
```

## 4. change 文件夹结构

每个变更一个文件夹，命名 `<NNNN>-<short-slug>-<YYYY-MM-DD>`（如 `0001-add-bubu-sleepy-2026-10-25`）。编号单调递增。

文件夹内必填：
- `proposal.md` — 为什么、做什么、范围、验收标准
- `tasks.md` — 实现任务清单（`- [ ]` 可勾选）

可选：
- `design.md` — 技术方案、关键决策（每个决策列：选项 A vs B → 选了哪个 → 为什么）
- `specs/<capability>/spec.md` — Delta：这个变更对主 spec 的修改

### Delta 形式

`specs/<cap>/spec.md` 用 `+` / `-` 行表达对主 spec 的增减，像 diff：

```
### Requirement: 定时搭话间隔
- The system SHALL chatter every 30 minutes by default.
+ The system SHALL chatter every 20 minutes by default, configurable via `talkIntervalMin`.
```

## 5. 工作流（5 步闭环）

1. **propose**：接到需求 → 复制 `TEMPLATE/` 建 `changes/NNNN-xxx/`，写 proposal + design（state: draft）
2. **review**：用户审 proposal/design → 通过后 state: in-review
3. **apply**：agent 按 `tasks.md` 实现，勾选完成项，state: applying
4. **verify**：实现+自验完，在 `proposal.md` 末尾补 Verification 节，state: done
5. **archive**：`git commit -m "change NNNN: <title>"` → 把 change 文件夹挪到 `archive/` → 把 delta 合并回 `specs/<cap>/spec.md`

## 6. 命名约定

- change 文件夹：`NNNN-short-slug-YYYY-MM-DD`
- capability：kebab-case，如 `transparent-window`、`character-talk`
- commit message：`change NNNN: <one-line title>`（变更类）或 `chore: <title>`（非变更类维护）

## 7. baseline 政策

- M1 baseline（2026-10-13 已实现的部分）于 2026-10-20 反向补录为 `openspec/specs/`，不走 change
- 后续演进（M2+）每个特性一个 change
- 若修复已实现能力的 bug，仍走 change（变更现有 spec）

## 8. agent 接手第一步

任何 agent 接手本项目时，必须按顺序读：
1. `AGENTS.md`（项目根，agent 入口）
2. `openspec/project.md`（项目约定）
3. `openspec/CONVENTIONS.md`（本文件，spec-coding 流程）
4. `REQUIREMENTS.md`（路线图，M1~M5 规划）
5. `openspec/specs/` 倒序看最近 3 个 capability spec
6. `openspec/changes/archive/` 倒序看最近 3 个已归档 change

## 9. 与原生 OpenSpec CLI 的差异

- 不装 `@fission-ai/openspec` CLI，没有 `openspec init/list/validate/show/archive` 命令
- 没有 `/openspec:propose` 等 slash command（CodeBuddy 原生支持但我们未启用）
- agent 自觉按本文件流程执行，校验靠人和 agent 复查
- 将来若装 CLI，本约定不冲突，可直接迁移
