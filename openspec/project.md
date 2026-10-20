# 项目约定 · 布布 & 一二 桌宠

## 项目身份

- 名称：布布 & 一二 桌宠（DesktopPet）
- 双角色：一二（粉白女孩小熊猫，活泼"小太阳"，口头禅"开心最重要啦！"）+ 布布（棕黄男孩，憨厚行动派，"嗯，交给我吧。"）
- 设定来源：https://www.meipian.cn/5mpafj7y
- 呈现方式：表情贴图（PNG/JPG/GIF），不用 Live2D

## 技术栈

- Electron 33（透明窗口 + 气泡 UI）
- 模型：智谱 GLM，baseURL `https://open.bigmodel.cn/api/paas/v4`，默认 `glm-5.3-flash`
- 渲染层：原生 HTML/CSS/JS，无框架
- 进程间通信：contextBridge + ipcMain/ipcRenderer（`contextIsolation: true`, `nodeIntegration: false`）

## 素材命名

- 目录：`assets/pets/`
- 文件名：`<yier|bubu>-<情绪>.<ext>`，情绪集合：待机 / 开心 / 无语 / 惊讶 / 犯困
- 支持格式：png / jpg / jpeg / gif / webp
- 缺图时回退到该情绪的 emoji 占位，程序不崩
- 当前覆盖：yier 5 种齐；bubu 缺「犯困」

## 护栏

- 安静时段：默认 22:00–08:00，不主动搭话（`quietHours` 配置项）
- 定时搭话间隔：默认 20 分钟（`talkIntervalMin`）
- 单次用户输入截断：500 字（main.js hard-coded）
- 历史轮数上限：默认 10（`maxHistoryTurns`）
- 单次模型响应：max_tokens=300
- DevTools 打开时不触发定时搭话（防调试干扰）

## 配置

- 复制 `config.example.json` → `config.json`，填智谱 API Key
- `config.json` 含 Key，**永不进 git**
- 启动：`npm install` → `npm start`，或双击 `启动桌宠.cmd`

## git 约定

- 主分支：`main`
- commit message：`change NNNN: <one-line title>` 或 `chore: <title>`（非变更类维护）
- 不进 git：`node_modules/`、`config.json`、`usage.jsonl`、`.workbuddy/`
- 换行符：强制 LF（见 `.gitattributes`）

## spec-coding 约定

- 详见 `openspec/CONVENTIONS.md`
- 本项目未装 OpenSpec CLI，手搓约定，agent 自觉遵守

## 路线图（来自 REQUIREMENTS.md）

- M1 已开发：透明窗口 + 双角色 + 点击对话 + 定时搭话 + usage 记录
- M2：待办提醒（布布）
- M3：情绪状态机 + 短期记忆
- M4：每日早报 / 番茄钟 / 日记周报
- M5：养成系统 / 系统托盘 / 设置界面 / 开机自启
- 不做：小游戏、烧包模式
