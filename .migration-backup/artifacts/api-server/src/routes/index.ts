import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import profileRouter from "./profile.js";
import foodLogsRouter from "./food-logs.js";
import workoutLogsRouter from "./workout-logs.js";
import stepsRouter from "./steps.js";
import measurementsRouter from "./measurements.js";
import dailyLogsRouter from "./daily-logs.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/food-logs", foodLogsRouter);
router.use("/workout-logs", workoutLogsRouter);
router.use("/steps", stepsRouter);
router.use("/measurements", measurementsRouter);
router.use("/daily-logs", dailyLogsRouter);

export default router;
