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

export interface Post {
  _id?: string;
  title: string;
  author: string;
  content: string;
  images: string[]; // Jusqu'à 3 images
  category: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

export interface Artwork {
  _id?: string;
  title: string;
  author: string;
  period: string;
  images: string[];
  themeId: string;
  description: {
    fr: string;
    en: string;
    wo: string;
  };
  audio?: {
    fr?: string;
    en?: string;
    wo?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}