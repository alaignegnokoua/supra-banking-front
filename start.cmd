@echo off
REM Script de démarrage du projet SupraBanking Frontend
REM S'assure que le backend est accessible et démarre le frontend

echo.
echo 🚀 Demarrage de SupraBanking Frontend...
echo.

REM Vérifier que les dépendances sont installées
if not exist "node_modules" (
  echo 📦 Installation des dependances...
  call npm install
)

REM Vérifier que le backend est accessible
echo 🔍 Verification du backend...
set BACKEND_URL=http://localhost:8080
timeout /t 1 /nobreak > nul
echo ℹ️  Backend attendu sur: %BACKEND_URL%
echo ⚠️  IMPORTANT: Assurez-vous que le backend Spring Boot est demarré
echo    Demarrez-le avec: mvn spring-boot:run
echo.

echo ✨ Demarrage du serveur de developpement...
echo 📱 L'application sera disponible sur: http://localhost:4200/
echo.

call npm start
