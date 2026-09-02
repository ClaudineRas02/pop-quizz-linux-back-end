# Architecture et fonctionnement des sockets

Ce document explique comment les sockets sont intégrés à l'architecture backend, comment l'`express-route-adapter` déclenche un `emit` et quelle action est attendue côté frontend.

## Principes généraux

- Le serveur crée une instance Socket.IO et l'attache à l'application Express via `app.locals.io` (voir [src/server.js](src/server.js#L1-L60)).
- Les contrôleurs restent découplés du framework : ils retournent un objet `{ statusCode, body }`. Si `body.data.event` est présent, l'adaptateur de route envoie l'événement via Socket.IO.

## Comportement de l'adaptateur de route

L'adaptateur principal se trouve dans [src/shared/express-route-adapter.js](src/shared/express-route-adapter.js#L1-L40).

Résumé du flux dans `adaptRoute(controllerAction)` :

- Exécute `controllerAction(...)` et récupère `result`.
- Si `result.body.data.event` existe et que `req.app.locals.io` est disponible, l'adaptateur fait :

```
io.to(event.room).emit(event.name, event.payload)
```

- Ensuite il retourne la réponse HTTP normale (`res.status(result.statusCode).json(result.body)`), sauf pour les cas spéciaux (204, téléchargement de fichier, etc.).

Cela signifie que les actions HTTP et l'émission socket se produisent ensemble : l'appelant HTTP reçoit la réponse, et les clients socket connectés dans la room configurée reçoivent l'événement en temps réel.

## Format attendu pour l'événement côté backend

Le contrôleur qui souhaite déclencher un broadcast doit inclure, dans son `body`, un objet `data.event` avec la forme :

```js
// Exemple de retour depuis un controller
return {
  statusCode: 200,
  body: {
    success: true,
    data: {
      event: {
        room: contestId, // id de la room ou nom de room (string)
        name: "player-joined", // nom de l'événement
        payload: { userId, nickname }, // donnée à envoyer aux clients
      },
    },
  },
};
```

L'adaptateur lira `result.body.data.event` et émettra cet événement vers la `room` indiquée.

## Rooms et logique de join côté serveur

Le serveur configure des handlers de connexion socket et propose des événements pour rejoindre des rooms, par exemple `join-contest` et `join-game` (voir [src/server.js](src/server.js#L1-L120)).

Extrait principal :

```
socket.on('join-contest', (contestId) => {
  socket.join(contestId);
  socket.join(`game:${contestId}`);
});

socket.on('join-game', (gameId) => {
  socket.join(gameId);
  socket.join(`game:${gameId}`);
});
```

Ainsi, pour recevoir les événements émis par `io.to(event.room).emit(...)`, le client doit être connecté et avoir rejoint la room correspondante.

## Action attendue côté frontend

1. Établir la connexion Socket.IO avec le serveur (ex. via `socket.io-client`).
2. Joindre la room appropriée (envoyer `join-contest` ou `join-game` avec l'ID pertinent) dès que l'utilisateur entre dans le lobby/jeu.
3. Écouter l'événement émis par le backend et mettre à jour l'UI en conséquence.

Exemple minimal côté frontend (Socket.IO client) :

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", { withCredentials: true });

// Rejoindre la room du contest au chargement du lobby
socket.emit("join-contest", contestId);

// Écouter un événement envoyé par le backend
socket.on("player-joined", (data) => {
  // Mettre à jour la liste des joueurs / UI
  console.log("Joueur rejoint :", data);
});
```

Remarques pratiques :

- Le client doit être connecté et avoir rejoint la room avant que le backend n'émette, sinon il ne recevra pas l'événement (car l'émission cible la room spécifique).
- Si vous voulez garantir la réception d'un événement déclenché immédiatement par une requête HTTP côté backend, assurez-vous que le client rejoint la room au préalable (ex. en déclenchant `join-contest` au moment où l'utilisateur visite le lobby).

## Cas spéciaux gérés par l'adaptateur

- Téléchargements : si `result.filePath` est présent, l'adaptateur lance `res.download(...)`.
- No Content : le code 204 renvoie `res.status(204).end()` sans body.

## Fichiers de référence

- Adaptateur de route : [src/shared/express-route-adapter.js](src/shared/express-route-adapter.js#L1-L40)
- Initialisation Socket.IO : [src/server.js](src/server.js#L1-L120)
