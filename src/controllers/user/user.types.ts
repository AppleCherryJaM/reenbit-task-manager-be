import { Request } from 'express';

export interface CreateUserInput {
  email: string;
  name?: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string | null;
  createdAt: Date;
}

export interface CreateUserRequest extends Request {
  body: CreateUserInput;
}

export interface UpdateUserRequest extends Request {
  body: UpdateUserInput;
  params: {
    id: string;
  };
}