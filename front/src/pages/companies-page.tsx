import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Trash2,
  ExternalLink,
  Globe2,
  History,
  Landmark,
  Leaf,
  LoaderCircle,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Users,
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
  deleteEvaluationRse,
  getActiveEvaluationRse,
  getCompany,
  getEvaluationRse,
  listEvaluationsRse,
  listCompanies,
  lookupCompanyBySiret,
  saveCurrentEvaluationRse,
  updateIndicateursEnvironnementaux,
  updateIndicateursGouvernanceRse,
  updateIndicateursSociaux,
  updateLabelsEngagementsRse,
  updateCompany,
  type BilanCarboneScope,
  type AuthUser,
  type CategorieJuridique,
  type CodeNaf,
  type Company,
  type CompanyDraft,
  type CreateCompanyPayload,
  type EvaluationRse,
  type MedailleEcovadis,
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

function AppHeader({
  locale,
  onLocaleChange,
  onLogout,
  onOpenEnterprises,
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onLogout: () => void;
  onOpenEnterprises: () => void;
}) {
  const t = getTranslation(locale);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase text-primary">
              {t.brand.badge}
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">
              {t.brand.name}
            </h1>
          </div>

          <nav className="flex flex-wrap items-center gap-2" aria-label="Navigation principale">
            <Button
              type="button"
              variant="secondary"
              className="rounded-xl"
              onClick={onOpenEnterprises}
            >
              <Building2 className="h-4 w-4" />
              {t.navigation.enterprises}
            </Button>
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LanguageToggle locale={locale} onChange={onLocaleChange} />
          <ThemeToggle locale={locale} />
          <Button type="button" variant="outline" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
            {t.actions.logout}
          </Button>
        </div>
      </div>
    </header>
  );
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

const evaluationNotes = ["A", "B", "C", "D", "E", "F"] as const;

const evaluationNoteColors: Record<
  (typeof evaluationNotes)[number],
  { bg: string; border: string; shadow: string }
> = {
  A: { bg: "#169b62", border: "#0f7f4c", shadow: "rgba(22, 155, 98, 0.35)" },
  B: { bg: "#8cc63f", border: "#72a832", shadow: "rgba(140, 198, 63, 0.35)" },
  C: { bg: "#ffd23f", border: "#e2ae17", shadow: "rgba(255, 210, 63, 0.35)" },
  D: { bg: "#f47b20", border: "#d95f0e", shadow: "rgba(244, 123, 32, 0.35)" },
  E: { bg: "#ef4023", border: "#cf2e16", shadow: "rgba(239, 64, 35, 0.35)" },
  F: { bg: "#b91c1c", border: "#991b1b", shadow: "rgba(185, 28, 28, 0.35)" },
};

function NutriScoreNote({
  note,
  label,
  size = "sm",
}: {
  note?: NonNullable<Company["activeEvaluationRse"]>["note"];
  label: string;
  size?: "sm" | "lg";
}) {
  const isLarge = size === "lg";

  return (
    <span
      className={`inline-flex flex-col border border-border bg-white shadow-sm dark:bg-background ${
        isLarge ? "rounded-[10px] px-3 py-2" : "rounded-[7px] px-1.5 py-1"
      }`}
      aria-label={label}
    >
      <span
        className={`mb-0.5 pl-0.5 font-bold uppercase leading-none tracking-normal text-slate-500 dark:text-slate-300 ${
          isLarge ? "text-[11px]" : "text-[8px]"
        }`}
      >
        RSE-SCORE
      </span>
      <span className={`flex items-center ${isLarge ? "mt-1 h-14" : "h-7"}`}>
        {evaluationNotes.map((currentNote) => {
          const colors = evaluationNoteColors[currentNote];
          const isActive = note === currentNote;
          const inactiveSize = isLarge ? 34 : 20;
          const activeSize = isLarge ? 52 : 30;
          const fontSize = isLarge ? 22 : 13;

          return (
            <span
              key={currentNote}
              className="flex items-center justify-center font-bold leading-none text-white transition-all"
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
                borderWidth: isActive ? 2 : 0,
                borderRadius: isActive ? 999 : 2,
                boxShadow: isActive ? `0 0 0 ${isLarge ? 4 : 3}px ${colors.shadow}` : undefined,
                fontSize,
                height: isActive ? activeSize : inactiveSize,
                marginLeft: isActive ? -2 : 0,
                marginRight: isActive ? -2 : 0,
                opacity: note && !isActive ? 0.58 : 1,
                position: isActive ? "relative" : undefined,
                width: isActive ? activeSize : inactiveSize,
                zIndex: isActive ? 1 : undefined,
              }}
            >
              {currentNote}
            </span>
          );
        })}
      </span>
    </span>
  );
}

function CompanyEvaluationNoteButton({
  company,
  locale,
  onEvaluate,
}: {
  company: Company;
  locale: Locale;
  onEvaluate: (company: Company) => void;
}) {
  const t = getTranslation(locale);
  const evaluation = company.activeEvaluationRse;

  return (
    <button
      type="button"
      className="inline-flex rounded-[9px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={() => onEvaluate(company)}
      title={
        evaluation
          ? `${t.evaluationRse.open} - ${t.evaluationRse.note} ${evaluation.note}`
          : t.evaluationRse.noNote
      }
    >
      <NutriScoreNote
        note={evaluation?.note}
        label={
          evaluation
            ? `${t.evaluationRse.note} ${evaluation.note}`
            : t.evaluationRse.noNote
        }
      />
    </button>
  );
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

const medailleEcovadisOptions: { value: MedailleEcovadis; label: string }[] = [
  { value: "PLATINUM", label: "Platine (top 1% des entreprises)" },
  { value: "GOLD", label: "Or (top 5% des entreprises)" },
  { value: "SILVER", label: "Argent (top 15% des entreprises)" },
  { value: "BRONZE", label: "Bronze (top 35% des entreprises)" },
  { value: "COMMITTED", label: "Engage (entreprise engagee sans medaille)" },
  { value: "FAST_MOVER", label: "Progression rapide (amelioration significative)" },
  { value: "OTHER", label: "Autre / Non classe" },
];

const bilanCarboneScopeOptions: { value: BilanCarboneScope; label: string }[] = [
  { value: "NON_PRECISE", label: "Non precise" },
  { value: "SCOPE_1", label: "Scope 1" },
  { value: "SCOPE_1_2", label: "Scope 1 et 2" },
  { value: "SCOPE_1_2_3", label: "Scope 1, 2 et 3" },
];

const controlClassName =
  "flex min-h-11 w-full rounded-xl border border-input bg-background/70 px-4 py-2 text-sm shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

type EvaluationSection = "labels" | "environment" | "social" | "governance";

function isEvaluationSection(value: string | null): value is EvaluationSection {
  return (
    value === "labels" ||
    value === "environment" ||
    value === "social" ||
    value === "governance"
  );
}

function currentUrlView() {
  const searchParams = new URLSearchParams(window.location.search);
  const section = searchParams.get("section");

  return {
    view: searchParams.get("view"),
    companyId: searchParams.get("companyId"),
    evaluationId: searchParams.get("evaluationId"),
    section: isEvaluationSection(section) ? section : null,
  };
}

function pushUrlView(
  view?: "entreprises" | "create" | "edit" | "evaluation" | "evaluationHistory" | "labels" | "environment" | "social" | "governance",
  ids: { companyId?: string; evaluationId?: string; section?: EvaluationSection } = {},
  mode: "push" | "replace" = "push",
) {
  const url = new URL(window.location.href);
  url.searchParams.delete("view");
  url.searchParams.delete("companyId");
  url.searchParams.delete("evaluationId");
  url.searchParams.delete("section");

  if (view) {
    url.searchParams.set("view", view);
  }

  if (ids.companyId) {
    url.searchParams.set("companyId", ids.companyId);
  }

  if (ids.evaluationId) {
    url.searchParams.set("evaluationId", ids.evaluationId);
  }

  if (ids.section) {
    url.searchParams.set("section", ids.section);
  }

  if (mode === "replace") {
    window.history.replaceState({}, "", url);
  } else {
    window.history.pushState({}, "", url);
  }
}

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
  onEvaluate,
}: {
  company: Company;
  locale: Locale;
  isAdmin: boolean;
  onEdit: (company: Company) => void;
  onEvaluate: (company: Company) => void;
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

        <div className="rounded-xl border border-border bg-background/60 p-3">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            {t.evaluationRse.note}
          </p>
          <div className="mt-2">
            <CompanyEvaluationNoteButton
              company={company}
              locale={locale}
              onEvaluate={onEvaluate}
            />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
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
        </div>
      </CardContent>
    </Card>
  );
}

function EvaluationRsePage({
  locale,
  token,
  evaluation,
  initialSection,
  isAdmin,
  onSaved,
  onOpenHistory,
  onEditLabels,
  onEditEnvironment,
  onEditSocial,
  onEditGovernance,
}: {
  locale: Locale;
  token: string;
  evaluation: EvaluationRse;
  initialSection: EvaluationSection;
  isAdmin: boolean;
  onSaved: (evaluation: EvaluationRse) => void;
  onOpenHistory: (companyId: string, section: EvaluationSection) => void;
  onEditLabels: (evaluation: EvaluationRse) => void;
  onEditEnvironment: (evaluation: EvaluationRse) => void;
  onEditSocial: (evaluation: EvaluationRse) => void;
  onEditGovernance: (evaluation: EvaluationRse) => void;
}) {
  const t = getTranslation(locale);
  const [currentEvaluation, setCurrentEvaluation] = useState(evaluation);
  const [activeSection, setActiveSection] =
    useState<EvaluationSection>(initialSection);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentEvaluation(evaluation);
  }, [evaluation]);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const selectSection = useCallback((section: EvaluationSection) => {
    setActiveSection(section);
    pushUrlView("evaluation", {
      companyId: currentEvaluation.entrepriseId,
      section,
    }, "replace");
  }, [currentEvaluation.entrepriseId]);

  async function handleSave() {
    setIsSaving(true);
    setError(null);

    try {
      const savedEvaluation = await saveCurrentEvaluationRse(
        token,
        currentEvaluation.entrepriseId,
      );
      setCurrentEvaluation(savedEvaluation);
      onSaved(savedEvaluation);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="container flex min-h-screen flex-col gap-6 py-6 sm:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {t.evaluationRse.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {t.evaluationRse.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenHistory(currentEvaluation.entrepriseId, activeSection)}
            >
              <History className="h-4 w-4" />
              {t.evaluationRse.historyLink}
            </Button>
            {!currentEvaluation.saved ? (
              <Button type="button" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {t.evaluationRse.save}
              </Button>
            ) : null}
          </div>
        </header>

        {error ? <ErrorMessage message={error} /> : null}

        <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>{t.evaluationRse.company}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t.evaluationRse.readonlyCompany}
              </p>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  {t.companies.raisonSociale}
                </p>
                <p className="mt-1 font-medium">
                  {currentEvaluation.entreprise.raisonSociale}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  {t.companies.siret}
                </p>
                <p className="mt-1 font-mono">{currentEvaluation.entreprise.siret}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  {t.companies.siren}
                </p>
                <p className="mt-1 font-mono">{currentEvaluation.entreprise.siren}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  {t.evaluationRse.date}
                </p>
                <p className="mt-1 font-medium">
                  {new Date(currentEvaluation.dateEvaluation).toLocaleDateString(
                    locale === "fr" ? "fr-FR" : "en-US",
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{currentEvaluation.saved ? t.evaluationRse.saved : t.evaluationRse.draft}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-[0.7fr_1.3fr]">
              <div className="rounded-xl border border-border bg-background/60 p-3">
                <p className="text-xs uppercase text-muted-foreground">
                  {t.evaluationRse.score}
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {currentEvaluation.score}
                </p>
              </div>
              <div className="flex flex-col rounded-xl border border-border bg-background/60 p-3">
                <div className="flex flex-1 items-center justify-center">
                  <NutriScoreNote
                    note={currentEvaluation.note}
                    label={`${t.evaluationRse.note} ${currentEvaluation.note}`}
                    size="lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            className={
              activeSection === "labels"
                ? "border-[#e64a19] bg-[#e64a19] text-white hover:bg-[#cf3f11] hover:text-white"
                : "border-[#e64a19]/60 text-[#d94716] hover:bg-[#fff1eb] dark:text-[#ff8a5c] dark:hover:bg-[#3a1a10]"
            }
            onClick={() => selectSection("labels")}
          >
            <BadgeCheck className="h-4 w-4" />
            {t.evaluationRse.labels}
          </Button>
          <Button
            type="button"
            variant="outline"
            className={
              activeSection === "environment"
                ? "border-[#22c55e] bg-[#22c55e] text-[#052e16] hover:bg-[#16a34a] hover:text-white"
                : "border-[#22c55e]/60 text-[#15803d] hover:bg-[#ecfdf3] dark:text-[#86efac] dark:hover:bg-[#0f2f1c]"
            }
            onClick={() => selectSection("environment")}
          >
            <Leaf className="h-4 w-4" />
            {t.evaluationRse.environment}
          </Button>
          <Button
            type="button"
            variant="outline"
            className={
              activeSection === "social"
                ? "border-[#2563eb] bg-[#2563eb] text-white hover:bg-[#1d4ed8] hover:text-white"
                : "border-[#2563eb]/60 text-[#1d4ed8] hover:bg-[#eff6ff] dark:text-[#93c5fd] dark:hover:bg-[#10213f]"
            }
            onClick={() => selectSection("social")}
          >
            <Users className="h-4 w-4" />
            {t.evaluationRse.social}
          </Button>
          <Button
            type="button"
            variant="outline"
            className={
              activeSection === "governance"
                ? "border-[#7c3aed] bg-[#7c3aed] text-white hover:bg-[#6d28d9] hover:text-white"
                : "border-[#7c3aed]/60 text-[#6d28d9] hover:bg-[#f5f3ff] dark:text-[#c4b5fd] dark:hover:bg-[#24123f]"
            }
            onClick={() => selectSection("governance")}
          >
            <Landmark className="h-4 w-4" />
            {t.evaluationRse.governance}
          </Button>
        </section>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>
              {activeSection === "labels"
                ? t.evaluationRse.labels
                : activeSection === "environment"
                  ? t.evaluationRse.environment
                  : activeSection === "social"
                    ? t.evaluationRse.social
                    : t.evaluationRse.governance}
            </CardTitle>
            {activeSection === "labels" && isAdmin && currentEvaluation.id ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onEditLabels(currentEvaluation)}
              >
                <Pencil className="h-4 w-4" />
                {t.evaluationRse.editLabels}
              </Button>
            ) : null}
            {activeSection === "environment" && isAdmin && currentEvaluation.id ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onEditEnvironment(currentEvaluation)}
              >
                <Pencil className="h-4 w-4" />
                {t.evaluationRse.editEnvironment}
              </Button>
            ) : null}
            {activeSection === "social" && isAdmin && currentEvaluation.id ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onEditSocial(currentEvaluation)}
              >
                <Pencil className="h-4 w-4" />
                {t.evaluationRse.editSocial}
              </Button>
            ) : null}
            {activeSection === "governance" && isAdmin && currentEvaluation.id ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onEditGovernance(currentEvaluation)}
              >
                <Pencil className="h-4 w-4" />
                {t.evaluationRse.editGovernance}
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeSection === "labels" ? (
              currentEvaluation.labelsEngagementsRse ? (
                <>
                  <Indicator label="Reporting RSE" value={currentEvaluation.labelsEngagementsRse.aReportingRse} />
                  <Indicator label="Ecovadis" value={currentEvaluation.labelsEngagementsRse.aEvaluationEcovadis} />
                  <Indicator label="Societe a mission" value={currentEvaluation.labelsEngagementsRse.estSocieteAMission} />
                  <Indicator label="Global Compact" value={currentEvaluation.labelsEngagementsRse.estSignataireGlobalCompact} />
                  <Indicator label={t.evaluationRse.score} value={currentEvaluation.labelsEngagementsRse.score} />
                  <Indicator label={t.evaluationRse.note} value={currentEvaluation.labelsEngagementsRse.note} />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{t.evaluationRse.noLabels}</p>
              )
            ) : activeSection === "environment" ? (
              currentEvaluation.indicateursEnvironnementaux ? (
              <>
                <Indicator label="Bilan carbone" value={currentEvaluation.indicateursEnvironnementaux.bilanCarbone} />
                <Indicator label="Decarbonisation" value={currentEvaluation.indicateursEnvironnementaux.decarbonisation} />
                <Indicator label="QP ENR" value={currentEvaluation.indicateursEnvironnementaux.qpENR} />
                <Indicator label="ISO 14001" value={currentEvaluation.indicateursEnvironnementaux.iso14001} />
                <Indicator label="ISO 50001" value={currentEvaluation.indicateursEnvironnementaux.iso50001} />
                <Indicator label="Recyclage dechets" value={currentEvaluation.indicateursEnvironnementaux.recyclageDechets} />
                <Indicator label="Autres" value={currentEvaluation.indicateursEnvironnementaux.autresEnv} />
                <Indicator label={t.evaluationRse.score} value={currentEvaluation.indicateursEnvironnementaux.score} />
                <Indicator label={t.evaluationRse.note} value={currentEvaluation.indicateursEnvironnementaux.note} />
              </>
              ) : (
                <p className="text-sm text-muted-foreground">{t.evaluationRse.noEnvironment}</p>
              )
            ) : activeSection === "social" ? (
              currentEvaluation.indicateursSociaux ? (
                <>
                  <Indicator label="ISO 45001" value={currentEvaluation.indicateursSociaux.iso45001} />
                  <Indicator label="ESS" value={currentEvaluation.indicateursSociaux.ess} />
                  <Indicator label="Evaluation QVT" value={currentEvaluation.indicateursSociaux.aEvaluationQvt} />
                  <Indicator label="Label employeur" value={currentEvaluation.indicateursSociaux.aLabelEmployeur} />
                  <Indicator label="Vie associative locale" value={currentEvaluation.indicateursSociaux.aVieAssociativeLocale} />
                  <Indicator label="Egalite femmes-hommes" value={currentEvaluation.indicateursSociaux.aEgaliteHF} />
                  <Indicator label="Autres" value={currentEvaluation.indicateursSociaux.aAutresSocial} />
                  <Indicator label={t.evaluationRse.score} value={currentEvaluation.indicateursSociaux.score} />
                  <Indicator label={t.evaluationRse.note} value={currentEvaluation.indicateursSociaux.note} />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{t.evaluationRse.noSocial}</p>
              )
            ) : currentEvaluation.indicateursGouvernanceRse ? (
              <>
                <Indicator label="Gouvernance RSE" value={currentEvaluation.indicateursGouvernanceRse.aGouvernanceRse} />
                <Indicator label="Ethique" value={currentEvaluation.indicateursGouvernanceRse.aEthique} />
                <Indicator label="Enquetes partenaires" value={currentEvaluation.indicateursGouvernanceRse.aEnquetesPartenaires} />
                <Indicator label="Charte achats" value={currentEvaluation.indicateursGouvernanceRse.charteAchats} />
                <Indicator label="Label RFAR" value={currentEvaluation.indicateursGouvernanceRse.labelRfar} />
                <Indicator label="Certification FSC/PEFC" value={currentEvaluation.indicateursGouvernanceRse.certifFscPefc} />
                <Indicator label="Autres" value={currentEvaluation.indicateursGouvernanceRse.aAutresGouvernance} />
                <Indicator label={t.evaluationRse.score} value={currentEvaluation.indicateursGouvernanceRse.score} />
                <Indicator label={t.evaluationRse.note} value={currentEvaluation.indicateursGouvernanceRse.note} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t.evaluationRse.noGovernance}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Indicator({ label, value }: { label: string; value: boolean | number | string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 font-semibold">
        {typeof value === "boolean" ? (value ? "Oui" : "Non") : value}
      </p>
    </div>
  );
}

function EvaluationsHistoryPage({
  locale,
  token,
  companyId,
  isAdmin,
  onBack,
  onOpenEvaluation,
}: {
  locale: Locale;
  token: string;
  companyId: string;
  isAdmin: boolean;
  onBack: () => void;
  onOpenEvaluation: (evaluation: EvaluationRse) => void;
}) {
  const t = getTranslation(locale);
  const [company, setCompany] = useState<Company | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationRse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [nextCompany, response] = await Promise.all([
        getCompany(token, companyId),
        listEvaluationsRse(token, companyId),
      ]);

      setCompany(nextCompany);
      setEvaluations(response.items);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [companyId, token]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  async function handleDeleteEvaluation(evaluation: EvaluationRse) {
    if (!evaluation.id || !window.confirm(t.evaluationRse.deleteConfirm)) {
      return;
    }

    setError(null);
    setMessage(null);

    try {
      await deleteEvaluationRse(token, evaluation.id);
      setMessage(t.evaluationRse.deleted);
      await loadHistory();
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  return (
    <main className="min-h-screen">
      <div className="container flex min-h-screen flex-col gap-6 py-6 sm:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button type="button" variant="ghost" onClick={() => onBack()}>
              <ArrowLeft className="h-4 w-4" />
              {t.actions.back}
            </Button>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {t.evaluationRse.history}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {company ? company.raisonSociale : t.states.loadingAction}
            </p>
          </div>
        </header>

        {error ? <ErrorMessage message={error} /> : null}
        {message ? (
          <p className="rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm">
            {message}
          </p>
        ) : null}

        {company ? (
          <Card>
            <CardHeader>
              <CardTitle>{t.evaluationRse.company}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  {t.companies.raisonSociale}
                </p>
                <p className="mt-1 font-medium">{company.raisonSociale}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  {t.companies.siret}
                </p>
                <p className="mt-1 font-mono">{company.siret}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  {t.companies.siren}
                </p>
                <p className="mt-1 font-mono">{company.siren}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{t.evaluationRse.history}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                {t.states.loadingAction}
              </div>
            ) : evaluations.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.evaluationRse.noHistory}</p>
            ) : (
              evaluations.map((evaluation) => (
                <div
                  key={evaluation.id ?? `${evaluation.entrepriseId}-${evaluation.dateEvaluation}`}
                  className="grid gap-3 rounded-xl border border-border bg-background/60 p-4 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(evaluation.dateEvaluation).toLocaleDateString(
                        locale === "fr" ? "fr-FR" : "en-US",
                      )}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {evaluation.estActive ? t.evaluationRse.active : t.evaluationRse.inactive}
                      {" · "}
                      {t.evaluationRse.score} {evaluation.score}
                      {" · "}
                      {t.evaluationRse.note} {evaluation.note}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenEvaluation(evaluation)}
                    >
                      {t.evaluationRse.open}
                    </Button>
                    {isAdmin && evaluation.id ? (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => void handleDeleteEvaluation(evaluation)}
                      >
                        <Trash2 className="h-4 w-4" />
                        {t.actions.delete}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

type LabelsFormValues = {
  aReportingRse: boolean;
  reportingRseDetail: string;
  aEvaluationEcovadis: boolean;
  medailleEcovadis: MedailleEcovadis;
  anneeScoreEcovadis: string;
  estSocieteAMission: boolean;
  estSignataireGlobalCompact: boolean;
  globalCompactDetail: string;
};

function labelsToFormValues(evaluation: EvaluationRse): LabelsFormValues {
  const labels = evaluation.labelsEngagementsRse;

  return {
    aReportingRse: labels?.aReportingRse ?? false,
    reportingRseDetail: valueOrEmpty(labels?.reportingRseDetail),
    aEvaluationEcovadis: labels?.aEvaluationEcovadis ?? false,
    medailleEcovadis: labels?.medailleEcovadis ?? "OTHER",
    anneeScoreEcovadis: valueOrEmpty(labels?.anneeScoreEcovadis),
    estSocieteAMission: labels?.estSocieteAMission ?? false,
    estSignataireGlobalCompact: labels?.estSignataireGlobalCompact ?? false,
    globalCompactDetail: valueOrEmpty(labels?.globalCompactDetail),
  };
}

function LabelsEngagementsRsePage({
  locale,
  token,
  evaluation,
  onBack,
  onSaved,
}: {
  locale: Locale;
  token: string;
  evaluation: EvaluationRse;
  onBack: (evaluation?: EvaluationRse) => void;
  onSaved: (evaluation: EvaluationRse) => void;
}) {
  const t = getTranslation(locale);
  const [currentEvaluation, setCurrentEvaluation] = useState(evaluation);
  const [values, setValues] = useState<LabelsFormValues>(
    labelsToFormValues(evaluation),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function updateBoolean(field: keyof LabelsFormValues, checked: boolean) {
    setValues((current) => ({
      ...current,
      [field]: checked,
    }));
  }

  function updateText(field: keyof LabelsFormValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const savedEvaluation = await updateLabelsEngagementsRse(
        token,
        currentEvaluation.id!,
        {
          aReportingRse: values.aReportingRse,
          reportingRseDetail: values.aReportingRse
            ? values.reportingRseDetail
            : null,
          aEvaluationEcovadis: values.aEvaluationEcovadis,
          medailleEcovadis: values.aEvaluationEcovadis
            ? values.medailleEcovadis
            : null,
          anneeScoreEcovadis: values.aEvaluationEcovadis
            ? values.anneeScoreEcovadis
            : null,
          estSocieteAMission: values.estSocieteAMission,
          estSignataireGlobalCompact: values.estSignataireGlobalCompact,
          globalCompactDetail: values.estSignataireGlobalCompact
            ? values.globalCompactDetail
            : null,
        },
      );
      setCurrentEvaluation(savedEvaluation);
      setValues(labelsToFormValues(savedEvaluation));
      onSaved(savedEvaluation);
      setMessage(t.evaluationRse.labelsSaved);
      onBack(savedEvaluation);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="container flex min-h-screen flex-col gap-6 py-6 sm:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button type="button" variant="ghost" onClick={() => onBack()}>
              <ArrowLeft className="h-4 w-4" />
              {t.actions.back}
            </Button>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {t.evaluationRse.labels}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {currentEvaluation.entreprise.raisonSociale} -{" "}
              {currentEvaluation.entreprise.siret}
            </p>
          </div>
        </header>

        {error ? <ErrorMessage message={error} /> : null}
        {message ? (
          <p className="rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm">
            {message}
          </p>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{t.evaluationRse.editLabels}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <LabelCheckbox
                  label="Reporting RSE"
                  checked={values.aReportingRse}
                  onChange={(checked) => updateBoolean("aReportingRse", checked)}
                />
                {values.aReportingRse ? (
                  <MemoField
                    label={t.evaluationRse.reportingRseDetail}
                    value={values.reportingRseDetail}
                    onChange={(value) => updateText("reportingRseDetail", value)}
                  />
                ) : null}

                <LabelCheckbox
                  label="Ecovadis"
                  checked={values.aEvaluationEcovadis}
                  onChange={(checked) =>
                    updateBoolean("aEvaluationEcovadis", checked)
                  }
                />
                {values.aEvaluationEcovadis ? (
                  <>
                    <SelectField
                      label={t.evaluationRse.medailleEcovadis}
                      value={values.medailleEcovadis}
                      options={medailleEcovadisOptions}
                      onChange={(value) =>
                        updateText("medailleEcovadis", value)
                      }
                    />
                    <MemoField
                      label={t.evaluationRse.anneeScoreEcovadis}
                      value={values.anneeScoreEcovadis}
                      onChange={(value) =>
                        updateText("anneeScoreEcovadis", value)
                      }
                    />
                  </>
                ) : null}

                <LabelCheckbox
                  label="Societe a mission"
                  checked={values.estSocieteAMission}
                  onChange={(checked) =>
                    updateBoolean("estSocieteAMission", checked)
                  }
                />
                <LabelCheckbox
                  label="Global Compact"
                  checked={values.estSignataireGlobalCompact}
                  onChange={(checked) =>
                    updateBoolean("estSignataireGlobalCompact", checked)
                  }
                />
                {values.estSignataireGlobalCompact ? (
                  <MemoField
                    label={t.evaluationRse.globalCompactDetail}
                    value={values.globalCompactDetail}
                    onChange={(value) => updateText("globalCompactDetail", value)}
                  />
                ) : null}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {t.evaluationRse.saveLabels}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function LabelCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-input accent-primary"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="font-medium">{label}</span>
    </label>
  );
}

function MemoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2 md:col-span-2">
      <Label>{label}</Label>
      <textarea
        className={`${controlClassName} min-h-28 resize-y`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2 md:col-span-2">
      <Label>{label}</Label>
      <select
        className={controlClassName}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type EnvironmentFormValues = {
  bilanCarbone: boolean;
  bilanCarboneScope: BilanCarboneScope;
  bilanCarboneDetail: string;
  decarbonisation: boolean;
  decarbonisationDetail: string;
  qpENR: boolean;
  qpENRDetail: string;
  iso14001: boolean;
  iso14001Detail: string;
  iso50001: boolean;
  iso50001Detail: string;
  recyclageDechets: boolean;
  recyclageDechetsDetail: string;
  autresEnv: boolean;
  autresEnvDetail: string;
};

function environmentToFormValues(evaluation: EvaluationRse): EnvironmentFormValues {
  const environment = evaluation.indicateursEnvironnementaux;

  return {
    bilanCarbone: environment?.bilanCarbone ?? false,
    bilanCarboneScope: environment?.bilanCarboneScope ?? "NON_PRECISE",
    bilanCarboneDetail: valueOrEmpty(environment?.bilanCarboneDetail),
    decarbonisation: environment?.decarbonisation ?? false,
    decarbonisationDetail: valueOrEmpty(environment?.decarbonisationDetail),
    qpENR: environment?.qpENR ?? false,
    qpENRDetail: valueOrEmpty(environment?.qpENRDetail),
    iso14001: environment?.iso14001 ?? false,
    iso14001Detail: valueOrEmpty(environment?.iso14001Detail),
    iso50001: environment?.iso50001 ?? false,
    iso50001Detail: valueOrEmpty(environment?.iso50001Detail),
    recyclageDechets: environment?.recyclageDechets ?? false,
    recyclageDechetsDetail: valueOrEmpty(environment?.recyclageDechetsDetail),
    autresEnv: environment?.autresEnv ?? false,
    autresEnvDetail: valueOrEmpty(environment?.autresEnvDetail),
  };
}

function IndicateursEnvironnementauxPage({
  locale,
  token,
  evaluation,
  onBack,
  onSaved,
}: {
  locale: Locale;
  token: string;
  evaluation: EvaluationRse;
  onBack: (evaluation?: EvaluationRse) => void;
  onSaved: (evaluation: EvaluationRse) => void;
}) {
  const t = getTranslation(locale);
  const [currentEvaluation, setCurrentEvaluation] = useState(evaluation);
  const [values, setValues] = useState<EnvironmentFormValues>(
    environmentToFormValues(evaluation),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function updateBoolean(field: keyof EnvironmentFormValues, checked: boolean) {
    setValues((current) => ({
      ...current,
      [field]: checked,
    }));
  }

  function updateText(field: keyof EnvironmentFormValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const savedEvaluation = await updateIndicateursEnvironnementaux(
        token,
        currentEvaluation.id!,
        {
          bilanCarbone: values.bilanCarbone,
          bilanCarboneScope: values.bilanCarbone
            ? values.bilanCarboneScope
            : "NON_PRECISE",
          bilanCarboneDetail: values.bilanCarbone
            ? values.bilanCarboneDetail
            : null,
          decarbonisation: values.decarbonisation,
          decarbonisationDetail: values.decarbonisation
            ? values.decarbonisationDetail
            : null,
          qpENR: values.qpENR,
          qpENRDetail: values.qpENR ? values.qpENRDetail : null,
          iso14001: values.iso14001,
          iso14001Detail: values.iso14001 ? values.iso14001Detail : null,
          iso50001: values.iso50001,
          iso50001Detail: values.iso50001 ? values.iso50001Detail : null,
          recyclageDechets: values.recyclageDechets,
          recyclageDechetsDetail: values.recyclageDechets
            ? values.recyclageDechetsDetail
            : null,
          autresEnv: values.autresEnv,
          autresEnvDetail: values.autresEnv ? values.autresEnvDetail : null,
        },
      );
      setCurrentEvaluation(savedEvaluation);
      setValues(environmentToFormValues(savedEvaluation));
      onSaved(savedEvaluation);
      setMessage(t.evaluationRse.environmentSaved);
      onBack(savedEvaluation);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="container flex min-h-screen flex-col gap-6 py-6 sm:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button type="button" variant="ghost" onClick={() => onBack()}>
              <ArrowLeft className="h-4 w-4" />
              {t.actions.back}
            </Button>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {t.evaluationRse.environment}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {currentEvaluation.entreprise.raisonSociale} -{" "}
              {currentEvaluation.entreprise.siret}
            </p>
          </div>
        </header>

        {error ? <ErrorMessage message={error} /> : null}
        {message ? (
          <p className="rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm">
            {message}
          </p>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{t.evaluationRse.editEnvironment}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <LabelCheckbox
                  label="Bilan carbone"
                  checked={values.bilanCarbone}
                  onChange={(checked) => updateBoolean("bilanCarbone", checked)}
                />
                {values.bilanCarbone ? (
                  <>
                    <SelectField
                      label={t.evaluationRse.bilanCarboneScope}
                      value={values.bilanCarboneScope}
                      options={bilanCarboneScopeOptions}
                      onChange={(value) => updateText("bilanCarboneScope", value)}
                    />
                    <MemoField
                      label={t.evaluationRse.bilanCarboneDetail}
                      value={values.bilanCarboneDetail}
                      onChange={(value) => updateText("bilanCarboneDetail", value)}
                    />
                  </>
                ) : null}

                <LabelCheckbox
                  label="Decarbonisation"
                  checked={values.decarbonisation}
                  onChange={(checked) => updateBoolean("decarbonisation", checked)}
                />
                {values.decarbonisation ? (
                  <MemoField
                    label={t.evaluationRse.decarbonisationDetail}
                    value={values.decarbonisationDetail}
                    onChange={(value) => updateText("decarbonisationDetail", value)}
                  />
                ) : null}

                <LabelCheckbox
                  label="QP ENR"
                  checked={values.qpENR}
                  onChange={(checked) => updateBoolean("qpENR", checked)}
                />
                {values.qpENR ? (
                  <MemoField
                    label={t.evaluationRse.qpENRDetail}
                    value={values.qpENRDetail}
                    onChange={(value) => updateText("qpENRDetail", value)}
                  />
                ) : null}

                <LabelCheckbox
                  label="ISO 14001"
                  checked={values.iso14001}
                  onChange={(checked) => updateBoolean("iso14001", checked)}
                />
                {values.iso14001 ? (
                  <MemoField
                    label={t.evaluationRse.iso14001Detail}
                    value={values.iso14001Detail}
                    onChange={(value) => updateText("iso14001Detail", value)}
                  />
                ) : null}

                <LabelCheckbox
                  label="ISO 50001"
                  checked={values.iso50001}
                  onChange={(checked) => updateBoolean("iso50001", checked)}
                />
                {values.iso50001 ? (
                  <MemoField
                    label={t.evaluationRse.iso50001Detail}
                    value={values.iso50001Detail}
                    onChange={(value) => updateText("iso50001Detail", value)}
                  />
                ) : null}

                <LabelCheckbox
                  label="Recyclage dechets"
                  checked={values.recyclageDechets}
                  onChange={(checked) => updateBoolean("recyclageDechets", checked)}
                />
                {values.recyclageDechets ? (
                  <MemoField
                    label={t.evaluationRse.recyclageDechetsDetail}
                    value={values.recyclageDechetsDetail}
                    onChange={(value) =>
                      updateText("recyclageDechetsDetail", value)
                    }
                  />
                ) : null}

                <LabelCheckbox
                  label="Autres"
                  checked={values.autresEnv}
                  onChange={(checked) => updateBoolean("autresEnv", checked)}
                />
                {values.autresEnv ? (
                  <MemoField
                    label={t.evaluationRse.autresEnvDetail}
                    value={values.autresEnvDetail}
                    onChange={(value) => updateText("autresEnvDetail", value)}
                  />
                ) : null}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {t.evaluationRse.saveEnvironment}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

type SocialFormValues = {
  iso45001: boolean;
  iso45001Detail: string;
  ess: boolean;
  aEvaluationQvt: boolean;
  detailEvaluationQvt: string;
  aLabelEmployeur: boolean;
  detailLabelEmployeur: string;
  aVieAssociativeLocale: boolean;
  detailVieAssociativeLocale: string;
  aEgaliteHF: boolean;
  detailEgaliteHF: string;
  aAutresSocial: boolean;
  detailAutresSocial: string;
};

function socialToFormValues(evaluation: EvaluationRse): SocialFormValues {
  const social = evaluation.indicateursSociaux;

  return {
    iso45001: social?.iso45001 ?? false,
    iso45001Detail: valueOrEmpty(social?.iso45001Detail),
    ess: social?.ess ?? false,
    aEvaluationQvt: social?.aEvaluationQvt ?? false,
    detailEvaluationQvt: valueOrEmpty(social?.detailEvaluationQvt),
    aLabelEmployeur: social?.aLabelEmployeur ?? false,
    detailLabelEmployeur: valueOrEmpty(social?.detailLabelEmployeur),
    aVieAssociativeLocale: social?.aVieAssociativeLocale ?? false,
    detailVieAssociativeLocale: valueOrEmpty(social?.detailVieAssociativeLocale),
    aEgaliteHF: social?.aEgaliteHF ?? false,
    detailEgaliteHF: valueOrEmpty(social?.detailEgaliteHF),
    aAutresSocial: social?.aAutresSocial ?? false,
    detailAutresSocial: valueOrEmpty(social?.detailAutresSocial),
  };
}

function IndicateursSociauxPage({
  locale,
  token,
  evaluation,
  onBack,
  onSaved,
}: {
  locale: Locale;
  token: string;
  evaluation: EvaluationRse;
  onBack: (evaluation?: EvaluationRse) => void;
  onSaved: (evaluation: EvaluationRse) => void;
}) {
  const t = getTranslation(locale);
  const [currentEvaluation, setCurrentEvaluation] = useState(evaluation);
  const [values, setValues] = useState<SocialFormValues>(
    socialToFormValues(evaluation),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function updateBoolean(field: keyof SocialFormValues, checked: boolean) {
    setValues((current) => ({
      ...current,
      [field]: checked,
    }));
  }

  function updateText(field: keyof SocialFormValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const savedEvaluation = await updateIndicateursSociaux(
        token,
        currentEvaluation.id!,
        {
          iso45001: values.iso45001,
          iso45001Detail: values.iso45001 ? values.iso45001Detail : null,
          ess: values.ess,
          aEvaluationQvt: values.aEvaluationQvt,
          detailEvaluationQvt: values.aEvaluationQvt
            ? values.detailEvaluationQvt
            : null,
          aLabelEmployeur: values.aLabelEmployeur,
          detailLabelEmployeur: values.aLabelEmployeur
            ? values.detailLabelEmployeur
            : null,
          aVieAssociativeLocale: values.aVieAssociativeLocale,
          detailVieAssociativeLocale: values.aVieAssociativeLocale
            ? values.detailVieAssociativeLocale
            : null,
          aEgaliteHF: values.aEgaliteHF,
          detailEgaliteHF: values.aEgaliteHF ? values.detailEgaliteHF : null,
          aAutresSocial: values.aAutresSocial,
          detailAutresSocial: values.aAutresSocial
            ? values.detailAutresSocial
            : null,
        },
      );
      setCurrentEvaluation(savedEvaluation);
      setValues(socialToFormValues(savedEvaluation));
      onSaved(savedEvaluation);
      setMessage(t.evaluationRse.socialSaved);
      onBack(savedEvaluation);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="container flex min-h-screen flex-col gap-6 py-6 sm:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button type="button" variant="ghost" onClick={() => onBack()}>
              <ArrowLeft className="h-4 w-4" />
              {t.actions.back}
            </Button>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {t.evaluationRse.social}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {currentEvaluation.entreprise.raisonSociale} -{" "}
              {currentEvaluation.entreprise.siret}
            </p>
          </div>
        </header>

        {error ? <ErrorMessage message={error} /> : null}
        {message ? (
          <p className="rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm">
            {message}
          </p>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{t.evaluationRse.editSocial}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <LabelCheckbox
                  label="ISO 45001"
                  checked={values.iso45001}
                  onChange={(checked) => updateBoolean("iso45001", checked)}
                />
                {values.iso45001 ? (
                  <MemoField
                    label={t.evaluationRse.iso45001Detail}
                    value={values.iso45001Detail}
                    onChange={(value) => updateText("iso45001Detail", value)}
                  />
                ) : null}

                <LabelCheckbox
                  label="ESS"
                  checked={values.ess}
                  onChange={(checked) => updateBoolean("ess", checked)}
                />

                <LabelCheckbox
                  label="Evaluation QVT"
                  checked={values.aEvaluationQvt}
                  onChange={(checked) =>
                    updateBoolean("aEvaluationQvt", checked)
                  }
                />
                {values.aEvaluationQvt ? (
                  <MemoField
                    label={t.evaluationRse.detailEvaluationQvt}
                    value={values.detailEvaluationQvt}
                    onChange={(value) => updateText("detailEvaluationQvt", value)}
                  />
                ) : null}

                <LabelCheckbox
                  label="Label employeur"
                  checked={values.aLabelEmployeur}
                  onChange={(checked) =>
                    updateBoolean("aLabelEmployeur", checked)
                  }
                />
                {values.aLabelEmployeur ? (
                  <MemoField
                    label={t.evaluationRse.detailLabelEmployeur}
                    value={values.detailLabelEmployeur}
                    onChange={(value) => updateText("detailLabelEmployeur", value)}
                  />
                ) : null}

                <LabelCheckbox
                  label="Vie associative locale"
                  checked={values.aVieAssociativeLocale}
                  onChange={(checked) =>
                    updateBoolean("aVieAssociativeLocale", checked)
                  }
                />
                {values.aVieAssociativeLocale ? (
                  <MemoField
                    label={t.evaluationRse.detailVieAssociativeLocale}
                    value={values.detailVieAssociativeLocale}
                    onChange={(value) =>
                      updateText("detailVieAssociativeLocale", value)
                    }
                  />
                ) : null}

                <LabelCheckbox
                  label="Egalite femmes-hommes"
                  checked={values.aEgaliteHF}
                  onChange={(checked) => updateBoolean("aEgaliteHF", checked)}
                />
                {values.aEgaliteHF ? (
                  <MemoField
                    label={t.evaluationRse.detailEgaliteHF}
                    value={values.detailEgaliteHF}
                    onChange={(value) => updateText("detailEgaliteHF", value)}
                  />
                ) : null}

                <LabelCheckbox
                  label="Autres"
                  checked={values.aAutresSocial}
                  onChange={(checked) => updateBoolean("aAutresSocial", checked)}
                />
                {values.aAutresSocial ? (
                  <MemoField
                    label={t.evaluationRse.detailAutresSocial}
                    value={values.detailAutresSocial}
                    onChange={(value) => updateText("detailAutresSocial", value)}
                  />
                ) : null}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {t.evaluationRse.save}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

type GovernanceFormValues = {
  aGouvernanceRse: boolean;
  detailGouvernanceRse: string;
  aEthique: boolean;
  detailEthique: string;
  aEnquetesPartenaires: boolean;
  detailEnquetesPartenaires: string;
  charteAchats: boolean;
  labelRfar: boolean;
  certifFscPefc: boolean;
  aAutresGouvernance: boolean;
  detailAutresGouvernance: string;
};

function governanceToFormValues(evaluation: EvaluationRse): GovernanceFormValues {
  const governance = evaluation.indicateursGouvernanceRse;

  return {
    aGouvernanceRse: governance?.aGouvernanceRse ?? false,
    detailGouvernanceRse: valueOrEmpty(governance?.detailGouvernanceRse),
    aEthique: governance?.aEthique ?? false,
    detailEthique: valueOrEmpty(governance?.detailEthique),
    aEnquetesPartenaires: governance?.aEnquetesPartenaires ?? false,
    detailEnquetesPartenaires: valueOrEmpty(governance?.detailEnquetesPartenaires),
    charteAchats: governance?.charteAchats ?? false,
    labelRfar: governance?.labelRfar ?? false,
    certifFscPefc: governance?.certifFscPefc ?? false,
    aAutresGouvernance: governance?.aAutresGouvernance ?? false,
    detailAutresGouvernance: valueOrEmpty(governance?.detailAutresGouvernance),
  };
}

function IndicateursGouvernanceRsePage({
  locale,
  token,
  evaluation,
  onBack,
  onSaved,
}: {
  locale: Locale;
  token: string;
  evaluation: EvaluationRse;
  onBack: (evaluation?: EvaluationRse) => void;
  onSaved: (evaluation: EvaluationRse) => void;
}) {
  const t = getTranslation(locale);
  const [currentEvaluation, setCurrentEvaluation] = useState(evaluation);
  const [values, setValues] = useState<GovernanceFormValues>(
    governanceToFormValues(evaluation),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function updateBoolean(field: keyof GovernanceFormValues, checked: boolean) {
    setValues((current) => ({
      ...current,
      [field]: checked,
    }));
  }

  function updateText(field: keyof GovernanceFormValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const savedEvaluation = await updateIndicateursGouvernanceRse(
        token,
        currentEvaluation.id!,
        {
          aGouvernanceRse: values.aGouvernanceRse,
          detailGouvernanceRse: values.aGouvernanceRse
            ? values.detailGouvernanceRse
            : null,
          aEthique: values.aEthique,
          detailEthique: values.aEthique ? values.detailEthique : null,
          aEnquetesPartenaires: values.aEnquetesPartenaires,
          detailEnquetesPartenaires: values.aEnquetesPartenaires
            ? values.detailEnquetesPartenaires
            : null,
          charteAchats: values.charteAchats,
          labelRfar: values.labelRfar,
          certifFscPefc: values.certifFscPefc,
          aAutresGouvernance: values.aAutresGouvernance,
          detailAutresGouvernance: values.aAutresGouvernance
            ? values.detailAutresGouvernance
            : null,
        },
      );
      setCurrentEvaluation(savedEvaluation);
      setValues(governanceToFormValues(savedEvaluation));
      onSaved(savedEvaluation);
      setMessage(t.evaluationRse.governanceSaved);
      onBack(savedEvaluation);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="container flex min-h-screen flex-col gap-6 py-6 sm:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button type="button" variant="ghost" onClick={() => onBack()}>
              <ArrowLeft className="h-4 w-4" />
              {t.actions.back}
            </Button>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {t.evaluationRse.governance}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {currentEvaluation.entreprise.raisonSociale} -{" "}
              {currentEvaluation.entreprise.siret}
            </p>
          </div>
        </header>

        {error ? <ErrorMessage message={error} /> : null}
        {message ? (
          <p className="rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm">
            {message}
          </p>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{t.evaluationRse.editGovernance}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <LabelCheckbox
                  label="Gouvernance RSE"
                  checked={values.aGouvernanceRse}
                  onChange={(checked) =>
                    updateBoolean("aGouvernanceRse", checked)
                  }
                />
                {values.aGouvernanceRse ? (
                  <MemoField
                    label={t.evaluationRse.detailGouvernanceRse}
                    value={values.detailGouvernanceRse}
                    onChange={(value) => updateText("detailGouvernanceRse", value)}
                  />
                ) : null}

                <LabelCheckbox
                  label="Ethique"
                  checked={values.aEthique}
                  onChange={(checked) => updateBoolean("aEthique", checked)}
                />
                {values.aEthique ? (
                  <MemoField
                    label={t.evaluationRse.detailEthique}
                    value={values.detailEthique}
                    onChange={(value) => updateText("detailEthique", value)}
                  />
                ) : null}

                <LabelCheckbox
                  label="Enquetes partenaires"
                  checked={values.aEnquetesPartenaires}
                  onChange={(checked) =>
                    updateBoolean("aEnquetesPartenaires", checked)
                  }
                />
                {values.aEnquetesPartenaires ? (
                  <MemoField
                    label={t.evaluationRse.detailEnquetesPartenaires}
                    value={values.detailEnquetesPartenaires}
                    onChange={(value) =>
                      updateText("detailEnquetesPartenaires", value)
                    }
                  />
                ) : null}

                <LabelCheckbox
                  label="Charte achats"
                  checked={values.charteAchats}
                  onChange={(checked) => updateBoolean("charteAchats", checked)}
                />
                <LabelCheckbox
                  label="Label RFAR"
                  checked={values.labelRfar}
                  onChange={(checked) => updateBoolean("labelRfar", checked)}
                />
                <LabelCheckbox
                  label="Certification FSC/PEFC"
                  checked={values.certifFscPefc}
                  onChange={(checked) => updateBoolean("certifFscPefc", checked)}
                />

                <LabelCheckbox
                  label="Autres"
                  checked={values.aAutresGouvernance}
                  onChange={(checked) =>
                    updateBoolean("aAutresGouvernance", checked)
                  }
                />
                {values.aAutresGouvernance ? (
                  <MemoField
                    label={t.evaluationRse.detailAutresGouvernance}
                    value={values.detailAutresGouvernance}
                    onChange={(value) =>
                      updateText("detailAutresGouvernance", value)
                    }
                  />
                ) : null}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {t.evaluationRse.save}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
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
  const [evaluation, setEvaluation] = useState<EvaluationRse | null>(null);
  const [labelsEvaluation, setLabelsEvaluation] = useState<EvaluationRse | null>(null);
  const [environmentEvaluation, setEnvironmentEvaluation] = useState<EvaluationRse | null>(null);
  const [socialEvaluation, setSocialEvaluation] = useState<EvaluationRse | null>(null);
  const [governanceEvaluation, setGovernanceEvaluation] = useState<EvaluationRse | null>(null);
  const [evaluationSection, setEvaluationSection] = useState<EvaluationSection>("labels");
  const [historyCompanyId, setHistoryCompanyId] = useState<string | null>(null);
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const isAdmin = String(user.role ?? "").toUpperCase() === "ADMIN";

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
        sortBy: "raisonSociale",
        order: "asc",
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

  const showCompanyList = useCallback((shouldPush = true) => {
    setEvaluation(null);
    setLabelsEvaluation(null);
    setEnvironmentEvaluation(null);
    setSocialEvaluation(null);
    setGovernanceEvaluation(null);
    setEvaluationSection("labels");
    setHistoryCompanyId(null);
    setIsCreateOpen(false);
    setEditingCompany(null);

    if (shouldPush) {
      pushUrlView("entreprises");
    }
  }, []);

  const openCreateCompany = useCallback((shouldPush = true) => {
    if (!isAdmin) {
      setError(t.companies.adminOnly);
      return;
    }

    setEvaluation(null);
    setLabelsEvaluation(null);
    setEnvironmentEvaluation(null);
    setSocialEvaluation(null);
    setGovernanceEvaluation(null);
    setHistoryCompanyId(null);
    setEditingCompany(null);
    setIsCreateOpen(true);

    if (shouldPush) {
      pushUrlView("create");
    }
  }, [isAdmin, t.companies.adminOnly]);

  const openEditCompany = useCallback((company: Company, shouldPush = true) => {
    if (!isAdmin) {
      setError(t.companies.adminOnly);
      return;
    }

    setEvaluation(null);
    setLabelsEvaluation(null);
    setEnvironmentEvaluation(null);
    setSocialEvaluation(null);
    setGovernanceEvaluation(null);
    setHistoryCompanyId(null);
    setIsCreateOpen(false);
    setEditingCompany(company);

    if (shouldPush) {
      pushUrlView("edit", { companyId: company.id });
    }
  }, [isAdmin, t.companies.adminOnly]);

  const openEditCompanyById = useCallback(async (companyId: string, shouldPush = true) => {
    if (!isAdmin) {
      setError(t.companies.adminOnly);
      return;
    }

    setError(null);

    try {
      const company = await getCompany(token, companyId);
      openEditCompany(company, shouldPush);
    } catch (error) {
      setError(getErrorMessage(error));
      showCompanyList(false);
    }
  }, [isAdmin, openEditCompany, showCompanyList, t.companies.adminOnly, token]);

  const openEvaluationByCompanyId = useCallback(async (
    companyId: string,
    shouldPush = true,
    section: EvaluationSection = "labels",
  ) => {
    setIsLoadingEvaluation(true);
    setError(null);

    try {
      const active = await getActiveEvaluationRse(token, companyId);

      if (active.evaluation) {
        setLabelsEvaluation(null);
        setEnvironmentEvaluation(null);
        setSocialEvaluation(null);
        setGovernanceEvaluation(null);
        setHistoryCompanyId(null);
        setEvaluationSection(section);
        setEvaluation(active.evaluation);
        setIsCreateOpen(false);
        setEditingCompany(null);

        if (shouldPush) {
          pushUrlView("evaluation", { companyId, section });
        }
        return;
      }

      if (!isAdmin) {
        setError(t.evaluationRse.notFound);
        return;
      }

      const currentEvaluation = await saveCurrentEvaluationRse(token, companyId);
      setLabelsEvaluation(null);
      setEnvironmentEvaluation(null);
      setSocialEvaluation(null);
      setGovernanceEvaluation(null);
      setHistoryCompanyId(null);
      setEvaluationSection(section);
      setEvaluation(currentEvaluation);
      setIsCreateOpen(false);
      setEditingCompany(null);

      if (shouldPush) {
        pushUrlView("evaluation", { companyId, section });
      }

      setCompanies((currentCompanies) =>
        currentCompanies.map((company) =>
          company.id === companyId
            ? {
              ...company,
              activeEvaluationRse: currentEvaluation.id
                ? {
                  id: currentEvaluation.id,
                  score: currentEvaluation.score,
                  note: currentEvaluation.note,
                  dateEvaluation: currentEvaluation.dateEvaluation,
                }
                : null,
            }
            : company,
        ),
      );
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoadingEvaluation(false);
    }
  }, [isAdmin, t.evaluationRse.notFound, token]);

  const openEvaluationHistory = useCallback((
    companyId: string,
    section: EvaluationSection = "labels",
    shouldPush = true,
  ) => {
    setEvaluation(null);
    setLabelsEvaluation(null);
    setEnvironmentEvaluation(null);
    setSocialEvaluation(null);
    setGovernanceEvaluation(null);
    setIsCreateOpen(false);
    setEditingCompany(null);
    setEvaluationSection(section);
    setHistoryCompanyId(companyId);

    if (shouldPush) {
      pushUrlView("evaluationHistory", { companyId, section });
    }
  }, []);

  const openEvaluationFromHistory = useCallback((
    nextEvaluation: EvaluationRse,
    section: EvaluationSection = "labels",
  ) => {
    setHistoryCompanyId(null);
    setLabelsEvaluation(null);
    setEnvironmentEvaluation(null);
    setSocialEvaluation(null);
    setGovernanceEvaluation(null);
    setIsCreateOpen(false);
    setEditingCompany(null);
    setEvaluationSection(section);
    setEvaluation(nextEvaluation);
    pushUrlView("evaluation", {
      companyId: nextEvaluation.entrepriseId,
      section,
    });
  }, []);

  const openLabelsEditor = useCallback((nextEvaluation: EvaluationRse, shouldPush = true) => {
    if (!isAdmin || !nextEvaluation.id) {
      return;
    }

    setEvaluation(null);
    setIsCreateOpen(false);
    setEditingCompany(null);
    setHistoryCompanyId(null);
    setEvaluationSection("labels");
    setLabelsEvaluation(nextEvaluation);

    if (shouldPush) {
      pushUrlView("labels", { evaluationId: nextEvaluation.id });
    }
  }, [isAdmin]);

  const openLabelsEditorById = useCallback(async (
    evaluationId: string,
    shouldPush = true,
  ) => {
    if (!isAdmin) {
      setError(t.companies.adminOnly);
      return;
    }

    setError(null);
    setIsLoadingEvaluation(true);

    try {
      const nextEvaluation = await getEvaluationRse(token, evaluationId);
      openLabelsEditor(nextEvaluation, shouldPush);
    } catch (error) {
      setError(getErrorMessage(error));
      showCompanyList(false);
    } finally {
      setIsLoadingEvaluation(false);
    }
  }, [isAdmin, openLabelsEditor, showCompanyList, t.companies.adminOnly, token]);

  const openEnvironmentEditor = useCallback((nextEvaluation: EvaluationRse, shouldPush = true) => {
    if (!isAdmin || !nextEvaluation.id) {
      return;
    }

    setEvaluation(null);
    setLabelsEvaluation(null);
    setIsCreateOpen(false);
    setEditingCompany(null);
    setHistoryCompanyId(null);
    setEvaluationSection("environment");
    setEnvironmentEvaluation(nextEvaluation);

    if (shouldPush) {
      pushUrlView("environment", { evaluationId: nextEvaluation.id });
    }
  }, [isAdmin]);

  const openEnvironmentEditorById = useCallback(async (
    evaluationId: string,
    shouldPush = true,
  ) => {
    if (!isAdmin) {
      setError(t.companies.adminOnly);
      return;
    }

    setError(null);
    setIsLoadingEvaluation(true);

    try {
      const nextEvaluation = await getEvaluationRse(token, evaluationId);
      openEnvironmentEditor(nextEvaluation, shouldPush);
    } catch (error) {
      setError(getErrorMessage(error));
      showCompanyList(false);
    } finally {
      setIsLoadingEvaluation(false);
    }
  }, [isAdmin, openEnvironmentEditor, showCompanyList, t.companies.adminOnly, token]);

  const openSocialEditor = useCallback((nextEvaluation: EvaluationRse, shouldPush = true) => {
    if (!isAdmin || !nextEvaluation.id) {
      return;
    }

    setEvaluation(null);
    setLabelsEvaluation(null);
    setEnvironmentEvaluation(null);
    setIsCreateOpen(false);
    setEditingCompany(null);
    setHistoryCompanyId(null);
    setEvaluationSection("social");
    setSocialEvaluation(nextEvaluation);

    if (shouldPush) {
      pushUrlView("social", { evaluationId: nextEvaluation.id });
    }
  }, [isAdmin]);

  const openSocialEditorById = useCallback(async (
    evaluationId: string,
    shouldPush = true,
  ) => {
    if (!isAdmin) {
      setError(t.companies.adminOnly);
      return;
    }

    setError(null);
    setIsLoadingEvaluation(true);

    try {
      const nextEvaluation = await getEvaluationRse(token, evaluationId);
      openSocialEditor(nextEvaluation, shouldPush);
    } catch (error) {
      setError(getErrorMessage(error));
      showCompanyList(false);
    } finally {
      setIsLoadingEvaluation(false);
    }
  }, [isAdmin, openSocialEditor, showCompanyList, t.companies.adminOnly, token]);

  const openGovernanceEditor = useCallback((nextEvaluation: EvaluationRse, shouldPush = true) => {
    if (!isAdmin || !nextEvaluation.id) {
      return;
    }

    setEvaluation(null);
    setLabelsEvaluation(null);
    setEnvironmentEvaluation(null);
    setSocialEvaluation(null);
    setIsCreateOpen(false);
    setEditingCompany(null);
    setHistoryCompanyId(null);
    setEvaluationSection("governance");
    setGovernanceEvaluation(nextEvaluation);

    if (shouldPush) {
      pushUrlView("governance", { evaluationId: nextEvaluation.id });
    }
  }, [isAdmin]);

  const openGovernanceEditorById = useCallback(async (
    evaluationId: string,
    shouldPush = true,
  ) => {
    if (!isAdmin) {
      setError(t.companies.adminOnly);
      return;
    }

    setError(null);
    setIsLoadingEvaluation(true);

    try {
      const nextEvaluation = await getEvaluationRse(token, evaluationId);
      openGovernanceEditor(nextEvaluation, shouldPush);
    } catch (error) {
      setError(getErrorMessage(error));
      showCompanyList(false);
    } finally {
      setIsLoadingEvaluation(false);
    }
  }, [isAdmin, openGovernanceEditor, showCompanyList, t.companies.adminOnly, token]);

  useEffect(() => {
    const applyUrlView = () => {
      const { view, companyId, evaluationId, section } = currentUrlView();

      if (view === "create") {
        openCreateCompany(false);
        return;
      }

      if (view === "edit" && companyId) {
        void openEditCompanyById(companyId, false);
        return;
      }

      if (view === "evaluation" && companyId) {
        void openEvaluationByCompanyId(companyId, false, section ?? "labels");
        return;
      }

      if (view === "evaluationHistory" && companyId) {
        openEvaluationHistory(companyId, section ?? "labels", false);
        return;
      }

      if (view === "labels" && evaluationId) {
        void openLabelsEditorById(evaluationId, false);
        return;
      }

      if (view === "environment" && evaluationId) {
        void openEnvironmentEditorById(evaluationId, false);
        return;
      }

      if (view === "social" && evaluationId) {
        void openSocialEditorById(evaluationId, false);
        return;
      }

      if (view === "governance" && evaluationId) {
        void openGovernanceEditorById(evaluationId, false);
        return;
      }

      if (!view) {
        pushUrlView("entreprises", {}, "replace");
      }

      showCompanyList(false);
    };

    applyUrlView();
    window.addEventListener("popstate", applyUrlView);

    return () => window.removeEventListener("popstate", applyUrlView);
  }, [
    openCreateCompany,
    openEditCompanyById,
    openEvaluationByCompanyId,
    openEvaluationHistory,
    openEnvironmentEditorById,
    openGovernanceEditorById,
    openLabelsEditorById,
    openSocialEditorById,
    showCompanyList,
  ]);

  const renderWithShell = (content: ReactNode) => (
    <div className="min-h-screen">
      <AppHeader
        locale={locale}
        onLocaleChange={onLocaleChange}
        onLogout={onLogout}
        onOpenEnterprises={() => showCompanyList()}
      />
      {content}
    </div>
  );

  if (historyCompanyId) {
    return renderWithShell(
      <EvaluationsHistoryPage
        locale={locale}
        token={token}
        companyId={historyCompanyId}
        isAdmin={isAdmin}
        onBack={() => void openEvaluationByCompanyId(historyCompanyId, true, evaluationSection)}
        onOpenEvaluation={(nextEvaluation) =>
          openEvaluationFromHistory(nextEvaluation, "labels")
        }
      />
    );
  }

  if (governanceEvaluation) {
    return renderWithShell(
      <IndicateursGouvernanceRsePage
        locale={locale}
        token={token}
        evaluation={governanceEvaluation}
        onBack={(savedEvaluation) => {
          const nextEvaluation = savedEvaluation ?? governanceEvaluation;
          setEvaluation(nextEvaluation);
          setEvaluationSection("governance");
          setGovernanceEvaluation(null);
          pushUrlView("evaluation", {
            companyId: nextEvaluation.entrepriseId,
            section: "governance",
          });
        }}
        onSaved={setGovernanceEvaluation}
      />
    );
  }

  if (socialEvaluation) {
    return renderWithShell(
      <IndicateursSociauxPage
        locale={locale}
        token={token}
        evaluation={socialEvaluation}
        onBack={(savedEvaluation) => {
          const nextEvaluation = savedEvaluation ?? socialEvaluation;
          setEvaluation(nextEvaluation);
          setEvaluationSection("social");
          setSocialEvaluation(null);
          pushUrlView("evaluation", {
            companyId: nextEvaluation.entrepriseId,
            section: "social",
          });
        }}
        onSaved={setSocialEvaluation}
      />
    );
  }

  if (environmentEvaluation) {
    return renderWithShell(
      <IndicateursEnvironnementauxPage
        locale={locale}
        token={token}
        evaluation={environmentEvaluation}
        onBack={(savedEvaluation) => {
          const nextEvaluation = savedEvaluation ?? environmentEvaluation;
          setEvaluation(nextEvaluation);
          setEvaluationSection("environment");
          setEnvironmentEvaluation(null);
          pushUrlView("evaluation", {
            companyId: nextEvaluation.entrepriseId,
            section: "environment",
          });
        }}
        onSaved={setEnvironmentEvaluation}
      />
    );
  }

  if (labelsEvaluation) {
    return renderWithShell(
      <LabelsEngagementsRsePage
        locale={locale}
        token={token}
        evaluation={labelsEvaluation}
        onBack={(savedEvaluation) => {
          const nextEvaluation = savedEvaluation ?? labelsEvaluation;
          setEvaluation(nextEvaluation);
          setEvaluationSection("labels");
          setLabelsEvaluation(null);
          pushUrlView("evaluation", {
            companyId: nextEvaluation.entrepriseId,
            section: "labels",
          });
        }}
        onSaved={setLabelsEvaluation}
      />
    );
  }

  if (evaluation) {
    return renderWithShell(
      <EvaluationRsePage
        locale={locale}
        token={token}
        evaluation={evaluation}
        initialSection={evaluationSection}
        isAdmin={isAdmin}
        onSaved={setEvaluation}
        onOpenHistory={openEvaluationHistory}
        onEditLabels={openLabelsEditor}
        onEditEnvironment={openEnvironmentEditor}
        onEditSocial={openSocialEditor}
        onEditGovernance={openGovernanceEditor}
      />
    );
  }

  return renderWithShell(
      <div className="container flex min-h-[calc(100vh-5rem)] flex-col gap-6 py-6 sm:py-8">
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
            {isLoadingEvaluation ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                {t.evaluationRse.title}
              </div>
            ) : null}
            {isAdmin ? (
              <Button
                type="button"
                onClick={() => {
                  if (isCreateOpen) {
                    showCompanyList();
                  } else {
                    openCreateCompany();
                  }
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
            onCancel={() => showCompanyList()}
            onSaved={async () => {
              await loadCompanies();
              showCompanyList();
            }}
          />
        ) : null}

        {isAdmin && editingCompany ? (
          <CompanyForm
            key={editingCompany.id}
            locale={locale}
            token={token}
            company={editingCompany}
            onCancel={() => showCompanyList()}
            onSaved={async () => {
              await loadCompanies();
              showCompanyList();
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
                    onEdit={(company) => openEditCompany(company)}
                    onEvaluate={(company) => void openEvaluationByCompanyId(company.id, true, "labels")}
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
                          <th className="px-5 py-4 text-right font-semibold">
                            {t.evaluationRse.note}
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
                              <td className="px-5 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <CompanyEvaluationNoteButton
                                    company={company}
                                    locale={locale}
                                    onEvaluate={(company) => void openEvaluationByCompanyId(company.id, true, "labels")}
                                  />
                                </div>
                              </td>
                              {isAdmin ? (
                                <td className="px-5 py-4 text-right">
                                  <div className="flex justify-end">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openEditCompany(company)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                      {t.actions.edit}
                                    </Button>
                                  </div>
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
  );
}
