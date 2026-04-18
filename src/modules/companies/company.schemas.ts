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

const nameSchema = z.string().min(1).max(255);
const legalFormSchema = z.string().max(100);
const vatNumberSchema = z.string().max(32);
const industrySchema = z.string().max(150);
const websiteSchema = z.string().url().max(2048);
const emailSchema = z.string().email().max(255);
const phoneSchema = z.string().max(32);
const descriptionSchema = z.string().max(5000);
const addressLineSchema = z.string().max(255);
const addressSchema = z.string().max(600);
const postalCodeSchema = z.string().max(20);
const citySchema = z.string().max(120);
const regionSchema = z.string().max(120);
const countrySchema = z.string().max(120);

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

const establishmentTypeSchema = z.enum([
  "PRIMARY",
  "SECONDARY",
  "UNKNOWN",
]);

export const createCompanySchema = z.object({
  body: z.object({
    name: nameSchema,
    legalForm: legalFormSchema.optional(),
    establishmentType: establishmentTypeSchema.optional(),
    holdingCompanyId: z.string().uuid().nullable().optional(),
    siret: siretSchema,
    siren: sirenSchema,
    codeNaf: codeNafSchema.optional(),
    legalUnitWorkforceRange: workforceRangeCodeSchema.optional(),
    establishmentWorkforceRange: workforceRangeCodeSchema.optional(),
    vatNumber: vatNumberSchema.optional(),
    industry: industrySchema.optional(),
    website: websiteSchema.optional(),
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    description: descriptionSchema.optional(),
    addressLine1: addressLineSchema.optional(),
    addressLine2: addressLineSchema.optional(),
    postalCode: postalCodeSchema.optional(),
    city: citySchema.optional(),
    region: regionSchema.optional(),
    country: countrySchema.optional(),
    isActive: z.boolean().optional(),
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

export const listCompaniesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    search: z.string().max(255).optional(),
    address: addressSchema.optional(),
    holdingCompanyId: z.string().uuid().optional(),
    establishmentType: establishmentTypeSchema.optional(),
    siret: siretSchema.optional(),
    siren: sirenSchema.optional(),
    codeNaf: codeNafSchema.optional(),
    legalUnitWorkforceRange: workforceRangeCodeSchema.optional(),
    establishmentWorkforceRange: workforceRangeCodeSchema.optional(),
    city: citySchema.optional(),
    postalCode: postalCodeSchema.optional(),
    industry: industrySchema.optional(),
    isActive: z
      .enum(["true", "false"])
      .optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    sortBy: z
      .enum(["name", "city", "createdAt", "updatedAt"])
      .optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});
