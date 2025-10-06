import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Save, Upload, ArrowLeft, Loader2, X, Bookmark, MoreVertical, Clock, AlertTriangle } from "lucide-react";
import { PageType } from "@/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Sidebar } from "./Sidebar";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface Post {
  _id?: string;
  title: string;
  author: string;
  content: string;
  images: string[]; // Jusqu'à 3 images
  category: string;
  status: 'draft' | 'published';
  createdAt: string | Date;
  updatedAt?: string | Date;
}

interface PostsPageProps {
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
}

export function PostsPage({ onNavigate, onLogout }: PostsPageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    content: '',
    category: 'Exhibition',
    status: 'draft' as 'draft' | 'published',
    images: [] as string[]
  });

  const categories = ['Exhibition', 'Artwork', 'Event', 'News', 'Education'];

  // Charger les posts depuis l'API
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/posts', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreatePost = () => {
    setFormData({
      title: '',
      author: '',
      content: '',
      category: 'Exhibition',
      status: 'draft',
      images: []
    });
    setSelectedPost(null);
    setView('create');
  };

  const handleEditPost = (post: Post) => {
    setFormData({
      title: post.title,
      author: post.author,
      content: post.content,
      category: post.category,
      status: post.status,
      images: post.images || []
    });
    setSelectedPost(post);
    setView('edit');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Vérifier qu'on ne dépasse pas 3 images
    const currentImageCount = formData.images.length;
    const availableSlots = 3 - currentImageCount;
    
    if (availableSlots <= 0) {
      toast.error('Maximum 3 images', {
        description: 'Vous avez atteint la limite de 3 images par post.'
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);

    try {
      setUploading(true);
      const uploadedUrls: string[] = [];

      // Upload chaque fichier
      for (const file of filesToUpload) {
        const formDataToSend = new FormData();
        formDataToSend.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: formDataToSend,
        });

        const data = await response.json();
        if (data.success) {
          uploadedUrls.push(data.url);
        } else {
          console.error('Erreur upload:', data.message);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          images: [...prev.images, ...uploadedUrls].slice(0, 3) 
        }));
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload des images');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSavePost = async () => {
    try {
      if (selectedPost && selectedPost._id) {
        // Update existing post
        const response = await fetch(`/api/posts/${selectedPost._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (data.success) {
          await fetchPosts();
          setView('list');
          toast.success('Post mis à jour', {
            description: 'Le post a été modifié avec succès'
          });
        } else {
          toast.error('Erreur de mise à jour', {
            description: data.message || 'Impossible de mettre à jour le post'
          });
        }
      } else {
        // Create new post
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (data.success) {
          await fetchPosts();
          setView('list');
          toast.success('Post créé', {
            description: 'Le nouveau post a été ajouté avec succès'
          });
        } else {
          toast.error('Erreur de création', {
            description: data.message || 'Impossible de créer le post'
          });
        }
      }
    } catch (error) {
      console.error('Erreur save:', error);
      toast.error('Erreur', {
        description: 'Une erreur est survenue lors de la sauvegarde'
      });
    }
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;

    try {
      const response = await fetch(`/api/posts/${postToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        await fetchPosts();
        toast.success('Post supprimé', {
          description: 'Le post a été supprimé définitivement'
        });
      } else {
        toast.error('Erreur de suppression', {
          description: data.message || 'Impossible de supprimer le post'
        });
      }
    } catch (error) {
      console.error('Erreur delete:', error);
      toast.error('Erreur', {
        description: 'Une erreur est survenue lors de la suppression'
      });
    } finally {
      setPostToDelete(null);
    }
  };

  const renderListView = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Museum Posts</h1>
          <p className="text-muted-foreground mt-1">Gérez les articles et annonces du musée</p>
        </div>
        <Button 
          onClick={handleCreatePost} 
          className="bg-primary hover:bg-primary-hover shadow-primary smooth-transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Créer un Post
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher des posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid - Mode Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Aucun post trouvé</p>
            <Button 
              onClick={handleCreatePost}
              variant="outline"
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer votre premier post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post, index) => (
            <Card 
              key={post._id} 
              className="border-0 shadow-lg card-hover overflow-hidden group animate-scale-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Image principale */}
              <div className="relative h-48 bg-muted overflow-hidden">
                {post.images && post.images.length > 0 ? (
                  <ImageWithFallback
                    src={post.images[0]}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 smooth-transition"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Upload className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                
                {/* Statut badge */}
                <div className="absolute top-3 right-3">
                  {post.status === 'published' ? (
                    <Badge className="bg-success/90 text-white border-0 backdrop-blur-sm">
                      Publié
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                      Brouillon
                    </Badge>
                  )}
                </div>

                {/* Save button */}
                <button className="absolute top-3 left-3 p-2 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white smooth-transition opacity-0 group-hover:opacity-100">
                  <Bookmark className="w-4 h-4 text-foreground" />
                </button>

                {/* Images count */}
                {post.images && post.images.length > 1 && (
                  <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
                    {post.images.length} photos
                  </div>
                )}
              </div>

              <CardContent className="p-5">
                {/* En-tête avec catégorie et date */}
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                    {post.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(post.createdAt).toLocaleDateString('fr-FR', { 
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                </div>

                {/* Titre et description */}
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary smooth-transition">
                  {post.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {post.content}
                </p>

                {/* Footer avec auteur et actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white text-xs font-semibold">
                      {post.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{post.author}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPost(post)}
                      className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => post._id && setPostToDelete(post._id)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderCreateEditView = () => (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setView('list')} className="hover:bg-muted">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">
          {selectedPost ? 'Modifier le Post' : 'Nouveau Post'}
        </h1>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Content */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Détails du Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Titre du post..."
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="author">Auteur</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  placeholder="Nom de l'artiste ou auteur..."
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="content">Contenu</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Écrivez votre contenu ici..."
                  className="min-h-[300px] mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Images Upload - Max 3 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Images ({formData.images.length}/3)</CardTitle>
                <span className="text-sm text-muted-foreground">Maximum 3 images</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Zone d'upload */}
                {formData.images.length < 3 && (
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/30 hover:bg-muted/50 smooth-transition">
                    <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-3">
                      Ajoutez jusqu'à {3 - formData.images.length} image{3 - formData.images.length > 1 ? 's' : ''} supplémentaire{3 - formData.images.length > 1 ? 's' : ''}
                    </p>
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <label htmlFor="file-upload">
                      <Button 
                        variant="outline" 
                        type="button"
                        disabled={uploading}
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Upload en cours...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Choisir des images
                          </>
                        )}
                      </Button>
                    </label>
                  </div>
                )}

                {/* Aperçu des images */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group animate-scale-in">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <ImageWithFallback
                            src={img}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-lg opacity-0 group-hover:opacity-100 smooth-transition hover:bg-destructive/90 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-md backdrop-blur-sm">
                          Image {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Paramètres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="status">Publié</Label>
                <Switch
                  id="status"
                  checked={formData.status === 'published'}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, status: checked ? 'published' : 'draft'})
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button 
                  onClick={handleSavePost} 
                  className="w-full bg-primary hover:bg-primary-hover shadow-primary"
                  disabled={!formData.title || !formData.author || !formData.content}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {formData.status === 'published' ? 'Publier' : 'Sauvegarder'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setView('list')} 
                  className="w-full"
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <Sidebar currentPage="posts" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-xl bg-card/80">
          <div className="px-8 py-6">
            <h2 className="text-lg font-semibold text-foreground">
              Gestion des Posts
            </h2>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {view === 'list' ? renderListView() : renderCreateEditView()}
        </main>
      </div>

      {/* Modal de confirmation de suppression */}
      <AlertDialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <AlertDialogContent className="border-0 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              Supprimer ce post ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Cette action est irréversible. Le post sera définitivement supprimé de la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="smooth-transition">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePost}
              className="bg-destructive hover:bg-destructive/90 text-white smooth-transition"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
