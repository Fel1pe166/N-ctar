import { Router, type IRouter } from "express";
import { db, adsTable, adEventsTable, type Ad } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import { CreateAdBody } from "@workspace/api-zod";
import { requireAuth, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

function serialize(a: Ad) {
  const ctr = a.views > 0 ? a.clicks / a.views : 0;
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    link: a.link,
    views: a.views,
    clicks: a.clicks,
    ctr,
    createdAt: a.createdAt.toISOString(),
  };
}

router.get("/ads", requireAuth, async (req, res) => {
  const { userId } = req as AuthedRequest;
  const rows = await db
    .select()
    .from(adsTable)
    .where(eq(adsTable.userId, userId))
    .orderBy(sql`${adsTable.createdAt} desc`);
  res.json(rows.map(serialize));
});

router.post("/ads", requireAuth, async (req, res) => {
  const { userId, user } = req as AuthedRequest;
  const parsed = CreateAdBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", issues: parsed.error.issues });
    return;
  }

  const countRows = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(adsTable)
    .where(eq(adsTable.userId, userId));
  const current = countRows[0]?.c ?? 0;
  if (current >= user.adsLimit) {
    res.status(403).json({
      error: "Limite de anúncios do seu plano atingido. Faça upgrade.",
    });
    return;
  }

  const [created] = await db
    .insert(adsTable)
    .values({
      userId,
      title: parsed.data.title,
      description: parsed.data.description,
      link: parsed.data.link,
    })
    .returning();
  res.json(serialize(created!));
});

router.get("/ads/:id", async (req, res) => {
  const id = String(req.params.id);
  const rows = await db
    .select()
    .from(adsTable)
    .where(eq(adsTable.id, id))
    .limit(1);
  if (rows.length === 0) {
    res.status(404).json({ error: "Anúncio não encontrado" });
    return;
  }
  res.json(serialize(rows[0]!));
});

router.delete("/ads/:id", requireAuth, async (req, res) => {
  const { userId } = req as AuthedRequest;
  const id = String(req.params.id);
  await db
    .delete(adsTable)
    .where(and(eq(adsTable.id, id), eq(adsTable.userId, userId)));
  res.json({ ok: true });
});

router.post("/ads/:id/view", async (req, res) => {
  const id = String(req.params.id);
  const result = await db
    .update(adsTable)
    .set({ views: sql`${adsTable.views} + 1` })
    .where(eq(adsTable.id, id))
    .returning({ userId: adsTable.userId });
  if (result.length > 0) {
    await db.insert(adEventsTable).values({
      adId: id,
      userId: result[0]!.userId,
      type: "view",
    });
  }
  res.json({ ok: true });
});

router.post("/ads/:id/click", async (req, res) => {
  const id = String(req.params.id);
  const result = await db
    .update(adsTable)
    .set({ clicks: sql`${adsTable.clicks} + 1` })
    .where(eq(adsTable.id, id))
    .returning({ userId: adsTable.userId });
  if (result.length > 0) {
    await db.insert(adEventsTable).values({
      adId: id,
      userId: result[0]!.userId,
      type: "click",
    });
  }
  res.json({ ok: true });
});

export default router;
