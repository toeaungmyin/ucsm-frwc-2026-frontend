import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from "../stores/auth.store";
import { useVoterStore } from "../stores/voter.store";

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
	headers: {
		"Content-Type": "application/json",
	},
	// Request timeout - 30 seconds
	timeout: 30000,
});

// Helper to check if request is for client/voter routes
const isClientRoute = (url: string | undefined): boolean => {
	return url?.includes("/client/") ?? false;
};

// Helper to check if error is retryable
const isRetryableError = (error: AxiosError): boolean => {
	// Retry on network errors or 5xx server errors
	if (!error.response) return true; // Network error
	const status = error.response.status;
	return status >= 500 && status < 600;
};

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

// Request interceptor - add appropriate auth token
api.interceptors.request.use(
	(config) => {
		// Initialize retry count
		(config as InternalAxiosRequestConfig & { _retryCount?: number })._retryCount = 
			(config as InternalAxiosRequestConfig & { _retryCount?: number })._retryCount || 0;

		// Use voter token for client routes, admin token for admin routes
		if (isClientRoute(config.url)) {
			const voterToken = useVoterStore.getState().token;
			if (voterToken) {
				config.headers.Authorization = `Bearer ${voterToken}`;
			}
		} else {
			const adminToken = useAuthStore.getState().token;
			if (adminToken) {
				config.headers.Authorization = `Bearer ${adminToken}`;
			}
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// Response interceptor - handle errors and retries
api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };
		
		// Retry logic for server errors and network errors
		if (config && isRetryableError(error) && (config._retryCount || 0) < MAX_RETRIES) {
			config._retryCount = (config._retryCount || 0) + 1;
			
			// Wait before retry with exponential backoff
			await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * config._retryCount!));
			
			console.warn(`Retrying request (${config._retryCount}/${MAX_RETRIES}):`, config.url);
			return api(config);
		}

		// Handle 401 Unauthorized
		if (error.response?.status === 401) {
			const requestUrl = config?.url;

			// Only redirect to login for admin routes, not client routes
			if (!isClientRoute(requestUrl)) {
				useAuthStore.getState().logout();
				window.location.href = "/login";
			}
			// For client routes, just logout voter silently (don't redirect)
			// The UI will show the scan dialog instead
		}

		// Log errors for debugging (but not in production)
		if (import.meta.env.DEV) {
			console.error("API Error:", {
				url: config?.url,
				method: config?.method,
				status: error.response?.status,
				message: error.message,
			});
		}

		return Promise.reject(error);
	}
);

export default api;
