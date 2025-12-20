import { api } from "../../lib/axios";
import type { ApiResponse } from "../../types";

export interface EventConfig {
	eventStartTime: string;
	eventName: string;
	votingEnabled: boolean;
	isEventStarted: boolean;
	serverTime: string;
	promoVideoUrl: string | null;
}

export const clientConfigApi = {
	getConfig: async (): Promise<EventConfig> => {
		const response = await api.get<ApiResponse<EventConfig>>("/client/config");
		return response.data.data;
	},
};

