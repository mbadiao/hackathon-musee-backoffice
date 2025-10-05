import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { comparePassword, generateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation des données
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Connexion à la base de données
    console.log('[LOGIN] Tentative de connexion pour:', email);
    const db = await getDatabase();
    console.log('[LOGIN] Connexion DB réussie, nom de la DB:', db.databaseName);
    const usersCollection = db.collection('users');

    // Rechercher l'utilisateur par email
    const user = await usersCollection.findOne({ email }) as any;
    console.log('[LOGIN] Utilisateur trouvé:', !!user);

    if (!user) {
      console.log('[LOGIN] Aucun utilisateur trouvé pour:', email);
      return NextResponse.json(
        { success: false, message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }
    
    console.log('[LOGIN] User status:', user.status);
    console.log('[LOGIN] User has password:', !!user.password);

    // Vérifier que l'utilisateur est actif
    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Compte désactivé. Contactez l\'administrateur.' },
        { status: 403 }
      );
    }

    // Vérifier le mot de passe
    console.log('[LOGIN] Vérification du mot de passe...');
    const isPasswordValid = await comparePassword(password, (user as any).password);
    console.log('[LOGIN] Mot de passe valide:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('[LOGIN] Mot de passe incorrect');
      return NextResponse.json(
        { success: false, message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }
    
    console.log('[LOGIN] Authentification réussie!');

    // Mettre à jour la date de dernière connexion
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    // Générer le token JWT
    const token = generateToken({
      userId: user._id!.toString(),
      email: user.email,
      role: user.role,
    });

    // Préparer les données utilisateur (sans le mot de passe)
    const userData = {
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      permissions: user.permissions,
    };

    // Créer la réponse avec le cookie HTTP-only
    const response = NextResponse.json(
      {
        success: true,
        message: 'Connexion réussie',
        user: userData,
        token,
      },
      { status: 200 }
    );

    // Définir le cookie HTTP-only pour le token
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur lors de la connexion' },
      { status: 500 }
    );
  }
}

