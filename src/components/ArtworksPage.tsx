import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Save, Upload, Palette, Clock, Eye, LayoutGrid, ArrowLeft, Loader2, X, Bookmark, MoreVertical, AlertTriangle } from "lucide-react";
import { PageType } from "@/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
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

interface Artwork {
  id: string;
  name: string;
  artist: string;
  year: string;
  description: string;
  image: string;
  exhibition: string;
  medium: string;
  dimensions: string;
  acquisitionDate: string;
  status: 'on-display' | 'in-storage' | 'on-loan' | 'conservation';
}

interface ArtworksPageProps {
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
}

export function ArtworksPage({ onNavigate, onLogout }: ArtworksPageProps) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [artworkToDelete, setArtworkToDelete] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [exhibitions] = useState([
    'Voix Africaines Contemporaines',
    'Royaumes Anciens d\'Afrique de l\'Ouest',
    'Art Sénégalais Moderne',
    'Artéfacts Coloniaux',
    'Non Assigné'
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterExhibition, setFilterExhibition] = useState('all');
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    artist: '',
    year: '',
    description: '',
    image: '',
    exhibition: 'Non Assigné',
    medium: '',
    dimensions: '',
    acquisitionDate: ''
  });

  // Charger les œuvres d'art au montage du composant
  useEffect(() => {
    // Pour l'instant, on utilise des données statiques
    // Plus tard, on pourra connecter à une API
    setLoading(false);
  }, []);

  const filteredArtworks = artworks.filter(artwork => {
    const matchesSearch = artwork.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artwork.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || artwork.status === filterStatus;
    const matchesExhibition = filterExhibition === 'all' || artwork.exhibition === filterExhibition;
    return matchesSearch && matchesStatus && matchesExhibition;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0]; // Une seule image pour les œuvres d'art
    setSelectedFile(file);
    
    // Reset l'input pour permettre la sélection du même fichier
    e.target.value = '';
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
  };

  const handleCreateArtwork = () => {
    setFormData({
      name: '',
      artist: '',
      year: '',
      description: '',
      image: '',
      exhibition: 'Non Assigné',
      medium: '',
      dimensions: '',
      acquisitionDate: ''
    });
    setSelectedFile(null);
    setSelectedArtwork(null);
    setView('create');
  };

  const handleEditArtwork = (artwork: Artwork) => {
    setFormData({
      name: artwork.name,
      artist: artwork.artist,
      year: artwork.year,
      description: artwork.description,
      image: artwork.image,
      exhibition: artwork.exhibition,
      medium: artwork.medium,
      dimensions: artwork.dimensions,
      acquisitionDate: artwork.acquisitionDate
    });
    setSelectedFile(null);
    setSelectedArtwork(artwork);
    setView('edit');
  };

  const handleSaveArtwork = async () => {
    try {
      setUploading(true);
      
      // Upload du fichier sélectionné s'il y en a un
      let imageUrl = formData.image;
      if (selectedFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('file', selectedFile);

        const response = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: formDataToSend,
        });

        const data = await response.json();
        if (data.success) {
          imageUrl = data.url;
        } else {
          console.error('Erreur upload:', data.message);
          toast.error('Erreur lors de l\'upload', {
            description: `Impossible d'uploader ${selectedFile.name}`
          });
          return;
        }
      }

      // Determine status based on exhibition assignment
      let status: 'on-display' | 'in-storage' | 'on-loan' | 'conservation' = 'in-storage';
      if (formData.exhibition !== 'Non Assigné') {
        status = 'on-display';
      }

      // Préparer les données avec l'image uploadée
      const artworkData = {
        ...formData,
        image: imageUrl,
        status
      };

      if (selectedArtwork) {
        // Edit existing artwork
        setArtworks(artworks.map(artwork =>
          artwork.id === selectedArtwork.id
            ? { ...artwork, ...artworkData }
            : artwork
        ));
        toast.success('Œuvre d\'art modifiée avec succès');
      } else {
        // Create new artwork
        const newArtwork: Artwork = {
          id: Date.now().toString(),
          ...artworkData
        };
        setArtworks([...artworks, newArtwork]);
        toast.success('Œuvre d\'art créée avec succès');
      }
      setView('list');
      setSelectedFile(null); // Reset du fichier sélectionné
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
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
      setArtworks(artworks.filter(artwork => artwork.id !== artworkToDelete));
      toast.success('Œuvre d\'art supprimée', {
        description: 'L\'œuvre d\'art a été supprimée définitivement'
      });
    } catch (error) {
      console.error('Erreur delete:', error);
      toast.error('Erreur', {
        description: 'Une erreur est survenue lors de la suppression'
      });
    } finally {
      setArtworkToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-display': return 'bg-green-100 text-green-800';
      case 'in-storage': return 'bg-gray-100 text-gray-800';
      case 'on-loan': return 'bg-blue-100 text-blue-800';
      case 'conservation': return 'bg-orange-100 text-orange-800';
      default: return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on-display': return 'Exposée';
      case 'in-storage': return 'En Réserve';
      case 'on-loan': return 'En Prêt';
      case 'conservation': return 'Conservation';
      default: return status;
    }
  };

  const renderListView = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Œuvres d'Art</h1>
          <p className="text-muted-foreground mt-1">Gérez la collection d'œuvres d'art du musée</p>
        </div>
        <Button 
          onClick={handleCreateArtwork} 
          className="bg-primary hover:bg-primary-hover shadow-primary smooth-transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une Œuvre
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exposées</p>
                <p className="text-xl font-semibold">{artworks.filter(a => a.status === 'on-display').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Réserve</p>
                <p className="text-xl font-semibold">{artworks.filter(a => a.status === 'in-storage').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ArrowLeft className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Prêt</p>
                <p className="text-xl font-semibold">{artworks.filter(a => a.status === 'on-loan').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conservation</p>
                <p className="text-xl font-semibold">{artworks.filter(a => a.status === 'conservation').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher des œuvres d'art..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="on-display">Exposées</SelectItem>
                <SelectItem value="in-storage">En Réserve</SelectItem>
                <SelectItem value="on-loan">En Prêt</SelectItem>
                <SelectItem value="conservation">Conservation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterExhibition} onValueChange={setFilterExhibition}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Filtrer par exposition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les expositions</SelectItem>
                {exhibitions.map(exhibition => (
                  <SelectItem key={exhibition} value={exhibition}>
                    {exhibition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Artworks Grid - Mode Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredArtworks.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <Palette className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Aucune œuvre d'art trouvée</p>
            <Button 
              onClick={handleCreateArtwork}
              variant="outline"
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter votre première œuvre
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtworks.map((artwork, index) => (
            <Card 
              key={artwork.id} 
              className="border-0 shadow-lg card-hover overflow-hidden group animate-scale-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Image principale */}
              <div className="relative h-64 bg-muted overflow-hidden">
                {artwork.image ? (
                  <ImageWithFallback
                    src={artwork.image}
                    alt={artwork.name}
                    className="w-full h-full object-cover group-hover:scale-105 smooth-transition"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Palette className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                
                {/* Statut badge */}
                <div className="absolute top-3 right-3">
                  <Badge className={getStatusColor(artwork.status)}>
                    {getStatusLabel(artwork.status)}
                  </Badge>
                </div>

                {/* Save button */}
                <button className="absolute top-3 left-3 p-2 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white smooth-transition opacity-0 group-hover:opacity-100">
                  <Bookmark className="w-4 h-4 text-foreground" />
                </button>
              </div>

              <CardContent className="p-5">
                {/* En-tête avec exposition et année */}
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                    {artwork.exhibition}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {artwork.year}
                  </div>
                </div>

                {/* Titre et artiste */}
                <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary smooth-transition">
                  {artwork.name}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {artwork.artist}
                </p>

                {/* Détails techniques */}
                <div className="space-y-1 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Palette className="w-3 h-3" />
                    <span className="truncate">{artwork.medium}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-3 h-3" />
                    <span className="truncate">{artwork.dimensions}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {artwork.description}
                </p>

                {/* Footer avec actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
                      {artwork.artist.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{artwork.artist}</p>
                    </div>
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
                      onClick={() => setArtworkToDelete(artwork.id)}
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
          {selectedArtwork ? 'Modifier l\'Œuvre' : 'Nouvelle Œuvre d\'Art'}
        </h1>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Détails de l'Œuvre</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de l'Œuvre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nom de l'œuvre d'art..."
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="artist">Artiste</Label>
                  <Input
                    id="artist"
                    value={formData.artist}
                    onChange={(e) => setFormData({...formData, artist: e.target.value})}
                    placeholder="Nom de l'artiste..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="year">Année</Label>
                  <Input
                    id="year"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    placeholder="Année de création..."
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="medium">Technique</Label>
                  <Input
                    id="medium"
                    value={formData.medium}
                    onChange={(e) => setFormData({...formData, medium: e.target.value})}
                    placeholder="ex: Huile sur toile"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
                    placeholder="ex: 120 x 90 cm"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="acquisitionDate">Date d'Acquisition</Label>
                <Input
                  id="acquisitionDate"
                  type="date"
                  value={formData.acquisitionDate}
                  onChange={(e) => setFormData({...formData, acquisitionDate: e.target.value})}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Décrivez l'œuvre d'art..."
                  className="min-h-[120px] mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Image de l'Œuvre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Zone d'upload */}
                {!selectedFile && (
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/30 hover:bg-muted/50 smooth-transition">
                    <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-3">
                      Ajoutez une image de l'œuvre d'art
                    </p>
                    <input
                      type="file"
                      id="artwork-upload"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label htmlFor="artwork-upload">
                      <Button 
                        variant="outline" 
                        type="button"
                        onClick={() => document.getElementById('artwork-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choisir une image
                      </Button>
                    </label>
                  </div>
                )}

                {/* Aperçu du fichier sélectionné */}
                {selectedFile && (
                  <div className="relative group animate-scale-in">
                    <div className="w-full h-64 rounded-lg overflow-hidden bg-muted border-2 border-dashed border-primary/30">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto mb-4 text-primary" />
                          <p className="text-muted-foreground px-4">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Sera uploadé lors de la sauvegarde
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveSelectedFile}
                      className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-lg opacity-0 group-hover:opacity-100 smooth-transition hover:bg-destructive/90 shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary/60 text-white text-xs rounded-md backdrop-blur-sm">
                      Nouvelle image
                    </div>
                  </div>
                )}

                {/* Aperçu de l'image existante */}
                {formData.image && !selectedFile && (
                  <div className="relative group animate-scale-in">
                    <div className="w-full h-64 rounded-lg overflow-hidden bg-muted">
                      <ImageWithFallback
                        src={formData.image}
                        alt="Aperçu de l'œuvre"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-lg opacity-0 group-hover:opacity-100 smooth-transition hover:bg-destructive/90 shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-md backdrop-blur-sm">
                      Image actuelle
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Exhibition Assignment */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Assignation d'Exposition</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="exhibition">Assigner à une Exposition</Label>
                <Select 
                  value={formData.exhibition} 
                  onValueChange={(value) => setFormData({...formData, exhibition: value})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {exhibitions.map(exhibition => (
                      <SelectItem key={exhibition} value={exhibition}>
                        {exhibition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Les œuvres assignées à des expositions seront marquées comme "Exposées"
                </p>
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
                  disabled={!formData.name || !formData.artist || uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {selectedFile ? 'Upload et sauvegarde...' : 'Sauvegarde...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder l'Œuvre
                    </>
                  )}
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

          {/* Preview */}
          {(formData.name || formData.artist) && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Aperçu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {formData.name && (
                  <h3 className="font-medium">{formData.name}</h3>
                )}
                {formData.artist && (
                  <p className="text-muted-foreground">{formData.artist}</p>
                )}
                {formData.year && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{formData.year}</span>
                  </div>
                )}
                {formData.medium && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Palette className="w-4 h-4" />
                    <span>{formData.medium}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
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
              Gestion des Œuvres d'Art
            </h2>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {view === 'list' ? renderListView() : renderCreateEditView()}
        </main>
      </div>

      {/* Modal de confirmation de suppression */}
      <AlertDialog open={!!artworkToDelete} onOpenChange={(open) => !open && setArtworkToDelete(null)}>
        <AlertDialogContent className="border-0 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              Supprimer cette œuvre ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Cette action est irréversible. L'œuvre d'art sera définitivement supprimée de la collection.
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