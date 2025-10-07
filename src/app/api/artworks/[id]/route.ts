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

// PUT - Mettre à jour une artwork
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
    const { title, description, image, audioUrls, gallery, exhibition } = body;

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
    const exhibitionsCollection = db.collection('exhibitions');

    // Récupérer l'artwork actuelle
    const currentArtwork = await artworksCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!currentArtwork) {
      return NextResponse.json(
        { success: false, message: 'Artwork non trouvée' },
        { status: 404 }
      );
    }

    // Générer un nouveau slug si le titre a changé
    let slug = currentArtwork.slug;
    if (title !== currentArtwork.title) {
      slug = generateSlug(title);
      
      // Vérifier l'unicité du slug (exclure l'artwork actuelle)
      let slugExists = await artworksCollection.findOne({
        slug,
        _id: { $ne: new ObjectId(id) }
      });
      let counter = 1;
      const baseSlug = slug;
      
      while (slugExists) {
        slug = `${baseSlug}-${counter}`;
        slugExists = await artworksCollection.findOne({
          slug,
          _id: { $ne: new ObjectId(id) }
        });
        counter++;
      }
    }

    // MISE À JOUR BIDIRECTIONNELLE: Gérer les changements d'exhibition
    const oldExhibitionId = currentArtwork.exhibition;
    const newExhibitionId = exhibition && ObjectId.isValid(exhibition) ? exhibition : null;

    // Si l'exhibition a changé
    if (oldExhibitionId !== newExhibitionId) {
      // Retirer l'artwork de l'ancienne exhibition
      if (oldExhibitionId && ObjectId.isValid(oldExhibitionId)) {
        await exhibitionsCollection.updateOne(
          { _id: new ObjectId(oldExhibitionId) },
          { $pull: { artworks: id as any } }
        );
      }

      // Ajouter l'artwork à la nouvelle exhibition
      if (newExhibitionId) {
        await exhibitionsCollection.updateOne(
          { _id: new ObjectId(newExhibitionId) },
          { $addToSet: { artworks: id } }
        );
      }
    }

    const updatedArtwork = {
      slug,
      title,
      description,
      image,
      audioUrls: audioUrls || { en: '', fr: '', wo: '' },
      gallery: Array.isArray(gallery) ? gallery : [],
      exhibition: newExhibitionId || undefined,
      updatedAt: new Date(),
    };

    await artworksCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedArtwork }
    );

    return NextResponse.json({
      success: true,
      message: 'Artwork mise à jour avec succès',
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l\'artwork:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une artwork
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
    const artworksCollection = db.collection('artworks');
    const exhibitionsCollection = db.collection('exhibitions');

    // Récupérer l'artwork pour obtenir son exhibition
    const artwork = await artworksCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!artwork) {
      return NextResponse.json(
        { success: false, message: 'Artwork non trouvée' },
        { status: 404 }
      );
    }

    // MISE À JOUR BIDIRECTIONNELLE: Retirer l'artwork de son exhibition
    if (artwork.exhibition && ObjectId.isValid(artwork.exhibition)) {
      await exhibitionsCollection.updateOne(
        { _id: new ObjectId(artwork.exhibition) },
        { $pull: { artworks: id as any } }
      );
    }

    const result = await artworksCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Artwork non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Artwork supprimée avec succès',
    });
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'artwork:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
