# transparent-window Specification

## Purpose

桌宠以透明、无边框、置顶、不占任务栏的独立窗口形式常驻用户桌面右下角，作为承载两只角色形象与气泡 UI 的容器。

## Requirements

### Requirement: 窗口透明无边框
The system SHALL create a BrowserWindow with `transparent: true`, `frame: false`, `hasShadow: false`.

#### Scenario: 启动后呈现透明窗口
- GIVEN 用户运行 `npm start` 或双击 `启动桌宠.cmd`
- WHEN Electron app 进入 `ready` 状态
- THEN 创建一个透明、无边框、无阴影的 BrowserWindow
- AND 加载 `renderer/index.html`

### Requirement: 始终置顶
The system SHALL keep the window always on top at the `screen-saver` z-level.

#### Scenario: 其他窗口最大化时不被遮挡
- GIVEN 桌宠窗口已创建
- WHEN 用户切换到其他应用全屏
- THEN 桌宠窗口仍可见（置顶）
- AND 通过 `win.setAlwaysOnTop(true, 'screen-saver')` 实现

### Requirement: 不占任务栏
The system SHALL set `skipTaskbar: true` so the window does not appear in the OS taskbar.

### Requirement: 不可调整大小
The system SHALL set `resizable: false` and use a fixed size of 480×380.

### Requirement: 定位到屏幕右下角
The system SHALL position the window at the bottom-right of the primary display's work area, with an 8px inner margin.

#### Scenario: 多显示器主屏定位
- GIVEN 主显示器的工作区为 (x, y, w, h)
- THEN 窗口左上角坐标为 (x + w - 488, y + h - 388)

### Requirement: 单实例
The system SHALL acquire a single-instance lock; if a second instance launches, it SHALL quit and focus the existing window.

#### Scenario: 二次启动
- GIVEN 已有一个桌宠实例运行
- WHEN 用户再次启动 `npm start`
- THEN 新实例立即退出
- AND 已有窗口被 show + focus

### Requirement: 可拖拽
The renderer SHALL mark the body as `-webkit-app-region: drag`, allowing the user to drag the window by clicking on empty areas.

#### Scenario: 拖动桌宠到任意位置
- GIVEN 桌宠窗口已显示
- WHEN 用户在窗口空白处按住左键拖动
- THEN 窗口跟随移动
- AND 退出按钮、输入框、角色点击区不响应拖拽（`-webkit-app-region: no-drag`）

### Requirement: 退出按钮
The renderer SHALL render a quit button (×) in the top-right, visible on hover, sending `pet:quit` IPC to main.

#### Scenario: 鼠标移入显示退出按钮
- GIVEN 窗口已显示
- WHEN 鼠标进入窗口区域
- THEN 退出按钮 opacity 从 0 渐变到 0.7
- AND 鼠标移开时回到 0

#### Scenario: 点击退出按钮
- GIVEN 退出按钮可见
- WHEN 用户点击 ×
- THEN 主进程收到 `pet:quit` IPC
- AND 主进程调用 `app.quit()`

### Requirement: 启动加载顺序
The renderer SHALL load `renderer.js` after the DOM, which initializes asset loading, click handlers, bubble rendering, and IPC listeners.

#### Scenario: 加载完成初始化
- GIVEN index.html 第 29 行 `<script src="renderer.js">`
- WHEN DOM 解析到该 script
- THEN 渲染层脚本执行
- AND 调用 `petApi.getAssets()` 加载素材映射
- AND 注册 `petApi.onScript(cb)` 监听主进程剧本推送
