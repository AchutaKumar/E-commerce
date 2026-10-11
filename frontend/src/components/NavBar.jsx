import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useCart } from '../context/CardContext.jsx';
import { clearToken, isAuthenticated, isAdminUser } from '../utils/auth.js';
import '../static/NavBar.css';

const NavBar = () => {
    const { cartItems, clearCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const searchInputRef = useRef(null);

    useEffect(() => {
        if (isMobileSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isMobileSearchOpen]);

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
        setIsMobileSearchOpen(false);
    };

    return (
        <nav className="navbar">
            <Link to='/' className="navbar-logo">LoyalKart</Link>

            <div className="navbar-links" aria-label="Main navigation">
                <NavLink to="/" end className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>Shop</NavLink>
                {isLoggedIn && (
                    <NavLink to="/saved-items" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>Saved</NavLink>
                )}
                <NavLink to="/shipping-info" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>Shipping</NavLink>
                <NavLink to="/about" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>About</NavLink>
            </div>

            <form className={`navbar-search ${isMobileSearchOpen ? 'mobile-open' : ''}`} onSubmit={handleSearch}>
                <button 
                    type="button" 
                    className="navbar-search-btn search-back-btn" 
                    onClick={() => setIsMobileSearchOpen(false)} 
                    aria-label="Close Search"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search products…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="navbar-search-input"
                />
                {searchQuery && (
                    <button 
                        type="button" 
                        className="navbar-search-btn search-clear-btn"
                        onClick={() => {
                            setSearchQuery('');
                            searchInputRef.current?.focus();
                        }}
                        aria-label="Clear Search"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                )}
                <button type="submit" className="navbar-search-btn search-submit-btn" aria-label="Submit Search">
                    <svg className="navbar-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                </button>
            </form>

            <div className="navbar-right">
                <button 
                    className="navbar-cart mobile-search-toggle" 
                    onClick={() => setIsMobileSearchOpen(true)}
                    aria-label="Open Search"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                </button>
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
                            <Link to='/admin/add-product' className="navbar-btn-ghost">
                                Admin
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