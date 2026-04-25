import { LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type AuthUser } from "@/lib/api";
import { type Locale, getTranslation } from "@/lib/translations";

type ProfileCardProps = {
  locale: Locale;
  user: AuthUser;
  onLogout: () => void;
};

export function ProfileCard({ locale, user, onLogout }: ProfileCardProps) {
  const t = getTranslation(locale);
  const displayName =
    typeof user.email === "string" && user.email.trim()
      ? user.email
      : t.dashboard.memberValue;
  const createdAt =
    typeof user.createdAt === "string" && user.createdAt
      ? new Date(user.createdAt).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US")
      : t.states.noUserData;

  const items = [
    {
      icon: UserRound,
      label: t.dashboard.welcome,
      value: displayName,
    },
    {
      icon: Mail,
      label: t.forms.email,
      value:
        typeof user.email === "string" && user.email.trim()
          ? user.email
          : t.states.noUserData,
    },
    {
      icon: ShieldCheck,
      label: t.dashboard.roleLabel,
      value:
        typeof user.role === "string" && user.role.trim()
          ? user.role
          : t.states.noUserData,
    },
    {
      icon: ShieldCheck,
      label: t.dashboard.memberSince,
      value: createdAt,
    },
  ];

  return (
    <Card className="w-full max-w-xl animate-fade-in">
      <CardHeader className="space-y-3">
        <CardTitle>{t.states.profileTitle}</CardTitle>
        <CardDescription>{t.states.profileDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-border/70 bg-background/70 p-4"
              >
                <div className="mb-3 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-2 break-words text-sm font-medium">{item.value}</p>
              </div>
            );
          })}
        </div>

        <Separator />

        <div className="rounded-2xl border border-border/70 bg-secondary/50 p-5">
          <p className="font-medium">{t.dashboard.securityTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.dashboard.securityDescription}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full rounded-2xl sm:w-auto"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          {t.actions.logout}
        </Button>
      </CardContent>
    </Card>
  );
}
