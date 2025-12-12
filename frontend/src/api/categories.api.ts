import api from '../lib/axios';
import type { ApiResponse, Category } from '../types';

export interface CreateCategoryInput {
  name: string;
  isActive?: boolean;
}

export interface UpdateCategoryInput {
  name?: string;
  isActive?: boolean;
}

export const categoriesApi = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  },

  create: async (data: CreateCategoryInput): Promise<ApiResponse<Category>> => {
    const response = await api.post<ApiResponse<Category>>('/categories', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCategoryInput): Promise<ApiResponse<Category>> => {
    const response = await api.patch<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/categories/${id}`);
    return response.data;
  },

  reorder: async (orderedIds: string[]): Promise<ApiResponse<Category[]>> => {
    const response = await api.patch<ApiResponse<Category[]>>('/categories/reorder', { orderedIds });
    return response.data;
  },
};

