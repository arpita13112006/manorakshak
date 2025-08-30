// ----- Utils: date key for "once per day" -----
const dateKey = () => new Date().toISOString().slice(0,10); // YYYY-MM-DD

// ----- Daily % logic: keep same for the day -----
async function getDailyPercent() {
  const key = `percent:${dateKey()}`;
  const fromStorage = localStorage.getItem(key);
  if (fromStorage) return Number(fromStorage);

  // pseudo calculation: pick a stable random 35..90
  const p = Math.floor(35 + Math.random() * 55);
  localStorage.clear(); // keep only today's
  localStorage.setItem(key, String(p));
  return p;
}

// ----- Quotes: 4 unique per day -----
const QUOTES = [
  "Bloom where you are planted 🌸",
  "Small steps every day 🪷",
  "Breathe. Focus. Grow 🌿",
  "Consistency creates miracles ✨",
  "Be calm like the lotus in muddy water 🌊",
  "You are stronger than your scroll 💪",
  "Choose what nourishes the mind ☀️",
  "Pause. Inhale peace, exhale stress 🧘♀️",
  "Your attention is your power 🔆",
  "Today, be kind to yourself 💛"
];


// ----- Pick 1 quote per day -----
function pickDailyQuote() {
  const key = `quote:${dateKey()}`;
  const cached = localStorage.getItem(key);
  if (cached) return cached;

  // pick a random quote
  const idx = Math.floor(Math.random() * QUOTES.length);
  const quote = QUOTES[idx];

  localStorage.setItem(key, quote);
  return quote;
}


// ----- Info message by percent -----
function infoByPercent(p){
  if (p >= 80) return "Today your recent feeds are positive — you're doing great! 🌞";
  if (p >= 60) return "Nice balance! Keep nurturing your mind. 🌼";
  if (p >= 40) return "Your feed is getting heavy. Want a mindful break? 🌿";
  return "A lot of negative content today. Try Calm Mode for a reset. 🧘";
}

// ----- Init UI -----
(async function init(){
  // Hamburger menu
  const menu = document.getElementById('menu');
  document.getElementById('hamburger').addEventListener('click', ()=> {
    menu.classList.toggle('hidden');
  });
  document.addEventListener('click', (e)=>{
    if (!menu.contains(e.target) && !e.target.closest('#hamburger')) {
      menu.classList.add('hidden');
    }
  });

  // Open analysis / dashboard pages
  const openPage = (file) => {
    const url = chrome?.runtime?.getURL ? chrome.runtime.getURL(file) : file;
    if (chrome?.tabs?.create) chrome.tabs.create({ url });
    else window.open(url, '_blank');
  };
  document.getElementById('openAnalysis').onclick = ()=> openPage('analysis.html');
  document.getElementById('openDashboard').onclick = ()=> openPage('frontend/dashboard.html');

  // View Dashboard button
  document.getElementById('viewDashboard').onclick = ()=> openPage('frontend/dashboard.html');

 const qWrap = document.getElementById('quotes');
  if (qWrap) {
    const div = document.createElement('div');
    div.className = 'quote';
    div.textContent = pickDailyQuote();
    qWrap.appendChild(div);
  }



  // Percent & ring
  const p = await getDailyPercent();
  document.getElementById('percentText').textContent = `${p}%`;
  const ringFill = document.getElementById('ringFill');
  ringFill.style.setProperty('--p', p); // conic-gradient uses --p

  // Info card
  document.getElementById('infoCard').textContent = infoByPercent(p);

  // Calm Mode: load + toggle with chrome.storage
  const calmToggle = document.getElementById('calmToggle');
  const calmState = document.getElementById('calmState');

  function setCalmState(on){
    calmToggle.checked = !!on;
    calmState.textContent = on ? "ON" : "OFF";
  }

  try {
    chrome.storage.local.get(['calmModeEnabled'], (res)=>{
      setCalmState(!!res.calmModeEnabled);
    });
  } catch (_) {
    // fallback
    const v = localStorage.getItem('calmModeEnabled') === 'true';
    setCalmState(v);
  }

  calmToggle.addEventListener('change', ()=>{
    const on = calmToggle.checked;
    setCalmState(on);
    try { chrome.storage.local.set({ calmModeEnabled: on }); }
    catch (_){ localStorage.setItem('calmModeEnabled', String(on)); }
  });
})();