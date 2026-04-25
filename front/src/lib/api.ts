const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";
const AUTH_BASE_PATH = `${API_URL}/api/v1/auth`;
const COMPANIES_BASE_PATH = `${API_URL}/api/v1/companies`;
const CODE_NAF_BASE_PATH = `${API_URL}/api/v1/code-naf`;
const CATEGORIE_JURIDIQUE_BASE_PATH = `${API_URL}/api/v1/categorie-juridique`;

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
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
