import { Sparkles } from "lucide-react";
import { ErrorMessage } from "@/components/common/error-message";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs } from "@/components/ui/tabs";
import { type Locale, getTranslation } from "@/lib/translations";

export type AuthView = "login" | "register";

type AuthCardProps = {
  locale: Locale;
  view: AuthView;
  isSubmitting: boolean;
  error?: string | null;
  success?: string | null;
  onViewChange: (view: AuthView) => void;
  onLogin: (values: { email: string; password: string }) => Promise<void>;
  onRegister: (values: {
    email: string;
    password: string;
  }) => Promise<void>;
};

export function AuthCard({
  locale,
  view,
  isSubmitting,
  error,
  success,
  onViewChange,
  onLogin,
  onRegister,
}: AuthCardProps) {
  const t = getTranslation(locale);
  const title = view === "login" ? t.forms.loginTitle : t.forms.registerTitle;
  const description =
    view === "login" ? t.forms.loginDescription : t.forms.registerDescription;

  return (
    <Card className="w-full max-w-xl animate-fade-in overflow-hidden">
      <CardHeader className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>

        <Tabs
          value={view}
          onValueChange={onViewChange}
          options={[
            { value: "login", label: t.actions.login },
            { value: "register", label: t.actions.register },
          ]}
        />
      </CardHeader>

      <CardContent className="space-y-5">
        {error ? <ErrorMessage message={error} /> : null}
        {success ? <ErrorMessage message={success} variant="default" /> : null}

        {view === "login" ? (
          <LoginForm
            locale={locale}
            isSubmitting={isSubmitting}
            onSubmit={onLogin}
          />
        ) : (
          <RegisterForm
            locale={locale}
            isSubmitting={isSubmitting}
            onSubmit={onRegister}
          />
        )}

        <Separator />

        <div>
          <p className="text-sm font-medium">{t.states.unauthenticatedTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.states.unauthenticatedDescription}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
