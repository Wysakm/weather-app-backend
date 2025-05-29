import { Request } from 'express';

// Interface สำหรับ authenticated user
export interface AuthenticatedUser {
  id_user: string;
  username: string;
  email: string;
  role: {
    role_name: string;
    role_id: string;
  };
}

// Extended Request interface with authenticated user
export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}
