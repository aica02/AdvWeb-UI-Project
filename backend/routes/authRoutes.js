import express from "express";
import Joi from "joi";
import User from "../models/userModel.js";
import { protect } from "../middleware/authMiddlew.js";
import { validateUserInput } from "../middleware/validateInput.js";
import { register, login, checkEmail, resetPassword, getMe, updateProfile, changePassword } from "../controllers/authControl.js";

const router = express.Router();

// Validation Schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Public Routes
router.post("/register", validateUserInput(registerSchema), register);
router.post("/login", validateUserInput(loginSchema), login);
router.post("/check-email", checkEmail); // Check if email exists (for forgot password)
router.post("/reset-password", resetPassword); // Reset password after OTP verified on client

router.post("/register", register);
router.post("/login", login);
router.post("/reset-password/:token", resetPassword);

export default router;
