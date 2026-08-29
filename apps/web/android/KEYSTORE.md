# Signature de l'APK de release

Un APK Android doit être signé pour être installable (et obligatoirement pour
le Play Store). La clé de signature ne doit **jamais** être committée : c'est
vous, et personne d'autre, qui devez la générer et en garder une copie de
sauvegarde en lieu sûr — la perdre revient à ne plus jamais pouvoir publier de
mise à jour de l'application sous le même `applicationId`.

## 1. Générer le keystore (une seule fois)

Depuis `apps/web/android`, avec un JDK installé :

```bash
keytool -genkeypair -v -keystore vrconcerne-release.jks -alias vrconcerne \
  -keyalg RSA -keysize 2048 -validity 10000
```

Choisissez un mot de passe de magasin et un mot de passe de clé robustes
(ils peuvent être identiques). Gardez le fichier `.jks` **et** ces mots de
passe en lieu sûr (gestionnaire de mots de passe, coffre-fort de l'équipe).

## 2. Déclarer le keystore au build

Créez `apps/web/android/keystore.properties` (jamais commité, voir
`.gitignore`) :

```properties
storeFile=vrconcerne-release.jks
storePassword=VOTRE_MOT_DE_PASSE_MAGASIN
keyAlias=vrconcerne
keyPassword=VOTRE_MOT_DE_PASSE_CLE
```

`build.gradle` lit ce fichier automatiquement s'il existe et signe les builds
`release` avec. En son absence, les builds `release` restent non signés
(utilisable pour un `assembleDebug` de test, pas pour distribuer l'APK).

## 3. Construire l'APK signé

```powershell
cd apps\web
.\build-apk.ps1
```

L'APK signé se trouve ensuite dans
`android/app/build/outputs/apk/release/app-release.apk`.
