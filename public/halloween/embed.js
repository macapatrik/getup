// Halloween by GetUp – vloží stránku do <div id="hw-root"></div> (generuje scripts/export-halloween-wordpress.mjs)
(function () {
  var script = document.currentScript;
  var base = script && script.src ? new URL(".", script.src).href : "https://together.get-up.fun/halloween/";
  var root = document.getElementById("hw-root");
  if (!root) return;
  fetch(base + "embed.html", { credentials: "omit" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
    .then(function (html) { root.innerHTML = html; init(); })
    .catch(function (err) { console.error("Halloween embed:", err); });
  function init() {
  var page = document.getElementById("hw-page");
  if (!page) return;
  // Odpočet do začátku akce
  var timer = page.querySelector("[role=timer]");
  if (timer) {
    var target = new Date(timer.getAttribute("data-target")).getTime();
    var labels = [["den", "dny", "dní"], ["hodina", "hodiny", "hodin"], ["minuta", "minuty", "minut"], ["sekunda", "sekundy", "sekund"]];
    var tiles = Array.prototype.slice.call(timer.children);
    function word(n, w) { return n === 1 ? w[0] : n >= 2 && n <= 4 ? w[1] : w[2]; }
    function tick() {
      var left = target - Date.now();
      if (left <= 0) {
        var done = document.createElement("p");
        done.className = "font-metal text-[28px] text-blood hw-glow";
        done.textContent = "Právě teď v Klubu K2";
        timer.replaceWith(done);
        clearInterval(id);
        return;
      }
      var total = Math.floor(left / 1000);
      var parts = [Math.floor(total / 86400), Math.floor((total % 86400) / 3600), Math.floor((total % 3600) / 60), total % 60];
      tiles.forEach(function (tile, i) {
        tile.children[0].textContent = String(parts[i]).padStart(2, "0");
        tile.children[1].textContent = word(parts[i], labels[i]);
      });
    }
    var id = setInterval(tick, 1000);
    tick();
  }
  // Mobil: lišta se vstupenkami vyjede po odscrollování úvodu
  var bar = document.getElementById("hw-ticket-bar");
  var hero = document.getElementById("top");
  if (bar && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var shown = !entries[0].isIntersecting;
      bar.classList.toggle("translate-y-full", !shown);
      bar.classList.toggle("translate-y-0", shown);
      bar.setAttribute("aria-hidden", shown ? "false" : "true");
      bar.querySelector("a").tabIndex = shown ? 0 : -1;
    }, { threshold: 0.12 }).observe(hero);
  }
  }
})();
