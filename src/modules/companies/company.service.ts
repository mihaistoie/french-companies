import { AppError } from "../../core/errors/app-error";
import { prisma } from "../../lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import {
  createCompanySchema,
  listCompaniesSchema,
  updateCompanySchema,
} from "./company.schemas";
import { env } from "../../config/env";

export type CreateCompanyData = z.infer<typeof createCompanySchema>["body"];
export type UpdateCompanyData = z.infer<typeof updateCompanySchema>["body"];
export type CompanyFilters = z.infer<typeof listCompaniesSchema>["query"];

function buildCompanyAddress(data: {
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
}) {
  const parts = [
    data.addressLine1,
    data.addressLine2,
    data.postalCode,
    data.city,
    data.country,
  ];

  return parts
    .filter((part): part is string => Boolean(part?.trim()))
    .map((part) => part.trim())
    .join(", ");
}

async function ensureHoldingCompanyExists(holdingCompanyId: string) {
  const holdingCompany = await prisma.company.findUnique({
    where: { id: holdingCompanyId },
    select: { id: true },
  });

  if (!holdingCompany) {
    throw new AppError("Societe holding introuvable", 404);
  }
}

async function ensureCodeNafExists(codeNaf: string) {
  const nafCode = await prisma.codeNaf.findUnique({
    where: { code: codeNaf },
    select: { code: true },
  });

  if (!nafCode) {
    throw new AppError("Code NAF introuvable", 404);
  }
}

async function ensureNoHoldingCycle(companyId: string, holdingCompanyId: string) {
  let currentCompanyId: string | null = holdingCompanyId;

  while (currentCompanyId) {
    if (currentCompanyId === companyId) {
      throw new AppError("La relation de holding ne peut pas creer de cycle", 400);
    }

    const parentCompany: { holdingCompanyId: string | null } | null =
      await prisma.company.findUnique({
        where: { id: currentCompanyId },
        select: { holdingCompanyId: true },
      });

    currentCompanyId = parentCompany?.holdingCompanyId ?? null;
  }
}

const insensitive = Prisma.QueryMode.insensitive;

export class CompanyService {
  async create(data: CreateCompanyData) {
    if (data.holdingCompanyId) {
      await ensureHoldingCompanyExists(data.holdingCompanyId);
    }

    if (data.codeNaf) {
      await ensureCodeNafExists(data.codeNaf);
    }

    const { holdingCompanyId, codeNaf, ...rest } = data;

    return prisma.company.create({
      data: {
        ...rest,
        address: buildCompanyAddress(data) || null,
        ...(holdingCompanyId
          ? {
            holdingCompany: {
              connect: { id: holdingCompanyId },
            },
          }
          : {}),
        ...(codeNaf
          ? {
            nafCode: {
              connect: { code: codeNaf },
            },
          }
          : {}),
      },
    });
  }

  async list(filters: CompanyFilters) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        filters.search
          ? {
            OR: [
              { name: { contains: filters.search, mode: insensitive } },
              { address: { contains: filters.search, mode: insensitive } },
              { siret: { contains: filters.search, mode: insensitive } },
              { siren: { contains: filters.search, mode: insensitive } },
            ],
          }
          : {},
        filters.address ? { address: { contains: filters.address, mode: insensitive } } : {},
        filters.holdingCompanyId ? { holdingCompanyId: filters.holdingCompanyId } : {},
        filters.establishmentType ? { establishmentType: filters.establishmentType } : {},
        filters.siret ? { siret: { contains: filters.siret, mode: insensitive } } : {},
        filters.siren ? { siren: { contains: filters.siren, mode: insensitive } } : {},
        filters.codeNaf ? { codeNaf: { equals: filters.codeNaf, mode: insensitive } } : {},
        filters.city ? { city: { equals: filters.city, mode: insensitive } } : {},
        filters.postalCode ? { postalCode: filters.postalCode } : {},
        filters.isActive ? { isActive: filters.isActive === "true" } : {},
      ],
    } satisfies Prisma.CompanyWhereInput;

    const [items, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [filters.sortBy ?? "createdAt"]: filters.order ?? "desc",
        },
      }),
      prisma.company.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        nafCode: {
          select: {
            code: true,
            title: true,
            altCode: true,
          },
        },
        holdingCompany: {
          select: {
            id: true,
            name: true,
            siren: true,
            siret: true,
          },
        },
        subsidiaries: {
          select: {
            id: true,
            name: true,
            siren: true,
            siret: true,
          },
          orderBy: {
            name: "asc",
          },
        },
      },
    });

    if (!company) {
      throw new AppError("Entreprise introuvable", 404);
    }

    return company;
  }

  async update(id: string, data: UpdateCompanyData) {
    const existingCompany = await this.getById(id);
    const { holdingCompanyId, codeNaf, ...rest } = data;

    if (holdingCompanyId === id) {
      throw new AppError("Une entreprise ne peut pas etre son propre holding", 400);
    }

    if (holdingCompanyId) {
      await ensureHoldingCompanyExists(holdingCompanyId);
      await ensureNoHoldingCycle(id, holdingCompanyId);
    }

    if (codeNaf) {
      await ensureCodeNafExists(codeNaf);
    }

    const nextAddress = buildCompanyAddress({
      addressLine1: data.addressLine1 ?? existingCompany.addressLine1 ?? undefined,
      addressLine2: data.addressLine2 ?? existingCompany.addressLine2 ?? undefined,
      postalCode: data.postalCode ?? existingCompany.postalCode ?? undefined,
      city: data.city ?? existingCompany.city ?? undefined,
      country: data.country ?? existingCompany.country ?? undefined,
    });

    return prisma.company.update({
      where: { id },
      data: {
        ...rest,
        address: nextAddress || null,
        ...(holdingCompanyId === null
          ? {
            holdingCompany: {
              disconnect: true,
            },
          }
          : holdingCompanyId
            ? {
              holdingCompany: {
                connect: { id: holdingCompanyId },
              },
            }
            : {}),
        ...(codeNaf === null
          ? {
            nafCode: {
              disconnect: true,
            },
          }
          : codeNaf
            ? {
              nafCode: {
                connect: { code: codeNaf },
              },
            }
            : {}),
      },
    });
  }

  async delete(id: string) {
    await this.getById(id);

    await prisma.company.delete({
      where: { id },
    });

    return { success: true };
  }
  async getInfoSiret(siret: string) {
    if (!env.API_SIREN_KEY) return null;
    try {
      const res = await fetch(`https://api.insee.fr/api-sirene/3.11/siret/${siret}?masquerValeursNulles=true`, {
        headers: {
          'X-INSEE-Api-Key-Integration': env.API_SIREN_KEY,
          Accept: 'application/json',
        }
      });
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      if (!data) return null;
      // determinere 
      const adresseEtablissement = data.adresseEtablissement;
      let postalCode: string | null = null;
      let city: string | null = null;
      let addressLine2: string | null = null;
      let addressLine1: string | null = null;
      let name: string | null = null;
      let siren: string | null = null;
      let codeNaf: string | null = null;
      let legalForm: string | null = null;
      let legalUnitWorkforceRange = 'NN';
      let establishmentWorkforceRange = 'NN';
      let establishmentType = 'PRIMARY';

      const adresse: string[] = [];

      const info = data.etablissement;
      if (info) {
        siren = info.siren;
        establishmentWorkforceRange = info.trancheEffectifsEtablissement || establishmentWorkforceRange;
        if (!info.etablissementSiege) {
          establishmentType = 'SECONDARY';
        }
        const uniteLegale = info.uniteLegale;
        if (uniteLegale) {
          if (uniteLegale.denominationUniteLegale && uniteLegale.denominationUniteLegale !== '[ND]')
            name = uniteLegale.denominationUniteLegale;
          if (uniteLegale.activitePrincipaleUniteLegale && uniteLegale.activitePrincipaleUniteLegale !== '[ND]')
            codeNaf = uniteLegale.activitePrincipaleUniteLegale;
          if (uniteLegale.categorieJuridiqueUniteLegale && uniteLegale.categorieJuridiqueUniteLegale !== '[ND]')
            legalForm = uniteLegale.categorieJuridiqueUniteLegale;
          if (uniteLegale.trancheEffectifsUniteLegale && uniteLegale.trancheEffectifsUniteLegale !== '[ND]')
            legalUnitWorkforceRange = uniteLegale.trancheEffectifsUniteLegale;

        }
      }
      if (info.activitePrincipaleNAF25Etablissement && info.activitePrincipaleNAF25Etablissement !== '[ND]') {
        codeNaf = info.activitePrincipaleNAF25Etablissement;
      }
      if (adresseEtablissement) {
        if (adresseEtablissement.numeroVoieEtablissement && adresseEtablissement.numeroVoieEtablissement !== '[ND]')
          adresse.push(adresseEtablissement.numeroVoieEtablissement);
        if (adresseEtablissement.typeVoieEtablissement && adresseEtablissement.typeVoieEtablissement !== '[ND]')
          adresse.push(adresseEtablissement.typeVoieEtablissement);
        if (adresseEtablissement.libelleVoieEtablissement && adresseEtablissement.libelleVoieEtablissement !== '[ND]')
          adresse.push(adresseEtablissement.libelleVoieEtablissement);
        if (adresse.length) {
          addressLine1 = adresse.join(' ');
        }

        if (adresseEtablissement.complementAdresseEtablissement && adresseEtablissement.complementAdresseEtablissement !== '[ND]')
          addressLine2 = adresseEtablissement.complementAdresseEtablissement;
        if (adresseEtablissement.codePostalEtablissement && adresseEtablissement.codePostalEtablissement !== '[ND]')
          postalCode = adresseEtablissement.codePostalEtablissement;
        if (adresseEtablissement.codePostalEtablissement && adresseEtablissement.codePostalEtablissement !== '[ND]')
          city = adresseEtablissement.codePostalEtablissement;
      }

      return {
        siret,
        siren,
        legalUnitWorkforceRange,
        establishmentWorkforceRange,
        postalCode,
        city,
        addressLine1,
        addressLine2,
        name,
        codeNaf,
        legalForm,
        establishmentType,
      };
    } catch {
      return null;
    }
  }
}
