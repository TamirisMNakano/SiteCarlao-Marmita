// Dados do Cardápio por Dia da Semana e taxa de entrega
const MENU_DATA = {
  taxaEntrega: 7.00,
  dias: {
    segunda: {
      nome: "Segunda-feira",
      itens: [
        {
          id: "seg-1",
          nome: "Marmita Virado à Paulista",
          preco: 26.00,
          descricao: "Arroz, tutu de feijão, bisteca de porco, couve refogada, ovo frito e banana empanada.",
          personalizacoesPossiveis: ["ponto da bisteca", "gema mole ou dura", "sem couve", "sem banana"]
        },
        {
          id: "seg-2",
          nome: "Marmita Frango Grelhado Fit",
          preco: 23.50,
          descricao: "Filé de frango grelhado, arroz integral, feijão carioca e legumes no vapor.",
          personalizacoesPossiveis: ["pouco sal", "sem alho", "sem legumes", "feijão separado"]
        },
        {
          id: "seg-3",
          nome: "Marmita Bife de Vaca Acebolado",
          preco: 28.00,
          descricao: "Bife de alcatra acebolado, arroz branco, feijão carioca, farofa crocante e batata frita.",
          personalizacoesPossiveis: ["ponto da carne (mal passado, ao ponto, bem passado)", "sem cebola", "pouco óleo", "pouco sal"]
        }
      ]
    },
    terca: {
      nome: "Terça-feira",
      itens: [
        {
          id: "ter-1",
          nome: "Marmita Dobradinha Tradicional",
          preco: 27.00,
          descricao: "Dobradinha com feijão branco, linguiça calabresa, bacon, arroz branco e couve.",
          personalizacoesPossiveis: ["com pimenta ou sem pimenta", "sem bacon", "sem couve"]
        },
        {
          id: "ter-2",
          nome: "Marmita Bife à Rolê",
          preco: 29.00,
          descricao: "Bife recheado com cenoura e bacon ao molho madeira, purê de batatas e arroz.",
          personalizacoesPossiveis: ["ponto do cozimento", "sem molho madeira", "sem cenoura no recheio", "pouco sal"]
        },
        {
          id: "ter-3",
          nome: "Marmita Parmegiana de Frango",
          preco: 28.50,
          descricao: "Filé de frango empanado crocante coberto com queijo derretido, molho de tomate caseiro e arroz.",
          personalizacoesPossiveis: ["molho separado", "sem queijo", "bem crocante"]
        }
      ]
    },
    quarta: {
      nome: "Quarta-feira",
      itens: [
        {
          id: "qua-1",
          nome: "Marmita Feijoada Completa",
          preco: 32.00,
          descricao: "Feijão preto com carnes nobres (costelinha, carne seca, paio), arroz, couve, farofa e laranja.",
          personalizacoesPossiveis: ["sem paio", "sem couve", "molho de pimenta separado", "pouco sal"]
        },
        {
          id: "qua-2",
          nome: "Marmita Bife de Vaca Grelhado",
          preco: 28.00,
          descricao: "Bife de contrafilé grelhado com alho torrado, arroz branco, feijão e salada de folhas.",
          personalizacoesPossiveis: ["ponto da carne (mal passado, ao ponto, bem passado)", "sem alho", "sem cebola", "pouco sal"]
        },
        {
          id: "qua-3",
          nome: "Marmita Omelete Especial",
          preco: 22.00,
          descricao: "Omelete de 3 ovos com queijo branco, tomate, orégano, arroz integral e salada verde.",
          personalizacoesPossiveis: ["gema bem passada", "sem orégano", "sem tomate", "pouco sal"]
        }
      ]
    },
    quinta: {
      nome: "Quinta-feira",
      itens: [
        {
          id: "qui-1",
          nome: "Marmita Macarronada com Almôndegas",
          preco: 26.00,
          descricao: "Espaguete ao sugo com almôndegas de carne bovina artesanais e bastante queijo parmesão.",
          personalizacoesPossiveis: ["massa al dente ou bem cozida", "queijo à parte", "sem queijo", "sem cheiro-verde"]
        },
        {
          id: "qui-2",
          nome: "Marmita Bife Acebolado Especial",
          preco: 28.00,
          descricao: "Bife bovino macio salteado na manteiga com cebolas douradas, arroz, feijão e purê.",
          personalizacoesPossiveis: ["ponto da carne (mal passado, ao ponto, bem passado)", "sem cebola", "sem manteiga", "pouco sal"]
        },
        {
          id: "qui-3",
          nome: "Marmita Strogonoff de Frango",
          preco: 27.50,
          descricao: "Strogonoff cremoso de frango com champignon, arroz branco e batata palha super crocante.",
          personalizacoesPossiveis: ["sem champignon", "batata palha separada", "pouco creme de leite"]
        }
      ]
    },
    sexta: {
      nome: "Sexta-feira",
      itens: [
        {
          id: "sex-1",
          nome: "Marmita Peixe ao Molho de Camarão",
          preco: 34.00,
          descricao: "Filé de tilápia grelhado coberto com molho cremoso de camarão, arroz branco e pirão de peixe.",
          personalizacoesPossiveis: ["sem coentro", "sem pirão", "pouco sal", "pimenta à parte"]
        },
        {
          id: "sex-2",
          nome: "Marmita Bife à Milanesa",
          preco: 29.00,
          descricao: "Bife bovino empanado dourado e crocante, arroz branco, feijão fresquinho e purê de batata.",
          personalizacoesPossiveis: ["ponto da carne", "bem frito/crocante", "pouco sal", "sem limão"]
        },
        {
          id: "sex-3",
          nome: "Marmita Feijoada Light",
          preco: 30.00,
          descricao: "Feijoada com lombo e carne seca magra, arroz branco, couve e farofa da casa.",
          personalizacoesPossiveis: ["sem carne seca", "sem couve", "pouco sal"]
        }
      ]
    },
    sabado: {
      nome: "Sábado",
      itens: [
        {
          id: "sab-1",
          nome: "Marmita Feijoada Completa Tradicional",
          preco: 35.00,
          descricao: "Tradicional feijoada completa com costelinha, lombo, paio e bacon, arroz, couve refogada e torresmo.",
          personalizacoesPossiveis: ["sem torresmo", "torresmo separado", "sem couve", "pimenta separada"]
        },
        {
          id: "sab-2",
          nome: "Marmita Costela no Bafo",
          preco: 36.00,
          descricao: "Costela bovina desmanchando assada lentamente no bafo, mandioca cozida na manteiga de garrafa e arroz.",
          personalizacoesPossiveis: ["mandioca bem macia", "sem manteiga de garrafa", "carne mais tostada ou bem macia"]
        },
        {
          id: "sab-3",
          nome: "Marmita Bife de Vaca Acebolado",
          preco: 28.00,
          descricao: "Bife de alcatra acebolado, arroz branco, feijão e fritas sequinhas.",
          personalizacoesPossiveis: ["ponto da carne (mal passado, ao ponto, bem passado)", "sem cebola", "pouco sal"]
        }
      ]
    },
    domingo: {
      nome: "Domingo",
      itens: [
        {
          id: "dom-1",
          nome: "Marmita Lasanha à Bolonhesa Familiar",
          preco: 32.00,
          descricao: "Camadas generosas de massa artesanal, molho bolonhesa encorpado, queijo mussarela e presunto gratinados.",
          personalizacoesPossiveis: ["bem gratinada", "sem presunto", "pouco orégano"]
        },
        {
          id: "dom-2",
          nome: "Marmita Frango Assado de Domingo",
          preco: 26.50,
          descricao: "Coxa e sobrecoxa assadas com batatas coradas douradas, arroz branco e farofa especial.",
          personalizacoesPossiveis: ["pele bem crocante", "sem farofa", "pouco sal"]
        },
        {
          id: "dom-3",
          nome: "Marmita Bife de Picanha Fatiada",
          preco: 39.00,
          descricao: "Picanha grelhada fatiada com alho crocante, arroz biro-biro, vinagrete e mandioca frita.",
          personalizacoesPossiveis: ["ponto da picanha (mal passada, ao ponto, bem passada)", "sem alho", "sem vinagrete", "pouco sal"]
        }
      ]
    }
  }
};
