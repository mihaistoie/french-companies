import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Locale, getTranslation } from "@/lib/translations";

type LanguageToggleProps = {
  locale: Locale;
  onChange: (locale: Locale) => void;
};

export function LanguageToggle({
  locale,
  onChange,
}: LanguageToggleProps) {
  const t = getTranslation(locale);

  return (
    <div className="flex items-center gap-1 rounded-2xl border border-border/70 bg-background/70 p-1">
      <span className="inline-flex items-center gap-2 px-2 text-xs font-medium text-muted-foreground">
        <Languages className="h-3.5 w-3.5" />
        {t.actions.language}
      </span>
      {(["fr", "en"] as const).map((value) => (
        <Button
          key={value}
          type="button"
          variant={locale === value ? "secondary" : "ghost"}
          size="sm"
          className="rounded-xl uppercase"
          onClick={() => onChange(value)}
        >
          {value}
        </Button>
      ))}
    </div>
  );
}
