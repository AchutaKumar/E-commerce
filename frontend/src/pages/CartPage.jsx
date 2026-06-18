import { useCart } from "../context/CardContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import '../static/CartPage.css';

function CartPage() {
    const { cartItems, total, removeFromCart, updateQuantity } = useCart();
    const navigate = useNavigate();
    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;

    const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="cart-page-wrapper">
            <div className="cart-top-bar">
                <button onClick={() => navigate('/')} className="cart-page-back" title="Go back">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                    </svg>
                    <span>Continue Shopping</span>
                </button>
            </div>

            <div className="cart-header-title">
                <h1>Shopping Bag</h1>
                <span className="cart-header-count">({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})</span>
            </div>

            {cartItems.length === 0 ? (
                <div className="cart-empty-panel">
                    <div className="cart-empty-icon">🛒</div>
                    <h2>Your Bag is Empty</h2>
                    <p>It looks like you haven't added any items to your bag yet.</p>
                    <Link to="/" className="cart-empty-cta">Browse Products</Link>
                </div>
            ) : (
                <div className="cart-grid">
                    {/* Left Column: Cart Items List */}
                    <div className="cart-items-section">
                        {cartItems.map((item) => (
                            <div key={item.id} className="cart-item-row">
                                <div className="cart-item-thumb">
                                    {item.product_image ? (
                                        <img
                                            src={`${BASEURL}${item.product_image}`}
                                            alt={item.product_name}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=No+Image' }}
                                        />
                                    ) : (
                                        <div className="cart-item-no-thumb">No Image</div>
                                    )}
                                </div>

                                <div className="cart-item-info-col">
                                    <Link to={`/products/${item.product}`} className="cart-item-name-link">
                                        {item.product_name}
                                    </Link>
                                    <span className="cart-item-unit-price">${parseFloat(item.product_price).toFixed(2)} each</span>
                                </div>

                                <div className="cart-item-controls-col">
                                    <div className="cart-item-quantity-box">
                                        <button
                                            className="qty-change-btn"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            aria-label="Decrease quantity"
                                        >−</button>
                                        <span className="qty-count-val">{item.quantity}</span>
                                        <button
                                            className="qty-change-btn"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            aria-label="Increase quantity"
                                        >+</button>
                                    </div>
                                </div>

                                <div className="cart-item-subtotal-col">
                                    <span className="cart-item-price-label">Subtotal</span>
                                    <span className="cart-item-price-value">${(item.product_price * item.quantity).toFixed(2)}</span>
                                </div>

                                <div className="cart-item-remove-col">
                                    <button
                                        className="cart-row-remove-btn"
                                        onClick={() => removeFromCart(item.id)}
                                        aria-label="Remove item"
                                        title="Remove from bag"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            <line x1="10" y1="11" x2="10" y2="17" />
                                            <line x1="14" y1="11" x2="14" y2="17" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Column: Order Summary Card */}
                    <div className="cart-summary-section">
                        <div className="cart-summary-sticky-card">
                            <h2>Order Summary</h2>

                            <div className="cart-summary-details">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span className="free-shipping-tag">FREE</span>
                                </div>
                                <div className="summary-row">
                                    <span>Estimated Tax</span>
                                    <span>$0.00</span>
                                </div>
                            </div>

                            <hr className="summary-card-divider" />

                            <div className="summary-total-row">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>

                            <Link to="/checkout" className="cart-checkout-cta-btn">
                                Proceed to Checkout
                            </Link>

                            <div className="cart-trust-badge">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <span>Secure Transactions & Easy Returns</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CartPage;