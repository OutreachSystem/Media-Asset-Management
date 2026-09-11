import { Box, Button, Chip, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api, canWrite } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useAppData } from "../context/AppDataContext";

export function TagsPage() {
  const { tags, refresh } = useAppData();
  const { user } = useAuth();
  const [name, setName] = useState("");

  async function create() {
    if (!name.trim()) return;
    await api("/api/v1/tags", { method: "POST", body: JSON.stringify({ name }) });
    setName("");
    await refresh();
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h3">Tags</Typography>
      <Typography color="text.secondary">Assign tags to videos, images, and audio from the library or player.</Typography>
      {canWrite(user?.role) ? (
        <Stack direction="row" spacing={1} maxWidth={420}>
          <TextField size="small" label="New tag" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <Button variant="contained" onClick={() => void create()}>
            Add
          </Button>
        </Stack>
      ) : null}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {tags.map((tag) => (
          <Chip
            key={tag.id}
            component={Link}
            to={`/home?tag=${tag.id}`}
            clickable
            label={tag.name}
            sx={{ bgcolor: tag.color, color: "#121212" }}
          />
        ))}
      </Box>
    </Stack>
  );
}
