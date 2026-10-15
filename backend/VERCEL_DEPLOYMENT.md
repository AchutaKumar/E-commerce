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
   - Set `VITE_DJANGO_BASE_URL` to the backend's public HTTPS origin, for
     example `https://your-api-project.vercel.app` (no trailing slash).
2. **Backend**
   - Root Directory: `backend`
   - Framework Preset: Django (detected from `manage.py`)
   - Set the environment variables listed below.

Set environment variables for each environment you will deploy (Production,
Preview, and Development). Redeploy after changing build-time frontend
variables.

## Backend environment variables

Configure these on the backend Vercel project:

- `SECRET_KEY`: a new, private Django signing key. Rotate any key that was
  previously committed or exposed.
- `DEBUG=false`
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`: credentials for
  the production MySQL database. The database must be hosted outside Vercel and
  reachable from Vercel; loopback hosts such as `localhost` will not work.
- `CORS_ALLOWED_ORIGINS`: the exact frontend origin, such as
  `https://your-shop-project.vercel.app`, with no trailing slash. Add any
  additional trusted frontend origins as comma-separated values.

The backend adds Vercel's `VERCEL_URL` and
`VERCEL_PROJECT_PRODUCTION_URL` to `ALLOWED_HOSTS`. Set `ALLOWED_HOSTS` only
for any additional custom domains. HTTPS proxy handling is enabled when
`VERCEL` is set. Leave HSTS preload/subdomain settings disabled unless all
affected domains are HTTPS-only.

Do not set `VITE_DJANGO_BASE_URL` to localhost, a Render URL, or the frontend
origin. The frontend must call the backend's Vercel origin.

## Database and migrations

Provision a managed MySQL database and make sure its network access rules allow
connections from the backend's Vercel deployment. Back up and migrate any
existing production data separately; deploying the code does not migrate or
copy the local database.

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
