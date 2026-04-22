import { Router, type IRouter } from "express";

const router: IRouter = Router();

const NAMES = [
  "João",
  "Maria",
  "Lucas",
  "Ana",
  "Pedro",
  "Camila",
  "Rafael",
  "Beatriz",
  "Gustavo",
  "Larissa",
  "Felipe",
  "Mariana",
  "Bruno",
  "Juliana",
  "Thiago",
  "Carolina",
  "Diego",
  "Patrícia",
  "Rodrigo",
  "Fernanda",
  "Matheus",
  "Letícia",
  "Vinícius",
  "Amanda",
];

const PLANS_NAMES = ["Básico", "Médio", "Avançado", "Ilimitado"];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

router.get("/notifications/feed", (_req, res) => {
  const seed = Math.floor(Date.now() / (60 * 1000));
  const r = rng(seed);
  const out = Array.from({ length: 8 }, (_, i) => {
    const name = NAMES[Math.floor(r() * NAMES.length)]!;
    const plan = PLANS_NAMES[Math.floor(r() * PLANS_NAMES.length)]!;
    const minutesAgo = 1 + Math.floor(r() * 28);
    return {
      id: `${seed}-${i}`,
      name,
      plan,
      minutesAgo,
    };
  });
  res.json(out);
});

export default router;
