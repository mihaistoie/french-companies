export const AUTH_TOKEN_KEY = "nova-auth-token";
export const LANGUAGE_KEY = "nova-language";

export function getStoredToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearStoredToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getStoredLanguage() {
  return window.localStorage.getItem(LANGUAGE_KEY);
}

export function setStoredLanguage(language: string) {
  window.localStorage.setItem(LANGUAGE_KEY, language);
}
