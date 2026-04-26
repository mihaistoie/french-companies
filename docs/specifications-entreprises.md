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
- `activeEvaluationRse.note`

Les notes d'evaluation RSE sont exprimees avec les valeurs `A`, `B`, `C`, `D`, `E` et `F` partout dans l'application.
Dans la liste, la note est affichee sous forme d'un indicateur visuel type score nutritionnel : les six lettres `A` a `F` sont visibles, et la note courante est mise en avant.

### Comportement attendu

- La liste doit etre responsive.
- Sur desktop, les entreprises peuvent etre affichees sous forme de tableau.
- Sur mobile, les entreprises doivent etre affichees dans une vue adaptee, par exemple sous forme de cartes.
- Si `siteWeb` est renseigne, il doit etre affiche sous forme de lien cliquable.
- Si `siteWeb` n'est pas renseigne, l'interface affiche un libelle du type `Non renseigne`.
- L'ecran doit proposer un champ de recherche permettant de filtrer les entreprises.
- La recherche doit pouvoir porter sur la raison sociale, le SIRET ou l'adresse.
- La recherche doit utiliser le parametre `search` de l'endpoint de liste.
- L'utilisateur doit pouvoir effacer rapidement la recherche.
- Par defaut, la liste est triee par `raisonSociale` dans l'ordre croissant.

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

- La colonne et le bouton `Modifier` sont visibles uniquement pour les utilisateurs ayant le role `ADMIN`.
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

## 5. Evaluation RSE

### Objectif

Permettre a un administrateur de creer une analyse RSE (`EvaluationRse`) pour une entreprise depuis la liste des entreprises.

### Acces depuis la liste

- Dans la liste des entreprises, l'utilisateur doit voir la note de l'evaluation RSE active de chaque entreprise.
- Si aucune evaluation active n'existe, la liste affiche une valeur d'absence de note.
- Au clic sur la note, le frontend appelle une API qui retourne l'evaluation RSE active si elle existe et affiche le detail de l'evaluation.
- Si aucune evaluation active n'existe et que l'utilisateur est admin, le frontend cree automatiquement l'evaluation du jour puis affiche son detail.
- Si aucune evaluation active n'existe et que l'utilisateur n'est pas admin, l'interface affiche un message d'absence d'evaluation active.

### Navigation SPA

L'application reste une SPA, mais les ecrans principaux doivent etre synchronises avec l'historique du navigateur afin que les boutons Back et Forward fonctionnent.

Comportement attendu :

- L'ouverture du formulaire de creation d'entreprise ajoute une entree d'historique avec `?view=create`.
- L'ouverture du formulaire de modification d'entreprise ajoute une entree d'historique avec `?view=edit&companyId=:id`.
- L'ouverture de l'ecran d'evaluation RSE ajoute une entree d'historique avec `?view=evaluation&companyId=:id&section=:section`.
- L'ouverture de l'historique des evaluations ajoute une entree d'historique avec `?view=evaluationHistory&companyId=:id&section=:section`.
- Lorsque l'utilisateur ouvre une evaluation depuis la liste des entreprises, la section selectionnee par defaut est `labels`.
- Le changement d'indicateur dans l'ecran d'evaluation RSE remplace l'URL courante avec le nouveau parametre `section` sans ajouter d'entree dans l'historique du navigateur.
- Les valeurs autorisees pour `section` sont `labels`, `environment`, `social` et `governance`.
- Un rafraichissement de la page sur une evaluation doit restaurer l'indicateur selectionne.
- Le retour depuis une page de modification d'indicateur doit restaurer l'ecran d'evaluation sur le meme indicateur.
- Le retour a la liste des entreprises supprime les parametres de navigation.
- L'ecran principal d'evaluation RSE n'affiche pas de bouton `Retour`.
- L'ecran principal d'evaluation RSE n'affiche pas directement la liste des evaluations existantes.
- Un acces direct a une URL de navigation doit restaurer l'ecran correspondant lorsque l'utilisateur est authentifie.
- Les boutons Back et Forward du navigateur doivent restaurer la liste, la creation, la modification ou l'evaluation sans rechargement complet de la page.

### Endpoint d'evaluation active

```http
GET /api/v1/evaluations-rse/companies/:entrepriseId/active
```

Comportement attendu :

- Si une evaluation active existe pour l'entreprise, l'API la retourne.
- Si aucune evaluation active n'existe, l'API retourne `evaluation: null`.
- Cet endpoint est accessible aux utilisateurs authentifies.

### Endpoint de brouillon courant

```http
GET /api/v1/evaluations-rse/companies/:entrepriseId/current
```

Comportement attendu :

- Si une evaluation existe deja pour l'entreprise a la date du jour, l'API la retourne.
- Sinon, l'API retourne un brouillon non enregistre avec la date du jour.
- L'entreprise associee est retournee et affichee en lecture seule.
- Le score et la note sont retournes et affiches en lecture seule.

### Ecran d'evaluation

L'ecran d'evaluation doit afficher :

- l'entreprise en lecture seule ;
- la date d'evaluation ;
- le score en lecture seule ;
- la note en lecture seule ;
- un bouton `Enregistrer` ;
- un acces aux sections `LabelsEngagementsRse`, `IndicateursEnvironnementaux`, `IndicateursSociaux` et `IndicateursGouvernanceRse`.

### Enregistrement

```http
POST /api/v1/evaluations-rse/companies/:entrepriseId/current
```

Comportement attendu :

- L'API enregistre l'evaluation RSE pour l'entreprise a la date du jour.
- Si une evaluation existe deja a cette date, elle est retournee.
- Pour une entreprise donnee, une seule evaluation RSE peut etre active a la fois.
- Lorsqu'une evaluation est enregistree comme active, toutes les autres evaluations de la meme entreprise doivent etre desactivees.
- Une evaluation sauvegardee contient les blocs `LabelsEngagementsRse`, `IndicateursEnvironnementaux`, `IndicateursSociaux` et `IndicateursGouvernanceRse`.
- Le score et la note restent en lecture seule dans l'interface.

### Acces aux indicateurs

Depuis l'ecran d'evaluation, l'utilisateur doit pouvoir acceder aux indicateurs suivants :

- `LabelsEngagementsRse`
- `IndicateursEnvironnementaux`
- `IndicateursSociaux`
- `IndicateursGouvernanceRse`

Dans cette version, ces sections sont affichees dans l'ecran d'evaluation et presentent les informations disponibles en lecture seule.

### Edition des labels et engagements RSE

Un administrateur doit pouvoir modifier `LabelsEngagementsRse` depuis une page separee.

Comportement attendu :

- Depuis l'ecran d'evaluation, l'administrateur peut ouvrir une page de modification des labels et engagements RSE.
- La page affiche l'entreprise concernee en lecture seule.
- La page reste dans la SPA et ajoute une entree d'historique avec `?view=labels&evaluationId=:id`.
- Un utilisateur non admin ne peut pas acceder a l'edition.
- `aReportingRse` est un booleen.
- Lorsque `aReportingRse` vaut `true`, le champ memo `reportingRseDetail` est affiche.
- `aEvaluationEcovadis` est un booleen.
- Lorsque `aEvaluationEcovadis` vaut `true`, le champ `medailleEcovadis` est affiche comme une liste de selection et le champ memo `anneeScoreEcovadis` est affiche.
- `medailleEcovadis` propose les valeurs `PLATINUM`, `GOLD`, `SILVER`, `BRONZE`, `COMMITTED`, `FAST_MOVER` et `OTHER`.
- `estSocieteAMission` est un booleen.
- `estSignataireGlobalCompact` est un booleen.
- Lorsque `estSignataireGlobalCompact` vaut `true`, le champ memo `globalCompactDetail` est affiche.
- Lorsque le booleen associe vaut `false`, le champ memo associe est masque et sa valeur est videe a l'enregistrement.

```http
PATCH /api/v1/evaluations-rse/:id/labels-engagements-rse
```

Comportement attendu :

- Seul un administrateur peut appeler cet endpoint.
- L'API met a jour `LabelsEngagementsRse`.
- L'API recalcule le score et la note du bloc `LabelsEngagementsRse`.
- L'API retourne l'evaluation RSE mise a jour.
- Apres un enregistrement reussi, l'interface revient automatiquement a l'ecran d'evaluation sur la section `labels`.

### Edition des indicateurs environnementaux

Un administrateur doit pouvoir modifier `IndicateursEnvironnementaux` depuis une page separee.

Comportement attendu :

- Depuis l'ecran d'evaluation, l'administrateur peut ouvrir une page de modification des indicateurs environnementaux.
- La page affiche l'entreprise concernee en lecture seule.
- La page reste dans la SPA et ajoute une entree d'historique avec `?view=environment&evaluationId=:id`.
- Un utilisateur non admin ne peut pas acceder a l'edition.
- `bilanCarbone` est un booleen.
- Lorsque `bilanCarbone` vaut `true`, `bilanCarboneScope` est affiche comme une liste de selection et le champ memo `bilanCarboneDetail` est affiche.
- `bilanCarboneScope` propose les valeurs `NON_PRECISE`, `SCOPE_1`, `SCOPE_1_2` et `SCOPE_1_2_3`.
- Lorsque `decarbonisation` vaut `true`, le champ memo `decarbonisationDetail` est affiche.
- Lorsque `qpENR` vaut `true`, le champ memo `qpENRDetail` est affiche.
- Lorsque `iso14001` vaut `true`, le champ memo `iso14001Detail` est affiche.
- Lorsque `iso50001` vaut `true`, le champ memo `iso50001Detail` est affiche.
- Lorsque `recyclageDechets` vaut `true`, le champ memo `recyclageDechetsDetail` est affiche.
- Lorsque `autresEnv` vaut `true`, le champ memo `autresEnvDetail` est affiche.
- Lorsque le booleen associe vaut `false`, le champ memo associe est masque et sa valeur est videe a l'enregistrement.

```http
PATCH /api/v1/evaluations-rse/:id/indicateurs-environnementaux
```

Comportement attendu :

- Seul un administrateur peut appeler cet endpoint.
- L'API met a jour `IndicateursEnvironnementaux`.
- L'API recalcule le score et la note du bloc `IndicateursEnvironnementaux`.
- L'API retourne l'evaluation RSE mise a jour.
- Apres un enregistrement reussi, l'interface revient automatiquement a l'ecran d'evaluation sur la section `environment`.

### Edition des indicateurs sociaux

Un administrateur doit pouvoir modifier `IndicateursSociaux` depuis une page separee.

Comportement attendu :

- Depuis l'ecran d'evaluation, l'administrateur peut ouvrir une page de modification des indicateurs sociaux.
- La page affiche l'entreprise concernee en lecture seule.
- La page reste dans la SPA et ajoute une entree d'historique avec `?view=social&evaluationId=:id`.
- Un utilisateur non admin ne peut pas acceder a l'edition.
- `iso45001` est un booleen.
- Lorsque `iso45001` vaut `true`, le champ memo `iso45001Detail` est affiche.
- `ess` est un booleen sans champ detail associe.
- Lorsque `aEvaluationQvt` vaut `true`, le champ memo `detailEvaluationQvt` est affiche.
- Lorsque `aLabelEmployeur` vaut `true`, le champ memo `detailLabelEmployeur` est affiche.
- Lorsque `aVieAssociativeLocale` vaut `true`, le champ memo `detailVieAssociativeLocale` est affiche.
- Lorsque `aEgaliteHF` vaut `true`, le champ memo `detailEgaliteHF` est affiche.
- Lorsque `aAutresSocial` vaut `true`, le champ memo `detailAutresSocial` est affiche.
- Lorsque le booleen associe vaut `false`, le champ memo associe est masque et sa valeur est videe a l'enregistrement.

```http
PATCH /api/v1/evaluations-rse/:id/indicateurs-sociaux
```

Comportement attendu :

- Seul un administrateur peut appeler cet endpoint.
- L'API met a jour `IndicateursSociaux`.
- L'API recalcule le score et la note du bloc `IndicateursSociaux`.
- L'API retourne l'evaluation RSE mise a jour.
- Apres un enregistrement reussi, l'interface revient automatiquement a l'ecran d'evaluation sur la section `social`.

### Edition des indicateurs de gouvernance RSE

Un administrateur doit pouvoir modifier `IndicateursGouvernanceRse` depuis une page separee.

Comportement attendu :

- Depuis l'ecran d'evaluation, l'administrateur peut ouvrir une page de modification des indicateurs de gouvernance RSE.
- La page affiche l'entreprise concernee en lecture seule.
- La page reste dans la SPA et ajoute une entree d'historique avec `?view=governance&evaluationId=:id`.
- Un utilisateur non admin ne peut pas acceder a l'edition.
- Lorsque `aGouvernanceRse` vaut `true`, le champ memo `detailGouvernanceRse` est affiche.
- Lorsque `aEthique` vaut `true`, le champ memo `detailEthique` est affiche.
- Lorsque `aEnquetesPartenaires` vaut `true`, le champ memo `detailEnquetesPartenaires` est affiche.
- `charteAchats`, `labelRfar` et `certifFscPefc` sont des booleens sans champ detail associe.
- Lorsque `aAutresGouvernance` vaut `true`, le champ memo `detailAutresGouvernance` est affiche.
- Lorsque le booleen associe vaut `false`, le champ memo associe est masque et sa valeur est videe a l'enregistrement.

```http
PATCH /api/v1/evaluations-rse/:id/indicateurs-gouvernance-rse
```

Comportement attendu :

- Seul un administrateur peut appeler cet endpoint.
- L'API met a jour `IndicateursGouvernanceRse`.
- L'API recalcule le score et la note du bloc `IndicateursGouvernanceRse`.
- L'API retourne l'evaluation RSE mise a jour.
- Apres un enregistrement reussi, l'interface revient automatiquement a l'ecran d'evaluation sur la section `governance`.

### Historique des evaluations

Depuis l'ecran d'evaluation d'une entreprise, l'utilisateur doit voir un lien vers une page separee d'historique.
Cette page affiche l'entreprise concernee et la liste des evaluations RSE deja enregistrees pour cette entreprise.

```http
GET /api/v1/evaluations-rse/companies/:entrepriseId
```

Comportement attendu :

- L'API retourne toutes les evaluations RSE de l'entreprise.
- La liste est triee avec l'evaluation active en premier, puis les evaluations les plus recentes.
- Cet endpoint est accessible aux utilisateurs authentifies.
- L'interface affiche au minimum la date d'evaluation, le statut actif/inactif, le score et la note.
- L'utilisateur peut ouvrir une evaluation existante depuis la liste pour consulter ses indicateurs.

### Suppression d'une evaluation

```http
DELETE /api/v1/evaluations-rse/:id
```

Comportement attendu :

- Seul un administrateur peut supprimer une evaluation RSE.
- La suppression retire aussi les donnees rattachees a cette evaluation, notamment `LabelsEngagementsRse`, `IndicateursEnvironnementaux`, `IndicateursSociaux` et `IndicateursGouvernanceRse`.
- Apres suppression, la liste des evaluations est rechargee dans l'interface.
- Si l'evaluation supprimee etait celle affichee, l'interface affiche une autre evaluation existante ou revient a la liste des entreprises si aucune evaluation ne reste.

## 6. Contrats API attendus

### Liste des entreprises

```http
GET /api/v1/companies
```

Chaque entreprise retournee par la liste expose un resume de son evaluation RSE active :

- `activeEvaluationRse.id` : identifiant de l'evaluation active ;
- `activeEvaluationRse.score` : score de l'evaluation active ;
- `activeEvaluationRse.note` : note de l'evaluation active ;
- `activeEvaluationRse.dateEvaluation` : date de l'evaluation active.

Si aucune evaluation active n'existe, `activeEvaluationRse` vaut `null`.

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

## 7. Criteres d'acceptation

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
- Un admin peut lancer la creation d'une evaluation RSE depuis la liste des entreprises.
- Un utilisateur authentifie peut acceder a l'evaluation active d'une entreprise depuis la liste.
- Si aucune evaluation active n'existe, seul un admin peut entrer dans le flux de creation.
- Une entreprise ne peut avoir qu'une seule evaluation RSE active.
- L'ecran d'evaluation affiche l'entreprise en lecture seule.
- L'ecran d'evaluation affiche le score et la note en lecture seule.
- L'ecran d'evaluation permet d'enregistrer l'evaluation RSE.
- L'ecran d'evaluation permet d'acceder aux sections `LabelsEngagementsRse`, `IndicateursEnvironnementaux`, `IndicateursSociaux` et `IndicateursGouvernanceRse`.
- Un admin peut modifier `LabelsEngagementsRse` depuis une page separee.
- Les champs memo de `LabelsEngagementsRse` sont affiches uniquement lorsque le booleen associe vaut `true`.
- Un admin peut modifier `IndicateursEnvironnementaux` depuis une page separee.
- Les champs memo de `IndicateursEnvironnementaux` sont affiches uniquement lorsque le booleen associe vaut `true`.
- Un admin peut modifier `IndicateursSociaux` depuis une page separee.
- Les champs memo de `IndicateursSociaux` sont affiches uniquement lorsque le booleen associe vaut `true`.
- Un admin peut modifier `IndicateursGouvernanceRse` depuis une page separee.
- Les champs memo de `IndicateursGouvernanceRse` sont affiches uniquement lorsque le booleen associe vaut `true`.
- L'ecran d'evaluation propose un lien vers l'historique des evaluations existantes pour l'entreprise.
- La page d'historique affiche l'entreprise concernee et les evaluations existantes.
- Un admin peut supprimer une evaluation RSE depuis cette page d'historique.
- La navigation SPA fonctionne avec les boutons Back et Forward du navigateur.
