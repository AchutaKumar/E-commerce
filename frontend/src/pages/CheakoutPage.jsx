import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../utils/routes';
import {
    ArrowLeft,
    CreditCard,
    Lock,
    HelpCircle,
    ShoppingBag,
    ShieldCheck,
    Truck,
    Wallet
} from 'lucide-react';
import { useCart } from '../context/CardContext.jsx';
import { authFetch } from '../utils/auth.js';
import '../static/CheakoutPage.css';

// Form validation schema using Yup
const CheckoutSchema = Yup.object().shape({
    fullName: Yup.string().required('Full Name is required'),
    streetAddress: Yup.string().required('Street Address is required'),
    city: Yup.string().required('City is required'),
    zipCode: Yup.string().required('ZIP Code is required'),
    phone: Yup.string()
        .test('min-10-digits', 'Phone number must be at least 10 digits', val => val && val.replace(/\D/g, '').length >= 10)
        .required('Phone number is required'),
    deliveryMethod: Yup.string().required('Select a delivery method'),
    cardNumber: Yup.string()
        .test('is-16-digits', 'Card number must be 16 digits', val => val && val.replace(/\D/g, '').length === 16)
        .required('Card number is required'),
    expiryDate: Yup.string()
        .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Use MM/YY format (e.g. 12/26)')
        .required('Expiry date is required'),
    cvv: Yup.string()
        .matches(/^\d{3,4}$/, 'CVV must be 3 or 4 digits')
        .required('CVV is required'),
    saveCard: Yup.boolean(),
});

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { cartItems, total, clearCart } = useCart();
    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;

    const initialValues = {
        fullName: '',
        streetAddress: '',
        city: '',
        zipCode: '',
        phone: '',
        deliveryMethod: 'standard',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        saveCard: false,
    };

    const deliveryPrices = {
        standard: 0.00,
        express: 15.00,
        overnight: 35.00,
    };

    const tax = total * 0.08; // 8% tax

    const handleCardNumberChange = (e, setFieldValue) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
        const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
        setFieldValue('cardNumber', formatted);
    };

    const handleExpiryChange = (e, setFieldValue) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (raw.length >= 3) {
            setFieldValue('expiryDate', `${raw.slice(0, 2)}/${raw.slice(2)}`);
        } else {
            setFieldValue('expiryDate', raw);
        }
    };

    const handleCvvChange = (e, setFieldValue) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
        setFieldValue('cvv', raw);
    };

    const handleSubmit = async (values, { setSubmitting, setStatus }) => {
        setStatus(null);
        try {
            const cleanPhone = values.phone.replace(/\D/g, '');
            const res = await authFetch(`${BASEURL}/api/orders/create/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: cleanPhone,
                    full_name: values.fullName,
                    address: `${values.streetAddress}, ${values.city} ${values.zipCode}`,
                    delivery_method: values.deliveryMethod,
                })
            });

            const data = await res.json();

            if (res.ok) {
                clearCart();
                alert(`Order Placed Successfully! Order ID: #${data.order_id}`);
                navigate(ROUTES.HOME);
            } else {
                setStatus({ error: data.error || 'Failed to place order. Please try again.' });
            }
        } catch (error) {
            console.error('Error placing order:', error);
            setStatus({ error: 'An error occurred. Please check your connection and try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="checkout-page">
                <div className="checkout-main-container">
                    <div className="checkout-empty-card">
                        <h2>No items to checkout</h2>
                        <p>Your shopping bag is empty. Please add some products before proceeding.</p>
                        <Link to={ROUTES.HOME} className="complete-btn" style={{ display: 'inline-block', width: 'auto', padding: '12px 32px', textDecoration: 'none' }}>
                            Back to Shop
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            {/* Main Content Container */}
            <div className="checkout-main-container">
                <div className="checkout-top-bar">
                    <button type="button" className="back-btn" onClick={() => navigate(ROUTES.CART)}>
                        <ArrowLeft size={16} />
                        <span>Back to Cart</span>
                    </button>
                    <div className="checkout-title-wrap">
                        <h1 className="checkout-main-title">Secure Checkout</h1>
                        <div className="secure-badge">
                            <ShieldCheck size={16} />
                            <span>SSL Encrypted</span>
                        </div>
                    </div>
                </div>

                <Formik
                    initialValues={initialValues}
                    validationSchema={CheckoutSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, values, setFieldValue, errors, touched, status }) => {
                        const shippingCost = deliveryPrices[values.deliveryMethod] || 0.00;
                        const grandTotal = parseFloat(total) + tax + shippingCost;

                        return (
                            <Form className="checkout-grid">
                                {/* Left Column Forms */}
                                <div className="form-column">
                                    {status && status.error && (
                                        <div
                                            style={{
                                                padding: '14px 18px',
                                                backgroundColor: '#fee2e2',
                                                color: '#991b1b',
                                                borderRadius: '8px',
                                                fontWeight: 500,
                                                fontSize: '14px'
                                            }}
                                        >
                                            {status.error}
                                        </div>
                                    )}

                                    {/* Step 1: Shipping Address */}
                                    <section className="checkout-section">
                                        <div className="section-header">
                                            <span className="step-number">1</span>
                                            <h2 className="section-title">Shipping Address</h2>
                                        </div>

                                        <div className="inputs-grid">
                                            <div className="input-group grid-span-2">
                                                <label htmlFor="fullName" className="input-label">Full Name</label>
                                                <Field
                                                    type="text"
                                                    id="fullName"
                                                    name="fullName"
                                                    placeholder="e.g. Julianne Sterling"
                                                    className={`form-input ${errors.fullName && touched.fullName ? 'input-error' : ''}`}
                                                />
                                                <ErrorMessage name="fullName" component="div" className="error-msg" />
                                            </div>

                                            <div className="input-group grid-span-2">
                                                <label htmlFor="streetAddress" className="input-label">Street Address</label>
                                                <Field
                                                    type="text"
                                                    id="streetAddress"
                                                    name="streetAddress"
                                                    placeholder="123 Fifth Avenue, Suite 400"
                                                    className={`form-input ${errors.streetAddress && touched.streetAddress ? 'input-error' : ''}`}
                                                />
                                                <ErrorMessage name="streetAddress" component="div" className="error-msg" />
                                            </div>

                                            <div className="input-group">
                                                <label htmlFor="city" className="input-label">City</label>
                                                <Field
                                                    type="text"
                                                    id="city"
                                                    name="city"
                                                    placeholder="New York"
                                                    className={`form-input ${errors.city && touched.city ? 'input-error' : ''}`}
                                                />
                                                <ErrorMessage name="city" component="div" className="error-msg" />
                                            </div>

                                            <div className="input-group">
                                                <label htmlFor="zipCode" className="input-label">ZIP / Postal Code</label>
                                                <Field
                                                    type="text"
                                                    id="zipCode"
                                                    name="zipCode"
                                                    placeholder="10001"
                                                    className={`form-input ${errors.zipCode && touched.zipCode ? 'input-error' : ''}`}
                                                />
                                                <ErrorMessage name="zipCode" component="div" className="error-msg" />
                                            </div>

                                            <div className="input-group grid-span-2">
                                                <label htmlFor="phone" className="input-label">Phone Number</label>
                                                <Field
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    placeholder="+1 (555) 000-0000"
                                                    className={`form-input ${errors.phone && touched.phone ? 'input-error' : ''}`}
                                                />
                                                <ErrorMessage name="phone" component="div" className="error-msg" />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Step 2: Delivery Method */}
                                    <section className="checkout-section">
                                        <div className="section-header">
                                            <span className="step-number">2</span>
                                            <h2 className="section-title">Delivery Method</h2>
                                        </div>

                                        <div className="delivery-options">
                                            <label
                                                className={`delivery-card ${values.deliveryMethod === 'standard' ? 'selected' : ''}`}
                                            >
                                                <Field
                                                    type="radio"
                                                    name="deliveryMethod"
                                                    value="standard"
                                                    className="delivery-radio"
                                                />
                                                <div className="delivery-details">
                                                    <span className="delivery-title">Standard Delivery</span>
                                                    <span className="delivery-sub">3-5 business days</span>
                                                </div>
                                                <span className="delivery-price">Free</span>
                                            </label>

                                            <label
                                                className={`delivery-card ${values.deliveryMethod === 'express' ? 'selected' : ''}`}
                                            >
                                                <Field
                                                    type="radio"
                                                    name="deliveryMethod"
                                                    value="express"
                                                    className="delivery-radio"
                                                />
                                                <div className="delivery-details">
                                                    <span className="delivery-title">Express Shipping</span>
                                                    <span className="delivery-sub">1-2 business days</span>
                                                </div>
                                                <span className="delivery-price">$15.00</span>
                                            </label>

                                            <label
                                                className={`delivery-card ${values.deliveryMethod === 'overnight' ? 'selected' : ''}`}
                                            >
                                                <Field
                                                    type="radio"
                                                    name="deliveryMethod"
                                                    value="overnight"
                                                    className="delivery-radio"
                                                />
                                                <div className="delivery-details">
                                                    <span className="delivery-title">Overnight Courier</span>
                                                    <span className="delivery-sub">Next morning delivery</span>
                                                </div>
                                                <span className="delivery-price">$35.00</span>
                                            </label>
                                        </div>
                                    </section>

                                    {/* Step 3: Payment Details */}
                                    <section className="checkout-section">
                                        <div className="section-header">
                                            <span className="step-number">3</span>
                                            <h2 className="section-title">Payment Details</h2>
                                        </div>

                                        <div className="payment-box">
                                            <div className="payment-header">
                                                <div className="payment-type">
                                                    <CreditCard size={20} />
                                                    <span>Credit Card</span>
                                                </div>
                                                <div style={{ opacity: 0.6 }}>
                                                    <Wallet size={20} />
                                                </div>
                                            </div>

                                            <div className="inputs-grid">
                                                <div className="input-group grid-span-2">
                                                    <label htmlFor="cardNumber" className="input-label">Card Number</label>
                                                    <div className="input-wrapper">
                                                        <input
                                                            type="text"
                                                            id="cardNumber"
                                                            name="cardNumber"
                                                            value={values.cardNumber}
                                                            onChange={(e) => handleCardNumberChange(e, setFieldValue)}
                                                            placeholder="0000 0000 0000 0000"
                                                            className={`form-input ${errors.cardNumber && touched.cardNumber ? 'input-error' : ''}`}
                                                        />
                                                        <Lock size={18} className="input-icon" />
                                                    </div>
                                                    <ErrorMessage name="cardNumber" component="div" className="error-msg" />
                                                </div>

                                                <div className="input-group">
                                                    <label htmlFor="expiryDate" className="input-label">Expiry Date</label>
                                                    <input
                                                        type="text"
                                                        id="expiryDate"
                                                        name="expiryDate"
                                                        value={values.expiryDate}
                                                        onChange={(e) => handleExpiryChange(e, setFieldValue)}
                                                        placeholder="MM/YY"
                                                        className={`form-input ${errors.expiryDate && touched.expiryDate ? 'input-error' : ''}`}
                                                    />
                                                    <ErrorMessage name="expiryDate" component="div" className="error-msg" />
                                                </div>

                                                <div className="input-group">
                                                    <label htmlFor="cvv" className="input-label">CVV</label>
                                                    <div className="input-wrapper">
                                                        <input
                                                            type="password"
                                                            id="cvv"
                                                            name="cvv"
                                                            value={values.cvv}
                                                            onChange={(e) => handleCvvChange(e, setFieldValue)}
                                                            placeholder="***"
                                                            className={`form-input ${errors.cvv && touched.cvv ? 'input-error' : ''}`}
                                                        />
                                                        <HelpCircle size={18} className="input-icon" style={{ pointerEvents: 'auto', cursor: 'pointer' }} />
                                                    </div>
                                                    <ErrorMessage name="cvv" component="div" className="error-msg" />
                                                </div>
                                            </div>

                                            <div className="checkbox-row">
                                                <Field
                                                    type="checkbox"
                                                    id="saveCard"
                                                    name="saveCard"
                                                    className="checkbox-input"
                                                />
                                                <label htmlFor="saveCard" className="checkbox-label">
                                                    Save card details for future purchases to experience faster checkout next time.
                                                </label>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Right Column Sticky Order Summary */}
                                <div className="summary-column">
                                    <div className="sticky-summary">
                                        <div className="summary-card">
                                            <h3 className="summary-title">Order Summary</h3>

                                            <div className="cart-items">
                                                {cartItems.length > 0 ? cartItems.map((item) => (
                                                    <div className="cart-item" key={item.id}>
                                                        <div className="item-img-wrapper">
                                                            {item.product_image ? (
                                                                <img
                                                                    src={typeof item.product_image === 'string' && item.product_image.startsWith('http') ? item.product_image : `${BASEURL}${item.product_image}`}
                                                                    alt={item.product_name}
                                                                    className="item-img"
                                                                />
                                                            ) : (
                                                                <div style={{ width: '100%', height: '100%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '12px' }}>No Image</div>
                                                            )}
                                                        </div>
                                                        <div className="item-info">
                                                            <p className="item-name">{item.product_name}</p>
                                                            <div className="item-price-row">
                                                                <span>Qty: {item.quantity}</span>
                                                                <span className="item-price">${parseFloat(item.product_price).toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <p style={{ color: '#76777d', fontSize: '14px' }}>No items in cart</p>
                                                )}
                                            </div>

                                            <div className="cost-breakdown">
                                                <div className="cost-row">
                                                    <span className="cost-label">Subtotal</span>
                                                    <span className="cost-value">${parseFloat(total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="cost-row">
                                                    <span className="cost-label">Shipping</span>
                                                    <span className="cost-value">{shippingCost === 0 ? 'Free' : `$${shippingCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</span>
                                                </div>
                                                <div className="cost-row">
                                                    <span className="cost-label">Estimated Tax</span>
                                                    <span className="cost-value">${tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="cost-row total-row">
                                                    <span className="total-label">Total</span>
                                                    <span className="total-value">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>

                                            <button type="submit" disabled={isSubmitting} className="complete-btn">
                                                <span>{isSubmitting ? 'Processing...' : 'Complete Purchase'}</span>
                                                <ShoppingBag size={18} />
                                            </button>

                                            <div className="trust-badges">
                                                <div className="badge-item">
                                                    <ShieldCheck size={16} />
                                                    <span>SSL Secure</span>
                                                </div>
                                                <div className="badge-divider" />
                                                <span className="badge-item" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    PCI Compliant
                                                </span>
                                            </div>
                                        </div>

                                        <div className="trust-card">
                                            <Truck size={24} className="trust-icon" />
                                            <div>
                                                <p className="trust-title">White Glove Delivery</p>
                                                <p className="trust-desc">
                                                    All orders include complimentary premium packaging and insured transport.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Form>
                        );
                    }}
                </Formik>
            </div>
        </div>
    );
}