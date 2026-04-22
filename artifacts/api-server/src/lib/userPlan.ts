export const PLAN_LIMITS: Record<string, number> = {
  free: 1,
  basico: 3,
  medio: 15,
  avancado: 35,
  ilimitado: 9999,
};

export const PLANS = [
  {
    id: "free",
    name: "Grátis",
    priceBRL: 0,
    adsLimit: 1,
    features: [
      "1 anúncio",
      "30 dias de teste",
      "Registra visualizações",
    ],
    highlight: false,
  },
  {
    id: "basico",
    name: "Básico",
    priceBRL: 5,
    adsLimit: 3,
    features: [
      "3 anúncios",
      "7 dias",
      "Registra cliques",
      "CTR em tempo real",
    ],
    highlight: false,
  },
  {
    id: "medio",
    name: "Médio",
    priceBRL: 10,
    adsLimit: 15,
    features: [
      "15 anúncios",
      "1 mês",
      "Registra cliques",
      "CTR em tempo real",
    ],
    highlight: false,
  },
  {
    id: "avancado",
    name: "Avançado",
    priceBRL: 29.9,
    adsLimit: 35,
    features: [
      "35 anúncios",
      "2 meses",
      "Registra cliques",
      "CTR em tempo real",
      "Destaque VIP",
    ],
    highlight: true,
  },
  {
    id: "ilimitado",
    name: "Ilimitado",
    priceBRL: 49.9,
    adsLimit: 9999,
    features: [
      "Anúncios ilimitados",
      "3 meses",
      "Registra cliques",
      "CTR em tempo real",
      "Destaque máximo",
      "Suporte prioritário",
    ],
    highlight: false,
  },
];
