import { Router } from "express";
import { authMiddleware } from "@/middleware/index.js";
import dashboardController from "./dashboard.controller.js";

const router = Router();

// All dashboard routes require admin authentication
router.use(authMiddleware);

// Get dashboard statistics
router.get("/stats", dashboardController.getStats);

// Get recent activities
router.get("/activities", dashboardController.getRecentActivities);

// Get voting statistics
router.get("/voting-stats", dashboardController.getVotingStatistics);

export default router;

