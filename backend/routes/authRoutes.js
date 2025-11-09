import express from "express";
import { validateUserInput } from "../middleware/validateInput.js";
import Joi from "joi";
import { register, login, getMe, updateProfile } from "../controllers/authControl.js";
import { protect } from "../middleware/authMiddlew.js";

const router = express.Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

export default router;
