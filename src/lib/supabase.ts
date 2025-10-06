import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '@/config/env';

let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

// Client-side Supabase (pour le frontend)
export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey
    );
  }
  return supabaseInstance;
}

// Server-side Supabase avec service role (pour les API routes)
export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.serviceRoleKey || SUPABASE_CONFIG.anonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
  return supabaseAdminInstance;
}

const STORAGE_BUCKET = SUPABASE_CONFIG.storageBucket;

/**
 * Upload un fichier vers Supabase Storage
 * @param file Buffer du fichier
 * @param fileName Nom du fichier
 * @param contentType Type MIME du fichier
 * @returns URL publique du fichier uploadé
 */
export async function uploadToSupabase(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const fileExt = fileName.split('.').pop();
  const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `uploads/${uniqueFileName}`;

  const supabaseAdmin = getSupabaseAdmin();
  
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      contentType,
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Erreur upload Supabase:', error);
    throw new Error(`Erreur lors de l'upload: ${error.message}`);
  }

  // Obtenir l'URL publique
  const { data: publicUrlData } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Supprimer un fichier de Supabase Storage
 * @param fileUrl URL du fichier à supprimer
 */
export async function deleteFromSupabase(fileUrl: string): Promise<void> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Extraire le chemin du fichier de l'URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split(`/${STORAGE_BUCKET}/`);
    
    if (pathParts.length < 2) {
      console.error('URL invalide:', fileUrl);
      return;
    }

    const filePath = pathParts[1];

    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Erreur suppression Supabase:', error);
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
  }
}

/**
 * Liste tous les fichiers dans un dossier
 * @param folder Nom du dossier (ex: 'uploads')
 * @returns Liste des fichiers
 */
export async function listFiles(folder: string = 'uploads') {
  const supabaseAdmin = getSupabaseAdmin();
  
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .list(folder, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  if (error) {
    console.error('Erreur liste fichiers:', error);
    throw new Error(`Erreur lors de la récupération des fichiers: ${error.message}`);
  }

  return data;
}

/**
 * Créer le bucket s'il n'existe pas (à utiliser lors du setup initial)
 */
export async function createBucketIfNotExists() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    
    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);

    if (!bucketExists) {
      const { error } = await supabaseAdmin.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
      });

      if (error) {
        console.error('Erreur création bucket:', error);
      } else {
        console.log(`Bucket ${STORAGE_BUCKET} créé avec succès`);
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification/création du bucket:', error);
  }
}

