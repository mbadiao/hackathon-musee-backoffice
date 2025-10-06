/**
 * Configuration centralisée des variables d'environnement
 * Ce fichier permet de gérer facilement toutes les variables pour le déploiement
 */

// MongoDB
export const MONGODB_URI = process.env.MONGODB_URI || '';

// PostgreSQL Supabase (optionnel, pour accès direct à la DB)
export const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL || '';

// Authentication
export const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

// Supabase
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'musee',
  dbUrl: process.env.SUPABASE_DB_URL || '',
};

// Validation des variables critiques
export function validateEnvVariables() {
  const errors: string[] = [];

  if (!MONGODB_URI) {
    errors.push('MONGODB_URI is not defined');
  }

  if (!SUPABASE_CONFIG.url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not defined');
  }

  if (!SUPABASE_CONFIG.anonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined');
  }

  if (errors.length > 0 && process.env.NODE_ENV === 'production') {
    console.error('❌ Variables d\'environnement manquantes:');
    errors.forEach(error => console.error(`  - ${error}`));
  }

  return errors.length === 0;
}

// Configuration pour le déploiement
export const DEPLOYMENT_CONFIG = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
};

// URLs et endpoints
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  apiPrefix: '/api',
};

