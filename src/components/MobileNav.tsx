import React from 'react';
import { Menu, X, Home, Calendar, Camera, LogOut } from 'lucide-react';
import { PageType } from '@/types';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DarkModeToggle } from './DarkModeToggle';
import Image from 'next/image';

interface MobileNavProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
}

const sidebarNavItems = [
  { name: 'Tableau de Bord', page: 'dashboard' as PageType, icon: Home },
  { name: 'Événements', page: 'events' as PageType, icon: Calendar },
  { name: 'Œuvres d\'Art', page: 'artworks' as PageType, icon: Camera },
];

export function MobileNav({ currentPage, onNavigate, onLogout }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);

  const handleNavigate = (page: PageType) => {
    onNavigate(page);
    setOpen(false);
  };

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-r border-sidebar-border">
          <div className="flex flex-col h-full">
            {/* Logo et titre */}
            <div className="px-6 py-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-border overflow-hidden">
                  <Image 
                    src="/Gemini_Generated_Image_yn0cb2yn0cb2yn0c-removebg.png" 
                    alt="Musée Logo" 
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-sidebar-foreground">
                    Musée
                  </h1>
                  <p className="text-xs text-muted-foreground">Portail Admin</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1">
              {sidebarNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.page;
                
                return (
                  <button
                    key={item.page}
                    onClick={() => handleNavigate(item.page)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      smooth-transition group relative
                      ${isActive 
                        ? 'bg-sidebar-active text-primary shadow-sm' 
                        : 'text-sidebar-foreground hover:bg-sidebar-hover hover:text-primary'
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
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

            {/* Section utilisateur */}
            <div className="px-3 py-4 border-t border-sidebar-border space-y-3">
              <div className="px-3">
                <DarkModeToggle />
              </div>
              
              <div className="px-3 py-3 rounded-lg bg-sidebar-accent">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-10 h-10 border-2 border-primary/20">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="Admin" />
                    <AvatarFallback className="bg-primary text-white font-semibold">
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
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Déconnexion</span>
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
