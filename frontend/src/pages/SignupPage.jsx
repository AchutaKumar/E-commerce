import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { CheckCircle, Circle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import '../static/SignupPage.css';

// Form Validation Schema using Yup
const SignUpSchema = Yup.object().shape({
    username: Yup.string()
        .min(3, 'Username must be at least 3 characters')
        .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores')
        .required('Username is required'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(8, 'At least 8 characters required')
        .matches(/[A-Z]/, 'One uppercase letter required')
        .matches(/[0-9]/, 'One number required')
        .matches(/[!@#$%^&*(),.?":{}|<>]/, 'One special character required')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords do not match.')
        .required('Confirm Password is required'),
});

export default function SignUpPage() {
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL;
    const navigate = useNavigate();

    const initialValues = {
        username: '',
        email: '',
        phone_number: '',
        password: '',
        confirmPassword: '',
    };

    const handleSubmit = async (values, { setSubmitting, setStatus }) => {
        setStatus(null);
        try {
            const res = await fetch(`${BASE_URL}/api/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: values.username,
                    email: values.email,
                    password: values.password,
                    password2: values.confirmPassword,
                    phone_number: values.phone_number || ''
                })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', message: 'Registration successful! Redirecting to login...' });
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                let errorMsg = 'Registration failed. Please check your inputs.';
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
                setStatus({ type: 'error', message: errorMsg });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'A network error occurred. Please check your connection and try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="signup-page">
            {/* Main Content Area */}
            <main className="main-content">
                <div className="grid-wrapper">
                    {/* Left Side: Visual Anchor */}
                    <div className="visual-anchor">
                        <div
                            className="visual-image"
                            style={{
                                backgroundImage: `url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1470&auto=format&fit=crop')`,
                            }}
                        />
                        <div className="visual-overlay" />
                        <div className="visual-text-content">
                            <h1 className="visual-title">Elevate your shopping experience.</h1>
                            <p className="visual-subtitle">
                                Join LoyalKart to discover exclusive deals, premium products, and a seamless checkout experience.
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Signup Form */}
                    <div className="form-section">
                        <div className="form-wrapper">
                            <header className="form-header">
                                <h2 className="form-title">Create an account</h2>
                                <p className="form-subtitle">Welcome to LoyalKart. Please enter your details to register.</p>
                            </header>

                            <Formik
                                initialValues={initialValues}
                                validationSchema={SignUpSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ isSubmitting, values, errors, touched, status }) => {
                                    // Real-time password requirement checks
                                    const pwd = values.password;
                                    const ruleLength = pwd.length >= 8;
                                    const ruleUpper = /[A-Z]/.test(pwd);
                                    const ruleNumber = /[0-9]/.test(pwd);
                                    const ruleSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

                                    return (
                                        <Form className="signup-form">
                                            {status && (
                                                <div
                                                    className="error-msg"
                                                    style={{
                                                        padding: '12px',
                                                        backgroundColor: status.type === 'success' ? '#d1fae5' : '#fee2e2',
                                                        color: status.type === 'success' ? '#065f46' : '#991b1b',
                                                        borderRadius: '8px',
                                                        textAlign: 'center',
                                                        fontWeight: 500,
                                                        marginBottom: '16px'
                                                    }}
                                                >
                                                    {status.message}
                                                </div>
                                            )}

                                            <div className="form-fields">
                                                {/* Username */}
                                                <div className="form-group">
                                                    <label htmlFor="username" className="form-label">Username</label>
                                                    <Field
                                                        type="text"
                                                        id="username"
                                                        name="username"
                                                        placeholder="Choose a username"
                                                        autoComplete="username"
                                                        className={`form-input ${errors.username && touched.username ? 'input-error' : ''}`}
                                                    />
                                                    <ErrorMessage name="username" component="div" className="error-msg" />
                                                </div>

                                                {/* Email */}
                                                <div className="form-group">
                                                    <label htmlFor="email" className="form-label">Email</label>
                                                    <Field
                                                        type="email"
                                                        id="email"
                                                        name="email"
                                                        placeholder="Email address"
                                                        autoComplete="email"
                                                        className={`form-input ${errors.email && touched.email ? 'input-error' : ''}`}
                                                    />
                                                    <ErrorMessage name="email" component="div" className="error-msg" />
                                                </div>

                                                {/* Phone Number (Optional) */}
                                                <div className="form-group">
                                                    <label htmlFor="phone_number" className="form-label">Phone Number (Optional)</label>
                                                    <Field
                                                        type="tel"
                                                        id="phone_number"
                                                        name="phone_number"
                                                        placeholder="Enter phone number"
                                                        autoComplete="tel"
                                                        className="form-input"
                                                    />
                                                </div>

                                                {/* Password */}
                                                <div className="form-group">
                                                    <label htmlFor="password" className="form-label">Password</label>
                                                    <Field
                                                        type="password"
                                                        id="password"
                                                        name="password"
                                                        placeholder="Create a password"
                                                        autoComplete="new-password"
                                                        className={`form-input ${errors.password && touched.password ? 'input-error' : ''}`}
                                                    />
                                                    <ErrorMessage name="password" component="div" className="error-msg" />
                                                </div>

                                                {/* Password Requirements Dynamic Checklist */}
                                                <div className="rules-container">
                                                    <p className="rules-title">Password requirements:</p>

                                                    <div className={`check-item ${ruleLength ? 'valid-rule' : 'invalid-rule'}`}>
                                                        {ruleLength ? <CheckCircle size={18} /> : <Circle size={18} />}
                                                        <span>At least 8 characters</span>
                                                    </div>

                                                    <div className={`check-item ${ruleUpper ? 'valid-rule' : 'invalid-rule'}`}>
                                                        {ruleUpper ? <CheckCircle size={18} /> : <Circle size={18} />}
                                                        <span>One uppercase letter</span>
                                                    </div>

                                                    <div className={`check-item ${ruleNumber ? 'valid-rule' : 'invalid-rule'}`}>
                                                        {ruleNumber ? <CheckCircle size={18} /> : <Circle size={18} />}
                                                        <span>One number</span>
                                                    </div>

                                                    <div className={`check-item ${ruleSpecial ? 'valid-rule' : 'invalid-rule'}`}>
                                                        {ruleSpecial ? <CheckCircle size={18} /> : <Circle size={18} />}
                                                        <span>One special character</span>
                                                    </div>
                                                </div>

                                                {/* Confirm Password */}
                                                <div className="form-group">
                                                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                                    <Field
                                                        type="password"
                                                        id="confirmPassword"
                                                        name="confirmPassword"
                                                        placeholder="Confirm your password"
                                                        autoComplete="new-password"
                                                        className={`form-input ${errors.confirmPassword && touched.confirmPassword ? 'input-error' : ''}`}
                                                    />
                                                    <ErrorMessage name="confirmPassword" component="div" className="error-msg" />
                                                </div>
                                            </div>

                                            {/* Submit Button */}
                                            <button type="submit" disabled={isSubmitting} className="submit-button">
                                                {isSubmitting ? 'Registering...' : 'Sign Up'}
                                            </button>
                                        </Form>
                                    );
                                }}
                            </Formik>

                            <p className="signin-prompt">
                                Already have an account?{' '}
                                <Link to="/login" className="signin-link">Sign In</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}