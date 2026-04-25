import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Locale, getTranslation } from "@/lib/translations";

type HeroPanelProps = {
  locale: Locale;
};

export function HeroPanel({ locale }: HeroPanelProps) {
  const t = getTranslation(locale);
  const icons = [ShieldCheck, Zap, Sparkles];

  return (
    <section className="relative hidden overflow-hidden rounded-[2rem] border border-border/60 bg-card/75 p-10 shadow-2xl shadow-primary/10 backdrop-blur xl:flex xl:min-h-[720px] xl:flex-col xl:justify-between">
      <div className="hero-orb left-[-4rem] top-[-3rem] h-40 w-40 bg-primary/30" />
      <div className="hero-orb bottom-0 right-0 h-52 w-52 bg-accent/20" />

      <div className="relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          {t.brand.badge}
        </div>
        <div className="space-y-4">
          <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-balance">
            {t.brand.heroTitle}
          </h1>
          <p className="max-w-lg text-lg leading-8 text-muted-foreground">
            {t.brand.heroDescription}
          </p>
        </div>

        <Button size="lg" className="rounded-2xl">
          {t.actions.discover}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative z-10 grid gap-4">
        {t.brand.heroPoints.map((point, index) => {
          const Icon = icons[index] ?? ShieldCheck;

          return (
            <div
              key={point}
              className="flex items-start gap-4 rounded-2xl border border-border/60 bg-background/50 p-4"
            >
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{point}</p>
                <p className="text-sm text-muted-foreground">
                  {t.brand.name}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
