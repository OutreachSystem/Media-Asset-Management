import { Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { api, canAdmin, type Role, type User } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useAppData } from "../context/AppDataContext";

const roles: Role[] = ["Super Admin", "Admin", "Editor", "Collaborator", "Viewer"];

export function SettingsPage() {
  const { org, plan, members, refresh } = useAppData();
  const { user } = useAuth();
  const admin = canAdmin(user?.role);

  async function setRole(id: string, role: Role) {
    await api(`/api/v1/members/${id}`, { method: "PATCH", body: JSON.stringify({ role }) });
    await refresh();
  }

  async function setPlan(planId: string) {
    await api("/api/v1/org/plan", { method: "POST", body: JSON.stringify({ planId }) });
    await refresh();
  }

  return (
    <Stack spacing={3} maxWidth={720}>
      <Typography variant="h3">Members & plan</Typography>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">{org.name}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Current plan: {plan?.name} · {plan?.storage} · {plan?.seats}
        </Typography>
        {admin ? (
          <Stack direction="row" spacing={1}>
            <Button onClick={() => void setPlan("free")}>Free</Button>
            <Button variant="contained" onClick={() => void setPlan("team")}>
              Team
            </Button>
            <Button onClick={() => void setPlan("business")}>Business</Button>
          </Stack>
        ) : (
          <Typography variant="body2">Only admins can change the organization plan.</Typography>
        )}
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          People
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Viewers can only view. Collaborator, Editor, Admin, and Super Admin can upload and annotate.
        </Typography>
        <Stack spacing={1.5}>
          {members.map((member: User) => (
            <Stack key={member.id} direction="row" spacing={2} alignItems="center">
              <Typography sx={{ minWidth: 160 }}>{member.name}</Typography>
              <Typography color="text.secondary" sx={{ minWidth: 180 }}>
                {member.email}
              </Typography>
              {admin ? (
                <TextField
                  select
                  size="small"
                  value={member.role}
                  onChange={(e) => void setRole(member.id, e.target.value as Role)}
                  sx={{ minWidth: 180 }}
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <Typography>{member.role}</Typography>
              )}
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}
