import { useState } from "react";
import { Search, Plus, Edit, Trash2, Eye, Save, Upload, ArrowLeft } from "lucide-react";
import { PageType } from "@/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Sidebar } from "./Sidebar";

interface Post {
  id: string;
  title: string;
  author: string;
  content: string;
  thumbnail: string;
  category: string;
  status: 'draft' | 'published';
  createdAt: string;
}

interface PostsPageProps {
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
}

export function PostsPage({ onNavigate, onLogout }: PostsPageProps) {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      title: 'New Contemporary Art Exhibition Opens',
      author: 'Marie Dubois',
      content: 'We are excited to announce the opening of our new contemporary art exhibition featuring works from emerging African artists...',
      thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
      category: 'Exhibition',
      status: 'published',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Behind the Scenes: Conservation Process',
      author: 'Dr. Amadou Fall',
      content: 'Discover the meticulous process behind conserving historical artifacts in our latest blog post...',
      thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      category: 'Artwork',
      status: 'draft',
      createdAt: '2024-01-10'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Exhibition',
    status: 'draft' as 'draft' | 'published',
    thumbnail: ''
  });

  const categories = ['Exhibition', 'Artwork', 'Event', 'News', 'Education'];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreatePost = () => {
    setFormData({
      title: '',
      content: '',
      category: 'Exhibition',
      status: 'draft',
      thumbnail: ''
    });
    setSelectedPost(null);
    setView('create');
  };

  const handleEditPost = (post: Post) => {
    setFormData({
      title: post.title,
      content: post.content,
      category: post.category,
      status: post.status,
      thumbnail: post.thumbnail
    });
    setSelectedPost(post);
    setView('edit');
  };

  const handleSavePost = () => {
    if (selectedPost) {
      // Edit existing post
      setPosts(posts.map(post =>
        post.id === selectedPost.id
          ? { ...post, ...formData }
          : post
      ));
    } else {
      // Create new post
      const newPost: Post = {
        id: Date.now().toString(),
        ...formData,
        author: 'Current User',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setPosts([...posts, newPost]);
    }
    setView('list');
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  const renderListView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Museum Posts</h1>
          <p className="text-muted-foreground">Manage your museum's blog posts and announcements</p>
        </div>
        <Button onClick={handleCreatePost} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Create New Post
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
                  placeholder="Search posts..."
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
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map(post => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        <ImageWithFallback
                          src={post.thumbnail}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{post.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {post.content}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{post.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={post.status === 'published' ? 'default' : 'outline'}
                      className={post.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPost(post)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderCreateEditView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setView('list')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Posts
        </Button>
        <h1 className="text-2xl font-semibold">
          {selectedPost ? 'Edit Post' : 'Create New Post'}
        </h1>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Post Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter post title..."
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Write your post content here..."
                  className="min-h-[300px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="thumbnail">Thumbnail Image URL</Label>
                  <Input
                    id="thumbnail"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
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

                {formData.thumbnail && (
                  <div className="mt-4">
                    <Label>Preview</Label>
                    <div className="w-full h-48 rounded-lg overflow-hidden bg-muted mt-2">
                      <ImageWithFallback
                        src={formData.thumbnail}
                        alt="Thumbnail preview"
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
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="flex items-center justify-between">
                <Label htmlFor="status">Published</Label>
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
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button 
                  onClick={handleSavePost} 
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {formData.status === 'published' ? 'Publish' : 'Save Draft'}
                </Button>
                <Button variant="outline" onClick={() => setView('list')} className="w-full">
                  Cancel
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
      {/* Sidebar */}
      <Sidebar currentPage="posts" onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-foreground">
              Museum Posts Management
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