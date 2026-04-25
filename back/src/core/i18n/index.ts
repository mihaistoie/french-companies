import { RequestHandler } from "express";
import { ZodIssue } from "zod";
import { Language, messages, supportedLanguages } from "./messages";

export function resolveLanguage(value: unknown): Language {
  if (typeof value === "string" && supportedLanguages.includes(value as Language)) {
    return value as Language;
  }

  return "fr";
}

export const languageMiddleware: RequestHandler = (req, _res, next) => {
  req.lang = resolveLanguage(req.query.lang);
  next();
};

export function t(lang: Language, key: keyof typeof messages.fr) {
  return messages[lang][key] ?? messages.fr[key] ?? key;
}

export function translateZodIssue(lang: Language, issue: ZodIssue) {
  const field = issue.path.at(-1);

  if (field === "siren") {
    return t(lang, "validation.siren_format");
  }

  if (field === "siret") {
    return t(lang, "validation.siret_format");
  }

  if (field === "codeNaf") {
    return t(lang, "validation.code_naf_format");
  }

  if (field === "email") {
    return t(lang, "validation.invalid_email");
  }

  if (field === "siteWeb") {
    return t(lang, "validation.invalid_url");
  }

  if (field === "id" || field === "idSocieteMere") {
    return t(lang, "validation.invalid_uuid");
  }

  switch (issue.code) {
    case "invalid_type":
      return issue.input === undefined ? t(lang, "validation.required") : t(lang, "validation.invalid_type");
    case "invalid_value":
      return t(lang, "validation.invalid_enum");
    case "too_small":
      return issue.origin === "string"
        ? t(lang, "validation.too_small_string")
        : t(lang, "validation.too_small_number");
    case "too_big":
      return issue.origin === "string"
        ? t(lang, "validation.too_big_string")
        : t(lang, "validation.too_big_number");
    case "invalid_format":
      if ((issue as { format?: string }).format === "email") {
        return t(lang, "validation.invalid_email");
      }

      if ((issue as { format?: string }).format === "url") {
        return t(lang, "validation.invalid_url");
      }

      return t(lang, "validation.invalid_type");
    default:
      return t(lang, "validation.invalid_type");
  }
}
