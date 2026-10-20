// Cardápio: abas, busca e cards
import { $, money, norm, esc } from "./util.js";
const C = window.CONFIG, M = window.MENU;
const PRE = { tradicionais: "tr", especiais: "es", premium: "pr", doces: "do" };

export const todas = [];
M.categorias.forEach(c => c.itens.forEach(([n, nome, ing]) => todas.push({ n, nome, ing, cat: c })));

let aba = M.categorias[0].id, busca = "", atraso = 0, handlers = {};
const abas = [...M.categorias.map(c => ({ id: c.id, nome: c.nome })), { id: "bebidas", nome: "Bebidas" }];
export const indisponivel = p => (C.indisponiveis || []).includes(p.n);

function renderTabs() {
  const t = $("#tabs"); t.innerHTML = "";
  abas.forEach(a => {
    const b = document.createElement("button"), on = a.id === aba && !busca;
    b.type = "button"; b.className = "tab" + (on ? " on" : ""); b.textContent = a.nome;
    b.setAttribute("aria-pressed", on);
    b.onclick = () => { aba = a.id; busca = ""; $("#search").value = ""; render(); };
    t.appendChild(b);
  });
}

function pizzaCard(p) {
  const off = indisponivel(p), b = document.createElement("button");
  b.type = "button"; b.className = "card" + (off ? " off" : ""); b.disabled = off;
  b.style.animationDelay = Math.min(atraso++ * 30, 360) + "ms";
  const img = `assets/img/${PRE[p.cat.id]}${(p.n % 4) + 1}.jpg`;
  b.innerHTML = `<div class="ph"><img loading="lazy" decoding="async" width="400" height="300" src="${img}" alt="Pizza ${esc(p.nome)}"><span class="num">Nº ${p.n}</span>${off ? '<span class="badge-off">Indisponível</span>' : ""}</div>
    <h3>${esc(p.nome)}</h3><p>${esc(p.ing)}</p>
    <div class="prices">${Object.entries(p.cat.precos).map(([k, v]) => `<span>${k} <b>${money(v)}</b></span>`).join("")}</div>
    <span class="add">${off ? "Volte em breve" : "+ Escolher"}</span>`;
  if (!off) b.onclick = () => handlers.pizza(p);
  return b;
}

function drinkEl([nome, preco]) {
  const d = document.createElement("div"); d.className = "drink";
  d.innerHTML = `<span>${esc(nome)}</span><span><b>${money(preco)}</b><button type="button" aria-label="Adicionar ${esc(nome)}">+</button></span>`;
  d.querySelector("button").onclick = () => handlers.bebida({ tipo: "bebida", nome, unit: preco, qty: 1 });
  return d;
}

function render() {
  const g = $("#menuGrid"); g.innerHTML = ""; atraso = 0; renderTabs();
  let count = 0;
  if (busca) {
    const q = norm(busca);
    todas.filter(p => norm(`${p.nome} ${p.ing} ${p.n}`).includes(q)).forEach(p => { g.appendChild(pizzaCard(p)); count++; });
    M.bebidas.forEach(gr => gr.itens.filter(i => norm(i[0]).includes(q)).forEach(i => { g.appendChild(drinkEl(i)); count++; }));
  } else if (aba === "bebidas") {
    M.bebidas.forEach(gr => {
      const h = document.createElement("div"); h.className = "group-title"; h.innerHTML = `<h3>${esc(gr.grupo)}</h3>`; g.appendChild(h);
      gr.itens.forEach(i => g.appendChild(drinkEl(i)));
    }); count = 1;
  } else {
    const c = M.categorias.find(x => x.id === aba), h = document.createElement("div");
    h.className = "cat-banner"; h.style.backgroundImage = `url(assets/img/${PRE[c.id]}1.jpg)`;
    h.innerHTML = `<div><h3>Pizzas ${esc(c.nome)}</h3><p>${c.itens.length} sabores · ${Object.entries(c.precos).map(([k, v]) => `${k} ${money(v)}`).join(" · ")}</p></div>`;
    g.appendChild(h);
    todas.filter(p => p.cat === c).forEach(p => g.appendChild(pizzaCard(p))); count = 1;
  }
  $("#empty").hidden = count > 0;
}

export function iniciarMenu(h) {
  handlers = h;
  let deb;
  $("#search").addEventListener("input", e => {
    clearTimeout(deb); const v = e.target.value;
    deb = setTimeout(() => { busca = v.trim(); render(); }, 180);
  });
  // navegação por setas nas abas
  $("#tabs").addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = abas.findIndex(a => a.id === aba), n = (i + (e.key === "ArrowRight" ? 1 : abas.length - 1)) % abas.length;
    aba = abas[n].id; busca = ""; $("#search").value = ""; render(); $("#tabs .tab.on").focus();
  });
  render();
}
