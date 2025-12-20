import api from "../lib/axios";
import type { ApiResponse, Ticket } from "../types";

export interface GenerateTicketsInput {
	quantity: number;
}

export const ticketsApi = {
	getAll: async (): Promise<ApiResponse<Ticket[]>> => {
		const response = await api.get<ApiResponse<Ticket[]>>("/tickets");
		return response.data;
	},

	getBySerial: async (serial: string): Promise<ApiResponse<Ticket>> => {
		const response = await api.get<ApiResponse<Ticket>>(`/tickets/${serial}`);
		return response.data;
	},

	generate: async (data: GenerateTicketsInput): Promise<ApiResponse<Ticket[]>> => {
		const response = await api.post<ApiResponse<Ticket[]>>("/tickets/generate", data);
		return response.data;
	},

	delete: async (serial: string): Promise<ApiResponse<null>> => {
		const response = await api.delete<ApiResponse<null>>(`/tickets/${serial}`);
		return response.data;
	},

	deleteAll: async (): Promise<ApiResponse<{ count: number }>> => {
		const response = await api.delete<ApiResponse<{ count: number }>>("/tickets/bulk/all");
		return response.data;
	},
};

