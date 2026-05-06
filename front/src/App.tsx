import { useState } from "react";
import { AuthPage } from "@/pages/auth-page";
import { CompaniesPage } from "@/pages/companies-page";
import { useAuth } from "@/hooks/use-auth";
import { useLocale } from "@/hooks/use-locale";
import { getStoredToken } from "@/lib/storage";

function replaceWithNeutralUrl() {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  window.history.replaceState({}, "", url);
}

function App() {
  const { locale, setLocale, t } = useLocale();
  const {
    user,
    error,
    status,
    token,
    isSubmitting,
    isAuthenticated,
    signIn,
    signUp,
    logout,
    restoreSession,
    clearError,
  } = useAuth();
  const [success, setSuccess] = useState<string | null>(null);

  if (isAuthenticated && user && token) {
    return (
      <CompaniesPage
        locale={locale}
        token={token}
        user={user}
        onLocaleChange={setLocale}
        onLogout={() => {
          setSuccess(null);
          replaceWithNeutralUrl();
          logout();
        }}
      />
    );
  }

  return (
    <AuthPage
      locale={locale}
      isSubmitting={isSubmitting}
      isAuthenticated={isAuthenticated}
      isLoadingSession={status === "idle" || status === "loading"}
      user={user}
      error={error}
      success={success}
      onLocaleChange={setLocale}
      onLogin={async (values) => {
        clearError();
        setSuccess(null);
        await signIn(values);
        replaceWithNeutralUrl();
      }}
      onRegister={async (values) => {
        clearError();
        const result = await signUp(values);
        replaceWithNeutralUrl();
        setSuccess(
          result.autoAuthenticated
            ? t.forms.autoLoginSuccess
            : t.forms.registerSuccess,
        );
      }}
      onLogout={() => {
        setSuccess(null);
        replaceWithNeutralUrl();
        logout();
      }}
      onRetrySession={() => {
        const token = getStoredToken();

        if (token) {
          void restoreSession(token);
        }
      }}
    />
  );
}

export default App;
