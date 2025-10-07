import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Save, Upload, Clock, MapPin, Link, Calendar, Eye, LayoutGrid, ArrowLeft, Loader2, X } from "lucide-react";
import { PageType, Event } from "@/types";
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

interface EventsPageProps {
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
}

export function EventsPage({ onNavigate, onLogout }: EventsPageProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [exhibitions] = useState([
    'Voix Africaines Contemporaines',
    'Royaumes Anciens d\'Afrique de l\'Ouest',
    'Art Sénégalais Moderne',
    'Artéfacts Coloniaux',
    'Aucune Exposition'
  ]);

  const [categories] = useState([
    'Conférence d\'Artiste',
    'Visite Guidée',
    'Atelier',
    'Conférence',
    'Soirée d\'Ouverture',
    'Programme Éducatif',
    'Événement Spécial'
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    description: '',
    location: '',
    bannerImage: '',
    relatedExhibition: 'Aucune Exposition',
    capacity: '',
    price: '',
    category: 'Conférence d\'Artiste'
  });

  // Fonction pour récupérer les événements depuis l'API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events', {
        credentials: 'include',
      });
      const result = await response.json();
      
      if (result.success) {
        setEvents(result.data);
      } else {
        toast.error('Erreur lors du chargement des événements', {
          description: result.message || 'Impossible de charger les événements'
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
      toast.error('Erreur de connexion', {
        description: 'Impossible de se connecter au serveur'
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger les événements au montage du composant
  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0]; // Une seule image pour les événements
    setSelectedFile(file);
    
    // Reset l'input pour permettre la sélection du même fichier
    e.target.value = '';
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
  };

  const handleCreateEvent = () => {
    setFormData({
      name: '',
      date: '',
      time: '',
      description: '',
      location: '',
      bannerImage: '',
      relatedExhibition: 'Aucune Exposition',
      capacity: '',
      price: '',
      category: 'Conférence d\'Artiste'
    });
    setSelectedFile(null);
    setSelectedEvent(null);
    setView('create');
  };

  const handleEditEvent = (event: Event) => {
    setFormData({
      name: event.name,
      date: event.date,
      time: event.time,
      description: event.description,
      location: event.location,
      bannerImage: event.bannerImage,
      relatedExhibition: event.relatedExhibition,
      capacity: event.capacity,
      price: event.price,
      category: event.category
    });
    setSelectedFile(null);
    setSelectedEvent(event);
    setView('edit');
  };

  const handleSaveEvent = async () => {
    try {
      setUploading(true);
      
      // Upload du fichier sélectionné s'il y en a un
      let bannerImageUrl = formData.bannerImage;
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
          bannerImageUrl = data.url;
        } else {
          console.error('Erreur upload:', data.message);
          toast.error('Erreur lors de l\'upload', {
            description: `Impossible d'uploader ${selectedFile.name}`
          });
          return;
        }
      }

      // Préparer les données avec l'image uploadée
      const eventData = {
        ...formData,
        bannerImage: bannerImageUrl
      };

      const url = selectedEvent ? `/api/events/${selectedEvent._id}` : '/api/events';
      const method = selectedEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(eventData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          selectedEvent ? 'Événement modifié avec succès' : 'Événement créé avec succès'
        );
        setView('list');
        setSelectedFile(null); // Reset du fichier sélectionné
        fetchEvents(); // Recharger les événements
      } else {
        toast.error('Erreur lors de la sauvegarde', {
          description: result.message || 'Impossible de sauvegarder l\'événement'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur de connexion', {
        description: 'Impossible de se connecter au serveur'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Événement supprimé avec succès');
        fetchEvents(); // Recharger les événements
      } else {
        toast.error('Erreur lors de la suppression', {
          description: result.message || 'Impossible de supprimer l\'événement'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur de connexion', {
        description: 'Impossible de se connecter au serveur'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'À Venir';
      case 'ongoing': return 'En Cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const renderListView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Événements</h1>
          <p className="text-muted-foreground">Gérer les événements et programmes du musée</p>
        </div>
        <Button onClick={handleCreateEvent} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Créer un Nouvel Événement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">À Venir</p>
                <p className="text-xl font-semibold">{events.filter(e => e.status === 'upcoming').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Cours</p>
                <p className="text-xl font-semibold">{events.filter(e => e.status === 'ongoing').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Terminés</p>
                <p className="text-xl font-semibold">{events.filter(e => e.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-semibold">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher des événements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les Statuts</SelectItem>
                <SelectItem value="upcoming">À Venir</SelectItem>
                <SelectItem value="ongoing">En Cours</SelectItem>
                <SelectItem value="completed">Terminés</SelectItem>
                <SelectItem value="cancelled">Annulés</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les Catégories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des événements...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <Card key={event._id} className="group hover:shadow-lg transition-shadow">
            <div className="aspect-video overflow-hidden rounded-t-lg bg-muted">
              <ImageWithFallback
                src={event.bannerImage}
                alt={event.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-2">{event.category}</Badge>
                  <h3 className="font-semibold text-lg leading-tight">{event.name}</h3>
                </div>
                <Badge className={getStatusColor(event.status)}>
                  {getStatusLabel(event.status)}
                </Badge>
              </div>
              
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {event.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{event.date} at {event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
                {event.relatedExhibition !== 'Aucune Exposition' && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Link className="w-4 h-4" />
                    <span className="truncate">{event.relatedExhibition}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Capacité : {event.capacity}</span>
                  <span className="font-medium">{event.price}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditEvent(event)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteEvent(event._id!)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}
      
      {!loading && filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun événement trouvé</p>
        </div>
      )}
    </div>
  );

  const renderCreateEditView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setView('list')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux Événements
        </Button>
        <h1 className="text-2xl font-semibold">
          {selectedEvent ? 'Modifier l\'Événement' : 'Créer un Nouvel Événement'}
        </h1>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de l'Événement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de l'Événement</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Entrez le nom de l'événement..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Lieu</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="ex: Auditorium du Musée"
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacité</Label>
                  <Input
                    id="capacity"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    placeholder="ex: 150"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value:string) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
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
                <div>
                  <Label htmlFor="price">Prix</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="ex: Gratuit ou 500 CFA"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the event..."
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Banner Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Image de Bannière</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bannerImage">URL de l'Image de Bannière</Label>
                  <Input
                    id="bannerImage"
                    value={formData.bannerImage}
                    onChange={(e) => setFormData({...formData, bannerImage: e.target.value})}
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>
                
                {!selectedFile && (
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/30 hover:bg-muted/50 smooth-transition">
                    <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-3">
                      Ajoutez une image de bannière pour l'événement
                    </p>
                    <input
                      type="file"
                      id="banner-upload"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label htmlFor="banner-upload">
                      <Button 
                        variant="outline" 
                        type="button"
                        onClick={() => document.getElementById('banner-upload')?.click()}
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
                      Nouvelle bannière
                    </div>
                  </div>
                )}

                {formData.bannerImage && (
                  <div className="mt-4">
                    <Label>Preview</Label>
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted mt-2">
                      <ImageWithFallback
                        src={formData.bannerImage}
                        alt="Banner preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Related Exhibition */}
          <Card>
            <CardHeader>
              <CardTitle>Exposition Associée</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="relatedExhibition">Lier à une Exposition</Label>
                <Select 
                  value={formData.relatedExhibition} 
                  onValueChange={(value:string) => setFormData({...formData, relatedExhibition: value})}
                >
                  <SelectTrigger>
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
                  Link this event to a related exhibition
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button 
                  onClick={handleSaveEvent} 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {selectedFile ? 'Upload et sauvegarde...' : 'Sauvegarde...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder l'Événement
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setView('list')} className="w-full">
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {(formData.name || formData.description) && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {formData.category && (
                  <Badge variant="secondary">{formData.category}</Badge>
                )}
                {formData.name && (
                  <h3 className="font-medium">{formData.name}</h3>
                )}
                {formData.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {formData.description}
                  </p>
                )}
                {(formData.date && formData.time) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{formData.date} at {formData.time}</span>
                  </div>
                )}
                {formData.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{formData.location}</span>
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
      {/* Sidebar */}
      <Sidebar currentPage="events" onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-foreground">
              Events Management
            </h2>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {view === 'list' ? renderListView() : renderCreateEditView()}
        </main>
      </div>
    </div>
  );
}