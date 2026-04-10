#/bin/bash

# Script de démarrage du projet SupraBanking Frontend
# S'assure que le backend est accessible et démarre le frontend

echo "🚀 Démarrage de SupraBanking Frontend..."

# Vérifier que les dépendances sont installées
if [ ! -d "node_modules" ]; then
  echo "📦 Installation des dépendances..."
  npm install
fi

# Vérifier que le backend est accessible
echo "🔍 Vérification du backend..."
BACKEND_URL="http://localhost:8080"
if ! curl -s "$BACKEND_URL/api/auth/me" > /dev/null 2>&1; then
  echo "⚠️  ATTENTION: Le backend n'est pas accessible sur $BACKEND_URL"
  echo "    Assurez-vous que le backend Spring Boot est démarré"
  echo "    Démarrez-le avec: mvn spring-boot:run"
else
  echo "✅ Backend accessible"
fi

echo ""
echo "✨ Démarrage du serveur de développement..."
echo "📱 L'application sera disponible sur: http://localhost:4200/"
echo ""

npm start
