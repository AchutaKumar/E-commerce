import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Truck,
  RotateCcw,
  ShoppingCart,
  Heart,
  Check,
  ArrowLeft,
  Info,
  ShieldCheck
} from "lucide-react";
import { ROUTES, getApiBaseUrl } from "../utils/routes";
import { useCart } from "../context/CardContext";
import { isAuthenticated } from "../utils/auth";
import ProductCard from "../components/ProductCard";
import { ProductCardSkeleton } from "../components/SkeletonLoader";
import "../static/ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const BASEURL = getApiBaseUrl();


  // Fetch product details from Django backend
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASEURL}/api/products/${id}/`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Product not found");
          throw new Error("Failed to load product details");
        }
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id, BASEURL]);

  // Fetch related products from Django backend
  useEffect(() => {
    if (!product?.category?.id || String(product.id) !== String(id)) return;
    const fetchRelated = async () => {
      setRelatedLoading(true);
      try {
        const res = await fetch(`${BASEURL}/api/products/${id}/related/`);
        if (res.ok) {
          const data = await res.json();
          setRelatedProducts(data);
        }
      } catch {
        // Silently fail - non critical
      } finally {
        setRelatedLoading(false);
      }
    };
    fetchRelated();
  }, [product?.category?.id, product?.id, id, BASEURL]);

  // Reset state on route change
  useEffect(() => {
    setQuantity(1);
    setAddedToCart(false);
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (!isAuthenticated()) {
      alert("Please log in to add items to your cart.");
      navigate(ROUTES.LOGIN);
      return;
    }

    try {
      await addToCart(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch {
      // Handled silently by cart context
    }
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="product-detail-loader">
          <div className="spinner-large" />
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (error || !product) {
    return (
      <div className="product-detail-container">
        <div className="product-detail-error">
          <h3>Oops! {error || "Product Not Found"}</h3>
          <p>The product you are looking for might have been removed or is temporarily unavailable.</p>
          <button type="button" className="back-btn" onClick={() => navigate(ROUTES.SHOP)}>
            <ArrowLeft size={16} /> Back to Shop
          </button>
        </div>
      </div>
    );
  }

  // Handle absolute URL or relative media URL
  let imageUrl = 'https://via.placeholder.com/600x600?text=No+Image';
  if (product.image) {
    if (typeof product.image === 'string' && (product.image.startsWith('http://') || product.image.startsWith('https://'))) {
      imageUrl = product.image;
    } else {
      imageUrl = `${BASEURL}${product.image}`;
    }
  }

  const formattedPrice = `$${parseFloat(product.price).toLocaleString("en-US", {
    minimumFractionDigits: 2,
  })}`;

  return (
    <div className="product-detail-container">
      {/* Navigation Breadcrumb & Back */}
      <div className="detail-top-bar">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div className="breadcrumb">
          <Link to={ROUTES.HOME}>Home</Link>
          <span>/</span>
          <Link to={ROUTES.SHOP}>Shop</Link>
          <span>/</span>
          <span className="current">{product.name}</span>
        </div>
      </div>

      {/* ── Main Product Content Layout ── */}
      <div className="product-detail-content">
        {/* Left Column: Image Display */}
        <div className="product-detail-image-wrapper">
          <img
            src={imageUrl}
            alt={product.name}
            className="product-detail-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
            }}
          />
        </div>

        {/* Right Column: Details & Purchasing */}
        <div className="product-detail-info">
          <div className="product-detail-header">
            <span className="product-detail-category">
              {product.category?.name || "General"}
            </span>
            <h1 className="product-detail-title">{product.name}</h1>
            <div className="product-detail-rating">
              <span className="stars">
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
              </span>
              <span className="rating-count">4.9 (120+ reviews)</span>
            </div>
          </div>

          {/* Price */}
          <div className="product-detail-price-section">
            <p className="product-detail-price">{formattedPrice}</p>
            <span className="product-detail-save">100% Authentic</span>
          </div>

          {/* Description */}
          <p className="product-detail-description">
            {product.description || "Crafted with high quality materials and engineered for durability and everyday satisfaction."}
          </p>

          {/* Specs Bar */}
          <div className="product-detail-specs">
            <div className="spec-item">
              <span className="spec-label">Category</span>
              <span className="spec-value">{product.category?.name || "Standard"}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Express Shipping</span>
              <span className="spec-value">Available</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Returns</span>
              <span className="spec-value">30 Days</span>
            </div>
          </div>

          {/* Quantity Selector & Add to Cart CTA */}
          <div className="product-detail-actions">
            <div className="quantity-selector">
              <button
                type="button"
                className="quantity-btn minus"
                disabled={quantity <= 1}
                onClick={() => handleQuantityChange(-1)}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                type="text"
                className="quantity-input"
                value={quantity}
                readOnly
              />
              <button
                type="button"
                className="quantity-btn plus"
                onClick={() => handleQuantityChange(1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className={`add-to-cart-btn ${addedToCart ? "added" : ""}`}
              onClick={handleAddToCart}
              disabled={addedToCart}
            >
              {addedToCart ? (
                <>
                  <Check size={18} />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Add to Cart
                </>
              )}
            </button>
          </div>

          {/* Guarantee Badges */}
          <div className="product-detail-features">
            <h3>
              <Info size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Why Shop with LoyalKart
            </h3>
            <ul>
              <li>
                <Truck size={14} style={{ marginRight: 4 }} />
                Free shipping on orders over $50
              </li>
              <li>
                <RotateCcw size={14} style={{ marginRight: 4 }} />
                30-day hassle-free returns
              </li>
              <li>
                <Heart size={14} style={{ marginRight: 4 }} />
                Premium quality guaranteed
              </li>
              <li>
                <ShieldCheck size={14} style={{ marginRight: 4 }} />
                256-bit SSL encrypted checkout
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Related Products Showcase ("You Might Also Like") ── */}
      <section className="related-products-section">
        <div className="related-header">
          <span className="lp-sub-tag" style={{ fontSize: 12, fontWeight: 800, color: '#0058be' }}>CURATED FOR YOU</span>
          <h2 className="related-title">You Might Also Like</h2>
          <p className="related-subtitle">
            Explore more premium items from our store catalog.
          </p>
        </div>

        <div className="related-grid">
          {relatedLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : relatedProducts.length > 0 ? (
            relatedProducts.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))
          ) : (
            <div className="related-empty">
              <p>No related products in this category right now.</p>
              <Link to={ROUTES.SHOP} className="lp-btn lp-btn-primary" style={{ marginTop: 12 }}>
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;