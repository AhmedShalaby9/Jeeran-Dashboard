// MODEL — defines the shape of data used across the app

export interface User {
  id: number;
  phone: string;
  name: string;
  email: string;
  user_type: 'admin' | 'agent' | 'user';
  is_profile_complete: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  data: User;
}
