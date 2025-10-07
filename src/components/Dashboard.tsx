import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  FileText, 
  Calendar, 
  Eye,
  ArrowUpRight,
  MoreVertical,
  Sparkles,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { PageType } from '@/types';
import { toast } from 'sonner';

interface DashboardProps {
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
}

// Interface pour les données du Dashboard
interface DashboardData {
  stats: {
    visitors: { value: string; change: string; trend: 'up' | 'down' };
    artworks: { value: string; change: string; trend: 'up' | 'down' };
    events: { value: string; change: string; trend: 'up' | 'down' };
    pageViews: { value: string; change: string; trend: 'up' | 'down' };
  };
  charts: {
    monthlyData: Array<{ month: number; year: number; count: number }>;
    categories: Array<{ name: string; count: number; percent: number }>;
  };
  recentActivity: Array<{
    type: 'post' | 'event' | 'artwork' | 'user';
    title: string;
    time: string;
    user: string;
  }>;
  topExhibitions: Array<{ name: string; views: string }>;
  upcomingEvents: Array<{ date: string; name: string }>;
}

// Composant pour les statistiques principales
const StatCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon,
  accentColor = 'primary'
}: {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  accentColor?: 'primary' | 'accent' | 'success' | 'warning';
}) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    accent: 'from-accent/10 to-accent/5 text-accent',
    success: 'from-success/10 to-success/5 text-success',
    warning: 'from-warning/10 to-warning/5 text-warning',
  };

  return (
    <Card className="card-hover animate-slide-in border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-foreground mb-2">{value}</h3>
            <div className="flex items-center gap-1">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                {change}
              </span>
              <span className="text-sm text-muted-foreground">vs mois dernier</span>
            </div>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[accentColor]}`}>
            <Icon className="w-6 h-6" strokeWidth={2} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Composant pour les activités récentes
const ActivityItem = ({ 
  type, 
  title, 
  time, 
  user 
}: {
  type: 'post' | 'event' | 'artwork' | 'user';
  title: string;
  time: string;
  user: string;
}) => {
  const typeConfig = {
    post: { color: 'bg-accent', icon: FileText },
    event: { color: 'bg-warning', icon: Calendar },
    artwork: { color: 'bg-primary', icon: Sparkles },
    user: { color: 'bg-success', icon: Users },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 smooth-transition group">
      <div className={`p-2 rounded-lg ${config.color}/10 group-hover:scale-110 smooth-transition`}>
        <Icon className={`w-4 h-4 ${config.color.replace('bg-', 'text-')}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {user} • {time}
        </p>
      </div>
    </div>
  );
};

export function Dashboard({ onNavigate, onLogout }: DashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les données du Dashboard
  const fetchDashboardData = async () => {
    try {
      console.log('🔄 Chargement des données du Dashboard...');
      const response = await fetch('/api/dashboard/stats', {
        credentials: 'include',
      });
      const result = await response.json();
      
      console.log('📊 Réponse API Dashboard:', result);
      
      if (result.success) {
        setDashboardData(result.data);
        console.log('✅ Données Dashboard chargées avec succès');
        if (refreshing) {
          toast.success('Données actualisées', {
            description: 'Les statistiques ont été mises à jour'
          });
        }
      } else {
        console.error('❌ Erreur lors du chargement des données:', result.message);
        if (refreshing) {
          toast.error('Erreur d\'actualisation', {
            description: result.message || 'Impossible de charger les données'
          });
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
      if (refreshing) {
        toast.error('Erreur de connexion', {
          description: 'Impossible de se connecter au serveur'
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Rafraîchir les données
  const handleRefresh = () => {
    console.log('🔄 Actualisation des données...');
    setRefreshing(true);
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Données de fallback si pas de données réelles
  const fallbackData: DashboardData = {
    stats: {
      visitors: { value: '24,583', change: '+12.5%', trend: 'up' },
      artworks: { value: '1,248', change: '+8.3%', trend: 'up' },
      events: { value: '42', change: '+15.2%', trend: 'up' },
      pageViews: { value: '156K', change: '-3.1%', trend: 'down' }
    },
    charts: {
      monthlyData: [
        { month: 1, year: 2024, count: 40 },
        { month: 2, year: 2024, count: 65 },
        { month: 3, year: 2024, count: 45 },
        { month: 4, year: 2024, count: 80 },
        { month: 5, year: 2024, count: 55 },
        { month: 6, year: 2024, count: 75 },
        { month: 7, year: 2024, count: 60 },
        { month: 8, year: 2024, count: 85 },
        { month: 9, year: 2024, count: 70 },
        { month: 10, year: 2024, count: 90 },
        { month: 11, year: 2024, count: 75 },
        { month: 12, year: 2024, count: 95 }
      ],
      categories: [
        { name: 'Peintures', count: 45, percent: 45 },
        { name: 'Sculptures', count: 30, percent: 30 },
        { name: 'Photographie', count: 25, percent: 25 }
      ]
    },
    recentActivity: [
      { type: 'post', title: 'Nouvel article publié', time: 'il y a 2 min', user: 'Marie Dubois' },
      { type: 'artwork', title: 'Œuvre ajoutée à la collection', time: 'il y a 15 min', user: 'Jean Martin' },
      { type: 'event', title: 'Exposition programmée', time: 'il y a 1h', user: 'Sophie Laurent' },
      { type: 'user', title: 'Nouvel utilisateur inscrit', time: 'il y a 2h', user: 'Système' },
      { type: 'post', title: 'Article mis à jour', time: 'il y a 3h', user: 'Pierre Durand' }
    ],
    topExhibitions: [
      { name: 'Maîtres de la Renaissance', views: '12.5K' },
      { name: 'Collection Art Moderne', views: '9.8K' },
      { name: 'Égypte Antique', views: '8.2K' }
    ],
    upcomingEvents: [
      { date: '15 Oct', name: 'Ouverture Galerie' },
      { date: '22 Oct', name: 'Atelier : Histoire de l\'Art' },
      { date: '30 Oct', name: 'Nuit des Musées' }
    ]
  };

  const data = dashboardData || fallbackData;

  if (loading) {
    return (
      <div className="h-screen bg-background flex overflow-hidden">
        <Sidebar currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Chargement des données...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <Sidebar currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header moderne */}
        <div className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-xl bg-card/80">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">
                  Tableau de Bord
                </h1>
                <p className="text-muted-foreground">
                  Vue d'ensemble de votre musée
                  {dashboardData ? (
                    <span className="ml-2 px-2 py-1 text-xs bg-success/10 text-success rounded-full">
                      Analytics basées sur les œuvres
                    </span>
                  ) : (
                    <span className="ml-2 px-2 py-1 text-xs bg-warning/10 text-warning rounded-full">
                      Mode démonstration
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium smooth-transition flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>
                <button className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-medium shadow-primary smooth-transition flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Exporter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal avec grid moderne */}
        <div className="p-8 space-y-8">
          {/* Statistiques principales - Grid responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Visiteurs"
              value={data.stats.visitors.value}
              change={data.stats.visitors.change}
              trend={data.stats.visitors.trend}
              icon={Users}
              accentColor="primary"
            />
            <StatCard
              title="Œuvres d'Art"
              value={data.stats.artworks.value}
              change={data.stats.artworks.change}
              trend={data.stats.artworks.trend}
              icon={Sparkles}
              accentColor="accent"
            />
            <StatCard
              title="Événements ce Mois"
              value={data.stats.events.value}
              change={data.stats.events.change}
              trend={data.stats.events.trend}
              icon={Calendar}
              accentColor="success"
            />
            <StatCard
              title="Pages Vues"
              value={data.stats.pageViews.value}
              change={data.stats.pageViews.change}
              trend={data.stats.pageViews.trend}
              icon={Eye}
              accentColor="warning"
            />
          </div>

          {/* Grille à 2 colonnes pour les graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Graphique principal - 2/3 de largeur */}
            <Card className="lg:col-span-2 border-0 shadow-lg animate-slide-in">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Analytiques des Visiteurs</CardTitle>
                    <CardDescription className="mt-1">Basé sur l'activité des œuvres ({data.stats.artworks.value} œuvres)</CardDescription>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-muted smooth-transition">
                    <MoreVertical className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Graphique avec des barres basé sur les analytics des œuvres */}
                <div className="h-64 flex items-end justify-between gap-2 px-4">
                  {data.charts.monthlyData.length > 0 ? (
                    data.charts.monthlyData.map((item, i) => {
                      const maxCount = Math.max(...data.charts.monthlyData.map(d => d.count));
                      const height = maxCount > 0 ? (item.count / maxCount) * 100 : 10; // Minimum 10% pour visibilité
                      const monthNames = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
                      
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div 
                            className="w-full bg-primary rounded-t-lg animate-slide-in hover:bg-accent smooth-transition cursor-pointer" 
                            style={{height: `${height}%`}}
                            title={`${item.count} visiteurs estimés en ${monthNames[item.month - 1]} ${item.year} (basé sur l'activité des œuvres)`}
                          ></div>
                          <span className="text-xs text-muted-foreground font-medium">
                            {monthNames[item.month - 1]}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    // Fallback si pas de données
                    [40, 65, 45, 80, 55, 75, 60, 85, 70, 90, 75, 95].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-primary rounded-t-lg animate-slide-in hover:bg-accent smooth-transition cursor-pointer" style={{height: `${height}%`}}></div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Visiteurs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-accent"></div>
                      <span className="text-sm text-muted-foreground">Membres</span>
                    </div>
                  </div>
                  <button className="text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1 smooth-transition">
                    Voir les détails
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Card activité récente - 1/3 de largeur */}
            <Card className="border-0 shadow-lg animate-slide-in">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Activité Récente</CardTitle>
                <CardDescription className="mt-1">Dernières mises à jour</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.recentActivity.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    type={activity.type}
                    title={activity.title}
                    time={activity.time}
                    user={activity.user}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Rangée supplémentaire - 3 cards égales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg card-hover animate-slide-in">
              <CardHeader>
                <CardTitle className="text-lg">Top Expositions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.topExhibitions.map((exhibition, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">{exhibition.name}</span>
                    <span className="text-sm text-muted-foreground">{exhibition.views}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg card-hover animate-slide-in">
              <CardHeader>
                <CardTitle className="text-lg">Catégories Populaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.charts.categories.map((category, i) => {
                    const colors = ['bg-primary', 'bg-accent', 'bg-success', 'bg-warning'];
                    const color = colors[i % colors.length];
                    
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-sm text-muted-foreground">{category.percent}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${color} rounded-full smooth-transition`}
                            style={{ width: `${category.percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg card-hover animate-slide-in">
              <CardHeader>
                <CardTitle className="text-lg">Événements à Venir</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.upcomingEvents.map((event, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="px-3 py-2 rounded-lg bg-accent/10 text-center">
                      <p className="text-xs font-semibold text-accent">{event.date.split(' ')[0]}</p>
                      <p className="text-xs text-muted-foreground">{event.date.split(' ')[1]}</p>
                    </div>
                    <span className="text-sm font-medium">{event.name}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
