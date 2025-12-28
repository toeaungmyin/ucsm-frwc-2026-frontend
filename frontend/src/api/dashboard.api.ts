import api from "../lib/axios";
import type { ApiResponse } from "../types";

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
	timestamp: string;
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

export const dashboardApi = {
	getStats: async (): Promise<ApiResponse<DashboardStats>> => {
		const response = await api.get<ApiResponse<DashboardStats>>("/dashboard/stats");
		return response.data;
	},

	getRecentActivities: async (limit = 10): Promise<ApiResponse<Activity[]>> => {
		const response = await api.get<ApiResponse<Activity[]>>(`/dashboard/activities?limit=${limit}`);
		return response.data;
	},

	getVotingStatistics: async (): Promise<ApiResponse<VotingStatistics>> => {
		const response = await api.get<ApiResponse<VotingStatistics>>("/dashboard/voting-stats");
		return response.data;
	},
};

