import { useState } from "react";
import { AuthPage } from "@/pages/auth-page";
import { CompaniesPage } from "@/pages/companies-page";
import { useAuth } from "@/hooks/use-auth";
import { useLocale } from "@/hooks/use-locale";
import { getStoredToken } from "@/lib/storage";

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
      }}
      onRegister={async (values) => {
        clearError();
        const result = await signUp(values);
        setSuccess(
          result.autoAuthenticated
            ? t.forms.autoLoginSuccess
            : t.forms.registerSuccess,
        );
      }}
      onLogout={() => {
        setSuccess(null);
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
