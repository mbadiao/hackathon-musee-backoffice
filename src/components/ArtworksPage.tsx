import { useState } from "react";
import { Search, Plus, Edit, Trash2, Save, Upload, Palette, Clock, Eye, LayoutGrid, ArrowLeft } from "lucide-react";
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
  const [artworks, setArtworks] = useState<Artwork[]>([
    {
      id: '1',
      name: 'Sunset Over Dakar',
      artist: 'Issa Samb',
      year: '1985',
      description: 'A vibrant oil painting depicting the golden hour over Dakar\'s coastline, showcasing the artist\'s mastery of light and color.',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
      exhibition: 'Contemporary African Voices',
      medium: 'Oil on canvas',
      dimensions: '120 x 90 cm',
      acquisitionDate: '1987-03-15',
      status: 'on-display'
    },
    {
      id: '2',
      name: 'Traditional Mask Series III',
      artist: 'Ousmane Sow',
      year: '1992',
      description: 'Bronze sculpture inspired by traditional Wolof ceremonial masks, representing the connection between ancestral wisdom and contemporary art.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      exhibition: 'Ancient Kingdoms of West Africa',
      medium: 'Bronze',
      dimensions: '45 x 30 x 25 cm',
      acquisitionDate: '1995-07-22',
      status: 'in-storage'
    }
  ]);

  const [exhibitions] = useState([
    'Contemporary African Voices',
    'Ancient Kingdoms of West Africa',
    'Modern Senegalese Art',
    'Colonial Artifacts',
    'Not Assigned'
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
    exhibition: 'Not Assigned',
    medium: '',
    dimensions: '',
    acquisitionDate: ''
  });

  const filteredArtworks = artworks.filter(artwork => {
    const matchesSearch = artwork.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artwork.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || artwork.status === filterStatus;
    const matchesExhibition = filterExhibition === 'all' || artwork.exhibition === filterExhibition;
    return matchesSearch && matchesStatus && matchesExhibition;
  });

  const handleCreateArtwork = () => {
    setFormData({
      name: '',
      artist: '',
      year: '',
      description: '',
      image: '',
      exhibition: 'Not Assigned',
      medium: '',
      dimensions: '',
      acquisitionDate: ''
    });
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
    setSelectedArtwork(artwork);
    setView('edit');
  };

  const handleSaveArtwork = () => {
    // Determine status based on exhibition assignment
    let status: 'on-display' | 'in-storage' | 'on-loan' | 'conservation' = 'in-storage';
    if (formData.exhibition !== 'Not Assigned') {
      status = 'on-display';
    }

    if (selectedArtwork) {
      // Edit existing artwork
      setArtworks(artworks.map(artwork =>
        artwork.id === selectedArtwork.id
          ? { ...artwork, ...formData, status }
          : artwork
      ));
    } else {
      // Create new artwork
      const newArtwork: Artwork = {
        id: Date.now().toString(),
        ...formData,
        status
      };
      setArtworks([...artworks, newArtwork]);
    }
    setView('list');
  };

  const handleDeleteArtwork = (artworkId: string) => {
    setArtworks(artworks.filter(artwork => artwork.id !== artworkId));
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

  const renderListView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Artworks</h1>
          <p className="text-muted-foreground">Manage museum artwork collection</p>
        </div>
        <Button onClick={handleCreateArtwork} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add New Artwork
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Display</p>
                <p className="text-xl font-semibold">{artworks.filter(a => a.status === 'on-display').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Storage</p>
                <p className="text-xl font-semibold">{artworks.filter(a => a.status === 'in-storage').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ArrowLeft className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Loan</p>
                <p className="text-xl font-semibold">{artworks.filter(a => a.status === 'on-loan').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
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
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search artworks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="on-display">On Display</SelectItem>
                <SelectItem value="in-storage">In Storage</SelectItem>
                <SelectItem value="on-loan">On Loan</SelectItem>
                <SelectItem value="conservation">Conservation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterExhibition} onValueChange={setFilterExhibition}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by exhibition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exhibitions</SelectItem>
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

      {/* Artworks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtworks.map(artwork => (
          <Card key={artwork.id} className="group hover:shadow-lg transition-shadow">
            <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
              <ImageWithFallback
                src={artwork.image}
                alt={artwork.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg leading-tight">{artwork.name}</h3>
                  <p className="text-muted-foreground">{artwork.artist}</p>
                </div>
                <Badge className={getStatusColor(artwork.status)}>
                  {artwork.status.replace('-', ' ')}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{artwork.year}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Palette className="w-4 h-4" />
                  <span>{artwork.medium}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <LayoutGrid className="w-4 h-4" />
                  <span className="truncate">{artwork.exhibition}</span>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm mt-3 line-clamp-2">
                {artwork.description}
              </p>
              
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditArtwork(artwork)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteArtwork(artwork.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCreateEditView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setView('list')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Artworks
        </Button>
        <h1 className="text-2xl font-semibold">
          {selectedArtwork ? 'Edit Artwork' : 'Add New Artwork'}
        </h1>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Artwork Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Artwork Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter artwork name..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="artist">Artist</Label>
                  <Input
                    id="artist"
                    value={formData.artist}
                    onChange={(e) => setFormData({...formData, artist: e.target.value})}
                    placeholder="Artist name..."
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    placeholder="Year created..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="medium">Medium</Label>
                  <Input
                    id="medium"
                    value={formData.medium}
                    onChange={(e) => setFormData({...formData, medium: e.target.value})}
                    placeholder="e.g., Oil on canvas"
                  />
                </div>
                <div>
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
                    placeholder="e.g., 120 x 90 cm"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="acquisitionDate">Acquisition Date</Label>
                <Input
                  id="acquisitionDate"
                  type="date"
                  value={formData.acquisitionDate}
                  onChange={(e) => setFormData({...formData, acquisitionDate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the artwork..."
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Artwork Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://example.com/artwork.jpg"
                  />
                </div>
                
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Drag & drop artwork image here, or click to browse
                  </p>
                  <Button variant="outline" className="mt-2">
                    Choose File
                  </Button>
                </div>

                {formData.image && (
                  <div className="mt-4">
                    <Label>Preview</Label>
                    <div className="w-full h-64 rounded-lg overflow-hidden bg-muted mt-2">
                      <ImageWithFallback
                        src={formData.image}
                        alt="Artwork preview"
                        className="w-full h-full object-contain"
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
          {/* Exhibition Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Exhibition Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="exhibition">Assign to Exhibition</Label>
                <Select 
                  value={formData.exhibition} 
                  onValueChange={(value) => setFormData({...formData, exhibition: value})}
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
                  Artworks assigned to exhibitions will be marked as "On Display"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button 
                  onClick={handleSaveArtwork} 
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Artwork
                </Button>
                <Button variant="outline" onClick={() => setView('list')} className="w-full">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {(formData.name || formData.artist) && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
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
      {/* Sidebar */}
      <Sidebar currentPage="artworks" onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-foreground">
              Artworks Management
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