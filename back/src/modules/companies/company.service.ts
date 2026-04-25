import { AppError } from "../../core/errors/app-error";
import { prisma } from "../../lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import {
  createCompanySchema,
  listCompaniesSchema,
  updateCompanySchema,
} from "./company.schemas";
import { getInfoSiret } from "./company.tools";

export type CreateCompanyData = z.infer<typeof createCompanySchema>["body"];
export type UpdateCompanyData = z.infer<typeof updateCompanySchema>["body"];
export type CompanyFilters = z.infer<typeof listCompaniesSchema>["query"];

const insensitive = Prisma.QueryMode.insensitive;

function buildCompanyAddress(data: {
  addressLine1?: string;
  addressLine2?: string;
  codePostal?: string;
  ville?: string;
  pays?: string;
}) {
  const parts = [
    data.addressLine1,
    data.addressLine2,
    data.codePostal,
    data.ville,
    data.pays,
  ];

  return parts
    .filter((part): part is string => Boolean(part?.trim()))
    .map((part) => part.trim())
    .join(", ");
}

async function ensureHoldingCompanyExists(idSocieteMere: string) {
  const holdingCompany = await prisma.entreprise.findUnique({
    where: { id: idSocieteMere },
    select: { id: true },
  });

  if (!holdingCompany) {
    throw new AppError("companies.holding_not_found", 404);
  }
}

async function ensureCodeNafExists(codeNaf: string) {
  const nafCode = await prisma.codeNaf.findUnique({
    where: { code: codeNaf },
    select: { code: true },
  });

  if (!nafCode) {
    throw new AppError("companies.naf_not_found", 404);
  }
}
async function ensureCategorieJuridiqueExists(categorieJuridiqueCode: string) {
  const categorieJuridique = await prisma.categorieJuridique.findUnique({
    where: { code: categorieJuridiqueCode },
    select: { code: true },
  });

  if (!categorieJuridique) {
    throw new AppError("companies.categorie_juridique_not_found", 404);
  }
}
async function resolveCodeNaf(codeNaf: string | null) {
  if (!codeNaf) {
    return null;
  }

  return prisma.codeNaf.findFirst({
    where: {
      OR: [
        { code: { equals: codeNaf, mode: insensitive } },
        { altCode: { equals: codeNaf.replace(/\./g, ""), mode: insensitive } },
      ],
    },
    select: {
      code: true,
      title: true,
      altCode: true,
    },
  });
}

async function resolveCategorieJuridique(categorieJuridiqueCode: string | null) {
  if (!categorieJuridiqueCode) {
    return null;
  }

  return prisma.categorieJuridique.findFirst({
    where: {
      code: { equals: categorieJuridiqueCode, mode: insensitive },
    },
    select: {
      code: true,
      title: true,
    },
  });
}

async function ensureNoHoldingCycle(companyId: string, idSocieteMere: string) {
  let currentCompanyId: string | null = idSocieteMere;

  while (currentCompanyId) {
    if (currentCompanyId === companyId) {
      throw new AppError("companies.holding_cycle", 400);
    }

    const parentCompany: { idSocieteMere: string | null } | null =
      await prisma.entreprise.findUnique({
        where: { id: currentCompanyId },
        select: { idSocieteMere: true },
      });

    currentCompanyId = parentCompany?.idSocieteMere ?? null;
  }
}

const nafCodeInclude = {
  select: {
    code: true,
    title: true,
    altCode: true,
  },
} satisfies Prisma.CodeNafDefaultArgs;

const categorieJuridiqueInclude = {
  select: {
    code: true,
    title: true,
  },
} satisfies Prisma.CategorieJuridiqueDefaultArgs;

export class CompanyService {
  async create(data: CreateCompanyData) {
    if (data.idSocieteMere) {
      await ensureHoldingCompanyExists(data.idSocieteMere);
    }

    if (data.codeNaf) {
      await ensureCodeNafExists(data.codeNaf);
    }

    if (data.categorieJuridiqueCode) {
      await ensureCategorieJuridiqueExists(data.categorieJuridiqueCode);
    }

    const { idSocieteMere, codeNaf, categorieJuridiqueCode, ...rest } = data;

    return prisma.entreprise.create({
      data: {
        ...rest,
        adresse: buildCompanyAddress(data) || null,
        ...(idSocieteMere
          ? {
            societeMere: {
              connect: { id: idSocieteMere },
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
        ...(categorieJuridiqueCode
          ? {
            categorieJuridique: {
              connect: { code: categorieJuridiqueCode },
            },
          }
          : {}),
      },
      include: {
        nafCode: nafCodeInclude,
        categorieJuridique: categorieJuridiqueInclude,
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
              { raisonSociale: { contains: filters.search, mode: insensitive } },
              { adresse: { contains: filters.search, mode: insensitive } },
              { siret: { contains: filters.search, mode: insensitive } },
              { siren: { contains: filters.search, mode: insensitive } },
            ],
          }
          : {},
        filters.adresse ? { adresse: { contains: filters.adresse, mode: insensitive } } : {},
        filters.idSocieteMere ? { idSocieteMere: filters.idSocieteMere } : {},
        filters.etablissementSiege ? { etablissementSiege: filters.etablissementSiege } : {},
        filters.siret ? { siret: { contains: filters.siret, mode: insensitive } } : {},
        filters.siren ? { siren: { contains: filters.siren, mode: insensitive } } : {},
        filters.codeNaf ? { codeNaf: { equals: filters.codeNaf, mode: insensitive } } : {},
        filters.categorieJuridiqueCode ? { categorieJuridiqueCode: { equals: filters.categorieJuridiqueCode, mode: insensitive } } : {},
        filters.ville ? { ville: { equals: filters.ville, mode: insensitive } } : {},
        filters.codePostal ? { codePostal: filters.codePostal } : {},
        filters.estActive ? { estActive: filters.estActive === "true" } : {},
      ],
    } satisfies Prisma.EntrepriseWhereInput;

    const [items, total] = await Promise.all([
      prisma.entreprise.findMany({
        where,
        skip,
        take: limit,
        include: {
          nafCode: nafCodeInclude,
          categorieJuridique: categorieJuridiqueInclude,
        },
        orderBy: {
          [filters.sortBy ?? "dateCreation"]: filters.order ?? "desc",
        },
      }),
      prisma.entreprise.count({ where }),
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
    const company = await prisma.entreprise.findUnique({
      where: { id },
      include: {
        nafCode: nafCodeInclude,
        categorieJuridique: categorieJuridiqueInclude,
        societeMere: {
          select: {
            id: true,
            raisonSociale: true,
            siren: true,
            siret: true,
          },
        },
        filiales: {
          select: {
            id: true,
            raisonSociale: true,
            siren: true,
            siret: true,
          },
          orderBy: {
            raisonSociale: "asc",
          },
        },
      },
    });

    if (!company) {
      throw new AppError("companies.not_found", 404);
    }

    return company;
  }

  async update(id: string, data: UpdateCompanyData) {
    const existingCompany = await this.getById(id);
    const { idSocieteMere, codeNaf, categorieJuridiqueCode, ...rest } = data;

    if (idSocieteMere === id) {
      throw new AppError("companies.self_holding", 400);
    }

    if (idSocieteMere) {
      await ensureHoldingCompanyExists(idSocieteMere);
      await ensureNoHoldingCycle(id, idSocieteMere);
    }

    if (codeNaf) {
      await ensureCodeNafExists(codeNaf);
    }

    if (categorieJuridiqueCode) {
      await ensureCategorieJuridiqueExists(categorieJuridiqueCode);
    }

    const nextAddress = buildCompanyAddress({
      addressLine1: data.addressLine1 ?? existingCompany.addressLine1 ?? undefined,
      addressLine2: data.addressLine2 ?? existingCompany.addressLine2 ?? undefined,
      codePostal: data.codePostal ?? existingCompany.codePostal ?? undefined,
      ville: data.ville ?? existingCompany.ville ?? undefined,
      pays: data.pays ?? existingCompany.pays ?? undefined,
    });

    return prisma.entreprise.update({
      where: { id },
      data: {
        ...rest,
        adresse: nextAddress || null,
        ...(idSocieteMere === null
          ? {
            societeMere: {
              disconnect: true,
            },
          }
          : idSocieteMere
            ? {
              societeMere: {
                connect: { id: idSocieteMere },
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
        ...(categorieJuridiqueCode === null
          ? {
            categorieJuridique: {
              disconnect: true,
            },
          }
          : categorieJuridiqueCode
            ? {
              categorieJuridique: {
                connect: { code: categorieJuridiqueCode },
              },
            }
            : {}),
      },
      include: {
        nafCode: nafCodeInclude,
        categorieJuridique: categorieJuridiqueInclude,
      },
    });
  }

  async delete(id: string) {
    await this.getById(id);

    await prisma.entreprise.delete({
      where: { id },
    });

    return { success: true };
  }

  async getInfoSiret(siret: string) {
    const [existingCompany, siretInfo] = await Promise.all([
      prisma.entreprise.findUnique({
        where: { siret },
        select: {
          id: true,
          raisonSociale: true,
          siren: true,
          siret: true,
        },
      }),
      getInfoSiret(siret),
    ]);
    const nafCode = siretInfo ? await resolveCodeNaf(siretInfo.codeNaf) : null;
    const categorieJuridique = siretInfo
      ? await resolveCategorieJuridique(siretInfo.categorieJuridiqueCode)
      : null;

    if (!siretInfo && !existingCompany) {
      throw new AppError("companies.siret_not_found", 404);
    }

    return {
      exists: Boolean(existingCompany),
      existingCompany,
      company: siretInfo
        ? {
          ...siretInfo,
          codeNaf: nafCode?.code ?? siretInfo.codeNaf,
          nafCode,
          categorieJuridiqueCode:
            categorieJuridique?.code ?? siretInfo.categorieJuridiqueCode,
          categorieJuridique,
          pays: "France",
        }
        : null,
    };
  }
}
