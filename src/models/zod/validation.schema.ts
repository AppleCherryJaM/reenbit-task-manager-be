import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
});

export const userIdSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

// Task validation schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  authorId: z.string().uuid('Invalid author ID'),
  assigneeIds: z.array(z.string().uuid('Invalid assignee ID')).optional(),
  deadline: z.string().datetime('Invalid deadline format').optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  description: z.string().max(1000, 'Description too long').optional().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  assigneeIds: z.array(z.string().uuid('Invalid assignee ID')).optional(),
  deadline: z.string().datetime('Invalid deadline format').optional().nullable(),
});

export const taskIdSchema = z.object({
  id: z.string().uuid('Invalid task ID'),
});

// Auth validation schemas
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Query validation schemas
export const userTasksQuerySchema = z.object({
  type: z.enum(['authored', 'assigned']).optional(),
});