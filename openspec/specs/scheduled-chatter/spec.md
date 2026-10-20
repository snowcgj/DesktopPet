# scheduled-chatter Specification

## Purpose

桌宠在非安静时段按配置间隔主动发起对话，结合当前时间情境与话题种子生成自然搭话，让桌宠有"主动陪伴"感而非被动应答。

## Requirements

### Requirement: 定时器（主进程，已实现）
The system SHALL maintain a `talkTimer` interval, firing every `talkIntervalMin` minutes (default 20).

#### Scenario: 启动定时器
- GIVEN app `ready`
- WHEN createWindow() 完成
- THEN 调用 scheduleTalk() 启动 setInterval
- AND 间隔为 `max(5, talkIntervalMin) * 60 * 1000` 毫秒

### Requirement: 安静时段豁免（主进程，已实现）
The system SHALL skip chatter during `quietHours` (default 22:00–08:00).

#### Scenario: 夜间不搭话
- GIVEN 当前时间在 22:00–08:00 内
- WHEN talkTimer 触发
- THEN 直接返回，不调用 LLM

#### Scenario: 跨午夜区间
- GIVEN quietHours = [22, 8]
- WHEN 当前 23:30 或 03:00
- THEN 不搭话

#### Scenario: 白天正常时段
- GIVEN 当前时间 14:00
- WHEN talkTimer 触发
- THEN 继续后续流程

### Requirement: DevTools 检测豁免（主进程，已实现）
The system SHALL skip chatter when DevTools is open on the main window.

#### Scenario: 调试中不打扰
- GIVEN win.webContents.isDevToolsOpened() === true
- WHEN talkTimer 触发
- THEN 直接返回

### Requirement: 时间情境注入（主进程，已实现）
The system SHALL construct a context string with current hour, minute, weekday, and a randomly picked topic seed.

#### Scenario: 构造上下文
- GIVEN 当前 14:30 星期三
- WHEN talkTimer 触发
- THEN 构造 user message: "现在是14点30分，星期三。请结合这个时间感和话题种子「<随机种子>」主动和主人搭一句话。"
- AND TOPIC_SEEDS 包含: '今天的天气','主人的坐姿','下午茶吃什么','夸夸主人','一个冷知识','周末计划','摸鱼小侦探','晚饭吃什么','今天的心情','桌上的小摆件'

### Requirement: 主动搭话历史标记（主进程，已实现）
The system SHALL push history with a system marker so future model calls know the user did not actually input.

#### Scenario: 历史写入
- GIVEN 主动搭话生成 raw 回复
- THEN history.push({ role: 'user', content: '（系统提示：这是桌宠的主动搭话，主人没有输入）' })
- AND history.push({ role: 'assistant', content: raw })

### Requirement: 静默失败（主进程，已实现）
The system SHALL catch errors in the chatter loop silently; failures do not crash the timer.

#### Scenario: 网络异常
- GIVEN LLM 调用失败
- WHEN talkTimer 触发
- THEN 异常被 try/catch 吞掉
- AND 下个间隔继续尝试

### Requirement: 失败时不打扰（主进程，已实现）
The system SHALL NOT show error bubbles for chatter failures (unlike user-initiated chat).

#### Scenario: 失败静默
- GIVEN 主动搭话失败
- THEN 不向渲染层发送任何 script
- AND 不向用户展示错误
