import { BilanCarboneScope, MedailleEcovadis } from "@prisma/client";

import { AppError } from "../../core/errors/app-error";
import { prisma } from "../../lib/prisma";
import { calculerNote } from "../../lib/rse-scoring";

function todayDateOnly() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function toNumber(value: unknown) {
  return typeof value === "object" && value && "toNumber" in value
    ? (value as { toNumber: () => number }).toNumber()
    : Number(value);
}

function roundDecimal(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function calculateLabelsEngagementsRseScore(data: {
  aReportingRse?: boolean;
  aEvaluationEcovadis?: boolean;
  estSocieteAMission?: boolean;
  estSignataireGlobalCompact?: boolean;
}) {
  const part1 = data.aReportingRse ? 5 * 0.4 : 0;
  const part2 = data.aEvaluationEcovadis ? 5 * 0.4 : 0;
  const part3 = data.estSocieteAMission ? 5 * 0.1 : 0;
  const part4 = data.estSignataireGlobalCompact ? 5 * 0.1 : 0;

  const total = part1 + part2 + part3 + part4;

  return roundDecimal(((total + 1.25) / 6.25) * 5, 2);
}

function calculateIndicateursEnvironnementauxScore(data: {
  bilanCarbone?: boolean;
  decarbonisation?: boolean;
  qpENR?: boolean;
  iso14001?: boolean;
  iso50001?: boolean;
  recyclageDechets?: boolean;
  autresEnv?: boolean;
}) {
  const part1 = data.bilanCarbone ? 5 * 0.3 : 0;
  const part2 = data.decarbonisation ? 5 * 0.1 : 0;
  const part3 = data.qpENR ? 5 * 0.1 : 0;
  const part4 = data.iso14001 ? 5 * 0.1 : 0;
  const part5 = data.iso50001 ? 5 * 0.1 : 0;
  const part6 = data.recyclageDechets ? 5 * 0.1 : 0;
  const part7 = data.autresEnv ? 5 * 0.2 : 0;

  const total = part1 + part2 + part3 + part4 + part5 + part6 + part7;

  return roundDecimal(((total + 1.25) / 6.25) * 5, 2);
}

function calculateIndicateursSociauxScore(data: {
  iso45001?: boolean;
  ess?: boolean;
  aEvaluationQvt?: boolean;
  aLabelEmployeur?: boolean;
  aVieAssociativeLocale?: boolean;
  aEgaliteHF?: boolean;
  aAutresSocial?: boolean;
}) {
  const part1 = data.iso45001 ? 5 * 0.3 : 0;
  const part2 = data.ess ? 5 * 0.03 : 0;
  const part3 = data.aEvaluationQvt ? 5 * 0.08 : 0;
  const part4 = data.aLabelEmployeur ? 5 * 0.09 : 0;
  const part5 = data.aVieAssociativeLocale ? 5 * 0.25 : 0;
  const part6 = data.aEgaliteHF ? 5 * 0.05 : 0;
  const part7 = data.aAutresSocial ? 5 * 0.2 : 0;

  const total = part1 + part2 + part3 + part4 + part5 + part6 + part7;

  return roundDecimal(((total + 1.25) / 6.25) * 5, 2);
}

function calculateIndicateursGouvernanceRseScore(data: {
  aGouvernanceRse?: boolean;
  aEthique?: boolean;
  aEnquetesPartenaires?: boolean;
  charteAchats?: boolean;
  labelRfar?: boolean;
  certifFscPefc?: boolean;
  aAutresGouvernance?: boolean;
}) {
  const part1 = data.aGouvernanceRse ? 5 * 0.2 : 0;
  const part2 = data.aEthique ? 5 * 0.2 : 0;
  const part3 = data.aEnquetesPartenaires ? 5 * 0.15 : 0;
  const part4 = data.charteAchats ? 5 * 0.06 : 0;
  const part5 = data.labelRfar ? 5 * 0.1 : 0;
  const part6 = data.certifFscPefc ? 5 * 0.04 : 0;
  const part7 = data.aAutresGouvernance ? 5 * 0.25 : 0;

  const total = part1 + part2 + part3 + part4 + part5 + part6 + part7;

  return roundDecimal(((total + 1.25) / 6.25) * 5, 2);
}

function serializeEvaluation(evaluation: any, saved = true) {
  return {
    ...evaluation,
    saved,
    score: toNumber(evaluation.score),
    labelsEngagementsRse: evaluation.labelsEngagementsRse
      ? {
        ...evaluation.labelsEngagementsRse,
        score: toNumber(evaluation.labelsEngagementsRse.score),
      }
      : null,
    indicateursEnvironnementaux: evaluation.indicateursEnvironnementaux
      ? {
        ...evaluation.indicateursEnvironnementaux,
        score: toNumber(evaluation.indicateursEnvironnementaux.score),
      }
      : null,
    indicateursSociaux: evaluation.indicateursSociaux
      ? {
        ...evaluation.indicateursSociaux,
        score: toNumber(evaluation.indicateursSociaux.score),
      }
      : null,
    indicateursGouvernanceRse: evaluation.indicateursGouvernanceRse
      ? {
        ...evaluation.indicateursGouvernanceRse,
        score: toNumber(evaluation.indicateursGouvernanceRse.score),
      }
      : null,
  };
}

const evaluationInclude = {
  entreprise: {
    select: {
      id: true,
      raisonSociale: true,
      siret: true,
      siren: true,
      siteWeb: true,
    },
  },
  labelsEngagementsRse: true,
  indicateursEnvironnementaux: true,
  indicateursSociaux: true,
  indicateursGouvernanceRse: true,
};

const defaultEvaluationScore = 1;
const defaultEvaluationNote = calculerNote(defaultEvaluationScore);

async function updateEvaluationRseAggregateScore(id: string) {
  const evaluation = await prisma.evaluationRse.findUnique({
    where: { id },
    select: {
      labelsEngagementsRse: { select: { score: true } },
      indicateursEnvironnementaux: { select: { score: true } },
      indicateursSociaux: { select: { score: true } },
      indicateursGouvernanceRse: { select: { score: true } },
    },
  });

  if (!evaluation) {
    throw new AppError("evaluations_rse.not_found", 404);
  }

  const indicatorScores = [
    toNumber(evaluation.labelsEngagementsRse?.score ?? defaultEvaluationScore),
    toNumber(evaluation.indicateursEnvironnementaux?.score ?? defaultEvaluationScore),
    toNumber(evaluation.indicateursSociaux?.score ?? defaultEvaluationScore),
    toNumber(evaluation.indicateursGouvernanceRse?.score ?? defaultEvaluationScore),
  ];
  const score = roundDecimal(
    indicatorScores.reduce((sum, indicatorScore) => sum + indicatorScore, 0) /
      indicatorScores.length,
    2,
  );

  await prisma.evaluationRse.update({
    where: { id },
    data: {
      score,
      note: calculerNote(score),
    },
  });
}

export class EvaluationRseService {
  async getById(id: string) {
    const evaluation = await prisma.evaluationRse.findUnique({
      where: { id },
      include: evaluationInclude,
    });

    if (!evaluation) {
      throw new AppError("evaluations_rse.not_found", 404);
    }

    return serializeEvaluation(evaluation);
  }

  async listByCompany(entrepriseId: string) {
    const entreprise = await prisma.entreprise.findUnique({
      where: { id: entrepriseId },
      select: { id: true },
    });

    if (!entreprise) {
      throw new AppError("companies.not_found", 404);
    }

    const evaluations = await prisma.evaluationRse.findMany({
      where: { entrepriseId },
      include: evaluationInclude,
      orderBy: [
        { estActive: "desc" },
        { dateEvaluation: "desc" },
      ],
    });

    return evaluations.map((evaluation) => serializeEvaluation(evaluation));
  }

  async delete(id: string) {
    const evaluation = await prisma.evaluationRse.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!evaluation) {
      throw new AppError("evaluations_rse.not_found", 404);
    }

    await prisma.evaluationRse.delete({
      where: { id },
    });

    return { success: true };
  }

  async updateLabelsEngagementsRse(
    id: string,
    payload: {
      aReportingRse?: boolean;
      reportingRseDetail?: string | null;
      aEvaluationEcovadis?: boolean;
      medailleEcovadis?: MedailleEcovadis | null;
      anneeScoreEcovadis?: string | null;
      estSocieteAMission?: boolean;
      estSignataireGlobalCompact?: boolean;
      globalCompactDetail?: string | null;
    },
  ) {
    const evaluation = await prisma.evaluationRse.findUnique({
      where: { id },
      include: { labelsEngagementsRse: true },
    });

    if (!evaluation) {
      throw new AppError("evaluations_rse.not_found", 404);
    }

    const nextLabels = {
      aReportingRse:
        payload.aReportingRse ?? evaluation.labelsEngagementsRse?.aReportingRse ?? false,
      aEvaluationEcovadis:
        payload.aEvaluationEcovadis ??
        evaluation.labelsEngagementsRse?.aEvaluationEcovadis ??
        false,
      estSocieteAMission:
        payload.estSocieteAMission ??
        evaluation.labelsEngagementsRse?.estSocieteAMission ??
        false,
      estSignataireGlobalCompact:
        payload.estSignataireGlobalCompact ??
        evaluation.labelsEngagementsRse?.estSignataireGlobalCompact ??
        false,
    };
    const score = calculateLabelsEngagementsRseScore(nextLabels);
    const medailleEcovadis = nextLabels.aEvaluationEcovadis
      ? payload.medailleEcovadis ?? MedailleEcovadis.OTHER
      : MedailleEcovadis.OTHER;

    await prisma.labelsEngagementsRse.upsert({
      where: { evaluationRseId: id },
      create: {
        evaluationRseId: id,
        ...nextLabels,
        reportingRseDetail: nextLabels.aReportingRse ? payload.reportingRseDetail : null,
        medailleEcovadis,
        anneeScoreEcovadis: nextLabels.aEvaluationEcovadis
          ? payload.anneeScoreEcovadis
          : null,
        globalCompactDetail: nextLabels.estSignataireGlobalCompact
          ? payload.globalCompactDetail
          : null,
        score,
        note: calculerNote(score),
      },
      update: {
        ...nextLabels,
        reportingRseDetail: nextLabels.aReportingRse ? payload.reportingRseDetail : null,
        medailleEcovadis,
        anneeScoreEcovadis: nextLabels.aEvaluationEcovadis
          ? payload.anneeScoreEcovadis
          : null,
        globalCompactDetail: nextLabels.estSignataireGlobalCompact
          ? payload.globalCompactDetail
          : null,
        score,
        note: calculerNote(score),
      },
    });

    await updateEvaluationRseAggregateScore(id);

    return this.getById(id);
  }

  async updateIndicateursEnvironnementaux(
    id: string,
    payload: {
      bilanCarbone?: boolean;
      bilanCarboneScope?: BilanCarboneScope;
      bilanCarboneDetail?: string | null;
      decarbonisation?: boolean;
      decarbonisationDetail?: string | null;
      qpENR?: boolean;
      qpENRDetail?: string | null;
      iso14001?: boolean;
      iso14001Detail?: string | null;
      iso50001?: boolean;
      iso50001Detail?: string | null;
      recyclageDechets?: boolean;
      recyclageDechetsDetail?: string | null;
      autresEnv?: boolean;
      autresEnvDetail?: string | null;
    },
  ) {
    const evaluation = await prisma.evaluationRse.findUnique({
      where: { id },
      include: { indicateursEnvironnementaux: true },
    });

    if (!evaluation) {
      throw new AppError("evaluations_rse.not_found", 404);
    }

    const current = evaluation.indicateursEnvironnementaux;
    const nextIndicators = {
      bilanCarbone: payload.bilanCarbone ?? current?.bilanCarbone ?? false,
      decarbonisation: payload.decarbonisation ?? current?.decarbonisation ?? false,
      qpENR: payload.qpENR ?? current?.qpENR ?? false,
      iso14001: payload.iso14001 ?? current?.iso14001 ?? false,
      iso50001: payload.iso50001 ?? current?.iso50001 ?? false,
      recyclageDechets:
        payload.recyclageDechets ?? current?.recyclageDechets ?? false,
      autresEnv: payload.autresEnv ?? current?.autresEnv ?? false,
    };
    const score = calculateIndicateursEnvironnementauxScore(nextIndicators);

    await prisma.indicateursEnvironnementaux.upsert({
      where: { evaluationRseId: id },
      create: {
        evaluationRseId: id,
        ...nextIndicators,
        bilanCarboneScope: nextIndicators.bilanCarbone
          ? payload.bilanCarboneScope ?? BilanCarboneScope.NON_PRECISE
          : BilanCarboneScope.NON_PRECISE,
        bilanCarboneDetail: nextIndicators.bilanCarbone
          ? payload.bilanCarboneDetail
          : null,
        decarbonisationDetail: nextIndicators.decarbonisation
          ? payload.decarbonisationDetail
          : null,
        qpENRDetail: nextIndicators.qpENR ? payload.qpENRDetail : null,
        iso14001Detail: nextIndicators.iso14001 ? payload.iso14001Detail : null,
        iso50001Detail: nextIndicators.iso50001 ? payload.iso50001Detail : null,
        recyclageDechetsDetail: nextIndicators.recyclageDechets
          ? payload.recyclageDechetsDetail
          : null,
        autresEnvDetail: nextIndicators.autresEnv ? payload.autresEnvDetail : null,
        score,
        note: calculerNote(score),
      },
      update: {
        ...nextIndicators,
        bilanCarboneScope: nextIndicators.bilanCarbone
          ? payload.bilanCarboneScope ?? BilanCarboneScope.NON_PRECISE
          : BilanCarboneScope.NON_PRECISE,
        bilanCarboneDetail: nextIndicators.bilanCarbone
          ? payload.bilanCarboneDetail
          : null,
        decarbonisationDetail: nextIndicators.decarbonisation
          ? payload.decarbonisationDetail
          : null,
        qpENRDetail: nextIndicators.qpENR ? payload.qpENRDetail : null,
        iso14001Detail: nextIndicators.iso14001 ? payload.iso14001Detail : null,
        iso50001Detail: nextIndicators.iso50001 ? payload.iso50001Detail : null,
        recyclageDechetsDetail: nextIndicators.recyclageDechets
          ? payload.recyclageDechetsDetail
          : null,
        autresEnvDetail: nextIndicators.autresEnv ? payload.autresEnvDetail : null,
        score,
        note: calculerNote(score),
      },
    });

    await updateEvaluationRseAggregateScore(id);

    return this.getById(id);
  }

  async updateIndicateursSociaux(
    id: string,
    payload: {
      iso45001?: boolean;
      iso45001Detail?: string | null;
      ess?: boolean;
      aEvaluationQvt?: boolean;
      detailEvaluationQvt?: string | null;
      aLabelEmployeur?: boolean;
      detailLabelEmployeur?: string | null;
      aVieAssociativeLocale?: boolean;
      detailVieAssociativeLocale?: string | null;
      aEgaliteHF?: boolean;
      detailEgaliteHF?: string | null;
      aAutresSocial?: boolean;
      detailAutresSocial?: string | null;
    },
  ) {
    const evaluation = await prisma.evaluationRse.findUnique({
      where: { id },
      include: { indicateursSociaux: true },
    });

    if (!evaluation) {
      throw new AppError("evaluations_rse.not_found", 404);
    }

    const current = evaluation.indicateursSociaux;
    const nextIndicators = {
      iso45001: payload.iso45001 ?? current?.iso45001 ?? false,
      ess: payload.ess ?? current?.ess ?? false,
      aEvaluationQvt: payload.aEvaluationQvt ?? current?.aEvaluationQvt ?? false,
      aLabelEmployeur:
        payload.aLabelEmployeur ?? current?.aLabelEmployeur ?? false,
      aVieAssociativeLocale:
        payload.aVieAssociativeLocale ?? current?.aVieAssociativeLocale ?? false,
      aEgaliteHF: payload.aEgaliteHF ?? current?.aEgaliteHF ?? false,
      aAutresSocial: payload.aAutresSocial ?? current?.aAutresSocial ?? false,
    };
    const score = calculateIndicateursSociauxScore(nextIndicators);

    await prisma.indicateursSociaux.upsert({
      where: { evaluationRseId: id },
      create: {
        evaluationRseId: id,
        ...nextIndicators,
        iso45001Detail: nextIndicators.iso45001 ? payload.iso45001Detail : null,
        detailEvaluationQvt: nextIndicators.aEvaluationQvt
          ? payload.detailEvaluationQvt
          : null,
        detailLabelEmployeur: nextIndicators.aLabelEmployeur
          ? payload.detailLabelEmployeur
          : null,
        detailVieAssociativeLocale: nextIndicators.aVieAssociativeLocale
          ? payload.detailVieAssociativeLocale
          : null,
        detailEgaliteHF: nextIndicators.aEgaliteHF
          ? payload.detailEgaliteHF
          : null,
        detailAutresSocial: nextIndicators.aAutresSocial
          ? payload.detailAutresSocial
          : null,
        score,
        note: calculerNote(score),
      },
      update: {
        ...nextIndicators,
        iso45001Detail: nextIndicators.iso45001 ? payload.iso45001Detail : null,
        detailEvaluationQvt: nextIndicators.aEvaluationQvt
          ? payload.detailEvaluationQvt
          : null,
        detailLabelEmployeur: nextIndicators.aLabelEmployeur
          ? payload.detailLabelEmployeur
          : null,
        detailVieAssociativeLocale: nextIndicators.aVieAssociativeLocale
          ? payload.detailVieAssociativeLocale
          : null,
        detailEgaliteHF: nextIndicators.aEgaliteHF
          ? payload.detailEgaliteHF
          : null,
        detailAutresSocial: nextIndicators.aAutresSocial
          ? payload.detailAutresSocial
          : null,
        score,
        note: calculerNote(score),
      },
    });

    await updateEvaluationRseAggregateScore(id);

    return this.getById(id);
  }

  async updateIndicateursGouvernanceRse(
    id: string,
    payload: {
      aGouvernanceRse?: boolean;
      detailGouvernanceRse?: string | null;
      aEthique?: boolean;
      detailEthique?: string | null;
      aEnquetesPartenaires?: boolean;
      detailEnquetesPartenaires?: string | null;
      charteAchats?: boolean;
      labelRfar?: boolean;
      certifFscPefc?: boolean;
      aAutresGouvernance?: boolean;
      detailAutresGouvernance?: string | null;
    },
  ) {
    const evaluation = await prisma.evaluationRse.findUnique({
      where: { id },
      include: { indicateursGouvernanceRse: true },
    });

    if (!evaluation) {
      throw new AppError("evaluations_rse.not_found", 404);
    }

    const current = evaluation.indicateursGouvernanceRse;
    const nextIndicators = {
      aGouvernanceRse:
        payload.aGouvernanceRse ?? current?.aGouvernanceRse ?? false,
      aEthique: payload.aEthique ?? current?.aEthique ?? false,
      aEnquetesPartenaires:
        payload.aEnquetesPartenaires ?? current?.aEnquetesPartenaires ?? false,
      charteAchats: payload.charteAchats ?? current?.charteAchats ?? false,
      labelRfar: payload.labelRfar ?? current?.labelRfar ?? false,
      certifFscPefc: payload.certifFscPefc ?? current?.certifFscPefc ?? false,
      aAutresGouvernance:
        payload.aAutresGouvernance ?? current?.aAutresGouvernance ?? false,
    };
    const score = calculateIndicateursGouvernanceRseScore(nextIndicators);

    await prisma.indicateursGouvernanceRse.upsert({
      where: { evaluationRseId: id },
      create: {
        evaluationRseId: id,
        ...nextIndicators,
        detailGouvernanceRse: nextIndicators.aGouvernanceRse
          ? payload.detailGouvernanceRse
          : null,
        detailEthique: nextIndicators.aEthique ? payload.detailEthique : null,
        detailEnquetesPartenaires: nextIndicators.aEnquetesPartenaires
          ? payload.detailEnquetesPartenaires
          : null,
        detailAutresGouvernance: nextIndicators.aAutresGouvernance
          ? payload.detailAutresGouvernance
          : null,
        score,
        note: calculerNote(score),
      },
      update: {
        ...nextIndicators,
        detailGouvernanceRse: nextIndicators.aGouvernanceRse
          ? payload.detailGouvernanceRse
          : null,
        detailEthique: nextIndicators.aEthique ? payload.detailEthique : null,
        detailEnquetesPartenaires: nextIndicators.aEnquetesPartenaires
          ? payload.detailEnquetesPartenaires
          : null,
        detailAutresGouvernance: nextIndicators.aAutresGouvernance
          ? payload.detailAutresGouvernance
          : null,
        score,
        note: calculerNote(score),
      },
    });

    await updateEvaluationRseAggregateScore(id);

    return this.getById(id);
  }

  async getActive(entrepriseId: string) {
    const entreprise = await prisma.entreprise.findUnique({
      where: { id: entrepriseId },
      select: { id: true },
    });

    if (!entreprise) {
      throw new AppError("companies.not_found", 404);
    }

    const evaluation = await prisma.evaluationRse.findFirst({
      where: {
        entrepriseId,
        estActive: true,
      },
      include: evaluationInclude,
    });

    return evaluation ? serializeEvaluation(evaluation) : null;
  }

  async getCurrentDraft(entrepriseId: string) {
    const entreprise = await prisma.entreprise.findUnique({
      where: { id: entrepriseId },
      select: {
        id: true,
        raisonSociale: true,
        siret: true,
        siren: true,
        siteWeb: true,
      },
    });

    if (!entreprise) {
      throw new AppError("companies.not_found", 404);
    }

    const dateEvaluation = todayDateOnly();
    const existingEvaluation = await prisma.evaluationRse.findFirst({
      where: {
        entrepriseId,
        dateEvaluation,
      },
      include: evaluationInclude,
      orderBy: {
        id: "asc",
      },
    });

    if (existingEvaluation) {
      if (!existingEvaluation.estActive) {
        await prisma.evaluationRse.updateMany({
          where: {
            entrepriseId,
            estActive: true,
            id: { not: existingEvaluation.id },
          },
          data: { estActive: false },
        });

        const activeEvaluation = await prisma.evaluationRse.update({
          where: { id: existingEvaluation.id },
          data: { estActive: true },
          include: evaluationInclude,
        });

        return serializeEvaluation(activeEvaluation);
      }

      return serializeEvaluation(existingEvaluation);
    }

    return {
      id: null,
      saved: false,
      estActive: true,
      entrepriseId,
      entreprise,
      dateEvaluation,
      score: defaultEvaluationScore,
      note: defaultEvaluationNote,
      labelsEngagementsRse: null,
      indicateursEnvironnementaux: null,
      indicateursSociaux: null,
      indicateursGouvernanceRse: null,
    };
  }

  async saveCurrent(entrepriseId: string) {
    await this.getCurrentDraft(entrepriseId);

    const dateEvaluation = todayDateOnly();
    const existingEvaluation = await prisma.evaluationRse.findFirst({
      where: {
        entrepriseId,
        dateEvaluation,
      },
      include: evaluationInclude,
    });

    if (existingEvaluation) {
      return serializeEvaluation(existingEvaluation);
    }

    await prisma.evaluationRse.updateMany({
      where: { entrepriseId, estActive: true },
      data: { estActive: false },
    });

    const labelsEngagementsRseScore = calculateLabelsEngagementsRseScore({});
    const evaluation = await prisma.evaluationRse.create({
      data: {
        entreprise: {
          connect: { id: entrepriseId },
        },
        estActive: true,
        dateEvaluation,
        score: defaultEvaluationScore,
        note: defaultEvaluationNote,
        labelsEngagementsRse: {
          create: {
            score: labelsEngagementsRseScore,
            note: calculerNote(labelsEngagementsRseScore),
          },
        },
        indicateursEnvironnementaux: {
          create: {
            score: defaultEvaluationScore,
            note: defaultEvaluationNote,
          },
        },
        indicateursSociaux: {
          create: {
            score: defaultEvaluationScore,
            note: defaultEvaluationNote,
          },
        },
        indicateursGouvernanceRse: {
          create: {
            score: defaultEvaluationScore,
            note: defaultEvaluationNote,
          },
        },
      },
      include: evaluationInclude,
    });

    return serializeEvaluation(evaluation);
  }
}
