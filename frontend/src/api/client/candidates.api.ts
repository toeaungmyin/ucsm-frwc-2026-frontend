import { api } from "../../lib/axios";
import type { ApiResponse } from "../../types";

export interface ClientCandidate {
	id: string;
	nomineeId: string;
	name: string;
	image: string | null;
}

export interface CategoryWithCandidates {
	category: {
		id: string;
		name: string;
		icon: string | null;
	};
	candidates: ClientCandidate[];
}

export const clientCandidatesApi = {
	getByCategoryId: async (categoryId: string): Promise<CategoryWithCandidates> => {
		const response = await api.get<ApiResponse<CategoryWithCandidates>>(`/client/candidates/category/${categoryId}`);
		return response.data.data;
	},
};

