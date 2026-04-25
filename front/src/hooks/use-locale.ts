import { useEffect, useState } from "react";
import {
  getStoredLanguage,
  setStoredLanguage,
} from "@/lib/storage";
import {
  getTranslation,
  type Locale,
} from "@/lib/translations";

export function useLocale() {
  const [locale, setLocale] = useState<Locale>("fr");

  useEffect(() => {
    const savedLanguage = getStoredLanguage();

    if (savedLanguage === "fr" || savedLanguage === "en") {
      setLocale(savedLanguage);
    }
  }, []);

  function updateLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    setStoredLanguage(nextLocale);
  }

  return {
    locale,
    setLocale: updateLocale,
    t: getTranslation(locale),
  };
}
