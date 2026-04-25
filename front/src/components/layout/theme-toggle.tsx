import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";
import { Button } from "@/components/ui/button";
import { type Locale, getTranslation } from "@/lib/translations";

type ThemeToggleProps = {
  locale: Locale;
};

export function ThemeToggle({ locale }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const t = getTranslation(locale);

  const options = [
    { value: "light", icon: Sun },
    { value: "dark", icon: Moon },
    { value: "system", icon: Laptop },
  ] as const;

  return (
    <div className="flex items-center gap-1 rounded-2xl border border-border/70 bg-background/70 p-1">
      <span className="px-2 text-xs font-medium text-muted-foreground">
        {t.actions.theme}
      </span>
      {options.map((option) => {
        const Icon = option.icon;

        return (
          <Button
            key={option.value}
            variant={theme === option.value ? "secondary" : "ghost"}
            size="icon"
            type="button"
            onClick={() => setTheme(option.value)}
            aria-label={`${t.actions.theme}: ${option.value}`}
            className="h-9 w-9 rounded-xl"
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
    </div>
  );
}
