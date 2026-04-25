# French Companies

Monorepo pour l'application de gestion des entreprises francaises.

## Structure

- `back/` - backend API Express + Prisma + PostgreSQL.
- `front/` - interface UI React + Vite + Tailwind CSS.

Le code backend qui etait auparavant a la racine du projet se trouve maintenant dans `back/`.
Par exemple, les fichiers de `src/modules/...` sont maintenant dans `back/src/modules/...`.

## Prerequis

- Node.js 18+
- npm 9+
- PostgreSQL pour le backend

## Installation

Chaque projet conserve ses propres dependances et son propre lockfile.

```bash
npm install --prefix back
npm install --prefix front
```

## Configuration

Backend:

```bash
copy back\.env.example back\.env
```

Frontend:

```bash
copy front\.env.example front\.env
```

Dans `front/.env`, `VITE_API_URL` doit pointer vers le backend, par exemple:

```bash
VITE_API_URL=http://localhost:4000
```

## Commandes racine

```bash
npm run build
npm run build:back
npm run build:front
npm run dev:back
npm run dev:front
npm run start:back
```

`npm run build` lance le build des deux projets.

## Commandes backend

```bash
npm --prefix back run dev
npm --prefix back run build
npm --prefix back run start
npm --prefix back run prisma:migrate
npm --prefix back run seed
```

## Commandes frontend

```bash
npm --prefix front run dev
npm --prefix front run build
npm --prefix front run preview
```

## Note

- L'API est documentee dans `back/src/docs/openapi.ts`.
- Les routes API sont sous `/api/v1`.
- Le frontend consomme le backend via `front/src/lib/api.ts`.
