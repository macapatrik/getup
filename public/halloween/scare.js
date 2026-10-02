// Lekačka na stránce /halloween: smrtka vyskočí přes celou obrazovku (překryv #hw-scare), červený záblesk
// a krátký zvuk ze syntezátoru (bez souboru). Jednou automaticky 3 s po dojetí k sekci soutěže (ne při
// omezení pohybu), pak kdykoli tlačítkem „Nemačkat“. Stejný soubor běží v aplikaci i ve vložení na webu.
(function () {
  var box = document.getElementById("hw-scare");
  var btn = document.getElementById("hw-scare-btn");
  var target = document.getElementById("kostymy");
  if (!box) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = null;
  function unlock() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!ctx && AC) ctx = new AC();
      if (ctx && ctx.state === "suspended") ctx.resume();
    } catch {}
  }
  ["pointerdown", "keydown", "touchstart"].forEach(function (ev) {
    window.addEventListener(ev, unlock, { passive: true });
  });

  function sting() {
    if (!ctx || ctx.state !== "running") return;
    var t = ctx.currentTime;
    var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.7), ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
    var noise = ctx.createBufferSource();
    noise.buffer = buf;
    var lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(2200, t);
    lp.frequency.exponentialRampToValueAtTime(120, t + 0.7);
    var ng = ctx.createGain();
    ng.gain.setValueAtTime(0.8, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
    noise.connect(lp).connect(ng).connect(ctx.destination);
    noise.start(t);
    [[880, 180], [1318, 260], [2093, 330]].forEach(function (f) {
      var o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(f[0], t);
      o.frequency.exponentialRampToValueAtTime(f[1], t + 0.55);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.7);
    });
  }

  var busy = false;
  function scare() {
    if (busy) return;
    busy = true;
    box.classList.remove("hidden");
    box.classList.add("is-on");
    sting();
    setTimeout(function () {
      box.classList.remove("is-on");
      box.classList.add("hidden");
      busy = false;
    }, 1200);
  }

  if (btn) {
    btn.addEventListener("click", function () {
      unlock();
      scare();
    });
  }

  var seen = false;
  try {
    seen = !!sessionStorage.getItem("hw-scared");
  } catch {}
  if (target && !reduce && !seen && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        setTimeout(function () {
          try {
            sessionStorage.setItem("hw-scared", "1");
          } catch {}
          scare();
        }, 3000);
      },
      { threshold: 0.5 },
    );
    io.observe(target);
  }
})();
