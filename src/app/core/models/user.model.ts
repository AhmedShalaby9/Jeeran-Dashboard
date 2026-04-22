// MODEL — defines the shape of user data

export type UserType = 'buyer' | 'seller' | 'admin' | 'super_admin';

export interface User {
  id:         number;
  name:       string;
  email:      string;
  phone?:     string;
  user_type:  UserType;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email:    string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token:   string;
  data:    User;
}

export interface CreateAdminDto {
  name:     string;
  email:    string;
  phone:    string;
  password: string;
}

export interface UpdateUserDto {
  is_active?: boolean;
}

export interface UsersResponse {
  success: boolean;
  data:    User[];
}
