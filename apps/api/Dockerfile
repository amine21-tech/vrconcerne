# Image de l'API VRconcerneDZ.
#
# Contexte de build : la RACINE du depot, pas ce dossier.
#   docker compose build api

# ---------------------------------------------------------------- build ----
FROM node:22-bookworm-slim AS builder

# argon2 installe un binaire precompile quand il en trouve un pour la
# plateforme ; ce filet de secours ne sert qu'au cas ou il faudrait compiler,
# et reste dans l'etage de build.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Les manifestes d'abord : tant qu'ils ne changent pas, Docker reutilise la
# couche d'installation et le build reste rapide.
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
RUN npm ci --include-workspace-root --workspace @vrc/api

COPY apps/api apps/api
RUN npm run build --workspace @vrc/api

# On retire les dependances de developpement APRES la compilation : les
# modules natifs sont deja construits, l'image finale garde le reste tel quel.
RUN npm prune --omit=dev

# ----------------------------------------------------------- production ----
FROM node:22-bookworm-slim AS runner

ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder --chown=node:node /app /app

USER node
WORKDIR /app/apps/api
EXPOSE 3101

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3101)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/src/server.js"]
