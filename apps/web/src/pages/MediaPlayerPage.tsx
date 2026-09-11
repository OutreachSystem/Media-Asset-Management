import { Alert, Box, Button, Chip, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  api,
  canWrite,
  formatTimecode,
  type Annotation,
  type MediaItem,
} from "../api/client";
import { useAuth } from "../auth/AuthContext";

type Detail = MediaItem & { annotations: Annotation[] };

export function MediaPlayerPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const writable = canWrite(user?.role);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [asset, setAsset] = useState<Detail | null>(null);
  const [now, setNow] = useState(0);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await api<{ data: Detail }>(`/api/v1/media/${id}`);
    setAsset(res.data);
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function addNote() {
    if (!asset || !body.trim()) return;
    setError("");
    try {
      await api("/api/v1/annotations", {
        method: "POST",
        body: JSON.stringify({
          mediaId: asset.id,
          tSeconds: asset.type === "video" ? Math.floor(now) : 0,
          body,
        }),
      });
      setBody("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add note");
    }
  }

  function seekTo(seconds: number) {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      void videoRef.current.play();
    }
    setNow(seconds);
  }

  if (!asset) return <Typography>Loading media…</Typography>;

  const active = asset.annotations.filter((a) => Math.abs(a.tSeconds - now) <= 2);

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.6fr 360px" }, gap: 2, height: "calc(100vh - 48px)" }}>
      <Paper sx={{ p: 2, overflow: "auto" }}>
        <Typography variant="h4">{asset.title}</Typography>
        <Stack direction="row" spacing={1} sx={{ my: 1, flexWrap: "wrap" }}>
          <Chip size="small" label={asset.type} />
          {asset.tags.map((tag) => (
            <Chip key={tag.id} size="small" label={tag.name} sx={{ bgcolor: tag.color, color: "#121212" }} />
          ))}
        </Stack>
        {asset.type === "video" ? (
          <Box
            component="video"
            ref={videoRef}
            src={asset.src}
            controls
            onTimeUpdate={(e) => setNow((e.target as HTMLVideoElement).currentTime)}
            sx={{ width: "100%", maxHeight: 520, bgcolor: "#000", borderRadius: 2 }}
          />
        ) : (
          <Box
            component="img"
            src={asset.src || asset.thumbnail}
            alt={asset.title}
            sx={{ width: "100%", maxHeight: 520, objectFit: "contain", borderRadius: 2, bgcolor: "#000" }}
          />
        )}
        {asset.type === "video" ? (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Playhead {formatTimecode(now)} · notes stay attached to this timecode. Editors recut in their own NLE, not here.
          </Typography>
        ) : null}
      </Paper>

      <Paper sx={{ p: 2, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <Typography variant="h6">Annotations</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
          A note at 05:30 appears here when the playhead hits 05:30.
        </Typography>
        <Box sx={{ flex: 1, overflow: "auto", pr: 0.5 }}>
          <Stack spacing={1.2}>
            {asset.annotations.map((note) => {
              const onBeat = Math.abs(note.tSeconds - now) <= 2;
              return (
                <Box
                  key={note.id}
                  onClick={() => seekTo(note.tSeconds)}
                  sx={{
                    p: 1.2,
                    borderRadius: 1.5,
                    cursor: asset.type === "video" ? "pointer" : "default",
                    bgcolor: onBeat ? "rgba(210,140,255,0.16)" : "rgba(255,255,255,0.03)",
                    border: "1px solid",
                    borderColor: onBeat ? "primary.main" : "divider",
                  }}
                >
                  <Typography variant="caption" color="primary">
                    {formatTimecode(note.tSeconds)} · {note.authorName}
                  </Typography>
                  <Typography variant="body2">{note.body}</Typography>
                </Box>
              );
            })}
          </Stack>
        </Box>
        {active.length && asset.type === "video" ? (
          <Alert severity="info" sx={{ mt: 1 }}>
            Showing {active.length} note{active.length > 1 ? "s" : ""} at {formatTimecode(now)}.
          </Alert>
        ) : null}
        {error ? <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert> : null}
        {writable ? (
          <Stack spacing={1} sx={{ mt: 1.5 }}>
            <TextField
              size="small"
              multiline
              minRows={2}
              placeholder={asset.type === "video" ? `Comment at ${formatTimecode(now)}` : "Comment on this image"}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <Button variant="contained" onClick={() => void addNote()}>
              Add annotation
            </Button>
          </Stack>
        ) : (
          <Chip sx={{ mt: 2 }} label="Viewers can watch and read notes, not add them" />
        )}
      </Paper>
    </Box>
  );
}
