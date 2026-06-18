# Ecommerce Website

A full-stack ecommerce application built with a modern web stack, featuring a React frontend and a Django backend.

## Project Structure

The repository is organized into two main directories:

- **`frontend/`**: Contains the React application built with Vite.
- **`backend/`**: Contains the Django server application.

## Tech Stack

### Frontend
- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Routing:** [React Router](https://reactrouter.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

### Backend
- **Framework:** [Django](https://www.djangoproject.com/)
- **Language:** Python

## Getting Started

To run this project locally, you will need to set up and run both the backend server and the frontend development server.

### Prerequisites
- Node.js (v18 or higher recommended)
- Python (3.10 or higher recommended)

---

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. **Install dependencies:**
   *(Assuming you have a `requirements.txt` file)*
   ```bash
   pip install -r requirements.txt
   ```
   *(If not, install Django directly)*
   ```bash
   pip install django djangorestframework django-cors-headers
   ```

4. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Start the Django development server:**
   ```bash
   python manage.py runserver
   ```
   The backend should now be running at `http://127.0.0.1:8000/`.

---

### Frontend Setup

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   The frontend should now be running at the local URL provided by Vite (usually `http://localhost:5173/`).

## Environment Variables

Make sure to set up your `.env` files for both frontend and backend if your project requires sensitive configuration (like database URLs or API keys). Both directories currently have `.env` placeholder files.
