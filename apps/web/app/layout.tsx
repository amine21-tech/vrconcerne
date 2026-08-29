import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VRconcerneDZ - Concerts & Festivités Estivales en Algérie',
  description: 'Application mobile de découverte et réservation de concerts, festivals et événements culturels en Algérie (Alger, Oran, Constantine, Annaba...).',
  keywords: 'Concert Algérie, Festivités estivales, Rai, Jazz, Chaabi, Rap DZ, Soolking, Cheb Khaled, Djalil Palermo, Billets CIB Edahabia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
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
