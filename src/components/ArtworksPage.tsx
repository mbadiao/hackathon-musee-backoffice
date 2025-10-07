import { useState, useEffect } from "react";
import { 
  Search, Plus, Edit, Trash2, Save, Upload, ArrowLeft, Loader2, X, 
  AlertTriangle, Image as ImageIcon, Music, Palette, FileText, 
  Heading1, AlignLeft, GripVertical, ChevronUp, ChevronDown, Languages
} from "lucide-react";
import { PageType, Artwork } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ArtworksPageProps {
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
}

interface DescriptionBlock {
  type: "heading" | "paragraph";
  content: string;
}

interface GalleryImage {
  url: string;
  alt: string;
}

interface FormData {
  title: string;
  description: DescriptionBlock[];
  image: string;
  audioUrls: {
    en: string;
    fr: string;
    wo: string;
  };
  gallery: GalleryImage[];
}

export function ArtworksPage({ onNavigate, onLogout }: ArtworksPageProps) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [artworkToDelete, setArtworkToDelete] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: [{ type: 'heading', content: '' }],
    image: '',
    audioUrls: {
      en: '',
      fr: '',
      wo: ''
    },
    gallery: []
  });

  // Upload states
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [audioFiles, setAudioFiles] = useState<{
    en: File | null;
    fr: File | null;
    wo: File | null;
  }>({
    en: null,
    fr: null,
    wo: null
  });
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  // Charger les artworks depuis l'API
  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/artworks', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setArtworks(data.artworks);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des artworks:', error);
      toast.error('Erreur', {
        description: 'Impossible de charger les artworks'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredArtworks = artworks.filter(artwork => 
    artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artwork.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateArtwork = () => {
    setFormData({
      title: '',
      description: [{ type: 'heading', content: '' }],
      image: '',
      audioUrls: { en: '', fr: '', wo: '' },
      gallery: []
    });
    setMainImageFile(null);
    setAudioFiles({ en: null, fr: null, wo: null });
    setGalleryFiles([]);
    setSelectedArtwork(null);
    setView('create');
  };

  const handleEditArtwork = (artwork: Artwork) => {
    setFormData({
      title: artwork.title,
      description: artwork.description,
      image: artwork.image,
      audioUrls: {
        en: artwork.audioUrls.en || '',
        fr: artwork.audioUrls.fr || '',
        wo: artwork.audioUrls.wo || ''
      },
      gallery: artwork.gallery
    });
    setMainImageFile(null);
    setAudioFiles({ en: null, fr: null, wo: null });
    setGalleryFiles([]);
    setSelectedArtwork(artwork);
    setView('edit');
  };

  // === GESTION DES BLOCS DE DESCRIPTION ===
  const addDescriptionBlock = (type: "heading" | "paragraph") => {
    setFormData(prev => ({
      ...prev,
      description: [...prev.description, { type, content: '' }]
    }));
  };

  const updateDescriptionBlock = (index: number, content: string) => {
    setFormData(prev => ({
      ...prev,
      description: prev.description.map((block, i) => 
        i === index ? { ...block, content } : block
      )
    }));
  };

  const removeDescriptionBlock = (index: number) => {
    if (formData.description.length === 1) {
      toast.error('Erreur', {
        description: 'Au moins un bloc de description est requis'
      });
      return;
    }
    setFormData(prev => ({
      ...prev,
      description: prev.description.filter((_, i) => i !== index)
    }));
  };

  const moveDescriptionBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.description.length) return;

    setFormData(prev => {
      const newDescription = [...prev.description];
      [newDescription[index], newDescription[newIndex]] = [newDescription[newIndex], newDescription[index]];
      return { ...prev, description: newDescription };
    });
  };

  // === UPLOAD HANDLERS ===
  const handleMainImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImageFile(e.target.files[0]);
    }
  };

  const handleAudioFileSelect = (lang: 'en' | 'fr' | 'wo', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFiles(prev => ({ ...prev, [lang]: e.target.files![0] }));
    }
  };

  const handleGalleryFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setGalleryFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeGalleryFile = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  // === UPLOAD VERS SUPABASE ===
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

  // === SAUVEGARDE ===
  const handleSaveArtwork = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Erreur', { description: 'Le titre est requis' });
      return;
    }

    if (formData.description.length === 0 || !formData.description.some(b => b.content.trim())) {
      toast.error('Erreur', { description: 'Au moins un bloc de description avec du contenu est requis' });
      return;
    }

    if (!formData.image && !mainImageFile) {
      toast.error('Erreur', { description: 'Une image principale est requise' });
      return;
    }

    try {
      setUploading(true);

      // Upload de l'image principale si nécessaire
      let imageUrl = formData.image;
      if (mainImageFile) {
        imageUrl = await uploadFile(mainImageFile);
      }

      // Upload des fichiers audio
      const audioUrls = { ...formData.audioUrls };
      if (audioFiles.en) audioUrls.en = await uploadFile(audioFiles.en);
      if (audioFiles.fr) audioUrls.fr = await uploadFile(audioFiles.fr);
      if (audioFiles.wo) audioUrls.wo = await uploadFile(audioFiles.wo);

      // Upload des images de galerie
      const newGalleryImages: GalleryImage[] = [];
      for (const file of galleryFiles) {
        const url = await uploadFile(file);
        newGalleryImages.push({ url, alt: file.name });
      }

      // Préparer les données finales
      const artworkData = {
        title: formData.title.trim(),
        description: formData.description.filter(b => b.content.trim()),
        image: imageUrl,
        audioUrls,
        gallery: [...formData.gallery, ...newGalleryImages]
      };

      // Créer ou mettre à jour
      if (selectedArtwork && selectedArtwork._id) {
        const response = await fetch(`/api/artworks/${selectedArtwork._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(artworkData),
        });

        const data = await response.json();
        if (data.success) {
          await fetchArtworks();
          setView('list');
          toast.success('Artwork mise à jour', {
            description: 'L\'œuvre a été modifiée avec succès'
          });
        } else {
          toast.error('Erreur', { description: data.message });
        }
      } else {
        const response = await fetch('/api/artworks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(artworkData),
        });

        const data = await response.json();
        if (data.success) {
          await fetchArtworks();
          setView('list');
          toast.success('Artwork créée', {
            description: 'La nouvelle œuvre a été ajoutée avec succès'
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

  const confirmDeleteArtwork = async () => {
    if (!artworkToDelete) return;

    try {
      const response = await fetch(`/api/artworks/${artworkToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        await fetchArtworks();
        toast.success('Artwork supprimée', {
          description: 'L\'œuvre a été supprimée définitivement'
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
      setArtworkToDelete(null);
    }
  };

  // === RENDER LIST VIEW ===
  const renderListView = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Artworks Collection</h1>
          <p className="text-muted-foreground mt-1">Gérez les œuvres d'art du musée</p>
        </div>
        <Button 
          onClick={handleCreateArtwork} 
          className="bg-primary hover:bg-primary-hover shadow-primary smooth-transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une Artwork
        </Button>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher une œuvre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Artworks Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredArtworks.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <Palette className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Aucune artwork trouvée</p>
            <Button 
              onClick={handleCreateArtwork}
              variant="outline"
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer votre première artwork
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtworks.map((artwork, index) => (
            <Card 
              key={artwork._id} 
              className="border-0 shadow-lg card-hover overflow-hidden group animate-scale-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Image principale */}
              <div className="relative h-64 bg-muted overflow-hidden">
                <ImageWithFallback
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-full h-full object-cover group-hover:scale-105 smooth-transition"
                />
                
                {/* Badges */}
                <div className="absolute top-3 right-3 flex gap-2">
                  {(artwork.audioUrls.en || artwork.audioUrls.fr || artwork.audioUrls.wo) && (
                    <Badge className="bg-success/90 text-white border-0 backdrop-blur-sm">
                      <Music className="w-3 h-3 mr-1" />
                      Audio
                    </Badge>
                  )}
                  {artwork.gallery.length > 0 && (
                    <Badge className="bg-primary/90 text-white border-0 backdrop-blur-sm">
                      {artwork.gallery.length} photos
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-5">
                {/* Slug */}
                <Badge variant="secondary" className="mb-3 text-xs font-mono">
                  {artwork.slug}
                </Badge>

                {/* Titre */}
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary smooth-transition">
                  {artwork.title}
                </h3>
                
                {/* Description preview */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {artwork.description[0]?.content}
                </p>

                {/* Footer avec actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="w-3 h-3" />
                    {artwork.description.length} bloc{artwork.description.length > 1 ? 's' : ''}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditArtwork(artwork)}
                      className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => artwork._id && setArtworkToDelete(artwork._id)}
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
          {selectedArtwork ? 'Modifier l\'Artwork' : 'Nouvelle Artwork'}
        </h1>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Titre */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Informations Principales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre de l'œuvre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: La Joconde"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Le slug sera généré automatiquement à partir du titre
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Description Blocks */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Description *</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addDescriptionBlock('heading')}
                  >
                    <Heading1 className="w-4 h-4 mr-2" />
                    Titre
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addDescriptionBlock('paragraph')}
                  >
                    <AlignLeft className="w-4 h-4 mr-2" />
                    Paragraphe
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.description.map((block, index) => (
                <div key={index} className="border border-border rounded-lg p-4 space-y-2 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <Badge variant={block.type === 'heading' ? 'default' : 'secondary'}>
                      {block.type === 'heading' ? (
                        <>
                          <Heading1 className="w-3 h-3 mr-1" />
                          Titre
                        </>
                      ) : (
                        <>
                          <AlignLeft className="w-3 h-3 mr-1" />
                          Paragraphe
                        </>
                      )}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveDescriptionBlock(index, 'up')}
                        disabled={index === 0}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveDescriptionBlock(index, 'down')}
                        disabled={index === formData.description.length - 1}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDescriptionBlock(index)}
                        className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {block.type === 'heading' ? (
                    <Input
                      value={block.content}
                      onChange={(e) => updateDescriptionBlock(index, e.target.value)}
                      placeholder="Entrez un titre..."
                      className="font-semibold"
                    />
                  ) : (
                    <Textarea
                      value={block.content}
                      onChange={(e) => updateDescriptionBlock(index, e.target.value)}
                      placeholder="Entrez un paragraphe..."
                      className="min-h-[100px]"
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Image Principale */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Image Principale *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.image && !mainImageFile && (
                  <div className="relative group">
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <ImageWithFallback
                        src={formData.image}
                        alt="Image principale"
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

                {mainImageFile && (
                  <div className="border-2 border-primary/30 border-dashed rounded-lg p-4 bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ImageIcon className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium">{mainImageFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(mainImageFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMainImageFile(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {!formData.image && !mainImageFile && (
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/30 hover:bg-muted/50 smooth-transition">
                    <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-3">
                      Ajoutez l'image principale de l'œuvre
                    </p>
                    <input
                      type="file"
                      id="main-image-upload"
                      accept="image/*"
                      onChange={handleMainImageSelect}
                      className="hidden"
                    />
                    <label htmlFor="main-image-upload">
                      <Button 
                        variant="outline" 
                        type="button"
                        onClick={() => document.getElementById('main-image-upload')?.click()}
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

          {/* Galerie */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Galerie d'Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Images existantes */}
                {formData.gallery.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {formData.gallery.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <ImageWithFallback
                            src={img.url}
                            alt={img.alt}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => removeExistingGalleryImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-lg opacity-0 group-hover:opacity-100 smooth-transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Nouveaux fichiers */}
                {galleryFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {galleryFiles.map((file, index) => (
                      <div key={index} className="relative group border-2 border-dashed border-primary/30 rounded-lg p-2 bg-primary/5">
                        <div className="text-center">
                          <ImageIcon className="w-6 h-6 mx-auto mb-2 text-primary" />
                          <p className="text-xs truncate">{file.name}</p>
                        </div>
                        <button
                          onClick={() => removeGalleryFile(index)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-white rounded opacity-0 group-hover:opacity-100 smooth-transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Zone d'upload */}
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/30">
                  <input
                    type="file"
                    id="gallery-upload"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryFilesSelect}
                    className="hidden"
                  />
                  <label htmlFor="gallery-upload">
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => document.getElementById('gallery-upload')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Ajouter des images
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Fichiers Audio */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                Audio Guides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Anglais */}
              <div>
                <Label htmlFor="audio-en" className="flex items-center gap-2 mb-2">
                  🇬🇧 Anglais
                </Label>
                {formData.audioUrls.en && !audioFiles.en ? (
                  <div className="flex items-center justify-between p-2 bg-success/10 rounded">
                    <Music className="w-4 h-4 text-success" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({
                        ...formData,
                        audioUrls: { ...formData.audioUrls, en: '' }
                      })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : audioFiles.en ? (
                  <div className="flex items-center justify-between p-2 bg-primary/10 rounded">
                    <p className="text-xs truncate">{audioFiles.en.name}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAudioFiles({ ...audioFiles, en: null })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      id="audio-en"
                      accept="audio/*"
                      onChange={(e) => handleAudioFileSelect('en', e)}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => document.getElementById('audio-en')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choisir
                    </Button>
                  </>
                )}
              </div>

              {/* Français */}
              <div>
                <Label htmlFor="audio-fr" className="flex items-center gap-2 mb-2">
                  🇫🇷 Français
                </Label>
                {formData.audioUrls.fr && !audioFiles.fr ? (
                  <div className="flex items-center justify-between p-2 bg-success/10 rounded">
                    <Music className="w-4 h-4 text-success" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({
                        ...formData,
                        audioUrls: { ...formData.audioUrls, fr: '' }
                      })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : audioFiles.fr ? (
                  <div className="flex items-center justify-between p-2 bg-primary/10 rounded">
                    <p className="text-xs truncate">{audioFiles.fr.name}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAudioFiles({ ...audioFiles, fr: null })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      id="audio-fr"
                      accept="audio/*"
                      onChange={(e) => handleAudioFileSelect('fr', e)}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => document.getElementById('audio-fr')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choisir
                    </Button>
                  </>
                )}
              </div>

              {/* Wolof */}
              <div>
                <Label htmlFor="audio-wo" className="flex items-center gap-2 mb-2">
                  🇸🇳 Wolof
                </Label>
                {formData.audioUrls.wo && !audioFiles.wo ? (
                  <div className="flex items-center justify-between p-2 bg-success/10 rounded">
                    <Music className="w-4 h-4 text-success" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({
                        ...formData,
                        audioUrls: { ...formData.audioUrls, wo: '' }
                      })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : audioFiles.wo ? (
                  <div className="flex items-center justify-between p-2 bg-primary/10 rounded">
                    <p className="text-xs truncate">{audioFiles.wo.name}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAudioFiles({ ...audioFiles, wo: null })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      id="audio-wo"
                      accept="audio/*"
                      onChange={(e) => handleAudioFileSelect('wo', e)}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => document.getElementById('audio-wo')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choisir
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button 
                  onClick={handleSaveArtwork} 
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
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <Sidebar currentPage="artworks" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-xl bg-card/80">
          <div className="px-8 py-6">
            <h2 className="text-lg font-semibold text-foreground">
              Gestion des Artworks
            </h2>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {view === 'list' ? renderListView() : renderCreateEditView()}
        </main>
      </div>

      {/* Modal de confirmation de suppression */}
      <AlertDialog open={!!artworkToDelete} onOpenChange={(open: boolean) => !open && setArtworkToDelete(null)}>
        <AlertDialogContent className="border-0 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              Supprimer cette artwork ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Cette action est irréversible. L'œuvre sera définitivement supprimée de la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="smooth-transition">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteArtwork}
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
