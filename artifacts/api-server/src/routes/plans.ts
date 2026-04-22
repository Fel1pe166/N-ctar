import { Router, type IRouter } from "express";
import { PLANS } from "../lib/userPlan";

const router: IRouter = Router();

router.get("/plans", (_req, res) => {
  res.json(PLANS);
});

export default router;
