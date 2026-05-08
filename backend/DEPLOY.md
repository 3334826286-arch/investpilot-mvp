## FastAPI Deployment

### Render

This repo now includes a root-level `render.yaml` configured for the FastAPI backend.

Render setup:

1. Push the project to GitHub.
2. In Render, choose `New` -> `Blueprint`.
3. Select the repository that contains this project.
4. Render will detect `render.yaml` and create the `investpilot-fastapi` web service.
5. After the first deploy succeeds, copy the generated `onrender.com` URL.

Important files:

- `render.yaml`
- `backend/.python-version`
- `backend/requirements.txt`
- `backend/requirements-lock.txt`

Recommended first change after deploy:

- Replace `INVESTPILOT_CORS_ORIGINS=*` with your actual Netlify domain.

### Temporary public tunnel

For a quick public test endpoint from this machine:

```powershell
cd "C:\Users\33348\Documents\New project\invest-decision-mvp\backend"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8010
```

In another terminal:

```powershell
npx localtunnel --port 8010
```

### Container deployment

The backend now includes a production-friendly `Dockerfile`, and production installs are pinned through `requirements-lock.txt`.

Example runtime command inside a container platform:

```bash
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860}
```

### Required environment variables

- `INVESTPILOT_CORS_ORIGINS`
- `INVESTPILOT_LOG_LEVEL`
- `INVESTPILOT_SLOW_REQUEST_THRESHOLD_MS`
- `INVESTPILOT_API_PREFIX` (default `/v1`)

### Recommended production example

```env
INVESTPILOT_ENV=production
INVESTPILOT_LOG_LEVEL=INFO
INVESTPILOT_SLOW_REQUEST_THRESHOLD_MS=1200
INVESTPILOT_API_PREFIX=/v1
INVESTPILOT_CORS_ORIGINS=https://your-netlify-site.netlify.app
INVESTPILOT_MARKET_CACHE_TTL_SECONDS=180
INVESTPILOT_STOCK_CACHE_TTL_SECONDS=600
INVESTPILOT_SCREENER_CACHE_TTL_SECONDS=600
INVESTPILOT_CALENDAR_CACHE_TTL_SECONDS=1800
INVESTPILOT_SEARCH_CACHE_TTL_SECONDS=900
INVESTPILOT_DOCUMENT_CACHE_TTL_SECONDS=1800
INVESTPILOT_DEFAULT_WATCH_SYMBOLS=300750,601899,000333,688111,600036
```

### Operational checks

After a production deploy, verify:

- `/v1/health`
- `/v1/health/live`
- `/v1/health/ready`
- `/v1/health/status`

Every response now includes:

- `X-Request-ID`
- `X-App-Version`
- `X-Release-Channel`
- `X-Response-Time-Ms`
