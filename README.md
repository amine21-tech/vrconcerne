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
├── docker-compose.yml   (PostgreSQL + API, pour le déploiement)
└── deploy/              (bloc Nginx pour l'API)
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

`apps/web` est exporté en statique (`output: 'export'`) et empaqueté par
Capacitor dans `apps/web/android/`. L'appli ne contient aucun serveur
Next.js à l'exécution : toutes les données passent par `NEXT_PUBLIC_API_URL`,
qui doit pointer vers l'API de production en HTTPS **avant** de construire
l'APK (l'export est figé au build, pas au runtime).

Prérequis sur la machine de build (pas dans ce dépôt) : JDK 17+ et le SDK
Android (variable `ANDROID_HOME`, ou `android/local.properties`).

```powershell
cd apps\web
cp .env.example .env.local   # puis renseigner NEXT_PUBLIC_API_URL en production
.\build-apk.ps1              # APK de release (non signe sans keystore, voir android/KEYSTORE.md)
.\build-apk.ps1 -Debug       # APK de debug, installable directement pour tester
```

### Compiler sans Android Studio (GitHub Actions)

Si Android Studio/le SDK ne sont pas installés localement, `.github/workflows/android-build.yml`
compile un APK de debug (non signé, installable directement) dans le cloud —
rien à installer sur votre machine, l'équivalent de ce que fait `eas build`
pour `win-native`, mais avec Gradle puisque ce projet est en Capacitor et
non en Expo :

1. Poussez ce dépôt sur GitHub (`git push origin main`) si ce n'est pas
   déjà fait.
2. Onglet **Actions** du dépôt → *Build Android APK* → *Run workflow*
   (ou laissez-le se déclencher tout seul au push).
3. Une fois le run terminé, l'APK est téléchargeable dans la section
   *Artifacts* de ce run (`vrconcerne-debug-apk`).

Pour que ce build de test parle à une vraie API plutôt qu'à `localhost`,
définissez la variable de dépôt `NEXT_PUBLIC_API_URL` (Settings → Secrets and
variables → Actions → Variables) une fois l'API déployée.

À faire avant publication :

- **Signature** : suivre `apps/web/android/KEYSTORE.md` pour générer un
  keystore et le déclarer dans `apps/web/android/keystore.properties`
  (jamais commité).
- **Icône/splash** : l'app utilise encore l'icône générique de Capacitor.
  Remplacer `apps/web/android/app/src/main/res/mipmap-*` (ou utiliser
  `npx @capacitor/assets generate` avec un vrai logo) avant publication.
- **CORS** : en production, `CORS_ORIGINS` côté API doit inclure
  `https://localhost` (l'origine que Capacitor donne à l'app Android avec
  `androidScheme: 'https'`).

---

## Déploiement de l'API

L'API tourne en conteneur, avec PostgreSQL dans un second conteneur :

```bash
cp apps/api/.env.example apps/api/.env   # puis renseigner les secrets
docker compose up -d --build
docker compose exec api node dist/src/db/migrate.js
docker compose exec api node dist/scripts/seed-admin.js -- --email vous@exemple.dz --name "Amiir"
```

Nginx expose ensuite l'API en HTTPS : voir `deploy/nginx-vrconcerne.conf`
(bloc à adapter avec votre domaine, puis `certbot --nginx` pour le certificat).
C'est cette URL HTTPS qui doit être renseignée dans `NEXT_PUBLIC_API_URL`
avant de construire l'APK, et dans `CHARGILY_WEBHOOK_ENDPOINT`/`APP_RETURN_URL`
côté Chargily.
