# AGENTS.md · 布布 & 一二 桌宠

> 本文件是任何 AI agent 接手本项目时的入口指引。OpenSpec AGENTS.md 兼容工具会自动读取本文件。

## 第一步：读这些文件

任何 agent 接手时按顺序读：

1. **本文件**（`AGENTS.md`）
2. `openspec/project.md` — 项目身份、技术栈、护栏、命名约定
3. `openspec/CONVENTIONS.md` — spec-coding 工作流（**必读，每次干活前**）
4. `REQUIREMENTS.md` — 路线图（M1 已实现，M2~M5 规划）
5. `openspec/specs/` 倒序看最近 3 个 capability spec — 当前系统行为真相
6. `openspec/changes/archive/` 倒序看最近 3 个已归档 change — 最近改了什么

## 工作流（一句话版）

任何非 trivial 改动必须走 spec-coding 5 步闭环：
**propose → review → apply → verify → archive**

详见 `openspec/CONVENTIONS.md`。

trivial 改动（typo、依赖升级）可直接 commit，commit message 用 `chore: <title>`。

## 护栏（不可逾越）

- 安静时段 22–8 不主动搭话
- 单次对话截断 500 字
- `config.json` 含智谱 API Key，**永不进 git**
- `usage.jsonl` 不进 git
- `node_modules/` 不进 git
- 单次模型响应 max_tokens=300

## 当前已知缺陷（M1 baseline）

- 布布缺「犯困」表情素材（M3 补）

## git 远程

- GitHub: https://github.com/snowcgj/DesktopPet.git
- 主分支：`main`
- commit 前先 `npm install` 确认依赖装好；commit 时确保 `config.json` 与 `usage.jsonl` 不被加入

## 跨项目偏好

- 公共规则：见 `D:\AgentKit\rules\common.md`（跨项目偏好，AI 在每个新任务开始时读取并遵循）
