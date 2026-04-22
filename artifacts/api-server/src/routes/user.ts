import { Router, type IRouter } from "express";
import { requireAuth, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/me", requireAuth, (req, res) => {
  const u = (req as AuthedRequest).user;
  res.json({
    id: u.id,
    email: u.email ?? "",
    name: u.name ?? "",
    plan: u.plan,
    adsLimit: u.adsLimit,
    createdAt: u.createdAt.toISOString(),
  });
});

export default router;
