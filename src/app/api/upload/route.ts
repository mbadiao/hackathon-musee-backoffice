import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { uploadToSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier (par MIME type et extension)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    // Log pour déboguer
    console.log('File upload debug:', {
      fileName: file.name,
      fileType: file.type,
      fileExtension: fileExtension,
      fileSize: file.size
    });
    
    const isValidMimeType = allowedMimeTypes.includes(file.type);
    const isValidExtension = allowedExtensions.includes(fileExtension);
    
    console.log('Validation:', { isValidMimeType, isValidExtension });
    
    if (!isValidMimeType && !isValidExtension) {
      return NextResponse.json(
        { success: false, message: `Type de fichier non autorisé. Fichier: ${file.name}, Type MIME: ${file.type}, Extension: ${fileExtension}. Utilisez JPG, JPEG, PNG ou WEBP.` },
        { status: 400 }
      );
    }

    // Vérifier la taille du fichier (max 15MB)
    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'Fichier trop volumineux. Taille max: 15MB' },
        { status: 400 }
      );
    }

    // Convertir le fichier en Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload vers Supabase Storage
    const fileUrl = await uploadToSupabase(buffer, file.name, file.type);

    return NextResponse.json({
      success: true,
      message: 'Fichier uploadé avec succès vers Supabase',
      url: fileUrl,
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'upload:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Erreur lors de l\'upload' },
      { status: 500 }
    );
  }
}

