const TOKEN_KEY = "mypham.auth.token";
const USER_KEY = "mypham.auth.user";

export type StoredUser = {
  id: number;
  hoTen: string;
  email: string;
  soDienThoai?: string;
  vaiTro: "CUSTOMER" | "ADMIN";
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export const authStorage = {
  getToken(): string | null {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(TOKEN_KEY, token);
  },

  getUser(): StoredUser | null {
    if (!isBrowser()) return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  },

  setUser(user: StoredUser): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  },
};
