import type { Response, NextFunction } from "express";
import { prisma } from "@/config/index.js";
import { sendSuccess, sendCreated } from "@/utils/index.js";
import { AppError } from "@/middleware/index.js";
import type { VoterRequest } from "@/middleware/auth.middleware.js";
import type { CastVoteInput } from "./votes.schema.js";

// Settings ID for singleton pattern
const SETTINGS_ID = "default";

/**
 * Helper to check if voting is currently enabled
 */
const isVotingEnabled = async (): Promise<boolean> => {
	const settings = await prisma.settings.findUnique({
		where: { id: SETTINGS_ID },
	});
	return settings?.votingEnabled ?? false;
};

const clientVotesController = {
	/**
	 * Cast a vote for a candidate
	 * Each ticket can only vote once per category
	 */
	castVote: async (
		req: VoterRequest & { body: CastVoteInput },
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			const { candidateId, categoryId } = req.body;
			const ticketId = req.voter?.ticketId;

			if (!ticketId) {
				throw new AppError("Authentication required", 401);
			}

			// Verify the ticket exists in the database
			const ticketExists = await prisma.ticket.findUnique({
				where: { id: ticketId },
			});

			if (!ticketExists) {
				throw new AppError("Invalid ticket. Please scan your ticket again.", 401);
			}

			// Check if voting is enabled
			const votingEnabled = await isVotingEnabled();
			if (!votingEnabled) {
				throw new AppError("Voting is not currently enabled. Please wait for the event to start.", 403);
			}

			// Verify the candidate exists and belongs to the category
			const candidate = await prisma.candidate.findUnique({
				where: { id: candidateId },
				include: { category: true },
			});

			if (!candidate) {
				throw new AppError("Candidate not found", 404);
			}

			if (candidate.categoryId !== categoryId) {
				throw new AppError("Candidate does not belong to this category", 400);
			}

			// Check if ticket has already voted in this category
			const existingVote = await prisma.vote.findUnique({
				where: {
					ticketId_categoryId: {
						ticketId,
						categoryId,
					},
				},
			});

			if (existingVote) {
				throw new AppError("You have already voted in this category", 400);
			}

			// Create the vote
			const vote = await prisma.vote.create({
				data: {
					ticketId,
					candidateId,
					categoryId,
				},
			});

			// Get updated voted categories for this ticket
			const votedCategories = await prisma.vote.findMany({
				where: { ticketId },
				select: { categoryId: true },
			});

			sendCreated(res, {
				vote: {
					id: vote.id,
					candidateId: vote.candidateId,
					categoryId: vote.categoryId,
				},
				votedCategories: votedCategories.map((v) => v.categoryId),
			}, "Vote cast successfully");
		} catch (error) {
			next(error);
		}
	},

	/**
	 * Cancel a vote in a category
	 */
	cancelVote: async (
		req: VoterRequest & { params: { categoryId: string } },
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			const { categoryId } = req.params;
			const ticketId = req.voter?.ticketId;

			if (!ticketId) {
				throw new AppError("Authentication required", 401);
			}

			// Find the existing vote
			const existingVote = await prisma.vote.findUnique({
				where: {
					ticketId_categoryId: {
						ticketId,
						categoryId,
					},
				},
			});

			if (!existingVote) {
				throw new AppError("No vote found in this category", 404);
			}

			// Delete the vote
			await prisma.vote.delete({
				where: { id: existingVote.id },
			});

			// Get updated voted categories for this ticket
			const votedCategories = await prisma.vote.findMany({
				where: { ticketId },
				select: { categoryId: true },
			});

			sendSuccess(res, {
				votedCategories: votedCategories.map((v) => v.categoryId),
			}, "Vote cancelled successfully");
		} catch (error) {
			next(error);
		}
	},

	/**
	 * Get voting status for current ticket in a category
	 */
	getVoteStatus: async (
		req: VoterRequest & { params: { categoryId: string } },
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			const { categoryId } = req.params;
			const ticketId = req.voter?.ticketId;

			if (!ticketId) {
				throw new AppError("Authentication required", 401);
			}

			const vote = await prisma.vote.findUnique({
				where: {
					ticketId_categoryId: {
						ticketId,
						categoryId,
					},
				},
				select: {
					candidateId: true,
				},
			});

			sendSuccess(res, {
				hasVoted: !!vote,
				votedCandidateId: vote?.candidateId || null,
			}, "Vote status retrieved");
		} catch (error) {
			next(error);
		}
	},
};

export default clientVotesController;

