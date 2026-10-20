// Ponto de entrada do site Perugini
import { $, aviso, iniciarCamadas } from "./util.js";
import { iniciarHorarios } from "./status.js";
import { iniciarMenu } from "./menu.js";
import { iniciarModal, abrirModal } from "./modal.js";
import { iniciarCarrinho, addItem } from "./cart.js";
import { iniciarEfeitos } from "./fx.js";

const C = window.CONFIG;

function iniciar() {
  iniciarCamadas();
  iniciarHorarios();

  // links do WhatsApp e pagamento
  const wa = txt => `https://wa.me/${C.whatsapp}` + (txt ? `?text=${encodeURIComponent(txt)}` : "");
  ["#waLink", "#waFloat"].forEach(s => { $(s).href = wa("Olá! Gostaria de fazer um pedido."); });
  $("#payList").textContent = C.pagamentos.join(", ") + ".";

  iniciarModal(addItem);
  iniciarMenu({ pizza: abrirModal, bebida: it => addItem({ ...it, det: [] }) });
  iniciarCarrinho();

  // menu mobile
  const nav = $("#nav"), burger = $("#burger");
  const alternar = abrir => { nav.classList.toggle("open", abrir); burger.setAttribute("aria-expanded", abrir); };
  burger.onclick = () => alternar(!nav.classList.contains("open"));
  nav.addEventListener("click", e => { if (e.target.tagName === "A") alternar(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") alternar(false); });

  iniciarEfeitos();

  // app instalável (PWA): registra o service worker
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

try { iniciar(); } catch (e) { console.error(e); aviso("Algo deu errado ao carregar. Atualize a página.", true); }
