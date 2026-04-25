import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  ExternalLink,
  Globe2,
  LoaderCircle,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  X,
} from "lucide-react";
import { ErrorMessage } from "@/components/common/error-message";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ApiError,
  autocompleteCategorieJuridique,
  autocompleteCodeNaf,
  createCompany,
  listCompanies,
  lookupCompanyBySiret,
  updateCompany,
  type AuthUser,
  type CategorieJuridique,
  type CodeNaf,
  type Company,
  type CompanyDraft,
  type CreateCompanyPayload,
  type UpdateCompanyPayload,
} from "@/lib/api";
import { type Locale, getTranslation } from "@/lib/translations";

type CompaniesPageProps = {
  locale: Locale;
  token: string;
  user: AuthUser;
  onLocaleChange: (locale: Locale) => void;
  onLogout: () => void;
};

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }

  return "Une erreur inattendue est survenue.";
}

function formatWebsite(siteWeb?: string | null) {
  if (!siteWeb) {
    return "";
  }

  try {
    const url = new URL(siteWeb);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return siteWeb;
  }
}

type CompanyFormValues = {
  siret: string;
  siren: string;
  raisonSociale: string;
  siteWeb: string;
  description: string;
  estActive: boolean;
  categorieJuridiqueCode: string;
  codeNaf: string;
  addressLine1: string;
  addressLine2: string;
  codePostal: string;
  ville: string;
  pays: string;
  etablissementSiege: "PRIMARY" | "SECONDARY" | "UNKNOWN";
  trancheEffectifsUniteLegale: string;
  trancheEffectifsEtablissement: string;
};

const emptyForm: CompanyFormValues = {
  siret: "",
  siren: "",
  raisonSociale: "",
  siteWeb: "",
  description: "",
  estActive: true,
  categorieJuridiqueCode: "",
  codeNaf: "",
  addressLine1: "",
  addressLine2: "",
  codePostal: "",
  ville: "",
  pays: "France",
  etablissementSiege: "UNKNOWN",
  trancheEffectifsUniteLegale: "NN",
  trancheEffectifsEtablissement: "NN",
};

function valueOrEmpty(value?: string | null) {
  return value ?? "";
}

const workforceRangeOptions = {
  fr: [
    { value: "NN", label: "Unite non employeuse" },
    { value: "00", label: "0 salarie" },
    { value: "01", label: "1 ou 2 salaries" },
    { value: "02", label: "3 a 5 salaries" },
    { value: "03", label: "6 a 9 salaries" },
    { value: "11", label: "10 a 19 salaries" },
    { value: "12", label: "20 a 49 salaries" },
    { value: "21", label: "50 a 99 salaries" },
    { value: "22", label: "100 a 199 salaries" },
    { value: "31", label: "200 a 249 salaries" },
    { value: "32", label: "250 a 499 salaries" },
    { value: "41", label: "500 a 999 salaries" },
    { value: "42", label: "1 000 a 1 999 salaries" },
    { value: "51", label: "2 000 a 4 999 salaries" },
    { value: "52", label: "5 000 a 9 999 salaries" },
    { value: "53", label: "10 000 salaries et plus" },
  ],
  en: [
    { value: "NN", label: "Non-employing unit" },
    { value: "00", label: "0 employees" },
    { value: "01", label: "1 or 2 employees" },
    { value: "02", label: "3 to 5 employees" },
    { value: "03", label: "6 to 9 employees" },
    { value: "11", label: "10 to 19 employees" },
    { value: "12", label: "20 to 49 employees" },
    { value: "21", label: "50 to 99 employees" },
    { value: "22", label: "100 to 199 employees" },
    { value: "31", label: "200 to 249 employees" },
    { value: "32", label: "250 to 499 employees" },
    { value: "41", label: "500 to 999 employees" },
    { value: "42", label: "1,000 to 1,999 employees" },
    { value: "51", label: "2,000 to 4,999 employees" },
    { value: "52", label: "5,000 to 9,999 employees" },
    { value: "53", label: "10,000 employees or more" },
  ],
} as const;

const establishmentOptions = {
  fr: [
    { value: "UNKNOWN", label: "Inconnu" },
    { value: "PRIMARY", label: "Etablissement principal" },
    { value: "SECONDARY", label: "Etablissement secondaire" },
  ],
  en: [
    { value: "UNKNOWN", label: "Unknown" },
    { value: "PRIMARY", label: "Primary establishment" },
    { value: "SECONDARY", label: "Secondary establishment" },
  ],
} as const;

const controlClassName =
  "flex min-h-11 w-full rounded-xl border border-input bg-background/70 px-4 py-2 text-sm shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

function compactPayload(
  values: CompanyFormValues,
): CreateCompanyPayload | UpdateCompanyPayload {
  const payload: CreateCompanyPayload = {
    raisonSociale: values.raisonSociale.trim(),
    siret: values.siret,
    siren: values.siren,
    etablissementSiege: values.etablissementSiege,
    estActive: values.estActive,
  };

  const optionalFields = [
    "siteWeb",
    "description",
    "categorieJuridiqueCode",
    "codeNaf",
    "addressLine1",
    "addressLine2",
    "codePostal",
    "ville",
    "pays",
    "trancheEffectifsUniteLegale",
    "trancheEffectifsEtablissement",
  ] as const;

  optionalFields.forEach((field) => {
    const value = values[field].trim();

    if (value) {
      payload[field] = value;
    }
  });

  return payload;
}

function companyToFormValues(company: Company): CompanyFormValues {
  return {
    siret: company.siret,
    siren: valueOrEmpty(company.siren),
    raisonSociale: company.raisonSociale,
    siteWeb: valueOrEmpty(company.siteWeb),
    description: valueOrEmpty(company.description),
    estActive: company.estActive ?? true,
    categorieJuridiqueCode: valueOrEmpty(company.categorieJuridiqueCode),
    codeNaf: valueOrEmpty(company.codeNaf),
    addressLine1: valueOrEmpty(company.addressLine1),
    addressLine2: valueOrEmpty(company.addressLine2),
    codePostal: valueOrEmpty(company.codePostal),
    ville: valueOrEmpty(company.ville),
    pays: valueOrEmpty(company.pays) || "France",
    etablissementSiege: company.etablissementSiege ?? "UNKNOWN",
    trancheEffectifsUniteLegale:
      valueOrEmpty(company.trancheEffectifsUniteLegale) || "NN",
    trancheEffectifsEtablissement:
      valueOrEmpty(company.trancheEffectifsEtablissement) || "NN",
  };
}

function draftToFormValues(draft: CompanyDraft, current: CompanyFormValues) {
  return {
    ...current,
    siret: draft.siret,
    siren: valueOrEmpty(draft.siren),
    raisonSociale: valueOrEmpty(draft.raisonSociale),
    description: current.description,
    estActive: current.estActive,
    categorieJuridiqueCode: valueOrEmpty(
      draft.categorieJuridique?.code ?? draft.categorieJuridiqueCode,
    ),
    codeNaf: valueOrEmpty(draft.nafCode?.code ?? draft.codeNaf),
    addressLine1: valueOrEmpty(draft.addressLine1),
    addressLine2: valueOrEmpty(draft.addressLine2),
    codePostal: valueOrEmpty(draft.codePostal),
    ville: valueOrEmpty(draft.ville),
    pays: valueOrEmpty(draft.pays) || "France",
    etablissementSiege: draft.etablissementSiege,
    trancheEffectifsUniteLegale:
      valueOrEmpty(draft.trancheEffectifsUniteLegale) || "NN",
    trancheEffectifsEtablissement:
      valueOrEmpty(draft.trancheEffectifsEtablissement) || "NN",
  };
}

function CompanyForm({
  locale,
  token,
  company,
  onSaved,
  onCancel,
}: {
  locale: Locale;
  token: string;
  company?: Company | null;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}) {
  const t = getTranslation(locale);
  const isEditing = Boolean(company);
  const initialValues = company ? companyToFormValues(company) : emptyForm;
  const initialNaf = company?.nafCode ?? null;
  const initialCategorieJuridique = company?.categorieJuridique ?? null;
  const [values, setValues] = useState<CompanyFormValues>(initialValues);
  const [lastLookupSiret, setLastLookupSiret] = useState(
    company?.siret ?? "",
  );
  const [lookupState, setLookupState] = useState<
    "idle" | "loading" | "success" | "existing" | "missing"
  >("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nafQuery, setNafQuery] = useState(
    initialNaf?.title ?? initialValues.codeNaf,
  );
  const [nafResults, setNafResults] = useState<CodeNaf[]>([]);
  const [selectedNaf, setSelectedNaf] = useState<CodeNaf | null>(initialNaf);
  const [isSearchingNaf, setIsSearchingNaf] = useState(false);
  const [categorieJuridiqueQuery, setCategorieJuridiqueQuery] = useState(
    initialCategorieJuridique?.title ?? initialValues.categorieJuridiqueCode,
  );
  const [categorieJuridiqueResults, setCategorieJuridiqueResults] = useState<
    CategorieJuridique[]
  >([]);
  const [selectedCategorieJuridique, setSelectedCategorieJuridique] =
    useState<CategorieJuridique | null>(initialCategorieJuridique);
  const [isSearchingCategorieJuridique, setIsSearchingCategorieJuridique] =
    useState(false);

  const cleanSiret = values.siret.replace(/\D/g, "");
  const cleanSiren = values.siren.replace(/\D/g, "");
  const isExisting = lookupState === "existing";
  const establishmentLabels = establishmentOptions[locale];
  const workforceRangeLabels = workforceRangeOptions[locale];

  const resolveNafTitle = useCallback(
    async (codeNaf: string) => {
      if (!codeNaf.trim()) {
        setSelectedNaf(null);
        setNafQuery("");
        return;
      }

      try {
        const results = await autocompleteCodeNaf(token, codeNaf, 1);
        const exactMatch = results.find((naf) => naf.code === codeNaf);
        const nextNaf = exactMatch ?? results[0] ?? null;

        setSelectedNaf(nextNaf);
        setNafQuery(nextNaf ? nextNaf.title : codeNaf);
      } catch {
        setSelectedNaf(null);
        setNafQuery(codeNaf);
      }
    },
    [token],
  );

  const resolveCategorieJuridiqueTitle = useCallback(
    async (categorieJuridiqueCode: string) => {
      if (!categorieJuridiqueCode.trim()) {
        setSelectedCategorieJuridique(null);
        setCategorieJuridiqueQuery("");
        return;
      }

      try {
        const results = await autocompleteCategorieJuridique(
          token,
          categorieJuridiqueCode,
          1,
        );
        const exactMatch = results.find(
          (categorieJuridique) =>
            categorieJuridique.code === categorieJuridiqueCode,
        );
        const nextCategorieJuridique = exactMatch ?? results[0] ?? null;

        setSelectedCategorieJuridique(nextCategorieJuridique);
        setCategorieJuridiqueQuery(
          nextCategorieJuridique
            ? nextCategorieJuridique.title
            : categorieJuridiqueCode,
        );
      } catch {
        setSelectedCategorieJuridique(null);
        setCategorieJuridiqueQuery(categorieJuridiqueCode);
      }
    },
    [token],
  );

  const updateField = (
    field: keyof CompanyFormValues,
    value: string,
  ) => {
    const nextValue =
      field === "siret" || field === "siren" ? value.replace(/\D/g, "") : value;

    setValues((current) => ({
      ...current,
      [field]: nextValue,
    }));
  };

  const selectNaf = (naf: CodeNaf) => {
    setSelectedNaf(naf);
    setNafQuery(naf.title);
    setNafResults([]);
    updateField("codeNaf", naf.code);
  };

  const selectCategorieJuridique = (
    categorieJuridique: CategorieJuridique,
  ) => {
    setSelectedCategorieJuridique(categorieJuridique);
    setCategorieJuridiqueQuery(categorieJuridique.title);
    setCategorieJuridiqueResults([]);
    updateField("categorieJuridiqueCode", categorieJuridique.code);
  };

  const lookupSiret = useCallback(
    async (siret: string) => {
      setLookupState("loading");
      setError(null);
      setMessage(null);

      try {
        const result = await lookupCompanyBySiret(token, siret);

        if (result.company) {
          setValues((current) => draftToFormValues(result.company!, current));

          if (result.company.nafCode) {
            setSelectedNaf(result.company.nafCode);
            setNafQuery(result.company.nafCode.title);
          } else if (result.company.codeNaf) {
            void resolveNafTitle(result.company.codeNaf);
          }

          if (result.company.categorieJuridique) {
            setSelectedCategorieJuridique(result.company.categorieJuridique);
            setCategorieJuridiqueQuery(
              result.company.categorieJuridique.title,
            );
          } else if (result.company.categorieJuridiqueCode) {
            void resolveCategorieJuridiqueTitle(
              result.company.categorieJuridiqueCode,
            );
          }
        }

        if (result.exists && result.existingCompany?.id !== company?.id) {
          setLookupState("existing");
          setMessage(t.companies.lookupExisting);
        } else if (result.company) {
          setLookupState("success");
          setMessage(t.companies.lookupSuccess);
        } else {
          setLookupState("missing");
          setMessage(t.companies.lookupMissing);
        }
      } catch (error) {
        setLookupState("missing");
        setMessage(t.companies.lookupMissing);
        setError(getErrorMessage(error));
      }
    },
    [
      t.companies.lookupExisting,
      t.companies.lookupMissing,
      t.companies.lookupSuccess,
      company?.id,
      resolveNafTitle,
      resolveCategorieJuridiqueTitle,
      token,
    ],
  );

  useEffect(() => {
    if (initialNaf) {
      setSelectedNaf(initialNaf);
      setNafQuery(initialNaf.title);
      return;
    }

    if (initialValues.codeNaf) {
      void resolveNafTitle(initialValues.codeNaf);
    }
  }, [initialNaf, initialValues.codeNaf, resolveNafTitle]);

  useEffect(() => {
    if (initialCategorieJuridique) {
      setSelectedCategorieJuridique(initialCategorieJuridique);
      setCategorieJuridiqueQuery(initialCategorieJuridique.title);
      return;
    }

    if (initialValues.categorieJuridiqueCode) {
      void resolveCategorieJuridiqueTitle(
        initialValues.categorieJuridiqueCode,
      );
    }
  }, [
    initialCategorieJuridique,
    initialValues.categorieJuridiqueCode,
    resolveCategorieJuridiqueTitle,
  ]);

  useEffect(() => {
    const query = nafQuery.trim();

    if (query.length < 2 || query === selectedNaf?.title) {
      setNafResults([]);
      setIsSearchingNaf(false);
      return;
    }

    let isActive = true;
    setIsSearchingNaf(true);

    const timeoutId = window.setTimeout(() => {
      autocompleteCodeNaf(token, query)
        .then((results) => {
          if (isActive) {
            setNafResults(results);
          }
        })
        .catch(() => {
          if (isActive) {
            setNafResults([]);
          }
        })
        .finally(() => {
          if (isActive) {
            setIsSearchingNaf(false);
          }
        });
    }, 250);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [nafQuery, selectedNaf?.title, token]);

  useEffect(() => {
    const query = categorieJuridiqueQuery.trim();

    if (query.length < 2 || query === selectedCategorieJuridique?.title) {
      setCategorieJuridiqueResults([]);
      setIsSearchingCategorieJuridique(false);
      return;
    }

    let isActive = true;
    setIsSearchingCategorieJuridique(true);

    const timeoutId = window.setTimeout(() => {
      autocompleteCategorieJuridique(token, query)
        .then((results) => {
          if (isActive) {
            setCategorieJuridiqueResults(results);
          }
        })
        .catch(() => {
          if (isActive) {
            setCategorieJuridiqueResults([]);
          }
        })
        .finally(() => {
          if (isActive) {
            setIsSearchingCategorieJuridique(false);
          }
        });
    }, 250);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [
    categorieJuridiqueQuery,
    selectedCategorieJuridique?.title,
    token,
  ]);

  useEffect(() => {
    if (cleanSiret.length !== 14 || cleanSiret === lastLookupSiret) {
      return;
    }

    setLastLookupSiret(cleanSiret);
    void lookupSiret(cleanSiret);
  }, [cleanSiret, lastLookupSiret, lookupSiret]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (cleanSiret.length !== 14) {
      setError(t.companies.invalidSiret);
      return;
    }

    if (cleanSiren.length !== 9) {
      setError(t.companies.invalidSiren);
      return;
    }

    if (!values.raisonSociale.trim()) {
      setError(t.companies.requiredFields);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = compactPayload(values);

      if (company) {
        await updateCompany(token, company.id, payload);
      } else {
        await createCompany(token, payload as CreateCompanyPayload);
      }

      setValues(emptyForm);
      setLastLookupSiret("");
      setLookupState("idle");
      setMessage(
        company ? t.companies.updatedSuccess : t.companies.createdSuccess,
      );
      await onSaved();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>
            {isEditing ? t.companies.editTitle : t.companies.createTitle}
          </CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            {isEditing
              ? t.companies.editDescription
              : t.companies.createDescription}
          </p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="company-siret">{t.companies.siret}</Label>
              <Input
                id="company-siret"
                inputMode="numeric"
                maxLength={14}
                value={values.siret}
                onChange={(event) => updateField("siret", event.target.value)}
                placeholder="12345678901234"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void lookupSiret(cleanSiret)}
              disabled={cleanSiret.length !== 14 || lookupState === "loading"}
            >
              {lookupState === "loading" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {t.actions.search}
            </Button>
          </div>

          {lookupState === "loading" ? (
            <p className="text-sm text-muted-foreground">
              {t.companies.lookupLoading}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm">
              {message}
            </p>
          ) : null}
          {error ? <ErrorMessage message={error} /> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name">
                {t.companies.raisonSociale}
              </Label>
              <Input
                id="company-name"
                value={values.raisonSociale}
                onChange={(event) =>
                  updateField("raisonSociale", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-siren">{t.companies.siren}</Label>
              <Input
                id="company-siren"
                inputMode="numeric"
                maxLength={9}
                value={values.siren}
                readOnly
                className="bg-secondary/60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-site">{t.companies.siteWeb}</Label>
              <Input
                id="company-site"
                type="url"
                value={values.siteWeb}
                onChange={(event) => updateField("siteWeb", event.target.value)}
                placeholder="https://exemple.fr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-establishment">
                {t.companies.etablissementSiege}
              </Label>
              <select
                id="company-establishment"
                className={controlClassName}
                value={values.etablissementSiege}
                onChange={(event) =>
                  updateField("etablissementSiege", event.target.value)
                }
              >
                {establishmentLabels.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-naf">
                {t.companies.codeNafLookup}
              </Label>
              <div className="relative">
                <Input
                  id="company-naf"
                  value={nafQuery}
                  onChange={(event) => {
                    setNafQuery(event.target.value);
                    setSelectedNaf(null);
                    updateField("codeNaf", "");
                  }}
                  placeholder={t.companies.codeNafPlaceholder}
                  autoComplete="off"
                />
                {isSearchingNaf ? (
                  <LoaderCircle className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-muted-foreground" />
                ) : null}
                {nafResults.length > 0 ? (
                  <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-lg">
                    {nafResults.map((naf) => (
                      <button
                        key={naf.code}
                        type="button"
                        className="flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary"
                        onClick={() => selectNaf(naf)}
                      >
                        <span className="text-sm font-medium">
                          {naf.title}
                        </span>
                        <span className="mt-1 text-xs text-muted-foreground">
                          {naf.code} - {naf.altCode}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              {selectedNaf ? (
                <p className="text-xs text-muted-foreground">
                  {t.companies.codeNafSelected} : {selectedNaf.code}
                </p>
              ) : nafQuery.trim().length >= 2 && !isSearchingNaf ? (
                <p className="text-xs text-muted-foreground">
                  {t.companies.codeNafEmpty}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-workforce-legal-unit">
                {t.companies.trancheEffectifsUniteLegale}
              </Label>
              <select
                id="company-workforce-legal-unit"
                className={controlClassName}
                value={values.trancheEffectifsUniteLegale}
                onChange={(event) =>
                  updateField(
                    "trancheEffectifsUniteLegale",
                    event.target.value,
                  )
                }
              >
                {workforceRangeLabels.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-workforce-establishment">
                {t.companies.trancheEffectifsEtablissement}
              </Label>
              <select
                id="company-workforce-establishment"
                className={controlClassName}
                value={values.trancheEffectifsEtablissement}
                onChange={(event) =>
                  updateField(
                    "trancheEffectifsEtablissement",
                    event.target.value,
                  )
                }
              >
                {workforceRangeLabels.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-category">
                {t.companies.categorieJuridique}
              </Label>
              <div className="relative">
                <Input
                  id="company-category"
                  value={categorieJuridiqueQuery}
                  onChange={(event) => {
                    setCategorieJuridiqueQuery(event.target.value);
                    setSelectedCategorieJuridique(null);
                    updateField("categorieJuridiqueCode", "");
                  }}
                  placeholder={t.companies.categorieJuridiquePlaceholder}
                  autoComplete="off"
                />
                {isSearchingCategorieJuridique ? (
                  <LoaderCircle className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-muted-foreground" />
                ) : null}
                {categorieJuridiqueResults.length > 0 ? (
                  <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-lg">
                    {categorieJuridiqueResults.map((categorieJuridique) => (
                      <button
                        key={categorieJuridique.code}
                        type="button"
                        className="flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary"
                        onClick={() =>
                          selectCategorieJuridique(categorieJuridique)
                        }
                      >
                        <span className="text-sm font-medium">
                          {categorieJuridique.title}
                        </span>
                        <span className="mt-1 text-xs text-muted-foreground">
                          {categorieJuridique.code}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              {selectedCategorieJuridique ? (
                <p className="text-xs text-muted-foreground">
                  {t.companies.categorieJuridiqueSelected} :{" "}
                  {selectedCategorieJuridique.code}
                </p>
              ) : categorieJuridiqueQuery.trim().length >= 2 &&
                !isSearchingCategorieJuridique ? (
                <p className="text-xs text-muted-foreground">
                  {t.companies.categorieJuridiqueEmpty}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3">
              <input
                id="company-active"
                type="checkbox"
                className="h-4 w-4 rounded border-input accent-primary"
                checked={values.estActive}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    estActive: event.target.checked,
                  }))
                }
              />
              <Label htmlFor="company-active">{t.companies.estActive}</Label>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="company-description">
                {t.companies.descriptionField}
              </Label>
              <textarea
                id="company-description"
                className={`${controlClassName} min-h-28 resize-y`}
                value={values.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder={t.companies.descriptionPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-address">
                {t.companies.addressLine1}
              </Label>
              <Input
                id="company-address"
                value={values.addressLine1}
                onChange={(event) =>
                  updateField("addressLine1", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-address-2">
                {t.companies.addressLine2}
              </Label>
              <Input
                id="company-address-2"
                value={values.addressLine2}
                onChange={(event) =>
                  updateField("addressLine2", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-postal">
                {t.companies.codePostal}
              </Label>
              <Input
                id="company-postal"
                value={values.codePostal}
                onChange={(event) =>
                  updateField("codePostal", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-city">{t.companies.ville}</Label>
              <Input
                id="company-city"
                value={values.ville}
                onChange={(event) => updateField("ville", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-country">{t.companies.pays}</Label>
              <Input
                id="company-country"
                value={values.pays}
                readOnly
                className="bg-secondary/60"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t.actions.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting || isExisting}>
              {isSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isEditing ? t.actions.save : t.actions.create}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function CompanyMobileCard({
  company,
  locale,
  isAdmin,
  onEdit,
}: {
  company: Company;
  locale: Locale;
  isAdmin: boolean;
  onEdit: (company: Company) => void;
}) {
  const t = getTranslation(locale);
  const websiteLabel = formatWebsite(company.siteWeb);

  return (
    <Card className="animate-fade-in">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="break-words text-base font-semibold">
              {company.raisonSociale}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.companies.siret} {company.siret}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/60 p-3">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            {t.companies.siteWeb}
          </p>
          {company.siteWeb ? (
            <a
              href={company.siteWeb}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex max-w-full items-center gap-2 break-all text-sm font-medium text-primary hover:underline"
              aria-label={`${t.companies.openSite} ${company.raisonSociale}`}
            >
              <Globe2 className="h-4 w-4 shrink-0" />
              {websiteLabel}
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              {t.companies.noSiteWeb}
            </p>
          )}
        </div>

        {isAdmin ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => onEdit(company)}
          >
            <Pencil className="h-4 w-4" />
            {t.actions.edit}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function CompaniesPage({
  locale,
  token,
  user,
  onLocaleChange,
  onLogout,
}: CompaniesPageProps) {
  const t = getTranslation(locale);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const isAdmin = user.role === "ADMIN";

  const displayName = useMemo(() => {
    return typeof user.email === "string" && user.email.trim()
      ? user.email
      : t.dashboard.memberValue;
  }, [t.dashboard.memberValue, user.email]);

  const loadCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listCompanies(token, {
        search: debouncedSearch,
      });
      setCompanies(response.items);
      setTotal(response.meta.total);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, token]);

  useEffect(() => {
    void loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  return (
    <main className="min-h-screen">
      <div className="container flex min-h-screen flex-col gap-6 py-6 sm:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-primary">
              {t.brand.badge}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {t.brand.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LanguageToggle locale={locale} onChange={onLocaleChange} />
            <ThemeToggle locale={locale} />
            <Button type="button" variant="outline" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
              {t.actions.logout}
            </Button>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-sm text-muted-foreground">
              {t.dashboard.welcome}, {displayName}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              {t.companies.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {t.companies.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin ? (
              <Button
                type="button"
                onClick={() => {
                  setEditingCompany(null);
                  setIsCreateOpen((isOpen) => !isOpen);
                }}
              >
                {isCreateOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {isCreateOpen ? t.actions.cancel : t.actions.addCompany}
              </Button>
            ) : null}
            <div className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                {t.companies.totalLabel}
              </p>
              <p className="mt-1 text-xl font-semibold">{total}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void loadCompanies()}
              disabled={isLoading}
            >
              {isLoading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {t.actions.refresh}
            </Button>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.companies.searchPlaceholder}
              className="pl-10"
            />
          </div>
          {search ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch("");
                setDebouncedSearch("");
              }}
            >
              <X className="h-4 w-4" />
              {t.actions.clear}
            </Button>
          ) : null}
        </section>

        {isAdmin && isCreateOpen ? (
          <CompanyForm
            key="create-company"
            locale={locale}
            token={token}
            onCancel={() => setIsCreateOpen(false)}
            onSaved={async () => {
              await loadCompanies();
              setIsCreateOpen(false);
            }}
          />
        ) : null}

        {isAdmin && editingCompany ? (
          <CompanyForm
            key={editingCompany.id}
            locale={locale}
            token={token}
            company={editingCompany}
            onCancel={() => setEditingCompany(null)}
            onSaved={async () => {
              await loadCompanies();
              setEditingCompany(null);
            }}
          />
        ) : null}

        {error ? <ErrorMessage message={error} /> : null}

        <section className="flex-1">
          {isLoading ? (
            <Card>
              <CardContent className="flex min-h-80 items-center justify-center gap-3 p-8 text-muted-foreground">
                <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium">
                  {t.companies.loading}
                </span>
              </CardContent>
            </Card>
          ) : companies.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
                <div className="rounded-xl bg-primary/10 p-4 text-primary">
                  <Building2 className="h-8 w-8" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">
                  {t.companies.emptyTitle}
                </h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  {t.companies.emptyDescription}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:hidden">
                {companies.map((company) => (
                  <CompanyMobileCard
                    key={company.id}
                    company={company}
                    locale={locale}
                    isAdmin={isAdmin}
                    onEdit={(company) => {
                      setIsCreateOpen(false);
                      setEditingCompany(company);
                    }}
                  />
                ))}
              </div>

              <Card className="hidden overflow-hidden md:block">
                <CardHeader className="border-b border-border">
                  <CardTitle>{t.companies.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                      <thead className="bg-secondary/70 text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="px-5 py-4 font-semibold">
                            {t.companies.raisonSociale}
                          </th>
                          <th className="px-5 py-4 font-semibold">
                            {t.companies.siret}
                          </th>
                          <th className="px-5 py-4 font-semibold">
                            {t.companies.siteWeb}
                          </th>
                          {isAdmin ? (
                            <th className="px-5 py-4 text-right font-semibold">
                              {t.actions.edit}
                            </th>
                          ) : null}
                        </tr>
                      </thead>
                      <tbody>
                        {companies.map((company) => {
                          const websiteLabel = formatWebsite(company.siteWeb);

                          return (
                            <tr
                              key={company.id}
                              className="border-t border-border/80 transition-colors hover:bg-secondary/40"
                            >
                              <td className="max-w-[360px] px-5 py-4 font-medium">
                                <span className="break-words">
                                  {company.raisonSociale}
                                </span>
                              </td>
                              <td className="px-5 py-4 font-mono text-sm">
                                {company.siret}
                              </td>
                              <td className="px-5 py-4">
                                {company.siteWeb ? (
                                  <a
                                    href={company.siteWeb}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex max-w-[320px] items-center gap-2 break-all font-medium text-primary hover:underline"
                                    aria-label={`${t.companies.openSite} ${company.raisonSociale}`}
                                  >
                                    <Globe2 className="h-4 w-4 shrink-0" />
                                    {websiteLabel}
                                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground">
                                    {t.companies.noSiteWeb}
                                  </span>
                                )}
                              </td>
                              {isAdmin ? (
                                <td className="px-5 py-4 text-right">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setIsCreateOpen(false);
                                      setEditingCompany(company);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                    {t.actions.edit}
                                  </Button>
                                </td>
                              ) : null}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
