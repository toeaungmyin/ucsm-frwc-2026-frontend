import {Router} from "express";
import { validateBody, validateParams } from "../../middleware/validate.middleware.js";
import { checkTicketSchema, generateTicketsSchema } from "./tickets.schema.js";
import ticketsGenerateController from "./tickets.controller.js";

const router = Router();

router.post("/generate" , validateBody(generateTicketsSchema),ticketsGenerateController.generateTickets);

router.get("/",ticketsGenerateController.getAllTickets);

router.get("/:uuid" , validateParams(checkTicketSchema),ticketsGenerateController.getTickets);

export default router;