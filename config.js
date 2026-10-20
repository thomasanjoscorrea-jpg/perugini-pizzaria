// ===== CONFIGURAÇÕES DA PERUGINI (edite aqui) =====
window.CONFIG = {
  nome: "Pizzaria Perugini",
  slogan: "A pizza de respeito",
  frase: "Conectando a você a melhor pizza",
  whatsapp: "5544998382025",
  telefoneExibicao: "(44) 99838-2025",
  instagram: "peruginipizzaria",
  endereco: "Rua José Munhoz, 370 - Sarandi/PR",
  fuso: "America/Sao_Paulo",
  // 0=Domingo ... 6=Sábado. Segunda-feira fechada.
  horarios: {
    0: ["18:00", "23:30"],
    1: null,
    2: ["18:00", "23:30"],
    3: ["18:00", "23:30"],
    4: ["18:00", "23:30"],
    5: ["18:00", "23:30"],
    6: ["18:00", "23:30"]
  },
  // Deixe null para "consultar no atendimento". Ex.: 5 para R$ 5,00
  taxaEntrega: null,
  // Taxa por bairro (sobrepõe a taxa acima). Ex.: { "Centro": 5, "Jardim Alvorada": 8 }
  bairros: {},
  // Pedido mínimo em reais. Deixe null para não exigir.
  pedidoMinimo: null,
  // Troque para true para mostrar "fechado" mesmo dentro do horário (feriado, imprevisto)
  lojaFechadaManual: false,
  mensagemFechada: "Fechado temporariamente",
  // Números dos sabores sem estoque hoje. Ex.: [7, 12]
  indisponiveis: [],
  // Sugerir bebidas no carrinho
  sugerirBebidas: true,
  pagamentos: ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro"]
};
