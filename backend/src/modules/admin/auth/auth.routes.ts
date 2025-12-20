import { Router } from "express";
import { login, profile } from "./auth.controller.js";
import { validateBody, authMiddleware } from "@/middleware/index.js";
import { loginSchema } from "./auth.schema.js";

const router = Router();

router.post('/login', validateBody(loginSchema), login);
router.get('/profile', authMiddleware, profile);

export default router;
