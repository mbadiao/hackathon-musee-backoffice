import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Créer la réponse
    const response = NextResponse.json(
      { success: true, message: 'Déconnexion réussie' },
      { status: 200 }
    );

    // Supprimer le cookie d'authentification
    response.cookies.delete('auth_token');

    return response;
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}

