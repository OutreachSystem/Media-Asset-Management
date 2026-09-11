import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  api,
  type Folder,
  type Plan,
  type Project,
  type Tag,
  type User,
  type Workspace,
} from "../api/client";

type Org = { id: string; name: string; planId: string };

type Bootstrap = {
  org: Org;
  plan?: Plan;
  workspaces: Workspace[];
  projects: Project[];
  folders: Folder[];
  tags: Tag[];
  members: User[];
};

type Ctx = Bootstrap & {
  workspaceId: string;
  setWorkspaceId: (id: string) => void;
  refresh: () => Promise<void>;
};

const AppDataContext = createContext<Ctx | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Bootstrap | null>(null);
  const [workspaceId, setWorkspaceId] = useState("");

  async function refresh() {
    const res = await api<{ data: Bootstrap }>("/api/v1/bootstrap");
    setData(res.data);
    setWorkspaceId((current) => current || res.data.workspaces[0]?.id || "");
  }

  useEffect(() => {
    refresh().catch(() => undefined);
  }, []);

  const value = useMemo<Ctx | null>(() => {
    if (!data) return null;
    return { ...data, workspaceId, setWorkspaceId, refresh };
  }, [data, workspaceId]);

  if (!value) {
    return (
      <div style={{ padding: 32, color: "#9aa3b8" }}>Loading workspace…</div>
    );
  }
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("AppDataProvider missing");
  return ctx;
}
