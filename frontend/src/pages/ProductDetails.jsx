import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import '../static/ProductDetails.css'
import { useCart } from '../context/CardContext'
import { isAuthenticated } from '../utils/auth.js';
import ProductCard from '../components/ProductCard';
import * as Icon from '../components/Icons.jsx';
import { ProductDetailSkeleton } from '../components/SkeletonLoader';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [addedToWatchlist, setAddedToWatchlist] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [otherProducts, setOtherProducts] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
        if (watchlist.includes(parseInt(id))) {
            setAddedToWatchlist(true);
        }
    }, [id]);

    useEffect(() => {
        fetch(`${BASEURL}/api/products/${id}/`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Server is down, Please try again later");
                }
                return response.json();
            })
            .then((data) => {
                console.log('Product data:', data);
                console.log('Image path:', data.image);
                setProduct(data);
                setLoading(false);
                if (data.category) {
                    fetch(`${BASEURL}/api/products/`)
                        .then(res => res.json())
                        .then(allProducts => {
                            const related = allProducts.filter(
                                p => p.category?.id === data.category.id && p.id !== data.id
                            ).sort(() => 0.5 - Math.random()).slice(0, 4);
                            const others = allProducts.filter(
                                p => p.category?.id !== data.category.id && p.id !== data.id
                            ).sort(() => 0.5 - Math.random()).slice(0, 4);
                            setRelatedProducts(related);
                            setOtherProducts(others);
                        });
                }
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });
    }, [id, BASEURL]);

    const { addToCart } = useCart();

    const handleAddToCart = () => {
        if (!isAuthenticated()) {
            alert("Please log in to add items to your cart.");
            navigate('/login');
            return;
        }
        addToCart(product.id, quantity);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleToggleWatchlist = () => {
        if (!isAuthenticated()) {
            alert("Please log in to manage your watchlist.");
            navigate('/login');
            return;
        }
        
        let watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
        const productId = parseInt(id);
        
        if (addedToWatchlist) {
            watchlist = watchlist.filter(item => item !== productId);
            setAddedToWatchlist(false);
        } else {
            if (!watchlist.includes(productId)) {
                watchlist.push(productId);
            }
            setAddedToWatchlist(true);
        }
        
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0) setQuantity(value);
    };

    const handleIncrement = () => {
        if (quantity < 100) setQuantity(quantity + 1);
    };

    const handleDecrement = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    if (loading) {
        return (
            <div>
                <div className='product-detail-container'>
                    <button onClick={() => navigate(-1)} className="back-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14" style={{ verticalAlign: 'middle' }}>
                            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                        </svg>
                        <span>Back</span>
                    </button>
                    <ProductDetailSkeleton />
                </div>
            </div>
        );
    }

    if (error) return <div className="product-detail-error">Error: {error}</div>;
    if (!product) return <div className="product-detail-error">Product not found</div>;

    return (
        <div>
            <div className='product-detail-container'>
                <button
                    onClick={() => navigate(-1)}
                    className="back-btn"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14" style={{ verticalAlign: 'middle' }}>
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                    </svg>
                    <span>Back</span>
                </button>
                <div className="product-detail-content">
                    <div className="product-detail-image-wrapper">
                        <img
                            src={product.image ? `${BASEURL}${product.image}` : 'https://via.placeholder.com/400x400?text=No+Image'}
                            alt={product.name}
                            className="product-detail-image"
                            onError={(e) => {
                                console.error('Image failed to load:', e.target.src);
                                e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                            }}
                            onLoad={() => console.log('Image loaded successfully:', `${BASEURL}${product.image}`)}
                        />
                    </div>

                    <div className="product-detail-info">
                        <div className="product-detail-header">
                            <h1 className="product-detail-title">{product.name}</h1>
                            <p className="product-detail-category">{product.category?.name || 'Product'}</p>
                        </div>

                        <div className="product-detail-rating">
                            <span className="stars">★★★★★</span>
                            <span className="rating-count">(120 reviews)</span>
                        </div>

                        <div className="product-detail-price-section">
                            <p className="product-detail-price">${product.price}</p>
                            <span className="product-detail-save">Save 10%</span>
                        </div>

                        <p className="product-detail-description">
                            {product.description || "High-quality product designed for maximum comfort and durability. Perfect for everyday use."}
                        </p>

                        <div className="product-detail-specs">
                            <div className="spec-item">
                                <span className="spec-label">Stock:</span>
                                <span className="spec-value">In Stock</span>
                            </div>
                            <div className="spec-item">
                                <span className="spec-label">Shipping:</span>
                                <span className="spec-value">Free worldwide</span>
                            </div>
                            <div className="spec-item">
                                <span className="spec-label">Returns:</span>
                                <span className="spec-value">30-day policy</span>
                            </div>
                        </div>

                        <div className="product-detail-actions">
                            <div className="quantity-selector">
                                <button
                                    className="quantity-btn minus"
                                    onClick={handleDecrement}
                                    disabled={quantity <= 1}
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (!isNaN(val) && val > 0 && val <= 100) setQuantity(val);
                                    }}
                                    className="quantity-input"
                                    min="1"
                                    max="100"
                                />
                                <button
                                    className="quantity-btn plus"
                                    onClick={handleIncrement}
                                    disabled={quantity >= 100}
                                >
                                    +
                                </button>
                            </div>

                            <button
                                className={`add-to-cart-btn ${addedToCart ? 'added' : ''}`}
                                onClick={handleAddToCart}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                {addedToCart ? <><Icon.CheckIcon /> Added to Cart!</> : <><Icon.ShoppingCartIcon /> Add to Cart</>}
                            </button>
                            
                            <button 
                                className={`watchlist-btn ${addedToWatchlist ? 'active' : ''}`} 
                                onClick={handleToggleWatchlist}
                                title="Save Item"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                {addedToWatchlist ? <><span style={{color: '#ef4444', display: 'flex'}}><Icon.HeartFilledIcon /></span> Saved</> : <><span style={{display: 'flex'}}><Icon.HeartEmptyIcon /></span> Save</>}
                            </button>
                        </div>

                        <div className="product-detail-features">
                            <h3>Key Features:</h3>
                            <ul>
                                <li>Premium quality materials</li>
                                <li>Eco-friendly packaging</li>
                                <li>Lifetime warranty</li>
                                <li>24/7 customer support</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <div className="related-products-section">
                        <h2 className="related-title">Related Products</h2>
                        <div className="related-grid">
                            {relatedProducts.map(rp => (
                                <ProductCard key={rp.id} product={rp} />
                            ))}
                        </div>
                    </div>
                )}

                {otherProducts.length > 0 && (
                    <div className="related-products-section">
                        <h2 className="related-title">Other Products</h2>
                        <div className="related-grid">
                            {otherProducts.map(op => (
                                <ProductCard key={op.id} product={op} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductDetail;