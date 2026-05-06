import { useState, type FormEvent } from "react";
import { LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Locale, getTranslation } from "@/lib/translations";

type RegisterFormProps = {
  locale: Locale;
  isSubmitting: boolean;
  onSubmit: (values: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }) => Promise<void>;
};

export function RegisterForm({
  locale,
  isSubmitting,
  onSubmit,
}: RegisterFormProps) {
  const t = getTranslation(locale);
  const [values, setValues] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (!values.email.trim()) {
      nextErrors.email = t.forms.required;
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      nextErrors.email = t.forms.invalidEmail;
    }

    if (!values.firstName.trim()) {
      nextErrors.firstName = t.forms.required;
    }

    if (!values.lastName.trim()) {
      nextErrors.lastName = t.forms.required;
    }

    if (!values.password) {
      nextErrors.password = t.forms.required;
    } else if (values.password.length < 8) {
      nextErrors.password = t.forms.passwordLength;
    }

    if (!values.confirmPassword) {
      nextErrors.confirmPassword = t.forms.required;
    } else if (values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = t.forms.passwordMismatch;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      email: values.email,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      password: values.password,
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="register-first-name">{t.forms.firstName}</Label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-first-name"
            type="text"
            autoComplete="given-name"
            value={values.firstName}
            placeholder={t.forms.firstNamePlaceholder}
            className="pl-11"
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                firstName: event.target.value,
              }))
            }
          />
        </div>
        {errors.firstName ? (
          <p className="text-sm text-danger">{errors.firstName}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-last-name">{t.forms.lastName}</Label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-last-name"
            type="text"
            autoComplete="family-name"
            value={values.lastName}
            placeholder={t.forms.lastNamePlaceholder}
            className="pl-11"
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                lastName: event.target.value,
              }))
            }
          />
        </div>
        {errors.lastName ? (
          <p className="text-sm text-danger">{errors.lastName}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">{t.forms.email}</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-email"
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
        <Label htmlFor="register-password">{t.forms.password}</Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
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

      <div className="space-y-2">
        <Label htmlFor="register-confirm-password">{t.forms.confirmPassword}</Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            placeholder={t.forms.confirmPasswordPlaceholder}
            className="pl-11"
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                confirmPassword: event.target.value,
              }))
            }
          />
        </div>
        {errors.confirmPassword ? (
          <p className="text-sm text-danger">{errors.confirmPassword}</p>
        ) : null}
      </div>

      <Button className="w-full rounded-2xl" disabled={isSubmitting} type="submit">
        {isSubmitting ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            {t.states.loadingAction}
          </>
        ) : (
          t.actions.createAccount
        )}
      </Button>
    </form>
  );
}
