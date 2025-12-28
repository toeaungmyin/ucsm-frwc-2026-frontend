import { api } from "../../lib/axios";
import type { ApiResponse } from "../../types";

// Client category type (subset of full Category)
export interface ClientCategory {
	id: string;
	name: string;
	icon: string | null;
	iconUrl: string | null;
	order: number;
}

export const clientCategoriesApi = {
	getAll: async (): Promise<ClientCategory[]> => {
		const response = await api.get<ApiResponse<ClientCategory[]>>("/client/categories");
		return response.data.data;
	},
};

