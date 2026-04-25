import { z } from "zod";

const medailleEcovadisSchema = z.enum([
  "PLATINUM",
  "GOLD",
  "SILVER",
  "BRONZE",
  "COMMITTED",
  "FAST_MOVER",
  "OTHER",
]);

const bilanCarboneScopeSchema = z.enum([
  "NON_PRECISE",
  "SCOPE_1",
  "SCOPE_1_2",
  "SCOPE_1_2_3",
]);

export const evaluationCompanyParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    entrepriseId: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

export const evaluationIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

export const updateLabelsEngagementsRseSchema = z.object({
  body: z.object({
    aReportingRse: z.boolean().optional(),
    reportingRseDetail: z.string().max(5000).nullable().optional(),
    aEvaluationEcovadis: z.boolean().optional(),
    medailleEcovadis: medailleEcovadisSchema.nullable().optional(),
    anneeScoreEcovadis: z.string().max(5000).nullable().optional(),
    estSocieteAMission: z.boolean().optional(),
    estSignataireGlobalCompact: z.boolean().optional(),
    globalCompactDetail: z.string().max(5000).nullable().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

export const updateIndicateursEnvironnementauxSchema = z.object({
  body: z.object({
    bilanCarbone: z.boolean().optional(),
    bilanCarboneScope: bilanCarboneScopeSchema.optional(),
    bilanCarboneDetail: z.string().max(5000).nullable().optional(),
    decarbonisation: z.boolean().optional(),
    decarbonisationDetail: z.string().max(5000).nullable().optional(),
    qpENR: z.boolean().optional(),
    qpENRDetail: z.string().max(5000).nullable().optional(),
    iso14001: z.boolean().optional(),
    iso14001Detail: z.string().max(5000).nullable().optional(),
    iso50001: z.boolean().optional(),
    iso50001Detail: z.string().max(5000).nullable().optional(),
    recyclageDechets: z.boolean().optional(),
    recyclageDechetsDetail: z.string().max(5000).nullable().optional(),
    autresEnv: z.boolean().optional(),
    autresEnvDetail: z.string().max(5000).nullable().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

export const updateIndicateursSociauxSchema = z.object({
  body: z.object({
    iso45001: z.boolean().optional(),
    iso45001Detail: z.string().max(5000).nullable().optional(),
    ess: z.boolean().optional(),
    aEvaluationQvt: z.boolean().optional(),
    detailEvaluationQvt: z.string().max(5000).nullable().optional(),
    aLabelEmployeur: z.boolean().optional(),
    detailLabelEmployeur: z.string().max(5000).nullable().optional(),
    aVieAssociativeLocale: z.boolean().optional(),
    detailVieAssociativeLocale: z.string().max(5000).nullable().optional(),
    aEgaliteHF: z.boolean().optional(),
    detailEgaliteHF: z.string().max(5000).nullable().optional(),
    aAutresSocial: z.boolean().optional(),
    detailAutresSocial: z.string().max(5000).nullable().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

export const updateIndicateursGouvernanceRseSchema = z.object({
  body: z.object({
    aGouvernanceRse: z.boolean().optional(),
    detailGouvernanceRse: z.string().max(5000).nullable().optional(),
    aEthique: z.boolean().optional(),
    detailEthique: z.string().max(5000).nullable().optional(),
    aEnquetesPartenaires: z.boolean().optional(),
    detailEnquetesPartenaires: z.string().max(5000).nullable().optional(),
    charteAchats: z.boolean().optional(),
    labelRfar: z.boolean().optional(),
    certifFscPefc: z.boolean().optional(),
    aAutresGouvernance: z.boolean().optional(),
    detailAutresGouvernance: z.string().max(5000).nullable().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});
