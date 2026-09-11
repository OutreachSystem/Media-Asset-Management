# Environment Configuration

Lumina splits configuration between the orchestration API and the web client.

## API (`apps/api`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | HTTP port for the Express API |
| `JWT_SECRET` | demo secret | Signs short-lived access tokens |
| `CORS_ORIGIN` | `http://localhost:5174` | Allowed browser origin |

Copy the root `.env.example` values into your process manager or Docker service.

## Web (`apps/web`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | empty (same-origin / Vite proxy) | Absolute API origin used by the browser |

Vite inlines `VITE_*` variables at **build time**. Changing them requires a rebuild.

### Local development

Leave `VITE_API_BASE_URL` empty. The Vite dev server proxies `/api` to `http://localhost:4000`.

```env
VITE_API_BASE_URL=
```

### Production / Docker

Point the browser at the public API:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Demo credentials

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `demo@noah.app` | `NoahDemo2026!` |
| Editor | `editor@noah.app` | `NoahDemo2026!` |
| Viewer | `viewer@noah.app` | `NoahDemo2026!` |

These are seed credentials for the public demo only.

## Restart rules

- API: restart the Node process after changing `PORT`, `JWT_SECRET`, or `CORS_ORIGIN`.
- Web: rebuild after changing `VITE_API_BASE_URL`.
