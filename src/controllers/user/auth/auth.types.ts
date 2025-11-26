import type { Request } from 'express';

export interface LoginRequest {
  body: {
    email: string;
    password: string;
  }
}

export interface RegisterRequest extends Request{
  body: {  
    name?: string;
    email: string;
    password: string;
  }
}

export interface RefreshTokenRequest extends Request {
  body: {
    refreshToken: string;
  }
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  accessToken: string;
  refreshToken?: string;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string; 
    email: string;
  };
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}