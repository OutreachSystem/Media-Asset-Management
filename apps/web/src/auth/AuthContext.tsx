import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { api, type User } from "../api/client";

type AuthState = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (orgName: string, name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

function persist(token: string, user: User) {
  sessionStorage.setItem("noah_token", token);
  sessionStorage.setItem("noah_user", JSON.stringify(user));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem("noah_token"));
  const [user, setUser] = useState<User | null>(() => {
    const raw = sessionStorage.getItem("noah_user");
    return raw ? (JSON.parse(raw) as User) : null;
  });

  const value = useMemo<AuthState>(
    () => ({
      user,
      token,
      async login(email, password) {
        const res = await api<{ data: { accessToken: string; user: User } }>("/api/v1/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        persist(res.data.accessToken, res.data.user);
        setToken(res.data.accessToken);
        setUser(res.data.user);
      },
      async signup(orgName, name, email, password) {
        const res = await api<{ data: { accessToken: string; user: User; needsPlan?: boolean } }>(
          "/api/v1/auth/signup",
          { method: "POST", body: JSON.stringify({ orgName, name, email, password }) },
        );
        persist(res.data.accessToken, res.data.user);
        setToken(res.data.accessToken);
        setUser(res.data.user);
        return Boolean(res.data.needsPlan);
      },
      logout() {
        sessionStorage.removeItem("noah_token");
        sessionStorage.removeItem("noah_user");
        setToken(null);
        setUser(null);
      },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider missing");
  return ctx;
}
