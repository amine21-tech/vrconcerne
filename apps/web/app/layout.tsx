import type { Metadata } from 'next';
import './globals.css';
import { THEME_INIT_SCRIPT } from './lib/ThemeContext';

export const metadata: Metadata = {
  title: 'VRconcerneDZ - Concerts & Festivités Estivales en Algérie',
  description: 'Application mobile de découverte et réservation de concerts, festivals et événements culturels en Algérie (Alger, Oran, Constantine, Annaba...).',
  keywords: 'Concert Algérie, Festivités estivales, Rai, Jazz, Chaabi, Rap DZ, Soolking, Cheb Khaled, Djalil Palermo, Billets CIB Edahabia',
};

// Type `Viewport` non exporte par `next` en 13.5 (arrive dans des versions
// plus recentes) : l'objet est lu par convention de nom, l'annotation
// explicite n'est pas necessaire pour que Next.js le prenne en compte.
// `viewportFit: 'cover'` est indispensable pour que `env(safe-area-inset-*)`
// (deja utilise dans globals.css pour la barre de navigation) ait un effet :
// sans lui, ces valeurs restent a 0 meme sur un telephone a encoche.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0A0A0F',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // suppressHydrationWarning : data-theme est pose par un script inline avant
  // l'hydratation React (voir plus bas), qui ne le "voit" jamais cote serveur.
  // Sans ca, React log un avertissement de mismatch a chaque chargement.
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Pose data-theme sur <html> avant le premier rendu pour eviter un
            flash du mauvais theme au chargement (voir ThemeContext.tsx). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
