const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";
const AUTH_BASE_PATH = `${API_URL}/api/v1/auth`;
const COMPANIES_BASE_PATH = `${API_URL}/api/v1/companies`;
const CODE_NAF_BASE_PATH = `${API_URL}/api/v1/code-naf`;
const CATEGORIE_JURIDIQUE_BASE_PATH = `${API_URL}/api/v1/categorie-juridique`;
const EVALUATIONS_RSE_BASE_PATH = `${API_URL}/api/v1/evaluations-rse`;

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
};

export type AuthUser = {
  id?: string | number;
  email?: string;
  role?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export type Company = {
  id: string;
  raisonSociale: string;
  siret: string;
  siteWeb?: string | null;
  siren?: string;
  description?: string | null;
  estActive?: boolean;
  categorieJuridiqueCode?: string | null;
  categorieJuridique?: CategorieJuridique | null;
  etablissementSiege?: "PRIMARY" | "SECONDARY" | "UNKNOWN";
  codeNaf?: string | null;
  nafCode?: CodeNaf | null;
  trancheEffectifsUniteLegale?: string | null;
  trancheEffectifsEtablissement?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  codePostal?: string | null;
  ville?: string | null;
  pays?: string | null;
  activeEvaluationRse?: {
    id: string;
    score: number;
    note: EvaluationRseNote;
    dateEvaluation: string;
  } | null;
};

export type CompanyDraft = {
  siret: string;
  siren: string | null;
  raisonSociale: string | null;
  categorieJuridiqueCode: string | null;
  categorieJuridique: CategorieJuridique | null;
  etablissementSiege: "PRIMARY" | "SECONDARY" | "UNKNOWN";
  codeNaf: string | null;
  nafCode: CodeNaf | null;
  trancheEffectifsUniteLegale: string | null;
  trancheEffectifsEtablissement: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  codePostal: string | null;
  ville: string | null;
  pays: string | null;
};

export type CreateCompanyPayload = {
  raisonSociale: string;
  siret: string;
  siren: string;
  categorieJuridiqueCode?: string;
  etablissementSiege?: "PRIMARY" | "SECONDARY" | "UNKNOWN";
  codeNaf?: string;
  trancheEffectifsUniteLegale?: string;
  trancheEffectifsEtablissement?: string;
  siteWeb?: string;
  description?: string;
  estActive?: boolean;
  addressLine1?: string;
  addressLine2?: string;
  codePostal?: string;
  ville?: string;
  pays?: string;
};

export type UpdateCompanyPayload = Partial<CreateCompanyPayload>;

export type CodeNaf = {
  code: string;
  title: string;
  altCode: string;
};

export type CategorieJuridique = {
  code: string;
  title: string;
};

export type EvaluationRseNote = "A" | "B" | "C" | "D" | "E" | "F";

export type EvaluationRse = {
  id: string | null;
  saved: boolean;
  estActive: boolean;
  entrepriseId: string;
  entreprise: Pick<Company, "id" | "raisonSociale" | "siret" | "siren" | "siteWeb">;
  dateEvaluation: string;
  score: number;
  note: EvaluationRseNote;
  labelsEngagementsRse: {
    id: string;
    score: number;
    note: EvaluationRseNote;
    aReportingRse: boolean;
    reportingRseDetail?: string | null;
    aEvaluationEcovadis: boolean;
    medailleEcovadis?: MedailleEcovadis | null;
    anneeScoreEcovadis?: string | null;
    estSocieteAMission: boolean;
    estSignataireGlobalCompact: boolean;
    globalCompactDetail?: string | null;
  } | null;
  indicateursEnvironnementaux: {
    id: string;
    score: number;
    note: EvaluationRseNote;
    bilanCarbone: boolean;
    bilanCarboneScope: BilanCarboneScope;
    bilanCarboneDetail?: string | null;
    decarbonisation: boolean;
    decarbonisationDetail?: string | null;
    qpENR: boolean;
    qpENRDetail?: string | null;
    iso14001: boolean;
    iso14001Detail?: string | null;
    iso50001: boolean;
    iso50001Detail?: string | null;
    recyclageDechets: boolean;
    recyclageDechetsDetail?: string | null;
    autresEnv: boolean;
    autresEnvDetail?: string | null;
  } | null;
  indicateursSociaux: {
    id: string;
    score: number;
    note: EvaluationRseNote;
    iso45001: boolean;
    iso45001Detail?: string | null;
    ess: boolean;
    aEvaluationQvt: boolean;
    detailEvaluationQvt?: string | null;
    aLabelEmployeur: boolean;
    detailLabelEmployeur?: string | null;
    aVieAssociativeLocale: boolean;
    detailVieAssociativeLocale?: string | null;
    aEgaliteHF: boolean;
    detailEgaliteHF?: string | null;
    aAutresSocial: boolean;
    detailAutresSocial?: string | null;
  } | null;
  indicateursGouvernanceRse: {
    id: string;
    score: number;
    note: EvaluationRseNote;
    aGouvernanceRse: boolean;
    detailGouvernanceRse?: string | null;
    aEthique: boolean;
    detailEthique?: string | null;
    aEnquetesPartenaires: boolean;
    detailEnquetesPartenaires?: string | null;
    charteAchats: boolean;
    labelRfar: boolean;
    certifFscPefc: boolean;
    aAutresGouvernance: boolean;
    detailAutresGouvernance?: string | null;
  } | null;
};

export type MedailleEcovadis =
  | "PLATINUM"
  | "GOLD"
  | "SILVER"
  | "BRONZE"
  | "COMMITTED"
  | "FAST_MOVER"
  | "OTHER";

export type BilanCarboneScope =
  | "NON_PRECISE"
  | "SCOPE_1"
  | "SCOPE_1_2"
  | "SCOPE_1_2_3";

type AuthResponse = {
  user: AuthUser;
  accessToken: string;
};

type CompaniesResponse = {
  items: Company[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type CompanySiretLookupResponse = {
  exists: boolean;
  existingCompany: Pick<Company, "id" | "raisonSociale" | "siret" | "siren"> | null;
  company: CompanyDraft | null;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const raw = await response.text();
  let data: Record<string, unknown> | null = null;

  if (raw) {
    try {
      data = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      data = { message: raw };
    }
  }

  if (!response.ok) {
    const message =
      (data?.message as string | undefined) ||
      (data?.error as string | undefined) ||
      "Une erreur est survenue.";
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export async function login(payload: { email: string; password: string }) {
  return request<AuthResponse>(`${AUTH_BASE_PATH}/login`, {
    method: "POST",
    body: payload,
  });
}

export async function register(payload: { email: string; password: string }) {
  return request<AuthResponse>(`${AUTH_BASE_PATH}/register`, {
    method: "POST",
    body: payload,
  });
}

export async function getMe(token: string) {
  return request<AuthUser>(`${AUTH_BASE_PATH}/me`, {
    method: "GET",
    token,
  });
}

export async function listCompanies(token: string, filters: { search?: string } = {}) {
  const searchParams = new URLSearchParams();

  if (filters.search?.trim()) {
    searchParams.set("search", filters.search.trim());
  }

  const query = searchParams.toString();

  return request<CompaniesResponse>(`${COMPANIES_BASE_PATH}${query ? `?${query}` : ""}`, {
    method: "GET",
    token,
  });
}

export async function lookupCompanyBySiret(token: string, siret: string) {
  return request<CompanySiretLookupResponse>(
    `${COMPANIES_BASE_PATH}/siret/${siret}`,
    {
      method: "GET",
      token,
    },
  );
}

export async function getCompany(token: string, id: string) {
  return request<Company>(`${COMPANIES_BASE_PATH}/${id}`, {
    method: "GET",
    token,
  });
}

export async function createCompany(
  token: string,
  payload: CreateCompanyPayload,
) {
  return request<Company>(`${COMPANIES_BASE_PATH}`, {
    method: "POST",
    token,
    body: payload,
  });
}

export async function updateCompany(
  token: string,
  id: string,
  payload: UpdateCompanyPayload,
) {
  return request<Company>(`${COMPANIES_BASE_PATH}/${id}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export async function autocompleteCodeNaf(
  token: string,
  query: string,
  limit = 8,
) {
  const searchParams = new URLSearchParams({
    q: query,
    limit: String(limit),
  });

  return request<CodeNaf[]>(
    `${CODE_NAF_BASE_PATH}/autocomplete?${searchParams.toString()}`,
    {
      method: "GET",
      token,
    },
  );
}

export async function autocompleteCategorieJuridique(
  token: string,
  query: string,
  limit = 8,
) {
  const searchParams = new URLSearchParams({
    q: query,
    limit: String(limit),
  });

  return request<CategorieJuridique[]>(
    `${CATEGORIE_JURIDIQUE_BASE_PATH}/autocomplete?${searchParams.toString()}`,
    {
      method: "GET",
      token,
    },
  );
}

export async function getCurrentEvaluationRse(token: string, entrepriseId: string) {
  return request<EvaluationRse>(
    `${EVALUATIONS_RSE_BASE_PATH}/companies/${entrepriseId}/current`,
    {
      method: "GET",
      token,
    },
  );
}

export async function getActiveEvaluationRse(token: string, entrepriseId: string) {
  return request<{ evaluation: EvaluationRse | null }>(
    `${EVALUATIONS_RSE_BASE_PATH}/companies/${entrepriseId}/active`,
    {
      method: "GET",
      token,
    },
  );
}

export async function getEvaluationRse(token: string, id: string) {
  return request<EvaluationRse>(`${EVALUATIONS_RSE_BASE_PATH}/${id}`, {
    method: "GET",
    token,
  });
}

export async function saveCurrentEvaluationRse(token: string, entrepriseId: string) {
  return request<EvaluationRse>(
    `${EVALUATIONS_RSE_BASE_PATH}/companies/${entrepriseId}/current`,
    {
      method: "POST",
      token,
    },
  );
}

export async function listEvaluationsRse(token: string, entrepriseId: string) {
  return request<{ items: EvaluationRse[] }>(
    `${EVALUATIONS_RSE_BASE_PATH}/companies/${entrepriseId}`,
    {
      method: "GET",
      token,
    },
  );
}

export async function deleteEvaluationRse(token: string, id: string) {
  return request<{ success: boolean }>(`${EVALUATIONS_RSE_BASE_PATH}/${id}`, {
    method: "DELETE",
    token,
  });
}

export type UpdateLabelsEngagementsRsePayload = {
  aReportingRse?: boolean;
  reportingRseDetail?: string | null;
  aEvaluationEcovadis?: boolean;
  medailleEcovadis?: MedailleEcovadis | null;
  anneeScoreEcovadis?: string | null;
  estSocieteAMission?: boolean;
  estSignataireGlobalCompact?: boolean;
  globalCompactDetail?: string | null;
};

export async function updateLabelsEngagementsRse(
  token: string,
  id: string,
  payload: UpdateLabelsEngagementsRsePayload,
) {
  return request<EvaluationRse>(
    `${EVALUATIONS_RSE_BASE_PATH}/${id}/labels-engagements-rse`,
    {
      method: "PATCH",
      token,
      body: payload,
    },
  );
}

export type UpdateIndicateursEnvironnementauxPayload = {
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
};

export async function updateIndicateursEnvironnementaux(
  token: string,
  id: string,
  payload: UpdateIndicateursEnvironnementauxPayload,
) {
  return request<EvaluationRse>(
    `${EVALUATIONS_RSE_BASE_PATH}/${id}/indicateurs-environnementaux`,
    {
      method: "PATCH",
      token,
      body: payload,
    },
  );
}

export type UpdateIndicateursSociauxPayload = {
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
};

export async function updateIndicateursSociaux(
  token: string,
  id: string,
  payload: UpdateIndicateursSociauxPayload,
) {
  return request<EvaluationRse>(
    `${EVALUATIONS_RSE_BASE_PATH}/${id}/indicateurs-sociaux`,
    {
      method: "PATCH",
      token,
      body: payload,
    },
  );
}

export type UpdateIndicateursGouvernanceRsePayload = {
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
};

export async function updateIndicateursGouvernanceRse(
  token: string,
  id: string,
  payload: UpdateIndicateursGouvernanceRsePayload,
) {
  return request<EvaluationRse>(
    `${EVALUATIONS_RSE_BASE_PATH}/${id}/indicateurs-gouvernance-rse`,
    {
      method: "PATCH",
      token,
      body: payload,
    },
  );
}
