import { Router, type IRouter } from "express";
import { db, adsTable, adEventsTable } from "@workspace/db";
import { eq, sql, and, gte } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req, res) => {
  const { userId, user } = req as AuthedRequest;
  const rows = await db
    .select({
      totalViews: sql<number>`coalesce(sum(${adsTable.views})::int, 0)`,
      totalClicks: sql<number>`coalesce(sum(${adsTable.clicks})::int, 0)`,
      totalAds: sql<number>`count(*)::int`,
    })
    .from(adsTable)
    .where(eq(adsTable.userId, userId));
  const r = rows[0]!;
  const ctr = r.totalViews > 0 ? r.totalClicks / r.totalViews : 0;
  res.json({
    totalViews: r.totalViews,
    totalClicks: r.totalClicks,
    ctr,
    totalAds: r.totalAds,
    adsLimit: user.adsLimit,
    plan: user.plan,
  });
});

router.get("/dashboard/timeseries", requireAuth, async (req, res) => {
  const { userId } = req as AuthedRequest;
  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${adEventsTable.createdAt}), 'YYYY-MM-DD')`,
      type: adEventsTable.type,
      count: sql<number>`count(*)::int`,
    })
    .from(adEventsTable)
    .where(
      and(
        eq(adEventsTable.userId, userId),
        gte(adEventsTable.createdAt, since),
      ),
    )
    .groupBy(
      sql`date_trunc('day', ${adEventsTable.createdAt})`,
      adEventsTable.type,
    );

  const map = new Map<string, { views: number; clicks: number }>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, { views: 0, clicks: 0 });
  }
  for (const r of rows) {
    const entry = map.get(r.day) ?? { views: 0, clicks: 0 };
    if (r.type === "view") entry.views = r.count;
    else if (r.type === "click") entry.clicks = r.count;
    map.set(r.day, entry);
  }
  const out = Array.from(map.entries()).map(([date, v]) => ({
    date,
    views: v.views,
    clicks: v.clicks,
  }));
  res.json(out);
});

export default router;
