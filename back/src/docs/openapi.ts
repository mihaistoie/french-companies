import type { OpenAPIV3 } from "openapi-types";

const bearerSecurityScheme: OpenAPIV3.SecuritySchemeObject = {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
};

const medailleEcovadisValues = [
  "PLATINUM",
  "GOLD",
  "SILVER",
  "BRONZE",
  "COMMITTED",
  "FAST_MOVER",
  "OTHER",
] as const;

const medailleEcovadisEnumNames = [
  "Platine (top 1% des entreprises)",
  "Or (top 5% des entreprises)",
  "Argent (top 15% des entreprises)",
  "Bronze (top 35% des entreprises)",
  "Engage (entreprise engagee sans medaille)",
  "Progression rapide (amelioration significative)",
  "Autre / Non classe",
] as const;

const medailleEcovadisSchema = {
  type: "string",
  enum: [...medailleEcovadisValues],
  default: "OTHER",
  "x-enumNames": [...medailleEcovadisEnumNames],
} satisfies OpenAPIV3.SchemaObject & { "x-enumNames": string[] };

const bilanCarboneScopeSchema = {
  type: "string",
  enum: ["NON_PRECISE", "SCOPE_1", "SCOPE_1_2", "SCOPE_1_2_3"],
  default: "NON_PRECISE",
  "x-enumNames": [
    "Non precise",
    "Scope 1",
    "Scope 1 et 2",
    "Scope 1, 2 et 3",
  ],
} satisfies OpenAPIV3.SchemaObject & { "x-enumNames": string[] };

const companyProperties: NonNullable<OpenAPIV3.SchemaObject["properties"]> = {
  id: { type: "string", format: "uuid" },
  raisonSociale: { type: "string", maxLength: 255 },
  categorieJuridiqueCode: { type: "string", maxLength: 4, nullable: true },
  etablissementSiege: { type: "string", enum: ["PRIMARY", "SECONDARY", "UNKNOWN"] },
  idSocieteMere: { type: "string", format: "uuid", nullable: true },
  siret: { type: "string", pattern: "^\\d{14}$" },
  siren: { type: "string", pattern: "^\\d{9}$" },
  codeNaf: { type: "string", pattern: "^\\d{2}\\.\\d{2}[A-Z]$", nullable: true },
  trancheEffectifsUniteLegale: { $ref: "#/components/schemas/WorkforceRangeCode" },
  trancheEffectifsEtablissement: { $ref: "#/components/schemas/WorkforceRangeCode" },
  siteWeb: { type: "string", format: "uri", maxLength: 2048, nullable: true },
  email: { type: "string", format: "email", maxLength: 255, nullable: true },
  telephone: { type: "string", maxLength: 32, nullable: true },
  description: { type: "string", maxLength: 5000, nullable: true },
  addressLine1: { type: "string", maxLength: 255, nullable: true },
  addressLine2: { type: "string", maxLength: 255, nullable: true },
  adresse: { type: "string", maxLength: 600, nullable: true },
  codePostal: { type: "string", maxLength: 20, nullable: true },
  ville: { type: "string", maxLength: 120, nullable: true },
  pays: { type: "string", maxLength: 120 },
  estActive: { type: "boolean" },
  dateCreation: { type: "string", format: "date-time" },
  dateMiseAJour: { type: "string", format: "date-time" },
};

export const openApiDocument: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "French Companies API",
    version: "1.0.0",
    description: "API for authentication and French company management.",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Code NAF" },
    { name: "Companies" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: bearerSecurityScheme,
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
      AuthRequest: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
        },
        required: ["email", "password"],
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              email: { type: "string", format: "email" },
              role: { type: "string", enum: ["ADMIN", "USER"] },
            },
            required: ["id", "email", "role"],
          },
          accessToken: { type: "string" },
        },
        required: ["user", "accessToken"],
      },
      UserProfile: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["ADMIN", "USER"] },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "email", "role", "createdAt"],
      },
      WorkforceRangeCode: {
        type: "string",
        enum: ["NN", "00", "01", "02", "03", "11", "12", "21", "22", "31", "32", "41", "42", "51", "52", "53"],
        nullable: true,
      },
      CompanyBase: {
        type: "object",
        properties: {
          raisonSociale: companyProperties.raisonSociale,
          categorieJuridiqueCode: companyProperties.categorieJuridiqueCode,
          etablissementSiege: companyProperties.etablissementSiege,
          idSocieteMere: companyProperties.idSocieteMere,
          siret: companyProperties.siret,
          siren: companyProperties.siren,
          codeNaf: companyProperties.codeNaf,
          trancheEffectifsUniteLegale: companyProperties.trancheEffectifsUniteLegale,
          trancheEffectifsEtablissement: companyProperties.trancheEffectifsEtablissement,
          siteWeb: companyProperties.siteWeb,
          email: companyProperties.email,
          telephone: companyProperties.telephone,
          description: companyProperties.description,
          addressLine1: companyProperties.addressLine1,
          addressLine2: companyProperties.addressLine2,
          codePostal: companyProperties.codePostal,
          ville: companyProperties.ville,
          pays: companyProperties.pays,
          estActive: companyProperties.estActive,
        },
      },
      CreateCompanyRequest: {
        allOf: [
          { $ref: "#/components/schemas/CompanyBase" },
          {
            type: "object",
            required: ["raisonSociale", "siret", "siren"],
          },
        ],
      },
      UpdateCompanyRequest: {
        allOf: [
          { $ref: "#/components/schemas/CompanyBase" },
          {
            type: "object",
            properties: {
              idSocieteMere: { type: "string", format: "uuid", nullable: true },
            },
          },
        ],
      },
      CompanySummary: {
        type: "object",
        properties: {
          id: companyProperties.id,
          raisonSociale: companyProperties.raisonSociale,
          siren: companyProperties.siren,
          siret: companyProperties.siret,
        },
        required: ["id", "raisonSociale", "siren", "siret"],
      },
      CompanySiretLookupResponse: {
        type: "object",
        properties: {
          exists: { type: "boolean" },
          existingCompany: {
            allOf: [{ $ref: "#/components/schemas/CompanySummary" }],
            nullable: true,
          },
          company: {
            allOf: [
              {
                type: "object",
                properties: {
                  siret: companyProperties.siret,
                  siren: { ...companyProperties.siren, nullable: true },
                  raisonSociale: { ...companyProperties.raisonSociale, nullable: true },
                  categorieJuridiqueCode: companyProperties.categorieJuridiqueCode,
                  categorieJuridique: {
                    allOf: [{ $ref: "#/components/schemas/CategorieJuridique" }],
                    nullable: true,
                  },
                  etablissementSiege: companyProperties.etablissementSiege,
                  codeNaf: companyProperties.codeNaf,
                  nafCode: {
                    allOf: [{ $ref: "#/components/schemas/CodeNaf" }],
                    nullable: true,
                  },
                  trancheEffectifsUniteLegale: companyProperties.trancheEffectifsUniteLegale,
                  trancheEffectifsEtablissement: companyProperties.trancheEffectifsEtablissement,
                  addressLine1: companyProperties.addressLine1,
                  addressLine2: companyProperties.addressLine2,
                  codePostal: companyProperties.codePostal,
                  ville: companyProperties.ville,
                  pays: companyProperties.pays,
                },
                required: ["siret", "trancheEffectifsUniteLegale", "trancheEffectifsEtablissement", "etablissementSiege", "pays"],
              },
            ],
            nullable: true,
          },
        },
        required: ["exists", "existingCompany", "company"],
      },
      Entreprise: {
        type: "object",
        properties: {
          ...companyProperties,
          societeMere: {
            allOf: [{ $ref: "#/components/schemas/CompanySummary" }],
            nullable: true,
          },
          nafCode: {
            allOf: [{ $ref: "#/components/schemas/CodeNaf" }],
            nullable: true,
          },
          categorieJuridique: {
            allOf: [{ $ref: "#/components/schemas/CategorieJuridique" }],
            nullable: true,
          },
          filiales: {
            type: "array",
            items: { $ref: "#/components/schemas/CompanySummary" },
          },
        },
        required: ["id", "raisonSociale", "siret", "siren", "pays", "estActive", "filiales"],
      },
      EntrepriseListResponse: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/Entreprise" },
          },
          meta: {
            type: "object",
            properties: {
              total: { type: "integer" },
              page: { type: "integer" },
              limit: { type: "integer" },
              totalPages: { type: "integer" },
            },
            required: ["total", "page", "limit", "totalPages"],
          },
        },
        required: ["items", "meta"],
      },
      CodeNaf: {
        type: "object",
        properties: {
          code: { type: "string", pattern: "^\\d{2}\\.\\d{2}[A-Z]$" },
          title: { type: "string", maxLength: 255 },
          altCode: { type: "string", pattern: "^\\d{4}[A-Z]$" },
        },
        required: ["code", "title", "altCode"],
      },
      CategorieJuridique: {
        type: "object",
        properties: {
          code: { type: "string", maxLength: 4 },
          title: { type: "string", maxLength: 256 },
        },
        required: ["code", "title"],
      },
      MedailleEcovadis: medailleEcovadisSchema,
      BilanCarboneScope: bilanCarboneScopeSchema,
      EvaluationRse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", nullable: true },
          saved: { type: "boolean" },
          estActive: { type: "boolean" },
          entrepriseId: { type: "string", format: "uuid" },
          entreprise: { $ref: "#/components/schemas/CompanySummary" },
          dateEvaluation: { type: "string", format: "date" },
          score: { type: "number", minimum: 1, maximum: 5 },
          note: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] },
          labelsEngagementsRse: {
            type: "object",
            nullable: true,
            additionalProperties: true,
            properties: {
              medailleEcovadis: { $ref: "#/components/schemas/MedailleEcovadis" },
            },
          },
          indicateursEnvironnementaux: {
            type: "object",
            nullable: true,
            additionalProperties: true,
            properties: {
              bilanCarboneScope: { $ref: "#/components/schemas/BilanCarboneScope" },
            },
          },
          indicateursSociaux: {
            type: "object",
            nullable: true,
            additionalProperties: true,
          },
          indicateursGouvernanceRse: {
            type: "object",
            nullable: true,
            additionalProperties: true,
          },
        },
        required: ["saved", "estActive", "entrepriseId", "entreprise", "dateEvaluation", "score", "note"],
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                  },
                  required: ["status"],
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "409": {
            description: "Email already in use",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Authenticate a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Authenticated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserProfile" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/code-naf/autocomplete": {
      get: {
        tags: ["Code NAF"],
        summary: "Autocomplete NAF codes by code, libelle or altCode",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "q", in: "query", required: true, schema: { type: "string", minLength: 1, maxLength: 255 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50 } },
        ],
        responses: {
          "200": {
            description: "Autocomplete results based on libelle or altCode",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/CodeNaf" },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/categorie-juridique/autocomplete": {
      get: {
        tags: ["Companies"],
        summary: "Autocomplete legal categories by code or title",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "q", in: "query", required: true, schema: { type: "string", minLength: 1, maxLength: 255 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50 } },
        ],
        responses: {
          "200": {
            description: "Autocomplete results based on legal category code or title",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/CategorieJuridique" },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/evaluations-rse/companies/{entrepriseId}/current": {
      get: {
        tags: ["Companies"],
        summary: "Get today's CSR evaluation draft for a company",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "entrepriseId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Current evaluation or unsaved draft",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EvaluationRse" },
              },
            },
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Company not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Companies"],
        summary: "Save today's CSR evaluation for a company",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "entrepriseId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "201": {
            description: "Evaluation saved",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EvaluationRse" },
              },
            },
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Company not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/evaluations-rse/companies/{entrepriseId}/active": {
      get: {
        tags: ["Companies"],
        summary: "Get active CSR evaluation for a company",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "entrepriseId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Active evaluation, or null if none exists",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    evaluation: {
                      allOf: [{ $ref: "#/components/schemas/EvaluationRse" }],
                      nullable: true,
                    },
                  },
                  required: ["evaluation"],
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/evaluations-rse/companies/{entrepriseId}": {
      get: {
        tags: ["Companies"],
        summary: "List CSR evaluations for a company",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "entrepriseId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "CSR evaluations for the company",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: { $ref: "#/components/schemas/EvaluationRse" },
                    },
                  },
                  required: ["items"],
                },
              },
            },
          },
          "404": {
            description: "Company not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/evaluations-rse/{id}": {
      get: {
        tags: ["Companies"],
        summary: "Get a CSR evaluation by id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "CSR evaluation",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EvaluationRse" },
              },
            },
          },
          "404": {
            description: "Evaluation not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Companies"],
        summary: "Delete a CSR evaluation",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Evaluation deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                  },
                  required: ["success"],
                },
              },
            },
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Evaluation not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/evaluations-rse/{id}/labels-engagements-rse": {
      patch: {
        tags: ["Companies"],
        summary: "Update CSR labels and commitments",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  aReportingRse: { type: "boolean" },
                  reportingRseDetail: { type: "string", nullable: true },
                  aEvaluationEcovadis: { type: "boolean" },
                  medailleEcovadis: { $ref: "#/components/schemas/MedailleEcovadis" },
                  anneeScoreEcovadis: { type: "string", nullable: true },
                  estSocieteAMission: { type: "boolean" },
                  estSignataireGlobalCompact: { type: "boolean" },
                  globalCompactDetail: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated CSR evaluation",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EvaluationRse" },
              },
            },
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Evaluation not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/evaluations-rse/{id}/indicateurs-environnementaux": {
      patch: {
        tags: ["Companies"],
        summary: "Update environmental indicators",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  bilanCarbone: { type: "boolean" },
                  bilanCarboneScope: { $ref: "#/components/schemas/BilanCarboneScope" },
                  bilanCarboneDetail: { type: "string", nullable: true },
                  decarbonisation: { type: "boolean" },
                  decarbonisationDetail: { type: "string", nullable: true },
                  qpENR: { type: "boolean" },
                  qpENRDetail: { type: "string", nullable: true },
                  iso14001: { type: "boolean" },
                  iso14001Detail: { type: "string", nullable: true },
                  iso50001: { type: "boolean" },
                  iso50001Detail: { type: "string", nullable: true },
                  recyclageDechets: { type: "boolean" },
                  recyclageDechetsDetail: { type: "string", nullable: true },
                  autresEnv: { type: "boolean" },
                  autresEnvDetail: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated CSR evaluation",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EvaluationRse" },
              },
            },
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Evaluation not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/evaluations-rse/{id}/indicateurs-sociaux": {
      patch: {
        tags: ["Companies"],
        summary: "Update social indicators",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  iso45001: { type: "boolean" },
                  iso45001Detail: { type: "string", nullable: true },
                  ess: { type: "boolean" },
                  aEvaluationQvt: { type: "boolean" },
                  detailEvaluationQvt: { type: "string", nullable: true },
                  aLabelEmployeur: { type: "boolean" },
                  detailLabelEmployeur: { type: "string", nullable: true },
                  aVieAssociativeLocale: { type: "boolean" },
                  detailVieAssociativeLocale: { type: "string", nullable: true },
                  aEgaliteHF: { type: "boolean" },
                  detailEgaliteHF: { type: "string", nullable: true },
                  aAutresSocial: { type: "boolean" },
                  detailAutresSocial: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated CSR evaluation",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EvaluationRse" },
              },
            },
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Evaluation not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/evaluations-rse/{id}/indicateurs-gouvernance-rse": {
      patch: {
        tags: ["Companies"],
        summary: "Update CSR governance indicators",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  aGouvernanceRse: { type: "boolean" },
                  detailGouvernanceRse: { type: "string", nullable: true },
                  aEthique: { type: "boolean" },
                  detailEthique: { type: "string", nullable: true },
                  aEnquetesPartenaires: { type: "boolean" },
                  detailEnquetesPartenaires: { type: "string", nullable: true },
                  charteAchats: { type: "boolean" },
                  labelRfar: { type: "boolean" },
                  certifFscPefc: { type: "boolean" },
                  aAutresGouvernance: { type: "boolean" },
                  detailAutresGouvernance: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated CSR evaluation",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EvaluationRse" },
              },
            },
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Evaluation not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/companies": {
      get: {
        tags: ["Companies"],
        summary: "List companies",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "search", in: "query", schema: { type: "string", maxLength: 255 } },
          { name: "adresse", in: "query", schema: { type: "string", maxLength: 600 } },
          { name: "idSocieteMere", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "etablissementSiege", in: "query", schema: { type: "string", enum: ["PRIMARY", "SECONDARY", "UNKNOWN"] } },
          { name: "siret", in: "query", schema: { type: "string", pattern: "^\\d{14}$" } },
          { name: "siren", in: "query", schema: { type: "string", pattern: "^\\d{9}$" } },
          { name: "codeNaf", in: "query", schema: { type: "string", pattern: "^\\d{2}\\.\\d{2}[A-Z]$" } },
          { name: "categorieJuridiqueCode", in: "query", schema: { type: "string", maxLength: 4 } },
          { name: "ville", in: "query", schema: { type: "string", maxLength: 120 } },
          { name: "codePostal", in: "query", schema: { type: "string", maxLength: 20 } },
          { name: "estActive", in: "query", schema: { type: "string", enum: ["true", "false"] } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["raisonSociale", "ville", "dateCreation", "dateMiseAJour"] } },
          { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
        ],
        responses: {
          "200": {
            description: "Paginated companies",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EntrepriseListResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Companies"],
        summary: "Create a company",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCompanyRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Company created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Entreprise" },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/companies/siret/{siret}": {
      get: {
        tags: ["Companies"],
        summary: "Get company draft by SIRET",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "siret",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^\\d{14}$" },
          },
        ],
        responses: {
          "200": {
            description: "Company draft from SIRENE with existing company status",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CompanySiretLookupResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "SIRET not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/companies/{id}": {
      get: {
        tags: ["Companies"],
        summary: "Get a company by id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Company details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Entreprise" },
              },
            },
          },
          "404": {
            description: "Company not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Companies"],
        summary: "Update a company",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCompanyRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Company updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Entreprise" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Companies"],
        summary: "Delete a company",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Company deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                  },
                  required: ["success"],
                },
              },
            },
          },
        },
      },
    },
  },
};
