import api from "../lib/axios";
import type { ApiResponse, Candidate } from "../types";

export interface CreateCandidateInput {
	nomineeId: string;
	name: string;
	category: string;
	image?: File;
}

export interface UpdateCandidateInput {
	nomineeId?: string;
	name?: string;
	category?: string;
	image?: File;
}

// Helper to create FormData from input
const createFormData = (data: CreateCandidateInput | UpdateCandidateInput): FormData => {
	const formData = new FormData();

	if ("nomineeId" in data && data.nomineeId !== undefined) {
		formData.append("nomineeId", data.nomineeId);
	}

	if ("name" in data && data.name !== undefined) {
		formData.append("name", data.name);
	}

	if ("category" in data && data.category !== undefined) {
		formData.append("category", data.category);
	}

	if (data.image) {
		formData.append("image", data.image);
	}

	return formData;
};

export const candidatesApi = {
	getAll: async (): Promise<ApiResponse<Candidate[]>> => {
		const response = await api.get<ApiResponse<Candidate[]>>("/candidates");
		return response.data;
	},

	getById: async (id: string): Promise<ApiResponse<Candidate>> => {
		const response = await api.get<ApiResponse<Candidate>>(`/candidates/${id}`);
		return response.data;
	},

	create: async (data: CreateCandidateInput): Promise<ApiResponse<Candidate>> => {
		const formData = createFormData(data);
		const response = await api.post<ApiResponse<Candidate>>("/candidates", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data;
	},

	update: async (id: string, data: UpdateCandidateInput): Promise<ApiResponse<Candidate>> => {
		const formData = createFormData(data);
		const response = await api.patch<ApiResponse<Candidate>>(`/candidates/${id}`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data;
	},

	delete: async (id: string): Promise<ApiResponse<null>> => {
		const response = await api.delete<ApiResponse<null>>(`/candidates/${id}`);
		return response.data;
	},

	removeImage: async (id: string): Promise<ApiResponse<Candidate>> => {
		const response = await api.delete<ApiResponse<Candidate>>(`/candidates/${id}/image`);
		return response.data;
	},

	deleteAll: async (): Promise<ApiResponse<{ count: number }>> => {
		const response = await api.delete<ApiResponse<{ count: number }>>("/candidates/bulk/all");
		return response.data;
	},

	export: async (): Promise<ApiResponse<CandidateExportData>> => {
		const response = await api.get<ApiResponse<CandidateExportData>>("/candidates/export");
		return response.data;
	},

	import: async (data: ImportCandidatesInput): Promise<ApiResponse<ImportCandidatesResult>> => {
		const response = await api.post<ApiResponse<ImportCandidatesResult>>("/candidates/import", data);
		return response.data;
	},
};

export interface CandidateExportData {
	exportedAt: string;
	totalCount: number;
	candidates: Array<{
		id: string;
		nomineeId: string;
		name: string;
		categoryId: string;
		categoryName: string;
		image: string | null;
		createdAt: string;
	}>;
}

export interface ImportCandidatesInput {
	candidates: Array<{
		id: string;
		nomineeId: string;
		name: string;
		categoryId: string;
		image?: string | null;
	}>;
	skipDuplicates?: boolean;
}

export interface ImportCandidatesResult {
	imported: number;
	skipped: number;
	total: number;
}
