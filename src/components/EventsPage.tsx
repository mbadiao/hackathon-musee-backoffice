import { useState } from "react";
import { Search, Plus, Edit, Trash2, Save, Upload, Clock, MapPin, Link, Calendar, Eye, LayoutGrid, ArrowLeft } from "lucide-react";
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

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  description: string;
  location: string;
  bannerImage: string;
  relatedExhibition: string;
  capacity: string;
  price: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  category: string;
}

interface EventsPageProps {
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
}

export function EventsPage({ onNavigate, onLogout }: EventsPageProps) {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      name: 'Artist Talk: Contemporary African Voices',
      date: '2024-03-15',
      time: '18:00',
      description: 'Join us for an intimate conversation with featured artists from our Contemporary African Voices exhibition. Discover the stories behind their groundbreaking works and their vision for the future of African art.',
      location: 'Museum Auditorium',
      bannerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      relatedExhibition: 'Contemporary African Voices',
      capacity: '150',
      price: 'Free',
      status: 'upcoming',
      category: 'Artist Talk'
    },
    {
      id: '2',
      name: 'Guided Tour: Ancient Kingdoms',
      date: '2024-03-20',
      time: '14:00',
      description: 'Embark on a journey through time with our expert curators as they guide you through the Ancient Kingdoms of West Africa exhibition.',
      location: 'Historical Wing',
      bannerImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      relatedExhibition: 'Ancient Kingdoms of West Africa',
      capacity: '25',
      price: '500 CFA',
      status: 'upcoming',
      category: 'Guided Tour'
    }
  ]);

  const [exhibitions] = useState([
    'Contemporary African Voices',
    'Ancient Kingdoms of West Africa',
    'Modern Senegalese Art',
    'Colonial Artifacts',
    'No Exhibition'
  ]);

  const [categories] = useState([
    'Artist Talk',
    'Guided Tour',
    'Workshop',
    'Conference',
    'Opening Night',
    'Educational Program',
    'Special Event'
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
    relatedExhibition: 'No Exhibition',
    capacity: '',
    price: '',
    category: 'Artist Talk'
  });

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateEvent = () => {
    setFormData({
      name: '',
      date: '',
      time: '',
      description: '',
      location: '',
      bannerImage: '',
      relatedExhibition: 'No Exhibition',
      capacity: '',
      price: '',
      category: 'Artist Talk'
    });
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
    setSelectedEvent(event);
    setView('edit');
  };

  const handleSaveEvent = () => {
    // Determine status based on date
    const eventDate = new Date(formData.date);
    const now = new Date();
    let status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' = 'upcoming';
    
    if (eventDate.toDateString() === now.toDateString()) {
      status = 'ongoing';
    } else if (eventDate < now) {
      status = 'completed';
    }

    if (selectedEvent) {
      // Edit existing event
      setEvents(events.map(event =>
        event.id === selectedEvent.id
          ? { ...event, ...formData, status }
          : event
      ));
    } else {
      // Create new event
      const newEvent: Event = {
        id: Date.now().toString(),
        ...formData,
        status
      };
      setEvents([...events, newEvent]);
    }
    setView('list');
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
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

  const renderListView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Events</h1>
          <p className="text-muted-foreground">Manage museum events and programs</p>
        </div>
        <Button onClick={handleCreateEvent} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Create New Event
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
                <p className="text-sm text-muted-foreground">Upcoming</p>
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
                <p className="text-sm text-muted-foreground">Ongoing</p>
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
                <p className="text-sm text-muted-foreground">Completed</p>
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
                  placeholder="Search events..."
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
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => (
          <Card key={event.id} className="group hover:shadow-lg transition-shadow">
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
                  {event.status}
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
                {event.relatedExhibition !== 'No Exhibition' && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Link className="w-4 h-4" />
                    <span className="truncate">{event.relatedExhibition}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Capacity: {event.capacity}</span>
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
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteEvent(event.id)}
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
          Back to Events
        </Button>
        <h1 className="text-2xl font-semibold">
          {selectedEvent ? 'Edit Event' : 'Create New Event'}
        </h1>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Event Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter event name..."
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
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., Museum Auditorium"
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    placeholder="e.g., 150"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({...formData, category: value})}
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
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="e.g., Free or 500 CFA"
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
              <CardTitle>Banner Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bannerImage">Banner Image URL</Label>
                  <Input
                    id="bannerImage"
                    value={formData.bannerImage}
                    onChange={(e) => setFormData({...formData, bannerImage: e.target.value})}
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>
                
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Drag & drop banner image here, or click to browse
                  </p>
                  <Button variant="outline" className="mt-2">
                    Choose File
                  </Button>
                </div>

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
              <CardTitle>Related Exhibition</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="relatedExhibition">Link to Exhibition</Label>
                <Select 
                  value={formData.relatedExhibition} 
                  onValueChange={(value) => setFormData({...formData, relatedExhibition: value})}
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
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Event
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