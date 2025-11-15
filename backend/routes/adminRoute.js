import express from "express";
import { getAdminStats, getAllUsers, getBookSales } from "../controllers/adminDashboardController.js";
import { protect, adminOnly } from "../middleware/authMiddlew.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getAdminStats);
router.get("/useraccountsdelete", protect, adminOnly, getAllUsers);
router.get("/booksales", protect, adminOnly, getBookSales);

export default router;
