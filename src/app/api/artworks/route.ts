import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Fonction pour générer un slug unique à partir du titre
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garde uniquement lettres, chiffres, espaces et tirets
    .trim()
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-'); // Remplace les tirets multiples par un seul
}

// GET - Récupérer toutes les artworks
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const artworksCollection = db.collection('artworks');

    // Récupérer les query params pour les filtres
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    // Construire le filtre
    const filter: any = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const artworks = await artworksCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      artworks: artworks,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des artworks:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle artwork
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth_token')?.value;
    const payload = token ? verifyToken(token) : null;
    
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, image, audioUrls, gallery } = body;

    // Validation
    if (!title || !description || !image) {
      return NextResponse.json(
        { success: false, message: 'Titre, description et image sont requis' },
        { status: 400 }
      );
    }

    // Validation de la structure de description
    if (!Array.isArray(description) || description.length === 0) {
      return NextResponse.json(
        { success: false, message: 'La description doit contenir au moins un bloc' },
        { status: 400 }
      );
    }

    // Vérifier que chaque bloc a le bon format
    for (const block of description) {
      if (!block.type || !['heading', 'paragraph'].includes(block.type) || !block.content) {
        return NextResponse.json(
          { success: false, message: 'Chaque bloc de description doit avoir un type (heading/paragraph) et du contenu' },
          { status: 400 }
        );
      }
    }

    const db = await getDatabase();
    const artworksCollection = db.collection('artworks');

    // Générer le slug
    let slug = generateSlug(title);
    
    // Vérifier l'unicité du slug
    let slugExists = await artworksCollection.findOne({ slug });
    let counter = 1;
    const baseSlug = slug;
    
    while (slugExists) {
      slug = `${baseSlug}-${counter}`;
      slugExists = await artworksCollection.findOne({ slug });
      counter++;
    }

    const newArtwork = {
      slug,
      title,
      description,
      image,
      audioUrls: audioUrls || { en: '', fr: '', wo: '' },
      gallery: Array.isArray(gallery) ? gallery : [],
      createdAt: new Date(),
    };

    const result = await artworksCollection.insertOne(newArtwork);

    return NextResponse.json({
      success: true,
      message: 'Artwork créée avec succès',
      artwork: { ...newArtwork, _id: result.insertedId },
    });
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'artwork:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
