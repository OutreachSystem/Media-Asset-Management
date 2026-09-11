const BASE = import.meta.env.VITE_API_BASE_URL || "";

export function getToken() {
  return sessionStorage.getItem("noah_token");
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (res.status === 401) {
    sessionStorage.removeItem("noah_token");
    sessionStorage.removeItem("noah_user");
    if (!path.includes("/auth/login") && !path.includes("/auth/signup")) {
      window.location.assign("/login");
    }
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json as T;
}

export type Role = "Super Admin" | "Admin" | "Editor" | "Collaborator" | "Viewer";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  orgId: string;
};

export type Plan = {
  id: string;
  name: string;
  price: string;
  storage: string;
  seats: string;
  features: string[];
};

export type Workspace = { id: string; name: string; color: string; orgId: string };
export type Project = { id: string; name: string; workspaceId: string };
export type Folder = { id: string; name: string; workspaceId: string; projectId?: string | null };
export type Tag = { id: string; name: string; color: string };

export type MediaItem = {
  id: string;
  title: string;
  type: "video" | "image" | "audio";
  workspaceId: string;
  folderId: string | null;
  projectId: string | null;
  duration: number;
  size: string;
  codec: string;
  thumbnail: string;
  src: string;
  tagIds: string[];
  tags: Tag[];
  uploaderName: string;
  annotationCount: number;
  createdAt: string;
};

export type Annotation = {
  id: string;
  mediaId: string;
  tSeconds: number;
  body: string;
  authorId: string;
  authorName: string;
  xPercent: number;
  yPercent: number;
  createdAt: string;
};

export type Activity = {
  id: string;
  message: string;
  at: string;
  actorName: string;
};

export function canWrite(role?: Role) {
  return !!role && role !== "Viewer";
}

export function canAdmin(role?: Role) {
  return role === "Super Admin" || role === "Admin";
}

export function formatTimecode(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}
