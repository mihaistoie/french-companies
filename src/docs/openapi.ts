import type { OpenAPIV3 } from "openapi-types";

const bearerSecurityScheme: OpenAPIV3.SecuritySchemeObject = {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
};

const companyProperties: NonNullable<OpenAPIV3.SchemaObject["properties"]> = {
  id: { type: "string", format: "uuid" },
  name: { type: "string", maxLength: 255 },
  legalForm: { type: "string", maxLength: 100, nullable: true },
  establishmentType: { type: "string", enum: ["PRIMARY", "SECONDARY", "UNKNOWN"] },
  holdingCompanyId: { type: "string", format: "uuid", nullable: true },
  siret: { type: "string", pattern: "^\\d{14}$" },
  siren: { type: "string", pattern: "^\\d{9}$" },
  codeNaf: { type: "string", pattern: "^\\d{2}\\.\\d{2}[A-Z]$", nullable: true },
  legalUnitWorkforceRange: { $ref: "#/components/schemas/WorkforceRangeCode" },
  establishmentWorkforceRange: { $ref: "#/components/schemas/WorkforceRangeCode" },
  vatNumber: { type: "string", maxLength: 32, nullable: true },
  industry: { type: "string", maxLength: 150, nullable: true },
  website: { type: "string", format: "uri", maxLength: 2048, nullable: true },
  email: { type: "string", format: "email", maxLength: 255, nullable: true },
  phone: { type: "string", maxLength: 32, nullable: true },
  description: { type: "string", maxLength: 5000, nullable: true },
  addressLine1: { type: "string", maxLength: 255, nullable: true },
  addressLine2: { type: "string", maxLength: 255, nullable: true },
  address: { type: "string", maxLength: 600, nullable: true },
  postalCode: { type: "string", maxLength: 20, nullable: true },
  city: { type: "string", maxLength: 120, nullable: true },
  region: { type: "string", maxLength: 120, nullable: true },
  country: { type: "string", maxLength: 120 },
  isActive: { type: "boolean" },
  createdAt: { type: "string", format: "date-time" },
  updatedAt: { type: "string", format: "date-time" },
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
          name: companyProperties.name,
          legalForm: companyProperties.legalForm,
          establishmentType: companyProperties.establishmentType,
          holdingCompanyId: companyProperties.holdingCompanyId,
          siret: companyProperties.siret,
          siren: companyProperties.siren,
          codeNaf: companyProperties.codeNaf,
          legalUnitWorkforceRange: companyProperties.legalUnitWorkforceRange,
          establishmentWorkforceRange: companyProperties.establishmentWorkforceRange,
          vatNumber: companyProperties.vatNumber,
          industry: companyProperties.industry,
          website: companyProperties.website,
          email: companyProperties.email,
          phone: companyProperties.phone,
          description: companyProperties.description,
          addressLine1: companyProperties.addressLine1,
          addressLine2: companyProperties.addressLine2,
          postalCode: companyProperties.postalCode,
          city: companyProperties.city,
          region: companyProperties.region,
          country: companyProperties.country,
          isActive: companyProperties.isActive,
        },
      },
      CreateCompanyRequest: {
        allOf: [
          { $ref: "#/components/schemas/CompanyBase" },
          {
            type: "object",
            required: ["name", "siret", "siren"],
          },
        ],
      },
      UpdateCompanyRequest: {
        allOf: [
          { $ref: "#/components/schemas/CompanyBase" },
          {
            type: "object",
            properties: {
              holdingCompanyId: { type: "string", format: "uuid", nullable: true },
            },
          },
        ],
      },
      CompanySummary: {
        type: "object",
        properties: {
          id: companyProperties.id,
          name: companyProperties.name,
          siren: companyProperties.siren,
          siret: companyProperties.siret,
        },
        required: ["id", "name", "siren", "siret"],
      },
      Company: {
        type: "object",
        properties: {
          ...companyProperties,
          holdingCompany: {
            allOf: [{ $ref: "#/components/schemas/CompanySummary" }],
            nullable: true,
          },
          subsidiaries: {
            type: "array",
            items: { $ref: "#/components/schemas/CompanySummary" },
          },
        },
        required: ["id", "name", "siret", "siren", "country", "isActive", "subsidiaries"],
      },
      CompanyListResponse: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/Company" },
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
      CodeNafListResponse: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/CodeNaf" },
          },
          meta: {
            type: "object",
            properties: {
              total: { type: "integer" },
              limit: { type: "integer" },
            },
            required: ["total", "limit"],
          },
        },
        required: ["items", "meta"],
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
    "/api/v1/code-naf": {
      get: {
        tags: ["Code NAF"],
        summary: "List NAF codes",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "search", in: "query", schema: { type: "string", maxLength: 255 } },
          { name: "code", in: "query", schema: { type: "string", pattern: "^\\d{2}\\.\\d{2}[A-Z]$" } },
          { name: "altCode", in: "query", schema: { type: "string", pattern: "^\\d{4}[A-Z]$" } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
        ],
        responses: {
          "200": {
            description: "NAF codes list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CodeNafListResponse" },
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
        summary: "Autocomplete NAF codes",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "q", in: "query", required: true, schema: { type: "string", minLength: 1, maxLength: 255 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50 } },
        ],
        responses: {
          "200": {
            description: "Autocomplete results",
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
    "/api/v1/companies": {
      get: {
        tags: ["Companies"],
        summary: "List companies",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "search", in: "query", schema: { type: "string", maxLength: 255 } },
          { name: "address", in: "query", schema: { type: "string", maxLength: 600 } },
          { name: "holdingCompanyId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "establishmentType", in: "query", schema: { type: "string", enum: ["PRIMARY", "SECONDARY", "UNKNOWN"] } },
          { name: "siret", in: "query", schema: { type: "string", pattern: "^\\d{14}$" } },
          { name: "siren", in: "query", schema: { type: "string", pattern: "^\\d{9}$" } },
          { name: "codeNaf", in: "query", schema: { type: "string", pattern: "^\\d{2}\\.\\d{2}[A-Z]$" } },
          { name: "city", in: "query", schema: { type: "string", maxLength: 120 } },
          { name: "postalCode", in: "query", schema: { type: "string", maxLength: 20 } },
          { name: "industry", in: "query", schema: { type: "string", maxLength: 150 } },
          { name: "isActive", in: "query", schema: { type: "string", enum: ["true", "false"] } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["name", "city", "createdAt", "updatedAt"] } },
          { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
        ],
        responses: {
          "200": {
            description: "Paginated companies",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CompanyListResponse" },
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
                schema: { $ref: "#/components/schemas/Company" },
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
                schema: { $ref: "#/components/schemas/Company" },
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
                schema: { $ref: "#/components/schemas/Company" },
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
