import express from "express";
import Joi from "joi";
import User from "../models/userModel.js";
import {register,login,getMe,updateProfile,changePassword} from "../controllers/authControl.js";
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

// Get user by ID (for admin - protected)
router.get("/:userId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("firstName lastName email phone");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
