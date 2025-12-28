import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/index.js";
import { sendSuccess } from "@/utils/index.js";
import { getPublicUrl } from "@/services/index.js";

export interface DashboardStats {
	categories: {
		total: number;
		active: number;
	};
	candidates: number;
	tickets: {
		total: number;
		used: number;
	};
	votes: number;
}

export interface Activity {
	id: string;
	type: "vote" | "ticket" | "candidate" | "category";
	title: string;
	description: string;
	timestamp: Date;
}

export interface CandidateVoteStats {
	id: string;
	nomineeId: string;
	name: string;
	image: string | null;
	imageUrl: string | null;
	voteCount: number;
	percentage: number;
	isWinner: boolean;
}

export interface CategoryVoteStats {
	id: string;
	name: string;
	icon: string | null;
	iconUrl: string | null;
	totalVotes: number;
	candidates: CandidateVoteStats[];
}

export interface VotingStatistics {
	totalVotes: number;
	totalVoters: number;
	categories: CategoryVoteStats[];
}

const dashboardController = {
	/**
	 * Get dashboard statistics
	 */
	getStats: async (
		_req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			// Get all counts in parallel for better performance
			const [
				categoriesTotal,
				categoriesActive,
				candidatesCount,
				ticketsTotal,
				ticketsUsed,
				votesCount,
			] = await Promise.all([
				prisma.category.count(),
				prisma.category.count({ where: { isActive: true } }),
				prisma.candidate.count(),
				prisma.ticket.count(),
				prisma.ticket.count({
					where: {
						votes: {
							some: {},
						},
					},
				}),
				prisma.vote.count(),
			]);

			const stats: DashboardStats = {
				categories: {
					total: categoriesTotal,
					active: categoriesActive,
				},
				candidates: candidatesCount,
				tickets: {
					total: ticketsTotal,
					used: ticketsUsed,
				},
				votes: votesCount,
			};

			sendSuccess(res, stats, "Dashboard stats retrieved successfully");
		} catch (error) {
			next(error);
		}
	},

	/**
	 * Get recent activities
	 */
	getRecentActivities: async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			const limit = Math.min(Number(req.query.limit) || 10, 50);

			// Fetch recent items from each model in parallel
			const [recentVotes, recentTickets, recentCandidates, recentCategories] =
				await Promise.all([
					prisma.vote.findMany({
						take: limit,
						orderBy: { createdAt: "desc" },
						include: {
							candidate: { select: { name: true } },
							category: { select: { name: true } },
						},
					}),
					prisma.ticket.findMany({
						take: limit,
						orderBy: { createdAt: "desc" },
						select: { id: true, serial: true, createdAt: true },
					}),
					prisma.candidate.findMany({
						take: limit,
						orderBy: { createdAt: "desc" },
						include: { category: { select: { name: true } } },
					}),
					prisma.category.findMany({
						take: limit,
						orderBy: { createdAt: "desc" },
						select: { id: true, name: true, createdAt: true },
					}),
				]);

			// Transform into unified activity format
			const activities: Activity[] = [
				...recentVotes.map((vote) => ({
					id: `vote-${vote.id}`,
					type: "vote" as const,
					title: "New vote cast",
					description: `Vote for ${vote.candidate.name} in ${vote.category.name}`,
					timestamp: vote.createdAt,
				})),
				...recentTickets.map((ticket) => ({
					id: `ticket-${ticket.id}`,
					type: "ticket" as const,
					title: "Ticket generated",
					description: `Ticket #${ticket.serial.slice(-8).toUpperCase()}`,
					timestamp: ticket.createdAt,
				})),
				...recentCandidates.map((candidate) => ({
					id: `candidate-${candidate.id}`,
					type: "candidate" as const,
					title: "Candidate added",
					description: `${candidate.name} added to ${candidate.category.name}`,
					timestamp: candidate.createdAt,
				})),
				...recentCategories.map((category) => ({
					id: `category-${category.id}`,
					type: "category" as const,
					title: "Category created",
					description: `${category.name} category created`,
					timestamp: category.createdAt,
				})),
			];

			// Sort by timestamp (newest first) and limit
			activities.sort(
				(a, b) => b.timestamp.getTime() - a.timestamp.getTime()
			);
			const limitedActivities = activities.slice(0, limit);

			sendSuccess(
				res,
				limitedActivities,
				"Recent activities retrieved successfully"
			);
		} catch (error) {
			next(error);
		}
	},

	/**
	 * Get voting statistics by category and candidate
	 */
	getVotingStatistics: async (
		_req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			// Get all categories with their candidates and vote counts
			const categories = await prisma.category.findMany({
				where: { isActive: true },
				orderBy: { order: "asc" },
				include: {
					candidates: {
						include: {
							_count: {
								select: { votes: true },
							},
						},
					},
				},
			});

			// Get total unique voters (tickets that have cast at least one vote)
			const totalVoters = await prisma.ticket.count({
				where: {
					votes: {
						some: {},
					},
				},
			});

			// Get total votes
			const totalVotes = await prisma.vote.count();

			// Transform data into statistics format with presigned URLs
			const categoryStats: CategoryVoteStats[] = await Promise.all(
				categories.map(async (category) => {
					const totalCategoryVotes = category.candidates.reduce(
						(sum, candidate) => sum + candidate._count.votes,
						0
					);

					// Sort candidates by vote count (descending)
					const sortedCandidates = [...category.candidates].sort(
						(a, b) => b._count.votes - a._count.votes
					);

					// Find highest vote count
					const maxVotes =
						sortedCandidates.length > 0 ? sortedCandidates[0]._count.votes : 0;

					const candidateStats: CandidateVoteStats[] = await Promise.all(
						sortedCandidates.map(async (candidate) => ({
							id: candidate.id,
							nomineeId: candidate.nomineeId,
							name: candidate.name,
							image: candidate.image,
							imageUrl: candidate.image ? await getPublicUrl(candidate.image) : null,
							voteCount: candidate._count.votes,
							percentage:
								totalCategoryVotes > 0
									? Math.round((candidate._count.votes / totalCategoryVotes) * 100)
									: 0,
							isWinner: candidate._count.votes === maxVotes && maxVotes > 0,
						}))
					);

					return {
						id: category.id,
						name: category.name,
						icon: category.icon,
						iconUrl: category.icon ? await getPublicUrl(category.icon) : null,
						totalVotes: totalCategoryVotes,
						candidates: candidateStats,
					};
				})
			);

			const statistics: VotingStatistics = {
				totalVotes,
				totalVoters,
				categories: categoryStats,
			};

			sendSuccess(res, statistics, "Voting statistics retrieved successfully");
		} catch (error) {
			next(error);
		}
	},
};

export default dashboardController;

