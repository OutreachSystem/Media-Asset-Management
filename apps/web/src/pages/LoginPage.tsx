import { Alert, Box, Button, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import { MovieFilter } from "@mui/icons-material";
import { FormEvent, useState, type ReactNode } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@noah.app");
  const [password, setPassword] = useState("NoahDemo2026!");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Sign in to Noah">
      <Stack spacing={2} component="form" onSubmit={onSubmit}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
        <Button type="submit" variant="contained" size="large" disabled={busy}>
          {busy ? "Signing in…" : "Enter library"}
        </Button>
        <Typography variant="body2" color="text.secondary">
          No organization yet? <Link component={RouterLink} to="/signup">Register</Link>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Super Admin `demo@noah.app` · Editor `editor@noah.app` · Viewer `viewer@noah.app` · password `NoahDemo2026!`
        </Typography>
      </Stack>
    </AuthCard>
  );
}

export function SignUpPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signup(orgName, name, email, password);
      navigate("/onboarding/plan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Register your organization">
      <Stack spacing={2} component="form" onSubmit={onSubmit}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField label="Organization" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
        <TextField label="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" variant="contained" size="large" disabled={busy}>
          Continue to plans
        </Button>
        <Link component={RouterLink} to="/login">
          Already have an account
        </Link>
      </Stack>
    </AuthCard>
  );
}

function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2, bgcolor: "#121212" }}>
      <Paper sx={{ width: 460, p: 4 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <MovieFilter color="primary" />
          <Typography variant="h4">Noah</Typography>
        </Stack>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {title}
        </Typography>
        {children}
      </Paper>
    </Box>
  );
}
