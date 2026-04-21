// MODEL — defines the shape of user data

export interface User {
  id: number;
  name: string;
  email: string;
  user_type: 'admin' | 'super_admin';
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
