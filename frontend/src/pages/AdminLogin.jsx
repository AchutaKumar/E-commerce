import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { saveToken, isAdminUser, clearToken } from "../utils/auth";
import "../static/AdminLogin.css";

const AdminLogin = () => {
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL;
    const [form, setForm] = useState({ username: '', password: '' });
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (res.ok) {
                saveToken(data);
                if (isAdminUser()) {
                    navigate('/admin/add-product');
                } else {
                    clearToken();
                    setMsg('Access denied. You do not have administrative privileges.');
                    setLoading(false);
                }
            } else {
                setMsg(data.detail || 'Authentication failed. Please check your credentials.');
                setLoading(false);
            }
        } catch (error) {
            setMsg('A network error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-wrapper">
            <div className="admin-login-container">
                <div className="admin-login-logo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>
                
                <h1 className="admin-login-title">Admin Portal</h1>
                <p className="admin-login-subtitle">Sign in to manage your store and inventory.</p>

                {msg && (
                    <div className="admin-msg error">
                        {msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="admin-login-form">
                    <div className="admin-form-group">
                        <label htmlFor="username">Admin Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            className="admin-input"
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="password">Password</label>
                        <div className="admin-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Enter password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                className="admin-input"
                                style={{ paddingRight: '48px' }}
                            />
                            <button 
                                type="button" 
                                className="admin-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="admin-submit-btn" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Secure Sign In'}
                    </button>
                </form>

                <Link to="/" className="admin-back-home">
                    ← Return to Storefront
                </Link>
            </div>
        </div>
    );
};

export default AdminLogin;
