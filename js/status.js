// Horário de funcionamento e status aberto/fechado
import { $, $$ } from "./util.js";
const C = window.CONFIG;
const DIAS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const toMin = s => { const [h, m] = s.split(":"); return +h * 60 + +m; };

function agora() {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: C.fuso, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  const g = t => p.find(x => x.type === t).value;
  return { dia: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), min: (+g("hour") % 24) * 60 + +g("minute") };
}

export function estado() {
  if (C.lojaFechadaManual) return { aberto: false, msg: C.mensagemFechada || "Fechado temporariamente" };
  const { dia, min } = agora(), h = C.horarios[dia];
  if (h && min >= toMin(h[0]) && min < toMin(h[1])) {
    const falta = toMin(h[1]) - min;
    return { aberto: true, falta, soon: falta <= 30, msg: `Aberto agora · fechamos às ${h[1]}` };
  }
  if (h && min < toMin(h[0])) return { aberto: false, msg: `Fechado agora · abrimos hoje às ${h[0]}` };
  for (let i = 1; i <= 7; i++) {
    const d = (dia + i) % 7, hh = C.horarios[d];
    if (hh) return { aberto: false, msg: `Fechado agora · abrimos ${i === 1 ? "amanhã" : DIAS[d].toLowerCase()} às ${hh[0]}` };
  }
  return { aberto: false, msg: "Fechado" };
}

export function renderStatus() {
  const e = estado(), tb = $("#topbar");
  $("#statusText").textContent = e.aberto && e.soon ? `Fechamos em ${e.falta} min · último pedido em breve` : e.msg;
  tb.className = "topbar " + (e.aberto ? (e.soon ? "soon" : "open") : "closed");
  const sc = $("#statusCard");
  sc.className = "status-card " + (e.aberto ? "open" : "closed");
  sc.textContent = (e.aberto ? "🟢 " : "🔴 ") + e.msg;
  const w = $("#cWarn");
  if (w) { w.hidden = e.aberto; w.textContent = e.aberto ? "" : "Estamos fechados agora. Você pode enviar o pedido, mas ele será atendido quando abrirmos."; }
  const hoje = agora().dia;
  $$("#hoursTable tr").forEach(tr => tr.classList.toggle("today", +tr.dataset.d === hoje));
}

export function iniciarHorarios() {
  const tb = $("#hoursTable tbody");
  [2, 3, 4, 5, 6, 0, 1].forEach(d => {
    const h = C.horarios[d], tr = document.createElement("tr");
    tr.dataset.d = d;
    tr.innerHTML = `<td>${DIAS[d]}</td><td>${h ? h[0] + " às " + h[1] : "Fechado"}</td>`;
    tb.appendChild(tr);
  });
  renderStatus();
  setInterval(renderStatus, 30000);
}
