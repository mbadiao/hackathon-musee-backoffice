import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// Fonction pour générer un slug unique
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

// GET - Récupérer une exhibition spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const db = await getDatabase();
    const exhibitionsCollection = db.collection('exhibitions');

    const exhibition = await exhibitionsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!exhibition) {
      return NextResponse.json(
        { success: false, message: 'Exhibition non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      exhibition,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération de l\'exhibition:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une exhibition
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, subtitle, image, artworks } = body;

    if (!title || !subtitle || !image) {
      return NextResponse.json(
        { success: false, message: 'Titre, sous-titre et image sont requis' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const exhibitionsCollection = db.collection('exhibitions');
    const artworksCollection = db.collection('artworks');

    // Récupérer l'exhibition actuelle
    const currentExhibition = await exhibitionsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!currentExhibition) {
      return NextResponse.json(
        { success: false, message: 'Exhibition non trouvée' },
        { status: 404 }
      );
    }

    // Générer un nouveau slug si le titre a changé
    let slug = currentExhibition.slug;
    if (title !== currentExhibition.title) {
      slug = generateSlug(title);
      
      let slugExists = await exhibitionsCollection.findOne({
        slug,
        _id: { $ne: new ObjectId(id) }
      });
      let counter = 1;
      const baseSlug = slug;
      
      while (slugExists) {
        slug = `${baseSlug}-${counter}`;
        slugExists = await exhibitionsCollection.findOne({
          slug,
          _id: { $ne: new ObjectId(id) }
        });
        counter++;
      }
    }

    // Valider les artworks
    const newArtworkIds = Array.isArray(artworks) ? artworks.filter(id => ObjectId.isValid(id)) : [];
    const oldArtworkIds = currentExhibition.artworks || [];

    // MISE À JOUR BIDIRECTIONNELLE
    // 1. Artworks ajoutés: mettre à jour leur exhibition
    const addedArtworks = newArtworkIds.filter((id: string) => !oldArtworkIds.includes(id));
    if (addedArtworks.length > 0) {
      await artworksCollection.updateMany(
        { _id: { $in: addedArtworks.map(id => new ObjectId(id)) } },
        { $set: { exhibition: id } }
      );
    }

    // 2. Artworks retirés: retirer leur référence à l'exhibition
    const removedArtworks = oldArtworkIds.filter((id: string) => !newArtworkIds.includes(id));
    if (removedArtworks.length > 0) {
      await artworksCollection.updateMany(
        { _id: { $in: removedArtworks.map((id: string) => new ObjectId(id)) } },
        { $unset: { exhibition: "" } }
      );
    }

    const updatedExhibition = {
      slug,
      title,
      subtitle,
      image,
      artworks: newArtworkIds,
      updatedAt: new Date(),
    };

    await exhibitionsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedExhibition }
    );

    return NextResponse.json({
      success: true,
      message: 'Exhibition mise à jour avec succès',
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l\'exhibition:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une exhibition
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const db = await getDatabase();
    const exhibitionsCollection = db.collection('exhibitions');
    const artworksCollection = db.collection('artworks');

    // Récupérer l'exhibition pour obtenir ses artworks
    const exhibition = await exhibitionsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!exhibition) {
      return NextResponse.json(
        { success: false, message: 'Exhibition non trouvée' },
        { status: 404 }
      );
    }

    // MISE À JOUR BIDIRECTIONNELLE: Retirer la référence de l'exhibition dans tous les artworks
    if (exhibition.artworks && exhibition.artworks.length > 0) {
      await artworksCollection.updateMany(
        { _id: { $in: exhibition.artworks.map((id: string) => new ObjectId(id)) } },
        { $unset: { exhibition: "" } }
      );
    }

    // Supprimer l'exhibition
    const result = await exhibitionsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Exhibition non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Exhibition supprimée avec succès',
    });
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'exhibition:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
