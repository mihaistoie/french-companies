# AGENTS.md

## Structure du projet

Ce projet est un monorepo avec deux applications:

- `back/` est le backend API.
- `front/` est l'interface UI.

Ne suppose pas que le backend est a la racine. Toute reference au backend doit passer par `back/...`.
Par exemple:

- schemas backend: `back/src/modules/companies/company.schemas.ts`
- routes backend: `back/src/modules/companies/company.routes.ts`
- service backend: `back/src/modules/companies/company.service.ts`
- Prisma schema: `back/prisma/schema.prisma`
- UI app: `front/src/App.tsx`
- client API frontend: `front/src/lib/api.ts`

## Commandes

Depuis la racine:

```bash
npm run build
npm run build:back
npm run build:front
npm run dev:back
npm run dev:front
```

Pour les commandes propres a un projet, utilise `npm --prefix`:

```bash
npm --prefix back run build
npm --prefix front run build
```

## Backend

Stack:

- Express
- TypeScript
- Prisma
- PostgreSQL
- Zod pour la validation
- OpenAPI dans `back/src/docs/openapi.ts`

Regles:

- Garde la logique metier dans les services.
- Garde la validation des requetes dans les fichiers `*.schemas.ts`.
- Garde les controleurs legers.
- Quand tu ajoutes ou modifies un endpoint, mets a jour les routes, le schema de validation et OpenAPI si pertinent.
- Ne deplace pas les fichiers backend a la racine.
- Quand je crée un prompt, mets à jour les spécifications

## Frontend

Stack:

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui style components
- lucide-react pour les icones

Regles:

- Garde la logique API dans `front/src/lib/api.ts`.
- Garde des composants petits et reutilisables.
- L'UI doit prendre en charge le responsive layout, le mode clair/sombre et les etats loading/error.
- Les messages visibles dans l'UI sont en francais par defaut et geres via des ressources de traduction quand c'est possible.
- Les valeurs techniques des enumerations ne doivent pas etre affichees directement dans l'UI. Chaque enum visible doit avoir des libelles traduits dans les langues supportees, au minimum FR et EN, via les ressources de traduction ou une table de libelles localisee.
- Ne deplace pas les fichiers frontend a la racine.

## Verification

Apres des changements significatifs, lance:

```bash
npm run build
```

Si tu travailles seulement sur une partie:

```bash
npm run build:back
npm run build:front
```
