import api from "../lib/axios";
import type { ApiResponse } from "../types";

export interface Settings {
	id: string;
	eventName: string;
	eventStartTime: string | null;
	votingEnabled: boolean;
	promoVideo: string | null;
	promoVideoUrl: string | null;
	updatedAt: string;
}

export interface UpdateSettingsInput {
	eventName?: string;
	eventStartTime?: string | null;
	votingEnabled?: boolean;
}

export interface PromoVideoResponse {
	promoVideo: string;
	videoUrl: string;
}

export const settingsApi = {
	getSettings: async (): Promise<ApiResponse<Settings>> => {
		const response = await api.get<ApiResponse<Settings>>("/settings");
		return response.data;
	},

	updateSettings: async (data: UpdateSettingsInput): Promise<ApiResponse<Settings>> => {
		const response = await api.patch<ApiResponse<Settings>>("/settings", data);
		return response.data;
	},

	toggleVoting: async (enabled: boolean): Promise<ApiResponse<{ votingEnabled: boolean }>> => {
		const response = await api.post<ApiResponse<{ votingEnabled: boolean }>>(
			"/settings/toggle-voting",
			{ enabled }
		);
		return response.data;
	},

	uploadPromoVideo: async (file: File): Promise<ApiResponse<PromoVideoResponse>> => {
		const formData = new FormData();
		formData.append("video", file);
		const response = await api.post<ApiResponse<PromoVideoResponse>>(
			"/settings/promo-video",
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		);
		return response.data;
	},

	deletePromoVideo: async (): Promise<ApiResponse<Settings>> => {
		const response = await api.delete<ApiResponse<Settings>>("/settings/promo-video");
		return response.data;
	},
};

