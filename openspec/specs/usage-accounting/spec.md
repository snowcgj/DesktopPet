# usage-accounting Specification

## Purpose

记录每次 LLM 调用的 token 用量到 `usage.jsonl`，方便后续对账与可视化（M4 日记/周报基础）。

## Requirements

### Requirement: 日志路径（已实现）
The system SHALL write usage records to `usage.jsonl` at the project root.

### Requirement: 日志格式（已实现）
Each line SHALL be a JSON object with fields: `ts` (ISO 8601), `model`, `prompt_tokens`, `completion_tokens`, `total_tokens`.

#### Scenario: 单次调用记录
- GIVEN 模型调用返回，data.usage = { prompt_tokens: 236, completion_tokens: 171, total_tokens: 407 }
- WHEN logUsage 被调用
- THEN 向 usage.jsonl 追加一行 JSON
- AND 包含 ts (当前 ISO 时间)、model (当前 cfg.model)、三个 token 字段

### Requirement: 静默失败（已实现）
The system SHALL catch errors in logUsage silently; logging failures do not affect chat or chatter flows.

#### Scenario: 文件不可写
- GIVEN usage.jsonl 所在目录无写权限
- WHEN logUsage 尝试写入
- THEN 异常被吞掉
- AND 桌宠对话照常工作

### Requirement: 不进 git（已落实于 .gitignore）
The file `usage.jsonl` SHALL be listed in `.gitignore` and never committed.

#### Scenario: git status 检查
- GIVEN .gitignore 含 `usage.jsonl`
- WHEN git status 执行
- THEN usage.jsonl 不出现在未跟踪文件列表

### Requirement: 日志消费（M4 占位）
The system MAY provide tooling to aggregate usage.jsonl for daily/weekly reports in M4.

> **Note**：M1 baseline 仅实现写入，聚合分析留到 M4 日记/周报 change。
