// src/api/token.ts
const TOKEN_KEY = "auth_token";

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}
``