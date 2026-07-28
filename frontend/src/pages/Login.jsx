import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { saveToken } from '../utils/auth';
import { ROUTES } from '../utils/routes';
import "../static/Login.css";

// Form Validation Schema using Yup
const LoginSchema = Yup.object().shape({
    username: Yup.string()
        .required('Username is required'),
    password: Yup.string()
        .min(4, 'Password must be at least 4 characters')
        .required('Password is required'),
    remember: Yup.boolean(),
});

export default function LoginPage() {
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL;
    const navigate = useNavigate();
    const location = useLocation();

    // Target route if redirected from protected page
    const from = location.state?.from?.pathname || '/';

    const initialValues = {
        username: '',
        password: '',
        remember: false,
    };

    const handleSubmit = async (values, { setSubmitting, setStatus }) => {
        setStatus(null);
        try {
            const res = await fetch(`${BASE_URL}/api/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: values.username,
                    password: values.password
                })
            });

            const data = await res.json();

            if (res.ok) {
                saveToken(data);
                window.dispatchEvent(new Event('storage'));

                if (data.is_staff && from === '/') {
                    navigate(ROUTES.ADMIN_ADD_PRODUCT, { replace: true });
                } else {
                    navigate(from, { replace: true });
                }
            } else {
                let errorMsg = 'Login failed. Please check your credentials.';
                if (typeof data.detail === 'string') {
                    errorMsg = data.detail;
                } else if (typeof data.error === 'string') {
                    errorMsg = data.error;
                } else if (typeof data === 'object' && data !== null) {
                    const firstVal = Object.values(data)[0];
                    if (Array.isArray(firstVal)) {
                        errorMsg = firstVal[0];
                    } else if (typeof firstVal === 'string') {
                        errorMsg = firstVal;
                    }
                }
                setStatus(errorMsg);
            }
        } catch (error) {
            setStatus('A network error occurred. Please check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            {/* Main Content: Split Screen Login */}
            <main className="main-content">
                {/* Left Side: Login Form */}
                <section className="form-section">
                    <div className="form-wrapper">
                        <div className="form-header">
                            <h1 className="form-title">
                                Welcome back
                            </h1>
                            <p className="form-subtitle">
                                Enter your credentials to access your account.
                            </p>
                        </div>

                        {/* Formik Form Integration */}
                        <Formik
                            initialValues={initialValues}
                            validationSchema={LoginSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting, errors, touched, status }) => (
                                <Form className="login-form">
                                    {status && (
                                        <div className="error-msg" style={{ padding: '10px', backgroundColor: '#fee2e2', borderRadius: '6px', textAlign: 'center', marginBottom: '8px' }}>
                                            {status}
                                        </div>
                                    )}

                                    <div className="form-fields">
                                        {/* Username Field */}
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="username">
                                                Username or Email
                                            </label>
                                            <Field
                                                type="text"
                                                id="username"
                                                name="username"
                                                placeholder="Enter your username"
                                                autoComplete="username"
                                                className={`form-input ${errors.username && touched.username ? 'input-error' : ''}`}
                                            />
                                            <ErrorMessage name="username" component="div" className="error-msg" />
                                        </div>

                                        {/* Password Field */}
                                        <div className="form-group">
                                            <div className="label-row">
                                                <label className="form-label" htmlFor="password">
                                                    Password
                                                </label>
                                                <a className="forgot-link" href="#forgot" onClick={(e) => { e.preventDefault(); alert("Please contact support or reset your password."); }}>
                                                    Forgot Password?
                                                </a>
                                            </div>
                                            <Field
                                                type="password"
                                                id="password"
                                                name="password"
                                                placeholder="••••••••"
                                                autoComplete="current-password"
                                                className={`form-input ${errors.password && touched.password ? 'input-error' : ''}`}
                                            />
                                            <ErrorMessage name="password" component="div" className="error-msg" />
                                        </div>
                                    </div>

                                    {/* Remember Me Checkbox */}
                                    <div className="remember-row">
                                        <Field
                                            type="checkbox"
                                            id="remember"
                                            name="remember"
                                            className="remember-checkbox"
                                        />
                                        <label className="remember-label" htmlFor="remember">
                                            Remember me for 30 days
                                        </label>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="submit-button"
                                    >
                                        {isSubmitting ? 'Verifying...' : 'Sign In'}
                                    </button>

                                    <div className="divider-container">
                                        <div className="divider-line"></div>
                                        <span className="divider-text">Or continue with</span>
                                    </div>

                                    {/* Social Logins */}
                                    <div className="social-buttons">
                                        <button
                                            type="button"
                                            className="social-button"
                                            onClick={() => alert("Google Sign-In is not configured yet.")}
                                        >
                                            <svg className="social-icon" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                                            </svg>
                                            Google
                                        </button>
                                        <button
                                            type="button"
                                            className="social-button"
                                            onClick={() => alert("Apple Sign-In is not configured yet.")}
                                        >
                                            <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.05 20.28c-.96.95-2.06 1.44-3.3 1.44-1.2 0-2.2-.44-3.23-1.44C9.53 19.3 8.35 18.8 7.2 18.8c-1.15 0-2.3.5-3.3 1.48L3 19.4c-.66-.66-1.12-1.47-1.38-2.43C1.36 16 1.23 15 1.23 14c0-2.33.8-4.32 2.38-5.94 1.58-1.62 3.56-2.43 5.92-2.43.6 0 1.3.1 2.06.3 1 .28 1.8.63 2.44 1.05.6.4 1.23.83 1.83.83.4 0 .93-.32 1.58-.93.65-.63 1.45-1.07 2.4-1.3.93-.24 1.8-.35 2.6-.35 1.7 0 3.2.46 4.47 1.4 1.27.92 2.1 2.13 2.5 3.63-2.13.9-3.2 2.45-3.2 4.67 0 1.63.53 3 1.58 4.1.86.87 1.87 1.42 3.03 1.63-.5 1.5-1.34 2.82-2.52 3.97l-.88.8zm-3.6-16.5c0-.9.33-1.74.98-2.5.65-.77 1.43-1.28 2.33-1.53.07 1.04-.26 1.95-1 2.72-.73.77-1.58 1.3-2.54 1.6-.12-.1-.2-.17-.25-.3z" />
                                            </svg>
                                            Apple
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>

                        <p className="signup-text">
                            Don't have an account?{' '}
                            <Link className="signup-link" to={ROUTES.REGISTER}>
                                Sign up for free
                            </Link>
                        </p>
                    </div>
                </section>

                {/* Right Side: Imagery */}
                <section className="image-section">
                    <div
                        className="image-background"
                        style={{
                            backgroundImage:
                                "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1470&auto=format&fit=crop')",
                        }}
                    ></div>
                    <div className="image-overlay"></div>
                    <div className="quote-card">
                        <blockquote style={{ margin: 0 }}>
                            <p className="quote-text">
                                "Discover premium products, exclusive deals, and a seamless shopping experience."
                            </p>
                            <footer className="quote-author">
                                — LoyalKart Curation
                            </footer>
                        </blockquote>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-brand">
                        <span className="brand-logo" style={{ fontSize: 20 }}>LoyalKart</span>
                        <p className="footer-copyright">© 2026 LoyalKart. All rights reserved.</p>
                    </div>
                    <div className="footer-links">
                        <Link className="footer-link" to={ROUTES.HOME}>
                            Privacy Policy
                        </Link>
                        <Link className="footer-link" to={ROUTES.HOME}>
                            Terms of Service
                        </Link>
                        <Link className="footer-link" to={ROUTES.SHIPPING_INFO}>
                            Shipping & Help
                        </Link>
                        <Link className="footer-link" to={ROUTES.HOME}>
                            Contact
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}