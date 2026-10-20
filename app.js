(() => {
  const C = window.CONFIG, M = window.MENU;
  const $ = (s, r = document) => r.querySelector(s);
  let lastFocus = null;
  const lockScroll = on => document.body.classList.toggle("lock", on);
  let tt;
  function aviso(msg, err) { const t = $("#toast"); t.textContent = msg; t.className = "toast" + (err ? " err" : ""); t.hidden = false; clearTimeout(tt); tt = setTimeout(() => t.hidden = true, 2600); }
  const money = v => "R$ " + v.toFixed(2).replace(".", ",");
  const DIAS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

  /* ---------- Horário / aberto ou fechado ---------- */
  function agora() {
    const p = new Intl.DateTimeFormat("en-US", { timeZone: C.fuso, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    const g = t => p.find(x => x.type === t).value;
    const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday"));
    return { dia, min: (+g("hour") % 24) * 60 + +g("minute") };
  }
  const toMin = s => { const [h, m] = s.split(":"); return +h * 60 + +m; };
  function estado() {
    const { dia, min } = agora();
    const h = C.horarios[dia];
    if (h && min >= toMin(h[0]) && min < toMin(h[1])) {
      const falta = toMin(h[1]) - min;
      return { aberto: true, falta, msg: `Aberto agora · fechamos às ${h[1]}`, soon: falta <= 30 };
    }
    if (h && min < toMin(h[0])) return { aberto: false, msg: `Fechado agora · abrimos hoje às ${h[0]}` };
    for (let i = 1; i <= 7; i++) {
      const d = (dia + i) % 7, hh = C.horarios[d];
      if (hh) return { aberto: false, msg: `Fechado agora · abrimos ${i === 1 ? "amanhã" : DIAS[d].toLowerCase()} às ${hh[0]}` };
    }
    return { aberto: false, msg: "Fechado" };
  }
  function renderStatus() {
    const e = estado(), tb = $("#topbar");
    let msg = e.msg;
    if (e.aberto && e.soon) msg = `Fechamos em ${e.falta} min · último pedido em breve`;
    $("#statusText").textContent = msg;
    tb.className = "topbar " + (e.aberto ? (e.soon ? "soon" : "open") : "closed");
    const sc = $("#statusCard");
    sc.className = "status-card " + (e.aberto ? "open" : "closed");
    sc.textContent = (e.aberto ? "🟢 " : "🔴 ") + e.msg;
    const w = $("#cWarn");
    if (w) { w.hidden = e.aberto; w.textContent = e.aberto ? "" : "Estamos fechados agora. Você pode enviar o pedido, mas ele será atendido quando abrirmos."; }
    document.querySelectorAll("#hoursTable tr").forEach(tr => tr.classList.toggle("today", +tr.dataset.d === agora().dia));
  }
  function renderHours() {
    const tb = $("#hoursTable tbody");
    [2, 3, 4, 5, 6, 0, 1].forEach(d => {
      const h = C.horarios[d];
      const tr = document.createElement("tr"); tr.dataset.d = d;
      tr.innerHTML = `<td>${DIAS[d]}</td><td>${h ? h[0] + " às " + h[1] : "Fechado"}</td>`;
      tb.appendChild(tr);
    });
  }

  /* ---------- Links ---------- */
  const wa = txt => `https://wa.me/${C.whatsapp}` + (txt ? `?text=${encodeURIComponent(txt)}` : "");
  ["#waLink", "#waFloat"].forEach(s => $(s).href = wa("Olá! Gostaria de fazer um pedido."));
  $("#payList").textContent = C.pagamentos.join(", ") + ".";

  /* ---------- Cardápio ---------- */
  const todas = [];
  M.categorias.forEach(c => c.itens.forEach(([n, nome, ing]) => todas.push({ n, nome, ing, cat: c })));
  let aba = M.categorias[0].id, busca = "";
  const abas = [...M.categorias.map(c => ({ id: c.id, nome: c.nome })), { id: "bebidas", nome: "Bebidas" }];

  function renderTabs() {
    const t = $("#tabs"); t.innerHTML = "";
    abas.forEach(a => {
      const b = document.createElement("button");
      b.className = "tab" + (a.id === aba && !busca ? " on" : ""); b.textContent = a.nome; b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", a.id === aba && !busca); b.onclick = () => { aba = a.id; busca = ""; $("#search").value = ""; renderTabs(); renderMenu(); };
      t.appendChild(b);
    });
  }
  const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  let idxCard = 0;
  function pizzaCard(p) {
    const b = document.createElement("button");
    b.className = "card";
    const pre = { tradicionais: "tr", especiais: "es", premium: "pr", doces: "do" }[p.cat.id];
    b.innerHTML = `<div class="ph"><img loading="lazy" src="assets/img/${pre}${(p.n % 4) + 1}.jpg" alt="Pizza ${p.nome}"><span class="num">Nº ${p.n}</span></div><h4>${p.nome}</h4><p>${p.ing}</p>
      <div class="prices">${Object.entries(p.cat.precos).map(([k, v]) => `<span>${k} <b>${money(v)}</b></span>`).join("")}</div>
      <span class="add">+ Escolher</span>`;
    b.style.animationDelay = Math.min(idxCard++ * 30, 400) + "ms";
    b.onclick = () => abrirModal(p);
    return b;
  }
  function renderMenu() {
    const g = $("#menuGrid"); g.innerHTML = ""; idxCard = 0;
    let count = 0;
    if (busca) {
      const q = norm(busca);
      const achadas = todas.filter(p => norm(p.nome + " " + p.ing + " " + p.n).includes(q));
      achadas.forEach(p => g.appendChild(pizzaCard(p))); count = achadas.length;
      M.bebidas.forEach(gr => gr.itens.filter(i => norm(i[0]).includes(q)).forEach(i => { g.appendChild(drinkEl(i)); count++; }));
    } else if (aba === "bebidas") {
      M.bebidas.forEach(gr => {
        const h = document.createElement("div"); h.className = "group-title"; h.innerHTML = `<h3>${gr.grupo}</h3>`; g.appendChild(h);
        gr.itens.forEach(i => g.appendChild(drinkEl(i)));
      }); count = 1;
    } else {
      const c = M.categorias.find(x => x.id === aba);
      const h = document.createElement("div"); h.className = "cat-banner";
      const pre = { tradicionais: "tr", especiais: "es", premium: "pr", doces: "do" }[c.id];
      h.style.backgroundImage = `url(assets/img/${pre}1.jpg)`;
      h.innerHTML = `<div><h3>Pizzas ${c.nome}</h3><p>${c.itens.length} sabores · ${Object.entries(c.precos).map(([k, v]) => `${k} ${money(v)}`).join(" · ")}</p></div>`;
      g.appendChild(h);
      todas.filter(p => p.cat === c).forEach(p => g.appendChild(pizzaCard(p))); count = 1;
    }
    $("#empty").hidden = count > 0;
  }
  function drinkEl([nome, preco]) {
    const d = document.createElement("div"); d.className = "drink";
    d.innerHTML = `<span>${nome}</span><span><b>${money(preco)}</b><button aria-label="Adicionar ${nome}">+</button></span>`;
    d.querySelector("button").onclick = () => addItem({ tipo: "bebida", nome, unit: preco, qty: 1 });
    return d;
  }
  let deb; $("#search").addEventListener("input", e => { clearTimeout(deb); const v = e.target.value.trim(); deb = setTimeout(() => { busca = v; renderTabs(); renderMenu(); }, 180); });

  /* ---------- Modal de pizza ---------- */
  let cur = null, st = {};
  const preco = (p, t) => p.cat.precos[t];
  function calcModal() {
    let base = preco(cur, st.t);
    if (st.half && st.second) base = Math.max(base, preco(st.second, st.t));
    const borda = st.borda ? M.borda.precos[st.t] : 0;
    st.unit = base + borda;
    $("#mPrice").textContent = money(st.unit * st.qty);
  }
  function abrirModal(p) {
    cur = p; st = { t: "M", half: false, second: null, borda: false, bordaSabor: M.borda.sabores[0], qty: 1 };
    $("#mTitle").textContent = `Nº ${p.n} · ${p.nome}`;
    $("#mDesc").textContent = p.ing;
    $("#mObs").value = ""; $("#mHalf").checked = false; $("#mBorda").checked = false; $("#mQty").textContent = 1;
    $("#mSecond").hidden = true; $("#mHalfHint").hidden = true; $("#mBordaSel").hidden = true;
    const sel = $("#mSecond"); sel.innerHTML = "";
    todas.filter(x => x !== p).forEach(x => { const o = document.createElement("option"); o.value = x.n; o.textContent = `Nº ${x.n} · ${x.nome}`; sel.appendChild(o); });
    const bs = $("#mBordaSel"); bs.innerHTML = M.borda.sabores.map(s => `<option>${s}</option>`).join("");
    renderSizes(); calcModal();
    $("#overlay").hidden = false; $("#modal").hidden = false; lockScroll(true); lastFocus = document.activeElement; $("#modal").focus();
    $("#modal").scrollTop = 0;
  }
  function renderSizes() {
    const box = $("#mSizes"); box.innerHTML = "";
    Object.entries(M.tamanhos).forEach(([k, t]) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "opt" + (k === st.t ? " on" : "");
      b.innerHTML = `${t.nome} (${k})<small>${t.pedacos} pedaços · ${money(preco(cur, k))}</small>`;
      b.onclick = () => {
        st.t = k;
        if (M.tamanhos[k].sabores < 2) { st.half = false; $("#mHalf").checked = false; $("#mSecond").hidden = true; $("#mHalfHint").hidden = true; }
        $("#mHalfBox").hidden = M.tamanhos[k].sabores < 2;
        renderSizes(); calcModal();
      };
      box.appendChild(b);
    });
    $("#mHalfBox").hidden = M.tamanhos[st.t].sabores < 2;
  }
  $("#mHalf").onchange = e => {
    st.half = e.target.checked;
    $("#mSecond").hidden = !st.half; $("#mHalfHint").hidden = !st.half;
    st.second = st.half ? todas.find(x => x.n == $("#mSecond").value) : null; calcModal();
  };
  $("#mSecond").onchange = e => { st.second = todas.find(x => x.n == e.target.value); calcModal(); };
  $("#mBorda").onchange = e => { st.borda = e.target.checked; $("#mBordaSel").hidden = !st.borda; calcModal(); };
  $("#mBordaSel").onchange = e => st.bordaSabor = e.target.value;
  $("#mMinus").onclick = () => { st.qty = Math.max(1, st.qty - 1); $("#mQty").textContent = st.qty; calcModal(); };
  $("#mPlus").onclick = () => { st.qty = Math.min(20, st.qty + 1); $("#mQty").textContent = st.qty; calcModal(); };
  const fecharModal = () => { if ($("#modal").hidden) return; $("#overlay").hidden = true; $("#modal").hidden = true; lockScroll(false); lastFocus && lastFocus.focus && lastFocus.focus(); };
  $("#mClose").onclick = fecharModal;
  $("#mAdd").onclick = () => {
    const t = M.tamanhos[st.t];
    const nome = st.half && st.second
      ? `Pizza ${t.nome} (${st.t}) meia a meia: ½ Nº${cur.n} ${cur.nome} + ½ Nº${st.second.n} ${st.second.nome}`
      : `Pizza ${t.nome} (${st.t}): Nº${cur.n} ${cur.nome}`;
    const det = [];
    if (st.borda) det.push(`Borda recheada de ${st.bordaSabor} (+${money(M.borda.precos[st.t])})`);
    const obs = $("#mObs").value.trim(); if (obs) det.push("Obs: " + obs);
    addItem({ tipo: "pizza", nome, det, unit: st.unit, qty: st.qty });
    fecharModal();
  };

  /* ---------- Carrinho ---------- */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("perugini_cart") || "[]"); } catch (e) {}
  const save = () => { try { localStorage.setItem("perugini_cart", JSON.stringify(cart)); } catch (e) {} };
  const sub = () => cart.reduce((s, i) => s + i.unit * i.qty, 0);
  function addItem(it) {
    const key = it.nome + (it.det || []).join("|");
    const ex = cart.find(c => c.nome + (c.det || []).join("|") === key && c.unit === it.unit);
    if (ex) ex.qty += it.qty; else cart.push(it);
    save(); renderCart(); toast(); aviso("Adicionado ao pedido ✓");
  }
  function toast() {
    const b = $("#miniOpen"); b.animate([{ transform: "scale(1.06)" }, { transform: "none" }], 250);
    const c = $("#openCart"); c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump");
  }
  function renderCart() {
    const n = cart.reduce((s, i) => s + i.qty, 0), tot = sub();
    $("#cartCount").textContent = n; $("#cartTotalH").textContent = money(tot);
    $("#miniCart").hidden = n === 0;
    $("#miniCount").textContent = n + (n === 1 ? " item" : " itens"); $("#miniTotal").textContent = money(tot);
    const list = $("#cartList"); list.innerHTML = "";
    cart.forEach((it, idx) => {
      const d = document.createElement("div"); d.className = "ci";
      d.innerHTML = `<b>${it.nome}</b><span class="p">${money(it.unit * it.qty)}</span>
        ${(it.det || []).map(x => `<small>${x}</small>`).join("")}
        <div class="ctl"><div class="qty"><button aria-label="Diminuir">−</button><span>${it.qty}</span><button aria-label="Aumentar">+</button></div><button class="rm">Remover</button></div>`;
      const [m, p] = d.querySelectorAll(".qty button");
      m.onclick = () => { it.qty--; if (it.qty < 1) cart.splice(idx, 1); save(); renderCart(); };
      p.onclick = () => { it.qty = Math.min(50, it.qty + 1); save(); renderCart(); };
      d.querySelector(".rm").onclick = () => { cart.splice(idx, 1); save(); renderCart(); };
      list.appendChild(d);
    });
    const has = cart.length > 0;
    $("#cartEmpty").hidden = has; $("#checkout").hidden = !has; $("#cFoot").hidden = !has;
    $("#cSub").textContent = money(tot);
    $("#cNote").textContent = tipo() === "Entrega"
      ? (C.taxaEntrega == null ? "A taxa de entrega será informada no atendimento e somada ao total." : `Taxa de entrega: ${money(C.taxaEntrega)}`)
      : "Retirada na pizzaria: sem taxa de entrega.";
    renderStatus();
  }
  const tipo = () => ($("#fTipo .on") || {}).dataset?.v || "Entrega";
  const openCart = () => { lastFocus = document.activeElement; $("#drawer").hidden = false; $("#overlay").hidden = false; lockScroll(true); renderCart(); $("#drawer").focus(); };
  const closeCart = () => { if ($("#drawer").hidden) return; $("#drawer").hidden = true; $("#overlay").hidden = true; lockScroll(false); lastFocus && lastFocus.focus && lastFocus.focus(); };
  $("#openCart").onclick = openCart; $("#miniOpen").onclick = openCart; $("#cClose").onclick = closeCart;
  $("#overlay").onclick = () => { fecharModal(); closeCart(); };
  document.addEventListener("keydown", e => { if (e.key === "Escape") { fecharModal(); closeCart(); } });
  $("#cClear").onclick = () => { if (confirm("Limpar todo o pedido?")) { cart = []; save(); renderCart(); } };

  $("#fPag").innerHTML = `<option value="">Selecione...</option>` + C.pagamentos.map(p => `<option>${p}</option>`).join("");
  $("#fPag").onchange = e => $("#trocoBox").hidden = e.target.value !== "Dinheiro";
  document.querySelectorAll("#fTipo .opt").forEach(b => b.onclick = () => {
    document.querySelectorAll("#fTipo .opt").forEach(x => x.classList.remove("on")); b.classList.add("on");
    $("#addrBox").hidden = b.dataset.v === "Retirada"; renderCart();
  });
  try { const s = JSON.parse(localStorage.getItem("perugini_cli") || "{}"); ["fNome", "fTel", "fRua", "fBairro", "fComp", "fRef"].forEach(k => { if (s[k]) $("#" + k).value = s[k]; }); } catch (e) {}

  $("#cSend").onclick = () => {
    const req = ["fNome", "fTel", "fPag"]; if (tipo() === "Entrega") req.push("fRua", "fBairro");
    let bad = null;
    ["fNome", "fTel", "fRua", "fBairro", "fPag"].forEach(k => $("#" + k).classList.remove("err"));
    req.forEach(k => { if (!$("#" + k).value.trim()) { $("#" + k).classList.add("err"); bad = bad || $("#" + k); } });
    if (bad) { bad.focus(); aviso("Preencha os campos obrigatórios marcados em vermelho.", true); return; }
    try { const s = {}; ["fNome", "fTel", "fRua", "fBairro", "fComp", "fRef"].forEach(k => s[k] = $("#" + k).value); localStorage.setItem("perugini_cli", JSON.stringify(s)); } catch (e) {}
    const L = ["*NOVO PEDIDO - SITE PERUGINI*", ""];
    cart.forEach((it, i) => {
      L.push(`${i + 1}) ${it.qty}x ${it.nome} - ${money(it.unit * it.qty)}`);
      (it.det || []).forEach(d => L.push("    " + d));
    });
    L.push("", `*Subtotal:* ${money(sub())}`);
    L.push(tipo() === "Entrega" ? (C.taxaEntrega == null ? "*Taxa de entrega:* a confirmar" : `*Taxa de entrega:* ${money(C.taxaEntrega)}`) : "*Retirada na pizzaria*");
    const total = sub() + (tipo() === "Entrega" && C.taxaEntrega ? C.taxaEntrega : 0);
    L.push(`*Total${tipo() === "Entrega" && C.taxaEntrega == null ? " (sem taxa)" : ""}:* ${money(total)}`, "");
    L.push(`*Cliente:* ${$("#fNome").value.trim()}`, `*Telefone:* ${$("#fTel").value.trim()}`, `*Recebimento:* ${tipo()}`);
    if (tipo() === "Entrega") {
      L.push(`*Endereço:* ${$("#fRua").value.trim()} - ${$("#fBairro").value.trim()}${$("#fComp").value.trim() ? " - " + $("#fComp").value.trim() : ""}, Sarandi/PR`);
      if ($("#fRef").value.trim()) L.push(`*Referência:* ${$("#fRef").value.trim()}`);
    }
    L.push(`*Pagamento:* ${$("#fPag").value}`);
    if ($("#fPag").value === "Dinheiro" && $("#fTroco").value.trim()) L.push(`*Troco para:* ${$("#fTroco").value.trim()}`);
    if ($("#fObs").value.trim()) L.push(`*Observações:* ${$("#fObs").value.trim()}`);
    window.open(wa(L.join("\n")), "_blank", "noopener");
  };

  /* ---------- Menu mobile ---------- */
  $("#burger").onclick = () => $("#burger").setAttribute("aria-expanded", $("#nav").classList.toggle("open"));
  $("#nav").addEventListener("click", e => { if (e.target.tagName === "A") $("#nav").classList.remove("open"); });

  renderHours(); renderTabs(); renderMenu(); renderCart(); renderStatus();
  setInterval(renderStatus, 30000);

  /* ---------- Imersão: scroll, parallax, contadores ---------- */
  document.documentElement.classList.add("js");
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = $(".header"), prog = $("#progress"), topBtn = $("#toTop");
  function onScroll() {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    header.classList.toggle("scrolled", y > 40);
    topBtn.hidden = y < 700;
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  topBtn.onclick = () => scrollTo({ top: 0, behavior: reduz ? "auto" : "smooth" });

  // revelar elementos ao entrar na tela
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .12 });
  document.querySelectorAll(".reveal").forEach((el, i) => { el.style.setProperty("--d", (i % 4) * 0.08 + "s"); io.observe(el); });

  // link ativo do menu conforme a seção
  const links = [...document.querySelectorAll("#nav a")];
  const so = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  links.forEach(a => { const s = $(a.getAttribute("href")); s && so.observe(s); });

  // parallax suave do hero com o mouse
  const hero = $(".hero");
  if (!reduz && matchMedia("(pointer:fine)").matches) {
    hero.addEventListener("mousemove", e => {
      const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      hero.style.setProperty("--px", x * -18 + "px"); hero.style.setProperty("--py", y * -18 + "px");
      hero.style.setProperty("--mx", (x + .5) * 100 + "%"); hero.style.setProperty("--my", (y + .5) * 100 + "%");
    });
  }

  // contadores animados
  document.querySelectorAll("[data-count]").forEach(el => {
    const alvo = +el.dataset.count; if (reduz) return;
    const co = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; co.disconnect();
      const t0 = performance.now();
      (function passo(t) { const k = Math.min((t - t0) / 1200, 1); el.textContent = Math.round(alvo * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(passo); })(t0);
    }); co.observe(el);
  });

  // setas do teclado nas abas + foco preso no modal/carrinho
  $("#tabs").addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const bs = [...document.querySelectorAll("#tabs .tab")], i = bs.indexOf(document.activeElement);
    if (i < 0) return; const n = bs[(i + (e.key === "ArrowRight" ? 1 : bs.length - 1)) % bs.length];
    n.click(); document.querySelectorAll("#tabs .tab")[bs.indexOf(n)].focus();
  });
  document.addEventListener("keydown", e => {
    if (e.key !== "Tab") return;
    const box = !$("#modal").hidden ? $("#modal") : !$("#drawer").hidden ? $("#drawer") : null; if (!box) return;
    const f = [...box.querySelectorAll("button,input,select,textarea,a[href]")].filter(x => !x.hidden && x.offsetParent);
    if (!f.length) return; const a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });

  // máscara de telefone
  $("#fTel").addEventListener("input", e => {
    const d = e.target.value.replace(/\D/g, "").slice(0, 11);
    e.target.value = d.length > 10 ? d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3") : d.length > 6 ? d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3") : d.length > 2 ? d.replace(/(\d{2})(\d*)/, "($1) $2") : d;
  });
})();
