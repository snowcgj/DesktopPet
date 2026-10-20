# character-talk Specification

## Purpose

用户点击任一桌宠角色后，弹出输入框与气泡，桌宠双角色（一二/布布）依据用户输入生成对话剧本，模型输出经过解析后逐条以气泡形式呈现，并联动角色表情。

## Requirements

### Requirement: 双角色设定
The system SHALL maintain two characters: 一二 (yier, female red panda) and 布布 (bubu, male), each with distinct personality and catchphrase.

#### Scenario: 系统提示词
- GIVEN 系统启动
- THEN 主进程持有一个 SYSTEM_PROMPT，描述两只角色性格、口头禅、输出格式
- AND 一二口头禅"开心最重要啦！"，布布口头禅"嗯，交给我吧。"

### Requirement: 角色点击触发对话（渲染层）
The renderer SHALL attach a click handler to each `.pet` element; clicking opens the chat input bar.

#### Scenario: 点击一二
- GIVEN 桌宠窗口已加载且渲染层脚本正常
- WHEN 用户点击 #yier
- THEN 显示 #chatBar 输入框
- AND 输入框获得焦点

### Requirement: 用户输入发送（渲染层）
The renderer SHALL send user text via `petApi.chat(text)` IPC when user presses Enter; Esc collapses the input bar.

#### Scenario: 输入并发送
- GIVEN 输入框可见
- WHEN 用户输入文字并按 Enter
- THEN 调用 `petApi.chat(text)`
- AND 输入框清空

#### Scenario: 输入截断
- GIVEN 用户输入超过 500 字
- WHEN 调用 `pet:chat` IPC
- THEN 主进程截断到 500 字
- AND 空输入返回 `{ ok: false, error: '空输入' }`

### Requirement: 模型调用（主进程，已实现）
The system SHALL call the configured GLM model at `<baseURL>/chat/completions` with Bearer auth, sending system prompt + recent history + user message.

#### Scenario: 正常调用
- GIVEN config.json 含有效 apiKey
- WHEN 用户发送消息
- THEN POST 请求发出，body 含 `model`, `messages`, `temperature: 0.9`, `max_tokens: 300`
- AND Authorization header 为 `Bearer <apiKey>`

#### Scenario: 缺 Key 友好提示
- GIVEN apiKey 为空或含"粘贴"字样
- WHEN 用户发送消息
- THEN 不发起 API 请求
- AND 返回预设剧本：一二"主人主人！config.json 里的 apiKey 还是空的！"（emotion: 惊讶）+ 布布"去智谱开放平台复制一把 Key 放进去就行。"（emotion: 待机）

### Requirement: 输出格式协议
The system prompt SHALL instruct the model to output 1–2 lines per response, each line formatted as `<角色>:<台词> [表情:<情绪>]`. Emotion set: 待机/开心/无语/惊讶/犯困. Each line ≤ 25 字.

### Requirement: 剧本解析（主进程，已实现）
The system SHALL parse model output via `parseScript()`, extracting `who`, `text`, `emotion` per line; lines not matching `^(一二|布布)\s*[:：]\s*(.+)$` are discarded. Default emotion when missing: 开心.

#### Scenario: 模型输出规范
- GIVEN 模型返回 `"一二：主人你好呀！ [表情:开心]\n布布：嗯，欢迎。"`
- WHEN parseScript 解析
- THEN 返回 `[{ who: 'yier', text: '主人你好呀！', emotion: '开心' }, { who: 'bubu', text: '嗯，欢迎。', emotion: '开心' }]`

#### Scenario: 解析失败
- GIVEN 模型返回非约定格式
- WHEN parseScript 解析
- THEN 返回空数组
- AND `pet:chat` 返回 `{ ok: false, error: '回复格式解析失败' }`

### Requirement: 历史上下文管理（主进程，已实现）
The system SHALL maintain an in-memory `history` array, sending the last `maxHistoryTurns * 2` messages (user+assistant pairs) to the model.

#### Scenario: 历史超限
- GIVEN maxHistoryTurns = 10
- WHEN history 累计超过 20 条
- THEN 截断保留最近 20 条

### Requirement: 气泡渲染（渲染层）
The renderer SHALL render bubbles via `petApi.onScript(cb)` callback; each script item produces a bubble positioned by `who` (yier 左上, bubu 右上, user 中上).

#### Scenario: 渲染角色气泡
- GIVEN 主进程发送 `pet:script` 事件
- WHEN 渲染层收到 script 数组
- THEN 为每条 `{ who, text, emotion }` 在 #bubbleLayer 创建 .bubble 元素
- AND class 包含 `yier` 或 `bubu`
- AND 应用 pop 动画

### Requirement: 表情联动（渲染层）
The renderer SHALL update the corresponding character's `<img>` src based on the script's `emotion` field, mapping emotion to asset path `<yier|bubu>-<emotion>.<ext>`.

#### Scenario: 一二切换为开心
- GIVEN script 含 `{ who: 'yier', emotion: '开心' }`
- THEN #yierImg 的 src 切换为 `../assets/pets/yier-开心.<ext>`

#### Scenario: 缺素材回退
- GIVEN 目标表情素材不存在
- THEN 隐藏 img，显示 .fallback 元素的 emoji 占位
- AND 程序不崩

### Requirement: 启动欢迎语（已实现）
The system SHALL send a welcome script to the renderer 800ms after `did-finish-load`.

#### Scenario: 首次加载完成
- GIVEN 窗口加载 index.html 完成
- WHEN 800ms 后
- THEN 主进程通过 `pet:script` 发送预设欢迎语：一二"主人主人！我们搬进你的桌面啦！٩(◕‿◕)۶"（emotion: 开心）+ 布布"嗯，以后就交给我们吧。"（emotion: 开心）
