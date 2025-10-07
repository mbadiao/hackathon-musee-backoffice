export type PageType = 'dashboard' | 'posts' | 'events' | 'artworks';

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

export interface Event {
  _id?: string;
  name: string;
  date: string;
  time: string;
  description: string;
  location: string;
  bannerImage: string;
  relatedExhibition: string;
  capacity: string;
  price: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Artwork {
  _id?: string;
  slug: string; // auto-generated from title (lowercase, hyphenated)
  title: string;
  description: { type: "heading" | "paragraph"; content: string }[];
  image: string;
  audioUrls: {
    en?: string;
    fr?: string;
    wo?: string;
  };
  gallery: { url: string; alt: string }[];
  createdAt: Date;
  updatedAt?: Date;
}