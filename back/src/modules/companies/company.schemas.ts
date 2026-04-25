import { z } from "zod";

const sirenSchema = z
  .string()
  .regex(/^\d{9}$/, "SIREN must contain exactly 9 digits");

const siretSchema = z
  .string()
  .regex(/^\d{14}$/, "SIRET must contain exactly 14 digits");

const codeNafSchema = z
  .string()
  .regex(/^\d{2}\.\d{2}[A-Z]$/, "codeNaf must match the format 00.00A");

const raisonSocialeSchema = z.string().min(1).max(255);
const categorieJuridiqueCodeSchema = z.string().max(4);
const siteWebSchema = z.string().url().max(2048);
const emailSchema = z.string().email().max(255);
const telephoneSchema = z.string().max(32);
const descriptionSchema = z.string().max(5000);
const addressLineSchema = z.string().max(255);
const adresseSchema = z.string().max(600);
const codePostalSchema = z.string().max(20);
const villeSchema = z.string().max(120);
const paysSchema = z.string().max(120);

const workforceRangeCodeSchema = z.enum([
  "NN",
  "00",
  "01",
  "02",
  "03",
  "11",
  "12",
  "21",
  "22",
  "31",
  "32",
  "41",
  "42",
  "51",
  "52",
  "53",
]);

const etablissementSiegeSchema = z.enum([
  "PRIMARY",
  "SECONDARY",
  "UNKNOWN",
]);

export const createCompanySchema = z.object({
  body: z.object({
    raisonSociale: raisonSocialeSchema,
    categorieJuridiqueCode: categorieJuridiqueCodeSchema.optional(),
    etablissementSiege: etablissementSiegeSchema.optional(),
    idSocieteMere: z.string().nullable().optional(),
    siret: siretSchema,
    siren: sirenSchema,
    codeNaf: codeNafSchema.optional(),
    trancheEffectifsUniteLegale: workforceRangeCodeSchema.optional(),
    trancheEffectifsEtablissement: workforceRangeCodeSchema.optional(),
    siteWeb: siteWebSchema.optional(),
    email: emailSchema.optional(),
    telephone: telephoneSchema.optional(),
    description: descriptionSchema.optional(),
    addressLine1: addressLineSchema.optional(),
    addressLine2: addressLineSchema.optional(),
    codePostal: codePostalSchema.optional(),
    ville: villeSchema.optional(),
    pays: paysSchema.optional(),
    estActive: z.boolean().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateCompanySchema = z.object({
  body: createCompanySchema.shape.body.partial(),
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

export const companyIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

export const companySiretParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    siret: siretSchema,
  }),
  query: z.object({}).optional(),
});

export const listCompaniesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    search: z.string().max(255).optional(),
    adresse: adresseSchema.optional(),
    idSocieteMere: z.string().uuid().optional(),
    etablissementSiege: etablissementSiegeSchema.optional(),
    siret: siretSchema.optional(),
    siren: sirenSchema.optional(),
    codeNaf: codeNafSchema.optional(),
    categorieJuridiqueCode: categorieJuridiqueCodeSchema.optional(),
    trancheEffectifsUniteLegale: workforceRangeCodeSchema.optional(),
    trancheEffectifsEtablissement: workforceRangeCodeSchema.optional(),
    ville: villeSchema.optional(),
    codePostal: codePostalSchema.optional(),
    estActive: z
      .enum(["true", "false"])
      .optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    sortBy: z
      .enum(["raisonSociale", "ville", "dateCreation", "dateMiseAJour"])
      .optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});
