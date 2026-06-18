import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../static/Login.css";

const SignupPage = () => {
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL;
    const [form, setForm] = useState({ username: '', password: '', password2: '', email: '', phone_number: '' });
    const [msg, setMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        
        if (form.password.length < 8) {
            setMsg('Password must be at least 8 characters long');
            return;
        }
        
        if (form.password !== form.password2) {
            setMsg('Passwords do not match');
            return;
        }
        try {
            const res = await fetch(`${BASE_URL}/api/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (res.ok) {
                setMsg('Registration successful');
                setTimeout(() => {
                    navigate('/login');
                }, 1400);
            } else {
                setMsg(data.username || data.email || data.password || data.password2 || JSON.stringify(data));
            }
        } catch (error) {
            setMsg('An error occurred');
        }
    };

    return (
        <div className="login-page-wrap">
            <div className="login-image-side">
                <div className="login-image-content">
                    <h1>LoyalKart</h1>
                    <p>Join us to discover premium products, exclusive deals, and a seamless shopping experience.</p>
                </div>
            </div>

            <div className="login-form-side">
                <div className="login-form-container">
                    <div className="login-header">
                        <h2>Create Account</h2>
                        <p>Please enter your details to sign up.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="login-form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder="Choose a username"
                                value={form.username}
                                onChange={handleChange}
                                required
                                className="login-input"
                            />
                        </div>

                        <div className="login-form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="login-input"
                            />
                        </div>

                        <div className="login-form-group">
                            <label htmlFor="phone_number">Phone Number (Optional)</label>
                            <input
                                type="tel"
                                id="phone_number"
                                name="phone_number"
                                placeholder="Enter your phone number"
                                value={form.phone_number}
                                onChange={handleChange}
                                className="login-input"
                            />
                        </div>

                        <div className="login-form-group">
                            <label htmlFor="password">Password</label>
                            <div style={{position: 'relative'}}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    placeholder="Create a password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    className="login-input"
                                    style={{paddingRight: '40px'}}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "Hide password" : "Show password"}
                                    style={{
                                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', 
                                        background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                                        display: 'flex', alignItems: 'center', color: '#6b7280'
                                    }}
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

                        <div className="login-form-group">
                            <label htmlFor="password2">Confirm Password</label>
                            <div style={{position: 'relative'}}>
                                <input
                                    type={showPassword2 ? "text" : "password"}
                                    id="password2"
                                    name="password2"
                                    placeholder="Confirm your password"
                                    value={form.password2}
                                    onChange={handleChange}
                                    required
                                    className="login-input"
                                    style={{paddingRight: '40px'}}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword2(!showPassword2)}
                                    title={showPassword2 ? "Hide password" : "Show password"}
                                    style={{
                                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', 
                                        background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                                        display: 'flex', alignItems: 'center', color: '#6b7280'
                                    }}
                                >
                                    {showPassword2 ? (
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

                        {msg && (
                            <div className={`login-msg ${msg.includes('successful') ? 'success' : 'error'}`}>
                                {msg}
                            </div>
                        )}

                        <button type="submit" className="login-submit-btn">
                            Register
                        </button>
                    </form>

                    <div className="login-footer-link">
                        Already have an account? <Link to="/login">Login here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;