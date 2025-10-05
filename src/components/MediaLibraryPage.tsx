import { useState } from "react";
import { Search, Plus, Edit, Trash2, Upload, Image, Filter, Download, FolderOpen, File, LayoutGrid } from "lucide-react";
import { PageType } from "@/types";
import { Sidebar } from "./Sidebar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface MediaFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  category: string;
  fileType: string;
  fileSize: string;
  uploadDate: string;
  dimensions?: string;
  usedIn: string[];
}

interface MediaLibraryPageProps {
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
}

export function MediaLibraryPage({ onNavigate, onLogout }: MediaLibraryPageProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([
    {
      id: '1',
      name: 'contemporary-art-banner.jpg',
      originalName: 'Contemporary Art Exhibition Banner.jpg',
      url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
      category: 'Exhibition',
      fileType: 'image/jpeg',
      fileSize: '2.4 MB',
      uploadDate: '2024-01-15',
      dimensions: '1920x1080',
      usedIn: ['Contemporary African Voices Exhibition', 'Homepage Banner']
    },
    {
      id: '2',
      name: 'traditional-mask-detail.jpg',
      originalName: 'Traditional Mask Close-up.jpg',
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      category: 'Artwork',
      fileType: 'image/jpeg',
      fileSize: '1.8 MB',
      uploadDate: '2024-01-10',
      dimensions: '1600x1200',
      usedIn: ['Traditional Mask Series III']
    },
    {
      id: '3',
      name: 'artist-talk-event.jpg',
      originalName: 'Artist Talk Event Photo.jpg',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      category: 'Event',
      fileType: 'image/jpeg',
      fileSize: '3.1 MB',
      uploadDate: '2024-01-08',
      dimensions: '2048x1365',
      usedIn: ['Artist Talk: Contemporary African Voices']
    },
    {
      id: '4',
      name: 'museum-exterior.jpg',
      originalName: 'Museum Building Exterior.jpg',
      url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      category: 'General',
      fileType: 'image/jpeg',
      fileSize: '2.9 MB',
      uploadDate: '2024-01-05',
      dimensions: '1920x1280',
      usedIn: []
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterFileType, setFilterFileType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renamingFile, setRenamingFile] = useState<MediaFile | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = ['Exhibition', 'Artwork', 'Event', 'Post', 'General'];
  const fileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    const matchesFileType = filterFileType === 'all' || file.fileType === filterFileType;
    return matchesSearch && matchesCategory && matchesFileType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      case 'oldest':
        return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return parseFloat(b.fileSize) - parseFloat(a.fileSize);
      default:
        return 0;
    }
  });

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(file => file.id));
    }
  };

  const handleDeleteSelected = () => {
    setMediaFiles(mediaFiles.filter(file => !selectedFiles.includes(file.id)));
    setSelectedFiles([]);
  };

  const handleRenameFile = (file: MediaFile) => {
    setRenamingFile(file);
    setNewFileName(file.name);
    setIsRenameDialogOpen(true);
  };

  const handleSaveRename = () => {
    if (renamingFile && newFileName.trim()) {
      setMediaFiles(mediaFiles.map(file =>
        file.id === renamingFile.id
          ? { ...file, name: newFileName.trim() }
          : file
      ));
      setIsRenameDialogOpen(false);
      setRenamingFile(null);
      setNewFileName('');
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setMediaFiles(mediaFiles.filter(file => file.id !== fileId));
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const renderGridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {filteredFiles.map(file => (
        <Card 
          key={file.id} 
          className={`group cursor-pointer transition-all hover:shadow-md ${
            selectedFiles.includes(file.id) ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => handleFileSelect(file.id)}
        >
          <div className="aspect-square overflow-hidden rounded-t-lg bg-muted relative">
            <ImageWithFallback
              src={file.url}
              alt={file.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameFile(file);
                  }}
                  className="w-8 h-8 p-0"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(file.id);
                  }}
                  className="w-8 h-8 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            {selectedFiles.includes(file.id) && (
              <div className="absolute top-2 left-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </div>
          <CardContent className="p-3">
            <div className="space-y-1">
              <p className="text-sm font-medium truncate" title={file.name}>
                {file.name}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {file.category}
                </Badge>
                <span>{file.fileSize}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {file.dimensions}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="text-left p-4">Preview</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Type</th>
                <th className="text-left p-4">Size</th>
                <th className="text-left p-4">Dimensions</th>
                <th className="text-left p-4">Upload Date</th>
                <th className="text-left p-4">Used In</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map(file => (
                <tr key={file.id} className="border-b hover:bg-muted/20">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => handleFileSelect(file.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                      <ImageWithFallback
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{file.originalName}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary">{file.category}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getFileTypeIcon(file.fileType)}
                      <span className="text-sm">{file.fileType.split('/')[1].toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="p-4">{file.fileSize}</td>
                  <td className="p-4">{file.dimensions}</td>
                  <td className="p-4">{file.uploadDate}</td>
                  <td className="p-4">
                    <div className="max-w-32">
                      {file.usedIn.length > 0 ? (
                        <div className="text-sm">
                          <span className="font-medium">{file.usedIn.length}</span> place{file.usedIn.length !== 1 ? 's' : ''}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Unused</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRenameFile(file)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar currentPage="media" onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-foreground">Media Library</h2>
              <p className="text-sm text-muted-foreground">
                {filteredFiles.length} files ({selectedFiles.length} selected)
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedFiles.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteSelected}
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedFiles.length})
                </Button>
              )}
              <Button className="bg-primary hover:bg-primary/90">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="border-b border-border p-6">
          <div className="flex flex-col gap-4">
            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterFileType} onValueChange={setFilterFileType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by file type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All File Types</SelectItem>
                  {fileTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.split('/')[1].toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="size">File Size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  List
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Total size: {mediaFiles.reduce((acc, file) => acc + parseFloat(file.fileSize), 0).toFixed(1)} MB
              </div>
            </div>

            {/* Upload Area */}
            <Card className="border-2 border-dashed border-muted hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">Drop files here to upload</h3>
                  <p className="text-muted-foreground mb-4">
                    Support for JPEG, PNG, GIF, WebP files up to 10MB each
                  </p>
                  <Button variant="outline">
                    Choose Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {viewMode === 'grid' ? renderGridView() : renderListView()}
        </main>
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fileName">File Name</Label>
              <Input
                id="fileName"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter new file name..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsRenameDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveRename}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}