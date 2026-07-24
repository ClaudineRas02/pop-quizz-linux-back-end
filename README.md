# 🎮 Pop Quizz Linux — API Backend

❤️ **raison**

En tant que mentor du Club C3LF (Club Linux et Logiciels libres de Fianarantsoa) et pour l' occasion du Méga Event ENI (hackathon interne de notre école), nous avons concocté ce plateforme pour le concours organisé par notre club pour les premières années.

💡 **Description**

Ce backend fournit l'API REST et les fonctionnalités temps réel nécessaires pour le jeu "Pop Quizz" : création de parties, gestion des joueurs, scoring en direct et diffusion d'événements aux clients via Socket.IO. Le projet est conçu pour séparer la logique métier (domain) des interfaces (HTTP / sockets) afin de faciliter les tests et la maintenance.

🛠️ **Stack**

- Node.js
- Express
- Socket.IO (realtime)
- PostgreSQL
- OpenAPI (docs)

✨ **Fonctionnalités principales**

- 🔐 Authentification admin
- 🕹️ Création et gestion de parties
- 👥 Rejoindre une room / suivre l'état du jeu en temps réel
- 📡 Émissions socket côté serveur via `express-route-adapter`
- 🧾 Endpoints REST pour les actions synchrones
- 📚 Documentation OpenAPI disponible dans `docs/openapi.json`

🔗 **Sockets / Temps réel**

Le backend utilise Socket.IO – l'instance est attachée à l'app Express (`app.locals.io`). Les contrôleurs peuvent déclencher des broadcasts en renvoyant un objet `{ body: { data: { event } } }` ; l'adaptateur de route émettra alors `io.to(event.room).emit(event.name, event.payload)`.

Voir la documentation détaillée sur l'architecture sockets : [docs/socket-architecture.md](docs/socket-architecture.md)

## 🗄️ Importation de la base de données

### 👤 1. Se connecter à PostgreSQL

```bash
sudo -u postgres psql
```

### 🔐 2. Créer l'utilisateur et la base de données

> Les informations ci-dessous doivent correspondre aux valeurs définies dans votre fichier `.env`.

```sql
CREATE USER pop_quizz_user WITH PASSWORD '1234';
CREATE DATABASE pop_quizz OWNER pop_quizz_user;
GRANT ALL PRIVILEGES ON DATABASE pop_quizz TO pop_quizz_user;
```

### 📥 3. Importer le schéma de la base de données

```bash
psql "postgresql://pop_quizz_user:1234@localhost:5432/pop_quizz" \
    -f database/schema_update.sql
```

### 🌱 4. Importer les données initiales (seed)

```bash
psql "postgresql://pop_quizz_user:1234@localhost:5432/pop_quizz" \
    -f database/seed.sql
```

> ✅ Une fois ces étapes terminées, la base de données est prête à être utilisée par l'application.

🚀 **Démarrage rapide**

```bash
npm install
npm run start
```
