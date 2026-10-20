// Efeitos visuais: scroll, revelar, parallax, contadores, brasas, tilt
import { $, $$, reduz } from "./util.js";

export function iniciarEfeitos() {
  document.documentElement.classList.add("js");
  const header = $(".header"), prog = $("#progress"), topo = $("#toTop"), foto = $(".hero-photo");

  // barra de progresso, header compacto, voltar ao topo e parallax da foto
  let tick = false;
  const aoRolar = () => {
    tick = false;
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${h > 0 ? Math.min(y / h, 1) : 0})`;
    header.classList.toggle("scrolled", y > 40);
    topo.hidden = y < 700;
    if (!reduz && y < innerHeight) foto.style.setProperty("--sy", `${y * -0.08}px`);
  };
  addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(aoRolar); } }, { passive: true });
  aoRolar();
  topo.onclick = () => scrollTo({ top: 0, behavior: reduz ? "auto" : "smooth" });

  // revelar ao entrar na tela (com plano B para nunca deixar conteúdo escondido)
  const els = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    els.forEach((el, i) => { el.style.setProperty("--d", (i % 4) * 0.08 + "s"); io.observe(el); });
    setTimeout(() => els.forEach(el => el.classList.add("in")), 4000);
  } else els.forEach(el => el.classList.add("in"));

  // link ativo do menu conforme a seção visível
  const links = $$("#nav a");
  if ("IntersectionObserver" in window) {
    const so = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
    }), { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(a => { const s = $(a.getAttribute("href")); if (s) so.observe(s); });
  }

  // contadores animados
  $$("[data-count]").forEach(el => {
    const alvo = +el.dataset.count;
    if (reduz || !("IntersectionObserver" in window)) return;
    const co = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; co.disconnect();
      const t0 = performance.now();
      const passo = t => { const k = Math.min((t - t0) / 1200, 1); el.textContent = Math.round(alvo * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(passo); };
      requestAnimationFrame(passo);
    }); co.observe(el);
  });

  const mouseFino = matchMedia("(pointer:fine)").matches;
  if (reduz || !mouseFino) return iniciarBrasas();

  // parallax com o mouse no hero
  const hero = $(".hero");
  hero.addEventListener("pointermove", e => {
    const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    hero.style.setProperty("--px", x * -18 + "px"); hero.style.setProperty("--py", y * -18 + "px");
    hero.style.setProperty("--mx", (x + 0.5) * 100 + "%"); hero.style.setProperty("--my", (y + 0.5) * 100 + "%");
  });

  // inclinação 3D dos cards do cardápio
  const grid = $("#menuGrid");
  grid.addEventListener("pointermove", e => {
    const c = e.target.closest(".card:not(.off)"); if (!c) return;
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    c.style.setProperty("--rx", (-y * 6).toFixed(2) + "deg"); c.style.setProperty("--ry", (x * 8).toFixed(2) + "deg");
  });
  grid.addEventListener("pointerout", e => {
    const c = e.target.closest(".card"); if (c) { c.style.removeProperty("--rx"); c.style.removeProperty("--ry"); }
  });
  iniciarBrasas();
}

// brasas subindo no hero (canvas leve, pausa quando fora da tela)
function iniciarBrasas() {
  const cv = $("#embers"); if (!cv || reduz) return;
  const ctx = cv.getContext("2d"), hero = $(".hero");
  let w = 0, h = 0, ativo = true, raf = 0;
  const N = innerWidth < 700 ? 18 : 36;
  const ps = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), r: 0.8 + Math.random() * 2.2, v: 0.0004 + Math.random() * 0.0009, o: Math.random() * 6.28, a: 0.25 + Math.random() * 0.5 }));
  const medir = () => { const d = devicePixelRatio || 1; w = hero.clientWidth; h = hero.clientHeight; cv.width = w * d; cv.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  medir(); addEventListener("resize", medir);
  const desenha = t => {
    ctx.clearRect(0, 0, w, h);
    for (const p of ps) {
      p.y -= p.v * 16; if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
      const x = (p.x + Math.sin(t / 1800 + p.o) * 0.015) * w, y = p.y * h;
      const g = ctx.createRadialGradient(x, y, 0, x, y, p.r * 4);
      g.addColorStop(0, `rgba(255,190,60,${p.a})`); g.addColorStop(1, "rgba(214,41,32,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, p.r * 4, 0, 6.28); ctx.fill();
    }
    if (ativo) raf = requestAnimationFrame(desenha);
  };
  const parar = () => { ativo = false; cancelAnimationFrame(raf); };
  const iniciar = () => { if (!ativo) { ativo = true; raf = requestAnimationFrame(desenha); } };
  if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? iniciar() : parar())).observe(hero);
  document.addEventListener("visibilitychange", () => (document.hidden ? parar() : iniciar()));
  raf = requestAnimationFrame(desenha);
}
