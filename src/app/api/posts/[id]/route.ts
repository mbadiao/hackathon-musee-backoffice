import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { deleteFromSupabase } from '@/lib/supabase';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// GET - Récupérer un post spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const postsCollection = db.collection('posts');

    const post = await postsCollection.findOne({ _id: new ObjectId(id) });

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du post:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, author, content, category, status, images } = body;

    const db = await getDatabase();
    const postsCollection = db.collection('posts');

    // Si les images sont mises à jour, supprimer les anciennes images de Supabase
    if (images !== undefined) {
      const currentPost = await postsCollection.findOne({ _id: new ObjectId(id) }) as any;
      
      if (currentPost && currentPost.images && Array.isArray(currentPost.images)) {
        const newImages = Array.isArray(images) ? images : [];
        const imagesToDelete = currentPost.images.filter((img: string) => !newImages.includes(img));
        
        // Supprimer les images qui ne sont plus utilisées
        for (const imageUrl of imagesToDelete) {
          try {
            await deleteFromSupabase(imageUrl);
          } catch (error) {
            console.error('Erreur suppression ancienne image:', error);
          }
        }
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title) updateData.title = title;
    if (author) updateData.author = author;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (status) updateData.status = status;
    if (images !== undefined) {
      // Limiter à 3 images maximum
      updateData.images = Array.isArray(images) ? images.slice(0, 3) : [];
    }

    const result = await postsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Post introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post mis à jour avec succès',
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du post:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const postsCollection = db.collection('posts');

    // Récupérer le post pour obtenir les URLs des images
    const post = await postsCollection.findOne({ _id: new ObjectId(id) }) as any;

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post introuvable' },
        { status: 404 }
      );
    }

    // Supprimer le post de la base de données
    const result = await postsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la suppression' },
        { status: 500 }
      );
    }

    // Supprimer les images de Supabase Storage
    if (post.images && Array.isArray(post.images)) {
      for (const imageUrl of post.images) {
        try {
          await deleteFromSupabase(imageUrl);
        } catch (error) {
          console.error('Erreur suppression image:', error);
          // Continue même si une image échoue
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Post et images supprimés avec succès',
    });
  } catch (error: any) {
    console.error('Erreur lors de la suppression du post:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

