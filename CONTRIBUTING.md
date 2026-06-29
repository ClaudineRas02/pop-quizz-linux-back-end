# Contributing

Ce projet utilise un flow GitLab simple avec trois niveaux de branches :

- `master` : version stable, livrable et protegee.
- `develop` : branche d'integration de l'equipe.
- `feat/...` : branches de fonctionnalites creees depuis `develop`.

## Regles de branches

Ne pas travailler directement sur `master`.

Ne pas travailler directement sur `develop`, sauf correction mineure validee par l'equipe.

Pour chaque fonctionnalite :

```bash
git checkout develop
git pull origin develop
git checkout -b feat/nom-court-de-la-feature
```

Exemples :

```text
feat/list-room-availability
feat/admin-room-update
feat/openapi-docs
```

## Cycle de travail

1. Creer une branche `feat/...` depuis `develop`.
2. Implementer la fonctionnalite.
3. Lancer les tests localement.
4. Pousser la branche sur GitLab.
5. Ouvrir une Merge Request vers `develop`.
6. Demander une review.
7. Corriger les retours si necessaire.
8. Merger dans `develop`.

Commandes typiques :

```bash
npm test
git status
git add .
git commit -m "feat: add room availability endpoints"
git push origin feat/list-room-availability
```

## Merge vers master

`master` recoit uniquement des versions stabilisees depuis `develop`.

Quand `develop` est pret :

1. Verifier que les tests passent.
2. Ouvrir une Merge Request `develop -> master`.
3. Faire valider par l'equipe.
4. Merger apres validation.

## Convention de commits

Utiliser des messages courts et explicites :

```text
feat: add admin room routes
fix: validate room availability date
docs: add openapi documentation
test: cover room use cases
refactor: split public and admin routes
```

Prefixes recommandes :

- `feat` : nouvelle fonctionnalite.
- `fix` : correction de bug.
- `docs` : documentation.
- `test` : ajout ou correction de tests.
- `refactor` : modification de structure sans changement fonctionnel.
- `chore` : configuration ou maintenance.

## Qualite attendue avant Merge Request

Avant d'ouvrir une Merge Request :

```bash
npm test
```

Verifier aussi :

- la fonctionnalite correspond au besoin demande ;
- les routes admin restent dans `src/interfaces/routes/admin-*.routes.js` ;
- les routes publiques restent dans `src/interfaces/routes/public-*.routes.js` ;
- la logique metier reste dans `src/domain` ou `src/application` ;
- le SQL reste dans `src/infrastructure/persistence/postgres` ;
- les secrets ne sont jamais commits dans `.env`.

## Securite

Ne jamais committer :

- `.env`
- mots de passe ;
- tokens admin ;
- identifiants personnels ;
- dumps contenant des donnees sensibles.

Les routes admin doivent rester protegees par un middleware dedie. Pour ce projet, la protection actuelle est `requireAdmin`. Si l'authentification evolue vers JWT ou session, remplacer ce middleware sans deplacer la logique dans les controllers.

## Structure a respecter

Pour une nouvelle fonctionnalite :

- entite ou regle metier : `src/domain`
- scenario applicatif : `src/application/use-cases`
- controller HTTP : `src/interfaces/controllers`
- route publique : `src/interfaces/routes/public-*.routes.js`
- route admin : `src/interfaces/routes/admin-*.routes.js`
- acces PostgreSQL : `src/infrastructure/persistence/postgres`
- documentation API : `docs/openapi.json`

Cette separation garde le projet lisible et evite de melanger Express, SQL et logique metier.
