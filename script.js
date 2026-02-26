/* ==========================================================================
   IFRI — Maquette améliorée (JS)
   - Menu mobile (toggle)
   - Smooth scroll
   - Compteurs KPI (animation au scroll)
   - Filtre actualités (chips)
   - Slider témoignages (sans librairie)
   ========================================================================== */

(function () {
  "use strict";

  /* -----------------------------
     Helpers
     ----------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* -----------------------------
     1) Année footer
     ----------------------------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* -----------------------------
     2) Menu mobile
     ----------------------------- */
  const toggleBtn = $(".nav-toggle");
  const mobileNav = $("#mobileNav");

  function setMobileNav(open) {
    if (!toggleBtn || !mobileNav) return;

    toggleBtn.setAttribute("aria-expanded", String(open));
    mobileNav.hidden = !open;
  }

  if (toggleBtn && mobileNav) {
    toggleBtn.addEventListener("click", () => {
      const isOpen = toggleBtn.getAttribute("aria-expanded") === "true";
      setMobileNav(!isOpen);
    });

    // Ferme le menu quand on clique un lien
    $$(".nav--mobile a").forEach((a) => {
      a.addEventListener("click", () => setMobileNav(false));
    });

    // Ferme si on clique en dehors (petit confort)
    document.addEventListener("click", (e) => {
      const isOpen = toggleBtn.getAttribute("aria-expanded") === "true";
      if (!isOpen) return;

      const clickInside =
        mobileNav.contains(e.target) || toggleBtn.contains(e.target);
      if (!clickInside) setMobileNav(false);
    });
  }

  /* -----------------------------
     3) Smooth scroll (ancres)
     ----------------------------- */
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const id = a.getAttribute("href");
    if (!id || id === "#") return;

    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", id);
  });

  /* -----------------------------
     4) Compteurs (IntersectionObserver)
     ----------------------------- */
  const counters = $$(".js-count");

  function animateCount(el) {
    const target = Number(el.dataset.target || "0");
    const start = 0;

    // Durée adaptative : un peu plus longue si grand chiffre
    const duration = Math.min(1400, 650 + Math.log10(target + 1) * 380);
    const t0 = performance.now();

    function frame(t) {
      const p = Math.min(1, (t - t0) / duration);
      // Ease out
      const ease = 1 - Math.pow(1 - p, 3);

      const value = Math.round(start + (target - start) * ease);
      el.textContent = value.toLocaleString("fr-FR");

      if (p < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  if (counters.length) {
    const seen = new WeakSet();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (seen.has(el)) return;

          seen.add(el);
          animateCount(el);
        });
      },
      { threshold: 0.35 }
    );

    counters.forEach((c) => io.observe(c));
  }

  /* -----------------------------
     5) Filtre actualités
     ----------------------------- */
  const chips = $$(".chip");
  const newsCards = $$(".news-card");

  function setActiveChip(btn) {
    chips.forEach((c) => {
      c.classList.toggle("is-active", c === btn);
      c.setAttribute("aria-selected", String(c === btn));
    });
  }

  function filterNews(kind) {
    newsCards.forEach((card) => {
      const matches = kind === "all" || card.dataset.kind === kind;
      card.hidden = !matches;
    });
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const kind = chip.dataset.filter || "all";
      setActiveChip(chip);
      filterNews(kind);
    });
  });

  /* -----------------------------
     6) Slider témoignages (track translate)
     ----------------------------- */
  const sliderRoot = $('[data-slider="root"]');
  const track = $('[data-slider="track"]');
  const items = track ? $$( '[data-slider="item"]', track) : [];
  const prevBtn = $('[data-slider="prev"]');
  const nextBtn = $('[data-slider="next"]');

  let index = 0;

  function getCols() {
    // Correspond aux breakpoints CSS : 1 / 2 / 3 cartes visibles
    const w = window.innerWidth;
    if (w >= 1100) return 3;
    if (w >= 780) return 2;
    return 1;
  }

  function clampIndex(i) {
    const cols = getCols();
    const maxIndex = Math.max(0, items.length - cols);
    return Math.min(maxIndex, Math.max(0, i));
  }

  function render() {
    if (!track) return;
    index = clampIndex(index);

    const cols = getCols();
    const pct = (index * 100) / cols; // translate par "pages" de colonnes
    track.style.transform = `translateX(-${pct}%)`;
  }

  function goNext() { index += 1; render(); }
  function goPrev() { index -= 1; render(); }

  if (nextBtn) nextBtn.addEventListener("click", goNext);
  if (prevBtn) prevBtn.addEventListener("click", goPrev);

  window.addEventListener("resize", render);
  render();

  /* -----------------------------
     7) Formulaire (démo sans backend)
     ----------------------------- */
  const form = $("#contactForm");
  const hint = $("#formHint");

  if (form && hint) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Ici : pas d’envoi réseau (demande "pas de lien externe")
      // => On simule juste une confirmation.
      hint.textContent = "Message prêt ✅ (démo). Ajoute un backend pour l’envoi réel.";
      form.reset();
    });
  }
})();
