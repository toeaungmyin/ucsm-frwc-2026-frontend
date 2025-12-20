import api from "../../lib/axios";

export interface CastVoteResponse {
	success: boolean;
	data: {
		vote: {
			id: string;
			candidateId: string;
			categoryId: string;
		};
		votedCategories: string[];
	};
	message: string;
}

export interface CancelVoteResponse {
	success: boolean;
	data: {
		votedCategories: string[];
	};
	message: string;
}

export interface VoteStatusResponse {
	success: boolean;
	data: {
		hasVoted: boolean;
		votedCandidateId: string | null;
	};
	message: string;
}

export const clientVotesApi = {
	/**
	 * Cast a vote for a candidate
	 */
	castVote: async (candidateId: string, categoryId: string): Promise<CastVoteResponse["data"]> => {
		const response = await api.post<CastVoteResponse>("/client/votes", {
			candidateId,
			categoryId,
		});
		return response.data.data;
	},

	/**
	 * Cancel a vote in a category
	 */
	cancelVote: async (categoryId: string): Promise<CancelVoteResponse["data"]> => {
		const response = await api.delete<CancelVoteResponse>(`/client/votes/${categoryId}`);
		return response.data.data;
	},

	/**
	 * Get vote status for a category
	 */
	getVoteStatus: async (categoryId: string): Promise<VoteStatusResponse["data"]> => {
		const response = await api.get<VoteStatusResponse>(`/client/votes/status/${categoryId}`);
		return response.data.data;
	},
};

