import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Token invalide' }, { status: 401 });
    }

    const { id } = await params;

    // Récupérer l'événement spécifique
    const db = await getDatabase();
    const event = await db.collection('events').findOne({ _id: new ObjectId(id) });

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Token invalide' }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const {
      name,
      date,
      time,
      description,
      location,
      bannerImage,
      relatedExhibition,
      capacity,
      price,
      category
    } = body;

    // Validation des champs requis
    if (!name || !date || !time || !description || !location) {
      return NextResponse.json(
        { success: false, message: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Déterminer le statut basé sur la date
    const eventDate = new Date(date);
    const now = new Date();
    let status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' = 'upcoming';
    
    if (eventDate.toDateString() === now.toDateString()) {
      status = 'ongoing';
    } else if (eventDate < now) {
      status = 'completed';
    }

    // Mettre à jour l'événement
    const db = await getDatabase();
    const updateData = {
      name,
      date,
      time,
      description,
      location,
      bannerImage: bannerImage || '',
      relatedExhibition: relatedExhibition || 'Aucune Exposition',
      capacity: capacity || '',
      price: price || '',
      category: category || 'Conférence d\'Artiste',
      status,
      updatedAt: new Date()
    };

    const result = await db.collection('events').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { ...updateData, _id: id }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Token invalide' }, { status: 401 });
    }

    const { id } = await params;

    // Supprimer l'événement
    const db = await getDatabase();
    const result = await db.collection('events').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Événement supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
