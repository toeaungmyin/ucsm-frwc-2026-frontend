import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/index.js";
import { sendSuccess } from "@/utils/index.js";
import { getPublicUrl } from "@/services/index.js";

// Default settings ID (singleton pattern)
const SETTINGS_ID = "default";

/**
 * Get event configuration including countdown target time
 * Now reads from database for admin control
 */
export const getConfig = async (
	_req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const now = new Date();

		// Get settings from database
		let settings = await prisma.settings.findUnique({
			where: { id: SETTINGS_ID },
		});

		// Create default settings if not exists
		if (!settings) {
			settings = await prisma.settings.create({
				data: {
					id: SETTINGS_ID,
					eventName: "UCSM Fresher Welcome 2026",
					votingEnabled: false,
				},
			});
		}

		// Determine if event has started based on time
		const isEventStarted = settings.eventStartTime 
			? now >= settings.eventStartTime 
			: false;

		sendSuccess(res, {
			eventStartTime: settings.eventStartTime?.toISOString() || null,
			eventName: settings.eventName,
			// Voting is enabled if admin enabled it OR if event time has started
			votingEnabled: settings.votingEnabled,
			isEventStarted,
			serverTime: now.toISOString(),
			// Include promo video URL if exists
			promoVideoUrl: settings.promoVideo ? getPublicUrl(settings.promoVideo) : null,
		}, "Config fetched successfully");
	} catch (error) {
		next(error);
	}
};

