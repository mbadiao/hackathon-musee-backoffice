import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  FileText, 
  Calendar, 
  Users, 
  Upload, 
  Trash2, 
  Check
} from 'lucide-react';
import { PageType } from '@/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Sidebar } from './Sidebar';

interface Notification {
  id: string;
  type: 'update' | 'system' | 'success' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'Posts' | 'Events' | 'Artworks' | 'Exhibitions' | 'System' | 'Users';
  actionBy?: string;
  actionType?: string;
}

interface NotificationsPageProps {
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
}

export function NotificationsPage({ onNavigate, onLogout }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'update',
      title: 'New Post Published',
      message: 'Marie Dubois published "New Contemporary Art Exhibition Opens" in the Exhibitions category.',
      timestamp: '2 minutes ago',
      isRead: false,
      priority: 'medium',
      category: 'Posts',
      actionBy: 'Marie Dubois',
      actionType: 'published'
    },
    {
      id: '2',
      type: 'update',
      title: 'Event Updated',
      message: 'Michael Torres edited the "African Heritage Night" event scheduled for March 15th.',
      timestamp: '15 minutes ago',
      isRead: false,
      priority: 'medium',
      category: 'Events',
      actionBy: 'Michael Torres',
      actionType: 'edited'
    },
    {
      id: '3',
      type: 'system',
      title: 'Storage Limit Warning',
      message: 'Your media storage is 85% full. Consider upgrading your plan or removing unused files.',
      timestamp: '1 hour ago',
      isRead: true,
      priority: 'high',
      category: 'System'
    },
    {
      id: '4',
      type: 'error',
      title: 'Upload Failed',
      message: 'Failed to upload artwork image "sculpture_detail.jpg". File size exceeds 10MB limit.',
      timestamp: '2 hours ago',
      isRead: false,
      priority: 'high',
      category: 'Artworks'
    },
    {
      id: '5',
      type: 'success',
      title: 'Backup Completed',
      message: 'Daily backup of museum database completed successfully. 1,247 records backed up.',
      timestamp: '3 hours ago',
      isRead: true,
      priority: 'low',
      category: 'System'
    },
    {
      id: '6',
      type: 'update',
      title: 'New User Added',
      message: 'Elena Rodriguez was added as an Editor by Admin User.',
      timestamp: '4 hours ago',
      isRead: true,
      priority: 'medium',
      category: 'Users',
      actionBy: 'Admin User',
      actionType: 'added'
    },
    {
      id: '7',
      type: 'info',
      title: 'Exhibition Reminder',
      message: '"Modern African Art" exhibition is set to end in 7 days. Consider extending or planning the next exhibition.',
      timestamp: '5 hours ago',
      isRead: false,
      priority: 'medium',
      category: 'Exhibitions'
    },
    {
      id: '8',
      type: 'system',
      title: 'Security Update',
      message: 'System security patches have been applied. All user sessions remain active.',
      timestamp: '1 day ago',
      isRead: true,
      priority: 'low',
      category: 'System'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'system':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'update':
        return <Bell className="w-5 h-5 text-[#D2691E]" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesCategory = filterCategory === 'all' || notification.category === filterCategory;
    const matchesRead = !showUnreadOnly || !notification.isRead;
    
    return matchesSearch && matchesType && matchesCategory && matchesRead;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar currentPage="notifications" onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-card/90 backdrop-blur-xl border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium text-foreground">Notifications</h1>
              <p className="text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications up to date'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Actions */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark All Read
              </Button>
              
              {/* Profile */}
              <Avatar className="w-8 h-8">
                <AvatarImage src="/api/placeholder/32/32" />
                <AvatarFallback className="bg-primary/20 text-primary">AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Filters and Search */}
        <div className="bg-card border-b border-border p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="update">Updates</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Errors</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Posts">Posts</SelectItem>
                  <SelectItem value="Events">Events</SelectItem>
                  <SelectItem value="Artworks">Artworks</SelectItem>
                  <SelectItem value="Exhibitions">Exhibitions</SelectItem>
                  <SelectItem value="System">System</SelectItem>
                  <SelectItem value="Users">Users</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Switch
                  id="unread-only"
                  checked={showUnreadOnly}
                  onCheckedChange={setShowUnreadOnly}
                />
                <Label htmlFor="unread-only" className="text-sm">Unread only</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <main className="flex-1 p-6 space-y-4 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <Card className="border border-border bg-card shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-foreground mb-2">No notifications found</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm || filterType !== 'all' || filterCategory !== 'all' || showUnreadOnly
                    ? 'Try adjusting your filters to see more notifications.'
                    : 'You\'re all caught up! No new notifications at this time.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`border shadow-sm transition-all duration-200 hover:shadow-md ${
                    notification.isRead 
                      ? 'border-border bg-card' 
                      : 'border-primary/20 bg-primary/5 shadow-primary/5'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-4 flex-1">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className={`font-medium ${notification.isRead ? 'text-foreground' : 'text-foreground'}`}>
                              {notification.title}
                            </h3>
                            <div className="flex items-center space-x-2 ml-4">
                              <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {notification.category}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>{notification.timestamp}</span>
                              {notification.actionBy && (
                                <span>by {notification.actionBy}</span>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs"
                                >
                                  Mark as read
                                </Button>
                              )}
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!notification.isRead && (
                                    <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Mark as read
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    onClick={() => deleteNotification(notification.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}