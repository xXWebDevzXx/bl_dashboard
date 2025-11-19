export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: string;
}

export interface LoginResponse {
  user: AuthUser;
}

