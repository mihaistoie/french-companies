import { useState, type FormEvent } from "react";
import { LoaderCircle, Mail, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Locale, getTranslation } from "@/lib/translations";

type LoginFormProps = {
  locale: Locale;
  isSubmitting: boolean;
  onSubmit: (values: { email: string; password: string }) => Promise<void>;
};

export function LoginForm({
  locale,
  isSubmitting,
  onSubmit,
}: LoginFormProps) {
  const t = getTranslation(locale);
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (!values.email.trim()) {
      nextErrors.email = t.forms.required;
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      nextErrors.email = t.forms.invalidEmail;
    }

    if (!values.password) {
      nextErrors.password = t.forms.required;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit(values);
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="login-email">{t.forms.email}</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={values.email}
            placeholder={t.forms.emailPlaceholder}
            className="pl-11"
            onChange={(event) =>
              setValues((current) => ({ ...current, email: event.target.value }))
            }
          />
        </div>
        {errors.email ? (
          <p className="text-sm text-danger">{errors.email}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">{t.forms.password}</Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            placeholder={t.forms.passwordPlaceholder}
            className="pl-11"
            onChange={(event) =>
              setValues((current) => ({ ...current, password: event.target.value }))
            }
          />
        </div>
        {errors.password ? (
          <p className="text-sm text-danger">{errors.password}</p>
        ) : null}
      </div>

      <Button className="w-full rounded-2xl" disabled={isSubmitting} type="submit">
        {isSubmitting ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            {t.states.loadingAction}
          </>
        ) : (
          t.actions.login
        )}
      </Button>
    </form>
  );
}
