import express from "express";
import Joi from "joi";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/authControl.js";
import { protect } from "../middleware/authMiddlew.js";
import { validateUserInput } from "../middleware/validateInput.js";

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

// Protected Routes
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;
