import { useEffect, useState } from "react";
import { ApiError, getMe, login, register, type AuthUser } from "@/lib/api";
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "@/lib/storage";

type AuthStatus = "idle" | "loading" | "authenticated" | "guest";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Une erreur inattendue est survenue.";
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedToken = getStoredToken();

    if (!savedToken) {
      setStatus("guest");
      return;
    }

    void restoreSession(savedToken);
  }, []);

  async function restoreSession(savedToken: string) {
    setStatus("loading");
    setError(null);

    try {
      const authenticatedUser = await getMe(savedToken);
      setToken(savedToken);
      setUser(authenticatedUser);
      setStatus("authenticated");
    } catch (error) {
      clearStoredToken();
      setToken(null);
      setUser(null);
      setStatus("guest");
      setError(getErrorMessage(error));
    }
  }

  async function signIn(payload: LoginPayload) {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await login(payload);
      setStoredToken(response.accessToken);
      const authenticatedUser = await getMe(response.accessToken);
      setToken(response.accessToken);
      setUser(authenticatedUser);
      setStatus("authenticated");
    } catch (error) {
      clearStoredToken();
      setToken(null);
      setUser(null);
      setStatus("guest");
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function signUp(payload: RegisterPayload) {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await register(payload);
      setStoredToken(response.accessToken);
      const authenticatedUser = await getMe(response.accessToken);
      setToken(response.accessToken);
      setUser(authenticatedUser);
      setStatus("authenticated");
      return { autoAuthenticated: true };
    } catch (error) {
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  function logout() {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setError(null);
    setStatus("guest");
  }

  return {
    user,
    token,
    error,
    status,
    isSubmitting,
    isAuthenticated: status === "authenticated" && !!user && !!token,
    restoreSession,
    signIn,
    signUp,
    logout,
    clearError: () => setError(null),
  };
}
