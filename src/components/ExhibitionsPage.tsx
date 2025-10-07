import { useState, useEffect } from "react";
import { 
  Search, Plus, Edit, Trash2, Save, Upload, ArrowLeft, Loader2, X, 
  AlertTriangle, Image as ImageIcon, Palette, CheckSquare, Square, Layers
} from "lucide-react";
import { PageType, Exhibition, Artwork } from "@/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
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

interface ExhibitionsPageProps {
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
}

interface FormData {
  title: string;
  subtitle: string;
  image: string;
  artworks: string[];
}

export function ExhibitionsPage({ onNavigate, onLogout }: ExhibitionsPageProps) {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [artworkSearchTerm, setArtworkSearchTerm] = useState('');
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null);
  const [exhibitionToDelete, setExhibitionToDelete] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    subtitle: '',
    image: '',
    artworks: []
  });

  // Upload state
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Charger les exhibitions et artworks
  useEffect(() => {
    fetchExhibitions();
    fetchArtworks();
  }, []);

  const fetchExhibitions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/exhibitions', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setExhibitions(data.exhibitions);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des exhibitions:', error);
      toast.error('Erreur', {
        description: 'Impossible de charger les exhibitions'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchArtworks = async () => {
    try {
      const response = await fetch('/api/artworks', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setArtworks(data.artworks);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des artworks:', error);
    }
  };

  const filteredExhibitions = exhibitions.filter(exhibition => 
    exhibition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exhibition.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredArtworks = artworks.filter(artwork =>
    artwork.title.toLowerCase().includes(artworkSearchTerm.toLowerCase()) ||
    artwork.slug.toLowerCase().includes(artworkSearchTerm.toLowerCase())
  );

  const handleCreateExhibition = () => {
    setFormData({
      title: '',
      subtitle: '',
      image: '',
      artworks: []
    });
    setImageFile(null);
    setSelectedExhibition(null);
    setView('create');
  };

  const handleEditExhibition = (exhibition: Exhibition) => {
    setFormData({
      title: exhibition.title,
      subtitle: exhibition.subtitle,
      image: exhibition.image,
      artworks: exhibition.artworks
    });
    setImageFile(null);
    setSelectedExhibition(exhibition);
    setView('edit');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const toggleArtwork = (artworkId: string) => {
    setFormData(prev => ({
      ...prev,
      artworks: prev.artworks.includes(artworkId)
        ? prev.artworks.filter(id => id !== artworkId)
        : [...prev.artworks, artworkId]
    }));
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formDataToSend = new FormData();
    formDataToSend.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      credentials: 'include',
      body: formDataToSend,
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Upload failed');
    }
    return data.url;
  };

  const handleSaveExhibition = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Erreur', { description: 'Le titre est requis' });
      return;
    }

    if (!formData.subtitle.trim()) {
      toast.error('Erreur', { description: 'Le sous-titre est requis' });
      return;
    }

    if (!formData.image && !imageFile) {
      toast.error('Erreur', { description: 'Une image est requise' });
      return;
    }

    try {
      setUploading(true);

      // Upload de l'image si nécessaire
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await uploadFile(imageFile);
      }

      // Préparer les données
      const exhibitionData = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        image: imageUrl,
        artworks: formData.artworks
      };

      // Créer ou mettre à jour
      if (selectedExhibition && selectedExhibition._id) {
        const response = await fetch(`/api/exhibitions/${selectedExhibition._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(exhibitionData),
        });

        const data = await response.json();
        if (data.success) {
          await fetchExhibitions();
          await fetchArtworks(); // Rafraîchir les artworks pour voir les relations
          setView('list');
          toast.success('Exhibition mise à jour', {
            description: 'L\'exhibition a été modifiée avec succès'
          });
        } else {
          toast.error('Erreur', { description: data.message });
        }
      } else {
        const response = await fetch('/api/exhibitions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(exhibitionData),
        });

        const data = await response.json();
        if (data.success) {
          await fetchExhibitions();
          await fetchArtworks(); // Rafraîchir les artworks pour voir les relations
          setView('list');
          toast.success('Exhibition créée', {
            description: 'La nouvelle exhibition a été ajoutée avec succès'
          });
        } else {
          toast.error('Erreur', { description: data.message });
        }
      }
    } catch (error) {
      console.error('Erreur save:', error);
      toast.error('Erreur', {
        description: 'Une erreur est survenue lors de la sauvegarde'
      });
    } finally {
      setUploading(false);
    }
  };

  const confirmDeleteExhibition = async () => {
    if (!exhibitionToDelete) return;

    try {
      const response = await fetch(`/api/exhibitions/${exhibitionToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        await fetchExhibitions();
        await fetchArtworks(); // Rafraîchir les artworks
        toast.success('Exhibition supprimée', {
          description: 'L\'exhibition a été supprimée définitivement'
        });
      } else {
        toast.error('Erreur', { description: data.message });
      }
    } catch (error) {
      console.error('Erreur delete:', error);
      toast.error('Erreur', {
        description: 'Une erreur est survenue lors de la suppression'
      });
    } finally {
      setExhibitionToDelete(null);
    }
  };

  // === RENDER LIST VIEW ===
  const renderListView = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exhibitions</h1>
          <p className="text-muted-foreground mt-1">Gérez les expositions du musée</p>
        </div>
        <Button 
          onClick={handleCreateExhibition} 
          className="bg-primary hover:bg-primary-hover shadow-primary smooth-transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Créer une Exhibition
        </Button>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher une exhibition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Exhibitions Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredExhibitions.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <Layers className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Aucune exhibition trouvée</p>
            <Button 
              onClick={handleCreateExhibition}
              variant="outline"
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer votre première exhibition
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExhibitions.map((exhibition, index) => (
            <Card 
              key={exhibition._id} 
              className="border-0 shadow-lg card-hover overflow-hidden group animate-scale-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Image */}
              <div className="relative h-64 bg-muted overflow-hidden">
                <ImageWithFallback
                  src={exhibition.image}
                  alt={exhibition.title}
                  className="w-full h-full object-cover group-hover:scale-105 smooth-transition"
                />
                
                {/* Badge nombre d'artworks */}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-primary/90 text-white border-0 backdrop-blur-sm">
                    <Palette className="w-3 h-3 mr-1" />
                    {exhibition.artworks.length} œuvres
                  </Badge>
                </div>
              </div>

              <CardContent className="p-5">
                {/* Slug */}
                <Badge variant="secondary" className="mb-3 text-xs font-mono">
                  {exhibition.slug}
                </Badge>

                {/* Titre */}
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary smooth-transition">
                  {exhibition.title}
                </h3>
                
                {/* Sous-titre */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {exhibition.subtitle}
                </p>

                {/* Footer avec actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Layers className="w-3 h-3" />
                    Exhibition
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditExhibition(exhibition)}
                      className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exhibition._id && setExhibitionToDelete(exhibition._id)}
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

  // === RENDER CREATE/EDIT VIEW ===
  const renderCreateEditView = () => (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setView('list')} className="hover:bg-muted">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">
          {selectedExhibition ? 'Modifier l\'Exhibition' : 'Nouvelle Exhibition'}
        </h1>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Informations principales */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Informations de l'Exhibition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: L'Afrique berceau de l'humanité"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Le slug sera généré automatiquement à partir du titre
                </p>
              </div>

              <div>
                <Label htmlFor="subtitle">Sous-titre *</Label>
                <Textarea
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  placeholder="Ex: la naissance de l'humanité"
                  className="mt-2"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Image de bannière */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Image de Bannière *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.image && !imageFile && (
                  <div className="relative group">
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <ImageWithFallback
                        src={formData.image}
                        alt="Image de bannière"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setFormData({...formData, image: ''})}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 smooth-transition"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                )}

                {imageFile && (
                  <div className="border-2 border-primary/30 border-dashed rounded-lg p-4 bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ImageIcon className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium">{imageFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setImageFile(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {!formData.image && !imageFile && (
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/30 hover:bg-muted/50 smooth-transition">
                    <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-3">
                      Ajoutez l'image de bannière de l'exhibition
                    </p>
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <label htmlFor="image-upload">
                      <Button 
                        variant="outline" 
                        type="button"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choisir une image
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sélection des artworks */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Œuvres d'Art ({formData.artworks.length} sélectionnées)</CardTitle>
                <Input
                  placeholder="Rechercher une œuvre..."
                  value={artworkSearchTerm}
                  onChange={(e) => setArtworkSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredArtworks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Palette className="w-8 h-8 mx-auto mb-2" />
                    <p>Aucune œuvre d'art disponible</p>
                    <p className="text-xs mt-1">Créez d'abord des artworks avant de créer une exhibition</p>
                  </div>
                ) : (
                  filteredArtworks.map((artwork) => {
                    const isSelected = formData.artworks.includes(artwork._id || '');
                    return (
                      <div
                        key={artwork._id}
                        onClick={() => artwork._id && toggleArtwork(artwork._id)}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border cursor-pointer smooth-transition
                          ${isSelected 
                            ? 'bg-primary/10 border-primary hover:bg-primary/20' 
                            : 'bg-muted/30 border-border hover:bg-muted/50'}
                        `}
                      >
                        <div className="flex-shrink-0">
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                          <ImageWithFallback
                            src={artwork.image}
                            alt={artwork.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{artwork.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{artwork.slug}</p>
                        </div>
                        {artwork.exhibition && artwork.exhibition !== selectedExhibition?._id && (
                          <Badge variant="secondary" className="text-xs">
                            Déjà utilisée
                          </Badge>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button 
                  onClick={handleSaveExhibition} 
                  className="w-full bg-primary hover:bg-primary-hover shadow-primary"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sauvegarde en cours...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setView('list')} 
                  className="w-full"
                  disabled={uploading}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informations */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm">💡 Informations</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Le slug est généré automatiquement à partir du titre</p>
              <p>• Sélectionnez les œuvres d'art qui seront affichées dans cette exhibition</p>
              <p>• Les relations sont mises à jour automatiquement</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <Sidebar currentPage="exhibitions" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-xl bg-card/80">
          <div className="px-8 py-6">
            <h2 className="text-lg font-semibold text-foreground">
              Gestion des Exhibitions
            </h2>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {view === 'list' ? renderListView() : renderCreateEditView()}
        </main>
      </div>

      {/* Modal de confirmation de suppression */}
      <AlertDialog open={!!exhibitionToDelete} onOpenChange={(open: boolean) => !open && setExhibitionToDelete(null)}>
        <AlertDialogContent className="border-0 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              Supprimer cette exhibition ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Cette action est irréversible. L'exhibition sera supprimée et les références dans les artworks seront retirées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="smooth-transition">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteExhibition}
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
