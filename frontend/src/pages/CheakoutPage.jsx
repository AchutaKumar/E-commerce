import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CardContext.jsx";
import { authFetch } from "../utils/auth.js";
import '../static/CheakoutPage.css';

function CheakoutPage() {
    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;
    const navigate = useNavigate();
    const { cartItems, total, clearCart } = useCart();

    const [form, setForm] = useState({
        name: '',
        address: '',
        phone: '',
        payment_method: 'COD'
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const res = await authFetch(`${BASEURL}/api/orders/create/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await res.json();
            if (res.ok) {
                setMessage('Order placed successfully!');
                setTimeout(() => {
                    clearCart();
                    navigate('/');
                }, 1400);
            } else {
                setMessage(data.error || 'Failed to place order. Please try again.');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            setMessage('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="checkout-page-wrapper">
                <div className="checkout-empty-state-panel">
                    <div className="checkout-empty-icon">🛍️</div>
                    <h2>No items to checkout</h2>
                    <p>Your shopping bag is empty. Please add some products to your cart before proceeding.</p>
                    <Link to="/" className="checkout-empty-cta-btn">Back to Shop</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page-wrapper">
            <div className="checkout-top-bar">
                <button onClick={() => navigate('/cart')} className="checkout-page-back" title="Back to bag">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                    </svg>
                    <span>Back to Cart</span>
                </button>
            </div>

            <div className="checkout-header-title">
                <h1>Secure Checkout</h1>
                <div className="checkout-secure-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span>SSL Encrypted</span>
                </div>
            </div>

            <div className="checkout-grid">
                {/* Left Column: Checkout Shipping details Form */}
                <div className="checkout-form-section">
                    <div className="checkout-panel">
                        <h2>Shipping Information</h2>
                        <form onSubmit={handleSubmit} className="checkout-main-form">
                            <div className="form-group-row">
                                <div className="checkout-form-group">
                                    <label htmlFor="name">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleInputChange}
                                        required
                                        className="checkout-input-field"
                                        placeholder="Enter your first and last name"
                                    />
                                </div>
                            </div>

                            <div className="checkout-form-group">
                                <label htmlFor="address">Delivery Address</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    value={form.address}
                                    onChange={handleInputChange}
                                    required
                                    rows={3}
                                    className="checkout-textarea-field"
                                    placeholder="Apartment, suite, street address, city, zip code"
                                />
                            </div>

                            <div className="form-group-row">
                                <div className="checkout-form-group">
                                    <label htmlFor="phone">Phone Number</label>
                                    <input
                                        type="text"
                                        id="phone"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleInputChange}
                                        required
                                        className="checkout-input-field"
                                        placeholder="Enter active phone number"
                                    />
                                </div>

                                <div className="checkout-form-group">
                                    <label htmlFor="payment_method">Payment Option</label>
                                    <select
                                        id="payment_method"
                                        name="payment_method"
                                        value={form.payment_method}
                                        onChange={handleInputChange}
                                        className="checkout-select-field"
                                    >
                                        <option value="COD">Cash on Delivery (COD)</option>
                                        <option value="credit">Online Card Payment</option>
                                    </select>
                                </div>
                            </div>

                            {message && (
                                <div className={`checkout-message ${message.toLowerCase().includes('success') ? 'success' : 'error'}`}>
                                    {message}
                                </div>
                            )}

                            <div className="checkout-form-actions">
                                <button type="submit" className="checkout-submit-btn" disabled={loading}>
                                    {loading ? 'Processing Order...' : 'Confirm & Place Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Order items preview Summary */}
                <div className="checkout-summary-section">
                    <div className="checkout-summary-sticky-card">
                        <h2>Your Order</h2>
                        <div className="checkout-summary-items-list">
                            {cartItems.map((item) => (
                                <div key={item.id} className="checkout-summary-item-row">
                                    <div className="checkout-item-thumb-wrap">
                                        {item.product_image ? (
                                            <img
                                                src={`${BASEURL}${item.product_image}`}
                                                alt={item.product_name}
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80?text=No+Image' }}
                                            />
                                        ) : (
                                            <div className="checkout-item-no-thumb">No Image</div>
                                        )}
                                        <span className="checkout-item-quantity-badge">{item.quantity}</span>
                                    </div>
                                    
                                    <div className="checkout-item-detail-col">
                                        <span className="checkout-item-name">{item.product_name}</span>
                                        <span className="checkout-item-price-each">${parseFloat(item.product_price).toFixed(2)} each</span>
                                    </div>

                                    <div className="checkout-item-price-subtotal">
                                        ${(item.product_price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <hr className="checkout-summary-divider" />

                        <div className="checkout-cost-details">
                            <div className="cost-row">
                                <span>Subtotal</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <div className="cost-row">
                                <span>Shipping</span>
                                <span className="free-shipping-txt">FREE</span>
                            </div>
                            <div className="cost-row">
                                <span>Estimated Tax</span>
                                <span>$0.00</span>
                            </div>
                        </div>

                        <hr className="checkout-summary-divider" />

                        <div className="checkout-final-total-row">
                            <span>Total Due</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheakoutPage;