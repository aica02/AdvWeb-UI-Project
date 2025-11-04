import express from "express";
import { registerUser, loginUser } from "../controllers/authControl.js";
import { validateUserInput } from "../middleware/validateInput.js";
import Joi from "joi";

const router = express.Router();

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post("/register", validateUserInput(registerSchema), registerUser);
router.post("/login", validateUserInput(loginSchema), loginUser);

export default router;
