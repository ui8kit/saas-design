/**
 * @saas-design/ui behaviors — one tiny, framework-free script shared by apps/site (templ) and apps/design (Svelte).
 * Event delegation on document: works for server-rendered and client-rendered markup alike.
 *   data-ui8kit="theme-toggle"  toggles .dark on <html>, persists localStorage.theme, syncs aria-pressed
 *   data-ui8kit="sheet-trigger" opens the Sheet named by aria-controls (aria-expanded sync)
 *   data-ui8kit="sheet"         dialog root: moved to <body> on first open; focus trap, Esc, overlay click, focus restore, scroll lock
 *   data-ui8kit="sheet-close"   closes its Sheet; links inside a Sheet close it too
 * Pair with theme-init.js inlined in <head> (sets .dark before first paint, no flash).
 */
(function () {
  if (window.__ui8kit) return;
  window.__ui8kit = true;
  var root = document.documentElement;
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

  // ---- theme ----
  function isDark() { return root.classList.contains("dark"); }
  function syncToggles() {
    var t = document.querySelectorAll('[data-ui8kit="theme-toggle"]');
    for (var i = 0; i < t.length; i++) t[i].setAttribute("aria-pressed", isDark() ? "true" : "false");
  }
  function setTheme(dark, persist) {
    root.classList.toggle("dark", dark);
    if (persist) try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
    syncToggles();
  }
  try {
    var mq = matchMedia("(prefers-color-scheme: dark)");
    var follow = function (e) { var s = null; try { s = localStorage.getItem("theme"); } catch (x) {} if (!s) setTheme(e.matches, false); };
    if (mq.addEventListener) mq.addEventListener("change", follow);
  } catch (e) {}

  // ---- sheet ----
  var open = null; // { sheet, trigger }
  function triggersFor(id) { return document.querySelectorAll('[data-ui8kit="sheet-trigger"][aria-controls="' + id + '"]'); }
  function setExpanded(id, v) { var t = triggersFor(id); for (var i = 0; i < t.length; i++) t[i].setAttribute("aria-expanded", v ? "true" : "false"); }
  function focusables(sheet) {
    var all = sheet.querySelectorAll(FOCUSABLE), out = [];
    for (var i = 0; i < all.length; i++) if (all[i].offsetParent !== null || all[i] === document.activeElement) out.push(all[i]);
    return out;
  }
  function openSheet(sheet, trigger) {
    if (open) closeSheet(false);
    // portal: a fixed dialog inside a stacking context (e.g. an isolated hero) could paint under later content
    if (sheet.parentNode !== document.body) document.body.appendChild(sheet);
    sheet.hidden = false;
    root.classList.add("ui-sheet-locked");
    setExpanded(sheet.id, true);
    open = { sheet: sheet, trigger: trigger };
    var f = focusables(sheet);
    (f[0] || sheet).focus();
  }
  function closeSheet(restore) {
    if (!open) return;
    var s = open.sheet, t = open.trigger;
    s.hidden = true;
    root.classList.remove("ui-sheet-locked");
    setExpanded(s.id, false);
    open = null;
    if (restore !== false && t && t.focus) t.focus();
  }

  document.addEventListener("click", function (e) {
    var el = e.target instanceof Element ? e.target : null;
    if (!el) return;
    var hit = el.closest("[data-ui8kit]");
    if (!hit) return;
    var kind = hit.getAttribute("data-ui8kit");
    if (kind === "theme-toggle") { setTheme(!isDark(), true); return; }
    if (kind === "sheet-trigger") {
      var s = document.getElementById(hit.getAttribute("aria-controls") || "");
      if (!s) return;
      if (open && open.sheet === s) closeSheet(); else openSheet(s, hit);
      return;
    }
    if (kind === "sheet-close" || kind === "sheet-overlay") { closeSheet(); return; }
  });
  document.addEventListener("click", function (e) {
    // links inside the sheet (the closest data-ui8kit is the sheet root itself)
    var el = e.target instanceof Element ? e.target : null;
    if (open && el && el.closest("a[href]") && open.sheet.contains(el)) closeSheet(false);
  }, true);
  document.addEventListener("keydown", function (e) {
    if (!open) return;
    if (e.key === "Escape") { e.preventDefault(); closeSheet(); return; }
    if (e.key !== "Tab") return;
    var f = focusables(open.sheet);
    if (!f.length) { e.preventDefault(); return; }
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || !open.sheet.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  // close an open sheet when the viewport grows past the breakpoint that hides its trigger
  window.addEventListener("resize", function () { if (open && open.trigger && open.trigger.offsetParent === null) closeSheet(false); });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", syncToggles); else syncToggles();
  window.ui8kit = { setTheme: setTheme, syncToggles: syncToggles, closeSheet: closeSheet };
})();
