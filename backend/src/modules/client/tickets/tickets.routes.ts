import { Router } from "express";
import { validateBody } from "@/middleware/index.js";
import { authenticateTicketSchema } from "./tickets.schema.js";
import clientTicketsController from "./tickets.controller.js";
import { voterAuthMiddleware } from "@/middleware/auth.middleware.js";

const router = Router();

// Authenticate ticket (public - called when scanning QR code)
router.post("/auth", validateBody(authenticateTicketSchema), clientTicketsController.authenticate);

// Verify current voter token (requires voter auth)
router.get("/verify", voterAuthMiddleware, clientTicketsController.verify);

export default router;

