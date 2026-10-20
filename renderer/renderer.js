const imgEl = {
  yier: document.getElementById('yierImg'),
  bubu: document.getElementById('bubuImg')
};
const fallbackEl = {
  yier: document.querySelector('#yier .fallback'),
  bubu: document.querySelector('#bubu .fallback')
};
const bubbleLayer = document.getElementById('bubbleLayer');
const chatBar = document.getElementById('chatBar');
const chatInput = document.getElementById('chatInput');

const EMOJI = {
  yier: { 待机: '🐣', 开心: '😊', 无语: '😤', 惊讶: '😲', 犯困: '😴' },
  bubu: { 待机: '🧸', 开心: '😌', 无语: '🤐', 惊讶: '😮', 犯困: '😪' }
};

let ASSETS = { yier: {}, bubu: {} };
let playToken = 0;

function setEmotion(who, emotion) {
  const map = ASSETS[who] || {};
  const file = map[emotion] || map['待机'];
  if (file) {
    imgEl[who].style.display = '';
    fallbackEl[who].style.display = 'none';
    imgEl[who].onerror = () => {
      imgEl[who].style.display = 'none';
      fallbackEl[who].style.display = 'block';
      fallbackEl[who].textContent = EMOJI[who][emotion] || EMOJI[who]['待机'];
    };
    imgEl[who].src = file;
  } else {
    imgEl[who].style.display = 'none';
    fallbackEl[who].style.display = 'block';
    fallbackEl[who].textContent = EMOJI[who][emotion] || EMOJI[who]['待机'];
  }
}

function showBubble(who, text, ms) {
  const el = document.createElement('div');
  el.className = 'bubble ' + who;
  el.textContent = text;
  bubbleLayer.appendChild(el);
  setTimeout(() => {
    el.classList.add('closing');
    setTimeout(() => el.remove(), 260);
  }, ms);
}

function showUserBubble(text) {
  const el = document.createElement('div');
  el.className = 'bubble user';
  el.textContent = '主人：' + text;
  bubbleLayer.appendChild(el);
  setTimeout(() => {
    el.classList.add('closing');
    setTimeout(() => el.remove(), 260);
  }, 3600);
}

function showErrorBubble(text) {
  const el = document.createElement('div');
  el.className = 'bubble error';
  el.style.left = '50%';
  el.style.transform = 'translateX(-50%)';
  el.style.bottom = '210px';
  el.textContent = '出错了：' + text;
  bubbleLayer.appendChild(el);
  setTimeout(() => {
    el.classList.add('closing');
    setTimeout(() => el.remove(), 260);
  }, 5000);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function showScript(script) {
  const token = ++playToken;
  for (const line of script) {
    if (token !== playToken) return;
    setEmotion(line.who, line.emotion || '开心');
    showBubble(line.who, line.text, 1400 + Math.min(line.text.length, 60) * 160);
    await sleep(1400 + Math.min(line.text.length, 60) * 160 + 300);
  }
  if (token === playToken) {
    setEmotion('yier', '待机');
    setEmotion('bubu', '待机');
  }
}

let busy = false;
async function sendChat() {
  const text = chatInput.value.trim();
  if (!text || busy) return;
  chatInput.value = '';
  showUserBubble(text);
  busy = true;
  setEmotion('yier', '惊讶');
  const res = await window.petApi.chat(text);
  busy = false;
  if (res.ok) {
    await showScript(res.script);
  } else {
    setEmotion('bubu', '无语');
    showErrorBubble(res.error || '未知错误');
  }
}

for (const who of ['yier', 'bubu']) {
  document.getElementById(who).addEventListener('click', () => {
    chatBar.classList.toggle('hidden');
    if (!chatBar.classList.contains('hidden')) chatInput.focus();
  });
}

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendChat();
  if (e.key === 'Escape') chatBar.classList.add('hidden');
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') chatBar.classList.add('hidden');
});

document.getElementById('quit').addEventListener('click', () => window.petApi.quit());

window.petApi.onScript(showScript);

(async function init() {
  ASSETS = await window.petApi.getAssets();
  setEmotion('yier', '待机');
  setEmotion('bubu', '待机');
})();
