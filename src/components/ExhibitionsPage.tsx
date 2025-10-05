import { useState } from "react";
import { Search, Plus, Edit, Trash2, Save, Upload, MapPin, Calendar, Users, ArrowLeft } from "lucide-react";
import { PageType } from "@/types";
import { Sidebar } from "./Sidebar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Exhibition {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  location: string;
  artists: string[];
  images: string[];
  status: 'upcoming' | 'active' | 'completed';
  curatorNotes: string;
}

interface ExhibitionsPageProps {
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
}

export function ExhibitionsPage({ onNavigate, onLogout }: ExhibitionsPageProps) {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([
    {
      id: '1',
      name: 'Contemporary African Voices',
      startDate: '2024-03-01',
      endDate: '2024-06-30',
      description: 'A comprehensive exhibition showcasing contemporary African artists and their diverse perspectives on modern society, identity, and cultural heritage.',
      location: 'Main Gallery, Level 2',
      artists: ['Kehinde Wiley', 'El Anatsui', 'Wangechi Mutu'],
      images: ['https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400'],
      status: 'active',
      curatorNotes: 'Focus on multimedia installations and interactive elements.'
    },
    {
      id: '2',
      name: 'Ancient Kingdoms of West Africa',
      startDate: '2024-07-15',
      endDate: '2024-12-31',
      description: 'Exploring the rich history and cultural legacy of ancient West African kingdoms through artifacts, sculptures, and historical documents.',
      location: 'Historical Wing, Level 1',
      artists: ['Traditional Craftsmen', 'Unknown Artists'],
      images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'],
      status: 'upcoming',
      curatorNotes: 'Requires special climate control for historical artifacts.'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    location: '',
    artists: '',
    images: '',
    curatorNotes: ''
  });

  const filteredExhibitions = exhibitions.filter(exhibition => {
    const matchesSearch = exhibition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exhibition.artists.some(artist => 
                           artist.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesStatus = filterStatus === 'all' || exhibition.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateExhibition = () => {
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      description: '',
      location: '',
      artists: '',
      images: '',
      curatorNotes: ''
    });
    setSelectedExhibition(null);
    setView('create');
  };

  const handleEditExhibition = (exhibition: Exhibition) => {
    setFormData({
      name: exhibition.name,
      startDate: exhibition.startDate,
      endDate: exhibition.endDate,
      description: exhibition.description,
      location: exhibition.location,
      artists: exhibition.artists.join(', '),
      images: exhibition.images.join(', '),
      curatorNotes: exhibition.curatorNotes
    });
    setSelectedExhibition(exhibition);
    setView('edit');
  };

  const handleSaveExhibition = () => {
    const artistsArray = formData.artists.split(',').map(artist => artist.trim()).filter(Boolean);
    const imagesArray = formData.images.split(',').map(image => image.trim()).filter(Boolean);
    
    // Determine status based on dates
    const now = new Date();
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    let status: 'upcoming' | 'active' | 'completed' = 'upcoming';
    
    if (now >= startDate && now <= endDate) {
      status = 'active';
    } else if (now > endDate) {
      status = 'completed';
    }

    if (selectedExhibition) {
      // Edit existing exhibition
      setExhibitions(exhibitions.map(exhibition =>
        exhibition.id === selectedExhibition.id
          ? { 
              ...exhibition, 
              ...formData,
              artists: artistsArray,
              images: imagesArray,
              status
            }
          : exhibition
      ));
    } else {
      // Create new exhibition
      const newExhibition: Exhibition = {
        id: Date.now().toString(),
        ...formData,
        artists: artistsArray,
        images: imagesArray,
        status
      };
      setExhibitions([...exhibitions, newExhibition]);
    }
    setView('list');
  };

  const handleDeleteExhibition = (exhibitionId: string) => {
    setExhibitions(exhibitions.filter(exhibition => exhibition.id !== exhibitionId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return '';
    }
  };

  const renderListView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Exhibitions</h1>
          <p className="text-muted-foreground">Manage museum exhibitions and displays</p>
        </div>
        <Button onClick={handleCreateExhibition} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Create New Exhibition
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search exhibitions..."
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
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Exhibitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExhibitions.map(exhibition => (
          <Card key={exhibition.id} className="group hover:shadow-lg transition-shadow">
            <div className="aspect-video overflow-hidden rounded-t-lg bg-muted">
              {exhibition.images[0] && (
                <ImageWithFallback
                  src={exhibition.images[0]}
                  alt={exhibition.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
            </div>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg leading-tight">{exhibition.name}</h3>
                <Badge className={getStatusColor(exhibition.status)}>
                  {exhibition.status}
                </Badge>
              </div>
              
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {exhibition.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{exhibition.startDate} - {exhibition.endDate}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{exhibition.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{exhibition.artists.slice(0, 2).join(', ')}{exhibition.artists.length > 2 && ` +${exhibition.artists.length - 2} more`}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditExhibition(exhibition)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteExhibition(exhibition.id)}
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
          Back to Exhibitions
        </Button>
        <h1 className="text-2xl font-semibold">
          {selectedExhibition ? 'Edit Exhibition' : 'Create New Exhibition'}
        </h1>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Exhibition Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Exhibition Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter exhibition name..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., Main Gallery, Level 2"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the exhibition..."
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="artists">Featured Artists</Label>
                <Input
                  id="artists"
                  value={formData.artists}
                  onChange={(e) => setFormData({...formData, artists: e.target.value})}
                  placeholder="Enter artist names separated by commas..."
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Separate multiple artists with commas
                </p>
              </div>

              <div>
                <Label htmlFor="curatorNotes">Curator Notes</Label>
                <Textarea
                  id="curatorNotes"
                  value={formData.curatorNotes}
                  onChange={(e) => setFormData({...formData, curatorNotes: e.target.value})}
                  placeholder="Special notes, requirements, or instructions..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Exhibition Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="images">Image URLs</Label>
                  <Textarea
                    id="images"
                    value={formData.images}
                    onChange={(e) => setFormData({...formData, images: e.target.value})}
                    placeholder="Enter image URLs separated by commas..."
                    className="min-h-[80px]"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Separate multiple image URLs with commas
                  </p>
                </div>
                
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Drag & drop images here, or click to browse
                  </p>
                  <Button variant="outline" className="mt-2">
                    Choose Files
                  </Button>
                </div>

                {formData.images && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {formData.images.split(',').map((url, index) => {
                      const trimmedUrl = url.trim();
                      if (!trimmedUrl) return null;
                      return (
                        <div key={index} className="aspect-video rounded-lg overflow-hidden bg-muted">
                          <ImageWithFallback
                            src={trimmedUrl}
                            alt={`Exhibition image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button 
                  onClick={handleSaveExhibition} 
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Exhibition
                </Button>
                <Button variant="outline" onClick={() => setView('list')} className="w-full">
                  Cancel
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
                {formData.name && (
                  <h3 className="font-medium">{formData.name}</h3>
                )}
                {formData.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {formData.description}
                  </p>
                )}
                {(formData.startDate && formData.endDate) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{formData.startDate} - {formData.endDate}</span>
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
      <Sidebar currentPage="exhibitions" onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-foreground">
              Exhibitions Management
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