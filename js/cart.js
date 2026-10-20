// Carrinho, checkout e envio pelo WhatsApp
import { $, $$, money, norm, esc, store, aviso, abrirCamada, fecharCamada } from "./util.js";
import { renderStatus } from "./status.js";
const C = window.CONFIG, M = window.MENU;
const CAMPOS = ["fNome", "fTel", "fRua", "fBairro", "fComp", "fRef"];

// carrinho salvo é validado para nunca quebrar o site
const valido = i => i && typeof i.nome === "string" && Number.isFinite(i.unit) && Number.isInteger(i.qty) && i.qty > 0;
let cart = (store.get("perugini_cart", []) || []).filter(valido).map(i => ({ ...i, det: Array.isArray(i.det) ? i.det.map(String) : [], qty: Math.min(i.qty, 50) }));
const salvar = () => store.set("perugini_cart", cart);
const subtotal = () => cart.reduce((s, i) => s + i.unit * i.qty, 0);
const tipo = () => ($("#fTipo .on") || {}).dataset?.v || "Entrega";

// taxa: pelo bairro (config.bairros) ou valor fixo/indefinido
function taxa() {
  if (tipo() !== "Entrega") return { valor: 0, texto: "Retirada na pizzaria: sem taxa de entrega." };
  const b = norm($("#fBairro").value), tab = C.bairros || {};
  const chave = Object.keys(tab).find(k => norm(k) === b);
  const v = chave !== undefined ? tab[chave] : C.taxaEntrega;
  if (v == null) return { valor: null, texto: "A taxa de entrega será informada no atendimento e somada ao total." };
  return { valor: v, texto: `Taxa de entrega: ${money(v)}` };
}

function sugestoes() {
  if (cart.some(i => i.tipo === "bebida") || !cart.length || C.sugerirBebidas === false) return [];
  const todos = M.bebidas.flatMap(g => g.itens);
  const pref = todos.filter(i => /2L|1,7L|900ml/.test(i[0]));
  return (pref.length >= 3 ? pref : todos).slice(0, 3);
}

export function addItem(it) {
  const chave = i => i.nome + "|" + (i.det || []).join("|");
  const novo = { ...it, det: it.det || [] };
  const ex = cart.find(c => chave(c) === chave(novo) && c.unit === novo.unit);
  if (ex) ex.qty = Math.min(50, ex.qty + novo.qty); else cart.push(novo);
  salvar(); render();
  const c = $("#openCart"); c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump");
  aviso("Adicionado ao pedido ✓");
}

function render() {
  const n = cart.reduce((s, i) => s + i.qty, 0), sub = subtotal(), tx = taxa();
  $("#cartCount").textContent = n; $("#cartTotalH").textContent = money(sub);
  $("#miniCart").hidden = n === 0;
  $("#miniCount").textContent = n + (n === 1 ? " item" : " itens"); $("#miniTotal").textContent = money(sub);

  const list = $("#cartList"); list.innerHTML = "";
  cart.forEach((it, idx) => {
    const d = document.createElement("div"); d.className = "ci";
    d.innerHTML = `<b>${esc(it.nome)}</b><span class="p">${money(it.unit * it.qty)}</span>
      ${it.det.map(x => `<small>${esc(x)}</small>`).join("")}
      <div class="ctl"><div class="qty"><button type="button" aria-label="Diminuir">−</button><span>${it.qty}</span><button type="button" aria-label="Aumentar">+</button></div><button type="button" class="rm">Remover</button></div>`;
    const [m, p] = d.querySelectorAll(".qty button");
    m.onclick = () => { it.qty--; if (it.qty < 1) cart.splice(idx, 1); salvar(); render(); };
    p.onclick = () => { it.qty = Math.min(50, it.qty + 1); salvar(); render(); };
    d.querySelector(".rm").onclick = () => { cart.splice(idx, 1); salvar(); render(); };
    list.appendChild(d);
  });

  const sug = sugestoes(), box = $("#cUpsell");
  box.hidden = !sug.length;
  if (sug.length) {
    box.innerHTML = `<h4>Que tal uma bebida?</h4><div class="up-row"></div>`;
    sug.forEach(([nome, preco]) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "up";
      b.innerHTML = `<span>${esc(nome)}</span><b>+ ${money(preco)}</b>`;
      b.onclick = () => addItem({ tipo: "bebida", nome, unit: preco, qty: 1, det: [] });
      box.lastChild.appendChild(b);
    });
  }

  const tem = cart.length > 0;
  $("#cartEmpty").hidden = tem; $("#checkout").hidden = !tem; $("#cFoot").hidden = !tem;
  $("#cSub").textContent = money(sub); $("#cNote").textContent = tx.texto;
  const min = C.pedidoMinimo, faltam = min && sub < min ? min - sub : 0, am = $("#cMin");
  am.hidden = !faltam; am.textContent = faltam ? `Pedido mínimo de ${money(min)}. Faltam ${money(faltam)}.` : "";
  $("#cSend").disabled = !!faltam;
  renderStatus();
}

function montarMensagem() {
  const tx = taxa(), ent = tipo() === "Entrega", v = id => $("#" + id).value.trim();
  const L = ["*NOVO PEDIDO - SITE PERUGINI*", ""];
  cart.forEach((it, i) => { L.push(`${i + 1}) ${it.qty}x ${it.nome} - ${money(it.unit * it.qty)}`); it.det.forEach(d => L.push("    " + d)); });
  L.push("", `*Subtotal:* ${money(subtotal())}`);
  L.push(ent ? (tx.valor == null ? "*Taxa de entrega:* a confirmar" : `*Taxa de entrega:* ${money(tx.valor)}`) : "*Retirada na pizzaria*");
  L.push(`*Total${ent && tx.valor == null ? " (sem taxa)" : ""}:* ${money(subtotal() + (tx.valor || 0))}`, "");
  L.push(`*Cliente:* ${v("fNome")}`, `*Telefone:* ${v("fTel")}`, `*Recebimento:* ${tipo()}`);
  if (ent) {
    L.push(`*Endereço:* ${v("fRua")} - ${v("fBairro")}${v("fComp") ? " - " + v("fComp") : ""}, Sarandi/PR`);
    if (v("fRef")) L.push(`*Referência:* ${v("fRef")}`);
  }
  L.push(`*Pagamento:* ${$("#fPag").value}`);
  if ($("#fPag").value === "Dinheiro" && v("fTroco")) L.push(`*Troco para:* ${v("fTroco")}`);
  if (v("fObs")) L.push(`*Observações:* ${v("fObs")}`);
  return L.join("\n");
}

function enviar() {
  const req = ["fNome", "fTel", "fPag"]; if (tipo() === "Entrega") req.push("fRua", "fBairro");
  ["fNome", "fTel", "fRua", "fBairro", "fPag"].forEach(k => $("#" + k).classList.remove("err"));
  let ruim = null;
  req.forEach(k => { if (!$("#" + k).value.trim()) { $("#" + k).classList.add("err"); ruim = ruim || $("#" + k); } });
  if (ruim) { ruim.focus(); aviso("Preencha os campos marcados em vermelho.", true); return; }
  if ($("#fTel").value.replace(/\D/g, "").length < 10) { $("#fTel").classList.add("err"); $("#fTel").focus(); aviso("Confira o telefone com DDD.", true); return; }
  const dados = {}; CAMPOS.forEach(k => { dados[k] = $("#" + k).value; }); store.set("perugini_cli", dados);
  const w = window.open(`https://wa.me/${C.whatsapp}?text=${encodeURIComponent(montarMensagem())}`, "_blank", "noopener");
  if (!w) aviso("O navegador bloqueou a janela. Libere pop-ups e tente de novo.", true);
  $("#cDone").hidden = false; $("#cDone").scrollIntoView({ block: "nearest" });
}

export function iniciarCarrinho() {
  $("#fPag").innerHTML = `<option value="">Selecione...</option>` + C.pagamentos.map(p => `<option>${esc(p)}</option>`).join("");
  $("#fPag").onchange = e => { $("#trocoBox").hidden = e.target.value !== "Dinheiro"; };
  $("#bairrosList").innerHTML = Object.keys(C.bairros || {}).map(b => `<option value="${esc(b)}">`).join("");
  $$("#fTipo .opt").forEach(b => b.onclick = () => {
    $$("#fTipo .opt").forEach(x => { x.classList.remove("on"); x.setAttribute("aria-pressed", "false"); });
    b.classList.add("on"); b.setAttribute("aria-pressed", "true");
    $("#addrBox").hidden = b.dataset.v === "Retirada"; render();
  });
  $("#fBairro").addEventListener("input", render);
  const s = store.get("perugini_cli", {}) || {};
  CAMPOS.forEach(k => { if (typeof s[k] === "string") $("#" + k).value = s[k]; });
  $("#fTel").addEventListener("input", e => {
    const d = e.target.value.replace(/\D/g, "").slice(0, 11);
    e.target.value = d.length > 10 ? d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3") : d.length > 6 ? d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3") : d.length > 2 ? d.replace(/(\d{2})(\d*)/, "($1) $2") : d;
  });
  const abrir = () => { $("#cDone").hidden = true; abrirCamada($("#drawer")); render(); };
  $("#openCart").onclick = abrir; $("#miniOpen").onclick = abrir; $("#cClose").onclick = () => fecharCamada();
  $("#cClear").onclick = () => { if (confirm("Limpar todo o pedido?")) { cart = []; salvar(); render(); } };
  $("#cNew").onclick = () => { cart = []; salvar(); $("#cDone").hidden = true; render(); fecharCamada(); };
  $("#cSend").onclick = enviar;
  render();
}
