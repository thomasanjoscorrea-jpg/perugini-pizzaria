// Modal de escolha da pizza
import { $, money, abrirCamada, fecharCamada } from "./util.js";
import { todas } from "./menu.js";
const M = window.MENU;
let cur = null, st = {}, onAdd = () => {};
const preco = (p, t) => p.cat.precos[t];

function calc() {
  let base = preco(cur, st.t);
  if (st.half && st.second) base = Math.max(base, preco(st.second, st.t));
  st.unit = base + (st.borda ? M.borda.precos[st.t] : 0);
  $("#mPrice").textContent = money(st.unit * st.qty);
}

function renderSizes() {
  const box = $("#mSizes"); box.innerHTML = "";
  Object.entries(M.tamanhos).forEach(([k, t]) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "opt" + (k === st.t ? " on" : ""); b.setAttribute("aria-pressed", k === st.t);
    b.innerHTML = `${t.nome} (${k})<small>${t.pedacos} pedaços · ${money(preco(cur, k))}</small>`;
    b.onclick = () => {
      st.t = k;
      if (t.sabores < 2) { st.half = false; st.second = null; $("#mHalf").checked = false; $("#mSecond").hidden = true; $("#mHalfHint").hidden = true; }
      renderSizes(); calc();
    };
    box.appendChild(b);
  });
  $("#mHalfBox").hidden = M.tamanhos[st.t].sabores < 2;
}

export function abrirModal(p) {
  cur = p; st = { t: "M", half: false, second: null, borda: false, bordaSabor: M.borda.sabores[0], qty: 1 };
  $("#mTitle").textContent = `Nº ${p.n} · ${p.nome}`; $("#mDesc").textContent = p.ing;
  $("#mObs").value = ""; $("#mHalf").checked = false; $("#mBorda").checked = false; $("#mQty").textContent = 1;
  $("#mSecond").hidden = true; $("#mHalfHint").hidden = true; $("#mBordaSel").hidden = true;
  const sel = $("#mSecond"); sel.innerHTML = "";
  todas.filter(x => x !== p).forEach(x => { const o = document.createElement("option"); o.value = x.n; o.textContent = `Nº ${x.n} · ${x.nome}`; sel.appendChild(o); });
  $("#mBordaSel").innerHTML = M.borda.sabores.map(s => `<option>${s}</option>`).join("");
  renderSizes(); calc();
  abrirCamada($("#modal")); $("#modal").scrollTop = 0;
}

export function iniciarModal(adicionar) {
  onAdd = adicionar;
  $("#mHalf").onchange = e => {
    st.half = e.target.checked; $("#mSecond").hidden = !st.half; $("#mHalfHint").hidden = !st.half;
    st.second = st.half ? todas.find(x => x.n == $("#mSecond").value) : null; calc();
  };
  $("#mSecond").onchange = e => { st.second = todas.find(x => x.n == e.target.value); calc(); };
  $("#mBorda").onchange = e => { st.borda = e.target.checked; $("#mBordaSel").hidden = !st.borda; calc(); };
  $("#mBordaSel").onchange = e => { st.bordaSabor = e.target.value; };
  $("#mMinus").onclick = () => { st.qty = Math.max(1, st.qty - 1); $("#mQty").textContent = st.qty; calc(); };
  $("#mPlus").onclick = () => { st.qty = Math.min(20, st.qty + 1); $("#mQty").textContent = st.qty; calc(); };
  $("#mClose").onclick = () => fecharCamada();
  $("#mAdd").onclick = () => {
    const t = M.tamanhos[st.t];
    const nome = st.half && st.second
      ? `Pizza ${t.nome} (${st.t}) meia a meia: ½ Nº${cur.n} ${cur.nome} + ½ Nº${st.second.n} ${st.second.nome}`
      : `Pizza ${t.nome} (${st.t}): Nº${cur.n} ${cur.nome}`;
    const det = [];
    if (st.borda) det.push(`Borda recheada de ${st.bordaSabor} (+${money(M.borda.precos[st.t])})`);
    const obs = $("#mObs").value.trim(); if (obs) det.push("Obs: " + obs);
    fecharCamada(true);
    onAdd({ tipo: "pizza", nome, det, unit: st.unit, qty: st.qty });
  };
}
