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
    name: "Free",
    priceBRL: 0,
    adsLimit: 1,
    features: [
      "1 anúncio ativo",
      "Estatísticas básicas",
      "Suporte da comunidade",
    ],
    highlight: false,
  },
  {
    id: "basico",
    name: "Básico",
    priceBRL: 29.9,
    adsLimit: 3,
    features: [
      "3 anúncios ativos",
      "Estatísticas em tempo real",
      "Suporte por chat",
    ],
    highlight: false,
  },
  {
    id: "medio",
    name: "Médio",
    priceBRL: 79.9,
    adsLimit: 15,
    features: [
      "15 anúncios ativos",
      "Relatórios avançados",
      "Crescimento acelerado",
      "Suporte prioritário",
    ],
    highlight: false,
  },
  {
    id: "avancado",
    name: "Avançado",
    priceBRL: 149.9,
    adsLimit: 35,
    features: [
      "35 anúncios ativos",
      "Tráfego de alta intenção",
      "Painel completo de métricas",
      "Suporte VIP",
      "Boost de visibilidade",
    ],
    highlight: true,
  },
  {
    id: "ilimitado",
    name: "Ilimitado",
    priceBRL: 299.9,
    adsLimit: 9999,
    features: [
      "Anúncios ilimitados",
      "Performance máxima",
      "Insights estratégicos",
      "Gerente de conta dedicado",
      "Acesso antecipado a novidades",
    ],
    highlight: false,
  },
];
