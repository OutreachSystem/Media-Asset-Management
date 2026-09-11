import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type Plan } from "../api/client";

export function PlanPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api<{ data: Plan[] }>("/api/v1/plans").then((res) => setPlans(res.data));
  }, []);

  async function choose(planId: string) {
    await api("/api/v1/org/plan", { method: "POST", body: JSON.stringify({ planId }) });
    navigate("/home");
  }

  return (
    <Box sx={{ minHeight: "100vh", p: 4, bgcolor: "#121212" }}>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Choose a plan
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Organizations start on Free. Upgrade any time for more storage, seats, and annotation history.
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2, maxWidth: 1100 }}>
        {plans.map((plan) => (
          <Paper key={plan.id} sx={{ p: 3 }}>
            <Typography variant="h5">{plan.name}</Typography>
            <Typography variant="h4" sx={{ my: 1 }}>
              {plan.price}
            </Typography>
            <Typography color="text.secondary">
              {plan.storage} · {plan.seats}
            </Typography>
            <Stack spacing={0.8} sx={{ my: 2 }}>
              {plan.features.map((f) => (
                <Typography key={f} variant="body2">
                  {f}
                </Typography>
              ))}
            </Stack>
            <Button variant={plan.id === "team" ? "contained" : "outlined"} onClick={() => void choose(plan.id)}>
              {plan.id === "free" ? "Continue on Free" : `Select ${plan.name}`}
            </Button>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
