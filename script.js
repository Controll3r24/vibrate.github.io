(() => {
  "use strict";

  // Ritmi: durate in millisecondi, alternate vibra / pausa (si ripetono in loop)
  const PATTERNS = [
    { id: "relax",   name: "Respiro",    desc: "Onde lente che salgono e scendono",  cycle: [150,250, 250,250, 350,350, 250,250, 150,750] },
    { id: "notifica",name: "Notifica",   desc: "Come un messaggio in arrivo",        cycle: [300,150, 300,1500] },
    { id: "cuore",   name: "Battito",    desc: "Due colpi morbidi, come un cuore",   cycle: [80,120, 80,800] },
    { id: "pioggia", name: "Pioggia",    desc: "Gocce leggere e irregolari",         cycle: [30,70, 30,170, 30,40, 30,260, 30,120, 30,330] },
    { id: "massaggio",name: "Massaggio", desc: "Vibrazione continua e piena",        cycle: [500,100] },
  ];
  const DURATIONS = [5, 10, 30, 60];

  const $ = (id) => document.getElementById(id);
  const state = { pattern: "relax", seconds: 10, running: false, timers: [], wake: null };

  // --- Solo telefoni ---
  const ua = navigator.userAgent;
  const isPhone = /iPhone|iPod|Android.+Mobile|Android/i.test(ua) && !/iPad|Tablet/i.test(ua)
    && navigator.maxTouchPoints > 0;
  const isIOS = /iPhone|iPod/i.test(ua);
  const canVibrate = typeof navigator.vibrate === "function";

  if (!isPhone) { $("blocked").hidden = false; return; }
  $("app").hidden = false;

  $("note").textContent = canVibrate
    ? "Se non senti nulla, controlla che il telefono non sia in modalità silenziosa o risparmio energetico."
    : "Su iPhone Safari non permette la vibrazione vera: il sito usa i tocchi aptici (iOS 18 o successivo). Servono Vibrazione e Feedback aptico attivi nelle Impostazioni, e la schermata deve restare accesa.";

  // --- Interfaccia ---
  function group(container, items, key, render, onPick) {
    container.innerHTML = "";
    items.forEach((it) => {
      const b = document.createElement("button");
      b.type = "button"; b.setAttribute("role", "radio");
      b.innerHTML = render(it);
      b.addEventListener("click", () => { if (!state.running) onPick(it); refresh(); });
      container.appendChild(b); b._item = it;
    });
  }
  function refresh() {
    [...$("patterns").children].forEach((b) => b.setAttribute("aria-checked", b._item.id === state.pattern));
    [...$("durations").children].forEach((b) => b.setAttribute("aria-checked", b._item === state.seconds));
  }
  group($("patterns"), PATTERNS, "id", (p) => `<b>${p.name}</b><span>${p.desc}</span>`, (p) => (state.pattern = p.id));
  group($("durations"), DURATIONS, null, (s) => `${s} sec`, (s) => (state.seconds = s));
  [...$("patterns").children].forEach((b) => (b.className = "opt"));
  [...$("durations").children].forEach((b) => (b.className = "chip"));
  refresh();

  // --- Motore di vibrazione ---
  const tick = () => $("haptic").click(); // trucco iOS: l'interruttore dà un tocco aptico

  function playCycle(cycle) {
    if (canVibrate) { navigator.vibrate(cycle); return; }
    let t = 0;
    cycle.forEach((ms, i) => {
      if (i % 2 === 0) for (let k = 0; k < ms; k += 45) state.timers.push(setTimeout(tick, t + k));
      t += ms;
    });
  }

  async function start() {
    const p = PATTERNS.find((x) => x.id === state.pattern);
    const total = state.seconds * 1000;
    const len = p.cycle.reduce((a, b) => a + b, 0);
    const t0 = performance.now();
    state.running = true;
    $("go").textContent = "Stop"; $("go").classList.add("on");
    try { state.wake = await navigator.wakeLock?.request("screen"); } catch (_) {}

    const loop = () => {
      if (!state.running) return;
      const used = performance.now() - t0;
      if (used >= total) return stop(true);
      playCycle(p.cycle);
      state.timers.push(setTimeout(loop, len));
    };
    loop();

    const ring = $("ring");
    const ui = setInterval(() => {
      const left = Math.max(0, total - (performance.now() - t0));
      ring.style.strokeDashoffset = 339.3 * (1 - left / total);
      $("status").textContent = `Ancora ${Math.ceil(left / 1000)} secondi`;
    }, 250);
    state.timers.push(ui);
    state.ui = ui;
  }

  function stop(done) {
    state.running = false;
    state.timers.forEach((t) => { clearTimeout(t); clearInterval(t); });
    state.timers = [];
    if (canVibrate) navigator.vibrate(0);
    try { state.wake?.release(); } catch (_) {}
    $("go").textContent = "Avvia"; $("go").classList.remove("on");
    $("ring").style.strokeDashoffset = 0;
    $("status").textContent = done ? "Fatto. Respira." : "Fermato.";
  }

  $("go").addEventListener("click", () => (state.running ? stop(false) : start()));
  document.addEventListener("visibilitychange", () => { if (document.hidden && state.running) stop(false); });
})();
