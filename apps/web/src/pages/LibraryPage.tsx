import { Box, Button, Chip, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, canWrite, formatTimecode, type MediaItem } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useAppData } from "../context/AppDataContext";

type Props = { mode: "all" | "folder" | "project" };

export function LibraryPage({ mode }: Props) {
  const { folderId, projectId } = useParams();
  const { workspaceId, folders, projects, tags } = useAppData();
  const { user } = useAuth();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [tag, setTag] = useState("");

  const folder = folders.find((f) => f.id === folderId);
  const project = projects.find((p) => p.id === projectId);
  const title =
    mode === "folder" ? folder?.name || "Folder" : mode === "project" ? project?.name || "Project" : "All media";

  async function load() {
    const params = new URLSearchParams();
    params.set("workspaceId", workspaceId);
    if (mode === "folder" && folderId) params.set("folderId", folderId);
    if (mode === "project" && projectId) params.set("projectId", projectId);
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    if (tag) params.set("tag", tag);
    const res = await api<{ data: MediaItem[] }>(`/api/v1/media?${params}`);
    setItems(res.data);
  }

  useEffect(() => {
    if (workspaceId) void load();
  }, [workspaceId, folderId, projectId, q, type, tag, mode]);

  async function upload() {
    await api("/api/v1/media", {
      method: "POST",
      body: JSON.stringify({
        workspaceId,
        folderId: folderId || folder?.id,
        projectId: projectId || folder?.projectId,
        title: `New upload ${new Date().toLocaleTimeString()}`,
        type: "video",
      }),
    });
    await load();
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography variant="h3">{title}</Typography>
          <Typography color="text.secondary">
            Videos, images, and audio in this {mode === "all" ? "workspace" : mode}.
          </Typography>
        </Box>
        {canWrite(user?.role) ? (
          <Button variant="contained" onClick={() => void upload()}>
            Upload media
          </Button>
        ) : (
          <Chip label="Viewer · view only" />
        )}
      </Stack>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        <TextField label="Search" value={q} onChange={(e) => setQ(e.target.value)} fullWidth />
        <TextField select label="Type" value={type} onChange={(e) => setType(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="video">Video</MenuItem>
          <MenuItem value="image">Image</MenuItem>
          <MenuItem value="audio">Audio</MenuItem>
        </TextField>
        <TextField select label="Tag" value={tag} onChange={(e) => setTag(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">All tags</MenuItem>
          {tags.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 2 }}>
        {items.map((item) => (
          <Paper key={item.id} component={Link} to={`/home/media/${item.id}`} sx={{ textDecoration: "none", color: "inherit", overflow: "hidden" }}>
            <Box sx={{ height: 140, backgroundImage: `url(${item.thumbnail})`, backgroundSize: "cover", backgroundPosition: "center" }} />
            <Box sx={{ p: 1.5 }}>
              <Stack direction="row" spacing={0.8} sx={{ mb: 0.8 }}>
                <Chip size="small" label={item.type} />
                {item.type === "video" ? <Chip size="small" label={formatTimecode(item.duration)} /> : null}
              </Stack>
              <Typography fontWeight={600}>{item.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {item.uploaderName} · {item.annotationCount} notes · {item.tags.map((t) => t.name).join(", ") || "no tags"}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Stack>
  );
}

export function ProjectsPage() {
  const { workspaceId, projects, folders } = useAppData();
  const list = projects.filter((p) => p.workspaceId === workspaceId);
  return (
    <Stack spacing={2}>
      <Typography variant="h3">Projects</Typography>
      <Typography color="text.secondary">Open a project to see its folders and media.</Typography>
      {list.map((project) => {
        const count = folders.filter((f) => f.projectId === project.id).length;
        return (
          <Paper key={project.id} component={Link} to={`/home/project/${project.id}`} sx={{ p: 2, textDecoration: "none", color: "inherit" }}>
            <Typography variant="h6">{project.name}</Typography>
            <Typography color="text.secondary">{count} folders</Typography>
          </Paper>
        );
      })}
    </Stack>
  );
}
