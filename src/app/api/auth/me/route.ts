import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token depuis le cookie
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier le token
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Token invalide' },
        { status: 401 }
      );
    }

    // Récupérer les informations de l'utilisateur depuis la base de données
    const db = await getDatabase();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne(
      { _id: new ObjectId(payload.userId) },
      { projection: { password: 0 } } // Exclure le mot de passe
    ) as any;

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Compte désactivé' },
        { status: 403 }
      );
    }

    // Retourner les informations de l'utilisateur
    const userData = {
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      permissions: user.permissions,
    };

    return NextResponse.json(
      { success: true, user: userData },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

