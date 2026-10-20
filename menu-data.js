// ===== CARDÁPIO PERUGINI (edite preços e sabores aqui) =====
const AZ = "azeitona e orégano";
window.MENU = {
  tamanhos: {
    P: { nome: "Pequena", pedacos: 4, sabores: 1 },
    M: { nome: "Média", pedacos: 6, sabores: 2 },
    G: { nome: "Grande", pedacos: 8, sabores: 2 }
  },
  borda: {
    precos: { P: 12, M: 14, G: 16 },
    sabores: ["Requeijão", "Cheddar", "Mussarela", "Cream cheese", "Chocolate branco", "Doce de leite", "Goiabada", "Chocolate ao leite"]
  },
  categorias: [
    {
      id: "tradicionais", nome: "Tradicionais", precos: { P: 45.9, M: 54.9, G: 59.9 },
      itens: [
        [1, "Vegetariana", `mussarela, pimentão, cebola, ervilha, tomate, palmito, milho, ${AZ}`],
        [2, "Portuguesa", `mussarela, presunto, ovo, palmito, pimentão, ervilha, cebola, ${AZ}`],
        [3, "Palmito", `mussarela, palmito, ${AZ}`],
        [4, "Napolitana", `mussarela, rodelas de tomate, queijo parmesão, ${AZ}`],
        [5, "Mussarela", `mussarela, rodelas de tomate, ${AZ}`],
        [6, "Marguerita", `mussarela, rodelas de tomate, manjericão, ${AZ}`],
        [7, "Calabresa", `mussarela, linguiça calabresa, cebola, ${AZ}`],
        [8, "Atum", `mussarela, atum, cebola, ${AZ}`],
        [9, "Bacon", `mussarela, bacon, ${AZ}`],
        [10, "Milho", `mussarela, milho, ${AZ}`],
        [11, "Mista (Ele e Ela)", `mussarela, presunto, ${AZ}`],
        [12, "Frango", `mussarela, frango, ${AZ}`],
        [13, "Frango com milho", `mussarela, frango, milho, ${AZ}`],
        [14, "Frango com catupiry", `mussarela, frango, catupiry, ${AZ}`],
        [15, "Brócolis", `mussarela, brócolis refogado, ${AZ}`],
        [16, "Brasileira", `mussarela, ervilha, milho, palmito, rodelas de tomate, manjericão, ${AZ}`]
      ]
    },
    {
      id: "especiais", nome: "Especiais", precos: { P: 47.9, M: 59.9, G: 64.9 },
      itens: [
        [17, "Espanhola", `mussarela, linguiça calabresa, cebola, ${AZ}`],
        [18, "Toscana", `mussarela, linguiça toscana, bacon, catupiry, ${AZ}`],
        [19, "Siciliana", `mussarela, bacon, champignon ao molho sac, ${AZ}`],
        [20, "Calabresa com cream cheese", `mussarela, linguiça calabresa, cebola, cream cheese, ${AZ}`],
        [21, "Frango com bacon", `mussarela, frango, bacon, ${AZ}`],
        [22, "Frango com cheddar", `mussarela, frango, cheddar, ${AZ}`],
        [23, "Frango com cream cheese", `mussarela, frango, cream cheese, ${AZ}`],
        [24, "Lombinho", `mussarela, lombo defumado, cebola, ${AZ}`],
        [25, "Lombo com catupiry", `mussarela, lombo defumado, catupiry, ${AZ}`],
        [26, "Lombani", `mussarela, lombo defumado, abacaxi, ${AZ}`],
        [27, "Quatro queijos", `mussarela, presunto, provolone, parmesão, catupiry, ${AZ}`],
        [28, "Crocante", `mussarela, bacon, batata palha, ${AZ}`],
        [29, "Francesa", `mussarela, presunto, ervilha, batata palha, ${AZ}`],
        [30, "Brócolis com bacon", `mussarela, brócolis, bacon, ${AZ}`],
        [31, "Filé de frango", `mussarela, filé de frango, ${AZ}`],
        [32, "Stroganoff de frango", `mussarela, strogonoff de frango, batata palha, ${AZ}`],
        [33, "Prestígio", `mussarela, frango, milho, cream cheese, ${AZ}`]
      ]
    },
    {
      id: "premium", nome: "Premium", precos: { P: 52.9, M: 62.9, G: 72.9 },
      itens: [
        [34, "Pepperoni", `mussarela, pepperoni, cebola, ${AZ}`],
        [35, "Baiana", `mussarela, carne charque, ovo, cebola, pimentão, molho picante, ${AZ}`],
        [36, "Stroganoff de carne", `mussarela, strogonoff de carne, batata palha, ${AZ}`],
        [37, "Filé", `mussarela, filé, ${AZ}`],
        [38, "Filé com cheddar", `mussarela, filé, cheddar, ${AZ}`],
        [39, "Filé com catupiry", `mussarela, filé, catupiry, ${AZ}`],
        [40, "Filé com cream cheese", `mussarela, filé, cream cheese, ${AZ}`],
        [41, "Filé acebolado", `mussarela, filé, cebola, ${AZ}`],
        [42, "Moda da casa", `mussarela, presunto, frango, milho, bacon, ${AZ}`],
        [43, "Perugini", `mussarela, frango, milho, bacon, catupiry, batata palha, ${AZ}`]
      ]
    },
    {
      id: "doces", nome: "Doces", precos: { P: 47.9, M: 54.9, G: 62.9 },
      itens: [
        [44, "Sedução", "mussarela, creme de leite, chocolate branco e morango"],
        [45, "Dois amores", "mussarela, creme de leite, chocolate preto e branco"],
        [46, "Dois amores com morango", "mussarela, creme de leite, chocolate preto, branco e morango"],
        [47, "Brigadeiro", "mussarela, creme de leite, chocolate preto e granulado"],
        [48, "Brigadeiro com morango", "mussarela, creme de leite, chocolate preto, granulado e morango"],
        [49, "Confete", "mussarela, creme de leite, chocolate ao leite e confete"],
        [50, "Prestígio doce", "mussarela, creme de leite, chocolate ao leite e coco"],
        [51, "Beijinho", "mussarela, creme de leite, chocolate branco e coco"],
        [52, "Charge", "mussarela, creme de leite, chocolate ao leite e amendoim"],
        [53, "Banoffe", "mussarela, creme de leite, banana e doce de leite"],
        [54, "Abacaxi nevado", "mussarela, creme de leite, abacaxi e chocolate branco"],
        [55, "Abacaxi com canela", "mussarela, creme de leite, abacaxi e canela"],
        [56, "Abacaxi com coco", "mussarela, creme de leite, abacaxi e coco"],
        [57, "Banana nevada", "mussarela, creme de leite, banana e chocolate branco"],
        [58, "Banana com canela", "mussarela, creme de leite, banana e canela"],
        [59, "Banana com chocolate", "mussarela, creme de leite, banana e chocolate ao leite"],
        [60, "Romeu e Julieta", "mussarela, creme de leite e goiabada"],
        [61, "Ouro Branco", "mussarela, creme de leite, chocolate branco e bombom ouro branco"]
      ]
    }
  ],
  bebidas: [
    { grupo: "Refrigerantes", itens: [
      ["Coca-Cola 2L", 16], ["Coca-Cola vidro 1L", 10], ["Coca-Cola 600ml", 8], ["Coca-Cola 350ml", 6],
      ["Coca-Cola Zero 2L", 16], ["Coca-Cola Zero 600ml", 8], ["Coca-Cola Zero 350ml", 6],
      ["Fanta Laranja 2L", 13], ["Sprite 2L", 13], ["Sprite 350ml", 6], ["Tubaína Ouro Verde 2L", 11]
    ]},
    { grupo: "Águas e sucos", itens: [
      ["Água sem gás 500ml", 3], ["Água com gás 500ml", 3],
      ["Suco de laranja natural 900ml", 17], ["Suco de laranja natural 1,7L", 25],
      ["Suco Del Valle Uva 290ml", 6], ["Suco Del Valle Manga 290ml", 6],
      ["Suco Del Valle Pêssego 290ml", 6], ["Suco Del Valle Maracujá 290ml", 6]
    ]},
    { grupo: "Alcoólicas (maiores de 18 anos)", itens: [
      ["Skol lata", 6], ["Brahma lata", 6], ["Amstel lata", 6], ["Heineken long neck", 8]
    ]}
  ]
};
