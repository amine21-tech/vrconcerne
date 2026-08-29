#Requires -Version 5.1
<#
  Construit l'APK Android de VRconcerneDZ à partir du code Next.js/Capacitor.

  Prérequis : Node 20+, un JDK (17+) et le SDK Android (variable ANDROID_HOME
  ou local.properties dans android/) installés sur cette machine — contrairement
  au projet win-native voisin, ce build est local (Gradle), pas dans le cloud.

  Usage :
    .\build-apk.ps1            # build de release (signé si keystore.properties existe)
    .\build-apk.ps1 -Debug     # build de debug, installable sans signature
#>
param(
  [switch]$Debug
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

function Assert-Command($name, $hint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Error "$name est introuvable dans le PATH. $hint"
    exit 1
  }
}

Write-Host "== Verification des outils ==" -ForegroundColor Cyan
Assert-Command node "Installez Node.js 20+."
Assert-Command java "Installez un JDK 17+ (nécessaire pour Gradle)."

if (-not (Test-Path "$PSScriptRoot\android")) {
  Write-Error "Le dossier android/ n'existe pas. Lancez d'abord : npx cap add android"
  exit 1
}

$keystoreProps = Join-Path $PSScriptRoot 'android\keystore.properties'
if (-not $Debug -and -not (Test-Path $keystoreProps)) {
  Write-Warning "Aucun android/keystore.properties trouve — l'APK de release ne sera pas signe. Voir android/KEYSTORE.md."
}

Write-Host "== Installation des dependances ==" -ForegroundColor Cyan
npm install --prefix "$PSScriptRoot\.."
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "== Build Next.js (export statique) ==" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "== Synchronisation Capacitor -> Android ==" -ForegroundColor Cyan
npx cap sync android
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Push-Location "$PSScriptRoot\android"
try {
  $task = if ($Debug) { 'assembleDebug' } else { 'assembleRelease' }
  Write-Host "== Gradle $task ==" -ForegroundColor Cyan
  & .\gradlew.bat $task
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Pop-Location
}

$variant = if ($Debug) { 'debug' } else { 'release' }
$apkPath = Join-Path $PSScriptRoot "android\app\build\outputs\apk\$variant\app-$variant.apk"

if (Test-Path $apkPath) {
  Write-Host "`nAPK genere : $apkPath" -ForegroundColor Green
} else {
  Write-Warning "Build termine mais l'APK attendu est introuvable a $apkPath — verifiez la sortie Gradle ci-dessus."
}
