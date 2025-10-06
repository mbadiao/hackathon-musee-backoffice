'use client'

import { useState } from "react";
import { LoginForm } from "@/components/LoginForm";
import { Dashboard } from "@/components/Dashboard";
import { PostsPage } from "@/components/PostsPage";
import { EventsPage } from "@/components/EventsPage";
import { ArtworksPage } from "@/components/ArtworksPage";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import { PageType } from "@/types";

function AppContent() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  const handleLogout = async () => {
    await logout();
    setCurrentPage('dashboard');
  };

  const handleNavigation = (page: PageType) => {
    setCurrentPage(page);
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
      case 'posts':
        return <PostsPage onNavigate={handleNavigation} onLogout={handleLogout} />;
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

export default function Home() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}