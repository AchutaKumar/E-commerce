import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from '../context/CardContext.jsx';
import { clearToken, isAuthenticated, isAdminUser } from '../utils/auth.js';
import '../static/NavBar.css';

const NavBar = () => {
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL
    const { cartItems, clearCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const isLoggedIn = isAuthenticated();
    const isAdmin = isAdminUser();

    const handleLogout = () => {
        clearToken();
        clearCart();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    };

    return (
        <nav className="navbar">
            <Link to='/' className="navbar-logo">LoyalKart</Link>

            <form className="navbar-search" onSubmit={handleSearch}>
                <button type="submit" className="navbar-search-btn" aria-label="Submit Search">
                    <svg className="navbar-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                </button>
                <input
                    type="text"
                    placeholder="Search products…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="navbar-search-input"
                />
            </form>

            <div className="navbar-right">
                {isLoggedIn ? (
                    <>
                        <Link to='/cart' className="navbar-cart" aria-label={`Cart, ${cartCount} items`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="navbar-cart-badge">{cartCount}</span>
                            )}
                        </Link>

                        {isAdmin && (
                            <Link to='/admin/add-product' className="navbar-btn-ghost" style={{ marginRight: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                Admin Panel
                            </Link>
                        )}

                        <div className="navbar-divider" />

                        <Link to='/profile' className="navbar-avatar" title="Profile">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </Link>

                        <button onClick={handleLogout} className="navbar-logout">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to='/login' className="navbar-btn-ghost">Login</Link>
                        <Link to='/register' className="navbar-btn-primary">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default NavBar;