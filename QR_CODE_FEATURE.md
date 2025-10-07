# Fonctionnalité QR Code pour les Artworks

## Description

Chaque card d'artwork dans le backoffice dispose maintenant d'un bouton QR Code qui permet de générer et d'afficher un QR code pointant vers la page de l'œuvre sur le site principal en production.

## Fonctionnalités

### 1. Bouton QR Code sur chaque card
- Un petit bouton avec l'icône QR Code (violet/purple) est disponible dans les actions de chaque artwork
- Situé à gauche des boutons "Modifier" et "Supprimer"

### 2. Modal QR Code
Lorsqu'on clique sur le bouton, un modal s'ouvre avec :
- **Un QR Code** de grande taille (256x256px) avec un niveau de correction d'erreur élevé (H)
- **Le titre de l'œuvre**
- **Le nom de l'exposition** (si l'artwork est associé à une exposition)
- **L'URL complète** vers la page de l'œuvre

### 3. Génération d'URL intelligente
Le système génère automatiquement l'URL correcte selon deux formats :

**Avec exposition :**
```
https://hackathon-musee.vercel.app/exhibition/[slug-exposition]/artwork/[slug-artwork]
```

**Sans exposition :**
```
https://hackathon-musee.vercel.app/artwork/[slug-artwork]
```

Exemple réel :
```
https://hackathon-musee.vercel.app/exhibition/afrique-berceau-de-lhumanite/artwork/lucy
```

### 4. Bouton d'impression
Un bouton "Imprimer" permet d'imprimer le QR Code avec :
- Le titre de l'œuvre en haut
- Le QR Code au centre
- L'URL complète en bas
- Mise en page optimisée pour l'impression

## Technologies utilisées

- **qrcode.react** : Librairie React pour générer des QR codes en SVG
- **Lucide React** : Icônes (QrCode, Printer)
- **Shadcn/ui Dialog** : Modal pour afficher le QR Code
- **Print API** : API native du navigateur pour l'impression

## Utilisation

1. Aller dans la section "Artworks" du backoffice
2. Localiser l'œuvre souhaitée
3. Cliquer sur l'icône QR Code (violet) dans les actions de la card
4. Le modal s'ouvre avec le QR Code
5. Options disponibles :
   - Scanner le QR Code directement
   - Cliquer sur "Imprimer" pour imprimer le QR Code
   - Cliquer sur "Fermer" pour fermer le modal

## Configuration

L'URL de base en production est définie dans le code :
```typescript
const baseUrl = 'https://hackathon-musee.vercel.app';
```

Pour modifier l'URL de production, éditer la fonction `getArtworkUrl()` dans `/src/components/ArtworksPage.tsx`.

## Cas d'usage

- **Panneaux d'exposition** : Imprimer le QR Code et l'afficher à côté de l'œuvre physique
- **Brochures** : Inclure le QR Code dans les supports imprimés
- **Cartes** : Créer des cartes d'identité des œuvres avec QR Code
- **Signalétique** : Ajouter aux panneaux de signalétique du musée
