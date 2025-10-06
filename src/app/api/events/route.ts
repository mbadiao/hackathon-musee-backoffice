import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    // Récupérer les événements depuis MongoDB
    const db = await getDatabase();
    const events = await db.collection('events').find({}).toArray();

    return NextResponse.json({
      success: true,
      data: events
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Créer l'événement
    const db = await getDatabase();
    const newEvent = {
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
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('events').insertOne(newEvent);

    return NextResponse.json({
      success: true,
      data: { ...newEvent, _id: result.insertedId }
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
