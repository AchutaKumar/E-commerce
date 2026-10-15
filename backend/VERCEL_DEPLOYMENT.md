# Deploying to Vercel

This repository is a monorepo. Deploy the frontend and API as **two Vercel
projects** connected to the same Git repository. Vercel's monorepo setup uses a
separate project for each app; the repository-root `services` configuration
does not configure multiple projects.

## Create the Vercel projects

Create two projects from this repository and note each project's public
`*.vercel.app` domain. Configure the backend's `CORS_ALLOWED_ORIGINS` with the
frontend domain and the frontend's `VITE_DJANGO_BASE_URL` with the backend
domain before deploying:

1. **Frontend**
   - Root Directory: `frontend`
   - Framework Preset: Vite
   - The frontend sends API requests to its own `/api/...` path. Its Vercel
     rewrites forward `/api` and `/media` to `https://loyal-kart.vercel.app`,
     avoiding browser cross-origin requests.
2. **Backend**
   - Root Directory: `backend`
   - Framework Preset: Django (detected from `manage.py`)
   - Set the environment variables listed below.

Set backend environment variables for each environment you will deploy
(Production, Preview, and Development).

## Backend environment variables

Configure these on the backend Vercel project:

- `SECRET_KEY`: a new, private Django signing key. Rotate any key that was
  previously committed or exposed.
- `DEBUG=false`
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`: credentials for
  the production MySQL database. The database must be hosted outside Vercel and
  reachable from Vercel; loopback hosts such as `localhost` will not work.
- `CORS_ALLOWED_ORIGINS` (recommended): the exact frontend origin, such as
  `https://your-shop-project.vercel.app`, with no trailing slash. Add any
  additional trusted frontend origins as comma-separated values. The deployed
  `https://e-commerce-1zx3.vercel.app` frontend and local development origins
  are included by default; configured origins are added to these defaults.

For a custom frontend domain, add it in the backend Vercel project under
**Settings → Environment Variables** for every environment you deploy, then
redeploy the backend. Use the frontend project's domain, not the backend
domain and not a URL path.

The backend adds Vercel's `VERCEL_URL` and
`VERCEL_PROJECT_PRODUCTION_URL` to `ALLOWED_HOSTS`. Set `ALLOWED_HOSTS` only
for any additional custom domains. HTTPS proxy handling is enabled when
`VERCEL` is set. Leave HSTS preload/subdomain settings disabled unless all
affected domains are HTTPS-only.

For local development, set `VITE_DJANGO_BASE_URL` to the local or remote API
origin in `frontend/.env`. Production builds use relative `/api` and `/media`
paths, which are proxied by the frontend Vercel project.

## Database and migrations

Provision a managed MySQL database and make sure its network access rules allow
connections from the backend's Vercel deployment. Back up and migrate any
existing production data separately; deploying the code does not migrate or
copy the local database.

### Aiven connection errors

If the runtime log reports a name-resolution error (for example, `NXDOMAIN` or
`getaddrinfo failed`), open the Aiven MySQL service and copy its current
hostname and port from the service's connection information. Set `DB_HOST` to
the hostname only (no `https://`, port, or trailing path) and `DB_PORT` to the
displayed port in the **backend Vercel project's** environment variables. Make
sure the Aiven service is running, then redeploy. Do not reuse a hostname from
an old service or guess one from the service name.

If the hostname resolves but TCP connections still time out, check Aiven's
service access controls and whether the selected Vercel plan has stable
outbound IPs that can be allowlisted. Vercel uses dynamic outbound IPs by
default; do not assume a single Vercel IP is sufficient.

Run migrations once against the production database before serving traffic.
From a secured shell with the backend's production environment variables
loaded:

```powershell
Set-Location backend
python manage.py migrate --plan
python manage.py migrate
```

Never commit production credentials or `.env` files.

## Static files and uploads

Vercel detects Django's `STATIC_ROOT` and runs `collectstatic` during the
backend build. The included `backend/media` product images are available to
the backend deployment. Vercel Function filesystems are not persistent:
images uploaded through the admin interface can disappear after an invocation
or deployment. Configure persistent object storage for product uploads before
relying on admin uploads in production.

## Local checks

Use Vercel CLI 50.38.0 or newer. Run `vercel dev` from each project directory
after linking it to its corresponding Vercel project. The backend needs
reachable database environment variables for API requests and migrations.
