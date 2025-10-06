import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Récupérer tous les posts
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
    const postsCollection = db.collection('posts');

    // Récupérer les query params pour les filtres
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Construire le filtre
    const filter: any = {};
    if (category && category !== 'all') filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    const posts = await postsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      posts: posts,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des posts:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau post
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
    const { title, author, content, category, status, images } = body;

    // Validation
    if (!title || !author || !content || !category) {
      return NextResponse.json(
        { success: false, message: 'Titre, auteur, contenu et catégorie sont requis' },
        { status: 400 }
      );
    }

    // Validation des images (max 3)
    const postImages = Array.isArray(images) ? images.slice(0, 3) : [];

    const db = await getDatabase();
    const postsCollection = db.collection('posts');

    const newPost = {
      title,
      author, // L'auteur de l'œuvre/article (renseigné par l'admin)
      content,
      category,
      status: status || 'draft',
      images: postImages,
      createdBy: payload.email, // L'admin qui a créé l'entrée
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await postsCollection.insertOne(newPost);

    return NextResponse.json({
      success: true,
      message: 'Post créé avec succès',
      post: { ...newPost, _id: result.insertedId },
    });
  } catch (error: any) {
    console.error('Erreur lors de la création du post:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

