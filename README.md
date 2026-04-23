# 🛒 E-Commerce Platform

A full-stack e-commerce web application featuring a modern React frontend and a robust Django REST backend.

Live link : https://e-commerce-1-ussz.onrender.com.

---

## 🌟 Features

- **Product Catalog:** Browse products, view details, and search items.
- **User Authentication:** Sign up, login, and secure user profiles.
- **Shopping Cart:** Add, remove, and manage items in the cart.
- **Checkout & Shipping:** Streamlined checkout process and shipping info management.
- **Admin Dashboard:** Add and manage products securely (Private routes for admins).
- **Responsive Design:** Beautiful, mobile-friendly UI using modern CSS.

---

## 🏗️ Project Structure

The repository is organized as a monorepo with two main folders:

```text
E-commerce/
├── backend/                  # Django REST framework backend
│   ├── backend/              # Core Django project settings & routing
│   ├── store/                # Main app for API endpoints, models & views
│   ├── media/                # Uploaded media (e.g., product images)
│   ├── manage.py             # Django entry point
│   └── requirements.txt      # Python dependencies for the backend
│
├── frontend/                 # React frontend built with Vite
│   ├── public/               # Static assets
│   ├── src/                  # React source code
│   │   ├── assets/           # Images & Icons
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context (e.g., CartContext)
│   │   ├── pages/            # Page-level components
│   │   ├── static/           # CSS stylesheets
│   │   └── utils/            # Utility functions (auth, etc.)
│   ├── package.json          # Node dependencies and scripts
│   └── vite.config.js        # Vite configuration
│
├── .gitignore                # Global git ignore rules
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.10 or higher)
- [Git](https://git-scm.com/)
- MySQL Database

---

### ⚙️ Backend Setup (Django)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Python dependencies:**
   Install all required packages using the `requirements.txt` file.
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up Environment Variables:**
   Create a `.env` file in the `backend/` directory with your database credentials:
   ```env
   DB_NAME=ecommerce_db
   DB_USER=root
   DB_PASSWORD=your_password
   DB_HOST=127.0.0.1
   DB_PORT=3306
   ```

5. **Run Migrations & Start Server:**
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```
   The backend API will be available at `http://127.0.0.1:8000/`.

---

### 🎨 Frontend Setup (React + Vite)

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the `frontend/` directory to connect to the backend:
   ```env
   VITE_DJANGO_BASE_URL=http://127.0.0.1:8000
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173/`.

---

## ☁️ Deploying to Vercel

Deploy this monorepo as two Vercel projects connected to the same Git
repository:

- Frontend project: set the Root Directory to `frontend` and configure
  `VITE_DJANGO_BASE_URL` to the backend project's public HTTPS URL.
- Backend project: set the Root Directory to `backend` and configure the
  Django secret, production MySQL credentials, and
  `CORS_ALLOWED_ORIGINS` to include the frontend's public origin.

The backend requires an externally hosted, reachable MySQL database. Apply
database migrations before serving traffic. Vercel does not provide persistent
storage for admin-uploaded images; use object storage for uploads. See the
[Vercel deployment guide](backend/VERCEL_DEPLOYMENT.md) for setup details and
environment variables.

---

## 🛠️ Tech Stack

**Frontend:**
- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [React Router DOM](https://reactrouter.com/)
- [Lucide React](https://lucide.dev/) (Icons)
- Vanilla CSS

**Backend:**
- [Django](https://www.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- MySQL (Database)
Commit at 2026-03-04T07:38:30.034247
Commit at 2026-02-12T10:18:44.397418
Commit at 2026-02-23T20:15:12.549980
Commit at 2025-08-20T00:21:45.737429
Commit at 2026-06-14T08:21:10.977490
Commit at 2025-10-15T10:16:20.179843
Commit at 2025-09-11T00:11:43.561935
Commit at 2026-05-02T08:50:17.873521
Commit at 2025-09-01T14:12:30.066270
Commit at 2025-11-01T05:04:12.297549
Commit at 2025-12-25T01:20:25.526348
Commit at 2026-02-13T06:20:30.757790
Commit at 2026-03-21T17:23:44.095635
Commit at 2026-03-31T01:08:03.375605
Commit at 2026-02-12T02:10:06.620176
Commit at 2026-06-09T10:08:27.840765
Commit at 2025-11-16T18:33:05.043088
Commit at 2026-06-05T12:26:40.200373
Commit at 2026-02-10T15:21:57.437060
Commit at 2026-04-27T07:18:02.583734
Commit at 2026-02-24T14:58:12.646408
Commit at 2026-08-11T11:47:36.968739
Commit at 2026-02-15T17:22:17.130167
Commit at 2026-04-03T13:14:42.322112
Commit at 2026-07-22T15:47:06.518294
Commit at 2025-12-13T04:42:49.785958
Commit at 2026-07-01T19:16:10.995685
Commit at 2026-09-11T11:45:10.153574
Commit at 2026-06-05T07:55:54.302491
Commit at 2026-02-13T18:05:19.480177
Commit at 2026-08-12T11:24:42.654450
Commit at 2026-09-23T03:48:23.845588
Commit at 2025-11-25T23:21:47.110254
Commit at 2026-05-15T06:40:08.314474
Commit at 2025-10-22T18:32:47.524247
Commit at 2026-01-10T17:50:12.693118
Commit at 2026-08-08T09:03:33.697159
Commit at 2026-10-11T00:26:41.086842
Commit at 2026-03-29T16:08:55.348755
Commit at 2026-06-08T13:55:52.624510
Commit at 2025-11-08T08:12:55.867298
Commit at 2025-12-13T17:28:52.134803
Commit at 2025-11-21T19:07:22.347188
Commit at 2026-10-02T22:51:12.557449
Commit at 2025-12-25T12:12:14.778080
Commit at 2025-11-15T15:30:54.960261
Commit at 2026-05-21T06:26:25.273617
Commit at 2026-04-26T06:41:25.537548
Commit at 2025-11-09T03:53:48.679087
Commit at 2025-11-28T03:51:04.934647
Commit at 2026-10-09T16:38:25.295926
Commit at 2026-07-31T06:33:03.581274
Commit at 2026-04-28T23:37:53.814694
Commit at 2026-02-08T21:55:23.070012
Commit at 2026-08-11T02:20:43.321978
Commit at 2026-07-12T00:57:11.580958
Commit at 2025-11-15T11:37:40.759928
Commit at 2025-11-21T12:26:15.948084
Commit at 2026-08-11T09:08:00.192680
Commit at 2026-03-14T14:40:25.492281
Commit at 2026-06-23T21:14:32.694040
Commit at 2025-10-17T16:37:40.932672
Commit at 2025-12-19T14:58:15.867174
Commit at 2026-04-25T00:50:01.160948
Commit at 2026-04-29T15:00:58.359602
Commit at 2026-03-07T16:31:53.525976
Commit at 2026-01-19T20:18:35.779256
Commit at 2025-11-02T21:12:40.978229
Commit at 2026-08-20T19:32:09.275161
Commit at 2025-11-03T20:04:26.474753
Commit at 2026-03-14T16:21:33.779909
Commit at 2026-03-04T09:51:13.031414
Commit at 2026-01-24T12:43:45.794594
Commit at 2026-09-15T07:13:32.146352
Commit at 2025-12-31T20:48:10.398568
Commit at 2026-08-24T08:35:42.610937
Commit at 2026-07-24T00:53:52.811993
Commit at 2026-07-17T21:43:03.956825
Commit at 2026-03-23T21:34:41.264142
Commit at 2026-09-06T11:25:41.520475
Commit at 2026-07-01T10:27:50.710764
Commit at 2026-08-05T11:53:49.044140
Commit at 2026-06-28T22:43:02.139676
Commit at 2025-12-11T15:20:20.457120
Commit at 2026-09-21T08:22:39.678712
Commit at 2026-10-11T12:43:39.949220
Commit at 2025-12-15T17:43:09.177556
Commit at 2026-05-15T02:29:22.368510
Commit at 2026-06-23T19:55:04.596294
Commit at 2025-12-31T12:48:20.770732
Commit at 2025-12-08T12:26:27.024412
Commit at 2026-04-10T11:44:41.217477
Commit at 2026-02-27T07:08:24.012103
Commit at 2026-06-30T20:28:39.315385
Commit at 2026-01-02T17:16:56.601012
Commit at 2026-04-12T16:48:39.855270
Commit at 2026-09-24T19:54:18.998077
Commit at 2026-02-16T20:52:12.178902
Commit at 2025-10-28T18:56:26.414441
Commit at 2026-08-03T09:29:59.629547
Commit at 2025-12-31T04:44:58.916341
Commit at 2026-02-07T20:49:17.193422
Commit at 2025-11-05T17:36:27.422103
Commit at 2026-09-30T04:07:28.702340
Commit at 2026-03-27T18:09:42.917088
Commit at 2026-04-14T03:31:54.182880
Commit at 2026-07-27T09:38:35.393105
Commit at 2026-10-07T12:10:17.631924
Commit at 2026-07-14T18:58:31.867249
Commit at 2026-05-27T11:09:49.179088
Commit at 2026-04-30T11:58:49.380036
Commit at 2026-08-04T09:39:19.587560
Commit at 2025-11-27T16:51:46.842435
Commit at 2026-04-15T16:35:44.090575
Commit at 2026-04-22T05:53:06.310029
Commit at 2026-05-03T11:42:52.512902
Commit at 2026-05-17T08:32:36.722605
Commit at 2026-06-05T01:05:47.956025
Commit at 2025-11-01T05:23:03.200392
Commit at 2026-04-24T03:09:28.379960
