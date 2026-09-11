import { Chip, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { api, type Activity } from "../api/client";

export function ActivityPage() {
  const [items, setItems] = useState<Activity[]>([]);
  useEffect(() => {
    api<{ data: Activity[] }>("/api/v1/activity").then((res) => setItems(res.data));
  }, []);
  return (
    <Stack spacing={2}>
      <Typography variant="h3">User activity</Typography>
      <Typography color="text.secondary">Uploads, tags, annotations, workspace and plan changes.</Typography>
      {items.map((item) => (
        <Paper key={item.id} sx={{ p: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip size="small" label={item.actorName} />
            <Typography>{item.message}</Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {new Date(item.at).toLocaleString()}
          </Typography>
        </Paper>
      ))}
    </Stack>
  );
}
