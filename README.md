# VRconcerneDZ

Découverte, réservation et paiement de concerts, festivals et soirées en
Algérie. Monorepo Node.js : une API Fastify sur PostgreSQL, et une application
Next.js empaquetée en APK Android via Capacitor.

```
vrConcerne/
├── apps/
│   ├── api/   API Fastify + PostgreSQL (authentification, événements, réservations, paiement)
│   └── web/   Application Next.js — la même base sera empaquetée en APK Android (Phase 4)
├── package.json         (workspaces racine)
└── docker-compose.yml    (à ajouter en Phase 5 — déploiement)
```

`packages` n'existe pas ici : c'est un projet à une seule application cliente,
contrairement au monorepo `win-native` voisin qui partage des types entre API
et mobile natif. Les schémas de validation (`apps/api/src/lib/validation.ts`)
sont la seule source de vérité côté serveur.

---

## Démarrage

Prérequis : Node 20 ou plus, PostgreSQL 15+ (localement ou via Docker).

```bash
npm install
cp apps/api/.env.example apps/api/.env
# générer un vrai secret :
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
# ... et le coller dans JWT_SECRET

npm run db:push              # crée les tables dans la base pointée par DATABASE_URL
npm run seed:admin           # crée le premier compte administrateur (mot de passe au clavier)
npm run seed:demo -w @vrc/api  # optionnel : quelques événements de démonstration
npm run api:dev              # API sur http://localhost:3101
```

Dans un autre terminal :

```bash
cp apps/web/.env.example apps/web/.env.local
npm run web:dev              # application sur http://localhost:3000
```

Vérification :

```bash
curl http://localhost:3101/health
curl http://localhost:3101/health/full   # inclut la connexion base de données
```

---

## Ce que corrige cette réécriture

Le prototype initial (voir historique Git) tournait entièrement côté client :

- **Rôle** : un simple bouton dans l'en-tête laissait n'importe qui accéder au
  panneau d'administration. Remplacé par une vraie authentification
  (courriel + mot de passe haché en argon2id, JWT), le rôle étant vérifié côté
  serveur sur chaque route sensible (`requireAuth` / `requireRole` dans
  `apps/api/src/plugins/auth.ts`).
- **Données** : événements et billets vivaient dans le `localStorage` du
  navigateur — deux téléphones ne voyaient jamais les mêmes données. Tout vit
  désormais en PostgreSQL, partagé par tous les utilisateurs.
- **Survente de places** : la réservation décrémente les places disponibles
  dans la même requête SQL que la vérification, à l'intérieur d'une
  transaction (`apps/api/src/routes/bookings.ts`) — deux utilisateurs ne
  peuvent plus réserver simultanément les mêmes dernières places.
- **Paiement** : l'ancien formulaire collectait un numéro de carte et un CVV
  en clair puis simulait la confirmation avec un simple délai. Remplacé par
  Chargily Pay (page de paiement hébergée pour CIB et EDAHABIA) : l'application
  ne voit et ne stocke jamais de numéro de carte, et un billet ne passe
  « payé » que sur confirmation signée reçue par webhook
  (`apps/api/src/routes/webhooks.ts`), jamais sur la seule foi du navigateur.

---

## Routes de l'API

| Méthode | Route | Accès |
|---|---|---|
| `GET` | `/health`, `/health/full` | public |
| `POST` | `/auth/register`, `/auth/login` | public (débit limité) |
| `GET` | `/auth/me` | authentifié |
| `GET` | `/events`, `/events/:id` | public (evenements publiés) |
| `GET` | `/events/mine` | authentifié |
| `POST` | `/events` | authentifié → `pending`, sauf admin |
| `PATCH` | `/events/:id` | propriétaire ou admin |
| `POST` | `/events/:id/like` | authentifié |
| `POST` | `/bookings` | authentifié — crée un checkout Chargily |
| `GET` | `/bookings/mine`, `/bookings/:id` | authentifié |
| `POST` | `/webhooks/chargily` | Chargily (signature vérifiée) |
| `GET` | `/admin/events`, `/admin/stats`, `/admin/moderation-log` | admin |
| `POST` | `/admin/events/:id/approve`, `/reject` | admin |

---

## Application Android (Capacitor)

À venir en Phase 4 : export statique Next.js empaqueté avec Capacitor. Voir
le plan de réécriture pour le détail (icône, signature de release, script de
build).
