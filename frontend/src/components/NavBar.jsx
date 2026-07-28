import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Search, X, User, Menu } from "lucide-react";
import { useCart } from '../context/CardContext.jsx';
import { clearToken, isAuthenticated, isAdminUser } from '../utils/auth.js';
import { ROUTES } from '../utils/routes.js';
import '../static/NavBar.css';

const NavBar = () => {
    const { cartItems, clearCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const searchInputRef = useRef(null);

    // Auto-close mobile menu on route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (isMobileSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setIsMobileSearchOpen(false);
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isMobileSearchOpen]);

    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const isLoggedIn = isAuthenticated();
    const isAdmin = isAdminUser();

    const handleLogout = () => {
        clearToken();
        clearCart();
        setIsMobileMenuOpen(false);
        navigate(ROUTES.LOGIN);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`${ROUTES.SHOP}?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsMobileSearchOpen(false);
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <header className="top-navbar">
            <div className="nav-container">
                <div className="nav-left">
                    {/* 3-Line Hamburger Menu Button for Mobile */}
                    <button
                        type="button"
                        className="icon-button mobile-menu-toggle"
                        onClick={() => {
                            setIsMobileMenuOpen(!isMobileMenuOpen);
                            if (isMobileSearchOpen) setIsMobileSearchOpen(false);
                        }}
                        aria-label={isMobileMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
                        title={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
                    >
                        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>

                    <Link className="brand-logo" to={ROUTES.HOME}>
                        LoyalKart
                    </Link>
                    <nav className="nav-links">
                        <Link className={`nav-link ${location.pathname === ROUTES.HOME ? 'active-link' : ''}`} to={ROUTES.HOME}>
                            Home
                        </Link>
                        <Link className={`nav-link ${location.pathname === ROUTES.SHOP ? 'active-link' : ''}`} to={ROUTES.SHOP}>
                            Shop
                        </Link>
                        <Link className={`nav-link ${location.pathname === ROUTES.ABOUT ? 'active-link' : ''}`} to={ROUTES.ABOUT}>
                            About
                        </Link>
                        <Link className={`nav-link ${location.pathname === ROUTES.SHIPPING_INFO ? 'active-link' : ''}`} to={ROUTES.SHIPPING_INFO}>
                            Shipping Info
                        </Link>
                    </nav>
                </div>

                {/* Integrated Search Bar */}
                <form className={`nav-search ${isMobileSearchOpen ? 'mobile-open' : ''}`} onSubmit={handleSearch}>
                    <Search className="nav-search-icon" size={18} />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="nav-search-input"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            className="nav-search-clear"
                            onClick={() => {
                                setSearchQuery('');
                                searchInputRef.current?.focus();
                            }}
                            aria-label="Clear Search"
                        >
                            <X size={16} />
                        </button>
                    )}
                    {isMobileSearchOpen && (
                        <button
                            type="button"
                            className="nav-search-close-mobile"
                            onClick={() => setIsMobileSearchOpen(false)}
                            aria-label="Close Search"
                            title="Close Search"
                        >
                            <X size={20} />
                        </button>
                    )}
                </form>

                <div className="nav-right">
                    {/* Mobile Search Toggle */}
                    <button
                        type="button"
                        className="icon-button mobile-search-toggle"
                        onClick={() => {
                            setIsMobileSearchOpen(!isMobileSearchOpen);
                            if (isMobileMenuOpen) setIsMobileMenuOpen(false);
                        }}
                        aria-label={isMobileSearchOpen ? "Close Search" : "Open Search"}
                    >
                        {isMobileSearchOpen ? <X size={22} /> : <Search size={22} />}
                    </button>

                    {/* Cart Button */}
                    <Link to={ROUTES.CART} className="icon-button cart-icon-wrapper" aria-label={`Cart, ${cartCount} items`}>
                        <ShoppingBag size={22} />
                        {cartCount > 0 && (
                            <span className="cart-badge">{cartCount}</span>
                        )}
                    </Link>

                    {isLoggedIn ? (
                        <>
                            {isAdmin && (
                                <Link to={ROUTES.ADMIN_ADD_PRODUCT} className="nav-admin-btn desktop-only" title="Admin Panel">
                                    Admin Panel
                                </Link>
                            )}

                            <Link to={ROUTES.PROFILE} className="icon-button desktop-only" title="Profile">
                                <User size={22} />
                            </Link>

                            <button onClick={handleLogout} className="nav-logout-button desktop-only" title="Logout">
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="nav-auth-buttons desktop-only">
                            <Link className={`sign-in-tab ${location.pathname === ROUTES.LOGIN ? 'active-tab' : ''}`} to={ROUTES.LOGIN}>
                                Sign In
                            </Link>
                            <Link className="register-btn" to={ROUTES.REGISTER}>
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="mobile-nav-drawer">
                    <nav className="mobile-nav-links">
                        <Link className={`mobile-nav-item ${location.pathname === ROUTES.HOME ? 'active' : ''}`} to={ROUTES.HOME}>
                            Home
                        </Link>
                        <Link className={`mobile-nav-item ${location.pathname === ROUTES.SHOP ? 'active' : ''}`} to={ROUTES.SHOP}>
                            Shop
                        </Link>
                        <Link className={`mobile-nav-item ${location.pathname === ROUTES.ABOUT ? 'active' : ''}`} to={ROUTES.ABOUT}>
                            About
                        </Link>
                        <Link className={`mobile-nav-item ${location.pathname === ROUTES.SHIPPING_INFO ? 'active' : ''}`} to={ROUTES.SHIPPING_INFO}>
                            Shipping Info
                        </Link>

                        <hr className="mobile-nav-divider" />

                        {isLoggedIn ? (
                            <>
                                <Link className="mobile-nav-item" to={ROUTES.PROFILE}>
                                    User Profile
                                </Link>
                                {isAdmin && (
                                    <Link className="mobile-nav-item admin" to={ROUTES.ADMIN_ADD_PRODUCT}>
                                        Admin Panel
                                    </Link>
                                )}
                                <button onClick={handleLogout} className="mobile-nav-logout-btn">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <div className="mobile-nav-auth">
                                <Link className="mobile-nav-btn sign-in" to={ROUTES.LOGIN}>
                                    Sign In
                                </Link>
                                <Link className="mobile-nav-btn register" to={ROUTES.REGISTER}>
                                    Register
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default NavBar;