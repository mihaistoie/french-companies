# Specifications Fonctionnelles - Gestion des Entreprises

## Contexte

L'application doit proposer un ecran frontend permettant de consulter, creer et modifier les entreprises referencees dans ESG Scout.

Les actions de creation et de modification sont reservees aux utilisateurs ayant le role `ADMIN`.

## 1. Ecran de liste des entreprises

### Objectif

Afficher la liste des entreprises accessibles a un utilisateur authentifie.

### Donnees affichees

Chaque entreprise doit afficher les champs suivants :

- `raisonSociale`
- `siret`
- `siteWeb`

### Comportement attendu

- La liste doit etre responsive.
- Sur desktop, les entreprises peuvent etre affichees sous forme de tableau.
- Sur mobile, les entreprises doivent etre affichees dans une vue adaptee, par exemple sous forme de cartes.
- Si `siteWeb` est renseigne, il doit etre affiche sous forme de lien cliquable.
- Si `siteWeb` n'est pas renseigne, l'interface affiche un libelle du type `Non renseigne`.
- L'ecran doit proposer un champ de recherche permettant de filtrer les entreprises.
- La recherche doit pouvoir porter sur la raison sociale, l'adresse, le SIRET ou le SIREN.
- La recherche doit utiliser le parametre `search` de l'endpoint de liste.
- L'utilisateur doit pouvoir effacer rapidement la recherche.

### Etats a gerer

- Chargement des donnees.
- Erreur de chargement.
- Liste vide.
- Rafraichissement manuel de la liste.

### Endpoint utilise

```http
GET /api/v1/companies
```

Parametre de recherche :

```http
GET /api/v1/companies?search=:query
```

### Regle d'acces

L'ecran est accessible aux utilisateurs authentifies.

## 2. Creation d'une entreprise

### Objectif

Permettre a un administrateur d'ajouter une nouvelle entreprise depuis l'ecran de liste.

### Regles d'acces

- Le bouton `Ajouter une entreprise` est visible uniquement pour les utilisateurs ayant le role `ADMIN`.
- Les utilisateurs non admin ne doivent pas voir l'action de creation.
- Le backend reste responsable de la securite effective de l'endpoint.

### Formulaire de creation

Le premier champ du formulaire doit etre :

- `siret`

Le champ `siret` sert a declencher la recherche SIRET et reste modifiable dans le formulaire.

Le champ `siren` est affiche mais n'est pas modifiable. Il est renseigne a partir de la recherche SIRET.

Le champ `pays` est affiche mais n'est pas modifiable. Sa valeur par defaut est `France`.

### Recherche automatique par SIRET

Lorsque l'utilisateur renseigne un SIRET valide de 14 chiffres, le frontend doit appeler l'endpoint suivant :

```http
GET /api/v1/companies/siret/:siret
```

### Pre-remplissage des informations

Si l'API retourne des informations, le formulaire doit etre pre-rempli avec les champs disponibles :

- `raisonSociale`
- `siren`
- `categorieJuridiqueCode`
- `codeNaf`
- `addressLine1`
- `addressLine2`
- `codePostal`
- `ville`
- `pays`
- `etablissementSiege`
- `trancheEffectifsUniteLegale`
- `trancheEffectifsEtablissement`
- `estActive`
- `description`

Lorsque l'information NAF est disponible dans le referentiel local, la reponse de `companies/siret/:siret` doit aussi retourner `nafCode` avec le `title`. L'interface doit alors afficher directement ce titre dans le champ `Activite NAF`, et non le code NAF brut.

Lorsque l'information de categorie juridique est disponible dans le referentiel local, la reponse de `companies/siret/:siret` doit aussi retourner `categorieJuridique` avec le `title`. L'interface doit alors afficher directement ce titre dans le champ `Categorie juridique`, et non le code brut.

### Recherche du code NAF

Le formulaire de creation et de modification doit proposer un champ de recherche NAF.

L'utilisateur doit pouvoir rechercher une activite NAF par :

- code NAF ;
- code alternatif ;
- libelle / titre de l'activite.

Le frontend doit appeler l'endpoint suivant :

```http
GET /api/v1/code-naf/autocomplete?q=:query&limit=:limit
```

L'interface doit afficher en priorite le champ `title` du code NAF dans les resultats et dans le champ selectionne.

Les APIs de consultation, creation et modification d'entreprise doivent retourner la relation NAF afin que l'interface puisse afficher directement le titre :

```json
{
  "codeNaf": "62.01Z",
  "nafCode": {
    "code": "62.01Z",
    "title": "Programmation informatique",
    "altCode": "6201Z"
  }
}
```

Lorsque l'utilisateur selectionne une activite NAF :

- le `title` est affiche dans l'interface ;
- le `code` est conserve comme valeur technique ;
- le payload envoye a l'API utilise le champ `codeNaf`.

### Recherche de categorie juridique

Le formulaire de creation et de modification doit proposer un champ de recherche de categorie juridique.

L'utilisateur doit pouvoir rechercher une categorie juridique par :

- code de categorie juridique ;
- libelle / titre de categorie juridique.

Le frontend doit appeler l'endpoint suivant :

```http
GET /api/v1/categorie-juridique/autocomplete?q=:query&limit=:limit
```

L'interface doit afficher en priorite le champ `title` dans les resultats et dans le champ selectionne.

Les APIs de consultation, creation et modification d'entreprise doivent retourner la relation de categorie juridique afin que l'interface puisse afficher directement le titre :

```json
{
  "categorieJuridiqueCode": "5710",
  "categorieJuridique": {
    "code": "5710",
    "title": "SAS, societe par actions simplifiee"
  }
}
```

Lorsque l'utilisateur selectionne une categorie juridique :

- le `title` est affiche dans l'interface ;
- le `code` est conserve comme valeur technique ;
- le payload envoye a l'API utilise le champ `categorieJuridiqueCode`.

### Champs obligatoires

Les champs suivants sont obligatoires pour creer une entreprise :

- `raisonSociale`
- `siret`
- `siren`

### Champs complementaires du formulaire

Le formulaire de creation et de modification doit aussi permettre de renseigner les champs suivants :

- `description` : commentaire libre sur l'entreprise.
- `estActive` : indique si l'entreprise est active.
- `etablissementSiege` : type d'etablissement.
- `trancheEffectifsUniteLegale` : tranche d'effectifs de l'unite legale.
- `trancheEffectifsEtablissement` : tranche d'effectifs de l'etablissement.

Les champs suivants ne sont pas modifiables dans l'interface :

- `siren`
- `pays`

Les valeurs possibles pour `etablissementSiege` sont :

| Valeur technique | Libelle FR | Libelle EN |
| --- | --- | --- |
| `UNKNOWN` | Inconnu | Unknown |
| `PRIMARY` | Etablissement principal | Primary establishment |
| `SECONDARY` | Etablissement secondaire | Secondary establishment |

Les valeurs possibles pour `trancheEffectifsUniteLegale` et `trancheEffectifsEtablissement` sont :

| Valeur technique | Libelle FR | Libelle EN |
| --- | --- | --- |
| `NN` | Unite non employeuse | Non-employing unit |
| `00` | 0 salarie | 0 employees |
| `01` | 1 ou 2 salaries | 1 or 2 employees |
| `02` | 3 a 5 salaries | 3 to 5 employees |
| `03` | 6 a 9 salaries | 6 to 9 employees |
| `11` | 10 a 19 salaries | 10 to 19 employees |
| `12` | 20 a 49 salaries | 20 to 49 employees |
| `21` | 50 a 99 salaries | 50 to 99 employees |
| `22` | 100 a 199 salaries | 100 to 199 employees |
| `31` | 200 a 249 salaries | 200 to 249 employees |
| `32` | 250 a 499 salaries | 250 to 499 employees |
| `41` | 500 a 999 salaries | 500 to 999 employees |
| `42` | 1 000 a 1 999 salaries | 1,000 to 1,999 employees |
| `51` | 2 000 a 4 999 salaries | 2,000 to 4,999 employees |
| `52` | 5 000 a 9 999 salaries | 5,000 to 9,999 employees |
| `53` | 10 000 salaries et plus | 10,000 employees or more |

### Validations frontend

- `siret` doit contenir exactement 14 chiffres.
- `siren` doit contenir exactement 9 chiffres.
- `raisonSociale` est obligatoire.
- `siteWeb`, s'il est renseigne, doit etre une URL valide.

### Creation

Lorsque le formulaire est valide, le frontend appelle :

```http
POST /api/v1/companies
```

Le payload de creation peut contenir les champs suivants :

- `raisonSociale`
- `siret`
- `siren`
- `siteWeb`
- `codeNaf`
- `categorieJuridiqueCode`
- `description`
- `estActive`
- `etablissementSiege`
- `trancheEffectifsUniteLegale`
- `trancheEffectifsEtablissement`
- `addressLine1`
- `addressLine2`
- `codePostal`
- `ville`
- `pays`

### Apres creation

- Le formulaire est reinitialise ou ferme.
- La liste des entreprises est rechargee.
- Un message de succes est affiche.

## 3. Modification d'une entreprise

### Objectif

Permettre a un administrateur de modifier une entreprise existante depuis l'ecran de liste.

### Regles d'acces

- Le bouton `Modifier` est visible uniquement pour les utilisateurs ayant le role `ADMIN`.
- Les utilisateurs non admin ne doivent pas voir l'action de modification.
- Le backend reste responsable de la securite effective de l'endpoint.

### Comportement attendu

- L'administrateur clique sur `Modifier` pour une entreprise.
- Le formulaire de modification s'ouvre.
- Le formulaire est pre-rempli avec les informations de l'entreprise selectionnee.
- L'administrateur peut modifier les informations disponibles.
- Le champ `siret` reste modifiable.
- Le champ `siren` est affiche mais non modifiable.
- Le champ `pays` est affiche mais non modifiable.
- Le champ NAF doit etre affiche sous forme de recherche/autocomplete.
- Le titre NAF (`title`) doit etre affiche dans l'interface, tandis que le code NAF reste la valeur envoyee au backend.
- Le champ categorie juridique doit etre affiche sous forme de recherche/autocomplete.
- Le titre de categorie juridique (`title`) doit etre affiche dans l'interface, tandis que le code reste la valeur envoyee au backend.
- Les champs `description`, `estActive`, `etablissementSiege`, `trancheEffectifsUniteLegale` et `trancheEffectifsEtablissement` doivent etre modifiables.
- A la sauvegarde, le frontend appelle l'endpoint de mise a jour.

### Endpoint utilise

```http
PATCH /api/v1/companies/:id
```

Le payload de modification peut contenir les memes champs que le payload de creation, de facon partielle.

### Apres modification

- Le formulaire est ferme.
- La liste des entreprises est rechargee.
- Un message de succes est affiche.

## 4. Securite

Le frontend doit masquer les actions reservees aux administrateurs, mais la securite principale doit etre appliquee cote backend.

Les endpoints suivants doivent etre reserves au role `ADMIN` :

```http
POST /api/v1/companies
PATCH /api/v1/companies/:id
```

Les endpoints de consultation restent accessibles aux utilisateurs authentifies.

## 5. Contrats API attendus

### Liste des entreprises

```http
GET /api/v1/companies
```

La reponse doit contenir une pagination :

```json
{
  "items": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "totalPages": 0
  }
}
```

Chaque entreprise peut contenir les relations enrichies suivantes :

```json
{
  "codeNaf": "62.01Z",
  "nafCode": {
    "code": "62.01Z",
    "title": "62.01Z - Programmation informatique",
    "altCode": "6201Z"
  },
  "categorieJuridiqueCode": "5710",
  "categorieJuridique": {
    "code": "5710",
    "title": "SAS, societe par actions simplifiee"
  }
}
```

### Recherche SIRET

```http
GET /api/v1/companies/siret/:siret
```

La reponse doit indiquer si l'entreprise existe deja, retourner l'entreprise existante si elle est presente, et retourner un brouillon pre-rempli lorsque des donnees SIRENE sont disponibles :

```json
{
  "exists": false,
  "existingCompany": null,
  "company": {
    "siret": "12345678901234",
    "siren": "123456789",
    "raisonSociale": "Exemple SAS",
    "codeNaf": "62.01Z",
    "nafCode": {
      "code": "62.01Z",
      "title": "62.01Z - Programmation informatique",
      "altCode": "6201Z"
    },
    "categorieJuridiqueCode": "5710",
    "categorieJuridique": {
      "code": "5710",
      "title": "SAS, societe par actions simplifiee"
    },
    "etablissementSiege": "PRIMARY",
    "trancheEffectifsUniteLegale": "NN",
    "trancheEffectifsEtablissement": "NN",
    "pays": "France"
  }
}
```

## 6. Criteres d'acceptation

La fonctionnalite est acceptee si :

- Un utilisateur authentifie peut consulter la liste des entreprises.
- La liste est responsive sur desktop et mobile.
- Les champs `raisonSociale`, `siret` et `siteWeb` sont affiches.
- Un utilisateur peut rechercher une entreprise depuis la liste.
- La recherche filtre les resultats via `GET /api/v1/companies?search=:query`.
- Un utilisateur non admin ne voit pas les boutons de creation ou de modification.
- Un admin voit le bouton `Ajouter une entreprise`.
- Un admin voit le bouton `Modifier` sur chaque entreprise.
- A la saisie d'un SIRET valide, l'API `companies/siret/:siret` est appelee.
- Les informations disponibles sont pre-remplies dans le formulaire de creation.
- Le formulaire de creation et de modification propose une recherche NAF.
- La recherche NAF affiche le `title` des activites NAF.
- La selection d'une activite NAF envoie le champ technique `codeNaf` au backend.
- Le formulaire de creation et de modification propose une recherche de categorie juridique.
- La recherche de categorie juridique affiche le `title`.
- La selection d'une categorie juridique envoie le champ technique `categorieJuridiqueCode` au backend.
- Un admin peut renseigner une description sous forme de commentaire.
- Un admin peut modifier l'etat actif de l'entreprise.
- Un admin peut selectionner le type d'etablissement siege.
- Un admin peut selectionner les tranches d'effectifs de l'unite legale et de l'etablissement.
- Un admin peut creer une entreprise.
- Un admin peut modifier une entreprise existante.
- Apres creation ou modification, la liste des entreprises est mise a jour.
