// Auth types
export interface Admin {
  id: string;
  username: string;
  name: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    admin: Admin;
  };
}

// Category types
export interface Category {
	id: string;
	name: string;
	icon: string | null;
	iconUrl: string | null; // Presigned URL for display
	order: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

// Candidate types
export interface Candidate {
	id: string;
	nomineeId: string;
	name: string;
	categoryId: string;
	category: {
		id: string;
		name: string;
	};
	image: string | null;
	imageUrl: string | null; // Presigned URL for display
	createdAt: string;
}

// Ticket types
export interface Ticket {
	id: string;
	serial: string;
	createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
}

export interface ApiError {
	success: boolean;
	message: string;
	errors?: Array<{ field: string; message: string }>;
}
