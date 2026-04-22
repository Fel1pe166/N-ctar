import { Router, type IRouter } from "express";
import healthRouter from "./health";
import userRouter from "./user";
import plansRouter from "./plans";
import adsRouter from "./ads";
import dashboardRouter from "./dashboard";
import paymentRouter from "./payment";
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(userRouter);
router.use(plansRouter);
router.use(adsRouter);
router.use(dashboardRouter);
router.use(paymentRouter);
router.use(notificationsRouter);

export default router;
