// MODEL — defines the shape of user data

export type UserType = 'buyer' | 'seller' | 'admin' | 'super_admin';

export type AuthProvider = 'phone' | 'google' | 'apple';

export interface User {
  id:                  number;
  name:                string;
  email:               string;
  phone?:              string;
  country_code?:       string;
  phone_number?:       string;
  gender?:             string;
  date_of_birth?:      string;
  profile_picture?:    string;
  preferred_language?: string;
  country?:            string;
  city?:               string;
  referral_code?:      string;
  user_type:           UserType;
  auth_provider?:      AuthProvider;
  is_social_login?:    boolean;
  is_profile_complete?: boolean;
  is_active?:          boolean;
  created_at?:         string;
  updated_at?:         string;
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
