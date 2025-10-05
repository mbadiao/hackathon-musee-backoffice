import React from 'react';
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
  Sparkles
} from 'lucide-react';
import { PageType } from '@/types';

interface DashboardProps {
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
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
    primary: 'from-primary/10 to-primary/5 text-primary',
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
              <span className="text-sm text-muted-foreground">vs last month</span>
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
                  Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Vue d'ensemble de votre musée
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium smooth-transition">
                  Filtrer
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
              title="Total Visitors"
              value="24,583"
              change="+12.5%"
              trend="up"
              icon={Users}
              accentColor="primary"
            />
            <StatCard
              title="Artworks"
              value="1,248"
              change="+8.3%"
              trend="up"
              icon={Sparkles}
              accentColor="accent"
            />
            <StatCard
              title="Events This Month"
              value="42"
              change="+15.2%"
              trend="up"
              icon={Calendar}
              accentColor="success"
            />
            <StatCard
              title="Page Views"
              value="156K"
              change="-3.1%"
              trend="down"
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
                    <CardTitle className="text-xl">Visitor Analytics</CardTitle>
                    <CardDescription className="mt-1">Monthly visitor statistics</CardDescription>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-muted smooth-transition">
                    <MoreVertical className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Simuler un graphique avec des barres */}
                <div className="h-64 flex items-end justify-between gap-2 px-4">
                  {[40, 65, 45, 80, 55, 75, 60, 85, 70, 90, 75, 95].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gradient-to-t from-primary to-accent rounded-t-lg animate-slide-in hover:from-accent hover:to-primary smooth-transition cursor-pointer" style={{height: `${height}%`}}></div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Visitors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-accent"></div>
                      <span className="text-sm text-muted-foreground">Members</span>
                    </div>
                  </div>
                  <button className="text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1 smooth-transition">
                    View details
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Card activité récente - 1/3 de largeur */}
            <Card className="border-0 shadow-lg animate-slide-in">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Recent Activity</CardTitle>
                <CardDescription className="mt-1">Latest updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <ActivityItem
                  type="post"
                  title="New blog post published"
                  time="2 min ago"
                  user="Marie Dubois"
                />
                <ActivityItem
                  type="artwork"
                  title="Artwork added to collection"
                  time="15 min ago"
                  user="Jean Martin"
                />
                <ActivityItem
                  type="event"
                  title="Exhibition scheduled"
                  time="1 hour ago"
                  user="Sophie Laurent"
                />
                <ActivityItem
                  type="user"
                  title="New user registered"
                  time="2 hours ago"
                  user="System"
                />
                <ActivityItem
                  type="post"
                  title="Article updated"
                  time="3 hours ago"
                  user="Pierre Durand"
                />
              </CardContent>
            </Card>
          </div>

          {/* Rangée supplémentaire - 3 cards égales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg card-hover animate-slide-in">
              <CardHeader>
                <CardTitle className="text-lg">Top Exhibitions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Renaissance Masters', views: '12.5K' },
                  { name: 'Modern Art Collection', views: '9.8K' },
                  { name: 'Ancient Egypt', views: '8.2K' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground">{item.views}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg card-hover animate-slide-in">
              <CardHeader>
                <CardTitle className="text-lg">Popular Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Paintings', percent: 45, color: 'bg-primary' },
                    { name: 'Sculptures', percent: 30, color: 'bg-accent' },
                    { name: 'Photography', percent: 25, color: 'bg-success' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm text-muted-foreground">{item.percent}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} rounded-full smooth-transition`}
                          style={{ width: `${item.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg card-hover animate-slide-in">
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { date: '15 Oct', name: 'Gallery Opening' },
                  { date: '22 Oct', name: 'Workshop: Art History' },
                  { date: '30 Oct', name: 'Museum Night' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="px-3 py-2 rounded-lg bg-accent/10 text-center">
                      <p className="text-xs font-semibold text-accent">{item.date.split(' ')[0]}</p>
                      <p className="text-xs text-muted-foreground">{item.date.split(' ')[1]}</p>
                    </div>
                    <span className="text-sm font-medium">{item.name}</span>
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
