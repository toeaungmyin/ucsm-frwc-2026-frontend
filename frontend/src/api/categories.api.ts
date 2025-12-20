import api from "../lib/axios";
import type { ApiResponse, Category } from "../types";

export interface CreateCategoryInput {
	name: string;
	isActive?: boolean;
	icon?: File;
}

export interface UpdateCategoryInput {
	name?: string;
	isActive?: boolean;
	icon?: File;
}

// Helper to create FormData from input
const createFormData = (data: CreateCategoryInput | UpdateCategoryInput): FormData => {
	const formData = new FormData();

	if ("name" in data && data.name !== undefined) {
		formData.append("name", data.name);
	}

	if ("isActive" in data && data.isActive !== undefined) {
		formData.append("isActive", String(data.isActive));
	}

	if (data.icon) {
		formData.append("icon", data.icon);
	}

	return formData;
};

export const categoriesApi = {
	getAll: async (): Promise<ApiResponse<Category[]>> => {
		const response = await api.get<ApiResponse<Category[]>>("/categories");
		return response.data;
	},

	getById: async (id: string): Promise<ApiResponse<Category>> => {
		const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
		return response.data;
	},

	create: async (data: CreateCategoryInput): Promise<ApiResponse<Category>> => {
		const formData = createFormData(data);
		const response = await api.post<ApiResponse<Category>>("/categories", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data;
	},

	update: async (id: string, data: UpdateCategoryInput): Promise<ApiResponse<Category>> => {
		const formData = createFormData(data);
		const response = await api.patch<ApiResponse<Category>>(`/categories/${id}`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data;
	},

	delete: async (id: string): Promise<ApiResponse<null>> => {
		const response = await api.delete<ApiResponse<null>>(`/categories/${id}`);
		return response.data;
	},

	removeIcon: async (id: string): Promise<ApiResponse<Category>> => {
		const response = await api.delete<ApiResponse<Category>>(`/categories/${id}/icon`);
		return response.data;
	},

	reorder: async (orderedIds: string[]): Promise<ApiResponse<Category[]>> => {
		const response = await api.patch<ApiResponse<Category[]>>("/categories/reorder", { orderedIds });
		return response.data;
	},
};
