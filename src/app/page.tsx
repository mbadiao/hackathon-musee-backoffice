'use client'

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { Dashboard } from "@/components/Dashboard";
import { EventsPage } from "@/components/EventsPage";
import { ArtworksPage } from "@/components/ArtworksPage";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import { PageType } from "@/types";

function AppContentInner() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState<PageType>('artworks');

  // Initialiser la page depuis l'URL ou localStorage
  useEffect(() => {
    if (isAuthenticated) {
      const pageFromUrl = searchParams.get('page') as PageType;
      const savedPage = localStorage.getItem('currentPage') as PageType;
      
      if (pageFromUrl && ['dashboard', 'events', 'artworks'].includes(pageFromUrl)) {
        setCurrentPage(pageFromUrl);
      } else if (savedPage && ['dashboard', 'events', 'artworks'].includes(savedPage)) {
        setCurrentPage(savedPage);
      } else {
        // Si aucune page n'est spécifiée, rediriger vers artworks
        setCurrentPage('artworks');
      }
    }
  }, [isAuthenticated, searchParams]);

  const handleLogout = async () => {
    await logout();
    setCurrentPage('artworks');
    localStorage.removeItem('currentPage');
  };

  const handleNavigation = (page: PageType) => {
    setCurrentPage(page);
    localStorage.setItem('currentPage', page);
    // Mettre à jour l'URL sans recharger la page
    const url = new URL(window.location.href);
    url.searchParams.set('page', page);
    window.history.pushState({}, '', url.toString());
  };
  
  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#D2691E]/20 border-t-[#D2691E] rounded-full animate-spin" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'events':
        return <EventsPage onNavigate={handleNavigation} onLogout={handleLogout} />;
      case 'artworks':
        return <ArtworksPage onNavigate={handleNavigation} onLogout={handleLogout} />;
      default:
        return <Dashboard onNavigate={handleNavigation} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden">
      {isAuthenticated ? renderCurrentPage() : <LoginForm />}
    </div>
  );
}

function AppContent() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#D2691E]/20 border-t-[#D2691E] rounded-full animate-spin" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    }>
      <AppContentInner />
    </Suspense>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}