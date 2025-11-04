import express from "express";
import { validateUserInput } from "../middleware/validateInput.js";
import Joi from "joi";

const router = express.Router();

import {register, login, forgotPassword, resetPassword} from "../controllers/authControl.js";


const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});


router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
