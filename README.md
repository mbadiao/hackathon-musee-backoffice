# Backoffice Museum Dashboard

Une application web complète de gestion de contenu pour musées, développée avec Next.js et TypeScript. Ce backoffice permet de gérer efficacement les expositions, œuvres d'art, événements et publications d'un musée.

## 📋 Vue d'ensemble du projet

Ce projet est un système de gestion de contenu (CMS) dédié aux musées qui offre une interface moderne et intuitive pour administrer tous les aspects du contenu numérique d'un musée. L'application est conçue pour être déployée avec Docker et utilise MongoDB pour le stockage des données et Supabase pour la gestion des fichiers multimédias.

**Design original** : https://www.figma.com/design/Lq4XyW2iz0laL8UEpxiALz/Backoffice-Museum-Dashboard

## ✨ Fonctionnalités principales

### 🎨 Gestion des Œuvres d'Art (Artworks)
- Création et édition d'œuvres d'art avec support multilingue (Anglais, Français, Wolof)
- Upload d'images principales et galeries d'images
- Upload de guides audio dans plusieurs langues
- Descriptions structurées avec titres et paragraphes
- Association automatique aux expositions
- Génération automatique de slugs pour les URLs

### 🏛️ Gestion des Expositions (Exhibitions)
- Création et gestion des expositions
- Upload d'images de bannière
- Organisation des œuvres d'art par exposition
- Génération automatique de slugs
- Suivi du nombre d'œuvres par exposition
- Interface de gestion intuitive avec aperçus visuels

### 📝 Gestion des Publications (Posts)
- Création d'articles et publications
- Support de jusqu'à 3 images par post
- Catégorisation flexible (Exhibition, Artwork, Event, News, Education)
- Statuts brouillon/publié
- Gestion des auteurs
- Recherche et filtrage par catégorie

### 📅 Gestion des Événements (Events)
- Création et planification d'événements
- Upload d'images de bannière
- Gestion des capacités et tarifs
- Association aux expositions
- Statuts multiples (upcoming, ongoing, completed, cancelled)
- Informations de localisation et horaires

### 📊 Tableau de Bord (Dashboard)
- Statistiques en temps réel (visiteurs, œuvres, événements, vues)
- Graphiques de tendances mensuelles
- Activité récente du système
- Top des expositions
- Événements à venir
- Indicateurs de performance avec comparaisons mensuelles

### 🔐 Système d'Authentification
- Connexion sécurisée avec JWT
- Gestion des rôles (admin, editor, viewer)
- Système de permissions granulaires
- Protection des routes API
- Gestion des sessions

## 🛠️ Stack technologique

### Frontend
- **Next.js 15** - Framework React avec rendu côté serveur
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Radix UI** - Composants UI accessibles
- **Lucide React** - Icônes modernes
- **Recharts** - Graphiques et visualisations
- **Sonner** - Notifications toast
- **React Hook Form** - Gestion des formulaires

### Backend
- **Next.js API Routes** - Endpoints REST API
- **MongoDB** - Base de données NoSQL
- **JWT** - Authentification par tokens
- **bcryptjs** - Hachage des mots de passe
- **Multer** - Upload de fichiers

### Stockage & Médias
- **Supabase Storage** - Stockage de fichiers (images, audio)
- **MongoDB** - Stockage des données structurées

### DevOps & Déploiement
- **Docker** - Conteneurisation
- **Docker Compose** - Orchestration multi-conteneurs
- **Node.js 20** - Runtime

## 📁 Structure du projet

```
hackathon-musee-backoffice/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # Routes API REST
│   │   │   ├── artworks/     # CRUD artworks
│   │   │   ├── exhibitions/  # CRUD exhibitions
│   │   │   ├── events/       # CRUD events
│   │   │   ├── posts/        # CRUD posts
│   │   │   ├── auth/         # Authentification
│   │   │   ├── dashboard/    # Statistiques
│   │   │   └── upload/       # Upload fichiers
│   │   ├── globals.css       # Styles globaux
│   │   ├── layout.tsx        # Layout racine
│   │   └── page.tsx          # Page d'accueil
│   ├── components/            # Composants React
│   │   ├── ui/               # Composants UI réutilisables
│   │   ├── Dashboard.tsx     # Tableau de bord
│   │   ├── ArtworksPage.tsx  # Gestion artworks
│   │   ├── ExhibitionsPage.tsx # Gestion exhibitions
│   │   ├── EventsPage.tsx    # Gestion events
│   │   ├── PostsPage.tsx     # Gestion posts
│   │   ├── Sidebar.tsx       # Navigation latérale
│   │   └── LoginForm.tsx     # Formulaire connexion
│   ├── contexts/              # Contextes React
│   │   └── AuthContext.tsx   # Contexte authentification
│   ├── lib/                   # Bibliothèques utilitaires
│   │   ├── mongodb.ts        # Client MongoDB
│   │   ├── supabase.ts       # Client Supabase
│   │   └── auth.ts           # Utilitaires auth
│   ├── config/                # Configuration
│   │   └── env.ts            # Variables d'environnement
│   └── types/                 # Types TypeScript
│       └── index.ts          # Types globaux
├── public/                    # Fichiers statiques
├── docker-compose.yml         # Configuration Docker
├── Dockerfile                 # Image Docker
├── env.example               # Template variables env
├── package.json              # Dépendances npm
├── tailwind.config.ts        # Config Tailwind
├── tsconfig.json             # Config TypeScript
└── next.config.js            # Config Next.js
```

## 🚀 Installation et démarrage

### Prérequis
- Node.js 20 ou supérieur
- npm ou yarn
- MongoDB Atlas ou instance MongoDB locale
- Compte Supabase (pour le stockage de fichiers)

### Installation locale

1. **Cloner le repository**
```bash
git clone https://github.com/mbadiao/hackathon-musee-backoffice.git
cd hackathon-musee-backoffice
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration des variables d'environnement**
```bash
cp env.example .env.local
```

Éditer `.env.local` avec vos propres valeurs :
```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/musee

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=musee

# Authentication
JWT_SECRET=your-secret-key
```

4. **Démarrer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

### Déploiement avec Docker

1. **Build et démarrage avec Docker Compose**
```bash
docker-compose up -d
```

L'application sera accessible sur `http://localhost:3005`

2. **Arrêter les conteneurs**
```bash
docker-compose down
```

## 🔌 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Informations utilisateur courant

### Artworks
- `GET /api/artworks` - Liste des artworks
- `POST /api/artworks` - Créer un artwork
- `GET /api/artworks/[id]` - Détails d'un artwork
- `PUT /api/artworks/[id]` - Modifier un artwork
- `DELETE /api/artworks/[id]` - Supprimer un artwork

### Exhibitions
- `GET /api/exhibitions` - Liste des exhibitions
- `POST /api/exhibitions` - Créer une exhibition
- `GET /api/exhibitions/[id]` - Détails d'une exhibition
- `PUT /api/exhibitions/[id]` - Modifier une exhibition
- `DELETE /api/exhibitions/[id]` - Supprimer une exhibition

### Events
- `GET /api/events` - Liste des événements
- `POST /api/events` - Créer un événement
- `GET /api/events/[id]` - Détails d'un événement
- `PUT /api/events/[id]` - Modifier un événement
- `DELETE /api/events/[id]` - Supprimer un événement

### Posts
- `GET /api/posts` - Liste des posts
- `POST /api/posts` - Créer un post
- `GET /api/posts/[id]` - Détails d'un post
- `PUT /api/posts/[id]` - Modifier un post
- `DELETE /api/posts/[id]` - Supprimer un post

### Dashboard & Médias
- `GET /api/dashboard/stats` - Statistiques du dashboard
- `POST /api/upload` - Upload de fichiers vers Supabase

## 📊 Modèles de données

### Artwork
```typescript
{
  slug: string;           // URL-friendly identifier
  title: string;          // Titre de l'œuvre
  description: Array<{    // Description structurée
    type: "heading" | "paragraph";
    content: string;
  }>;
  image: string;          // URL image principale
  audioUrls: {            // Guides audio multilingues
    en?: string;
    fr?: string;
    wo?: string;
  };
  gallery: Array<{        // Galerie d'images
    url: string;
    alt: string;
  }>;
  exhibition?: string;    // ID de l'exposition
  createdAt: Date;
  updatedAt?: Date;
}
```

### Exhibition
```typescript
{
  slug: string;           // URL-friendly identifier
  title: string;          // Titre de l'exposition
  subtitle: string;       // Sous-titre
  image: string;          // Image de bannière
  artworks: string[];     // IDs des artworks
  createdAt: Date;
  updatedAt?: Date;
}
```

### Event
```typescript
{
  name: string;           // Nom de l'événement
  date: string;           // Date
  time: string;           // Heure
  description: string;    // Description
  location: string;       // Lieu
  bannerImage: string;    // Image de bannière
  relatedExhibition: string; // ID de l'exposition liée
  capacity: string;       // Capacité
  price: string;          // Prix
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  category: string;       // Catégorie
  createdAt: Date;
  updatedAt: Date;
}
```

### Post
```typescript
{
  title: string;          // Titre
  author: string;         // Auteur
  content: string;        // Contenu
  images: string[];       // URLs des images (max 3)
  category: string;       // Catégorie
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}
```

## 🎨 Design et UX

- Interface moderne avec design system cohérent
- Thème clair/sombre supporté
- Animations et transitions fluides
- Composants UI accessibles (Radix UI)
- Responsive design pour tous les écrans
- Feedback utilisateur avec toasts
- Chargement optimisé avec skeleton screens

## 🔒 Sécurité

- Authentification JWT sécurisée
- Hachage des mots de passe avec bcryptjs
- Protection CSRF
- Variables d'environnement pour les secrets
- Validation des données côté serveur
- Gestion des permissions par rôle

## 🌍 Internationalisation

Le projet supporte actuellement trois langues pour les guides audio des artworks :
- **Anglais** (en)
- **Français** (fr)
- **Wolof** (wo)

## 📦 Scripts disponibles

```bash
npm run dev      # Démarrer le serveur de développement
npm run build    # Build de production
npm run start    # Démarrer le serveur de production
npm run lint     # Linter le code
```

## 🤝 Contribution

Ce projet a été développé dans le cadre d'un hackathon pour la digitalisation des musées.

## 📄 Licence

Ce projet est privé et destiné à un usage interne.

## 👥 Équipe

Développé par l'équipe du hackathon Musée pour moderniser la gestion du contenu muséal.