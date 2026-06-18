import { Link, useNavigate } from "react-router-dom";
import { useCart } from '../context/CardContext.jsx';
import { isAuthenticated } from '../utils/auth.js';
import '../static/ProductCard.css';

function ProductCard({ product }) {
    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const imageUrl = product.image
        ? `${BASEURL}${product.image}`
        : 'https://via.placeholder.com/400x400?text=No+Image';

    const handleAddToCart = (e) => {
        e.preventDefault();
        if (!isAuthenticated()) {
            alert("Please log in to add items to your cart.");
            navigate('/login');
            return;
        }
        addToCart(product.id);
    };

    return (
        <Link to={`/products/${product.id}`} className="pc">
            <div className="pc-img-wrap">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="pc-img"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                    }}
                />
            </div>
            <div className="pc-body">
                {product.badge && (
                    <span className="pc-badge">{product.badge}</span>
                )}
                <h2 className="pc-name">{product.name}</h2>
                <div className="pc-bottom">
                    <p className="pc-price">${parseFloat(product.price).toFixed(2)}</p>
                    <button
                        className="pc-cart-btn"
                        onClick={handleAddToCart}
                        aria-label={`Add ${product.name} to cart`}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" aria-hidden="true">
                            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                            <line x1="12" y1="10" x2="12" y2="16"/><line x1="9" y1="13" x2="15" y2="13"/>
                        </svg>
                    </button>
                </div>
            </div>
        </Link>
    );
}

export default ProductCard;