# 布布 & 一二 桌宠

> Electron + LLM 驱动的桌宠

**状态**：M1 已实现 · M2–M5 规划中

<!-- 截图占位，M2 后补 -->

## 这是什么

一对常驻桌面右下角的桌宠：**布布** + **一二**。点击能聊天，定时会主动搭话，每次调用 token 用量都记账。不做小游戏、不用 Live2D、不烧包。

## 快速跑起来

前置：Node.js 18+

```bash
git clone https://github.com/snowcgj/DesktopPet.git
cd DesktopPet
npm install
cp config.example.json config.json   # 然后填入 API Key
npm start
```

也可以直接双击 `启动桌宠.cmd`。

**API Key**：默认走智谱开放平台 `open.bigmodel.cn`，Key 在该平台控制台获取，可调用 GLM 全系列模型（默认 `glm-5.3-flash`，可在 `config.json` 切换 `glm-5.3-flashx` 等）。

由于项目使用 OpenAI 兼容协议，理论上也可切换其他兼容厂商（DeepSeek、Moonshot、Qwen 等）：在 `config.json` 改 `baseURL` + `apiKey` + `model` 三项即可。**非智谱厂商未做实测**，遇到兼容问题需自行排查。

## 能做什么（M1 已实现）

| 能力 | 说明 |
|---|---|
| 透明置顶窗口 | 无边框、不占任务栏、右下角常驻、可拖拽 |
| 双角色对话 | 点击角色发消息，气泡 + 表情联动 |
| 定时搭话 | 默认 20 分钟一次，结合时间情境 + 话题种子 |
| Token 记账 | 每次调用写入 `usage.jsonl`，方便对账 |

## 路线图

| 里程碑 | 内容 | 状态 |
|---|---|---|
| M1 | 透明窗口 + 双角色 + 对话 + 搭话 + 记账 | ✅ |
| M2 | 待办提醒（布布） | ⏳ |
| M3 | 情绪状态机 + 短期记忆 | ⏳ |
| M4 | 早报 + 番茄钟 + 日记/周报 | ⏳ |
| M5 | 养成系统 + 托盘 + 设置 + 开机自启 | ⏳ |

完整路线图与素材约定见 [`REQUIREMENTS.md`](./REQUIREMENTS.md)。

## 目录结构

```
DesktopPet/
├── main.js / preload.js / renderer/    # Electron 三件套
├── assets/pets/                         # 角色表情贴图
├── openspec/                            # spec-coding 主目录
│   ├── CONVENTIONS.md                   # 工作流约定
│   ├── project.md                       # 项目级约定
│   ├── specs/<capability>/spec.md       # 当前系统行为真相
│   └── changes/                         # 变更提案 + 归档
├── AGENTS.md                            # agent 接手入口
├── REQUIREMENTS.md                      # 完整路线图
└── 启动桌宠.cmd
```

## 护栏

- 安静时段 22–8 不主动搭话
- 单次对话截断 500 字，模型响应 `max_tokens=300`
- `config.json`（含 API Key）和 `usage.jsonl` **永不进 git**

## 开发文档

- [`REQUIREMENTS.md`](./REQUIREMENTS.md) — 完整路线图与素材约定
- [`AGENTS.md`](./AGENTS.md) — agent 接手入口（护栏、缺陷、跨项目偏好）
- [`openspec/CONVENTIONS.md`](./openspec/CONVENTIONS.md) — spec-coding 5 步闭环工作流
- [`openspec/project.md`](./openspec/project.md) — 技术栈、命名、git 约定
- [`openspec/specs/`](./openspec/specs) — 当前系统行为真相（4 个 capability spec）
- [`openspec/changes/archive/`](./openspec/changes/archive) — 已归档变更记录
