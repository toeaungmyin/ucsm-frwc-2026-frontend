import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/index.js";
import { sendSuccess } from "@/utils/index.js";
import { AppError } from "@/middleware/index.js";
import { uploadFile, deleteFile, getPublicUrl } from "@/services/index.js";
import type { UpdateSettingsInput } from "./settings.schema.js";
import { v4 as uuidv4 } from "uuid";

// Default settings ID (singleton pattern)
const SETTINGS_ID = "default";

/**
 * Get current settings
 */
export const getSettings = async (
	_req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		// Get or create settings
		let settings = await prisma.settings.findUnique({
			where: { id: SETTINGS_ID },
		});

		if (!settings) {
			// Create default settings if not exists
			settings = await prisma.settings.create({
				data: {
					id: SETTINGS_ID,
					eventName: "UCSM Fresher Welcome 2026",
					votingEnabled: false,
				},
			});
		}

		// Build response with video URL if exists
		const response = {
			...settings,
			promoVideoUrl: settings.promoVideo ? getPublicUrl(settings.promoVideo) : null,
		};

		sendSuccess(res, response, "Settings fetched successfully");
	} catch (error) {
		next(error);
	}
};

/**
 * Update settings
 */
export const updateSettings = async (
	req: Request & { body: UpdateSettingsInput },
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { eventName, eventStartTime, votingEnabled } = req.body;

		// Upsert settings
		const settings = await prisma.settings.upsert({
			where: { id: SETTINGS_ID },
			update: {
				...(eventName !== undefined && { eventName }),
				...(eventStartTime !== undefined && { 
					eventStartTime: eventStartTime ? new Date(eventStartTime) : null 
				}),
				...(votingEnabled !== undefined && { votingEnabled }),
			},
			create: {
				id: SETTINGS_ID,
				eventName: eventName || "UCSM Fresher Welcome 2026",
				eventStartTime: eventStartTime ? new Date(eventStartTime) : null,
				votingEnabled: votingEnabled || false,
			},
		});

		sendSuccess(res, settings, "Settings updated successfully");
	} catch (error) {
		next(error);
	}
};

/**
 * Toggle voting on/off
 */
export const toggleVoting = async (
	req: Request & { body: { enabled: boolean } },
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { enabled } = req.body;

		const settings = await prisma.settings.upsert({
			where: { id: SETTINGS_ID },
			update: { votingEnabled: enabled },
			create: {
				id: SETTINGS_ID,
				votingEnabled: enabled,
			},
		});

		sendSuccess(
			res,
			{ votingEnabled: settings.votingEnabled },
			`Voting ${enabled ? "enabled" : "disabled"} successfully`
		);
	} catch (error) {
		next(error);
	}
};

/**
 * Upload promo video
 */
export const uploadPromoVideo = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const file = req.file;

		if (!file) {
			throw new AppError("No video file provided", 400);
		}

		// Get current settings to check if there's an existing video
		const currentSettings = await prisma.settings.findUnique({
			where: { id: SETTINGS_ID },
		});

		// Delete old video if exists
		if (currentSettings?.promoVideo) {
			try {
				await deleteFile(currentSettings.promoVideo);
			} catch {
				// Ignore delete errors for old file
			}
		}

		// Generate unique filename
		const fileExtension = file.originalname.split(".").pop() || "mp4";
		const fileName = `promo-${uuidv4()}.${fileExtension}`;

		// Upload to MinIO
		const objectPath = await uploadFile(fileName, file.buffer, file.mimetype, "videos");

		// Update settings with new video path
		const settings = await prisma.settings.upsert({
			where: { id: SETTINGS_ID },
			update: { promoVideo: objectPath },
			create: {
				id: SETTINGS_ID,
				promoVideo: objectPath,
			},
		});

		sendSuccess(
			res,
			{
				promoVideo: settings.promoVideo,
				videoUrl: getPublicUrl(objectPath),
			},
			"Promo video uploaded successfully"
		);
	} catch (error) {
		next(error);
	}
};

/**
 * Delete promo video
 */
export const deletePromoVideo = async (
	_req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		// Get current settings
		const currentSettings = await prisma.settings.findUnique({
			where: { id: SETTINGS_ID },
		});

		if (!currentSettings?.promoVideo) {
			throw new AppError("No promo video to delete", 404);
		}

		// Delete from MinIO
		await deleteFile(currentSettings.promoVideo);

		// Update settings to remove video path
		const settings = await prisma.settings.update({
			where: { id: SETTINGS_ID },
			data: { promoVideo: null },
		});

		sendSuccess(res, settings, "Promo video deleted successfully");
	} catch (error) {
		next(error);
	}
};

