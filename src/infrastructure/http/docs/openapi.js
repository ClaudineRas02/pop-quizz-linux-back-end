import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const openApiPath = resolve(process.cwd(), "docs/openapi.json");
const openApiDocument = JSON.parse(readFileSync(openApiPath, "utf8"));

// Expose la documentation OpenAPI.
// Le JSON est utile pour le frontend, Postman, Insomnia ou Swagger Editor.
export function createOpenApiRoutes(app) {
  app.get("/api/docs/openapi.json", (req, res) => {
    res.status(200).json(openApiDocument);
  });

  app.get("/api/docs", (req, res) => {
    res.status(200).type("html").send(createDocsHtml());
  });
}

function createDocsHtml() {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>API POP QUIZZ - Documentation</title>
    <style>
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        color: #1f2937;
        background: #f8fafc;
      }
      main {
        max-width: 960px;
        margin: 0 auto;
        padding: 32px 20px;
      }
      h1 {
        margin: 0 0 8px;
        font-size: 28px;
      }
      p {
        line-height: 1.55;
      }
      a {
        color: #0f766e;
        font-weight: 700;
      }
      code {
        background: #e5e7eb;
        border-radius: 4px;
        padding: 2px 6px;
      }
      .panel {
        margin-top: 24px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: #ffffff;
        padding: 20px;
      }
      li {
        margin: 8px 0;
      }
      .badge {
        display: inline-block;
        background: #0f766e;
        color: white;
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 700;
        margin-left: 8px;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>API POP QUIZZ</h1>
      <p>Documentation OpenAPI du backend de quiz en temps réel.</p>
      
      <div class="panel">
        <h2>Documentation</h2>
        <p>
          Specification JSON :
          <a href="/api/docs/openapi.json">/api/docs/openapi.json</a>
        </p>
        <p>
          Pour une interface interactive, importer ce fichier dans Swagger Editor,
          Postman ou Insomnia.
        </p>
      </div>

      <div class="panel">
        <h2>Joueurs</h2>
        <ul>
          <li><code>POST /api/players</code> <span class="badge">Créer</span></li>
          <li><code>GET /api/players/:id</code> <span class="badge">Détails</span></li>
          <li><code>GET /api/players/leaderboard</code> <span class="badge">Classement</span></li>
          <li><code>PATCH /api/players/:id</code> <span class="badge">Modifier</span></li>
        </ul>
      </div>

      <div class="panel">
        <h2>Contests (Parties)</h2>
        <ul>
          <li><code>POST /api/contests</code> <span class="badge">Créer</span></li>
          <li><code>GET /api/contests</code> <span class="badge">Lister</span></li>
          <li><code>GET /api/contests/:id</code> <span class="badge">Détails</span></li>
          <li><code>POST /api/contests/:id/join</code> <span class="badge">Rejoindre</span></li>
          <li><code>POST /api/contests/:id/start</code> <span class="badge">Démarrer</span></li>
          <li><code>GET /api/contests/:id/leaderboard</code> <span class="badge">Classement</span></li>
        </ul>
      </div>

      <div class="panel">
        <h2>Questions</h2>
        <ul>
          <li><code>POST /api/questions</code> <span class="badge">Créer</span></li>
          <li><code>GET /api/questions</code> <span class="badge">Lister</span></li>
          <li><code>GET /api/questions/:id</code> <span class="badge">Détails</span></li>
          <li><code>PATCH /api/questions/:id</code> <span class="badge">Modifier</span></li>
          <li><code>DELETE /api/questions/:id</code> <span class="badge">Supprimer</span></li>
          <li><code>POST /api/questions/:id/choices</code> <span class="badge">Ajouter choix</span></li>
        </ul>
      </div>

      <div class="panel">
        <h2>Réponses</h2>
        <ul>
          <li><code>POST /api/contests/:id/questions/:qid/answer</code> <span class="badge">Répondre</span></li>
          <li><code>GET /api/contests/:id/questions/:qid/stats</code> <span class="badge">Stats</span></li>
        </ul>
      </div>

      <div class="panel">
        <h2>Admin</h2>
        <ul>
          <li><code>POST /api/admin/login</code> <span class="badge">Login</span></li>
          <li><code>POST /api/admin/questions/import</code> <span class="badge">Import</span></li>
          <li><code>GET /api/admin/stats</code> <span class="badge">Stats globales</span></li>
        </ul>
      </div>

      <div class="panel">
        <h2>Socket.IO (temps réel)</h2>
        <ul>
          <li><code>http://localhost:3000</code> <span class="badge">Connexion Socket.IO</span></li>
          <li><code>join-game</code> ou <code>join-contest</code> - Rejoindre la room <code>game:{id}</code></li>
          <li><code>game:started</code> - Partie démarrée</li>
          <li><code>question:opened</code> - Première ou prochaine question ouverte</li>
          <li><code>question:answer-received</code> - Réponse reçue</li>
          <li><code>question:closed</code> - Question fermée</li>
          <li><code>game:ended</code> - Partie terminée</li>
        </ul>
      </div>

      <div class="panel">
        <h2>Modèles de données</h2>
        <ul>
          <li><strong>Player</strong> - id, username, email, avatar, score_total</li>
          <li><strong>Question</strong> - id, statement, category, type, duration, points</li>
          <li><strong>Contest</strong> - id, title, status, questions, players</li>
          <li><strong>Answer</strong> - id, player_id, question_id, value, is_correct, time</li>
        </ul>
      </div>
    </main>
  </body>
</html>`;
}
