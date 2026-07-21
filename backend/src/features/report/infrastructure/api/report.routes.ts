import { Router } from "express";
import { container } from "../../../../infrastructure/container";
import { ReportController } from "./report.controller";

const reportController = new ReportController(
  container.categoryReportGetter,
  container.categoryTrendGetter,
);

const router = Router();

// MUST stay before "/categories" is fine (distinct path), order not critical.
router.get("/categories/trends", reportController.categoryTrend);
router.get("/categories", reportController.categoryReport);

export default router;
