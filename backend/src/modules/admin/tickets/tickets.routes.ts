import { Router } from "express";
import { validateBody, validateParams } from "@/middleware/index.js";
import { checkTicketSchema, generateTicketsSchema, importTicketsSchema } from "./tickets.schema.js";
import ticketsController from "./tickets.controller.js";

const router = Router();

// Generate new tickets
router.post("/generate", validateBody(generateTicketsSchema), ticketsController.generate);

// Export all tickets (backup)
router.get("/export", ticketsController.export);

// Import tickets (restore)
router.post("/import", validateBody(importTicketsSchema), ticketsController.import);

// Get all tickets
router.get("/", ticketsController.index);

// Bulk delete (must be before /:serial to avoid route conflict)
router.delete("/bulk/all", ticketsController.destroyAll);

// Get single ticket
router.get("/:serial", validateParams(checkTicketSchema), ticketsController.show);

// Delete single ticket
router.delete("/:serial", validateParams(checkTicketSchema), ticketsController.destroy);

export default router;
