import { Router, type IRouter } from "express";
import healthRouter from "./health";
import fitnessRouter from "./fitness";

const router: IRouter = Router();

router.use(healthRouter);
router.use(fitnessRouter);

export default router;
