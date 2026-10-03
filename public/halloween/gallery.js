// Galerie na stránce /halloween: klik na fotku otevře překryv #hw-lightbox s velkými fotkami, kterými se dá
// listovat tažením (scroll-snap), šipkami, klávesami i tlačítky. Stejný soubor běží v aplikaci i ve vložení na webu.
(function () {
  var box = document.getElementById("hw-lightbox");
  if (!box) return;
  var strip = box.querySelector("[data-hw-strip]");
  var slides = Array.prototype.slice.call(strip.children);
  var count = box.querySelector("[data-hw-count]");
  var thumbs = Array.prototype.slice.call(document.querySelectorAll("[data-hw-photo]"));
  var lastFocus = null;

  function index() {
    return Math.round(strip.scrollLeft / strip.clientWidth);
  }
  function show(i, smooth) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    strip.scrollTo({ left: i * strip.clientWidth, behavior: smooth ? "smooth" : "auto" });
    update(i);
  }
  function update(i) {
    if (count) count.textContent = i + 1 + " / " + slides.length;
  }
  function open(i) {
    lastFocus = document.activeElement;
    box.classList.remove("hidden");
    box.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("hw-lock");
    document.body.classList.add("hw-lock");
    show(i, false);
    var close = box.querySelector("[data-hw-close]");
    if (close) close.focus();
  }
  function closeBox() {
    box.classList.add("hidden");
    box.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("hw-lock");
    document.body.classList.remove("hw-lock");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  thumbs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      open(parseInt(btn.getAttribute("data-hw-photo"), 10) || 0);
    });
  });
  box.addEventListener("click", function (e) {
    var t = e.target;
    if (t.closest("[data-hw-close]") || t === strip || t.hasAttribute("data-hw-slide")) closeBox();
    else if (t.closest("[data-hw-prev]")) show(index() - 1, true);
    else if (t.closest("[data-hw-next]")) show(index() + 1, true);
  });
  var raf = 0;
  strip.addEventListener("scroll", function () {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      update(index());
    });
  });
  document.addEventListener("keydown", function (e) {
    if (box.classList.contains("hidden")) return;
    if (e.key === "Escape") closeBox();
    else if (e.key === "ArrowLeft") show(index() - 1, true);
    else if (e.key === "ArrowRight") show(index() + 1, true);
  });
})();
