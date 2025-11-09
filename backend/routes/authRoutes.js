import express from "express";
import { validateUserInput } from "../middleware/validateInput.js";
import Joi from "joi";

const router = express.Router();

import {register, login} from "../controllers/authControl.js";

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

export default router;
