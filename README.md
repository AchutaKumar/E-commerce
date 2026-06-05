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
