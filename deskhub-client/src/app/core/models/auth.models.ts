export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: number;
  token: string;
  fullName: string;
  email: string;
  companyId: number;
  companyName: string;
  roleId: number;
  roleName: string;
}
