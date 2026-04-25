# ESG Scout

ESG Scout est un outil d'analyse RSE automatisee developpe par Best Value pour evaluer de maniere exhaustive et fiable les pratiques environnementales, sociales et de gouvernance des entreprises francaises.

Entreprise : Best Value

Site officiel : https://www.bestvalue.fr/

Principe cardinal : mieux vaut manquer une information que d'en valider une fausse.

## Prerequis

- Node.js 18+
- npm 9+

## Installation

```bash
npm install
```

## Configuration

1. Copier `.env.example` vers `.env`
2. Definir `VITE_API_URL` avec l'URL racine de votre backend

Exemple :

```bash
VITE_API_URL=http://localhost:4000
```

## Lancement

```bash
npm run dev
```

## Build production

```bash
npm run build
npm run preview
```

## Endpoints utilises

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

Les routes `POST` attendent du JSON avec `email` et `password`. `login` et `register` renvoient `user` et `accessToken`. `GET /api/v1/auth/me` doit etre appele avec `Authorization: Bearer <accessToken>`.
