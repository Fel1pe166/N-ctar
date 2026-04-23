import { Router, type IRouter } from "express";
import { db, paymentsTable, usersTable, type Payment } from "@workspace/db";
import { and, eq, sql, desc, inArray } from "drizzle-orm";
import { CreatePaymentBody } from "@workspace/api-zod";
import { requireAuth, type AuthedRequest } from "../lib/auth";
import { requireAdmin } from "../lib/admin";
import { PLANS, PLAN_LIMITS } from "../lib/userPlan";
import { getPixKey, getPixQrUrl } from "../lib/pix";

const router: IRouter = Router();

function serialize(p: Payment) {
  return {
    id: p.id,
    userId: p.userId,
    userEmail: p.userEmail,
    userName: p.userName,
    plan: p.plan,
    amountBRL: p.amountCents / 100,
    pixKey: p.pixKey,
    proofUrl: p.proofUrl,
    status: p.status as "pending" | "approved" | "rejected",
    createdAt: p.createdAt.toISOString(),
    reviewedAt: p.reviewedAt ? p.reviewedAt.toISOString() : null,
  };
}

// Public PIX config (key + QR)
router.get("/pix/config", (_req, res) => {
  const pixKey = getPixKey();
  if (!pixKey) {
    res.status(503).json({ error: "PIX_KEY não configurado." });
    return;
  }
  res.json({
    pixKey,
    qrUrl: getPixQrUrl(pixKey),
    receiverName: "Néctar Agency",
  });
});

// Create payment (user uploads proof)
router.post("/payments", requireAuth, async (req, res) => {
  const { userId, user } = req as AuthedRequest;
  const parsed = CreatePaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos.", issues: parsed.error.issues });
    return;
  }
  const { planId, proofUrl } = parsed.data;
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan || plan.priceBRL <= 0) {
    res.status(400).json({ error: "Plano inválido para pagamento PIX." });
    return;
  }
  if (proofUrl.length > 6_000_000) {
    res.status(413).json({ error: "Comprovante muito grande (máx 5MB)." });
    return;
  }
  const pixKey = getPixKey();
  if (!pixKey) {
    res.status(503).json({ error: "PIX_KEY não configurado no servidor." });
    return;
  }
  const [created] = await db
    .insert(paymentsTable)
    .values({
      userId,
      userEmail: user.email,
      userName: user.name,
      plan: planId,
      amountCents: Math.round(plan.priceBRL * 100),
      pixKey,
      proofUrl,
      status: "pending",
    })
    .returning();
  res.json(serialize(created!));
});

// List user's payments
router.get("/payments", requireAuth, async (req, res) => {
  const { userId } = req as AuthedRequest;
  const rows = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.userId, userId))
    .orderBy(desc(paymentsTable.createdAt))
    .limit(50);
  res.json(rows.map(serialize));
});

// Admin list
router.get("/admin/payments", requireAdmin, async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : "pending";
  const where =
    status === "all"
      ? sql`true`
      : inArray(paymentsTable.status, [status]);
  const rows = await db
    .select()
    .from(paymentsTable)
    .where(where)
    .orderBy(desc(paymentsTable.createdAt))
    .limit(200);
  res.json(rows.map(serialize));
});

// Admin approve → activate plan
router.post("/admin/payments/:id/approve", requireAdmin, async (req, res) => {
  const id = String(req.params.id);
  const rows = await db
    .select()
    .from(paymentsTable)
    .where(and(eq(paymentsTable.id, id), eq(paymentsTable.status, "pending")))
    .limit(1);
  const payment = rows[0];
  if (!payment) {
    res.status(404).json({ error: "Pagamento não encontrado ou já revisado." });
    return;
  }
  const newLimit = PLAN_LIMITS[payment.plan] ?? 1;
  await db
    .update(usersTable)
    .set({ plan: payment.plan, adsLimit: newLimit })
    .where(eq(usersTable.id, payment.userId));
  const [updated] = await db
    .update(paymentsTable)
    .set({ status: "approved", reviewedAt: new Date() })
    .where(eq(paymentsTable.id, id))
    .returning();
  res.json(serialize(updated!));
});

// Admin reject
router.post("/admin/payments/:id/reject", requireAdmin, async (req, res) => {
  const id = String(req.params.id);
  const [updated] = await db
    .update(paymentsTable)
    .set({ status: "rejected", reviewedAt: new Date() })
    .where(and(eq(paymentsTable.id, id), eq(paymentsTable.status, "pending")))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Pagamento não encontrado ou já revisado." });
    return;
  }
  res.json(serialize(updated));
});

export default router;
