import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateCheckoutBody } from "@workspace/api-zod";
import { PLAN_LIMITS, PLANS } from "../lib/userPlan";
import { requireAuth, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

router.post("/payment/checkout", requireAuth, async (req, res) => {
  const { userId } = req as AuthedRequest;
  const parsed = CreateCheckoutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const planId = parsed.data.planId;
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) {
    res.status(400).json({ error: "Plano inválido" });
    return;
  }
  await db
    .update(usersTable)
    .set({ plan: planId, adsLimit: PLAN_LIMITS[planId]! })
    .where(eq(usersTable.id, userId));
  res.json({
    ok: true,
    plan: planId,
    message: `Plano ${plan.name} ativado com sucesso!`,
  });
});

// Webhook stub for Mercado Pago
router.post("/payment/webhook", (_req, res) => {
  res.json({ ok: true });
});

export default router;
