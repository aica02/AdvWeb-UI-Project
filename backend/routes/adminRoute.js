import express from "express";
import { getAdminStats, getAllUsers, getBookSales, deleteUser } from "../controllers/adminDashboardController.js";
import { protect, adminOnly } from "../middleware/authMiddlew.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getAdminStats);
router.get("/useraccountsdelete", protect, adminOnly, getAllUsers);
router.delete("/useraccountsdelete/:id", protect, adminOnly, deleteUser);
router.get("/booksales", protect, adminOnly, getBookSales);

export default router;
