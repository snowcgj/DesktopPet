const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');

const CONFIG_PATH = path.join(__dirname, 'config.json');
const USAGE_PATH = path.join(__dirname, 'usage.jsonl');
const ASSETS_DIR = path.join(__dirname, 'assets', 'pets');

const DEFAULTS = {
  apiKey: '',
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  model: 'glm-5.3-flash',
  talkIntervalMin: 20,
  quietHours: [22, 8],
  maxHistoryTurns: 10
};

function loadConfig() {
  try {
    return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) };
  } catch {
    return { ...DEFAULTS };
  }
}

function inQuietHours(cfg) {
  const [s, e] = cfg.quietHours || [22, 8];
  const h = new Date().getHours();
  if (s === e) return false;
  return s > e ? h >= s || h < e : h >= s && h < e;
}

function logUsage(usage, model) {
  if (!usage) return;
  try {
    fs.appendFileSync(USAGE_PATH, JSON.stringify({
      ts: new Date().toISOString(),
      model,
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      total_tokens: usage.total_tokens
    }) + '\n');
  } catch { /* 日志失败不影响运行 */ }
}

const SYSTEM_PROMPT = `你是生活在主人电脑屏幕角落的一对桌宠：一二和布布。
【一二】粉白色的女孩小熊猫，活泼开朗的"小太阳"，主人身边的开心果，热爱一切粉色事物，梦想收集世界上所有可爱的帽子。说话元气、软萌、爱用颜文字，口头禅是"开心最重要啦！"
【布布】棕黄色的男孩，外表憨厚、内心细腻的行动派，话不多但特别可靠，总在默默照顾主人。说话简短、稳重、偶尔冷幽默，口头禅是"嗯，交给我吧。"
输出规则（必须严格遵守）：
1. 每次回复输出一到两行，每行格式为：
一二：<台词> [表情:开心|无语|惊讶|犯困]
布布：<台词> [表情:开心|无语|惊讶|犯困]
2. 台词每条不超过 25 个字，口语化，符合各自性格；两只可以互相接话、吐槽或补充。
3. 只输出台词行，不要任何解释、引号或 markdown。`;

const TOPIC_SEEDS = [
  '今天的天气', '主人的坐姿', '下午茶吃什么', '夸夸主人', '一个冷知识',
  '周末计划', '摸鱼小侦探', '晚饭吃什么', '今天的心情', '桌上的小摆件'
];

let history = [];
let win = null;
let talkTimer = null;

function buildMessages(userContent) {
  const cfg = loadConfig();
  const msgs = [{ role: 'system', content: SYSTEM_PROMPT }];
  msgs.push(...history.slice(-(cfg.maxHistoryTurns || 10) * 2));
  if (userContent) msgs.push({ role: 'user', content: userContent });
  return msgs;
}

async function callLLM(userContent) {
  const cfg = loadConfig();
  if (!cfg.apiKey || cfg.apiKey.includes('粘贴')) throw new Error('NO_KEY');
  const res = await fetch(cfg.baseURL.replace(/\/$/, '') + '/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` },
    body: JSON.stringify({
      model: cfg.model,
      messages: buildMessages(userContent),
      temperature: 0.9,
      max_tokens: 300
    })
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  logUsage(data.usage, cfg.model);
  return { raw: data.choices[0].message.content, usage: data.usage };
}

function parseScript(raw) {
  const lines = String(raw).split('\n').map((l) => l.trim()).filter(Boolean);
  const out = [];
  for (const line of lines) {
    const cleaned = line.replace(/^[-*•]\s*/, '');
    const m = cleaned.match(/^(一二|布布)\s*[:：]\s*(.+)$/);
    if (!m) continue;
    const em = m[2].match(/[【\[]\s*表情\s*[:：]\s*([^\]】]+)\s*[\]】]/);
    const text = m[2].replace(/[【\[]\s*表情\s*[:：][^\]】]*[\]】]/g, '').trim();
    out.push({
      who: m[1] === '一二' ? 'yier' : 'bubu',
      text,
      emotion: em ? em[1].trim() : '开心'
    });
  }
  return out;
}

function pushHistory(userText, assistantRaw) {
  history.push({ role: 'user', content: userText });
  history.push({ role: 'assistant', content: assistantRaw });
  const cfg = loadConfig();
  const max = (cfg.maxHistoryTurns || 10) * 2;
  if (history.length > max) history = history.slice(-max);
}

function listAssets() {
  const map = { yier: {}, bubu: {} };
  try {
    for (const f of fs.readdirSync(ASSETS_DIR)) {
      const m = f.match(/^(yier|bubu)-(待机|开心|无语|惊讶|犯困)\.(png|jpe?g|gif|webp)$/i);
      if (m) map[m[1].toLowerCase()][m[2]] = '../assets/pets/' + f;
    }
  } catch { /* 无素材时用 emoji 兜底 */ }
  return map;
}

function scheduleTalk() {
  clearInterval(talkTimer);
  const cfg = loadConfig();
  const ms = Math.max(5, cfg.talkIntervalMin || 20) * 60 * 1000;
  talkTimer = setInterval(async () => {
    if (inQuietHours(loadConfig())) return;
    if (win && !win.isDestroyed() && win.webContents.isDevToolsOpened()) return;
    try {
      const now = new Date();
      const seed = TOPIC_SEEDS[Math.floor(Math.random() * TOPIC_SEEDS.length)];
      const ctx = `现在是${now.getHours()}点${String(now.getMinutes()).padStart(2, '0')}分，星期${'日一二三四五六'[now.getDay()]}。请结合这个时间感和话题种子「${seed}」主动和主人搭一句话。`;
      const { raw, usage } = await callLLM(ctx);
      pushHistory('（系统提示：这是桌宠的主动搭话，主人没有输入）', raw);
      const script = parseScript(raw);
      if (script.length && win && !win.isDestroyed()) win.webContents.send('pet:script', script);
    } catch { /* 静默失败，下次再试 */ }
  }, ms);
}

ipcMain.handle('pet:assets', () => listAssets());

ipcMain.handle('pet:chat', async (_e, text) => {
  const userText = String(text || '').slice(0, 500).trim();
  if (!userText) return { ok: false, error: '空输入' };
  try {
    const { raw, usage } = await callLLM(userText);
    pushHistory(userText, raw);
    const script = parseScript(raw);
    return script.length ? { ok: true, script } : { ok: false, error: '回复格式解析失败' };
  } catch (err) {
    const msg = String(err.message || err);
    if (msg.includes('NO_KEY')) {
      return { ok: true, script: [
        { who: 'yier', text: '主人主人！config.json 里的 apiKey 还是空的！', emotion: '惊讶' },
        { who: 'bubu', text: '去智谱开放平台复制一把 Key 放进去就行。', emotion: '待机' }
      ] };
    }
    return { ok: false, error: msg };
  }
});

ipcMain.on('pet:quit', () => { win = null; app.quit(); });

function createWindow() {
  win = new BrowserWindow({
    width: 480,
    height: 380,
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  const { workArea } = screen.getPrimaryDisplay();
  win.setPosition(workArea.x + workArea.width - 488, workArea.y + workArea.height - 388);
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.webContents.on('did-finish-load', () => {
    setTimeout(() => {
      if (win && !win.isDestroyed()) {
        win.webContents.send('pet:script', [
          { who: 'yier', text: '主人主人！我们搬进你的桌面啦！٩(◕‿◕)۶', emotion: '开心' },
          { who: 'bubu', text: '嗯，以后就交给我们吧。', emotion: '开心' }
        ]);
      }
    }, 800);
  });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) { win.show(); win.focus(); }
  });
  app.whenReady().then(() => {
    createWindow();
    scheduleTalk();
  });
  app.on('window-all-closed', () => app.quit());
}
