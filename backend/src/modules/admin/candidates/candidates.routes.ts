import { Router } from "express";
import { index, show, store, update, destroy, destroyAll, removeImage } from "./candidates.controller.js";
import { validateBody, validateParams, uploadImage } from "@/middleware/index.js";
import {
	createCandidateSchema,
	updateCandidateSchema,
	candidateIdSchema,
} from "./candidates.schema.js";

const router = Router();

// List all candidates
router.get("/", index);

// Bulk delete (must be before /:id to avoid route conflict)
router.delete("/bulk/all", destroyAll);

// Get single candidate
router.get("/:id", validateParams(candidateIdSchema), show);

// Create candidate (with optional image upload)
router.post("/", uploadImage.single("image"), validateBody(createCandidateSchema), store);

// Update candidate (with optional image upload)
router.patch("/:id", validateParams(candidateIdSchema), uploadImage.single("image"), validateBody(updateCandidateSchema), update);

// Delete candidate
router.delete("/:id", validateParams(candidateIdSchema), destroy);

// Remove image only
router.delete("/:id/image", validateParams(candidateIdSchema), removeImage);

export default router;
