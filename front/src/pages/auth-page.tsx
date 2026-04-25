import { useState } from "react";
import { AuthCard, type AuthView } from "@/components/auth/auth-card";
import { ProfileCard } from "@/components/auth/profile-card";
import { LoadingState } from "@/components/common/loading-state";
import { HeroPanel } from "@/components/layout/hero-panel";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { type AuthUser } from "@/lib/api";
import { type Locale, getTranslation } from "@/lib/translations";

type AuthPageProps = {
  locale: Locale;
  isSubmitting: boolean;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  user: AuthUser | null;
  error: string | null;
  success: string | null;
  onLocaleChange: (locale: Locale) => void;
  onLogin: (values: { email: string; password: string }) => Promise<void>;
  onRegister: (values: {
    email: string;
    password: string;
  }) => Promise<void>;
  onLogout: () => void;
  onRetrySession: () => void;
};

export function AuthPage({
  locale,
  isSubmitting,
  isAuthenticated,
  isLoadingSession,
  user,
  error,
  success,
  onLocaleChange,
  onLogin,
  onRegister,
  onLogout,
  onRetrySession,
}: AuthPageProps) {
  const [view, setView] = useState<AuthView>("login");
  const t = getTranslation(locale);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="hero-orb left-[-4rem] top-[-3rem] h-64 w-64 bg-primary/15" />
      <div className="hero-orb bottom-[-4rem] right-[-4rem] h-72 w-72 bg-accent/10" />

      <div className="container relative z-10 flex min-h-screen flex-col py-6 sm:py-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              {t.brand.badge}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {t.brand.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LanguageToggle locale={locale} onChange={onLocaleChange} />
            <ThemeToggle locale={locale} />
          </div>
        </header>

        <section className="grid flex-1 items-stretch gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <HeroPanel locale={locale} />

          <div className="flex min-h-[540px] items-center justify-center">
            {isLoadingSession ? (
              <div className="w-full max-w-xl space-y-4">
                <LoadingState title={t.states.loadingSession} />
                {error ? (
                  <div className="flex justify-center">
                    <Button variant="outline" onClick={onRetrySession}>
                      {t.actions.retry}
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : isAuthenticated && user ? (
              <ProfileCard locale={locale} user={user} onLogout={onLogout} />
            ) : (
              <AuthCard
                locale={locale}
                view={view}
                isSubmitting={isSubmitting}
                error={error}
                success={success}
                onViewChange={setView}
                onLogin={onLogin}
                onRegister={async (values) => {
                  await onRegister(values);
                  setView("login");
                }}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
