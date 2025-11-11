import express from "express";
import { getAdminStats } from "../controllers/adminDashboardController.js";
import { protect, adminOnly } from "../middleware/authMiddlew.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getAdminStats);

export default router;
