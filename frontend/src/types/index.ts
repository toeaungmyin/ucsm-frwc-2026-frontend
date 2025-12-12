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
	order: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
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

