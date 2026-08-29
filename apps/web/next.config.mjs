/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Export statique : Capacitor embarque ce dossier dans l'APK, il n'y a pas
  // de serveur Next.js a l'execution sur le telephone. Consequence directe :
  // pas de routes API Next.js, pas d'optimiseur d'image serveur (d'ou
  // images.unoptimized) — tout le dynamique passe par l'API @vrc/api via
  // NEXT_PUBLIC_API_URL.
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
