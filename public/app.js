import { WORLDS, QUESTIONS } from "./questions.js";
import { SIGNS } from "./signs.js";
import { offlineCoachReply } from "./coach-offline.js";
import { API_BASE } from "./config.js";

// ───────────────────────── Lagring ─────────────────────────
const STORE_KEY = "korkortskompis-v1";
const defaultState = () => ({
  xp: 0,
  streak: 0,
  lastDay: null,
  todayXp: 0,
  todayDate: null,
  dailyGoal: 50,
  cards: {}, // id -> { box, right, wrong, due }
  badges: [],
  totalCorrect: 0,
  lessons: 0,
  bestBlitz: 0,
  examsPassed: 0,
  coachMsgs: 0,
  settings: { bigText: false, easyRead: false, contrast: false, autoRead: false, sound: true, theme: "auto" },
  chat: [],
});
let state = load();
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s) return { ...defaultState(), ...s, settings: { ...defaultState().settings, ...s.settings } };
  } catch { /* tom */ }
  return defaultState();
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* privat läge */ }
}

const $ = (sel, el = document) => el.querySelector(sel);
const app = $("#app");
const today = () => new Date().toISOString().slice(0, 10);
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fmt = (s) => escapeHtml(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/^#{1,3} (.*)$/gm, "<b>$1</b>").replace(/^[-*] /gm, "• ");
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ───────────────────────── Nivåer, XP, streak ─────────────────────────
const levelFromXp = (xp) => {
  let lvl = 1, need = 100, rest = xp;
  while (rest >= need) { rest -= need; lvl++; need = 100 + (lvl - 1) * 50; }
  return { lvl, into: rest, need };
};
const TITLES = ["Övningsbil", "Nybörjare", "Lärling", "Vägvan", "Säker förare", "Trafikproffs", "Vägkung", "Körkortslegend"];
const title = (lvl) => TITLES[Math.min(TITLES.length - 1, Math.floor((lvl - 1) / 2))];

function touchDay() {
  const d = today();
  if (state.todayDate !== d) { state.todayDate = d; state.todayXp = 0; }
  if (state.lastDay === d) return;
  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  state.streak = state.lastDay === y ? state.streak + 1 : 1;
  state.lastDay = d;
  if (state.streak > 1) toast(`🔥 ${state.streak} dagar i rad!`);
}
function addXp(n) {
  const before = levelFromXp(state.xp).lvl;
  state.xp += n;
  state.todayXp += n;
  const after = levelFromXp(state.xp).lvl;
  if (after > before) { toast(`🎉 Ny nivå: ${after} – ${title(after)}!`); confetti(); sound("level"); }
  updateTopbar();
}
function updateTopbar() {
  $("#streak").textContent = state.streak;
  $("#xp").textContent = state.xp;
}

// ───────────────────────── Spaced repetition (Leitner) ─────────────────────────
const BOX_DAYS = [0, 1, 3, 7, 16];
function card(id) { return (state.cards[id] ||= { box: 0, right: 0, wrong: 0, due: 0 }); }
function grade(id, ok) {
  const c = card(id);
  if (ok) { c.right++; c.box = Math.min(4, c.box + 1); }
  else { c.wrong++; c.box = 0; }
  c.due = Date.now() + BOX_DAYS[c.box] * 864e5;
}
function worldMastery(worldId) {
  const qs = QUESTIONS.filter((q) => q.cat === worldId);
  const sum = qs.reduce((s, q) => s + (state.cards[q.id]?.box || 0), 0);
  return sum / (qs.length * 4);
}
function pickQuestions(pool, n) {
  // Prioritera: förfallna/fel → osedda → resten
  const now = Date.now();
  const score = (q) => {
    const c = state.cards[q.id];
    if (!c) return 1 + Math.random();
    if (c.due <= now) return 2 + (4 - c.box) + Math.random();
    return Math.random() * 0.5;
  };
  return [...pool].sort((a, b) => score(b) - score(a)).slice(0, n);
}
const mistakes = () => QUESTIONS.filter((q) => state.cards[q.id] && state.cards[q.id].box === 0 && state.cards[q.id].wrong > 0);

// ───────────────────────── Märken (badges) ─────────────────────────
const BADGES = [
  { id: "first", e: "🚀", name: "Första lektionen", test: () => state.lessons >= 1 },
  { id: "streak3", e: "🔥", name: "3 dagar i rad", test: () => state.streak >= 3 },
  { id: "streak7", e: "📅", name: "7 dagar i rad", test: () => state.streak >= 7 },
  { id: "perfect", e: "💯", name: "Felfri lektion", test: () => false },
  { id: "c50", e: "✅", name: "50 rätt svar", test: () => state.totalCorrect >= 50 },
  { id: "c200", e: "🏅", name: "200 rätt svar", test: () => state.totalCorrect >= 200 },
  { id: "signs", e: "🛑", name: "Skyltmästare", test: () => worldMastery("skyltar") >= 0.75 },
  { id: "blitz", e: "⚡", name: "Blixten (10+ i snabbrunda)", test: () => state.bestBlitz >= 10 },
  { id: "exam", e: "🎓", name: "Klarade provprov", test: () => state.examsPassed >= 1 },
  { id: "coach", e: "🤖", name: "Pratat med Kompis", test: () => state.coachMsgs >= 1 },
  { id: "all", e: "🌍", name: "Alla världar 50%", test: () => WORLDS.every((w) => worldMastery(w.id) >= 0.5) },
  { id: "lvl5", e: "👑", name: "Nivå 5", test: () => levelFromXp(state.xp).lvl >= 5 },
];
function unlock(id) {
  if (state.badges.includes(id)) return;
  state.badges.push(id);
  const b = BADGES.find((x) => x.id === id);
  setTimeout(() => toast(`🏆 Nytt märke: ${b.e} ${b.name}`), 600);
}
function checkBadges() { BADGES.forEach((b) => b.test() && unlock(b.id)); save(); }

// ───────────────────────── Ljud, tal, toast, konfetti ─────────────────────────
let audioCtx;
function sound(kind) {
  if (!state.settings.sound) return;
  try {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    const notes = { good: [660, 880], bad: [220, 160], level: [523, 659, 784, 1046] }[kind] || [440];
    notes.forEach((f, i) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = kind === "bad" ? "square" : "sine";
      o.frequency.value = f;
      const t = audioCtx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g).connect(audioCtx.destination);
      o.start(t); o.stop(t + 0.2);
    });
  } catch { /* inget ljud */ }
}
function buzz(kind) {
  if (!state.settings.sound) return;
  const H = window.Capacitor?.Plugins?.Haptics;
  try {
    if (H) return kind === "bad" ? H.notification({ type: "ERROR" }) : H.impact({ style: "LIGHT" });
    navigator.vibrate?.(kind === "bad" ? [40, 60, 40] : 15);
  } catch { /* ingen vibration */ }
}
function speak(text) {
  if (!("speechSynthesis" in window)) return toast("Uppläsning stöds inte i den här webbläsaren");
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "sv-SE";
  u.rate = 0.95;
  const sv = speechSynthesis.getVoices().find((v) => v.lang?.startsWith("sv"));
  if (sv) u.voice = sv;
  speechSynthesis.speak(u);
}
function askConfirm(msg, yes = "Ja", no = "Avbryt") {
  return new Promise((resolve) => {
    const d = document.createElement("div");
    d.className = "modal";
    d.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true"><p><b>${escapeHtml(msg)}</b></p>
      <div class="row"><button class="btn secondary" data-no>${no}</button><button class="btn" data-yes>${yes}</button></div></div>`;
    document.body.appendChild(d);
    const done = (v) => { d.remove(); resolve(v); };
    d.querySelector("[data-yes]").addEventListener("click", () => done(true));
    d.querySelector("[data-no]").addEventListener("click", () => done(false));
    d.addEventListener("click", (e) => { if (e.target === d) done(false); });
    d.querySelector("[data-no]").focus();
  });
}
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}
function confetti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = $("#confetti"), ctx = c.getContext("2d");
  c.width = innerWidth; c.height = innerHeight;
  const colors = ["#1f6feb", "#f5b301", "#1f9d55", "#eb5757", "#9b51e0"];
  const parts = Array.from({ length: 120 }, () => ({
    x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.3,
    vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 4, r: 4 + Math.random() * 5,
    col: colors[Math.floor(Math.random() * colors.length)], a: Math.random() * Math.PI,
  }));
  let frames = 0;
  (function tick() {
    ctx.clearRect(0, 0, c.width, c.height);
    parts.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.a += 0.1;
      ctx.fillStyle = p.col;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6); ctx.restore();
    });
    if (++frames < 160) requestAnimationFrame(tick); else ctx.clearRect(0, 0, c.width, c.height);
  })();
}

// ───────────────────────── Inställningar ─────────────────────────
function applySettings() {
  const s = state.settings, root = document.documentElement;
  root.style.setProperty("--font-scale", s.bigText ? 1.2 : 1);
  root.classList.toggle("easyread", s.easyRead);
  root.classList.toggle("contrast", s.contrast);
  if (s.theme === "auto") root.removeAttribute("data-theme"); else root.dataset.theme = s.theme;
}

// ───────────────────────── Navigering ─────────────────────────
let currentTab = "map";
function go(tab) {
  currentTab = tab;
  document.querySelectorAll(".tabbar button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  document.body.classList.remove("in-quiz");
  ({ map: renderMap, play: renderPlay, coach: renderCoach, profile: renderProfile })[tab]();
  app.focus({ preventScroll: true });
  scrollTo(0, 0);
}
document.querySelectorAll(".tabbar button").forEach((b) => b.addEventListener("click", () => go(b.dataset.tab)));

// ───────────────────────── Karta ─────────────────────────
function ring(pct, color) {
  const r = 34, c = 2 * Math.PI * r;
  return `<svg viewBox="0 0 74 74"><circle cx="37" cy="37" r="${r}" fill="none" stroke="rgba(127,127,127,.25)" stroke-width="5"/>
    <circle cx="37" cy="37" r="${r}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}"/></svg>`;
}
function renderWelcome() {
  app.innerHTML = `
    <div class="welcome">
      <div class="hero">🚗</div>
      <h1>Välkommen till Körkortskompis!</h1>
      <p class="muted">Plugga till B-körkortet som ett spel – några minuter om dagen räcker.</p>
      <div class="card" style="text-align:left">
        <ol>
          <li><b>Välj en värld</b> på kartan och kör en lektion på 8 frågor.</li>
          <li><b>Samla XP</b>, håll din 🔥-svit vid liv och lås upp märken.</li>
          <li><b>Fastnar du?</b> Fråga 🤖 Kompis – din AI-coach som hittar på minnesregler och idéer.</li>
          <li><b>Testa dig</b> med 🎓 Provprov när du känner dig redo.</li>
        </ol>
      </div>
      <div class="card" style="text-align:left">
        <b>Behöver du stöd?</b>
        <p class="muted" style="margin:4px 0 0">Under 🏆 Profil kan du slå på uppläsning, större text och lättläst läge.</p>
      </div>
      <button class="btn" id="startApp">Kör igång! 🚦</button>
    </div>`;
  $("#startApp").addEventListener("click", () => { state.onboarded = true; save(); go("map"); });
}
function renderMap() {
  if (!state.onboarded) return renderWelcome();
  touchDay();
  const goalPct = Math.min(100, (state.todayXp / state.dailyGoal) * 100);
  const due = QUESTIONS.filter((q) => state.cards[q.id] && state.cards[q.id].due <= Date.now()).length;
  app.innerHTML = `
    <div class="card">
      <div class="row"><div class="grow"><b>Dagens mål</b> <span class="muted">${state.todayXp}/${state.dailyGoal} XP</span></div>
        <span>${goalPct >= 100 ? "✅" : "🎯"}</span></div>
      <div class="goal-bar" style="margin-top:8px"><div style="width:${goalPct}%"></div></div>
      ${due ? `<p class="muted" style="margin:10px 0 0">🔁 ${due} frågor är redo att repeteras.</p>` : ""}
    </div>
    <h2>Din körkortsresa</h2>
    <p class="muted">Välj en värld. Varje lektion har 8 frågor – fel svar kommer tillbaka tills du kan dem.</p>
    <div class="path">
      ${WORLDS.map((w) => {
        const m = worldMastery(w.id);
        const stars = m >= 0.9 ? 3 : m >= 0.6 ? 2 : m >= 0.25 ? 1 : 0;
        return `<button class="world" data-world="${w.id}" aria-label="${w.name}, ${Math.round(m * 100)} procent klart">
          <div class="icon" style="background:${w.color}">${ring(m, w.color)}<span>${w.emoji}</span></div>
          <div class="grow">
            <h3>${w.name}</h3>
            <p class="muted">${w.desc}</p>
            <div class="stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)} <small class="muted">${Math.round(m * 100)}%</small></div>
          </div>
        </button>`;
      }).join("")}
    </div>`;
  app.querySelectorAll("[data-world]").forEach((b) =>
    b.addEventListener("click", () => {
      const w = WORLDS.find((x) => x.id === b.dataset.world);
      startQuiz({ title: w.name, questions: pickQuestions(QUESTIONS.filter((q) => q.cat === w.id), 8), mode: "lesson" });
    }));
}

// ───────────────────────── Spellägen ─────────────────────────
function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = [...seed].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function renderPlay() {
  const m = mistakes().length;
  app.innerHTML = `
    <h2>Välj spelläge</h2>
    <div class="modes">
      <button class="mode" data-mode="daily"><span class="big">🌞</span><b>Dagens utmaning</b><small>10 blandade frågor. Samma för alla idag!</small></button>
      <button class="mode" data-mode="blitz"><span class="big">⚡</span><b>Snabbrunda</b><small>Så många rätt du hinner på 60 sek. Rekord: ${state.bestBlitz}</small></button>
      <button class="mode" data-mode="mistakes"><span class="big">🔁</span><b>Repetera fel</b><small>${m ? `${m} frågor att öva på` : "Inga fel just nu – snyggt!"}</small></button>
      <button class="mode" data-mode="signs"><span class="big">🛑</span><b>Skyltjakt</b><small>Bara vägmärken, snabbt och visuellt.</small></button>
      <button class="mode wide" data-mode="exam"><span class="big">🎓</span><div><b>Provprov</b><br><small>Som kunskapsprovet: blandade frågor, ingen hjälp under tiden, 80 % rätt för godkänt (52 av 65 på riktiga provet).</small></div></button>
    </div>
    <div class="card" style="margin-top:14px">
      <b>💡 Tips</b>
      <p class="muted" style="margin:6px 0 0">Plugga lite varje dag i stället för mycket en gång. Korta pass + repetition = det som fastnar bäst!</p>
    </div>`;
  app.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => {
    const mode = b.dataset.mode;
    if (mode === "daily") startQuiz({ title: "Dagens utmaning", questions: seededShuffle(QUESTIONS, today()).slice(0, 10), mode: "lesson" });
    if (mode === "blitz") startQuiz({ title: "Snabbrunda", questions: shuffle(QUESTIONS), mode: "blitz", seconds: 60 });
    if (mode === "mistakes") {
      if (!m) return toast("Inga fel att repetera – kör en lektion! 🚗");
      startQuiz({ title: "Repetera fel", questions: shuffle(mistakes()).slice(0, 10), mode: "lesson" });
    }
    if (mode === "signs") startQuiz({ title: "Skyltjakt", questions: shuffle(QUESTIONS.filter((q) => q.sign)).slice(0, 10), mode: "lesson" });
    if (mode === "exam") {
      const n = Math.min(65, QUESTIONS.length);
      startQuiz({ title: "Provprov", questions: shuffle(QUESTIONS).slice(0, n), mode: "exam", seconds: Math.round((50 * 60 * n) / 65) });
    }
  }));
}

// ───────────────────────── Quiz-motor ─────────────────────────
let quiz = null;
function startQuiz({ title: t, questions, mode, seconds }) {
  touchDay();
  quiz = {
    title: t, mode, queue: [...questions], total: questions.length, index: 0,
    correct: 0, wrongIds: new Set(), combo: 0, maxCombo: 0, xp: 0, log: [],
    endsAt: seconds ? Date.now() + seconds * 1000 : null, answered: 0,
  };
  document.body.classList.add("in-quiz");
  renderQuestion();
}
function tickTimer() {
  if (!quiz || !quiz.endsAt) return;
  const left = Math.max(0, Math.ceil((quiz.endsAt - Date.now()) / 1000));
  const el = $("#timer");
  if (el) el.textContent = quiz.mode === "exam" ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}` : `${left}s`;
  if (left <= 0) return finishQuiz();
  quiz.timer = setTimeout(tickTimer, 250);
}
function currentQ() { return quiz.queue[quiz.index]; }

function renderQuestion() {
  const q = currentQ();
  if (!q) return finishQuiz();
  // Blanda svarsalternativen men kom ihåg rätt svar
  const order = shuffle(q.opts.map((_, i) => i));
  quiz.order = order;
  const done = quiz.mode === "blitz" ? quiz.answered % 10 : quiz.index;
  const pct = quiz.mode === "blitz" ? (done / 10) * 100 : (done / quiz.queue.length) * 100;
  app.innerHTML = `
    <div class="quiz-top">
      <button class="close" aria-label="Avsluta">✕</button>
      <div class="progress" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100"><div style="width:${pct}%"></div></div>
      ${quiz.endsAt ? `<span class="timer" id="timer"></span>` : `<span class="timer">${quiz.index + 1}/${quiz.queue.length}</span>`}
    </div>
    <div class="combo">${quiz.combo >= 3 ? `🔥 Combo x${quiz.combo}!` : ""}</div>
    ${q.sign ? SIGNS[q.sign] : ""}
    <div class="row" style="align-items:flex-start">
      <p class="qtext grow" id="qtext">${escapeHtml(q.q)}</p>
      <button class="speak" aria-label="Läs upp frågan">🔊</button>
    </div>
    <div class="options">
      ${order.map((oi, i) => `<button class="opt" data-oi="${oi}"><span class="key">${"ABCD"[i]}</span><span>${escapeHtml(q.opts[oi])}</span></button>`).join("")}
    </div>`;
  if (quiz.endsAt) { clearTimeout(quiz.timer); tickTimer(); }
  $(".close").addEventListener("click", () => {
    askConfirm("Vill du avsluta? Dina framsteg hittills sparas.", "Avsluta").then((ok) => ok && quiz && finishQuiz(true));
  });
  $(".speak").addEventListener("click", () => speak(`${q.q}. ${order.map((oi, i) => `${"ABCD"[i]}: ${q.opts[oi]}`).join(". ")}`));
  app.querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => answer(Number(b.dataset.oi))));
  if (state.settings.autoRead) $(".speak").click();
}

function answer(oi) {
  const q = currentQ();
  const ok = oi === q.a;
  quiz.answered++;
  app.querySelectorAll(".opt").forEach((b) => {
    b.disabled = true;
    const v = Number(b.dataset.oi);
    if (quiz.mode === "exam") { if (v === oi) b.classList.add("picked"); return; }
    if (v === q.a) b.classList.add("correct");
    if (v === oi && !ok) b.classList.add("wrong");
  });

  const firstTry = !quiz.wrongIds.has(q.id);
  if (firstTry) grade(q.id, ok);
  quiz.log.push({ id: q.id, ok });

  if (ok) {
    quiz.combo++;
    quiz.maxCombo = Math.max(quiz.maxCombo, quiz.combo);
    if (firstTry) quiz.correct++;
    state.totalCorrect++;
    const gain = 10 + Math.min(10, (quiz.combo - 1) * 2);
    quiz.xp += gain;
    addXp(gain);
    sound("good");
    buzz("good");
  } else {
    quiz.combo = 0;
    quiz.wrongIds.add(q.id);
    sound("bad");
    buzz("bad");
    // Fel fråga kommer tillbaka senare i lektionen (lärande, inte straff)
    if (quiz.mode === "lesson") quiz.queue.push(q);
  }
  save();

  if (quiz.mode === "blitz") {
    if (!ok) {
      showFeedback(q, ok, () => { quiz.index++; renderQuestion(); }, true);
    } else setTimeout(() => { quiz.index++; renderQuestion(); }, 350);
    return;
  }
  if (quiz.mode === "exam") return setTimeout(() => { quiz.index++; renderQuestion(); }, 450);
  showFeedback(q, ok, () => { quiz.index++; renderQuestion(); });
}

const PRAISE = ["Snyggt! 🎉", "Helt rätt! ✅", "Grymt! 💪", "Du kan det här! 🚀", "Perfekt! ⭐"];
const COMFORT = ["Nästan! Nu lär du dig 💡", "Inte riktigt – men nu vet du! 🧠", "Fel är bra – det är så man lär sig 🌱"];
function showFeedback(q, ok, next, short = false) {
  const fb = document.createElement("div");
  fb.className = `feedback ${ok ? "good" : "bad"}`;
  fb.innerHTML = `<div class="inner">
    <h3>${ok ? PRAISE[Math.floor(Math.random() * PRAISE.length)] : COMFORT[Math.floor(Math.random() * COMFORT.length)]}</h3>
    ${!ok ? `<p><b>Rätt svar:</b> ${escapeHtml(q.opts[q.a])}</p>` : ""}
    <p>${escapeHtml(q.why)}</p>
    <div class="actions">
      ${short ? "" : `<button class="btn secondary small" data-ask>🤖 Fråga Kompis</button>`}
      <button class="btn ${ok ? "good" : ""}" data-next>Fortsätt</button>
    </div></div>`;
  document.body.appendChild(fb);
  const nextBtn = fb.querySelector("[data-next]");
  nextBtn.focus();
  nextBtn.addEventListener("click", () => { fb.remove(); next(); });
  fb.querySelector("[data-ask]")?.addEventListener("click", () => {
    fb.remove();
    const prompt = `Jag övade på frågan: "${q.q}" Rätt svar är "${q.opts[q.a]}". Kan du förklara det enkelt och ge mig en minnesregel?`;
    if (quiz?.timer) clearTimeout(quiz.timer);
    quiz = null;
    go("coach");
    sendToCoach(prompt);
  });
  if (state.settings.autoRead) speak(`${ok ? "Rätt." : "Fel. Rätt svar är " + q.opts[q.a] + "."} ${q.why}`);
}

function finishQuiz(aborted = false) {
  if (!quiz) return;
  clearTimeout(quiz.timer);
  document.querySelector(".feedback")?.remove();
  const qz = quiz;
  quiz = null;
  const unique = new Set(qz.log.map((l) => l.id)).size;
  let headline = "", trophy = "🏁", pass = null;

  if (qz.mode === "blitz") {
    const score = qz.log.filter((l) => l.ok).length;
    if (score > state.bestBlitz) { state.bestBlitz = score; if (score > 0) { headline = "Nytt rekord!"; confetti(); } }
    trophy = "⚡";
    headline ||= `${score} rätt på 60 sekunder`;
  } else if (qz.mode === "exam") {
    const answeredCount = qz.log.length;
    const pct = qz.total ? qz.correct / qz.total : 0;
    pass = pct >= 0.8;
    if (pass && !aborted) { state.examsPassed++; addXp(50); confetti(); }
    trophy = pass ? "🎓" : "📚";
    headline = `${qz.correct} av ${qz.total} rätt (${Math.round(pct * 100)}%) – ${pass ? "GODKÄNT!" : "inte godkänt än"}`;
    if (answeredCount < qz.total) headline += ` · ${qz.total - answeredCount} obesvarade`;
  } else {
    if (!aborted && unique > 0) {
      state.lessons++;
      if (qz.wrongIds.size === 0 && qz.log.length >= 5) { addXp(20); unlock("perfect"); trophy = "💯"; headline = "Felfri lektion! +20 bonus-XP"; confetti(); }
      else { trophy = "🏆"; headline = "Lektion klar!"; confetti(); }
    } else headline = "Bra jobbat så långt!";
  }
  if (state.todayXp >= state.dailyGoal && !state.goalToastDate?.startsWith(today())) {
    state.goalToastDate = today();
    setTimeout(() => toast("🎯 Dagens mål klart! Starkt!"), 900);
  }
  checkBadges();
  save();
  document.body.classList.remove("in-quiz");

  const wrong = [...qz.wrongIds].map((id) => QUESTIONS.find((q) => q.id === id)).filter(Boolean);
  app.innerHTML = `
    <div class="result">
      <div class="trophy">${trophy}</div>
      <h1>${escapeHtml(qz.title)}</h1>
      <p><b>${escapeHtml(headline)}</b></p>
      <div class="result-stats">
        <div><b>+${qz.xp}</b><small class="muted">XP</small></div>
        <div><b>${qz.maxCombo}</b><small class="muted">Bästa combo</small></div>
        <div><b>${qz.log.filter((l) => l.ok).length}</b><small class="muted">Rätt svar</small></div>
      </div>
      ${wrong.length ? `<div class="card" style="text-align:left"><b>Att öva mer på:</b><ul>${wrong.map((q) => `<li class="wrong-sign">${q.sign ? SIGNS[q.sign] : ""}${escapeHtml(q.q)}<br><small class="muted">✔ ${escapeHtml(q.opts[q.a])}</small></li>`).join("")}</ul></div>` : ""}
      <button class="btn" id="again">Spela igen</button>
      <div style="height:10px"></div>
      <button class="btn secondary" id="home">Till kartan</button>
      ${wrong.length ? `<div style="height:10px"></div><button class="btn secondary" id="askPlan">🤖 Be Kompis om tips för mina fel</button>` : ""}
    </div>`;
  $("#again").addEventListener("click", () => { qz.mode === "blitz" || qz.mode === "exam" ? go("play") : go("map"); });
  $("#home").addEventListener("click", () => go("map"));
  $("#askPlan")?.addEventListener("click", () => {
    go("coach");
    sendToCoach(`Jag svarade fel på de här frågorna: ${wrong.map((q) => `"${q.q}" (rätt: ${q.opts[q.a]})`).join("; ")}. Kan du hjälpa mig komma ihåg dem med minnesregler eller knep?`);
  });
}

// ───────────────────────── AI-coachen Kompis ─────────────────────────
let aiOnline = null;
async function checkAi() {
  if (aiOnline !== null) return aiOnline;
  try {
    const r = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
    aiOnline = r.ok && (await r.json()).ai === true;
  } catch { aiOnline = false; }
  return aiOnline;
}
function statsSummary() {
  const worlds = Object.fromEntries(WORLDS.map((w) => [w.name, `${Math.round(worldMastery(w.id) * 100)}%`]));
  const weak = WORLDS.map((w) => ({ n: w.name, m: worldMastery(w.id) })).sort((a, b) => a.m - b.m).slice(0, 2).map((x) => x.n);
  return { nivå: levelFromXp(state.xp).lvl, xp: state.xp, dagarIRad: state.streak, behärskning: worlds, svagast: weak, felAttRepetera: mistakes().length };
}
const IDEA_CHIPS = [
  ["💡 Minnesregel", "Hitta på en rolig minnesregel för något jag tycker är svårt i körkortsteorin."],
  ["📅 Studieplan", "Gör en enkel studieplan för mig för de kommande 7 dagarna utifrån mina framsteg."],
  ["🎲 Utmaning", "Hitta på en rolig utmaning jag kan göra idag – gärna något jag kan göra ute i trafiken som passagerare eller fotgängare."],
  ["🧩 Ny quizfråga", "__quiz__"],
  ["🚦 Scenario", "Beskriv en trafiksituation och fråga mig vad jag ska göra. Vänta på mitt svar innan du berättar."],
  ["🗣️ Lätt svenska", "Förklara högerregeln och väjningsplikt med väldigt lätt svenska och korta meningar."],
  ["😰 Provnerver", "Jag är nervös inför kunskapsprovet. Har du tips?"],
];
function renderCoach() {
  app.innerHTML = `
    <div class="card coach-hero">
      <div class="avatar">🤖</div>
      <div><b>Hej! Jag är Kompis.</b><br><span class="muted" id="aiStatus">Jag hjälper dig med idéer, minnesregler och svåra frågor.</span></div>
    </div>
    <div class="chips">${IDEA_CHIPS.map(([l], i) => `<button class="chip" data-chip="${i}">${l}</button>`).join("")}</div>
    <div class="chat" id="chat"></div>
    <form class="composer" id="composer">
      <textarea id="msg" rows="1" placeholder="Fråga Kompis något…" aria-label="Meddelande till Kompis"></textarea>
      <button class="btn" type="submit" aria-label="Skicka">➤</button>
    </form>
    ${state.chat.length ? `<button class="btn secondary small" id="clearChat">🧹 Rensa chatten</button>` : ""}`;
  renderChat();
  checkAi().then((on) => {
    if (!on) $("#aiStatus").textContent = "Offline-läge: jag ger färdiga tips. Starta servern med en API-nyckel för full AI.";
  });
  app.querySelectorAll("[data-chip]").forEach((b) => b.addEventListener("click", () => {
    const text = IDEA_CHIPS[b.dataset.chip][1];
    if (text === "__quiz__") return requestQuiz();
    sendToCoach(text);
  }));
  const ta = $("#msg");
  ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("#composer").requestSubmit(); } });
  ta.addEventListener("input", () => { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; });
  $("#composer").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = ta.value.trim();
    if (!v) return;
    ta.value = ""; ta.style.height = "auto";
    sendToCoach(v);
  });
  $("#clearChat")?.addEventListener("click", () => { state.chat = []; save(); renderCoach(); });
}
function renderChat(typing = false) {
  const chat = $("#chat");
  if (!chat) return;
  if (!state.chat.length) {
    chat.innerHTML = `<div class="msg assistant">Hej! 👋 Tryck på en idé ovanför eller skriv en fråga. Jag kan till exempel hitta på minnesregler, göra en studieplan eller ge dig en ny quizfråga.</div>`;
  } else {
    chat.innerHTML = state.chat.map((m, i) => {
      if (m.quiz) return miniQuizHtml(m.quiz, i);
      return `<div class="msg ${m.role}">${m.role === "assistant" ? fmt(m.content) : escapeHtml(m.content)}${m.role === "assistant" ? ` <button class="speak" data-say="${i}" aria-label="Läs upp">🔊</button>` : ""}</div>`;
    }).join("");
  }
  if (typing) chat.insertAdjacentHTML("beforeend", `<div class="msg assistant typing">Kompis tänker… 🤔</div>`);
  chat.querySelectorAll("[data-say]").forEach((b) => b.addEventListener("click", () => speak(state.chat[b.dataset.say].content)));
  chat.querySelectorAll("[data-mq]").forEach((b) => b.addEventListener("click", () => {
    const [mi, oi] = b.dataset.mq.split(":").map(Number);
    const qz = state.chat[mi].quiz;
    if (qz.answered != null) return;
    qz.answered = oi;
    const ok = oi === qz.correct;
    if (ok) { addXp(15); sound("good"); toast("+15 XP för Kompis-frågan!"); } else sound("bad");
    save(); renderChat();
  }));
  chat.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "end" });
}
function miniQuizHtml(qz, i) {
  const done = qz.answered != null;
  return `<div class="msg assistant mini-quiz" style="max-width:100%;width:100%">
    <b>🧩 Kompis-fråga:</b><p>${escapeHtml(qz.question)}</p>
    <div class="options">${qz.options.map((o, oi) => {
      const cls = done ? (oi === qz.correct ? "correct" : oi === qz.answered ? "wrong" : "") : "";
      return `<button class="opt ${cls}" data-mq="${i}:${oi}" ${done ? "disabled" : ""}><span class="key">${"ABCDEF"[oi]}</span><span>${escapeHtml(o)}</span></button>`;
    }).join("")}</div>
    ${done ? `<p style="margin-top:10px">${qz.answered === qz.correct ? "✅ Rätt!" : "❌ Inte riktigt."} ${escapeHtml(qz.explanation)}</p>` : ""}
  </div>`;
}

async function callCoach(messages, mode) {
  const r = await fetch(`${API_BASE}/api/coach`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages, stats: statsSummary(), mode }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Något gick fel");
  return data;
}
function chatHistory() {
  return state.chat.filter((m) => !m.quiz).map(({ role, content }) => ({ role, content }));
}
let busy = false;
async function sendToCoach(text) {
  if (busy) return;
  busy = true;
  state.chat.push({ role: "user", content: text });
  state.coachMsgs++;
  checkBadges();
  save();
  renderChat(true);
  let reply;
  try {
    if (await checkAi()) reply = (await callCoach(chatHistory())).reply;
    else reply = offlineCoachReply(text, statsSummary());
  } catch (e) {
    reply = `${offlineCoachReply(text, statsSummary())}\n\n(⚠️ ${e.message} – svaret ovan kommer från offline-läget.)`;
  }
  state.chat.push({ role: "assistant", content: reply });
  state.chat = state.chat.slice(-40);
  save();
  busy = false;
  if (currentTab === "coach") renderChat();
}
async function requestQuiz() {
  if (busy) return;
  busy = true;
  renderChat(true);
  let qz = null;
  try {
    if (await checkAi()) {
      const weak = statsSummary().svagast.join(" eller ");
      const data = await callCoach([{ role: "user", content: `Skapa EN ny flervalsfråga (3–4 alternativ) för svenskt B-körkort om ${weak}. Svara på enkel svenska. "correct" är index (0-baserat) för rätt alternativ. Förklaringen ska vara kort och pedagogisk.` }], "quiz");
      qz = data.quiz || null;
      if (!qz && data.reply) state.chat.push({ role: "assistant", content: data.reply });
    }
  } catch { /* offline nedan */ }
  if (!qz) {
    const q = shuffle(QUESTIONS)[0];
    qz = { question: q.q, options: q.opts, correct: q.a, explanation: q.why };
  }
  state.chat.push({ role: "assistant", content: qz.question, quiz: qz });
  state.coachMsgs++;
  checkBadges();
  save();
  busy = false;
  if (currentTab === "coach") renderChat();
}

// ───────────────────────── Profil ─────────────────────────
function renderProfile() {
  const L = levelFromXp(state.xp);
  const s = state.settings;
  const toggle = (key, label, desc) => `
    <label class="setting"><div><b>${label}</b><br><small class="muted">${desc}</small></div>
      <span class="switch"><input type="checkbox" data-set="${key}" ${s[key] ? "checked" : ""}><span></span></span></label>`;
  app.innerHTML = `
    <div class="card">
      <div class="row"><div style="font-size:2.6rem">🧑‍✈️</div>
        <div class="grow"><h2 style="margin:0">Nivå ${L.lvl}</h2><span class="muted">${title(L.lvl)}</span></div></div>
      <div class="xp-bar" style="margin-top:12px"><div style="width:${(L.into / L.need) * 100}%"></div></div>
      <small class="muted">${L.into}/${L.need} XP till nästa nivå</small>
    </div>
    <div class="result-stats">
      <div><b>${state.streak}</b><small class="muted">Dagar i rad</small></div>
      <div><b>${state.totalCorrect}</b><small class="muted">Rätt svar</small></div>
      <div><b>${state.lessons}</b><small class="muted">Lektioner</small></div>
    </div>
    <h2>Märken</h2>
    <div class="badges">${BADGES.map((b) => `<div class="badge ${state.badges.includes(b.id) ? "" : "locked"}"><span class="b">${b.e}</span>${b.name}</div>`).join("")}</div>
    <h2 style="margin-top:18px">Inställningar – så alla kan lära sig</h2>
    <div class="card">
      ${toggle("bigText", "Större text", "Gör all text större")}
      ${toggle("easyRead", "Lättläst läge", "Mer luft mellan bokstäver och rader – bra vid dyslexi")}
      ${toggle("autoRead", "Läs upp automatiskt", "Frågor och förklaringar läses upp på svenska")}
      ${toggle("contrast", "Hög kontrast", "Tydligare färger")}
      ${toggle("sound", "Ljudeffekter", "Pling vid rätt och fel svar")}
      <div class="setting"><div><b>Tema</b></div>
        <select id="theme" class="chip"><option value="auto">Automatiskt</option><option value="light">Ljust</option><option value="dark">Mörkt</option></select></div>
      <div class="setting"><div><b>Dagligt mål</b></div>
        <select id="goal" class="chip">${[30, 50, 100, 150].map((g) => `<option value="${g}" ${state.dailyGoal === g ? "selected" : ""}>${g} XP</option>`).join("")}</select></div>
    </div>
    <div class="card">
      <b>Om kunskapsprovet</b>
      <p class="muted" style="margin:6px 0 0">70 frågor (65 räknas), 50 minuter, minst 52 rätt. Du bokar provet hos Trafikverket. Kontrollera alltid aktuella regler på trafikverket.se.</p>
    </div>
    <button class="btn secondary" id="reset">Börja om från noll</button>`;
  app.querySelectorAll("[data-set]").forEach((i) => i.addEventListener("change", () => {
    state.settings[i.dataset.set] = i.checked; applySettings(); save();
  }));
  $("#theme").value = s.theme;
  $("#theme").addEventListener("change", (e) => { state.settings.theme = e.target.value; applySettings(); save(); });
  $("#goal").addEventListener("change", (e) => { state.dailyGoal = Number(e.target.value); save(); });
  $("#reset").addEventListener("click", () => {
    askConfirm("Är du säker? All din progress raderas.", "Radera allt").then((ok) => { if (ok) { state = defaultState(); save(); applySettings(); updateTopbar(); go("map"); } });
  });
}

// ───────────────────────── Android-bakåtknapp (mobilappen) ─────────────────────────
try {
  window.Capacitor?.Plugins?.App?.addListener("backButton", () => {
    const fb = document.querySelector(".feedback");
    if (fb) return fb.querySelector("[data-next]")?.click();
    if (document.querySelector(".modal")) return document.querySelector(".modal [data-no]").click();
    if (quiz) { askConfirm("Vill du avsluta? Dina framsteg hittills sparas.", "Avsluta").then((ok) => ok && quiz && finishQuiz(true)); return; }
    if (currentTab !== "map") return go("map");
    window.Capacitor.Plugins.App.exitApp();
  });
  window.Capacitor?.Plugins?.StatusBar?.setBackgroundColor?.({ color: "#1f6feb" });
} catch { /* webbläsare */ }

// ───────────────────────── Start ─────────────────────────
applySettings();
touchDay();
save();
updateTopbar();
go("map");
if ("serviceWorker" in navigator && location.protocol !== "file:" && !window.Capacitor?.isNativePlatform?.()) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
