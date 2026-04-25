# AGENTS.md

## Stack
- Utiliser React + Vite + Tailwind CSS + shadcn/ui
- Privilegier TypeScript
- Utiliser lucide-react pour les icones lorsque c'est utile
- Garder les dependances minimales et justifiees

## Regles d'interface
- Construire une interface soignee, premium et moderne
- Adopter une approche mobile-first et completement responsive
- Prendre en charge le mode clair et le mode sombre
- Persister le theme dans localStorage
- Utiliser les composants shadcn/ui de facon coherente
- Maintenir un bon rythme visuel avec un espacement, une typographie et une hierarchie clairs
- Eviter les formulaires generiques ou trop basiques
- Les messages de l'interface doivent etre en francais par defaut, mais geres via des resources de traduction pour etre facilement disponibles aussi en anglais
- Prevoir de bons etats vide, chargement et erreur
- Garantir des formulaires et des boutons accessibles

## Exigences de theme
- Implementer le mode clair et le mode sombre
- Utiliser les classes Tailwind et, lorsque c'est pertinent, des variables CSS pour les couleurs principales
- Definir une palette claire : background, foreground, primary, secondary, muted, border, danger
- Tous les composants doivent respecter le theme actif
- Le toggle de theme doit persister dans localStorage

## Architecture
- Garder des composants petits et reutilisables
- Separer la logique API dans src/lib/api.ts
- Garder l'interface liee a l'authentification dans src/components/auth
- Rendre l'application facile a etendre plus tard avec des routes protegees et un auth context
- Eviter la logique dupliquee et les styles repetes

## Comportement d'authentification
- Prendre en charge login, register, me et logout
- Persister le token dans localStorage
- Au chargement de l'application, tenter une authentification avec le token sauvegarde
- En cas de token invalide, nettoyer l'etat d'authentification proprement
- Fournir des etats de chargement et d'erreur pour toutes les actions d'authentification

## Qualite du code
- Generer du code complet, pas des stubs
- Privilegier un code lisible et maintenable
- Ajouter des commentaires uniquement lorsqu'ils apportent une vraie valeur
- Ne pas sur-architecturer
- Garder une implementation prete pour la production

## Attentes de sortie
- Generer du code complet, pas seulement des exemples
- Creer les fichiers manquants si necessaire
- Garder une structure de dossiers organisee
- Expliquer brievement ce qui a ete modifie
