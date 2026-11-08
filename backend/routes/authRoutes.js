import express from "express";
import Joi from "joi";
import User from "../models/userModel.js";
import { protect } from "../middleware/authMiddlew.js";
import { validateUserInput } from "../middleware/validateInput.js";
import rateLimit from "express-rate-limit";
import { register, login, checkEmail, sendResetOtp, verifyResetOtp, resetPassword, getMe, updateProfile, changePassword } from "../controllers/authControl.js";

const router = express.Router();

// Throttle the forgot-password endpoints (per IP)
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

// Validation Schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
// Public Routes
router.post("/register", validateUserInput(registerSchema), register);
router.post("/login", validateUserInput(loginSchema), login);
router.post("/check-email", resetLimiter, checkEmail); // Check if email exists (for forgot password)
router.post("/forgot-password/send-otp", resetLimiter, sendResetOtp); // Server generates + emails OTP
router.post("/forgot-password/verify-otp", resetLimiter, verifyResetOtp); // Returns one-time reset token
router.post("/reset-password", resetLimiter, resetPassword); // Requires reset token from verify-otp

export default router;