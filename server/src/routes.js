import { Router } from "express";
import authRoutes from "./modules/auth/routes.js";
import billingRoutes from "./modules/billing/routes.js";
import categoriesRoutes from "./modules/categories/routes.js";
import creditCardsRoutes from "./modules/credit-cards/routes.js";
import usersRoutes from "./modules/users/routes.js";
import debtsRoutes from "./modules/debts/routes.js";
import goalsRoutes from "./modules/goals/routes.js";
import incomesRoutes from "./modules/incomes/routes.js";
import incomeReceiptsRoutes from "./modules/income-receipts/routes.js";
import paymentsRoutes from "./modules/payments/routes.js";
import reportsRoutes from "./modules/reports/routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/billing", billingRoutes);
router.use("/categories", categoriesRoutes);
router.use("/credit-cards", creditCardsRoutes);
router.use("/users", usersRoutes);
router.use("/debts", debtsRoutes);
router.use("/goals", goalsRoutes);
router.use("/incomes", incomesRoutes);
router.use("/income-receipts", incomeReceiptsRoutes);
router.use("/payments", paymentsRoutes);
router.use("/reports", reportsRoutes);

export default router;
