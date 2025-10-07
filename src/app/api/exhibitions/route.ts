import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// Fonction pour générer un slug unique à partir du titre
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// GET - Récupérer toutes les exhibitions
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const exhibitionsCollection = db.collection('exhibitions');

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    const filter: any = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const exhibitions = await exhibitionsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      exhibitions: exhibitions,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des exhibitions:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle exhibition
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const payload = token ? verifyToken(token) : null;
    
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, subtitle, image, artworks } = body;

    // Validation
    if (!title || !subtitle || !image) {
      return NextResponse.json(
        { success: false, message: 'Titre, sous-titre et image sont requis' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const exhibitionsCollection = db.collection('exhibitions');
    const artworksCollection = db.collection('artworks');

    // Générer le slug
    let slug = generateSlug(title);
    
    // Vérifier l'unicité du slug
    let slugExists = await exhibitionsCollection.findOne({ slug });
    let counter = 1;
    const baseSlug = slug;
    
    while (slugExists) {
      slug = `${baseSlug}-${counter}`;
      slugExists = await exhibitionsCollection.findOne({ slug });
      counter++;
    }

    // Valider les artworks (doivent exister)
    const artworkIds = Array.isArray(artworks) ? artworks.filter(id => ObjectId.isValid(id)) : [];
    
    const newExhibition = {
      slug,
      title,
      subtitle,
      image,
      artworks: artworkIds,
      createdAt: new Date(),
    };

    const result = await exhibitionsCollection.insertOne(newExhibition);
    const exhibitionId = result.insertedId.toString();

    // MISE À JOUR BIDIRECTIONNELLE: Mettre à jour les artworks avec la référence à cette exhibition
    if (artworkIds.length > 0) {
      await artworksCollection.updateMany(
        { _id: { $in: artworkIds.map(id => new ObjectId(id)) } },
        { $set: { exhibition: exhibitionId } }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Exhibition créée avec succès',
      exhibition: { ...newExhibition, _id: exhibitionId },
    });
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'exhibition:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
