import { Router } from "express";
import { validateBody } from "@/middleware/index.js";
import { voterAuthMiddleware } from "@/middleware/auth.middleware.js";
import { castVoteSchema } from "./votes.schema.js";
import clientVotesController from "./votes.controller.js";

const router = Router();

// All voting routes require voter authentication
router.use(voterAuthMiddleware);

// Cast a vote
router.post("/", validateBody(castVoteSchema), clientVotesController.castVote);

// Cancel a vote in a category
router.delete("/:categoryId", clientVotesController.cancelVote);

// Get vote status for a category
router.get("/status/:categoryId", clientVotesController.getVoteStatus);

export default router;

