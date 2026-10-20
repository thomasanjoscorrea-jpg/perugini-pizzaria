// Utilitários compartilhados
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const money = v => "R$ " + Number(v).toFixed(2).replace(".", ",");
export const norm = s => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
export const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// localStorage seguro (nunca lança erro)
export const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignora */ } }
};

// aviso rápido (toast)
let tt;
export function aviso(msg, erro = false) {
  const t = $("#toast");
  t.textContent = msg; t.className = "toast" + (erro ? " err" : ""); t.hidden = false;
  clearTimeout(tt); tt = setTimeout(() => { t.hidden = true; }, 2800);
}

// bloqueio de scroll com contador (evita travar o site)
let locks = 0;
export function lockScroll(on) {
  locks = Math.max(0, locks + (on ? 1 : -1));
  document.body.classList.toggle("lock", locks > 0);
}

// "camadas" (modal e carrinho): foco, ESC, overlay e foco preso
let atual = null, ultimoFoco = null;
export function abrirCamada(el) {
  if (atual) fecharCamada(true);
  ultimoFoco = document.activeElement; atual = el;
  el.hidden = false; $("#overlay").hidden = false; lockScroll(true); el.focus({ preventScroll: true });
}
export function fecharCamada(silencioso = false) {
  if (!atual) return;
  atual.hidden = true; $("#overlay").hidden = true; lockScroll(false);
  const f = ultimoFoco; atual = null;
  if (!silencioso && f && f.focus) f.focus({ preventScroll: true });
}
export function iniciarCamadas() {
  $("#overlay").addEventListener("click", () => fecharCamada());
  document.addEventListener("keydown", e => {
    if (!atual) return;
    if (e.key === "Escape") return fecharCamada();
    if (e.key !== "Tab") return;
    const f = $$("button,input,select,textarea,a[href]", atual).filter(x => !x.disabled && x.offsetParent);
    if (!f.length) return;
    const a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });
}
