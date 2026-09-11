import {
  Add,
  FolderOutlined,
  LocalOfferOutlined,
  Logout,
  MovieFilter,
  PermMediaOutlined,
  Settings,
  Timeline,
  WorkspacesOutlined,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { canWrite } from "../api/client";
import { useAppData } from "../context/AppDataContext";
import { api } from "../api/client";
import { useState, type ReactNode } from "react";

export function AppShell() {
  const { user, logout } = useAuth();
  const { org, plan, workspaces, workspaceId, setWorkspaceId, folders, projects, refresh } = useAppData();
  const navigate = useNavigate();
  const writable = canWrite(user?.role);
  const [creating, setCreating] = useState<"workspace" | "folder" | "project" | null>(null);
  const [name, setName] = useState("");

  const wsFolders = folders.filter((f) => f.workspaceId === workspaceId);
  const wsProjects = projects.filter((p) => p.workspaceId === workspaceId);

  async function create() {
    if (!name.trim() || !creating) return;
    if (creating === "workspace") {
      await api("/api/v1/workspaces", { method: "POST", body: JSON.stringify({ name }) });
    } else if (creating === "project") {
      await api("/api/v1/projects", { method: "POST", body: JSON.stringify({ workspaceId, name }) });
    } else {
      await api("/api/v1/folders", { method: "POST", body: JSON.stringify({ workspaceId, name }) });
    }
    setName("");
    setCreating(null);
    await refresh();
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        sx={{
          width: 268,
          p: 2,
          borderRight: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#161616",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1, mb: 2 }}>
          <MovieFilter sx={{ color: "primary.main" }} />
          <Box>
            <Typography fontWeight={700}>Noah</Typography>
            <Typography variant="caption" color="text.secondary">
              {org.name} · {plan?.name || "Free"}
            </Typography>
          </Box>
        </Stack>

        <TextField
          select
          size="small"
          label="Workspace"
          value={workspaceId}
          onChange={(e) => {
            setWorkspaceId(e.target.value);
            navigate("/home");
          }}
          sx={{ mb: 2 }}
        >
          {workspaces.map((ws) => (
            <MenuItem key={ws.id} value={ws.id}>
              {ws.name}
            </MenuItem>
          ))}
        </TextField>

        <List dense>
          <NavItem to="/home" icon={<PermMediaOutlined />} label="All media" />
          <NavItem to="/home/projects" icon={<WorkspacesOutlined />} label="Projects" />
          <NavItem to="/home/tags" icon={<LocalOfferOutlined />} label="Tags" />
          <NavItem to="/home/activity" icon={<Timeline />} label="User activity" />
          <NavItem to="/home/settings" icon={<Settings />} label="Members & plan" />
        </List>

        <Typography variant="caption" color="text.secondary" sx={{ px: 1, mt: 1 }}>
          Folders
        </Typography>
        <List dense sx={{ flex: 1, overflow: "auto" }}>
          {wsFolders.map((folder) => (
            <NavItem
              key={folder.id}
              to={`/home/folder/${folder.id}`}
              icon={<FolderOutlined />}
              label={folder.name}
            />
          ))}
        </List>

        {writable ? (
          <Stack spacing={1} sx={{ mb: 2 }}>
            {creating ? (
              <Stack spacing={1}>
                <TextField size="small" placeholder={`New ${creating}`} value={name} onChange={(e) => setName(e.target.value)} />
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="contained" onClick={() => void create()}>
                    Create
                  </Button>
                  <Button size="small" onClick={() => setCreating(null)}>
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <>
                <Button size="small" startIcon={<Add />} onClick={() => setCreating("folder")}>
                  Folder
                </Button>
                <Button size="small" startIcon={<Add />} onClick={() => setCreating("project")}>
                  Project
                </Button>
                <Button size="small" startIcon={<Add />} onClick={() => setCreating("workspace")}>
                  Workspace
                </Button>
              </>
            )}
          </Stack>
        ) : null}

        <Divider sx={{ mb: 1.5 }} />
        <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", color: "#121212", fontSize: 14 }}>
            {user?.name?.[0]}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" noWrap>
              {user?.name}
            </Typography>
            <Chip size="small" label={user?.role} sx={{ height: 18, fontSize: 11 }} />
          </Box>
        </Stack>
        <Button
          size="small"
          startIcon={<Logout />}
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Sign out
        </Button>
      </Box>
      <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: "auto" }}>
        <Outlet context={{ wsProjects }} />
      </Box>
    </Box>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      end={to === "/home"}
      sx={{
        borderRadius: 2,
        mb: 0.3,
        "&.active": { bgcolor: "rgba(210,140,255,0.12)", color: "primary.main" },
      }}
    >
      <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>{icon}</ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  );
}
