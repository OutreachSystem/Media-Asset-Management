import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { loadStore, getStore, mutate, resetStore } from "./store.js";
import { PLANS, PASSWORD, canWrite, canAdmin } from "./seed.js";

const app = express();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || "noah-demo-secret";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5174";

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

function publicUser(user) {
  const { password, ...safe } = user;
  return safe;
}

function signUser(user) {
  return jwt.sign(publicUser(user), JWT_SECRET, { expiresIn: "12h" });
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

function requireWrite(req, res, next) {
  if (!canWrite(req.user.role)) {
    return res.status(403).json({ error: "Viewers can only view. Ask an editor or admin to upload or comment." });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!canAdmin(req.user.role)) return res.status(403).json({ error: "Admin only" });
  next();
}

function logActivity(store, actorId, message) {
  store.activities.unshift({
    id: `act_${randomUUID().slice(0, 8)}`,
    orgId: store.org.id,
    actorId,
    message,
    at: new Date().toISOString(),
  });
}

function hydrateMedia(store, item) {
  const tags = store.tags.filter((t) => item.tagIds.includes(t.id));
  const uploader = store.users.find((u) => u.id === item.uploadedBy);
  return {
    ...item,
    tags,
    uploaderName: uploader?.name || "Unknown",
    annotationCount: store.annotations.filter((a) => a.mediaId === item.id).length,
  };
}

app.get("/health", (_req, res) => res.json({ ok: true, service: "noah-api" }));

app.get("/api/v1/plans", (_req, res) => {
  res.json({ data: PLANS });
});

app.post("/api/v1/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const user = getStore().users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ data: { accessToken: signUser(user), user: publicUser(user) } });
});

app.post("/api/v1/auth/signup", async (req, res) => {
  const { orgName, name, email, password } = req.body || {};
  if (!orgName || !name || !email || !password) {
    return res.status(400).json({ error: "Organization, name, email, and password are required" });
  }
  const existing = getStore().users.find((u) => u.email === email);
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const user = await mutate((store) => {
    store.org.name = orgName;
    store.org.planId = "free";
    const created = {
      id: `usr_${randomUUID().slice(0, 8)}`,
      orgId: store.org.id,
      name,
      email,
      password,
      role: "Super Admin",
    };
    store.users.push(created);
    logActivity(store, created.id, `${name} registered organization ${orgName} on the Free plan`);
    return created;
  });
  res.status(201).json({ data: { accessToken: signUser(user), user: publicUser(user), needsPlan: true } });
});

app.get("/api/v1/auth/me", auth, (req, res) => {
  const user = getStore().users.find((u) => u.id === req.user.id);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  res.json({ data: publicUser(user), org: getStore().org });
});

app.post("/api/v1/org/plan", auth, async (req, res) => {
  const plan = PLANS.find((p) => p.id === req.body?.planId);
  if (!plan) return res.status(400).json({ error: "Unknown plan" });
  const org = await mutate((store) => {
    store.org.planId = plan.id;
    logActivity(store, req.user.id, `${req.user.name} selected the ${plan.name} plan`);
    return store.org;
  });
  res.json({ data: org });
});

app.get("/api/v1/bootstrap", auth, (_req, res) => {
  const store = getStore();
  res.json({
    data: {
      org: store.org,
      plan: PLANS.find((p) => p.id === store.org.planId),
      workspaces: store.workspaces,
      projects: store.projects,
      folders: store.folders,
      tags: store.tags,
      members: store.users.map(publicUser),
    },
  });
});

app.post("/api/v1/workspaces", auth, requireWrite, async (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "Name required" });
  const workspace = await mutate((store) => {
    const created = {
      id: `ws_${randomUUID().slice(0, 8)}`,
      orgId: store.org.id,
      name,
      color: req.body?.color || "#8e44ad",
    };
    store.workspaces.push(created);
    logActivity(store, req.user.id, `${req.user.name} created workspace ${name}`);
    return created;
  });
  res.status(201).json({ data: workspace });
});

app.post("/api/v1/projects", auth, requireWrite, async (req, res) => {
  const { workspaceId, name } = req.body || {};
  if (!workspaceId || !name) return res.status(400).json({ error: "Workspace and name required" });
  const project = await mutate((store) => {
    const created = {
      id: `prj_${randomUUID().slice(0, 8)}`,
      workspaceId,
      name: String(name).trim(),
    };
    store.projects.push(created);
    logActivity(store, req.user.id, `${req.user.name} created project ${created.name}`);
    return created;
  });
  res.status(201).json({ data: project });
});

app.post("/api/v1/folders", auth, requireWrite, async (req, res) => {
  const { workspaceId, projectId, name } = req.body || {};
  if (!workspaceId || !name) return res.status(400).json({ error: "Workspace and name required" });
  const folder = await mutate((store) => {
    const created = {
      id: `fld_${randomUUID().slice(0, 8)}`,
      workspaceId,
      projectId: projectId || null,
      name: String(name).trim(),
    };
    store.folders.push(created);
    logActivity(store, req.user.id, `${req.user.name} created folder ${created.name}`);
    return created;
  });
  res.status(201).json({ data: folder });
});

app.get("/api/v1/media", auth, (req, res) => {
  const { workspaceId, folderId, projectId, q, type, tag } = req.query;
  const store = getStore();
  let items = [...store.media];
  if (workspaceId) items = items.filter((m) => m.workspaceId === workspaceId);
  if (folderId) items = items.filter((m) => m.folderId === folderId);
  if (projectId) items = items.filter((m) => m.projectId === projectId);
  if (type) items = items.filter((m) => m.type === type);
  if (tag) items = items.filter((m) => m.tagIds.includes(String(tag)));
  if (q) {
    const needle = String(q).toLowerCase();
    items = items.filter((m) => m.title.toLowerCase().includes(needle));
  }
  res.json({ data: items.map((m) => hydrateMedia(store, m)) });
});

app.get("/api/v1/media/:id", auth, (req, res) => {
  const store = getStore();
  const item = store.media.find((m) => m.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  const notes = store.annotations
    .filter((a) => a.mediaId === item.id)
    .sort((a, b) => a.tSeconds - b.tSeconds)
    .map((a) => ({
      ...a,
      authorName: store.users.find((u) => u.id === a.authorId)?.name || "Unknown",
    }));
  res.json({ data: { ...hydrateMedia(store, item), annotations: notes } });
});

app.post("/api/v1/media", auth, requireWrite, async (req, res) => {
  const { workspaceId, folderId, projectId, title, type } = req.body || {};
  if (!workspaceId || !title) return res.status(400).json({ error: "Workspace and title required" });
  const created = await mutate((store) => {
    const item = {
      id: `med_${randomUUID().slice(0, 8)}`,
      workspaceId,
      folderId: folderId || null,
      projectId: projectId || null,
      type: type || "video",
      title,
      duration: type === "image" ? 0 : 120,
      size: "24 MB",
      codec: type === "image" ? "JPEG" : "H.264",
      thumbnail: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&q=80",
      src: type === "video" ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" : "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1600&q=80",
      tagIds: [],
      uploadedBy: req.user.id,
      createdAt: new Date().toISOString(),
    };
    store.media.unshift(item);
    logActivity(store, req.user.id, `${req.user.name} uploaded ${title}`);
    return hydrateMedia(store, item);
  });
  res.status(201).json({ data: created });
});

app.post("/api/v1/media/:id/tags", auth, requireWrite, async (req, res) => {
  const tagIds = Array.isArray(req.body?.tagIds) ? req.body.tagIds : [];
  const item = await mutate((store) => {
    const found = store.media.find((m) => m.id === req.params.id);
    if (!found) throw new Error("NOT_FOUND");
    found.tagIds = tagIds;
    logActivity(store, req.user.id, `${req.user.name} updated tags on ${found.title}`);
    return hydrateMedia(store, found);
  }).catch((err) => (err.message === "NOT_FOUND" ? null : Promise.reject(err)));
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json({ data: item });
});

app.post("/api/v1/annotations", auth, requireWrite, async (req, res) => {
  const { mediaId, tSeconds, body, xPercent, yPercent } = req.body || {};
  if (!mediaId || !body) return res.status(400).json({ error: "Media and comment required" });
  const note = await mutate((store) => {
    const media = store.media.find((m) => m.id === mediaId);
    if (!media) throw new Error("NOT_FOUND");
    const created = {
      id: `ann_${randomUUID().slice(0, 8)}`,
      mediaId,
      tSeconds: Number(tSeconds) || 0,
      body: String(body).trim(),
      authorId: req.user.id,
      xPercent: xPercent ?? 50,
      yPercent: yPercent ?? 50,
      createdAt: new Date().toISOString(),
    };
    store.annotations.push(created);
    const mm = String(Math.floor(created.tSeconds / 60)).padStart(2, "0");
    const ss = String(created.tSeconds % 60).padStart(2, "0");
    logActivity(store, req.user.id, `${req.user.name} annotated ${media.title} at ${mm}:${ss}`);
    return { ...created, authorName: req.user.name };
  }).catch((err) => (err.message === "NOT_FOUND" ? null : Promise.reject(err)));
  if (!note) return res.status(404).json({ error: "Not found" });
  res.status(201).json({ data: note });
});

app.get("/api/v1/tags", auth, (_req, res) => {
  res.json({ data: getStore().tags });
});

app.post("/api/v1/tags", auth, requireWrite, async (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "Name required" });
  const tag = await mutate((store) => {
    const created = {
      id: `tag_${randomUUID().slice(0, 8)}`,
      name,
      color: req.body?.color || "#d28cff",
    };
    store.tags.push(created);
    logActivity(store, req.user.id, `${req.user.name} created tag ${name}`);
    return created;
  });
  res.status(201).json({ data: tag });
});

app.get("/api/v1/activity", auth, (_req, res) => {
  const store = getStore();
  const rows = store.activities.map((a) => ({
    ...a,
    actorName: store.users.find((u) => u.id === a.actorId)?.name || "System",
  }));
  res.json({ data: rows });
});

app.get("/api/v1/members", auth, (_req, res) => {
  res.json({ data: getStore().users.map(publicUser) });
});

app.patch("/api/v1/members/:id", auth, requireAdmin, async (req, res) => {
  const role = req.body?.role;
  const allowed = ["Super Admin", "Admin", "Editor", "Collaborator", "Viewer"];
  if (!allowed.includes(role)) return res.status(400).json({ error: "Invalid role" });
  const member = await mutate((store) => {
    const found = store.users.find((u) => u.id === req.params.id);
    if (!found) throw new Error("NOT_FOUND");
    found.role = role;
    logActivity(store, req.user.id, `${req.user.name} set ${found.name} to ${role}`);
    return publicUser(found);
  }).catch((err) => (err.message === "NOT_FOUND" ? null : Promise.reject(err)));
  if (!member) return res.status(404).json({ error: "Not found" });
  res.json({ data: member });
});

app.post("/api/v1/demo/reset", auth, requireAdmin, async (_req, res) => {
  await resetStore();
  res.json({ data: { ok: true } });
});

await loadStore();
app.listen(PORT, () => {
  console.log(`Noah API listening on http://localhost:${PORT}`);
});
