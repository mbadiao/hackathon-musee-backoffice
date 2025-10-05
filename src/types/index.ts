export type PageType = 'dashboard' | 'posts' | 'events' | 'artworks' | 'exhibitions' | 'media' | 'users' | 'notifications';

import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  lastLogin?: Date | null;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    permissions: string[];
  };
  token?: string;
}