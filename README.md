# 🛒 E-Commerce Platform

A full-stack e-commerce web application featuring a modern React frontend and a robust Django REST backend.

Live link https://e-commerce-1-ussz.onrender.com
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
