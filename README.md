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
Commit at 2026-01-11T13:36:09.847972
Commit at 2026-05-31T07:39:30.167864
Commit at 2025-12-29T07:13:10.367970
Commit at 2026-03-02T05:13:43.606390
Commit at 2025-09-14T04:04:21.832360
Commit at 2025-10-09T00:37:01.047299
Commit at 2026-07-11T13:42:28.255198
Commit at 2026-02-21T18:13:15.451502
Commit at 2026-04-07T22:27:43.655607
Commit at 2026-05-16T19:27:56.852624
Commit at 2026-03-03T12:54:43.059259
Commit at 2025-11-06T09:10:15.277128
Commit at 2026-06-19T03:41:00.455648
Commit at 2025-09-05T16:51:26.626927
Commit at 2025-09-22T11:08:46.878655
Commit at 2026-07-12T04:20:21.067796
Commit at 2025-09-17T18:44:23.200643
Commit at 2026-05-22T01:08:59.475608
