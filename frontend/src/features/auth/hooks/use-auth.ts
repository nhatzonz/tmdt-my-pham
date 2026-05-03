"use client";

import { useEffect, useState } from "react";
import { authStorage, type StoredUser } from "@/lib/auth-storage";

export function useAuth() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUser(authStorage.getUser());
    setLoaded(true);

    const onStorage = () => setUser(authStorage.getUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function login(token: string, nextUser: StoredUser) {
    authStorage.setToken(token);
    authStorage.setUser(nextUser);
    setUser(nextUser);
  }

  function updateUser(nextUser: StoredUser) {
    authStorage.setUser(nextUser);
    setUser(nextUser);
  }

  function logout() {
    authStorage.clear();
    setUser(null);
  }

  return { user, loaded, login, logout, updateUser };
}
