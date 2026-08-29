import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dz.vrconcerne.app',
  appName: 'VRconcerneDZ',
  webDir: 'out',
  server: {
    // Autorise les redirections de paiement Chargily (https://pay.chargily.dz/...)
    // a s'ouvrir dans l'onglet systeme plutot que d'etre bloquees comme
    // navigation externe a la webview.
    androidScheme: 'https',
  },
};

export default config;
