import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { 
  Home,
  FileText,
  Calendar,
  Camera,
  BookOpen,
  Image,
  Users,
  Bell,
  LogOut,
  Sparkles
} from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';
import { PageType } from '@/types';

interface SidebarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
}

const sidebarNavItems = [
  { name: 'Dashboard', page: 'dashboard' as PageType, icon: Home },
  { name: 'Posts', page: 'posts' as PageType, icon: FileText },
  { name: 'Events', page: 'events' as PageType, icon: Calendar },
  { name: 'Artworks', page: 'artworks' as PageType, icon: Camera },
  { name: 'Exhibitions', page: 'exhibitions' as PageType, icon: BookOpen },
  { name: 'Media', page: 'media' as PageType, icon: Image },
  { name: 'Users', page: 'users' as PageType, icon: Users },
  { name: 'Notifications', page: 'notifications' as PageType, icon: Bell },
];

export function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col animate-slide-in-left">
      {/* Logo et titre - design épuré */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-primary group-hover:scale-105 smooth-transition">
            <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">
              Museum
            </h1>
            <p className="text-xs text-muted-foreground">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation - design moderne avec espacement */}
      <nav className="flex-1 px-3 space-y-1">
        {sidebarNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          
          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                smooth-transition group relative
                ${isActive 
                  ? 'bg-sidebar-active text-primary shadow-sm' 
                  : 'text-sidebar-foreground hover:bg-sidebar-hover hover:text-primary'
                }
              `}
            >
              {/* Indicateur actif */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full animate-scale-in" />
              )}
              
              <Icon 
                className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'} smooth-transition`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={isActive ? 'font-semibold' : ''}>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Section utilisateur - design moderne */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-3">
        {/* Dark mode toggle */}
        <div className="px-3">
          <DarkModeToggle />
        </div>
        
        {/* User profile */}
        <div className="px-3 py-3 rounded-lg bg-sidebar-accent group hover:bg-sidebar-hover smooth-transition">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10 border-2 border-primary/20">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Admin" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-hover text-white font-semibold">
                AD
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                Administrateur
              </p>
              <p className="text-xs text-muted-foreground truncate">
                admin@musee.com
              </p>
            </div>
          </div>
          
          <Button
            onClick={onLogout}
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 smooth-transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Déconnexion</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
